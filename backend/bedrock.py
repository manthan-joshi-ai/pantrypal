import os
import json
import requests
from models import RecommendRequest, RecommendResponse, Recipe, NutritionalInfo

BEARER_TOKEN = os.environ.get("AWS_BEARER_TOKEN_BEDROCK", "")
REGION = "us-east-1"
MODEL_ID = "minimax.minimax-m2"
URL = f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{MODEL_ID}/invoke"


def build_prompt(req: RecommendRequest) -> str:
    ingredients_list = []
    for ing in req.ingredients:
        entry = ing.name
        if ing.quantity:
            entry += f" ({ing.quantity} {ing.unit})".strip()
        ingredients_list.append(entry)

    hp = req.health_profile
    health_parts = []
    if hp.chronic:
        health_parts.append(f"Chronic conditions: {', '.join(hp.chronic)}")
    if hp.dietary:
        health_parts.append(f"Dietary restrictions: {', '.join(hp.dietary)}")
    if hp.lifestyle:
        health_parts.append(f"Lifestyle/diet: {', '.join(hp.lifestyle)}")
    if hp.notes:
        health_parts.append(f"Additional health notes: {hp.notes}")

    health_section = "\n".join(health_parts) if health_parts else "No specific health conditions mentioned."

    return f"""You are PantryPal, a professional nutritionist and creative chef AI.
The user has the following health profile:
{health_section}

Available ingredients: {', '.join(ingredients_list)}

Suggest exactly 3 healthy, delicious recipes that:
1. Use primarily the available ingredients
2. Are appropriate for the user's health conditions
3. Are nutritionally balanced

Respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
{{
  "recipes": [
    {{
      "name": "Recipe Name",
      "cuisine": "Cuisine Type",
      "description": "Short appetizing description (2 sentences)",
      "health_benefits": ["Benefit 1", "Benefit 2"],
      "why_good_for_you": "One sentence explaining why this suits the user's health profile",
      "prep_time": "X mins",
      "cook_time": "X mins",
      "difficulty": "Easy",
      "servings": 2,
      "ingredients_used": ["ingredient from pantry 1", "ingredient from pantry 2"],
      "additional_ingredients": ["common pantry item 1"],
      "instructions": ["Step 1...", "Step 2...", "Step 3..."],
      "nutritional_info": {{
        "calories": "~350 kcal",
        "protein": "18g",
        "carbs": "40g",
        "fat": "10g",
        "fiber": "6g"
      }},
      "health_tags": ["Low Sodium", "High Fiber"],
      "tips": "Optional chef tip or healthy substitution"
    }}
  ]
}}"""


def get_recommendations(req: RecommendRequest) -> RecommendResponse:
    if not BEARER_TOKEN:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK environment variable is not set")

    prompt = build_prompt(req)

    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 3000
    }

    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.post(URL, headers=headers, json=payload, timeout=60)
    response.raise_for_status()

    raw = response.json()["choices"][0]["message"]["content"]

    # Strip <reasoning>...</reasoning> block if present
    if "<reasoning>" in raw and "</reasoning>" in raw:
        raw = raw[raw.index("</reasoning>") + len("</reasoning>"):].strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    data = json.loads(raw)

    recipes = []
    for r in data.get("recipes", []):
        ni_data = r.get("nutritional_info", {})
        ni = NutritionalInfo(**ni_data) if ni_data else None
        recipes.append(Recipe(
            name=r.get("name", ""),
            cuisine=r.get("cuisine", ""),
            description=r.get("description", ""),
            health_benefits=r.get("health_benefits", []),
            why_good_for_you=r.get("why_good_for_you", ""),
            prep_time=r.get("prep_time", ""),
            cook_time=r.get("cook_time", ""),
            difficulty=r.get("difficulty", "Easy"),
            servings=r.get("servings", 2),
            ingredients_used=r.get("ingredients_used", []),
            additional_ingredients=r.get("additional_ingredients", []),
            instructions=r.get("instructions", []),
            nutritional_info=ni,
            health_tags=r.get("health_tags", []),
            tips=r.get("tips", ""),
        ))

    return RecommendResponse(recipes=recipes)
