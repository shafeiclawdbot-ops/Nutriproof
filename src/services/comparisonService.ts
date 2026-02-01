// Product Comparison Service - Compare nutrition and ingredients
import { Product, NutritionFacts } from '../types/product';

export interface ComparisonResult {
  products: Product[];
  nutritionComparison: NutritionComparison[];
  ingredientAnalysis: IngredientAnalysis;
  winner: {
    overall: string | null; // barcode of winner
    reason: string;
  };
  highlights: string[];
}

export interface NutritionComparison {
  nutrient: string;
  values: { barcode: string; value: number | undefined; unit: string }[];
  winner: string | null; // barcode
  higherIsBetter: boolean;
}

export interface IngredientAnalysis {
  commonIngredients: string[];
  uniqueIngredients: { barcode: string; ingredients: string[] }[];
  additiveComparison: { barcode: string; count: number; additives: string[] }[];
  allergenComparison: { barcode: string; allergens: string[] }[];
}

// Compare two or more products
export function compareProducts(products: Product[]): ComparisonResult {
  if (products.length < 2) {
    throw new Error('Need at least 2 products to compare');
  }

  const nutritionComparison = compareNutrition(products);
  const ingredientAnalysis = analyzeIngredients(products);
  const winner = determineWinner(products, nutritionComparison, ingredientAnalysis);
  const highlights = generateHighlights(products, nutritionComparison, ingredientAnalysis);

  return {
    products,
    nutritionComparison,
    ingredientAnalysis,
    winner,
    highlights,
  };
}

function compareNutrition(products: Product[]): NutritionComparison[] {
  const nutrients = [
    { key: 'energy_kcal', name: 'Calories', unit: 'kcal', higherIsBetter: false },
    { key: 'proteins', name: 'Protein', unit: 'g', higherIsBetter: true },
    { key: 'fat', name: 'Fat', unit: 'g', higherIsBetter: false },
    { key: 'saturated_fat', name: 'Saturated Fat', unit: 'g', higherIsBetter: false },
    { key: 'carbohydrates', name: 'Carbs', unit: 'g', higherIsBetter: false },
    { key: 'sugars', name: 'Sugar', unit: 'g', higherIsBetter: false },
    { key: 'fiber', name: 'Fiber', unit: 'g', higherIsBetter: true },
    { key: 'salt', name: 'Salt', unit: 'g', higherIsBetter: false },
    { key: 'sodium', name: 'Sodium', unit: 'mg', higherIsBetter: false },
  ];

  return nutrients.map(({ key, name, unit, higherIsBetter }) => {
    const values = products.map(p => ({
      barcode: p.barcode,
      value: (p.nutrition as any)[key] as number | undefined,
      unit,
    }));

    // Determine winner (product with best value)
    let winner: string | null = null;
    const validValues = values.filter(v => v.value !== undefined);
    
    if (validValues.length >= 2) {
      if (higherIsBetter) {
        const max = Math.max(...validValues.map(v => v.value!));
        winner = validValues.find(v => v.value === max)?.barcode || null;
      } else {
        const min = Math.min(...validValues.map(v => v.value!));
        winner = validValues.find(v => v.value === min)?.barcode || null;
      }
    }

    return {
      nutrient: name,
      values,
      winner,
      higherIsBetter,
    };
  });
}

function analyzeIngredients(products: Product[]): IngredientAnalysis {
  // Extract ingredient texts
  const ingredientSets = products.map(p => 
    new Set(p.ingredients.map(i => i.text.toLowerCase().trim()))
  );

  // Find common ingredients
  const commonIngredients = [...ingredientSets[0]].filter(ing =>
    ingredientSets.every(set => set.has(ing))
  );

  // Find unique ingredients for each product
  const uniqueIngredients = products.map((p, idx) => {
    const otherSets = ingredientSets.filter((_, i) => i !== idx);
    const unique = [...ingredientSets[idx]].filter(ing =>
      !otherSets.some(set => set.has(ing))
    );
    return {
      barcode: p.barcode,
      ingredients: unique,
    };
  });

  // Compare additives
  const additiveComparison = products.map(p => ({
    barcode: p.barcode,
    count: p.additives?.length || 0,
    additives: p.additives || [],
  }));

  // Compare allergens
  const allergenComparison = products.map(p => ({
    barcode: p.barcode,
    allergens: p.allergens || [],
  }));

  return {
    commonIngredients,
    uniqueIngredients,
    additiveComparison,
    allergenComparison,
  };
}

