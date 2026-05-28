import os
import json
import anthropic
from dotenv import load_dotenv
from models import RecommendRequest, RecommendResponse, Recipe, NutritionalInfo, ChefChatRequest, ChefChatResponse

load_dotenv()
MODEL_ID = "claude-sonnet-4-6"
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


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

    dish_line = (
        f"\nThe user specifically wants to make: {req.dish_name.strip()}. "
        "Focus on this dish (or close variations of it) while respecting the available ingredients and health profile."
        if req.dish_name and req.dish_name.strip() else ""
    )

    return f"""You are PantryPal, a professional nutritionist and creative chef AI.
The user has the following health profile:
{health_section}

Available ingredients: {', '.join(ingredients_list)}
{dish_line}
Suggest exactly {req.recipe_count} healthy, delicious recipes that:
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
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    prompt = build_prompt(req)

    response = client.messages.create(
        model=MODEL_ID,
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text

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


def chef_chat(req: ChefChatRequest) -> ChefChatResponse:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    r = req.recipe
    ingredients_all = (r.ingredients_used or []) + (r.additional_ingredients or [])
    system_prompt = (
        f"You are a friendly expert chef and nutritionist specializing in the recipe \"{r.name}\" "
        f"({r.cuisine} cuisine). The recipe serves {r.servings}, takes {r.prep_time} prep and {r.cook_time} to cook "
        f"(difficulty: {r.difficulty}). "
        f"Ingredients: {', '.join(ingredients_all)}. "
        f"Instructions: {' | '.join(r.instructions or [])}. "
        f"Health tags: {', '.join(r.health_tags or [])}. "
        f"Chef tip: {r.tips or 'none'}. "
        "Answer the user's questions about this recipe concisely and helpfully. "
        "If asked about substitutions, scaling, techniques, or nutrition, give practical advice. "
        "Stay focused on this recipe and cooking-related topics."
    )

    messages = [{"role": msg.role, "content": msg.content} for msg in req.messages]

    response = client.messages.create(
        model=MODEL_ID,
        max_tokens=800,
        system=system_prompt,
        messages=messages,
    )

    raw = response.content[0].text
    return ChefChatResponse(reply=raw.strip())
