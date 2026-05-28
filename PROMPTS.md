# PantryPal Prompt Documentation

This file captures the prompts used to build the PantryPal application from scratch.

## Project Goal Prompts

### 1. Initial concept

> "Let's build an AI-powered food recommendation app called PantryPal. It should let users enter pantry ingredients and health preferences, then return healthy recipes they can cook from what they have."

### 2. Core app functionality

> "PantryPal should support manual ingredient input, health profile filters, photo-based pantry analysis, recipe recommendations, saved recipes, shopping lists, cooking mode, and chef chat."

### 3. Backend architecture

> "Create a FastAPI backend with endpoints for recipe recommendations, image-based ingredient detection, and chef chat. Use Pydantic models for validation and keep the AI integration in a separate module."

### 4. AI integration

> "Use Ollama for the LLM backend. The same model should handle both text recipe generation and the chef chat assistant, while a vision-capable model handles image ingredient analysis."

### 5. UX and UI design

> "Design an eye-catching modern food app UI with a hero section, ingredient input panel, health profile panel, results cards, saved recipes tab, shopping list modal, and theme toggle."

## Feature Build Prompts

### Recipe generation and health personalization

> "Build the recipe prompt so it only outputs valid JSON and returns a list of healthy recipe objects. Each recipe should include name, cuisine, description, health benefits, prep/cook time, difficulty, servings, used ingredients, additional ingredients, instructions, nutrition, health tags, and tips."

> "Make the recipe engine respect health profile fields like chronic conditions, dietary restrictions, lifestyle, and notes."

### Image analysis prompt

> "Add a picture upload flow that sends an image to the backend, detects visible food or pantry items, and returns structured ingredient objects with name, estimated quantity, unit, confidence, category, and notes."

> "If the image analysis is wrong, allow users to correct the detected ingredients and regenerate recipes from the corrected list."

### Chef chat prompt

> "Create a chef chat assistant for each recipe. The chat should answer questions about substitutions, storage, scaling, nutrition, technique, and how to make the dish spicier."

> "The chef chat response should be conversational and plain text only — no JSON or markdown formatting."

### Saved recipes and shopping list

> "Allow users to save recipes locally in the browser using localStorage. Add a Saved Recipes tab and let users toggle saved state with a heart icon."

> "Add a shopping list modal that collects additional ingredients across current recipes and provides a copy-to-clipboard option."

### Cooking mode

> "Build a cooking mode that shows recipe steps one at a time. Add a serving size adjuster so ingredient quantities and nutrition values scale based on servings."

### Theme and UX polish

> "Add a dark/light theme toggle and persist the choice in localStorage."

> "Add helpful error states, loading indicators, and smooth transitions when searching for recipes, uploading images, or switching tabs."

### Waste tracking

> "Track completed and discarded recipes, ingredients saved, servings cooked, leftover estimates, and history events to show waste reduction stats."

## Backend Prompt Details

### Recipe recommendation prompt

- Use a professional nutritionist and chef persona.
- Require valid JSON only, no markdown or extra explanation.
- Provide the available ingredients list.
- Provide the health profile details when supplied.
- Define an exact response schema for recipes.
- Ask for 1–5 healthy recipes per request.

### Image analysis prompt

- Ask the model to identify visible food or pantry items.
- Use raw ingredient names rather than dish names.
- Estimate quantity only when visually reasonable.
- Return only valid JSON, no markdown.

### Chef chat prompt

- Provide recipe context including name, cuisine, servings, prep/cook time, ingredients, instructions, health tags, and tips.
- Ask the model to answer cooking-related questions clearly and practically.
- Prefer concise, plain-text responses.

## App Development Timeline Prompts

### Start-to-finish prompts used during development

1. "Let's create PantryPal, a kitchen recipe assistant that uses ingredient input and health data to recommend meals."
2. "Build the backend first using FastAPI and a separate recommendation module to manage AI calls."
3. "Write the frontend with ingredient entry, health profile, photo analysis, recipe cards, and a hero section."
4. "Add a saved recipes feature with localStorage and a dedicated saved tab."
5. "Add a shopping list modal and ensure users can copy the list quickly."
6. "Add serving size controls on recipe cards and scale nutrition values accordingly."
7. "Add cooking mode with on-screen step-by-step navigation."
8. "Add a Chef Chat panel on each recipe card for recipe-specific help."
9. "Add a dark/light theme toggle and persist it in localStorage."
10. "Add waste tracking stats for completed recipes, ingredients saved, and discarded recipe events."
11. "Document how to set up and run the app in setup and prompts docs."

## Project Structure and Implementation Notes

- `backend/main.py` handles API routes and validation.
- `backend/recommendation.py` contains AI prompt logic and Ollama integration.
- `backend/models.py` defines Pydantic schemas for requests and responses.
- `frontend/src/App.jsx` orchestrates state, ingredient input, health profile, search flow, results, saved recipes, and modals.
- `frontend/src/components/RecipeCard.jsx` shows recipe details, serving controls, chef chat toggle, and cooking mode.
- `frontend/src/components/ChefChat.tsx` manages chat interactions and quick prompts.
- `frontend/src/components/ImageUploadPanel.jsx` handles image uploads, analysis results, and correction actions.
- `frontend/src/services/api.js` communicates with backend endpoints.

## Running and Testing Prompts

These prompts drove the build and should be used when updating the app:
- "Update the recipe prompt to produce clean JSON output for recipes."
- "Improve image analysis so it only returns sensible ingredient detections."
- "Make chef chat recipe-specific and concise."
- "Add a shopping list based on additional ingredients."
- "Add the ability to save recipes in localStorage."
- "Add a dark/light theme toggle and persist the selection."
- "Add cooking mode and serving-size scaling."
- "Add waste tracking statistics and history."

## Notes

- Use this file as the source of truth for the prompts that guided the project.
- Keep prompt wording aligned with the actual UI and backend flow.
- When extending features, add a new prompt section describing the user intent and expected outcome.
