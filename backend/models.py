from pydantic import BaseModel
from typing import List, Optional

class Ingredient(BaseModel):
    id: str
    name: str
    quantity: Optional[str] = ""
    unit: Optional[str] = ""

class HealthProfile(BaseModel):
    chronic: List[str] = []        # Diabetes, Hypertension, Heart Disease, Kidney Disease
    dietary: List[str] = []        # Gluten-free, Lactose intolerance, Nut allergy, Low-sodium
    lifestyle: List[str] = []      # Vegan, Vegetarian, Keto, Low-carb, High-protein
    notes: Optional[str] = ""

class RecommendRequest(BaseModel):
    ingredients: List[Ingredient]
    health_profile: HealthProfile

class NutritionalInfo(BaseModel):
    calories: Optional[str] = ""
    protein: Optional[str] = ""
    carbs: Optional[str] = ""
    fat: Optional[str] = ""
    fiber: Optional[str] = ""

class Recipe(BaseModel):
    name: str
    cuisine: str
    description: str
    health_benefits: List[str]
    why_good_for_you: str
    prep_time: str
    cook_time: str
    difficulty: str
    servings: int
    ingredients_used: List[str]
    additional_ingredients: List[str]
    instructions: List[str]
    nutritional_info: Optional[NutritionalInfo] = None
    health_tags: List[str] = []
    tips: Optional[str] = ""

class RecommendResponse(BaseModel):
    recipes: List[Recipe]


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChefChatRequest(BaseModel):
    recipe: Recipe
    messages: List[ChatMessage]

class ChefChatResponse(BaseModel):
    reply: str
