# Nutriproof - Complete Product Planning Document

*Created: 2026-02-01*
*Status: Research & Planning Phase*

---

## 📋 Table of Contents

1. [Product Vision](#product-vision)
2. [User Experience (UX)](#user-experience)
3. [Onboarding Flow](#onboarding-flow)
4. [Design System](#design-system)
5. [Typography](#typography)
6. [Color Palette](#color-palette)
7. [UI Components](#ui-components)
8. [Data Model](#data-model)
9. [Database Architecture](#database-architecture)
10. [API Integration](#api-integration)
11. [Technical Stack](#technical-stack)
12. [Competitive Analysis](#competitive-analysis)

---

## 🎯 Product Vision

### Core Value Proposition
> "The food scanner that shows you what science actually says - with citations."

### Problem Statement
Current food scanning apps (Yuka, Think Dirty, EWG) use:
- Arbitrary scoring algorithms
- Vague "scientific research" claims
- No transparency on sources
- Good/bad labeling that creates food anxiety

### Solution
A food scanner that:
- Retrieves actual peer-reviewed papers for each ingredient
- Uses RAG to summarize findings WITHOUT hallucination
- Provides direct citations (PMID, DOI)
- Shows evidence quality ratings
- Empowers users with knowledge, not fear

### Target Users
1. **Health-conscious consumers** - Want to make informed choices
2. **Parents** - Concerned about what kids eat
3. **People with dietary restrictions** - Allergies, sensitivities
4. **Skeptics of "wellness" claims** - Want real science, not marketing

---

## 🧭 User Experience (UX)

### Core User Flows

#### Flow 1: Quick Scan (80% of usage)
```
Open App → Camera activates → Scan barcode → View results → Done
         (< 1 second)      (< 2 seconds)
```

#### Flow 2: Deep Dive
```
View results → Tap ingredient → See paper summaries → 
→ View full paper → Ask follow-up question
```

#### Flow 3: History/Favorites
```
Open App → History tab → View past scans → Compare products
```

### UX Principles

1. **Speed First**
   - Camera ready immediately on app open
   - Results in < 2 seconds
   - Offline mode for previously scanned items

2. **Progressive Disclosure**
   - Quick summary first (3-5 key points)
   - Tap to expand for details
   - Full papers available but not overwhelming

3. **No Judgment**
   - No "good/bad" labels
   - "Here's what the research says" approach
   - User decides what matters to them

4. **Transparency Always**
   - Every claim linked to source
   - Evidence quality clearly shown
   - "No research found" when applicable

### Scan Experience Best Practices

| Principle | Implementation |
|-----------|----------------|
| Instant feedback | Haptic + sound on successful scan |
| Visual guidance | Frame overlay showing scan area |
| Error recovery | "Try again" with helpful tips |
| Pause after scan | Prevent duplicate scans |
| Brightness control | Auto-adjust for QR display scans |
| Offline graceful | Cache common products locally |

---

## 🚀 Onboarding Flow

### Philosophy
- Get to first scan in < 60 seconds
- Collect only essential info upfront
- Show value before asking for account

### Screen-by-Screen Flow

#### Screen 1: Welcome (5 seconds)
```
┌─────────────────────────────────┐
│                                 │
│         [Nutriproof Logo]       │
│                                 │
│    "See what science says       │
│     about your food"            │
│                                 │
│     [Get Started →]             │
│                                 │
│     Already have an account?    │
└─────────────────────────────────┘
```

#### Screen 2: Value Proposition (swipeable, skippable)
```
┌─────────────────────────────────┐
│  [Skip]                         │
│                                 │
│         [Illustration]          │
│                                 │
│   "Real Research, Not Ratings"  │
│                                 │
│   Every ingredient backed by    │
│   peer-reviewed papers          │
│                                 │
│         ○ ● ○                   │
│     [Next →]                    │
└─────────────────────────────────┘
```

#### Screen 3: Camera Permission
```
┌─────────────────────────────────┐
│                                 │
│      [Camera Icon Animation]    │
│                                 │
│   "Allow camera to scan         │
│    product barcodes"            │
│                                 │
│   We only use camera for        │
│   scanning - nothing else       │
│                                 │
│     [Allow Camera Access]       │
│                                 │
└─────────────────────────────────┘
```

#### Screen 4: First Scan (Immediate Value!)
```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [Camera Viewfinder]  │   │
│   │                         │   │
│   │    Point at any barcode │   │
│   │                         │   │
│   └─────────────────────────┘   │
│                                 │
│   Try scanning something now!   │
│                                 │
└─────────────────────────────────┘
```

#### Screen 5: Account (AFTER first scan)
```
┌─────────────────────────────────┐
│                                 │
│   "Save your scan history?"     │
│                                 │
│   [Continue with Apple]         │
│   [Continue with Google]        │
│   [Sign up with Email]          │
│                                 │
│   [Skip for now]                │
│                                 │
│   Your data stays on device     │
│   unless you choose to sync     │
└─────────────────────────────────┘
```

### Onboarding Metrics to Track
- Time to first scan
- Onboarding completion rate
- Permission grant rate
- Account creation rate (immediate vs later)

---

## 🎨 Design System

### Design Philosophy

1. **Scientific but Approachable**
   - Clean, clinical feel without being cold
   - Data-rich but not overwhelming
   - Trust through transparency

2. **Accessible by Default**
   - WCAG 2.1 AA compliance minimum
   - 4.5:1 contrast ratio for text
   - 3:1 for UI elements
   - Never rely on color alone

3. **Mobile-First**
   - Thumb-friendly tap targets (44x44pt min)
   - One-handed operation
   - Works in bright sunlight (high contrast)

### Grid System
```
Margins: 16px (mobile), 24px (tablet)
Gutters: 8px
Columns: 4 (mobile), 8 (tablet), 12 (desktop web)
Base unit: 8px (all spacing multiples of 8)
```

### Elevation/Shadows
```css
/* Subtle - cards, inputs */
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)

/* Medium - floating buttons, dropdowns */
shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)

/* High - modals, overlays */
shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
```

### Border Radius
```css
radius-sm: 4px   /* buttons, inputs */
radius-md: 8px   /* cards */
radius-lg: 16px  /* modals, sheets */
radius-full: 9999px  /* pills, avatars */
```

---

## ✍️ Typography

### Font Selection

**Primary: Inter**
- Highly legible at small sizes
- Excellent for data-dense UIs
- Open source, free
- Native-feeling on both iOS and Android

**Alternative: SF Pro (iOS) / Roboto (Android)**
- Use system fonts for maximum performance
- Falls back gracefully

### Type Scale (Mobile)

| Style | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| Display | 32px | 700 | 1.2 | Main headlines |
| H1 | 24px | 600 | 1.3 | Section headers |
| H2 | 20px | 600 | 1.3 | Card titles |
| H3 | 17px | 600 | 1.4 | Subsections |
| Body | 16px | 400 | 1.5 | Main content |
| Body Small | 14px | 400 | 1.5 | Secondary text |
| Caption | 12px | 400 | 1.4 | Labels, metadata |
| Overline | 11px | 500 | 1.3 | Category labels |

### Typography Rules

1. **Maximum line length:** 65-75 characters
2. **Paragraph spacing:** 1.5x font size
3. **Letter spacing:** 0 for body, +0.5px for all caps
4. **Never use pure black:** Use #1A1A1A or similar

---

## 🎨 Color Palette

### Brand Colors

#### Primary: Scientific Green
```css
--primary-50:  #ECFDF5;  /* Backgrounds */
--primary-100: #D1FAE5;
--primary-200: #A7F3D0;
--primary-300: #6EE7B7;
--primary-400: #34D399;
--primary-500: #10B981;  /* Primary actions */
--primary-600: #059669;  /* Hover states */
--primary-700: #047857;
--primary-800: #065F46;
--primary-900: #064E3B;  /* Text on light */
```

Rationale: Green = health, growth, natural. But not "bright wellness green" - more muted, scientific.

#### Secondary: Neutral Slate
```css
--slate-50:  #F8FAFC;
--slate-100: #F1F5F9;
--slate-200: #E2E8F0;
--slate-300: #CBD5E1;
--slate-400: #94A3B8;
--slate-500: #64748B;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1E293B;
--slate-900: #0F172A;
```

### Semantic Colors

#### Evidence Quality Indicators
```css
--evidence-strong:   #059669;  /* Green - Meta-analyses, RCTs */
--evidence-moderate: #0284C7;  /* Blue - Good observational */
--evidence-limited:  #D97706;  /* Amber - Few studies */
--evidence-weak:     #6B7280;  /* Gray - In-vitro only */
--evidence-none:     #9CA3AF;  /* Light gray - No research */
```

#### Status Colors
```css
--success: #10B981;
--warning: #F59E0B;
--error:   #EF4444;
--info:    #3B82F6;
```

### Color Usage Rules

1. **Don't rely on color alone** - Always pair with icons/text
2. **Test in grayscale** - Should still be usable
3. **Dark mode ready** - Design both themes from start
4. **Colorblind safe** - Test with colorblindness simulators

### Dark Mode Palette
```css
--bg-primary:   #0F172A;  /* Main background */
--bg-secondary: #1E293B;  /* Cards */
--bg-tertiary:  #334155;  /* Elevated surfaces */
--text-primary: #F8FAFC;
--text-secondary: #94A3B8;
```

---

## 🧩 UI Components

### Core Components Library

#### 1. Scan Button (Primary CTA)
```
┌──────────────────┐
│    [Camera]      │
│    Scan          │
└──────────────────┘
- Size: 64x64px minimum
- Position: Center bottom, always visible
- State: Active (pulsing), Scanning (loading)
```

#### 2. Product Card
```
┌─────────────────────────────────────┐
│ [Image]  Product Name               │
│          Brand                      │
│          ─────────────────────────  │
│          ✅ 3 ingredients with      │
│             strong evidence         │
│          ⚠️ 1 needs more research   │
│                          [→ View]   │
└─────────────────────────────────────┘
```

#### 3. Ingredient Row
```
┌─────────────────────────────────────┐
│ ● Sodium Benzoate              [↓]  │
│   Preservative                      │
│   ▓▓▓░░ 12 studies | Moderate       │
└─────────────────────────────────────┘
```

#### 4. Evidence Summary Card
```
┌─────────────────────────────────────┐
│ 📄 What Research Says               │
├─────────────────────────────────────┤
│ "Sodium benzoate at typical dietary │
│ exposure levels shows no adverse    │
│ effects in humans."                 │
│                                     │
│ — Meta-analysis, 2023               │
│   PMID: 12345678  [View Paper →]    │
└─────────────────────────────────────┘
```

#### 5. Evidence Quality Badge
```
Strong    ████████████  (meta-analysis, multiple RCTs)
Moderate  ████████░░░░  (RCTs, large cohort studies)
Limited   █████░░░░░░░  (few studies, small samples)
Weak      ███░░░░░░░░░  (in-vitro only, animal studies)
None      ░░░░░░░░░░░░  (no research found)
```

#### 6. Bottom Navigation
```
┌─────────────────────────────────────┐
│   [Scan]      [History]   [Profile] │
│     ●            ○           ○      │
└─────────────────────────────────────┘
```

### Component States

All interactive components need:
- Default
- Hover (desktop)
- Pressed/Active
- Disabled
- Loading
- Error
- Success

---

## 💾 Data Model

### Core Entities

#### Product
```typescript
interface Product {
  id: string;                    // Internal ID
  barcode: string;               // EAN/UPC
  name: string;
  brand: string;
  imageUrl?: string;
  category: string;
  
  // Nutritional info (from Open Food Facts)
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugar: number;
    // ... more
  };
  
  // Ingredients list
  ingredients: Ingredient[];
  
  // Computed scores (for filtering, not display)
  nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  novaGroup?: 1 | 2 | 3 | 4;
  
  // Metadata
  source: 'open_food_facts' | 'user_contributed';
  lastUpdated: Date;
}
```

#### Ingredient
```typescript
interface Ingredient {
  id: string;
  name: string;                  // Display name
  normalizedName: string;        // Scientific name
  category: IngredientCategory;  // 'additive' | 'nutrient' | 'allergen' | etc
  
  // Evidence summary (cached from RAG)
  evidenceSummary?: EvidenceSummary;
  
  // Papers linked to this ingredient
  papers: PaperReference[];
}

enum IngredientCategory {
  NUTRIENT = 'nutrient',
  ADDITIVE = 'additive',
  PRESERVATIVE = 'preservative',
  COLORANT = 'colorant',
  FLAVOR = 'flavor',
  ALLERGEN = 'allergen',
  OTHER = 'other'
}
```

#### Paper Reference
```typescript
interface PaperReference {
  id: string;
  pmid?: string;                 // PubMed ID
  doi?: string;                  // DOI
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract: string;
  
  // Study characteristics
  studyType: StudyType;
  sampleSize?: number;
  population?: string;           // 'adults' | 'children' | 'animals' | 'in-vitro'
  
  // Relevance to ingredient
  relevanceScore: number;        // 0-1, from embedding similarity
  keyFindings: string[];         // Extracted key points
}

enum StudyType {
  META_ANALYSIS = 'meta_analysis',
  SYSTEMATIC_REVIEW = 'systematic_review',
  RCT = 'randomized_controlled_trial',
  COHORT = 'cohort_study',
  CASE_CONTROL = 'case_control',
  CROSS_SECTIONAL = 'cross_sectional',
  CASE_REPORT = 'case_report',
  IN_VITRO = 'in_vitro',
  ANIMAL = 'animal_study',
  REVIEW = 'review',
  OPINION = 'opinion'
}
```

#### Evidence Summary
```typescript
interface EvidenceSummary {
  ingredientId: string;
  
  // Overall assessment
  evidenceQuality: 'strong' | 'moderate' | 'limited' | 'weak' | 'none';
  totalPapers: number;
  lastUpdated: Date;
  
  // RAG-generated summary (with citations)
  summary: string;
  citations: string[];           // PMIDs/DOIs referenced in summary
  
  // Key points extracted
  keyPoints: {
    finding: string;
    source: string;              // PMID or DOI
    confidence: number;          // 0-1
  }[];
  
  // Dosage context if applicable
  dosageContext?: {
    typicalDietaryExposure: string;
    safeUpperLimit?: string;
    source: string;
  };
}
```

#### User
```typescript
interface User {
  id: string;
  email?: string;
  createdAt: Date;
  
  // Preferences
  preferences: {
    darkMode: boolean;
    notificationsEnabled: boolean;
    showNutritionInfo: boolean;
  };
  
  // Dietary restrictions (for filtering)
  dietaryRestrictions: string[];  // 'vegan', 'gluten-free', etc
  
  // Allergens to highlight
  allergens: string[];
}
```

#### Scan History
```typescript
interface ScanHistory {
  id: string;
  userId: string;
  productId: string;
  scannedAt: Date;
  
  // Denormalized for offline access
  productSnapshot: {
    name: string;
    brand: string;
    imageUrl?: string;
  };
}
```

---

## 🗄️ Database Architecture

### Local Database (SQLite / Realm)

For offline-first capability:

```sql
-- Products (cached from API)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  data JSON,  -- Full product data
  cached_at INTEGER,
  expires_at INTEGER
);

CREATE INDEX idx_products_barcode ON products(barcode);

-- Ingredients (cached)
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT,
  category TEXT,
  evidence_summary JSON,
  cached_at INTEGER
);

-- Papers (metadata only, not full text)
CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  pmid TEXT,
  doi TEXT,
  title TEXT,
  year INTEGER,
  study_type TEXT,
  metadata JSON
);

-- Ingredient-Paper relationships
CREATE TABLE ingredient_papers (
  ingredient_id TEXT,
  paper_id TEXT,
  relevance_score REAL,
  PRIMARY KEY (ingredient_id, paper_id)
);

-- Scan history (local)
CREATE TABLE scan_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  scanned_at INTEGER,
  synced INTEGER DEFAULT 0
);

-- User preferences
CREATE TABLE user_prefs (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Backend Database (PostgreSQL + pgvector)

```sql
-- Full paper content for RAG
CREATE TABLE papers_full (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pmid TEXT UNIQUE,
  doi TEXT,
  title TEXT NOT NULL,
  abstract TEXT,
  full_text TEXT,
  authors JSONB,
  journal TEXT,
  year INTEGER,
  study_type TEXT,
  
  -- Vector embedding for semantic search
  embedding vector(1536),  -- OpenAI ada-002 or similar
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX papers_embedding_idx ON papers_full 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Ingredient knowledge base
CREATE TABLE ingredients_kb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT UNIQUE,
  aliases TEXT[],
  category TEXT,
  
  -- Pre-computed evidence summary
  evidence_quality TEXT,
  summary TEXT,
  key_findings JSONB,
  paper_count INTEGER,
  
  -- Embedding for semantic matching
  embedding vector(1536),
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Cache for product-ingredient mappings
CREATE TABLE product_ingredients (
  product_barcode TEXT,
  ingredient_id UUID REFERENCES ingredients_kb(id),
  position INTEGER,  -- Order in ingredient list
  PRIMARY KEY (product_barcode, ingredient_id)
);
```

### Sync Strategy

1. **Products:** Cache locally, refresh if > 7 days old
2. **Ingredients:** Pre-seed common ingredients, fetch on-demand
3. **Papers:** Metadata cached locally, full text fetched on-demand
4. **Evidence summaries:** Generated server-side, cached aggressively
5. **Scan history:** Write locally first, sync when online

---

## 🔌 API Integration

### External APIs

#### 1. Open Food Facts (FREE, Primary)
- **URL:** https://world.openfoodfacts.org/api/v2
- **Rate limit:** 100 req/min (read), 10 req/min (search)
- **Data:** Product info, ingredients, nutrition, images
- **License:** Open Database License

```typescript
// Example: Get product by barcode
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json

// Response includes:
// - product.product_name
// - product.brands
// - product.ingredients_text
// - product.nutriments
// - product.nutriscore_grade
// - product.nova_group
```

#### 2. PubMed E-Utilities (FREE)
- **URL:** https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
- **Rate limit:** 3 req/sec (with API key: 10 req/sec)
- **Data:** Paper metadata, abstracts

```typescript
// Search for papers
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
  ?db=pubmed
  &term=sodium+benzoate+safety+human
  &retmax=20
  &retmode=json

// Fetch paper details
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
  ?db=pubmed
  &id=12345678,23456789
  &retmode=xml
```

#### 3. Semantic Scholar (FREE tier generous)
- **URL:** https://api.semanticscholar.org/graph/v1
- **Rate limit:** 100 req/sec
- **Data:** Papers, citations, TLDR summaries

#### 4. PubMed Central (FREE, Open Access full text)
- **URL:** https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi
- **Data:** Full text for open access papers

### Internal API Design

#### Endpoints

```
GET  /api/v1/products/{barcode}
     → Returns product info + ingredient analysis

GET  /api/v1/ingredients/{id}
     → Returns ingredient details + evidence summary

GET  /api/v1/ingredients/{id}/papers
     → Returns relevant papers for ingredient

POST /api/v1/ingredients/{id}/ask
     → RAG-powered Q&A about ingredient
     Body: { "question": "Is this safe for children?" }

GET  /api/v1/scan-history
     → User's scan history

POST /api/v1/scan-history
     → Log a scan
```

---

## 🛠️ Technical Stack

### Mobile App

#### Option A: React Native (Recommended)
```
Framework:     React Native + Expo
Navigation:    React Navigation v6
State:         Zustand (simple) or TanStack Query (server state)
Local DB:      expo-sqlite or WatermelonDB
Styling:       NativeWind (Tailwind for RN)
Camera:        expo-camera + expo-barcode-scanner
```

**Pros:**
- Faster development
- Code sharing with potential web app
- Large ecosystem
- You're familiar with React

#### Option B: Flutter
```
Framework:     Flutter
State:         Riverpod or Bloc
Local DB:      Drift (SQLite) or Hive
Camera:        mobile_scanner package
```

**Pros:**
- Better performance
- More consistent UI across platforms
- Growing ecosystem

### Backend

```
Framework:     FastAPI (Python)
Database:      PostgreSQL + pgvector (Supabase)
Cache:         Redis
Search:        pgvector for semantic search
LLM:           Claude API (Anthropic)
Hosting:       Railway / Fly.io / Render
```

### Recommended Stack

```
┌─────────────────────────────────────────────────────┐
│                    MOBILE APP                        │
│  React Native + Expo + NativeWind + expo-sqlite     │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND API                       │
│            FastAPI + PostgreSQL + pgvector          │
│                   (Supabase)                        │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ Open Food   │ │   PubMed    │ │   Claude    │
   │   Facts     │ │   E-Utils   │ │    API      │
   └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 📊 Competitive Analysis

### Feature Comparison

| Feature | Yuka | Nutriproof (Planned) |
|---------|------|---------------------|
| Barcode scan | ✅ | ✅ |
| Ingredient list | ✅ | ✅ |
| Nutrition facts | ✅ | ✅ |
| Scoring system | 0-100 (arbitrary) | Evidence quality ratings |
| Source transparency | ❌ Vague | ✅ Direct paper links |
| Additive analysis | Fear-based | Science-based |
| Q&A feature | ❌ | ✅ RAG-powered |
| Offline mode | Partial | ✅ Full |
| Alternative suggestions | ✅ | ✅ (evidence-based) |
| Price | Free + $14.99/yr | TBD |

### Positioning

**Yuka:** "Is this healthy? Good/Bad rating"
**Nutriproof:** "What does research say about this? Here are the papers"

### Differentiation Strategy

1. **Trust through transparency** - Every claim citable
2. **Education over judgment** - Empower, don't scare
3. **Real science** - Peer-reviewed papers, not blogs
4. **No hallucination** - RAG-only responses

---

## 📝 Next Steps

### Phase 1: Foundation (Week 1-2)
- [ ] Set up React Native + Expo project
- [ ] Implement barcode scanner
- [ ] Integrate Open Food Facts API
- [ ] Create basic product display UI
- [ ] Set up Supabase (PostgreSQL + pgvector)

### Phase 2: RAG Pipeline (Week 3-4)
- [ ] Build PubMed search integration
- [ ] Create paper ingestion pipeline
- [ ] Set up vector embeddings
- [ ] Implement RAG prompts with Claude
- [ ] Build evidence summary generation

### Phase 3: Polish (Week 5-6)
- [ ] Implement full design system
- [ ] Add offline support
- [ ] Build onboarding flow
- [ ] Add scan history
- [ ] Performance optimization

### Phase 4: Launch Prep (Week 7-8)
- [ ] Beta testing
- [ ] App store assets
- [ ] Landing page
- [ ] Launch on Product Hunt

---

*Document Version: 1.0*
*Last Updated: 2026-02-01*