function determineWinner(
  products: Product[],
  nutrition: NutritionComparison[],
  ingredients: IngredientAnalysis
): { overall: string | null; reason: string } {
  // Score each product
  const scores: Record<string, number> = {};
  products.forEach(p => scores[p.barcode] = 0);

  // Points for winning nutrition categories
  nutrition.forEach(n => {
    if (n.winner) {
      scores[n.winner] += n.nutrient === 'Protein' || n.nutrient === 'Fiber' ? 2 : 1;
    }
  });

  // Penalty for more additives
  const minAdditives = Math.min(...ingredients.additiveComparison.map(a => a.count));
  ingredients.additiveComparison.forEach(a => {
    if (a.count === minAdditives) {
      scores[a.barcode] += 2;
    }
  });

  // Find winner
  const entries = Object.entries(scores);
  const maxScore = Math.max(...entries.map(([_, score]) => score));
  const winners = entries.filter(([_, score]) => score === maxScore);

  if (winners.length === 1) {
    const [barcode, score] = winners[0];
    const product = products.find(p => p.barcode === barcode);
    return {
      overall: barcode,
      reason: `${product?.name || 'This product'} wins with better nutrition profile and fewer additives`,
    };
  } else if (winners.length > 1) {
    return {
      overall: null,
      reason: 'Products are roughly equal - choose based on taste and price',
    };
  }

  return {
    overall: null,
    reason: 'Insufficient data to determine winner',
  };
}

function generateHighlights(
  products: Product[],
  nutrition: NutritionComparison[],
  ingredients: IngredientAnalysis
): string[] {
  const highlights: string[] = [];

  // Calorie difference
  const calories = nutrition.find(n => n.nutrient === 'Calories');
  if (calories) {
    const values = calories.values.filter(v => v.value !== undefined);
    if (values.length >= 2) {
      const diff = Math.abs((values[0].value || 0) - (values[1].value || 0));
      if (diff > 50) {
        highlights.push(`${diff.toFixed(0)} calorie difference per 100g`);
      }
    }
  }

  // Sugar comparison
  const sugar = nutrition.find(n => n.nutrient === 'Sugar');
  if (sugar?.winner) {
    const winnerProduct = products.find(p => p.barcode === sugar.winner);
    highlights.push(`${winnerProduct?.name || 'One product'} has less sugar`);
  }

  // Protein comparison
  const protein = nutrition.find(n => n.nutrient === 'Protein');
  if (protein?.winner) {
    const winnerProduct = products.find(p => p.barcode === protein.winner);
    highlights.push(`${winnerProduct?.name || 'One product'} has more protein`);
  }

  // Additive count
  const additives = ingredients.additiveComparison;
  if (additives.length >= 2) {
    const diff = Math.abs(additives[0].count - additives[1].count);
    if (diff > 0) {
      const fewer = additives.reduce((a, b) => a.count < b.count ? a : b);
      const product = products.find(p => p.barcode === fewer.barcode);
      highlights.push(`${product?.name || 'One product'} has ${diff} fewer additives`);
    }
  }

  return highlights;
}

// Format nutrition value for display
export function formatNutritionValue(value: number | undefined, unit: string): string {
  if (value === undefined) return '-';
  if (unit === 'kcal') return `${value.toFixed(0)} kcal`;
  if (unit === 'mg') return `${value.toFixed(0)} mg`;
  return `${value.toFixed(1)} g`;
}
