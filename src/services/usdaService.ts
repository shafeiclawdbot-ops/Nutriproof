// USDA FoodData Central API - 380K+ foods with detailed nutrition
// API Docs: https://fdc.nal.usda.gov/api-guide.html
import axios from 'axios';

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  nutrients: USDANutrient[];
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
}

// Search USDA database by product name or barcode
export async function searchUSDA(query: string, pageSize: number = 10): Promise<USDASearchResult> {
  try {
    const response = await axios.get(`${USDA_API_URL}/foods/search`, {
      params: {
        api_key: USDA_API_KEY,
        query,
        pageSize,
        dataType: ['Branded', 'Foundation', 'SR Legacy'].join(','),
      },
      timeout: 10000,
    });

    const foods: USDAFood[] = (response.data.foods || []).map((f: any) => ({
      fdcId: f.fdcId,
      description: f.description,
      brandOwner: f.brandOwner,
      brandName: f.brandName,
      ingredients: f.ingredients,
      servingSize: f.servingSize,
      servingSizeUnit: f.servingSizeUnit,
      nutrients: (f.foodNutrients || []).map((n: any) => ({
        nutrientId: n.nutrientId,
        nutrientName: n.nutrientName,
        value: n.value,
        unitName: n.unitName,
      })),
    }));

    return {
      foods,
      totalHits: response.data.totalHits || 0,
    };
  } catch (error: any) {
    console.error('USDA API error:', error.message);
    return { foods: [], totalHits: 0 };
  }
}

// Get detailed food info by FDC ID
export async function getUSDAFood(fdcId: number): Promise<USDAFood | null> {
  try {
    const response = await axios.get(`${USDA_API_URL}/food/${fdcId}`, {
      params: {
        api_key: USDA_API_KEY,
      },
      timeout: 10000,
    });

    const f = response.data;
    return {
      fdcId: f.fdcId,
      description: f.description,
      brandOwner: f.brandOwner,
      brandName: f.brandName,
      ingredients: f.ingredients,
      servingSize: f.servingSize,
      servingSizeUnit: f.servingSizeUnit,
      nutrients: (f.foodNutrients || []).map((n: any) => ({
        nutrientId: n.nutrient?.id || n.nutrientId,
        nutrientName: n.nutrient?.name || n.nutrientName,
        value: n.amount || n.value,
        unitName: n.nutrient?.unitName || n.unitName,
      })),
    };
  } catch (error: any) {
    console.error('USDA food fetch error:', error.message);
    return null;
  }
}

// Search by UPC barcode
export async function searchUSDAByBarcode(upc: string): Promise<USDAFood | null> {
  try {
    const response = await axios.get(`${USDA_API_URL}/foods/search`, {
      params: {
        api_key: USDA_API_KEY,
        query: upc,
        dataType: 'Branded',
        pageSize: 1,
      },
      timeout: 10000,
    });

    if (response.data.foods && response.data.foods.length > 0) {
      const f = response.data.foods[0];
      return {
        fdcId: f.fdcId,
        description: f.description,
        brandOwner: f.brandOwner,
        brandName: f.brandName,
        ingredients: f.ingredients,
        servingSize: f.servingSize,
        servingSizeUnit: f.servingSizeUnit,
        nutrients: (f.foodNutrients || []).map((n: any) => ({
          nutrientId: n.nutrientId,
          nutrientName: n.nutrientName,
          value: n.value,
          unitName: n.unitName,
        })),
      };
    }
    return null;
  } catch (error: any) {
    console.error('USDA barcode search error:', error.message);
    return null;
  }
}

// Key nutrient IDs for reference
export const NUTRIENT_IDS = {
  ENERGY: 1008, // kcal
  PROTEIN: 1003,
  FAT: 1004,
  CARBS: 1005,
  FIBER: 1079,
  SUGAR: 2000,
  SODIUM: 1093,
  CALCIUM: 1087,
  IRON: 1089,
  VITAMIN_A: 1106,
  VITAMIN_C: 1162,
  VITAMIN_D: 1114,
};

// Extract key nutrients from food
export function extractKeyNutrients(food: USDAFood): Record<string, { value: number; unit: string }> {
  const result: Record<string, { value: number; unit: string }> = {};
  
  const keyNutrients = [
    { id: NUTRIENT_IDS.ENERGY, name: 'calories' },
    { id: NUTRIENT_IDS.PROTEIN, name: 'protein' },
    { id: NUTRIENT_IDS.FAT, name: 'fat' },
    { id: NUTRIENT_IDS.CARBS, name: 'carbs' },
    { id: NUTRIENT_IDS.FIBER, name: 'fiber' },
    { id: NUTRIENT_IDS.SUGAR, name: 'sugar' },
    { id: NUTRIENT_IDS.SODIUM, name: 'sodium' },
  ];

  for (const kn of keyNutrients) {
    const nutrient = food.nutrients.find(n => n.nutrientId === kn.id);
    if (nutrient) {
      result[kn.name] = { value: nutrient.value, unit: nutrient.unitName };
    }
  }

  return result;
}
