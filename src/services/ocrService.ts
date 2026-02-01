// OCR Service - Extract text from ingredient labels
import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface OCRResult {
  success: boolean;
  rawText: string;
  ingredients: string[];
  confidence: number;
  error?: string;
}

// Common ingredient separators and patterns
const INGREDIENT_SEPARATORS = /[,;،]/g;
const CLEAN_PATTERNS = [
  /ingredients?\s*:?\s*/gi,
  /contains?\s*:?\s*/gi,
  /may contain\s*:?\s*/gi,
  /\([^)]*\)/g, // Remove parenthetical notes
  /\d+%/g, // Remove percentages
  /^\s*[\d.]+\s*$/g, // Remove standalone numbers
];

export async function extractTextFromImage(imageUri: string): Promise<OCRResult> {
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
    
    // Calculate confidence based on blocks detected
    const confidence = Math.min(result.blocks.length / 10, 1) * 100;

    return {
      success: true,
      rawText,
      ingredients,
      confidence,
    };
  } catch (error) {
    console.error('OCR error:', error);
    return {
      success: false,
      rawText: '',
      ingredients: [],
      confidence: 0,
      error: 'Failed to process image',
    };
  }
}

function parseIngredients(text: string): string[] {
  let cleaned = text;
  
  // Apply cleaning patterns
  for (const pattern of CLEAN_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }
  
  // Split by common separators
  const parts = cleaned.split(INGREDIENT_SEPARATORS);
  
  // Clean up each ingredient
  const ingredients = parts
    .map(part => part.trim())
    .filter(part => {
      // Filter out empty, too short, or invalid entries
      if (part.length < 2) return false;
      if (/^\d+$/.test(part)) return false;
      if (part.toLowerCase().includes('nutrition')) return false;
      if (part.toLowerCase().includes('calories')) return false;
      return true;
    })
    .map(part => {
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  return [...new Set(ingredients)]; // Remove duplicates
}
