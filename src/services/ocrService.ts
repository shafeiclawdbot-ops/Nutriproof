// OCR Service - Extract text from ingredient labels
// Note: ML Kit requires development build. Falls back to manual input in Expo Go.

export interface OCRResult {
  success: boolean;
  rawText: string;
  ingredients: string[];
  confidence: number;
  error?: string;
  requiresManualInput?: boolean;
}

// Check if ML Kit is available (only in development builds, not Expo Go)
let TextRecognition: any = null;
let mlKitAvailable = false;

async function initMLKit() {
  try {
    const mlKit = await import('@react-native-ml-kit/text-recognition');
    TextRecognition = mlKit.default;
    mlKitAvailable = true;
    console.log('ML Kit loaded successfully');
  } catch (error) {
    console.log('ML Kit not available (Expo Go mode) - manual input required');
    mlKitAvailable = false;
  }
}

// Initialize on load
initMLKit();

export async function extractTextFromImage(imageUri: string): Promise<OCRResult> {
  // If ML Kit isn't available (Expo Go), return graceful fallback
  if (!mlKitAvailable || !TextRecognition) {
    return {
      success: false,
      rawText: '',
      ingredients: [],
      confidence: 0,
      error: 'OCR requires a development build. Please enter ingredients manually.',
      requiresManualInput: true,
    };
  }

  try {
    const result = await TextRecognition.recognize(imageUri);
    
    if (!result.text || result.text.trim().length === 0) {
      return {
        success: false,
        rawText: '',
        ingredients: [],
        confidence: 0,
        error: 'No text detected in image',
      };
    }

    const rawText = result.text;
    const ingredients = parseIngredients(rawText);
    const confidence = Math.min(result.blocks.length / 10, 1) * 100;

    return {
      success: true,
      rawText,
      ingredients,
      confidence,
    };
  } catch (error: any) {
    console.error('OCR error:', error);
    return {
      success: false,
      rawText: '',
      ingredients: [],
      confidence: 0,
      error: error.message || 'Failed to process image',
      requiresManualInput: true,
    };
  }
}

// Common ingredient separators and patterns
const INGREDIENT_SEPARATORS = /[,;،]/g;
const CLEAN_PATTERNS = [
  /ingredients?\s*:?\s*/gi,
  /contains?\s*:?\s*/gi,
  /may contain\s*:?\s*/gi,
  /\([^)]*\)/g,
  /\d+%/g,
  /^\s*[\d.]+\s*$/g,
];

function parseIngredients(text: string): string[] {
  let cleaned = text;
  
  for (const pattern of CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }
  
  const parts = cleaned.split(INGREDIENT_SEPARATORS);
  
  const ingredients = parts
    .map(part => part.trim())
    .filter(part => {
      if (part.length < 2) return false;
      if (/^\d+$/.test(part)) return false;
      if (part.toLowerCase().includes('nutrition')) return false;
      if (part.toLowerCase().includes('calories')) return false;
      return true;
    })
    .map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  return [...new Set(ingredients)];
}

// Check if OCR is available
export function isOCRAvailable(): boolean {
  return mlKitAvailable;
}
