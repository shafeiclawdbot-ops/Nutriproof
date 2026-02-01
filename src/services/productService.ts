// Product service - combines cache and API
import { ScanResult } from '../types/product';
import { fetchProduct } from './openFoodFacts';
import { getCachedProduct, cacheProduct } from './database';

export async function scanProduct(barcode: string): Promise<ScanResult> {
  // 1. Check cache first
  const cached = await getCachedProduct(barcode);
  if (cached) {
    return {
      success: true,
      product: cached,
      source: 'cache',
    };
  }

  // 2. Fetch from API
  const product = await fetchProduct(barcode);
  if (product) {
    // Cache for future lookups
    await cacheProduct(product);
    return {
      success: true,
      product,
      source: 'api',
    };
  }

  // 3. Not found
  return {
    success: false,
    error: 'Product not found in database',
    source: 'api',
  };
}
