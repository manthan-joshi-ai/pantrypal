# PantryPal — Local Setup Guide

Get the full stack running locally in under 5 minutes.

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ (⚠ use v20.5 – v20.18 for Vite 4 compatibility) | `node --version` |
| npm | 8+ | `npm --version` |

> **Node version note:** Vite 4 is used because Node v20.5 is not compatible with Vite 9+.
> If you're on a newer Node, downgrade via `nvm use 20.5` or the project will still work — just use `npm install` without upgrading Vite.

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

### Add your AWS bearer token

Create a `.env` file inside the `backend/` directory:

```bash
# backend/.env
AWS_BEARER_TOKEN_BEDROCK=your_token_here
```

> **Where to get the token:** The token is an AWS Bedrock bearer token scoped to the `minimax.minimax-m2` model in `us-east-1`. Ask the project owner for the current token — it is never committed to git.

### Start the backend server

```bash
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**

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

The app will be available at **http://localhost:5173**

---

## 4 — Use the app

1. Open **http://localhost:5173** in your browser
2. Add ingredients from your kitchen using the quick-add chips or type your own
3. Optionally set health conditions in the **Health Profile** tab
4. Click **Find My Recipes** — the backend calls MiniMax AI on AWS Bedrock and returns 3 personalised recipes

---

## Project structure

```
pantrypal/
├── backend/
│   ├── main.py          # FastAPI app + routes
│   ├── bedrock.py       # MiniMax AI integration via AWS Bedrock
│   ├── models.py        # Pydantic request/response models
│   ├── requirements.txt
│   └── .env             # ← create this locally (not in git)
└── frontend/
    ├── src/
    │   ├── App.jsx               # Root component + state
    │   ├── App.css               # Design system (dark/light themes)
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── IngredientPanel.jsx
    │   │   ├── HealthPanel.jsx
    │   │   ├── RecipeCard.jsx     # Save, serving adjuster, cooking mode
    │   │   ├── ShoppingList.jsx
    │   │   └── CookingMode.jsx
    │   └── services/
    │       └── api.js            # fetch wrapper for /api/recommend
    └── package.json
```

---

## API reference

### `POST /api/recommend`

**Request body:**
```json
{
  "ingredients": [
    { "name": "chicken", "quantity": "500g" }
  ],
  "health_profile": {
    "chronic": ["Diabetes"],
    "dietary": ["Gluten-Free"],
    "lifestyle": ["High-Protein"],
    "notes": "prefer low oil cooking"
  }
}
```

**Response:** 3 recipe objects, each with `name`, `ingredients_used`, `additional_ingredients`, `instructions`, `nutritional_info`, `health_tags`, `tips`, and more.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `AWS_BEARER_TOKEN_BEDROCK is not set` | Create `backend/.env` with the token (see Step 2) |
| Frontend shows "Something went wrong" | Check backend terminal for errors; confirm it's running on port 8000 |
| `npm install` fails | Ensure Node ≥ 18; try deleting `node_modules/` and retrying |
| CORS error in browser | Backend must be running on `localhost:8000`; frontend on `localhost:5173` or `localhost:3000` |
| Port 8000 already in use | `uvicorn main:app --reload --port 8001` and update `frontend/src/services/api.js` URL |
