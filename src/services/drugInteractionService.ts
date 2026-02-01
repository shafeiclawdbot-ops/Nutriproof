// Drug-Food Interaction Service
// Uses NIH DailyMed and research databases to find interactions
import axios from 'axios';

const DAILYMED_API = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

export interface DrugFoodInteraction {
  drug: string;
  food: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
  source: string;
}

// Known food-drug interactions database
// Source: FDA, NIH, and peer-reviewed research
const KNOWN_INTERACTIONS: DrugFoodInteraction[] = [
  {
    drug: 'Warfarin',
    food: 'Vitamin K',
    severity: 'major',
    description: 'Vitamin K-rich foods (leafy greens, broccoli) can reduce warfarin effectiveness',
    recommendation: 'Maintain consistent vitamin K intake; don\'t suddenly increase or decrease',
    source: 'FDA/NIH',
  },
  {
    drug: 'Statins',
    food: 'Grapefruit',
    severity: 'major',
    description: 'Grapefruit inhibits CYP3A4 enzyme, increasing statin blood levels',
    recommendation: 'Avoid grapefruit and grapefruit juice while taking statins',
    source: 'FDA',
  },
  {
    drug: 'MAO Inhibitors',
    food: 'Tyramine',
    severity: 'major',
    description: 'Tyramine-rich foods (aged cheese, cured meats, fermented foods) can cause dangerous blood pressure spikes',
    recommendation: 'Strictly avoid tyramine-rich foods while on MAOIs',
    source: 'FDA/NIH',
  },
  {
    drug: 'Thyroid medication',
    food: 'Calcium',
    severity: 'moderate',
    description: 'Calcium supplements and calcium-rich foods reduce thyroid medication absorption',
    recommendation: 'Take thyroid medication 4 hours apart from calcium',
    source: 'NIH',
  },
  {
    drug: 'Antibiotics (Tetracycline)',
    food: 'Dairy',
    severity: 'moderate',
    description: 'Calcium in dairy products binds to tetracycline, reducing absorption',
    recommendation: 'Take tetracycline 1-2 hours before or after dairy',
    source: 'FDA',
  },
  {
    drug: 'Blood pressure medication',
    food: 'Potassium',
    severity: 'moderate',
    description: 'ACE inhibitors and potassium-sparing diuretics combined with high-potassium foods may cause hyperkalemia',
    recommendation: 'Monitor potassium intake; consult doctor about dietary changes',
    source: 'NIH',
  },
  {
    drug: 'Metformin',
    food: 'Alcohol',
    severity: 'major',
    description: 'Alcohol increases risk of lactic acidosis with metformin',
    recommendation: 'Limit or avoid alcohol while taking metformin',
    source: 'FDA',
  },
  {
    drug: 'Blood thinners',
    food: 'Omega-3',
    severity: 'moderate',
    description: 'High doses of fish oil/omega-3 may increase bleeding risk',
    recommendation: 'Inform doctor about omega-3 supplements; monitor for bleeding',
    source: 'NIH',
  },
];

// Ingredient keywords that may interact with medications
const INTERACTION_KEYWORDS: Record<string, string[]> = {
  'Vitamin K': ['vitamin k', 'phylloquinone', 'menaquinone', 'spinach', 'kale', 'broccoli', 'brussels sprouts'],
  'Grapefruit': ['grapefruit', 'pomelo', 'citrus paradisi'],
  'Tyramine': ['tyramine', 'aged cheese', 'fermented', 'cured meat', 'sauerkraut', 'soy sauce', 'miso'],
  'Calcium': ['calcium', 'milk', 'cheese', 'yogurt', 'fortified'],
  'Potassium': ['potassium', 'banana', 'potato', 'orange juice', 'tomato'],
  'Alcohol': ['alcohol', 'ethanol', 'wine', 'beer', 'spirits'],
  'Caffeine': ['caffeine', 'coffee', 'tea', 'guarana', 'yerba mate'],
  'Fiber': ['fiber', 'fibre', 'bran', 'psyllium', 'whole grain'],
};

// Check ingredients for potential drug interactions
export function checkDrugInteractions(
  ingredients: string[],
  userMedications?: string[]
): DrugFoodInteraction[] {
  const foundInteractions: DrugFoodInteraction[] = [];
  const ingredientText = ingredients.join(' ').toLowerCase();

  // Check each known interaction
  for (const interaction of KNOWN_INTERACTIONS) {
    const keywords = INTERACTION_KEYWORDS[interaction.food] || [interaction.food.toLowerCase()];
    
    const hasInteractingIngredient = keywords.some(keyword => 
      ingredientText.includes(keyword.toLowerCase())
    );

    if (hasInteractingIngredient) {
      // If user has medications, only show relevant interactions
      if (userMedications && userMedications.length > 0) {
        const hasMedication = userMedications.some(med =>
          interaction.drug.toLowerCase().includes(med.toLowerCase()) ||
          med.toLowerCase().includes(interaction.drug.toLowerCase())
        );
        if (hasMedication) {
          foundInteractions.push(interaction);
        }
      } else {
        // Show all potential interactions
        foundInteractions.push(interaction);
      }
    }
  }

  return foundInteractions;
}

// Search DailyMed for drug information
export async function searchDrugInfo(drugName: string): Promise<any[]> {
  try {
    const response = await axios.get(`${DAILYMED_API}/drugnames.json`, {
      params: {
        drug_name: drugName,
      },
      timeout: 10000,
    });
    return response.data.data || [];
  } catch (error) {
    console.error('DailyMed API error:', error);
    return [];
  }
}

// Get severity color for UI
export function getInteractionSeverityColor(severity: string): string {
  switch (severity) {
    case 'major': return '#F44336'; // Red
    case 'moderate': return '#FF9800'; // Orange
    case 'minor': return '#FFC107'; // Yellow
    default: return '#9E9E9E';
  }
}

// Get severity icon
export function getInteractionSeverityIcon(severity: string): string {
  switch (severity) {
    case 'major': return '⚠️';
    case 'moderate': return '⚡';
    case 'minor': return 'ℹ️';
    default: return '•';
  }
}
