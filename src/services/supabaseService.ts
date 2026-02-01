// Supabase Service - Community database for user contributions
import { createClient } from '@supabase/supabase-js';
import { Product, Ingredient, NutritionFacts } from '../types/product';

// Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wqqsorccaajzzhxwrril.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcXNvcmNjYWFqenpoeHdycmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDEyMTcsImV4cCI6MjA4NTUxNzIxN30.J7gXXEdo7tn9-l1EWjh-Tew_Gl5zI_SuBd7feDP-d9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Contribution {
  id?: string;
  barcode: string;
  product_name: string;
  brand?: string;
  ingredients_text: string;
  ingredients_parsed: string[];
  image_url?: string;
  contributor_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  upvotes: number;
  created_at?: string;
}

// Check if a product exists in community database
export async function getCommunityProduct(barcode: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .eq('status', 'approved')
      .single();

    if (error || !data) return null;

    // Transform to Product type
    return {
      barcode: data.barcode,
      name: data.product_name,
      brand: data.brand,
      image_url: data.image_url,
      ingredients: (data.ingredients_parsed || []).map((text: string, idx: number) => ({
        id: `comm-${idx}`,
        text,
      })),
      nutrition: data.nutrition || {},
      categories: data.categories || [],
      allergens: data.allergens || [],
      additives: data.additives || [],
      scanned_at: Date.now(),
    };
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}

// Submit a new contribution
export async function submitContribution(contribution: Omit<Contribution, 'id' | 'status' | 'upvotes' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contributions')
      .insert({
        ...contribution,
        status: 'pending',
        upvotes: 0,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Supabase submit error:', error);
    return { success: false, error: 'Failed to submit contribution' };
  }
}

// Upload image to Supabase Storage
export async function uploadLabelImage(barcode: string, imageUri: string): Promise<string | null> {
  try {
    const filename = `labels/${barcode}_${Date.now()}.jpg`;
    
    // Fetch the image and convert to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
}

// Upvote a contribution
export async function upvoteContribution(contributionId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_upvotes', {
      contribution_id: contributionId,
    });
    return !error;
  } catch (error) {
    return false;
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
