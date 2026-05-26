# 🥘 PantryPal

> **Turn your leftovers into healthy masterpieces — powered by AI.**

PantryPal is a full-stack AI web app that turns your leftover ingredients into personalised healthy recipes. Add what you have at home, upload a food photo, share your health conditions, and get 3 tailored recipes instantly — powered by local **Ollama** models.

---

## 🚀 Quick Start

**Backend**
```bash
cd backend
pip install -r requirements.txt
export OLLAMA_MODEL="phi3:mini"
export OLLAMA_VISION_MODEL="llava:7b"
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## ✨ What It Does

1. **Add ingredients** — type them in, use quick-add chips, or upload a pantry/plate photo
2. **Set your health profile** — chronic conditions, dietary restrictions, lifestyle
3. **Click Find My Recipes** — AI returns 3 tailored, nutritious recipes with instructions, nutrition info, and health tips

---

## 🏗 Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python FastAPI |
| AI Model | Ollama recipe model + Ollama vision model |

---

## 📁 Structure

```
pantrypal/
├── backend/
│   ├── main.py        # API routes
│   ├── bedrock.py     # Ollama integration
│   ├── models.py      # Pydantic schemas
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── IngredientPanel.jsx
        │   ├── HealthPanel.jsx
        │   └── RecipeCard.jsx
        └── services/api.js
```

---

## 🩺 Health Conditions Supported

`Diabetes` `Hypertension` `Heart Disease` `Kidney Disease`
`Gluten-Free` `Lactose Intolerance` `Nut Allergy` `Low-Sodium`
`Vegan` `Vegetarian` `Keto` `Low-Carb` `High-Protein` + free text

---

## 🔌 API

```
POST /api/recommend         →  returns 3 AI-generated recipes
POST /api/recommend/image   →  recognizes food from an uploaded image, then returns recipes
GET  /health                →  health check
```

For image recognition, run an Ollama vision model locally, for example:

```bash
ollama pull llava:7b
export OLLAMA_VISION_MODEL=llava:7b
```

---

*Built with ❤️ by Team PantryPal*
