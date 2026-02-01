# 🐕 Nutriproof

**Science-based food scanner that shows you the evidence, not arbitrary scores.**

Unlike Yuka and similar apps that use opaque scoring systems, Nutriproof gives you direct access to scientific research about what's in your food. Every claim is backed by real papers with citations.

---

## 🎯 What It Does

1. **Scan** any product barcode
2. **See** ingredients, nutrition facts, additives, allergens
3. **Tap** any ingredient to view scientific research
4. **Contribute** missing product data to help others

---

## ✨ Features

### 📷 Barcode Scanner
- Scans EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39
- Instant product lookup from Open Food Facts (2.5M+ products)
- Local caching (no repeated API calls)

### 🔬 Science-Backed Research
- **PubMed** - 35M+ peer-reviewed biomedical papers
- **Semantic Scholar** - 200M papers with AI-generated TLDR summaries
- **Regulatory sources** - FDA, EFSA, WHO data
- Evidence quality ratings (High/Medium/Low confidence)

### 👥 Community Contributions
- Add missing products by photographing ingredient labels
- OCR text extraction (development build)
- Manual ingredient entry (Expo Go)
- Crowdsourced database grows with each user

### 📊 What You See For Each Product
- Product name, brand, image
- Full ingredient list (tap any for research)
- Nutrition facts per 100g
- Additives with E-numbers
- Allergen warnings
- "Cached" badge for offline-available products

### 🔬 What You See For Each Ingredient
- Safety rating based on evidence
- Key findings from research
- Regulatory status (FDA/EFSA/WHO reviewed)
- Individual paper cards with:
  - Title, authors, journal
  - TLDR summary (when available)
  - Citation count
  - Confidence score
  - Direct link to paper

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile App** | React Native + Expo SDK 54 |
| **Language** | TypeScript |
| **Scanner** | expo-camera |
| **Local DB** | expo-sqlite |
| **Cloud DB** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **Product API** | Open Food Facts |
| **Research APIs** | PubMed E-Utilities, Semantic Scholar |
| **Web Search** | Exa AI (optional) |

---

## 📁 Project Structure

```
nutriproof-app/
├── App.tsx                      # Main app + navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Recent scans list
│   │   ├── ScannerScreen.tsx    # Barcode camera
│   │   ├── ProductScreen.tsx    # Product details
│   │   ├── ContributeScreen.tsx # Add missing data
│   │   └── EvidenceScreen.tsx   # Scientific research
│   ├── services/
│   │   ├── openFoodFacts.ts     # Product API
│   │   ├── database.ts          # SQLite cache
│   │   ├── productService.ts    # Cache-first lookup
│   │   ├── supabaseService.ts   # Community DB
│   │   ├── ocrService.ts        # Text recognition
│   │   ├── pubmedService.ts     # PubMed API
│   │   ├── semanticScholarService.ts  # S2 API
│   │   ├── webSearchService.ts  # Exa search
│   │   └── researchPipeline.ts  # Evidence aggregation
│   └── types/
│       └── product.ts           # TypeScript interfaces
├── supabase/
│   └── schema.sql               # Database schema
└── assets/                      # App icons (TBD)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo Go app on your phone
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/shafeiclawdbot-ops/Nutriproof.git
cd Nutriproof

# Install dependencies
yarn install

# Start development server
npx expo start
```

### Running on Device
1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code shown in terminal
3. App loads on your phone!

### Environment Variables (optional)
Create `.env` for enhanced features:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_EXA_API_KEY=your-exa-key
```

---

## 📱 Screenshots

*Coming soon - dog scientist mascot in action!*

---

## 🗺 Roadmap

### ✅ Phase 1: MVP (Complete)
- [x] Barcode scanning
- [x] Open Food Facts integration
- [x] Local SQLite caching
- [x] Product details display
- [x] Recent scans history

### ✅ Phase 2: Science Layer (Complete)
- [x] PubMed API integration
- [x] Semantic Scholar API
- [x] Evidence aggregation
- [x] Research UI

### ✅ Phase 3: Community (Complete)
- [x] Supabase backend
- [x] User contributions
- [x] OCR ingredient capture
- [x] Image storage

### 🔄 Phase 4: Polish (In Progress)
- [ ] Dog scientist mascot
- [ ] Loading animations
- [ ] Dark mode
- [ ] Haptic feedback
- [ ] App icons & splash

### 📋 Phase 5: AI Enhancement (Planned)
- [ ] Claude API for plain-English summaries
- [ ] Ingredient safety explanations
- [ ] Personalized allergen alerts
- [ ] Diet compatibility checks

### 🚀 Phase 6: Launch (Planned)
- [ ] App Store submission
- [ ] Play Store submission
- [ ] Marketing website
- [ ] Beta testing program

---

## 🤝 Contributing

This is an open project. Contributions welcome!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Credits

- **Open Food Facts** - Product database
- **PubMed/NCBI** - Biomedical literature
- **Semantic Scholar** - Paper search & TLDR
- **Supabase** - Backend infrastructure
- **Expo** - React Native framework

---

**Built by Mohammed + ShafeiClawd 🐕**

*"Sniff out what's really in your food"*
