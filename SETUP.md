# 🥘 PantryPal — Local Setup Guide

Get the full stack running locally in under 5 minutes.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| npm | 8+ | `npm --version` |
| Anthropic API Key | — | [console.anthropic.com](https://console.anthropic.com) |

---

## 1 — Clone the repo

```bash
git clone https://github.com/manthan-joshi-ai/pantrypal.git
cd pantrypal
```

---

## 2 — Backend setup (Python / FastAPI)

```bash
cd backend
```

### Create and activate a virtual environment

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows
python -m venv .venv
.venv\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Add your Anthropic API key

Create a `.env` file inside the `backend/` directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> **Where to get the key:** Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key. This key is never committed to git.

### Start the backend server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"PantryPal API"}
```

---

## 3 — Frontend setup (React / Vite)

Open a **new terminal tab**, then:

```bash
cd pantrypal/frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| 🌐 App | http://localhost:5173 |
| 🔌 API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |

---

## 4 — Use the app

1. Open **http://localhost:5173** in your browser
2. Add ingredients using the quick-add chips or type your own
3. Or upload a **food photo** — Claude vision will detect ingredients automatically
4. Optionally set your health conditions in the **Health Profile** tab
5. Click **Find My Recipes** — Claude AI returns personalised recipes in under 10 seconds
6. Explore **Cooking Mode**, **Chef Chat**, **Shopping List**, and **Recipe Tracker**

---

## Project Structure

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
│       ├── App.jsx               # Root component + state
│       ├── App.css               # Design system (dark/light themes)
│       ├── components/
│       │   ├── IngredientPanel.jsx
│       │   ├── HealthPanel.jsx
│       │   ├── ImageUploadPanel.jsx  # Food photo upload + correction
│       │   ├── RecipeCard.jsx        # Save, serving adjuster, cooking mode
│       │   ├── ShoppingList.jsx
│       │   ├── CookingMode.jsx
│       │   ├── ChefChat.jsx          # AI chef follow-up chat
│       │   └── FoodRecipeTracker.jsx # Cooking stats & charts
│       └── services/
│           └── api.js
└── tests/
    └── test_integration.py
```

---

## API Reference

### `POST /api/recommend`
Generate recipes from typed ingredients.

```json
{
  "ingredients": [{ "name": "chicken", "quantity": "500", "unit": "g" }],
  "health_profile": {
    "chronic": ["Diabetes"],
    "dietary": ["Gluten-Free"],
    "lifestyle": ["High-Protein"],
    "notes": "prefer low oil cooking"
  },
  "recipe_count": 3
}
```

### `POST /api/recommend/image`
Upload a food photo — Claude detects ingredients and returns recipes.

```bash
curl -X POST http://localhost:8000/api/recommend/image \
  -F "image=@/path/to/photo.jpg" \
  -F 'health_profile={}'
```

### `POST /api/chat`
AI Chef Chat — ask follow-up questions about a recipe.

```json
{
  "messages": [{ "role": "user", "content": "Can I substitute butter with olive oil?" }],
  "recipe_context": "Grilled Chicken with Spinach"
}
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ANTHROPIC_API_KEY` not set | Create `backend/.env` with your key (see Step 2) |
| Frontend shows "Something went wrong" | Check backend terminal for errors; confirm it's running on port 8000 |
| Image upload fails | Ensure image is under 8 MB and is a valid JPEG/PNG |
| `npm install` fails | Ensure Node ≥ 18; delete `node_modules/` and retry |
| CORS error in browser | Backend must run on `localhost:8000`; frontend on `localhost:5173` or `3000` |
| Port 8000 already in use | Run `uvicorn main:app --reload --port 8001` and update `frontend/src/services/api.js` |
