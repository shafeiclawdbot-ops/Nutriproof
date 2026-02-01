// PubMed E-Utilities Service - 35M+ biomedical papers
// API Docs: https://www.ncbi.nlm.nih.gov/books/NBK25500/
import axios from 'axios';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const TOOL_NAME = 'Nutriproof';
const EMAIL = 'shafeiclawdbot@gmail.com'; // Required by NCBI

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  keywords: string[];
  meshTerms: string[];
}

export interface PubMedSearchResult {
  totalCount: number;
  articles: PubMedArticle[];
  query: string;
}

// Search PubMed for articles about an ingredient
export async function searchPubMed(
  query: string,
  maxResults: number = 10
): Promise<PubMedSearchResult> {
  try {
    // Step 1: Search for PMIDs
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi`;
    const searchParams = {
      db: 'pubmed',
      term: query,
      retmax: maxResults,
      retmode: 'json',
      sort: 'relevance',
      tool: TOOL_NAME,
      email: EMAIL,
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    const searchData = searchResponse.data;
    
    const pmids: string[] = searchData.esearchresult?.idlist || [];
    const totalCount = parseInt(searchData.esearchresult?.count || '0');

    if (pmids.length === 0) {
      return { totalCount: 0, articles: [], query };
    }

    // Step 2: Fetch article details
    const articles = await fetchArticleDetails(pmids);

    return {
      totalCount,
      articles,
      query,
    };
  } catch (error) {
    console.error('PubMed search error:', error);
    return { totalCount: 0, articles: [], query };
  }
}

// Fetch full details for a list of PMIDs
async function fetchArticleDetails(pmids: string[]): Promise<PubMedArticle[]> {
  try {
    const fetchUrl = `${PUBMED_BASE}/efetch.fcgi`;
    const params = {
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
      tool: TOOL_NAME,
      email: EMAIL,
    };

    const response = await axios.get(fetchUrl, { params });
    const xmlData = response.data;

    // Parse XML (basic parsing - in production use xml2js or similar)
    return parseArticlesFromXml(xmlData, pmids);
  } catch (error) {
    console.error('PubMed fetch error:', error);
    return [];
  }
}

// Basic XML parsing for PubMed articles
function parseArticlesFromXml(xml: string, pmids: string[]): PubMedArticle[] {
  const articles: PubMedArticle[] = [];

  for (const pmid of pmids) {
    // Extract article data using regex (simplified - use proper XML parser in production)
    const articleRegex = new RegExp(
      `<PubmedArticle[^>]*>([\\s\\S]*?<PMID[^>]*>${pmid}</PMID>[\\s\\S]*?)</PubmedArticle>`,
      'i'
    );
    const match = xml.match(articleRegex);

    if (match) {
      const articleXml = match[1];

      const title = extractXmlValue(articleXml, 'ArticleTitle') || 'Untitled';
      const abstract = extractXmlValue(articleXml, 'AbstractText') || '';
      const journal = extractXmlValue(articleXml, 'Title') || '';
      const pubDate = extractPubDate(articleXml);
      const doi = extractDoi(articleXml);
      const authors = extractAuthors(articleXml);
      const keywords = extractKeywords(articleXml);
      const meshTerms = extractMeshTerms(articleXml);

      articles.push({
        pmid,
        title,
        abstract,
        authors,
        journal,
        pubDate,
        doi,
        keywords,
        meshTerms,
      });
    }
  }

  return articles;
}

function extractXmlValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? cleanHtml(match[1]) : '';
}

function extractPubDate(xml: string): string {
  const year = extractXmlValue(xml, 'Year');
  const month = extractXmlValue(xml, 'Month');
  return month ? `${month} ${year}` : year;
}

function extractDoi(xml: string): string | undefined {
  const match = xml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/i);
  return match ? match[1] : undefined;
}

function extractAuthors(xml: string): string[] {
  const authors: string[] = [];
  const authorMatches = xml.matchAll(/<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<ForeName>([^<]*)<\/ForeName>[\s\S]*?<\/Author>/gi);
  
  for (const match of authorMatches) {
    authors.push(`${match[2]} ${match[1]}`.trim());
  }
  return authors.slice(0, 5); // First 5 authors
}

function extractKeywords(xml: string): string[] {
  const keywords: string[] = [];
  const matches = xml.matchAll(/<Keyword[^>]*>([^<]+)<\/Keyword>/gi);
  for (const match of matches) {
    keywords.push(match[1]);
  }
  return keywords;
}

function extractMeshTerms(xml: string): string[] {
  const terms: string[] = [];
  const matches = xml.matchAll(/<DescriptorName[^>]*>([^<]+)<\/DescriptorName>/gi);
  for (const match of matches) {
    terms.push(match[1]);
  }
  return terms;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build optimized search query for food/health research
export function buildIngredientQuery(ingredient: string): string {
  const terms = [
    `"${ingredient}"[Title/Abstract]`,
    'AND',
    '(health[Title/Abstract] OR safety[Title/Abstract] OR toxicity[Title/Abstract] OR nutrition[Title/Abstract] OR "adverse effects"[Title/Abstract])',
  ];
  return terms.join(' ');
}
