// Claude AI Service - Plain English summaries of scientific research
import axios from 'axios';
import { EvidenceItem, IngredientSummary } from './researchPipeline';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export interface AISummary {
  plainEnglish: string;
  safetyVerdict: string;
  shouldWorry: boolean;
  keyPoints: string[];
  controversies: string[];
  recommendation: string;
}

// Generate plain-English summary of research findings
export async function summarizeResearch(
  ingredient: string,
  evidence: EvidenceItem[],
  summary: IngredientSummary
): Promise<AISummary | null> {
  if (!CLAUDE_API_KEY) {
    console.log('Claude API key not configured');
    return generateFallbackSummary(ingredient, evidence, summary);
  }

  try {
    const prompt = buildPrompt(ingredient, evidence, summary);
    
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    const text = response.data.content[0].text;
    return parseAIResponse(text);
  } catch (error: any) {
    console.error('Claude API error:', error.message);
    return generateFallbackSummary(ingredient, evidence, summary);
  }
}

function buildPrompt(
  ingredient: string,
  evidence: EvidenceItem[],
  summary: IngredientSummary
): string {
  const evidenceSummaries = evidence.slice(0, 5).map(e => 
    `- ${e.title} (${e.source}, ${e.confidence} confidence): ${e.summary.slice(0, 200)}`
  ).join('\n');

  return `You are a nutrition scientist explaining food ingredients to consumers.

INGREDIENT: ${ingredient}

RESEARCH FOUND (${summary.totalStudies} studies):
${evidenceSummaries}

REGULATORY STATUS: ${summary.regulatoryStatus.join(', ') || 'Not specifically reviewed'}
PRELIMINARY SAFETY RATING: ${summary.safetyRating}

Based on this research, provide a response in this exact JSON format:
{
  "plainEnglish": "2-3 sentence explanation a regular person can understand",
  "safetyVerdict": "One of: Safe for most people | Generally safe in normal amounts | Use caution | Best to avoid | Insufficient data",
  "shouldWorry": true or false,
  "keyPoints": ["point 1", "point 2", "point 3"],
  "controversies": ["any debates or conflicting findings"],
  "recommendation": "One practical sentence of advice"
}

Be balanced and evidence-based. Don't be alarmist but don't dismiss real concerns.`;
}

function parseAIResponse(text: string): AISummary {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse AI response');
  }
  
  // Fallback parsing
  return {
    plainEnglish: text.slice(0, 300),
    safetyVerdict: 'See research for details',
    shouldWorry: false,
    keyPoints: [],
    controversies: [],
    recommendation: 'Review the scientific evidence below.',
  };
}

// Generate summary without AI when API not available
function generateFallbackSummary(
  ingredient: string,
  evidence: EvidenceItem[],
  summary: IngredientSummary
): AISummary {
  const safetyMap: Record<string, string> = {
    safe: 'Safe for most people',
    generally_safe: 'Generally safe in normal amounts',
    caution: 'Use caution',
    avoid: 'Best to avoid',
    unknown: 'Insufficient data',
  };

  const keyPoints = summary.keyFindings.slice(0, 3);
  
  let plainEnglish = `${ingredient} `;
  if (summary.safetyRating === 'safe' || summary.safetyRating === 'generally_safe') {
    plainEnglish += 'appears to be safe based on available research. ';
  } else if (summary.safetyRating === 'caution') {
    plainEnglish += 'may have some concerns worth noting. ';
  } else if (summary.safetyRating === 'avoid') {
    plainEnglish += 'has raised significant concerns in research. ';
  } else {
    plainEnglish += 'has limited research available. ';
  }
  plainEnglish += `We found ${summary.totalStudies} relevant studies.`;

  return {
    plainEnglish,
    safetyVerdict: safetyMap[summary.safetyRating] || 'Insufficient data',
    shouldWorry: summary.safetyRating === 'avoid' || summary.safetyRating === 'caution',
    keyPoints,
    controversies: summary.controversyLevel !== 'none' ? ['Some conflicting findings exist'] : [],
    recommendation: summary.regulatoryStatus.length > 0
      ? `Reviewed by ${summary.regulatoryStatus.join(', ')}. Check the research below for details.`
      : 'Review the scientific evidence below for more information.',
  };
}

export function isClaudeConfigured(): boolean {
  return CLAUDE_API_KEY.length > 0;
}
