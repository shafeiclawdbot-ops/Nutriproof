# 🐕 Nutriproof

Science-based food scanner app. No arbitrary scores — just real ingredient data.

## MVP Features (v0.1)

- ✅ Barcode scanning (EAN-13, UPC-A, etc.)
- ✅ Product lookup via Open Food Facts API
- ✅ Local SQLite caching (no repeated API calls)
- ✅ Ingredient list display
- ✅ Nutrition facts
- ✅ Additives & allergens

## Tech Stack

- **React Native + Expo** (SDK 54)
- **TypeScript**
- **expo-camera** — Barcode scanning
- **expo-sqlite** — Local cache
- **Open Food Facts API** — Product database

## Project Structure

```
nutriproof-app/
├── App.tsx                    # Main app + navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Recent scans list
│   │   ├── ScannerScreen.tsx  # Camera + barcode
│   │   └── ProductScreen.tsx  # Product details
│   ├── services/
│   │   ├── openFoodFacts.ts   # API client
│   │   ├── database.ts        # SQLite operations
│   │   └── productService.ts  # Cache-then-fetch logic
│   └── types/
│       └── product.ts         # TypeScript interfaces
└── assets/                    # Icons, splash (TBD)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Scan QR with Expo Go app on your phone
```

## Coming Soon (Phase 2)

- 🔬 RAG-powered ingredient research (PubMed citations)
- 🐕 Dog scientist mascot branding
- ☁️ Cloud sync
- 📊 Evidence quality ratings

---

Built with 💚 by Mohammed + ShafeiClawd
