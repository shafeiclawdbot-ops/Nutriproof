// Core product types for Nutriproof MVP

export interface Ingredient {
  id: string;
  text: string;
  rank?: number;
}

export interface NutritionFacts {
  energy_kcal?: number;
  fat?: number;
  saturated_fat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
  sodium?: number;
}

export interface Product {
  barcode: string;
  name: string;
  brand?: string;
  image_url?: string;
  ingredients: Ingredient[];
  nutrition: NutritionFacts;
  categories?: string[];
  allergens?: string[];
  additives?: string[];
  scanned_at: number; // timestamp
}

export interface ScanResult {
  success: boolean;
  product?: Product;
  error?: string;
  source: 'cache' | 'api';
}
