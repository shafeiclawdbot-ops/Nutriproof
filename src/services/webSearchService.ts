// Web Search Service - Exa AI for neural search
// Falls back to basic web search if Exa not configured
import axios from 'axios';

const EXA_API_URL = 'https://api.exa.ai';
const EXA_API_KEY = process.env.EXPO_PUBLIC_EXA_API_KEY || '';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  highlights?: string[];
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  source: 'exa' | 'fallback';
}

// Search with Exa (neural search)
export async function searchWeb(
  query: string,
  options: {
    numResults?: number;
    type?: 'auto' | 'keyword' | 'neural';
    category?: string;
    includeDomains?: string[];
    excludeDomains?: string[];
    startDate?: string;
    useAutoprompt?: boolean;
  } = {}
): Promise<WebSearchResponse> {
  const {
    numResults = 10,
    type = 'auto',
    category,
    includeDomains,
    excludeDomains,
    startDate,
    useAutoprompt = true,
  } = options;

  // If Exa not configured, return empty
  if (!EXA_API_KEY) {
    console.warn('Exa API key not configured');
    return { results: [], query, source: 'fallback' };
  }

  try {
    const response = await axios.post(
      `${EXA_API_URL}/search`,
      {
        query,
        numResults,
        type,
        category,
        includeDomains,
        excludeDomains,
        startPublishedDate: startDate,
        useAutoprompt,
        contents: {
          text: { maxCharacters: 1000 },
          highlights: { numSentences: 3 },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_API_KEY,
        },
      }
    );

    const results: WebSearchResult[] = response.data.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.text || r.highlights?.join(' ') || '',
      publishedDate: r.publishedDate,
      author: r.author,
      score: r.score,
      highlights: r.highlights,
    }));

    return { results, query, source: 'exa' };
  } catch (error) {
    console.error('Exa search error:', error);
    return { results: [], query, source: 'fallback' };
  }
}

// Search for scientific/health content specifically
export async function searchHealthContent(ingredient: string): Promise<WebSearchResponse> {
  const query = `${ingredient} health effects safety research scientific`;
  
  return searchWeb(query, {
    numResults: 10,
    type: 'neural',
    includeDomains: [
      'nih.gov',
      'ncbi.nlm.nih.gov',
      'pubmed.gov',
      'sciencedirect.com',
      'nature.com',
      'who.int',
      'fda.gov',
      'efsa.europa.eu',
      'healthline.com',
      'mayoclinic.org',
      'webmd.com',
      'examine.com',
    ],
    useAutoprompt: true,
  });
}

// Search for regulatory information
export async function searchRegulatoryInfo(ingredient: string): Promise<WebSearchResponse> {
  const query = `${ingredient} FDA EFSA regulation approved safe limit`;
  
  return searchWeb(query, {
    numResults: 5,
    type: 'neural',
    includeDomains: [
      'fda.gov',
      'efsa.europa.eu',
      'who.int',
      'ec.europa.eu',
      'gov.uk',
    ],
  });
}

// Search for recent news/studies
export async function searchRecentNews(ingredient: string): Promise<WebSearchResponse> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return searchWeb(`${ingredient} new study research findings`, {
    numResults: 5,
    type: 'neural',
    startDate: oneYearAgo.toISOString().split('T')[0],
  });
}

// Check if Exa is configured
export function isExaConfigured(): boolean {
  return EXA_API_KEY.length > 0;
}
