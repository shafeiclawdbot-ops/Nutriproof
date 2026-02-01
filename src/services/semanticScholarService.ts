// Semantic Scholar API Service - 200M+ papers with TLDR summaries
// API Docs: https://api.semanticscholar.org/api-docs/
import axios from 'axios';

const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
const S2_PARTNER_BASE = 'https://api.semanticscholar.org/partner/v1'; // For TLDR

// Simple in-memory cache (5 minute TTL)
const searchCache = new Map<string, { data: S2SearchResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limit tracking
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export interface S2Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  tldr: string | null; // AI-generated summary
  authors: { name: string }[];
  year: number | null;
  citationCount: number;
  influentialCitationCount: number;
  venue: string | null;
  url: string;
  openAccessPdf: string | null;
  fieldsOfStudy: string[];
  publicationTypes: string[];
  externalIds: {
    DOI?: string;
    PubMed?: string;
    ArXiv?: string;
  };
}

export interface S2SearchResult {
  total: number;
  papers: S2Paper[];
  query: string;
}

// Search Semantic Scholar for papers
export async function searchSemanticScholar(
  query: string,
  maxResults: number = 10
): Promise<S2SearchResult> {
  const cacheKey = `${query}:${maxResults}`;
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Semantic Scholar: returning cached result');
    return cached.data;
  }

  // Rate limiting - wait if needed
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const url = `${S2_BASE}/paper/search`;
    const params = {
      query,
      limit: maxResults,
      fields: [
        'paperId',
        'title',
        'abstract',
        'tldr',
        'authors',
        'year',
        'citationCount',
        'influentialCitationCount',
        'venue',
        'url',
        'openAccessPdf',
        'fieldsOfStudy',
        'publicationTypes',
        'externalIds',
      ].join(','),
    };

    const response = await axios.get(url, { 
      params,
      headers: {
        // Add API key here if you have one (increases rate limits)
        // 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
      }
    });

    const data = response.data;
    
    const papers: S2Paper[] = (data.data || []).map((paper: any) => ({
      paperId: paper.paperId,
      title: paper.title || 'Untitled',
      abstract: paper.abstract,
      tldr: paper.tldr?.text || null,
      authors: paper.authors || [],
      year: paper.year,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      venue: paper.venue,
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      openAccessPdf: paper.openAccessPdf?.url || null,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      publicationTypes: paper.publicationTypes || [],
      externalIds: paper.externalIds || {},
    }));

    const result: S2SearchResult = {
      total: data.total || papers.length,
      papers,
      query,
    };

    // Cache the result
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('Semantic Scholar search error:', error);
    return { total: 0, papers: [], query };
  }
}

// Get paper recommendations based on a seed paper
export async function getRecommendations(
  paperId: string,
  maxResults: number = 5
): Promise<S2Paper[]> {
  try {
    const url = `${S2_BASE}/paper/${paperId}/recommendations`;
    const params = {
      limit: maxResults,
      fields: 'paperId,title,abstract,tldr,authors,year,citationCount,url',
    };

    const response = await axios.get(url, { params });
    return response.data.recommendedPapers || [];
  } catch (error) {
    console.error('Recommendations error:', error);
    return [];
  }
}

// Get paper by external ID (DOI, PubMed ID, etc.)
export async function getPaperByExternalId(
  idType: 'DOI' | 'PMID' | 'ArXiv',
  id: string
): Promise<S2Paper | null> {
  try {
    const prefix = idType === 'PMID' ? 'PMID:' : idType === 'ArXiv' ? 'ArXiv:' : '';
    const url = `${S2_BASE}/paper/${prefix}${id}`;
    const params = {
      fields: 'paperId,title,abstract,tldr,authors,year,citationCount,influentialCitationCount,venue,url,openAccessPdf,fieldsOfStudy,externalIds',
    };

    const response = await axios.get(url, { params });
    const paper = response.data;

    return {
      paperId: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      tldr: paper.tldr?.text || null,
      authors: paper.authors || [],
      year: paper.year,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      venue: paper.venue,
      url: paper.url,
      openAccessPdf: paper.openAccessPdf?.url || null,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      publicationTypes: [],
      externalIds: paper.externalIds || {},
    };
  } catch (error) {
    console.error('Get paper error:', error);
    return null;
  }
}

// Build optimized search query for food/nutrition research
export function buildNutritionQuery(ingredient: string): string {
  return `${ingredient} (health OR safety OR nutrition OR toxicology OR dietary)`;
}

// Sort papers by relevance score (combining citations and recency)
export function sortByRelevance(papers: S2Paper[]): S2Paper[] {
  const currentYear = new Date().getFullYear();
  
  return papers.sort((a, b) => {
    // Score based on citations (log scale) and recency
    const aScore = Math.log(a.citationCount + 1) * 10 + 
                   (a.year ? (currentYear - a.year < 5 ? 20 : 0) : 0) +
                   (a.tldr ? 10 : 0); // Bonus for having TLDR
    const bScore = Math.log(b.citationCount + 1) * 10 + 
                   (b.year ? (currentYear - b.year < 5 ? 20 : 0) : 0) +
                   (b.tldr ? 10 : 0);
    return bScore - aScore;
  });
}
