// Unified Research Pipeline - Combines all data sources
// PubMed + Semantic Scholar + Open Food Facts + Web Search

import { searchPubMed, buildIngredientQuery, PubMedArticle } from './pubmedService';
import { searchSemanticScholar, buildNutritionQuery, S2Paper, sortByRelevance } from './semanticScholarService';
import { searchHealthContent, searchRegulatoryInfo, WebSearchResult } from './webSearchService';

export interface EvidenceItem {
  id: string;
  type: 'pubmed' | 'semantic_scholar' | 'web' | 'regulatory';
  title: string;
  summary: string;
  source: string;
  url: string;
  year?: number;
  citations?: number;
  authors?: string[];
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
}

// Aggregated research data for AI synthesis
export interface AggregatedResearch {
  papers: {
    title: string;
    abstract?: string;
    tldr?: string;
    pmid?: string;
    doi?: string;
    citationCount?: number;
    year?: number;
  }[];
  webResults: {
    title: string;
    snippet: string;
    url: string;
  }[];
  totalResults: number;
}

export interface IngredientResearch {
  ingredient: string;
  evidence: EvidenceItem[];
  summary: IngredientSummary;
  aggregated: AggregatedResearch; // For AI synthesis
  lastUpdated: number;
}

export interface IngredientSummary {
  safetyRating: 'safe' | 'generally_safe' | 'caution' | 'avoid' | 'unknown';
  controversyLevel: 'none' | 'low' | 'medium' | 'high';
  regulatoryStatus: string[];
  keyFindings: string[];
  totalStudies: number;
}

// Main research function - aggregates all sources
export async function researchIngredient(ingredient: string): Promise<IngredientResearch> {
  console.log(`Researching: ${ingredient}`);
  
  // Run all searches in parallel
  const [pubmedResults, s2Results, healthContent, regulatoryInfo] = await Promise.all([
    searchPubMed(buildIngredientQuery(ingredient), 5),
    searchSemanticScholar(buildNutritionQuery(ingredient), 5),
    searchHealthContent(ingredient),
    searchRegulatoryInfo(ingredient),
  ]);

  // Convert to unified evidence format
  const evidence: EvidenceItem[] = [];

  // Add PubMed results
  for (const article of pubmedResults.articles) {
    evidence.push(convertPubMedToEvidence(article));
  }

  // Add Semantic Scholar results (sorted by relevance)
  const sortedS2 = sortByRelevance(s2Results.papers);
  for (const paper of sortedS2) {
    evidence.push(convertS2ToEvidence(paper));
  }

  // Add web search results
  for (const result of healthContent.results.slice(0, 5)) {
    evidence.push(convertWebToEvidence(result, 'web'));
  }

  // Add regulatory info
  for (const result of regulatoryInfo.results) {
    evidence.push(convertWebToEvidence(result, 'regulatory'));
  }

  // Deduplicate by URL
  const uniqueEvidence = deduplicateEvidence(evidence);

  // Generate summary
  const summary = generateSummary(uniqueEvidence, ingredient);

  // Aggregate raw data for AI synthesis
  const aggregated: AggregatedResearch = {
    papers: [
      ...pubmedResults.articles.map(a => ({
        title: a.title,
        abstract: a.abstract,
        pmid: a.pmid,
        year: parseInt(a.pubDate) || undefined,
      })),
      ...sortedS2.map(p => ({
        title: p.title,
        abstract: p.abstract || undefined,
        tldr: p.tldr || undefined,
        doi: p.externalIds?.DOI,
        citationCount: p.citationCount,
        year: p.year || undefined,
      })),
    ],
    webResults: [
      ...healthContent.results.slice(0, 5).map(r => ({
        title: r.title,
        snippet: r.snippet,
        url: r.url,
      })),
      ...regulatoryInfo.results.map(r => ({
        title: r.title,
        snippet: r.snippet,
        url: r.url,
      })),
    ],
    totalResults: pubmedResults.total + s2Results.total,
  };

  return {
    ingredient,
    evidence: uniqueEvidence,
    summary,
    aggregated,
    lastUpdated: Date.now(),
  };
}

// Quick research (faster, fewer sources)
export async function quickResearch(ingredient: string): Promise<EvidenceItem[]> {
  // Just PubMed and Semantic Scholar, 3 results each
  const [pubmed, s2] = await Promise.all([
    searchPubMed(buildIngredientQuery(ingredient), 3),
    searchSemanticScholar(buildNutritionQuery(ingredient), 3),
  ]);

  const evidence: EvidenceItem[] = [
    ...pubmed.articles.map(convertPubMedToEvidence),
    ...s2.papers.map(convertS2ToEvidence),
  ];

  return deduplicateEvidence(evidence);
}

