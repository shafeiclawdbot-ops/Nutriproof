// Open Food Facts API service
import axios from 'axios';
import { Product, Ingredient, NutritionFacts } from '../types/product';

// Use v0 API (stable) - v2 has issues
const API_BASE = 'https://world.openfoodfacts.org/api/v0';
const USER_AGENT = 'Nutriproof/1.0 - React Native Food Scanner';

interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  ingredients_text?: string;
  ingredients?: Array<{ id: string; text: string; rank?: number }>;
  nutriments?: Record<string, number>;
  categories_tags?: string[];
  allergens_tags?: string[];
  additives_tags?: string[];
}

interface OFFResponse {
  status: number;
  status_verbose?: string;
  product?: OFFProduct;
}

export async function fetchProduct(barcode: string): Promise<Product | null> {
  try {
    console.log(`Fetching product: ${barcode}`);
    
    const url = `${API_BASE}/product/${barcode}.json`;
    const response = await axios.get<OFFResponse>(url, {
      headers: { 
        'User-Agent': USER_AGENT,
      },
      timeout: 10000,
    });

    console.log(`API response status: ${response.data.status}`);

    // status: 1 = found, 0 = not found
    if (response.data.status !== 1 || !response.data.product) {
      console.log('Product not found in Open Food Facts');
      return null;
    }

    const p = response.data.product;
    
    // Parse ingredients from text if structured ingredients not available
    let ingredients: Ingredient[] = [];
    if (p.ingredients && p.ingredients.length > 0) {
      ingredients = p.ingredients.map((ing, idx) => ({
        id: ing.id || `ing-${idx}`,
        text: ing.text || '',
        rank: ing.rank
      }));
    } else if (p.ingredients_text) {
      // Parse from text
      ingredients = p.ingredients_text
        .split(/[,;]/)
        .map((text, idx) => ({
          id: `ing-${idx}`,
          text: text.trim(),
        }))
        .filter(ing => ing.text.length > 0);
    }

    // Parse nutrition
    const n = p.nutriments || {};
    const nutrition: NutritionFacts = {
      energy_kcal: n['energy-kcal_100g'] || n['energy-kcal'],
      fat: n['fat_100g'] || n['fat'],
      saturated_fat: n['saturated-fat_100g'] || n['saturated-fat'],
      carbohydrates: n['carbohydrates_100g'] || n['carbohydrates'],
      sugars: n['sugars_100g'] || n['sugars'],
      fiber: n['fiber_100g'] || n['fiber'],
      proteins: n['proteins_100g'] || n['proteins'],
      salt: n['salt_100g'] || n['salt'],
      sodium: n['sodium_100g'] || n['sodium'],
    };

    // Clean up tags (remove language prefix like "en:")
    const cleanTags = (tags?: string[]) => 
      (tags || []).map(t => t.replace(/^[a-z]{2}:/, ''));

    return {
      barcode: p.code || barcode,
      name: p.product_name || 'Unknown Product',
      brand: p.brands,
      image_url: p.image_url || p.image_front_url,
      ingredients,
      nutrition,
      categories: cleanTags(p.categories_tags),
      allergens: cleanTags(p.allergens_tags),
      additives: cleanTags(p.additives_tags),
      scanned_at: Date.now(),
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('Product not found (404)');
      return null;
    }
    console.error('Open Food Facts API error:', error.message || error);
    return null;
  }
}
