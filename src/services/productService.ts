// Product service - combines cache, API, and community database
import { ScanResult } from '../types/product';
import { fetchProduct } from './openFoodFacts';
import { getCachedProduct, cacheProduct } from './database';
import { getCommunityProduct, isSupabaseConfigured } from './supabaseService';

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map<string, Promise<ScanResult>>();

export async function scanProduct(barcode: string): Promise<ScanResult> {
  // If there's already a request for this barcode, return the same promise
  const pending = pendingRequests.get(barcode);
  if (pending) {
    console.log(`Request already in flight for ${barcode}, reusing...`);
    return pending;
  }

  // Create and track the request
  const request = scanProductInternal(barcode);
  pendingRequests.set(barcode, request);
  
  try {
    return await request;
  } finally {
    // Clean up after completion
    pendingRequests.delete(barcode);
  }
}

async function scanProductInternal(barcode: string): Promise<ScanResult> {
  // 1. Check local cache first
  const cached = await getCachedProduct(barcode);
  if (cached) {
    return {
      success: true,
      product: cached,
      source: 'cache',
    };
  }

  // 2. Fetch from Open Food Facts API
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

  // 3. Try community database if configured
  if (isSupabaseConfigured()) {
    const communityProduct = await getCommunityProduct(barcode);
    if (communityProduct) {
      await cacheProduct(communityProduct);
      return {
        success: true,
        product: communityProduct,
        source: 'api', // Mark as API since it came from cloud
      };
    }
  }

  // 4. Not found anywhere
  return {
    success: false,
    error: 'Product not found in any database',
    source: 'api',
  };
}
