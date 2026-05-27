# 🥘 PantryPal

> **Turn your leftovers into healthy masterpieces — powered by AI.**

PantryPal is a full-stack AI web app that turns your leftover ingredients into personalised healthy recipes. Add what you have at home, share your health conditions, and get 3 tailored recipes instantly — powered by **MiniMax AI on AWS Bedrock**.

---

## 🚀 Quick Start

**Backend**
```bash
cd backend
pip install -r requirements.txt
export AWS_BEARER_TOKEN_BEDROCK="your_token_here"
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

1. **Add ingredients** — type them in or use quick-add chips
2. **Set your health profile** — chronic conditions, dietary restrictions, lifestyle, plus add any custom condition if it isn't listed
3. **Click Find My Recipes** — AI returns 3 tailored, nutritious recipes with instructions, nutrition info, and health tips

---

## 🏗 Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python FastAPI |
| AI Model | MiniMax M2 (`minimax.minimax-m2`) |
| Cloud | AWS Bedrock (us-east-1) |
| Auth | Bearer Token |

---

## 📁 Structure

```
pantrypal/
├── backend/
│   ├── main.py        # API routes
│   ├── bedrock.py     # MiniMax integration
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
`Vegan` `Vegetarian` `Keto` `Low-Carb` `High-Protein` + custom entries

PantryPal also supports custom health condition entries in the Health Profile, so users can add any specific condition or restriction that is not already listed.

---

## 🔌 API

```
POST /api/recommend   →  returns 3 AI-generated recipes
GET  /health          →  health check
```

---

*Built with ❤️ by Team PantryPal*
