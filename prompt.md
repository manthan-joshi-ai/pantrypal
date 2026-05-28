# Feature Prompts

## Chef Chat Feature

**Prompt:**
> I want to add a feature here, where user can have a chef chat for every recipe.

**Details discussed:**
- AI backend: Same as recipes (AWS Bedrock / MiniMax)
- UI placement: Slide-in panel on the recipe card

**What was built:**
- `POST /api/chat` backend endpoint
- `ChefChat.jsx` slide-in panel with message history, typing indicator, and quick-suggestion chips
- "Chat with Chef" toggle button on each recipe card

---

## Migrate from AWS Bedrock to Anthropic API

**Prompt:**
> This current project is running through amazon bedrock, I need to run with anthropic key now. Can you please modify code dependencies according on Anthropic key.

**What was built:**
- Replaced `requests` + AWS bearer token with `anthropic` Python SDK
- Swapped model from `minimax.minimax-m2` to `claude-sonnet-4-6`
- Updated `requirements.txt` (removed `requests`, added `anthropic>=0.40.0`)
- Updated `.env` to use `ANTHROPIC_API_KEY`
- Moved system prompt to top-level `system=` parameter in `chef_chat` (Anthropic API requirement)

---

## Hackathon Pitch Page

**Prompts:**
> I need to present this in hackathon, please create a story for me.
> Put it in a HTML page with good visuals which I can showcase.
> Please match it to my project theme, like the UI in my project.

**What was built:**
- `pitch.html` — self-contained single-page pitch deck
- Sections: Hero, Hook, Problem (stats), Solution (feature cards), How it works (step flow), Why Claude, Impact, Tech stack
- Matched app's design system exactly: dark bg (`#0d1117`), orange/green/purple accent palette, glass morphism cards, gradient text, food orbit animation, identical header and badge styles

---

## Bug Fix: MiniMax → Claude AI labels

**Prompt:**
> UI in the top says MiniMax AI, add Claude there now we are not using MiniMax key.

**What was changed:**
- `Header.jsx` nav badge: `MiniMax AI` → `Claude AI`
- `App.jsx` hero stat: `Powered by MiniMax` → `Powered by Claude`
- `App.jsx` footer: `Powered by MiniMax AI on AWS Bedrock` → `Powered by Claude (Anthropic)`

---

## Bug Fix: Recipe count validation

**Prompt:**
> In the recipe count feature if the user tries to put a number greater than 5, it should say only 5 recipes allowed as of now.

**What was changed:**
- Added `recipeCountError` state in `App.jsx`
- Shows `⚠ Only 5 recipes allowed as of now.` inline below the input when user types > 5
- Error clears automatically on valid input

---

## Feature: Recipe by Dish Name

**Prompt:**
> Let's add one more feature, if a user wants to get recipe of a particular dish, we can also get that.

**What was built:**
- `models.py`: added `dish_name: Optional[str] = ""` to `RecommendRequest`
- `bedrock.py`: prompt now includes dish name instruction when provided
- `api.js`: passes `dish_name` in the request body
- `App.jsx`: new `dishName` state + "Have a dish in mind?" optional input row
- `App.css`: styled `.dish-request-row` to match glass panel design
