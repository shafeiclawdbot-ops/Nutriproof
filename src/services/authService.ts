// Authentication Service - User accounts with Supabase Auth
import { createClient, User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wqqsorccaajzzhxwrril.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcXNvcmNjYWFqenpoeHdycmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDEyMTcsImV4cCI6MjA4NTUxNzIxN30.J7gXXEdo7tn9-l1EWjh-Tew_Gl5zI_SuBd7feDP-d9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  allergens: string[];
  dietaryPreferences: string[];
  contributionCount: number;
  createdAt: string;
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // Create user profile
    if (data.user) {
      await createUserProfile(data.user.id, email, displayName);
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// Create user profile in database
async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<void> {
  try {
    await supabase.from('user_profiles').insert({
      id: userId,
      email,
      display_name: displayName,
      allergens: [],
      dietary_preferences: [],
      contribution_count: 0,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      allergens: data.allergens || [],
      dietaryPreferences: data.dietary_preferences || [],
      contributionCount: data.contribution_count || 0,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    displayName: string;
    allergens: string[];
    dietaryPreferences: string[];
  }>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: updates.displayName,
        allergens: updates.allergens,
        dietary_preferences: updates.dietaryPreferences,
      })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Common allergens list
export const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Sesame',
  'Mustard',
  'Celery',
  'Lupin',
  'Mollusks',
  'Sulfites',
];

// Common dietary preferences
export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Paleo',
  'Low-sodium',
  'Low-sugar',
  'Organic only',
];

// Check if product contains user's allergens
export function checkAllergens(
  productAllergens: string[],
  userAllergens: string[]
): { hasAllergens: boolean; matches: string[] } {
  const matches = userAllergens.filter(ua =>
    productAllergens.some(pa =>
      pa.toLowerCase().includes(ua.toLowerCase())
    )
  );

  return {
    hasAllergens: matches.length > 0,
    matches,
  };
}
