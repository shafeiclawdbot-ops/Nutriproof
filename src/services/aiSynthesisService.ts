/**
 * AI Synthesis Service
 * Takes research findings and generates human-readable recommendations
 * Uses Claude API to synthesize evidence into actionable insights
 */

import Constants from 'expo-constants';
import { AggregatedResearch } from './researchPipeline';

const ANTHROPIC_API_KEY = Constants.expoConfig?.extra?.claudeApiKey || process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

export interface AIRecommendation {
  summary: string;           // Quick verdict (1-2 sentences)
  safetyLevel: 'safe' | 'caution' | 'avoid' | 'insufficient_data';
  keyPoints: string[];       // Bullet points of main findings
  concerns: string[];        // Any warnings or concerns
  benefits: string[];        // Potential benefits found
  recommendation: string;    // Detailed recommendation
  citations: string[];       // PMIDs/DOIs used
  confidence: 'high' | 'medium' | 'low';  // Based on evidence quality
}

export async function synthesizeResearch(
  ingredientName: string,
  research: AggregatedResearch
): Promise<AIRecommendation> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('No Anthropic API key - returning raw summary');
    return createFallbackRecommendation(ingredientName, research);
  }

  const prompt = buildPrompt(ingredientName, research);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    return parseAIResponse(content, research);
  } catch (error) {
    console.error('AI synthesis failed:', error);
    return createFallbackRecommendation(ingredientName, research);
  }
}

function buildPrompt(ingredientName: string, research: AggregatedResearch): string {
  // Prepare evidence summary
  const papers = research.papers.slice(0, 10); // Top 10 papers
  const paperSummaries = papers.map((p, i) => 
    `${i + 1}. "${p.title}" (${p.citationCount || 0} citations)
   ${p.tldr || p.abstract?.slice(0, 200) + '...' || 'No abstract'}
   Source: ${p.pmid ? `PMID:${p.pmid}` : p.doi ? `DOI:${p.doi}` : 'N/A'}`
  ).join('\n\n');

  const webFindings = research.webResults.slice(0, 5).map(w =>
    `- ${w.title}: ${w.snippet}`
  ).join('\n');

  return `You are a nutrition science expert. Analyze the following research about "${ingredientName}" and provide a clear, evidence-based recommendation.

RESEARCH PAPERS (${research.totalResults} found, showing top ${papers.length}):
${paperSummaries}

RECENT WEB FINDINGS:
${webFindings || 'None available'}

Based on this evidence, provide a recommendation in the following JSON format:
{
  "summary": "One or two sentence verdict on this ingredient",
  "safetyLevel": "safe|caution|avoid|insufficient_data",
  "keyPoints": ["Main finding 1", "Main finding 2", "Main finding 3"],
  "concerns": ["Any warnings or concerns"],
  "benefits": ["Any potential benefits"],
  "recommendation": "Detailed 2-3 sentence recommendation for the average consumer",
  "confidence": "high|medium|low"
}

RULES:
- Only state claims supported by the provided research
- Include specific citations (PMID/DOI) when making claims
- If evidence is conflicting, say so
- If evidence is insufficient, say "insufficient_data"
- Be practical and actionable
- No medical advice - recommend consulting professionals for health conditions

Return ONLY valid JSON, no other text.`;
}

function parseAIResponse(content: string, research: AggregatedResearch): AIRecommendation {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Extract citations from papers
    const citations = research.papers.slice(0, 10).map(p => 
      p.pmid ? `PMID:${p.pmid}` : p.doi ? `DOI:${p.doi}` : null
    ).filter(Boolean) as string[];

    return {
      summary: parsed.summary || 'Unable to generate summary',
      safetyLevel: parsed.safetyLevel || 'insufficient_data',
      keyPoints: parsed.keyPoints || [],
      concerns: parsed.concerns || [],
      benefits: parsed.benefits || [],
      recommendation: parsed.recommendation || 'Insufficient evidence for recommendation',
      citations,
      confidence: parsed.confidence || 'low',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return createFallbackRecommendation('ingredient', research);
  }
}

function createFallbackRecommendation(
  ingredientName: string,
  research: AggregatedResearch
): AIRecommendation {
  // Create basic recommendation from raw data
  const hasEnoughData = research.totalResults >= 5;
  const topPaper = research.papers[0];

  return {
    summary: hasEnoughData
      ? `Found ${research.totalResults} studies on ${ingredientName}. Review the evidence below.`
      : `Limited research found on ${ingredientName} (${research.totalResults} studies).`,
    safetyLevel: 'insufficient_data',
    keyPoints: research.papers.slice(0, 3).map(p => p.title),
    concerns: [],
    benefits: [],
    recommendation: 'Review the scientific papers below and consult a healthcare professional for personalized advice.',
    citations: research.papers.slice(0, 5).map(p => 
      p.pmid ? `PMID:${p.pmid}` : `DOI:${p.doi}`
    ).filter(Boolean),
    confidence: 'low',
  };
}

// Quick synthesis for product overview
export async function synthesizeProductSafety(
  productName: string,
  ingredients: string[],
  ingredientResearch: Map<string, AggregatedResearch>
): Promise<{
  overallSafety: 'safe' | 'caution' | 'avoid' | 'unknown';
  summary: string;
  flaggedIngredients: { name: string; concern: string }[];
}> {
  // Aggregate all ingredient findings
  const concerns: { name: string; concern: string }[] = [];
  let worstSafety: 'safe' | 'caution' | 'avoid' | 'unknown' = 'safe';

  for (const [ingredient, research] of ingredientResearch) {
    // Check for any concerning keywords in abstracts
    const concerningTerms = ['toxic', 'harmful', 'carcinogen', 'adverse', 'danger'];
    const hasConcerns = research.papers.some(p => 
      concerningTerms.some(term => 
        p.abstract?.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term)
      )
    );

    if (hasConcerns) {
      concerns.push({
        name: ingredient,
        concern: 'Some studies suggest potential concerns - tap to learn more',
      });
      worstSafety = worstSafety === 'avoid' ? 'avoid' : 'caution';
    }
  }

  return {
    overallSafety: concerns.length === 0 ? 'safe' : worstSafety,
    summary: concerns.length === 0
      ? `${productName} ingredients appear safe based on available research.`
      : `${concerns.length} ingredient(s) may need attention. Tap for details.`,
    flaggedIngredients: concerns,
  };
}
