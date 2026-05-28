# PantryPal

Turn pantry ingredients and food photos into healthy recipe ideas, nutrition guidance, cooking mode, and food recipe insights.

PantryPal is a full-stack AI web app powered by local Ollama models. Users can type ingredients, upload a pantry or plate photo, correct the image analysis, generate personalized recipes, cook step-by-step, and track completed, discarded, and consumed recipes over time.

## Features

- Ingredient input with quick-add chips, quantities, and units.
- Food photo upload with Ollama vision recognition.
- Editable photo-analysis review so users can correct, remove, or add detected ingredients before regenerating recipes.
- Health profile filters for chronic conditions, dietary needs, lifestyle preferences, and notes.
- AI recipe recommendations with instructions, health tags, nutrition estimates, and tips.
- Cooking Mode for every recipe, including serving adjustment and step navigation.
- AI Chef Chat for quick insights of recipes.
- Food recipe tracker:
  - Completed recipes count as consumed.
  - Recipes exited before `Mark Done` count as discarded.
  - Weekly, monthly, and yearly consumption/discarded charts.
  - Numeric unused and consumed percentages.
- Saved recipes and shopping-list helper.

## Dashboard
<img width="1710" height="1107" alt="dashboard" src="https://github.com/user-attachments/assets/5ccb7e9d-234d-408c-9465-b473439e971f" />

## Health Preference
<img width="1710" height="1107" alt="health-preference" src="https://github.com/user-attachments/assets/92bd7bd3-a7ef-4f10-b369-21c61bb1833c" />

## Reciepe Generator
<img width="1710" height="1107" alt="recipe-generation" src="https://github.com/user-attachments/assets/f9b6b3fb-fe12-4a8d-a91b-e855c766cfff" />

## Make your own dish
<img width="1710" height="1107" alt="cooking-complete" src="https://github.com/user-attachments/assets/60ba1ef6-f596-4cf0-b3b2-ce76188f9f88" />

## Favourites
<img width="1710" height="1107" alt="favourites-recipies" src="https://github.com/user-attachments/assets/333d7251-bb14-40bf-9c82-5c2af70df471" />

## Food Recipe Tracker
<img width="1710" height="1107" alt="food-recipe-tracker" src="https://github.com/user-attachments/assets/135b3d59-5a14-4d92-8c98-7e76fe14e096" />

## AI Chef Bot
<img width="1710" height="1107" alt="chef-chatbot" src="https://github.com/user-attachments/assets/3de47a0d-7d07-4c98-a182-9e93516291bd" />

## To DO List
<img width="1710" height="1107" alt="to-do-groceries" src="https://github.com/user-attachments/assets/5247a1ba-674d-42fd-b5d6-61e4861a7888" />

## About App
<img width="1710" height="1107" alt="food-recipe-tracker" src="https://github.com/user-attachments/assets/aff6929a-2e20-421a-a662-88ca7e35aaa1" />

## UI Preferences
<img width="1710" height="1107" alt="theme-switch" src="https://github.com/user-attachments/assets/46d80b8a-40d6-478c-9aed-9b5ae33655bb" />


## Quick Start

### 1. Start Ollama

Install Ollama, then pull a recipe model and a vision model:

```bash
ollama pull phi3:mini
ollama pull llava:7b
ollama serve
```

If `llava:7b` crashes on your machine, try a smaller vision model:

```bash
ollama pull moondream
export OLLAMA_VISION_MODEL=moondream
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
export OLLAMA_MODEL="phi3:mini"
export OLLAMA_VISION_MODEL="llava:7b"
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend compresses uploaded images with Pillow before sending them to Ollama vision to reduce model-runner crashes.

### 3. Frontend

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

## Docker

```bash
docker compose up --build
```

The compose file points the backend at the host Ollama server via `host.docker.internal`.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/recommend` | Generate recipes from typed/corrected ingredients |
| `POST` | `/api/recommend/image` | Analyze an uploaded image, return detected ingredients, image-analysis metadata, and recipes |

## Image Recognition Flow

1. Upload a pantry, fridge, or plate photo.
2. Ollama vision returns ingredient drafts with estimated quantity, unit, confidence, category, and notes.
3. Review and correct the analysis in the UI.
4. Click `Use Corrected Analysis` to regenerate recipes from the corrected ingredients.

Vision models are imperfect, so the correction step is part of the intended workflow.

## Food Recipe Tracking

Food recipe analytics are stored in browser `localStorage`.

- Tapping `Mark Done` in Cooking Mode records the recipe as consumed.
- Tapping `Discard / Exit` or pressing `Escape` before completion records the recipe as discarded.
- The tracker shows consumed items, discarded recipes, unused percentages, and week/month/year charts.

Unused values are estimates based on pantry items and recipe ingredient usage, not exact gram-level measurements.

## Health Conditions Supported

`Diabetes` `Hypertension` `Heart Disease` `Kidney Disease`
`Gluten-Free` `Lactose Intolerance` `Nut Allergy` `Low-Sodium`
`Vegan` `Vegetarian` `Keto` `Low-Carb` `High-Protein` plus free-text notes.

## Project Structure

```text
pantrypal/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── bedrock.py           # Ollama recipe + vision integration
│   ├── models.py            # Pydantic schemas
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── CookingMode.jsx
│   │   │   ├── HealthPanel.jsx
│   │   │   ├── ImageUploadPanel.jsx
│   │   │   ├── IngredientPanel.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   └── FoodRecipeTracker.jsx
│   │   └── services/api.js
│   └── package.json
└── docker-compose.yaml
```

## Troubleshooting

### Ollama vision error: model runner stopped

This usually means the selected vision model is too large for available RAM/VRAM. Try:

```bash
ollama pull moondream
export OLLAMA_VISION_MODEL=moondream
```

Then restart the backend.

### Image upload form errors

Make sure backend dependencies are installed:

```bash
pip install -r backend/requirements.txt
```

This includes `python-multipart` for uploads and `pillow` for image compression.

### API cannot reach Ollama

For local backend runs, the default Ollama URL is:

```bash
http://127.0.0.1:11434
```

For Docker, `docker-compose.yaml` sets:

```bash
OLLAMA_URL=http://host.docker.internal:11434
```

## Built With

- React 18 + Vite
- FastAPI + Pydantic
- Ollama recipe model, default `phi3:mini`
- Ollama vision model, default `llava:7b`
- Pillow image compression

*Built by Team PantryPal.*
