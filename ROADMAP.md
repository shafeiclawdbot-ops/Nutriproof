# 🐕 Nutriproof - Full Product Roadmap

**Vision:** The science-based food scanner that crowdsources missing data and provides evidence-backed ingredient analysis.

**Tagline:** "Sniff out what's really in your food"

---

## 🎯 Full Feature List

### Core Features (MVP → v1.0)

| Feature | Status | Priority |
|---------|--------|----------|
| Barcode scanning | ✅ Done | P0 |
| Open Food Facts lookup | ✅ Done | P0 |
| SQLite local cache | ✅ Done | P0 |
| Product display (name, image, nutrition) | ✅ Done | P0 |
| Empty state handling | ✅ Done | P0 |
| **OCR ingredient capture** | 🔨 Next | P0 |
| **User-contributed data** | 🔨 Next | P0 |
| Recent scans history | ✅ Done | P1 |
| Offline-first architecture | ✅ Done | P1 |

### Data Contribution System (v1.1)

| Feature | Description |
|---------|-------------|
| Photo capture | Take photo of ingredient label |
| OCR processing | Extract text from image (on-device or cloud) |
| Smart parsing | Parse ingredients into structured data |
| Community database | Supabase backend for user contributions |
| Data validation | Review/upvote system for accuracy |
| Contributor rewards | Gamification (badges, streaks) |

### Science Layer (v1.5 - RAG)

| Feature | Description |
|---------|-------------|
| PubMed integration | Search scientific papers |
| Evidence cards | Show research for each ingredient |
| Citation system | PMID/DOI references |
| Confidence ratings | Evidence quality indicators |
| Controversy flags | Mark disputed ingredients |

### User Experience (v2.0)

| Feature | Description |
|---------|-------------|
| User accounts | Sign up/login (Supabase Auth) |
| Scan history sync | Cloud backup of scans |
| Favorites/watchlist | Save products to track |
| Allergen alerts | Personal allergen profile |
| Diet filters | Vegan, keto, halal, etc. |
| Share products | Send to friends |
| Dark mode | System theme support |

### Advanced Features (v3.0+)

| Feature | Description |
|---------|-------------|
| Ingredient alternatives | Suggest healthier swaps |
| Price comparison | Link to online stores |
| Meal planning | Build shopping lists |
| Restaurant mode | Scan menu items |
| AR overlay | Point camera, see info live |
| API for developers | Open data access |

---

## 🗓 Development Roadmap

### Phase 1: Data Contribution MVP (Week 1-2) ← CURRENT
**Goal:** Let users contribute missing product data

- [ ] Add "Contribute Data" button on empty products
- [ ] Camera screen for label photos
- [ ] OCR integration (Google ML Kit / Tesseract)
- [ ] Ingredient text parsing
- [ ] Supabase backend setup
- [ ] Submit to community database
- [ ] Show "Community Contributed" badge

### Phase 2: Polish & UX (Week 3)
**Goal:** Make it feel premium

- [ ] Dog scientist mascot integration
- [ ] Loading animations (sniffing dog)
- [ ] Empty state illustrations
- [ ] Haptic feedback
- [ ] Pull-to-refresh animations
- [ ] Smooth transitions
- [ ] Dark mode support

### Phase 3: User Accounts (Week 4)
**Goal:** Personalization

- [ ] Supabase Auth integration
- [ ] User profiles
- [ ] Scan history sync
- [ ] Allergen preferences
- [ ] Contribution leaderboard

### Phase 4: Science Layer (Week 5-6)
**Goal:** Evidence-backed information

- [ ] PubMed API integration
- [ ] RAG pipeline setup
- [ ] Evidence cards UI
- [ ] Citation display
- [ ] "Learn More" deep dives

### Phase 5: Launch Prep (Week 7-8)
**Goal:** App Store ready

- [ ] App icons & splash screens
- [ ] App Store screenshots
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Beta testing (TestFlight)
- [ ] Launch! 🚀

---

## 🏗 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App                        │
│  (React Native + Expo)                              │
├─────────────────────────────────────────────────────┤
│  Screens        │  Services         │  State        │
│  - Home         │  - OpenFoodFacts  │  - Zustand    │
│  - Scanner      │  - OCR            │  - AsyncStore │
│  - Product      │  - Supabase       │  - SQLite     │
│  - Contribute   │  - PubMed         │               │
│  - Profile      │  - RAG            │               │
└────────┬────────┴────────┬──────────┴───────────────┘
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────────────────────┐
│ Open Food Facts │  │         Supabase                │
│ (External API)  │  │  ┌─────────────┐ ┌───────────┐  │
└─────────────────┘  │  │ PostgreSQL  │ │ pgvector  │  │
                     │  │ - products  │ │ - papers  │  │
                     │  │ - users     │ │ - embeds  │  │
                     │  │ - contribs  │ │           │  │
                     │  └─────────────┘ └───────────┘  │
                     │  ┌─────────────┐ ┌───────────┐  │
                     │  │   Auth      │ │  Storage  │  │
                     │  │  (users)    │ │ (images)  │  │
                     │  └─────────────┘ └───────────┘  │
                     └─────────────────────────────────┘
```

---

## 🎨 Design System

**Primary Color:** #4CAF50 (Green - health/nature)
**Secondary:** #2196F3 (Blue - trust/science)
**Accent:** #FF9800 (Orange - warnings/attention)

**Typography:**
- Headlines: SF Pro Display / Inter Bold
- Body: SF Pro Text / Inter Regular
- Monospace: SF Mono (for barcodes)

**Mascot:** Dog Scientist 🐕‍🦺
- Appears in empty states
- Sniffing animation during loading
- Celebrates when data is contributed
- Warns about concerning ingredients

---

## 📊 Success Metrics

| Metric | Target (Month 1) |
|--------|------------------|
| Downloads | 1,000 |
| Daily Active Users | 100 |
| Products Scanned | 5,000 |
| User Contributions | 500 |
| Data Accuracy | >95% |
| App Store Rating | 4.5+ |

---

*Last updated: 2026-02-01*
*Owner: ShafeiClawd (AI) + Mohammed (Human)*
