# 🥘 PantryPal

> Turn your pantry ingredients into healthy, personalised recipes — powered by Anthropic Claude AI.

---

## ✨ What is PantryPal?

PantryPal is a full-stack AI web app that takes what's already in your kitchen, factors in your health conditions, and generates personalised recipes in under 10 seconds. No more food waste. No more "what do I cook tonight?"

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧺 **Ingredient Input** | Quick-add chips, quantities & units |
| 📸 **Food Photo Upload** | Claude vision detects ingredients from fridge/pantry photos |
| 🩺 **Health Profile** | Diabetes, keto, vegan, allergies and 12+ conditions |
| 🍽️ **AI Recipes** | Up to 5 personalised recipes with nutrition, steps & tips |
| 👤 **Serving Adjuster** | Scale 1–12 servings; nutrition recalculates automatically |
| 👨‍🍳 **Cooking Mode** | Full-screen step-by-step view, progress bar, screen stay-awake |
| 💬 **Chef Chat** | Ask follow-up questions or get tips from the AI chef |
| 📊 **Recipe Tracker** | Weekly/monthly/yearly charts of completed vs discarded recipes |
| ❤️ **Save Favourites** | Heart any recipe; revisit from the Saved tab |
| 🛒 **Shopping List** | One-click list of missing ingredients with copy-to-clipboard |
| 🌙 **Dark / Light Theme** | Toggle anytime from the header |

---

## ⚡ Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| 🌐 App | http://localhost:5173 |
| 🔌 API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/recommend` | Generate recipes from ingredients + health profile |
| `POST` | `/api/recommend/image` | Analyse a food photo → ingredients + recipes |
| `POST` | `/api/chat` | AI Chef Chat — tips and follow-up questions |

---

## 🏗️ Project Structure

```
pantrypal/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── bedrock.py           # Anthropic Claude — recipes, vision, chat
│   ├── models.py            # Pydantic schemas
│   ├── requirements.txt
│   └── .env                 # ← create locally (not in git)
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css          # Design system — dark/light themes
│       └── components/
│           ├── IngredientPanel.jsx
│           ├── HealthPanel.jsx
│           ├── ImageUploadPanel.jsx
│           ├── RecipeCard.jsx
│           ├── CookingMode.jsx
│           ├── ChefChat.jsx
│           ├── FoodRecipeTracker.jsx
│           └── ShoppingList.jsx
├── SETUP.md                 # Full local setup guide
├── PRESENTATION.html        # Hackathon pitch deck
└── tests/
    └── test_integration.py
```

---

## 🩺 Health Conditions Supported

`Diabetes` `Hypertension` `Heart Disease` `Kidney Disease`
`Gluten-Free` `Lactose Intolerance` `Nut Allergy` `Low-Sodium`
`Vegan` `Vegetarian` `Keto` `Low-Carb` `High-Protein` + free-text notes

---

## 🛠️ Built With

- ⚛️ React 18 + Vite
- 🐍 FastAPI + Pydantic v2
- 🧠 Anthropic Claude `claude-sonnet-4-6` — recipes, image vision, chef chat
- 🖼️ Pillow — image compression before vision analysis

---

*🥘 PantryPal — Built by Team PantryPal · Hackathon 2026*