// Convert PubMed article to evidence
function convertPubMedToEvidence(article: PubMedArticle): EvidenceItem {
  return {
    id: `pubmed-${article.pmid}`,
    type: 'pubmed',
    title: article.title,
    summary: article.abstract.slice(0, 500) + (article.abstract.length > 500 ? '...' : ''),
    source: article.journal || 'PubMed',
    url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
    year: parseInt(article.pubDate) || undefined,
    authors: article.authors,
    confidence: 'high', // Peer-reviewed
    tags: [...article.meshTerms.slice(0, 5), ...article.keywords.slice(0, 3)],
  };
}

// Convert Semantic Scholar paper to evidence
function convertS2ToEvidence(paper: S2Paper): EvidenceItem {
  const confidence = paper.citationCount > 100 ? 'high' : 
                     paper.citationCount > 10 ? 'medium' : 'low';
  
  return {
    id: `s2-${paper.paperId}`,
    type: 'semantic_scholar',
    title: paper.title,
    summary: paper.tldr || paper.abstract?.slice(0, 500) || 'No summary available',
    source: paper.venue || 'Semantic Scholar',
    url: paper.url,
    year: paper.year || undefined,
    citations: paper.citationCount,
    authors: paper.authors.map(a => a.name),
    confidence,
    tags: paper.fieldsOfStudy,
  };
}

// Convert web search result to evidence
function convertWebToEvidence(
  result: WebSearchResult,
  type: 'web' | 'regulatory'
): EvidenceItem {
  const isOfficialSource = result.url.includes('.gov') || 
                           result.url.includes('who.int') ||
                           result.url.includes('efsa.europa');
  
  return {
    id: `web-${hashUrl(result.url)}`,
    type,
    title: result.title,
    summary: result.snippet,
    source: new URL(result.url).hostname.replace('www.', ''),
    url: result.url,
    confidence: isOfficialSource ? 'high' : 'medium',
    tags: type === 'regulatory' ? ['regulatory', 'official'] : ['web'],
  };
}

// Simple URL hash for deduplication
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Remove duplicate evidence (same URL or very similar titles)
function deduplicateEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
  const seen = new Set<string>();
  const unique: EvidenceItem[] = [];

  for (const item of evidence) {
    const key = item.url.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}

// Generate summary from evidence
function generateSummary(evidence: EvidenceItem[], ingredient: string): IngredientSummary {
  const keyFindings: string[] = [];
  const regulatoryStatus: string[] = [];
  
  // Extract key findings from high-confidence sources
  const highConfidence = evidence.filter(e => e.confidence === 'high');
  for (const item of highConfidence.slice(0, 3)) {
    if (item.summary && item.summary.length > 50) {
      // Extract first sentence as key finding
      const firstSentence = item.summary.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 20) {
        keyFindings.push(firstSentence.trim());
      }
    }
  }

  // Check for regulatory items
  const regulatory = evidence.filter(e => e.type === 'regulatory');
  for (const item of regulatory) {
    if (item.url.includes('fda.gov')) regulatoryStatus.push('FDA');
    if (item.url.includes('efsa.europa')) regulatoryStatus.push('EFSA');
    if (item.url.includes('who.int')) regulatoryStatus.push('WHO');
  }

  // Determine controversy level based on findings
  const summaryText = evidence.map(e => e.summary.toLowerCase()).join(' ');
  const controversyKeywords = ['controversial', 'debate', 'conflicting', 'disputed', 'mixed results'];
  const hasControversy = controversyKeywords.some(k => summaryText.includes(k));

  // Determine safety (very simplified - in production use NLP)
  const safetyKeywords = {
    safe: ['safe', 'approved', 'generally recognized', 'gras'],
    caution: ['caution', 'limit', 'moderate', 'excessive'],
    avoid: ['toxic', 'harmful', 'banned', 'dangerous', 'carcinogenic'],
  };

  let safetyRating: IngredientSummary['safetyRating'] = 'unknown';
  if (safetyKeywords.avoid.some(k => summaryText.includes(k))) {
    safetyRating = 'avoid';
  } else if (safetyKeywords.caution.some(k => summaryText.includes(k))) {
    safetyRating = 'caution';
  } else if (safetyKeywords.safe.some(k => summaryText.includes(k))) {
    safetyRating = regulatoryStatus.length > 0 ? 'safe' : 'generally_safe';
  }

  return {
    safetyRating,
    controversyLevel: hasControversy ? 'medium' : 'low',
    regulatoryStatus,
    keyFindings: keyFindings.slice(0, 5),
    totalStudies: evidence.filter(e => e.type === 'pubmed' || e.type === 'semantic_scholar').length,
  };
}

// Export types
export type { PubMedArticle } from './pubmedService';
export type { S2Paper } from './semanticScholarService';
export type { WebSearchResult } from './webSearchService';
