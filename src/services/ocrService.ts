// OCR Service - Extract text from ingredient labels
// Note: For Expo Go, uses manual input. For production build, can add ML Kit or Cloud Vision.

export interface OCRResult {
  success: boolean;
  rawText: string;
  ingredients: string[];
  confidence: number;
  error?: string;
  requiresManualInput?: boolean;
}

// For Expo Go / managed workflow, OCR requires either:
// 1. Development build with ML Kit (native)
// 2. Cloud Vision API (works in managed)
// For MVP, we'll use manual input with smart parsing

let mlKitAvailable = false;

// Check if we can use native OCR (only in dev builds, not Expo Go)
export function isOCRAvailable(): boolean {
  return mlKitAvailable;
}

export async function extractTextFromImage(imageUri: string): Promise<OCRResult> {
  // In Expo Go, native OCR isn't available
  // Return graceful fallback prompting manual input
  return {
    success: false,
    rawText: '',
    ingredients: [],
    confidence: 0,
    error: 'Camera OCR requires a production build. Please paste or type ingredients below.',
    requiresManualInput: true,
  };
}

// Parse ingredients from manually entered text
export function parseIngredientsFromText(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  let cleaned = text;
  
  // Remove common headers
  cleaned = cleaned.replace(/ingredients?\s*:?\s*/gi, '');
  cleaned = cleaned.replace(/contains?\s*:?\s*/gi, '');
  cleaned = cleaned.replace(/may contain\s*:?\s*/gi, '');
  
  // Remove percentages and parenthetical content
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/\d+\.?\d*%/g, ' ');
  
  // Split by common separators
  const separators = /[,;،\n]/g;
  const parts = cleaned.split(separators);
  
  // Clean and filter
  const ingredients = parts
    .map(part => part.trim())
    .filter(part => {
      if (part.length < 2) return false;
      if (/^\d+$/.test(part)) return false;
      if (part.toLowerCase().includes('nutrition')) return false;
      if (part.toLowerCase().includes('calories')) return false;
      if (part.toLowerCase().includes('serving')) return false;
      return true;
    })
    .map(part => {
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  // Remove duplicates
  return [...new Set(ingredients)];
}

// Validate if text looks like an ingredients list
export function looksLikeIngredients(text: string): boolean {
  const lower = text.toLowerCase();
  
  // Check for common food ingredients
  const foodKeywords = [
    'sugar', 'salt', 'water', 'flour', 'oil', 'milk', 'cream',
    'wheat', 'corn', 'soy', 'palm', 'coconut', 'sunflower',
    'sodium', 'calcium', 'vitamin', 'acid', 'flavor', 'color',
    'extract', 'protein', 'starch', 'syrup', 'powder'
  ];
  
  const matches = foodKeywords.filter(kw => lower.includes(kw));
  return matches.length >= 2;
}
