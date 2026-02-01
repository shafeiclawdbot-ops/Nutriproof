// FDA Recalls API - Safety alerts for recalled food products
// API Docs: https://open.fda.gov/apis/food/enforcement/
import axios from 'axios';

const FDA_API_URL = 'https://api.fda.gov/food/enforcement.json';

export interface FDARecall {
  recallNumber: string;
  reportDate: string;
  recallInitiationDate: string;
  product: string;
  reason: string;
  company: string;
  status: 'Ongoing' | 'Completed' | 'Terminated';
  classification: 'Class I' | 'Class II' | 'Class III';
  distribution: string;
  quantity: string;
  codes: string[];
}

export interface RecallSearchResult {
  recalls: FDARecall[];
  total: number;
}

// Classification meanings:
// Class I: Dangerous or defective products that could cause serious health problems or death
// Class II: Products that might cause a temporary health problem, or pose slight threat of a serious nature
// Class III: Products that are unlikely to cause any adverse health reaction, but violate FDA regulations

// Search for recalls by product name or brand
export async function searchRecalls(
  query: string,
  limit: number = 10
): Promise<RecallSearchResult> {
  try {
    const response = await axios.get(FDA_API_URL, {
      params: {
        search: `product_description:"${query}" OR recalling_firm:"${query}"`,
        limit,
        sort: 'report_date:desc',
      },
      timeout: 10000,
    });

    const recalls: FDARecall[] = (response.data.results || []).map((r: any) => ({
      recallNumber: r.recall_number,
      reportDate: r.report_date,
      recallInitiationDate: r.recall_initiation_date,
      product: r.product_description,
      reason: r.reason_for_recall,
      company: r.recalling_firm,
      status: r.status,
      classification: r.classification,
      distribution: r.distribution_pattern,
      quantity: r.product_quantity,
      codes: r.code_info ? [r.code_info] : [],
    }));

    return {
      recalls,
      total: response.data.meta?.results?.total || recalls.length,
    };
  } catch (error: any) {
    // 404 means no recalls found (not an error)
    if (error.response?.status === 404) {
      return { recalls: [], total: 0 };
    }
    console.error('FDA Recalls API error:', error.message);
    return { recalls: [], total: 0 };
  }
}

// Search recalls by UPC code
export async function searchRecallsByUPC(upc: string): Promise<FDARecall[]> {
  try {
    const response = await axios.get(FDA_API_URL, {
      params: {
        search: `code_info:"${upc}"`,
        limit: 5,
      },
      timeout: 10000,
    });

    return (response.data.results || []).map((r: any) => ({
      recallNumber: r.recall_number,
      reportDate: r.report_date,
      recallInitiationDate: r.recall_initiation_date,
      product: r.product_description,
      reason: r.reason_for_recall,
      company: r.recalling_firm,
      status: r.status,
      classification: r.classification,
      distribution: r.distribution_pattern,
      quantity: r.product_quantity,
      codes: r.code_info ? [r.code_info] : [],
    }));
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error('FDA Recalls barcode search error:', error.message);
    return [];
  }
}

// Get recent food recalls (for alerts/news feed)
export async function getRecentRecalls(days: number = 30): Promise<FDARecall[]> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const dateStr = fromDate.toISOString().split('T')[0].replace(/-/g, '');

    const response = await axios.get(FDA_API_URL, {
      params: {
        search: `report_date:[${dateStr} TO *]`,
        limit: 20,
        sort: 'report_date:desc',
      },
      timeout: 10000,
    });

    return (response.data.results || []).map((r: any) => ({
      recallNumber: r.recall_number,
      reportDate: r.report_date,
      recallInitiationDate: r.recall_initiation_date,
      product: r.product_description,
      reason: r.reason_for_recall,
      company: r.recalling_firm,
      status: r.status,
      classification: r.classification,
      distribution: r.distribution_pattern,
      quantity: r.product_quantity,
      codes: r.code_info ? [r.code_info] : [],
    }));
  } catch (error: any) {
    console.error('FDA recent recalls error:', error.message);
    return [];
  }
}

// Check if a product has any active recalls
export async function checkProductRecalls(
  productName: string,
  brandName?: string
): Promise<{ hasRecalls: boolean; recalls: FDARecall[] }> {
  const query = brandName ? `${brandName} ${productName}` : productName;
  const result = await searchRecalls(query, 5);
  
  // Filter to only ongoing/recent recalls
  const activeRecalls = result.recalls.filter(r => 
    r.status === 'Ongoing' || 
    isRecentDate(r.reportDate, 90)
  );

  return {
    hasRecalls: activeRecalls.length > 0,
    recalls: activeRecalls,
  };
}

function isRecentDate(dateStr: string, days: number): boolean {
  try {
    // FDA date format: YYYYMMDD
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const recallDate = new Date(year, month, day);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return recallDate >= cutoff;
  } catch {
    return false;
  }
}

// Get severity color for UI
export function getRecallSeverityColor(classification: string): string {
  switch (classification) {
    case 'Class I': return '#F44336'; // Red - serious
    case 'Class II': return '#FF9800'; // Orange - moderate
    case 'Class III': return '#FFC107'; // Yellow - minor
    default: return '#9E9E9E';
  }
}

// Get human-readable severity
export function getRecallSeverityText(classification: string): string {
  switch (classification) {
    case 'Class I': return 'Serious - may cause health problems or death';
    case 'Class II': return 'Moderate - may cause temporary health issues';
    case 'Class III': return 'Minor - unlikely to cause health issues';
    default: return 'Unknown severity';
  }
}
