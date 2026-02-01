// Open Food Facts API service
import axios from 'axios';
import { Product, Ingredient, NutritionFacts } from '../types/product';

const API_BASE = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'Nutriproof/1.0 (https://github.com/nutriproof)';

interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  ingredients?: Array<{ id: string; text: string; rank?: number }>;
  nutriments?: Record<string, number>;
  categories_tags?: string[];
  allergens_tags?: string[];
  additives_tags?: string[];
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

export async function fetchProduct(barcode: string): Promise<Product | null> {
  try {
    const response = await axios.get<OFFResponse>(
      `${API_BASE}/product/${barcode}`,
      {
        headers: { 'User-Agent': USER_AGENT },
        params: {
          fields: 'code,product_name,brands,image_url,ingredients,nutriments,categories_tags,allergens_tags,additives_tags'
        }
      }
    );

    if (response.data.status !== 1 || !response.data.product) {
      return null;
    }

    const p = response.data.product;
    
    // Parse ingredients
    const ingredients: Ingredient[] = (p.ingredients || []).map((ing, idx) => ({
      id: ing.id || `ing-${idx}`,
      text: ing.text || '',
      rank: ing.rank
    }));

    // Parse nutrition
    const n = p.nutriments || {};
    const nutrition: NutritionFacts = {
      energy_kcal: n['energy-kcal_100g'],
      fat: n['fat_100g'],
      saturated_fat: n['saturated-fat_100g'],
      carbohydrates: n['carbohydrates_100g'],
      sugars: n['sugars_100g'],
      fiber: n['fiber_100g'],
      proteins: n['proteins_100g'],
      salt: n['salt_100g'],
      sodium: n['sodium_100g'],
    };

    // Clean up tags (remove language prefix like "en:")
    const cleanTags = (tags?: string[]) => 
      (tags || []).map(t => t.replace(/^[a-z]{2}:/, ''));

    return {
      barcode: p.code,
      name: p.product_name || 'Unknown Product',
      brand: p.brands,
      image_url: p.image_url,
      ingredients,
      nutrition,
      categories: cleanTags(p.categories_tags),
      allergens: cleanTags(p.allergens_tags),
      additives: cleanTags(p.additives_tags),
      scanned_at: Date.now(),
    };
  } catch (error) {
    console.error('Open Food Facts API error:', error);
    return null;
  }
}
