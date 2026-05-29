# PantryPal

Turn pantry ingredients and food photos into healthy, personalised recipes — powered by Anthropic Claude AI.

PantryPal is a full-stack AI web app. Users can type ingredients or upload a pantry photo, set their health profile, generate personalised recipes, cook step-by-step, chat with an AI chef, and track their cooking habits over time.

## Features

- **Ingredient input** — quick-add chips, quantities, and units; or upload a food photo
- **Food photo recognition** — Claude vision analyses pantry/fridge photos and extracts ingredients automatically; users can review and correct before generating recipes
- **Health profile** — chronic conditions, dietary restrictions, lifestyle preferences, and free-text notes
- **AI recipe recommendations** — up to 5 personalised recipes with instructions, health tags, nutrition estimates, and chef tips
- **Serving size adjuster** — scale any recipe from 1 to 12 servings; nutrition values recalculate automatically
- **Cooking Mode** — full-screen step-by-step view, progress bar, keyboard navigation, and screen wake lock
- **AI Chef Chat** — ask follow-up questions about any recipe or get cooking tips
- **Food Recipe Tracker** — tracks completed vs discarded recipes with weekly/monthly/yearly charts stored in localStorage
- **Save favourites** — heart any recipe to save it locally; revisit from the Saved tab
- **Shopping list** — one-click aggregation of missing ingredients across all recipes with copy-to-clipboard

## Dashboard
<img width="3420" height="2214" alt="image" src="https://github.com/user-attachments/assets/36b2116a-086d-4014-962a-c35a48487e36" />

## Health Preference
<img width="3420" height="2214" alt="image" src="https://github.com/user-attachments/assets/1ccd40bd-6ed2-4a97-a66c-7c16405c26a1" />

## Recipe Generator
<img width="1710" height="1107" alt="recipe-generation" src="https://github.com/user-attachments/assets/f9b6b3fb-fe12-4a8d-a91b-e855c766cfff" />

## Make Your Own Dish
<img width="1710" height="1107" alt="cooking-complete" src="https://github.com/user-attachments/assets/60ba1ef6-f596-4cf0-b3b2-ce76188f9f88" />

## Favourites
<img width="1710" height="1107" alt="favourites-recipies" src="https://github.com/user-attachments/assets/333d7251-bb14-40bf-9c82-5c2af70df471" />

## AI Chef Bot
<img width="1710" height="1107" alt="chef-chatbot" src="https://github.com/user-attachments/assets/3de47a0d-7d07-4c98-a182-9e93516291bd" />

## Shopping List
<img width="1710" height="1107" alt="to-do-groceries" src="https://github.com/user-attachments/assets/5247a1ba-674d-42fd-b5d6-61e4861a7888" />

## UI Preferences
<img width="1710" height="1107" alt="theme-switch" src="https://github.com/user-attachments/assets/aff6929a-2e20-421a-a662-88ca7e35aaa1" />

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service  | URL                         |
|----------|-----------------------------|
| App      | http://localhost:5173        |
| API      | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |

## API

| Method | Endpoint              | Description                                              |
|--------|-----------------------|----------------------------------------------------------|
| `GET`  | `/health`             | Health check                                             |
| `POST` | `/api/recommend`      | Generate recipes from typed ingredients + health profile |
| `POST` | `/api/recommend/image`| Analyse a food photo, return detected ingredients + recipes |
| `POST` | `/api/chat`           | AI Chef Chat — follow-up questions and cooking tips      |

## Image Recognition Flow

1. Upload a pantry, fridge, or plate photo (max 8 MB)
2. Claude vision returns detected ingredients with estimated quantity, unit, confidence, and category
3. Review and correct the analysis in the UI
4. Click **Use Corrected Analysis** to regenerate recipes from the corrected list

## Food Recipe Tracking

All tracking data is stored in browser `localStorage` — no account required.

- Tapping **Mark Done** in Cooking Mode records the recipe as consumed
- Tapping **Exit** before completion records it as discarded
- The tracker displays consumed vs discarded counts and week/month/year charts

## Health Conditions Supported

`Diabetes` `Hypertension` `Heart Disease` `Kidney Disease`
`Gluten-Free` `Lactose Intolerance` `Nut Allergy` `Low-Sodium`
`Vegan` `Vegetarian` `Keto` `Low-Carb` `High-Protein` plus free-text notes

## Project Structure

```
pantrypal/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── bedrock.py           # Anthropic Claude integration (recipes, vision, chat)
│   ├── models.py            # Pydantic schemas
│   ├── requirements.txt
│   └── .env                 # ← create locally (not in git)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css          # Design system — dark/light themes
│   │   ├── components/
│   │   │   ├── IngredientPanel.jsx
│   │   │   ├── HealthPanel.jsx
│   │   │   ├── ImageUploadPanel.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── CookingMode.jsx
│   │   │   ├── ChefChat.jsx
│   │   │   └── FoodRecipeTracker.jsx
│   │   └── services/api.js
│   └── package.json
├── SETUP.md                 # Local setup guide for new contributors
├── PRESENTATION.html        # Hackathon pitch deck
└── tests/
    └── test_integration.py
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ANTHROPIC_API_KEY` not set | Create `backend/.env` with your key |
| Image upload fails | Ensure image is under 8 MB and is a valid image file |
| CORS error in browser | Backend must run on port `8000`; frontend on `5173` or `3000` |
| Port 8000 already in use | Run with `--port 8001` and update `frontend/src/services/api.js` |

## Built With

- React 18 + Vite
- FastAPI + Pydantic v2
- Anthropic Claude (`claude-sonnet-4-6`) — recipes, image vision, chef chat
- Pillow — image compression before vision analysis

*Built by Team PantryPal — Hackathon 2026.*
