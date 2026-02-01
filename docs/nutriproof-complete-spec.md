# Nutriproof - Complete Product Specification

*Created: 2026-02-01*
*Version: 2.0 - Expanded with Brand Character, User Journeys, and Technical Deep Dive*

---

## 📋 Table of Contents

1. [Brand Identity & Mascot](#brand-identity--mascot)
2. [Visual Design Language](#visual-design-language)
3. [Required Visual Assets](#required-visual-assets)
4. [User Journeys & Flows](#user-journeys--flows)
5. [Empty States & Loading States](#empty-states--loading-states)
6. [Data & Caching Strategy](#data--caching-strategy)
7. [Offline-First Architecture](#offline-first-architecture)
8. [RAG System Design](#rag-system-design)
9. [Screen-by-Screen Specification](#screen-by-screen-specification)

---

## 🐕 Brand Identity & Mascot

### Meet "Sniff" - The Science Dog

**Character Concept:**
A friendly, curious dog wearing lab goggles and a lab coat. He "sniffs out" the truth about food ingredients by reading scientific papers. Not judgmental - just curious and helpful.

**Personality Traits:**
- 🔬 **Curious** - Always wants to learn more
- 🤓 **Nerdy** - Loves reading papers
- 😊 **Friendly** - Never scary or preachy
- 🐕 **Playful** - Brings joy to learning

**Visual Style:**
- Simple, flat illustration style
- 2D vector (SVG for scalability)
- Limited color palette (matches app colors)
- Expressive but minimal details
- Works at small sizes (icons) and large (empty states)

### Mascot Poses Library

| Pose | Use Case | Description |
|------|----------|-------------|
| **Sniffing** | Scanning/Loading | Nose to barcode, tail wagging |
| **Reading** | Analyzing | Wearing glasses, holding paper |
| **Celebrating** | Success/Complete | Happy jump, papers flying |
| **Confused** | Error/Not Found | Head tilt, question mark |
| **Sleeping** | Empty History | Curled up with papers |
| **Searching** | No Results | Looking through magnifying glass |
| **Waving** | Onboarding/Welcome | Friendly wave, lab coat |
| **Pointing** | CTA/Guidance | Pointing at action button |
| **Thinking** | Processing | Paw on chin, thought bubble |
| **Excited** | New Discovery | Eyes wide, tail blur |

### Mascot Design Specifications

```
Base Size: 200x200px (scalable SVG)
Colors: 
  - Body: #8B5A2B (warm brown)
  - Lab coat: #FFFFFF
  - Goggles: #10B981 (primary green)
  - Accents: #F59E0B (amber highlights)
  
Line weight: 2px at base size
Style: Rounded corners, friendly shapes
Export formats: SVG (primary), PNG @1x, @2x, @3x
```

### Character Voice (Microcopy)

Sniff "speaks" through the app's microcopy:

| Context | Example Copy |
|---------|--------------|
| Loading | "Sniffing through the research..." |
| Found results | "Found 12 papers! Let me summarize..." |
| No results | "Hmm, I couldn't find papers on this one." |
| Error | "Oops! My nose isn't working right now." |
| Empty history | "No scans yet! Let's sniff something out." |
| Success | "All done! Here's what the science says." |
| Offline | "I'm offline, but I remember some things!" |

---

## 🎨 Visual Design Language

### Design Philosophy: "Scientific Minimalism"

Inspired by Apple Notes, Bear, and Things 3:
- **Clean & Calm** - Lots of white space
- **Content-First** - Data is the hero, not decoration
- **Subtle Depth** - Light shadows, not flat
- **Warm Neutrals** - Not cold/clinical
- **Purposeful Color** - Color means something

### Color System (Expanded)

#### Primary Palette
```css
/* Brand Green - Trust, Health, Science */
--green-50:  #ECFDF5;
--green-100: #D1FAE5;
--green-200: #A7F3D0;
--green-300: #6EE7B7;
--green-400: #34D399;
--green-500: #10B981;  /* Primary */
--green-600: #059669;
--green-700: #047857;
--green-800: #065F46;
--green-900: #064E3B;
```

#### Neutral Palette (Warm)
```css
/* Warm grays - not cold/blue */
--stone-50:  #FAFAF9;  /* Background */
--stone-100: #F5F5F4;
--stone-200: #E7E5E4;
--stone-300: #D6D3D1;
--stone-400: #A8A29E;
--stone-500: #78716C;
--stone-600: #57534E;
--stone-700: #44403C;
--stone-800: #292524;
--stone-900: #1C1917;  /* Text */
```

#### Semantic Colors
```css
/* Evidence Quality */
--evidence-strong:   #059669;  /* Green */
--evidence-moderate: #0284C7;  /* Blue */
--evidence-limited:  #D97706;  /* Amber */
--evidence-weak:     #78716C;  /* Gray */
--evidence-none:     #A8A29E;  /* Light gray */

/* Status */
--success: #10B981;
--warning: #F59E0B;
--error:   #EF4444;
--info:    #3B82F6;
```

### Typography System

**Font Stack:**
```css
--font-sans: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;
```

**Scale (iOS-inspired):**
```css
--text-xs:   12px / 1.33;  /* Caption */
--text-sm:   14px / 1.43;  /* Small body */
--text-base: 17px / 1.47;  /* Body (iOS default) */
--text-lg:   20px / 1.40;  /* Large body */
--text-xl:   22px / 1.36;  /* Title 3 */
--text-2xl:  28px / 1.29;  /* Title 2 */
--text-3xl:  34px / 1.24;  /* Title 1 */
--text-4xl:  40px / 1.20;  /* Large Title */
```

### Spacing System

Based on 4px grid (Apple standard):
```css
--space-0:  0;
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Component Styling

**Cards:**
```css
.card {
  background: var(--stone-50);
  border: 1px solid var(--stone-200);
  border-radius: 12px;
  padding: var(--space-4);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
```

**Buttons:**
```css
.button-primary {
  background: var(--green-500);
  color: white;
  border-radius: 10px;
  padding: 12px 20px;
  font-weight: 600;
}

.button-secondary {
  background: var(--stone-100);
  color: var(--stone-900);
  border-radius: 10px;
  padding: 12px 20px;
}
```

---

## 🖼️ Required Visual Assets

### App Icon

| Platform | Size | Notes |
|----------|------|-------|
| iOS App Store | 1024×1024 | No transparency, no rounded corners |
| iOS Home | 180×180 (@3x) | Rounded by system |
| iOS Spotlight | 120×120 (@3x) | |
| iOS Settings | 87×87 (@3x) | |
| Android Play Store | 512×512 | |
| Android Adaptive | 108×108 (foreground) | With safe zone |
| Favicon | 32×32, 16×16 | |

**Icon Design:**
- Sniff's face in a simple, recognizable form
- Green background (#10B981)
- White/cream dog silhouette
- Lab goggles as accent
- Works at 16px

### Splash Screen

| Platform | Sizes |
|----------|-------|
| iOS | 1125×2436, 1242×2688, 828×1792, 750×1334 |
| Android | xxxhdpi (1280×1920), xxhdpi (960×1600), xhdpi (640×960) |

**Design:**
- Centered Sniff logo
- White/cream background
- Subtle "Sniffing..." text (optional)

### Mascot Illustration Set (SVG)

1. **sniff-welcome.svg** - Full body wave (onboarding)
2. **sniff-scanning.svg** - Sniffing barcode
3. **sniff-reading.svg** - Reading papers
4. **sniff-success.svg** - Celebrating
5. **sniff-error.svg** - Confused/sad
6. **sniff-empty.svg** - Sleeping on papers
7. **sniff-searching.svg** - With magnifying glass
8. **sniff-offline.svg** - With "no wifi" symbol
9. **sniff-thinking.svg** - Processing/loading
10. **sniff-pointing.svg** - Directing to CTA

### Icons (SF Symbols or Custom)

```
Scan:      barcode.viewfinder
History:   clock.arrow.circlepath
Profile:   person.circle
Search:    magnifyingglass
Settings:  gearshape
Back:      chevron.left
Forward:   chevron.right
Expand:    chevron.down
Close:     xmark
Share:     square.and.arrow.up
Favorite:  heart / heart.fill
Filter:    line.3.horizontal.decrease
```

### Evidence Quality Icons

Custom icons for evidence levels:
- **Strong:** Triple checkmark or shield
- **Moderate:** Double checkmark
- **Limited:** Single checkmark with question
- **Weak:** Question mark
- **None:** Empty circle

### App Store Assets

| Asset | Size | Quantity |
|-------|------|----------|
| Screenshots (iPhone) | 1284×2778 | 5-10 |
| Screenshots (iPad) | 2048×2732 | 5-10 |
| Preview video | 1920×1080 | 1 (optional) |
| Feature graphic (Android) | 1024×500 | 1 |

---

## 🗺️ User Journeys & Flows

### Journey 1: First-Time User

```
┌─────────────────────────────────────────────────────────────┐
│ AWARENESS                                                    │
│ User hears about app (friend, article, app store search)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ CONSIDERATION                                                │
│ Reads app store description, sees screenshots                │
│ Key question: "Will this actually tell me real science?"    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ DOWNLOAD                                                     │
│ Downloads app (free)                                        │
│ Emotional state: Curious, hopeful                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING (60 seconds max)                                 │
│ 1. Welcome screen with Sniff                                │
│ 2. Value prop (1-3 swipeable screens, skippable)            │
│ 3. Camera permission                                        │
│ 4. First scan immediately                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FIRST VALUE (AHA MOMENT!) 🎯                                │
│ User scans first product                                    │
│ Sees real paper citations for the first time                │
│ "Wow, this actually shows me the research!"                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ACTIVATION                                                   │
│ Scans 3+ products in first session                          │
│ User is "activated" - sees ongoing value                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ RETENTION                                                    │
│ Creates account (to save history)                           │
│ Returns next time shopping                                  │
│ Recommends to friend                                        │
└─────────────────────────────────────────────────────────────┘
```

### Journey 2: Regular User (Weekly Shopping)

```
TRIGGER: At grocery store
    │
    ▼
Opens app → Camera ready instantly
    │
    ▼
Scans item → Results in <2 seconds
    │
    ├─── QUICK PATH: Glances at summary, moves on
    │
    └─── DEEP PATH: Taps ingredient → Reads papers → Maybe asks question
    │
    ▼
Scans 5-15 items during trip
    │
    ▼
Closes app → History saved automatically
```

### Journey 3: Research Mode (At Home)

```
TRIGGER: Curious about specific ingredient/product
    │
    ▼
Opens app → Goes to History or Search
    │
    ▼
Finds product → Taps into ingredient
    │
    ▼
Reads evidence summary
    │
    ▼
Taps "Ask a Question" → Types question
    │
    ▼
Gets RAG-powered answer with citations
    │
    ▼
Taps paper link → Opens in browser
    │
    ▼
Shares finding with family/friends
```

### User Flow Diagram: Core Scan Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│  Home   │────▶│   Scanner   │────▶│   Loading   │
└─────────┘     └─────────────┘     └─────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
            │   Product   │        │  Not Found  │        │    Error    │
            │   Results   │        │   Screen    │        │   Screen    │
            └─────────────┘        └─────────────┘        └─────────────┘
                    │                      │
                    ▼                      ▼
            ┌─────────────┐        ┌─────────────┐
            │ Ingredient  │        │  Add New    │
            │   Detail    │        │   Product   │
            └─────────────┘        └─────────────┘
                    │
                    ▼
            ┌─────────────┐
            │    Paper    │
            │    List     │
            └─────────────┘
                    │
                    ▼
            ┌─────────────┐
            │  External   │
            │   Browser   │
            └─────────────┘
```

---

## 🎭 Empty States & Loading States

### Empty States with Sniff

#### No Scan History
```
┌─────────────────────────────────────────┐
│                                         │
│         [sniff-sleeping.svg]            │
│         (Sniff curled up on papers)     │
│                                         │
│     "No scans yet!"                     │
│     Let's sniff out some ingredients.   │
│                                         │
│         [Scan Something]                │
│                                         │
└─────────────────────────────────────────┘
```

#### No Search Results
```
┌─────────────────────────────────────────┐
│                                         │
│        [sniff-searching.svg]            │
│        (Sniff with magnifying glass)    │
│                                         │
│     "Couldn't find that one"            │
│     Try a different search term.        │
│                                         │
└─────────────────────────────────────────┘
```

#### Product Not in Database
```
┌─────────────────────────────────────────┐
│                                         │
│         [sniff-confused.svg]            │
│         (Sniff with head tilt)          │
│                                         │
│     "This product is new to me!"        │
│     Want to help add it?                │
│                                         │
│         [Add Product Info]              │
│         [Scan Something Else]           │
│                                         │
└─────────────────────────────────────────┘
```

#### No Internet Connection
```
┌─────────────────────────────────────────┐
│                                         │
│         [sniff-offline.svg]             │
│         (Sniff with wifi-off badge)     │
│                                         │
│     "I'm offline right now"             │
│     But I remember your recent scans!   │
│                                         │
│         [View Cached Products]          │
│                                         │
└─────────────────────────────────────────┘
```

#### No Papers Found for Ingredient
```
┌─────────────────────────────────────────┐
│                                         │
│         [sniff-thinking.svg]            │
│         (Sniff with thought bubble)     │
│                                         │
│     "No research found"                 │
│     I couldn't find papers on this      │
│     specific ingredient yet.            │
│                                         │
│     This doesn't mean it's good or bad  │
│     — just that more research is needed.│
│                                         │
└─────────────────────────────────────────┘
```

### Loading States

#### Scanning (< 2 seconds)
```
┌─────────────────────────────────────────┐
│                                         │
│    [sniff-scanning.svg - animated]      │
│    (Sniff's nose wiggling)              │
│                                         │
│    "Sniffing..."                        │
│                                         │
│    [Subtle progress indicator]          │
│                                         │
└─────────────────────────────────────────┘
```

#### Analyzing Ingredients (2-5 seconds)
```
┌─────────────────────────────────────────┐
│                                         │
│    [sniff-reading.svg - animated]       │
│    (Papers shuffling)                   │
│                                         │
│    "Reading through the research..."    │
│    Found 24 papers so far               │
│                                         │
│    [Progress bar: ████████░░░░ 67%]     │
│                                         │
└─────────────────────────────────────────┘
```

#### Asking Question (RAG processing)
```
┌─────────────────────────────────────────┐
│                                         │
│    [sniff-thinking.svg - animated]      │
│    (Thought bubbles appearing)          │
│                                         │
│    "Let me check the papers..."         │
│                                         │
│    [Typing indicator dots]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💾 Data & Caching Strategy

### What Data We Store

#### Tier 1: Always Cached (Local SQLite)
| Data | Reason | TTL |
|------|--------|-----|
| User's scan history | Core feature, works offline | Forever |
| Recently scanned products | Quick re-access | 30 days |
| Ingredient evidence summaries | Expensive to generate | 7 days |
| User preferences | UX consistency | Forever |

#### Tier 2: Cached on First Access
| Data | Reason | TTL |
|------|--------|-----|
| Product details | Avoid repeat API calls | 7 days |
| Paper metadata | Quick reference | 30 days |
| Popular products | Pre-warm cache | 1 day |

#### Tier 3: Never Cached Locally
| Data | Reason |
|------|--------|
| Full paper text | Too large, copyright |
| User auth tokens | Security |
| Other users' data | Privacy |

### Caching Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER ACTION                          │
│                        (Scan Barcode)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      1. CHECK LOCAL CACHE                    │
│                         (SQLite DB)                          │
│                                                              │
│   Product in cache? ─────────────────────────────▶ YES ────┐ │
│         │                                                  │ │
│         NO                                                 │ │
│         │                                                  │ │
│         ▼                                                  │ │
│   Is cache expired?                                        │ │
│         │                                                  │ │
│        YES ────▶ Fetch new, update cache                   │ │
│                                                            │ │
└────────────────────────────────────────────────────────────┼─┘
                                                             │
                              ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                    2. RETURN CACHED DATA                     │
│                   (Instant, < 50ms)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              3. BACKGROUND REFRESH (if stale)                │
│                                                              │
│   If cache > 12 hours old:                                  │
│   - Fetch fresh data in background                          │
│   - Update cache silently                                   │
│   - Show "Updated" badge if data changed                    │
└─────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Rules

```javascript
const CACHE_CONFIG = {
  products: {
    ttl: 7 * 24 * 60 * 60 * 1000,      // 7 days
    staleWhileRevalidate: true,
    maxEntries: 1000,
  },
  ingredients: {
    ttl: 7 * 24 * 60 * 60 * 1000,      // 7 days
    staleWhileRevalidate: true,
    maxEntries: 5000,
  },
  evidenceSummaries: {
    ttl: 7 * 24 * 60 * 60 * 1000,      // 7 days
    staleWhileRevalidate: true,
    maxEntries: 5000,
  },
  papers: {
    ttl: 30 * 24 * 60 * 60 * 1000,     // 30 days (rarely change)
    staleWhileRevalidate: false,
    maxEntries: 10000,
  },
  scanHistory: {
    ttl: Infinity,                      // Never expire
    maxEntries: Infinity,
  },
};
```

### Local Database Schema (SQLite)

```sql
-- Products cache
CREATE TABLE products_cache (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  data JSON NOT NULL,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  access_count INTEGER DEFAULT 1,
  last_accessed INTEGER
);

CREATE INDEX idx_products_expires ON products_cache(expires_at);
CREATE INDEX idx_products_accessed ON products_cache(last_accessed);

-- Ingredients cache  
CREATE TABLE ingredients_cache (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT,
  evidence_summary JSON,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Papers cache (metadata only)
CREATE TABLE papers_cache (
  pmid TEXT PRIMARY KEY,
  doi TEXT,
  title TEXT NOT NULL,
  authors JSON,
  journal TEXT,
  year INTEGER,
  study_type TEXT,
  abstract TEXT,
  cached_at INTEGER NOT NULL
);

-- User's scan history (never expires, syncs to cloud)
CREATE TABLE scan_history (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT,
  scanned_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (barcode) REFERENCES products_cache(barcode)
);

CREATE INDEX idx_history_date ON scan_history(scanned_at DESC);

-- Pending sync queue
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,  -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data JSON,
  created_at INTEGER NOT NULL,
  attempts INTEGER DEFAULT 0,
  last_attempt INTEGER
);
```

---

## 📡 Offline-First Architecture

### Offline Capabilities

| Feature | Offline Behavior |
|---------|------------------|
| View scan history | ✅ Full access |
| View cached products | ✅ Full access |
| Scan new product | ⚠️ Works if in cache, queues if not |
| View evidence summaries | ⚠️ Only if cached |
| Ask questions (RAG) | ❌ Requires internet |
| View full papers | ❌ Requires internet |

### Sync Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    OFFLINE OPERATION                         │
│                                                              │
│  1. User scans product                                      │
│  2. Check local cache → Found? Show cached data             │
│  3. Not found? Queue the request:                           │
│     - Save barcode to "pending_scans" table                 │
│     - Show: "I'll look this up when I'm online"            │
│     - Save to history with "pending" flag                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Network restored
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SYNC WHEN ONLINE                          │
│                                                              │
│  1. Process sync_queue in order                             │
│  2. For each pending scan:                                  │
│     - Fetch product from API                                │
│     - Generate evidence summaries                           │
│     - Update local cache                                    │
│     - Mark as synced                                        │
│  3. Upload any local-only data to cloud                     │
│  4. Pull any cloud changes to local                         │
│                                                              │
│  CONFLICT RESOLUTION: Last-write-wins for most data         │
│  (User's history is append-only, no conflicts)              │
└─────────────────────────────────────────────────────────────┘
```

### Network State Management

```typescript
// Network state types
type NetworkState = 'online' | 'offline' | 'slow';

// Monitor network status
const useNetworkState = () => {
  const [state, setState] = useState<NetworkState>('online');
  
  useEffect(() => {
    // Check initial state
    setState(navigator.onLine ? 'online' : 'offline');
    
    // Listen for changes
    const handleOnline = () => setState('online');
    const handleOffline = () => setState('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return state;
};
```

### When to Sync

| Trigger | Action |
|---------|--------|
| App opens (online) | Sync pending items, pull updates |
| Network restored | Sync pending items immediately |
| User explicitly refreshes | Full sync |
| Every 15 minutes (if online) | Background sync of pending items |
| Before app closes | Attempt quick sync |

---

## 🤖 RAG System Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER QUESTION                           │
│              "Is sodium benzoate safe for kids?"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   1. QUERY UNDERSTANDING                     │
│                                                              │
│   Extract:                                                  │
│   - Ingredient: "sodium benzoate"                           │
│   - Topic: "safety"                                         │
│   - Context: "children"                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. CHECK CACHE                            │
│                                                              │
│   Hash query → Check Redis/local cache                      │
│   If hit & fresh → Return cached response                   │
│   Cache TTL: 1 hour for identical queries                   │
└─────────────────────────────────────────────────────────────┘
                              │ Cache miss
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  3. EMBEDDING GENERATION                     │
│                                                              │
│   Generate embedding for query                              │
│   Model: text-embedding-3-small (OpenAI)                    │
│   Cache embedding for 1 hour                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   4. VECTOR SEARCH                           │
│                                                              │
│   Query pgvector for similar papers:                        │
│   - Filter by ingredient (sodium benzoate)                  │
│   - Filter by topic (safety, toxicology)                    │
│   - Boost recent papers (last 5 years)                      │
│   - Boost meta-analyses and RCTs                            │
│   - Return top 10 most relevant                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  5. CONTEXT ASSEMBLY                         │
│                                                              │
│   For each paper:                                           │
│   - Include: title, year, study_type, abstract              │
│   - Limit: ~500 tokens per paper                            │
│   - Total context: ~5000 tokens max                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    6. LLM GENERATION                         │
│                                                              │
│   System prompt: (see below)                                │
│   User: Question + Retrieved papers                         │
│   Model: Claude 3.5 Sonnet                                  │
│   Temperature: 0.3 (factual)                                │
│   Max tokens: 500                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   7. RESPONSE + CACHE                        │
│                                                              │
│   - Extract citations from response                         │
│   - Validate PMIDs mentioned exist in retrieved set         │
│   - Cache response for 1 hour                               │
│   - Return to user                                          │
└─────────────────────────────────────────────────────────────┘
```

### RAG System Prompt

```
You are Sniff, a friendly science dog assistant for the Nutriproof app.
Your job is to summarize what scientific research says about food ingredients.

CRITICAL RULES:
1. ONLY cite information from the papers provided below
2. Always include PMID or DOI for every claim
3. If the papers don't address the question, say "The research I found doesn't specifically address this"
4. NEVER make up information not in the papers
5. Present findings neutrally - don't say things are "good" or "bad"
6. Note the quality of evidence (meta-analysis vs single study)
7. If studies disagree, present both perspectives
8. Be concise - 2-3 paragraphs max

FORMAT:
- Start with a direct answer to the question
- Support with specific findings and citations
- Note any limitations or gaps in the research
- Use friendly but scientific language

USER QUESTION: {question}

RETRIEVED PAPERS:
{papers_context}

Respond as Sniff would - helpful, friendly, but always accurate.
```

### RAG Caching Strategy

| Cache Level | What | TTL | Storage |
|-------------|------|-----|---------|
| Query cache | Full question → Full response | 1 hour | Redis |
| Embedding cache | Query text → Vector | 1 hour | Redis |
| Search results | Query embedding → Paper IDs | 15 min | Redis |
| Paper chunks | Paper ID → Processed chunks | 7 days | PostgreSQL |

### Evidence Quality Scoring

```typescript
const getEvidenceQuality = (papers: Paper[]): EvidenceQuality => {
  // Count by study type
  const counts = {
    metaAnalysis: papers.filter(p => p.studyType === 'meta_analysis').length,
    rct: papers.filter(p => p.studyType === 'rct').length,
    cohort: papers.filter(p => p.studyType === 'cohort').length,
    other: papers.filter(p => !['meta_analysis', 'rct', 'cohort'].includes(p.studyType)).length,
  };
  
  // Score based on pyramid of evidence
  if (counts.metaAnalysis >= 1 && papers.length >= 5) return 'strong';
  if (counts.rct >= 2 || (counts.metaAnalysis >= 1)) return 'moderate';
  if (papers.length >= 3) return 'limited';
  if (papers.length >= 1) return 'weak';
  return 'none';
};
```

---

## 📱 Screen-by-Screen Specification

### Screen 1: Home / Scanner

```
┌─────────────────────────────────────────┐
│ ◀                     Nutriproof     ⚙️ │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  │      [Camera Viewfinder]        │   │
│  │                                 │   │
│  │    ┌─────────────────────┐      │   │
│  │    │    Scan Target      │      │   │
│  │    └─────────────────────┘      │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│   Point at a barcode to scan           │
│                                         │
│   ┌────────┐ ┌────────┐ ┌────────┐    │
│   │Recent 1│ │Recent 2│ │Recent 3│    │
│   └────────┘ └────────┘ └────────┘    │
│                                         │
├─────────────────────────────────────────┤
│   [Scan]        [History]    [Profile] │
│     ●              ○            ○      │
└─────────────────────────────────────────┘
```

### Screen 2: Product Results

```
┌─────────────────────────────────────────┐
│ ◀ Back                          Share ↗ │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────┐  Cheerios Original              │
│ │     │  General Mills                  │
│ │ IMG │                                 │
│ └─────┘  Scanned just now               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ EVIDENCE SUMMARY                        │
│ ─────────────────                       │
│                                         │
│ ✅ Whole Grain Oats                     │
│    Strong evidence • 12 papers          │
│                                     ▶   │
│                                         │
│ ℹ️ Added Sugar (9g)                     │
│    Moderate evidence • 8 papers         │
│                                     ▶   │
│                                         │
│ ❓ Tripotassium Phosphate               │
│    Limited research • 2 papers          │
│                                     ▶   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ 💬 Ask a question about this product    │
│    ┌─────────────────────────────────┐  │
│    │ Type your question...           │  │
│    └─────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ NUTRITION FACTS                    ▼    │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 3: Ingredient Detail

```
┌─────────────────────────────────────────┐
│ ◀ Cheerios                              │
├─────────────────────────────────────────┤
│                                         │
│ Sodium Benzoate                         │
│ Preservative                            │
│                                         │
│ ████████░░  Moderate Evidence           │
│             Based on 8 papers           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ WHAT RESEARCH SAYS                      │
│ ──────────────────                      │
│                                         │
│ "Sodium benzoate at typical dietary     │
│ exposure levels (0-5 mg/kg body weight) │
│ shows no adverse effects in humans      │
│ according to EFSA safety assessments."  │
│                                         │
│ Key findings:                           │
│ • Safe at current usage levels [1]      │
│ • May cause reactions in sensitive      │
│   individuals when combined with        │
│   certain colorants [2]                 │
│ • More research needed on long-term     │
│   effects in children [3]               │
│                                         │
│ [1] EFSA 2016  [2] McCann 2007          │
│ [3] Beezhold 2012                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ VIEW PAPERS (8)                    ▼    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Assessment of dietary exposure to  │ │
│ │ sodium benzoate E211 in the...     │ │
│ │ EFSA • 2016 • Meta-analysis        │ │
│ │                              View → │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Food additives and hyperactive     │ │
│ │ behaviour in children...           │ │
│ │ Lancet • 2007 • RCT                │ │
│ │                              View → │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 4: History

```
┌─────────────────────────────────────────┐
│           History                    🔍 │
├─────────────────────────────────────────┤
│                                         │
│ TODAY                                   │
│ ─────                                   │
│                                         │
│ ┌─────┐  Cheerios Original              │
│ │ IMG │  General Mills                  │
│ └─────┘  2 minutes ago              ▶   │
│                                         │
│ ┌─────┐  Organic Valley Milk            │
│ │ IMG │  Organic Valley                 │
│ └─────┘  15 minutes ago             ▶   │
│                                         │
│ YESTERDAY                               │
│ ─────────                               │
│                                         │
│ ┌─────┐  KIND Bar Almond                │
│ │ IMG │  KIND                           │
│ └─────┘  Yesterday at 3:42 PM       ▶   │
│                                         │
│ ┌─────┐  Ritz Crackers                  │
│ │ IMG │  Nabisco                        │
│ └─────┘  Yesterday at 3:38 PM       ▶   │
│                                         │
│ LAST WEEK                               │
│ ─────────                               │
│                                         │
│ ...                                     │
│                                         │
├─────────────────────────────────────────┤
│   [Scan]        [History]    [Profile] │
│     ○              ●            ○      │
└─────────────────────────────────────────┘
```

---

## 📝 Summary Checklist

### Visual Assets Needed
- [ ] App icon (all sizes)
- [ ] Splash screen (all sizes)
- [ ] Sniff mascot poses (10 SVGs)
- [ ] Evidence quality icons
- [ ] App store screenshots
- [ ] Empty state illustrations
- [ ] Loading animations

### Data Architecture
- [ ] SQLite schema finalized
- [ ] PostgreSQL + pgvector setup
- [ ] Caching rules implemented
- [ ] Sync queue logic
- [ ] Offline detection

### RAG System
- [ ] PubMed ingestion pipeline
- [ ] Embedding generation
- [ ] Vector search optimization
- [ ] Prompt engineering
- [ ] Response caching
- [ ] Citation validation

### User Flows
- [ ] Onboarding implemented
- [ ] Core scan flow
- [ ] Ingredient detail
- [ ] Q&A feature
- [ ] History view
- [ ] Offline states

---

*Document Version: 2.0*
*Last Updated: 2026-02-01*
