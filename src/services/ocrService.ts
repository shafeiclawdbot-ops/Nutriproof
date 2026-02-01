// OCR Service - Extract text from ingredient labels
// Strategy: Try ML Kit (native) → Fallback to Google Cloud Vision API → Manual input

import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

export interface OCRResult {
  success: boolean;
  rawText: string;
  ingredients: string[];
  confidence: number;
  source: 'mlkit' | 'google_vision' | 'manual';
  error?: string;
  requiresManualInput?: boolean;
}

// API Keys
const GOOGLE_CLOUD_VISION_KEY = Constants.expoConfig?.extra?.googleCloudVisionKey || 
  process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_KEY;

// ML Kit availability (only works in dev builds, not Expo Go)
let TextRecognition: any = null;
let mlKitAvailable = false;

async function initMLKit() {
  try {
    const mlKit = await import('@react-native-ml-kit/text-recognition');
    TextRecognition = mlKit.default;
    mlKitAvailable = true;
    console.log('✅ ML Kit loaded successfully');
  } catch (error) {
    console.log('⚠️ ML Kit not available - will use Google Cloud Vision fallback');
    mlKitAvailable = false;
  }
}

// Initialize on load
initMLKit();

// Main OCR function - tries multiple strategies
export async function extractTextFromImage(imageUri: string): Promise<OCRResult> {
  // Strategy 1: Try ML Kit (fastest, works offline in dev builds)
  if (mlKitAvailable && TextRecognition) {
    try {
      const result = await performMLKitOCR(imageUri);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log('ML Kit failed, trying Cloud Vision...');
    }
  }

  // Strategy 2: Try Google Cloud Vision API (works in Expo Go)
  if (GOOGLE_CLOUD_VISION_KEY) {
    try {
      const result = await performGoogleVisionOCR(imageUri);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log('Google Vision failed:', error);
    }
  }

  // Strategy 3: Manual input fallback
  return {
    success: false,
    rawText: '',
    ingredients: [],
    confidence: 0,
    source: 'manual',
    error: 'OCR unavailable. Please type or paste ingredients manually.',
    requiresManualInput: true,
  };
}

// ML Kit OCR (native, requires dev build)
async function performMLKitOCR(imageUri: string): Promise<OCRResult> {
  const result = await TextRecognition.recognize(imageUri);
  
  if (!result.text || result.text.trim().length === 0) {
    return {
      success: false,
      rawText: '',
      ingredients: [],
      confidence: 0,
      source: 'mlkit',
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
    source: 'mlkit',
  };
}

// Google Cloud Vision API (works in Expo Go / managed workflow)
async function performGoogleVisionOCR(imageUri: string): Promise<OCRResult> {
  // Read image as base64
  let base64Image: string;
  
  try {
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri.split(',')[1];
    } else {
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  } catch (error) {
    throw new Error('Failed to read image file');
  }

  // Call Google Cloud Vision API
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_KEY}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract text from response
  const textAnnotation = data.responses?.[0]?.textAnnotations?.[0];
  
  if (!textAnnotation || !textAnnotation.description) {
    return {
      success: false,
      rawText: '',
      ingredients: [],
      confidence: 0,
      source: 'google_vision',
      error: 'No text detected in image',
    };
  }

  const rawText = textAnnotation.description;
  const ingredients = parseIngredients(rawText);
  
  // Confidence from detection confidence or estimate based on text length
  const confidence = textAnnotation.confidence 
    ? textAnnotation.confidence * 100 
    : Math.min(rawText.length / 500, 1) * 80;

  return {
    success: true,
    rawText,
    ingredients,
    confidence,
    source: 'google_vision',
  };
}

// Parse ingredients from OCR text
function parseIngredients(text: string): string[] {
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
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  return [...new Set(ingredients)];
}

// Parse ingredients from manually entered text (exported for ContributeScreen)
export function parseIngredientsFromText(text: string): string[] {
  return parseIngredients(text);
}

// Check if any OCR method is available
export function isOCRAvailable(): boolean {
  return mlKitAvailable || !!GOOGLE_CLOUD_VISION_KEY;
}

// Check which OCR method is available
export function getAvailableOCRMethod(): 'mlkit' | 'google_vision' | 'none' {
  if (mlKitAvailable) return 'mlkit';
  if (GOOGLE_CLOUD_VISION_KEY) return 'google_vision';
  return 'none';
}
