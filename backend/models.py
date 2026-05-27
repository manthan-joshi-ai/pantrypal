from pydantic import BaseModel, Field
from typing import List, Optional

class Ingredient(BaseModel):
    id: str
    name: str
    quantity: Optional[str] = ""
    unit: Optional[str] = ""

class HealthProfile(BaseModel):
    chronic: List[str] = Field(default_factory=list)        # Diabetes, Hypertension, Heart Disease, Kidney Disease
    dietary: List[str] = Field(default_factory=list)        # Gluten-free, Lactose intolerance, Nut allergy, Low-sodium
    lifestyle: List[str] = Field(default_factory=list)      # Vegan, Vegetarian, Keto, Low-carb, High-protein
    notes: Optional[str] = ""

class RecommendRequest(BaseModel):
    ingredients: List[Ingredient]
    health_profile: HealthProfile
    recipe_count: int = Field(3, ge=1, le=5)

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
    health_tags: List[str] = Field(default_factory=list)
    tips: Optional[str] = ""

class RecommendResponse(BaseModel):
    recipes: List[Recipe]

class ImageAnalysisItem(BaseModel):
    name: str
    estimated_quantity: Optional[str] = ""
    unit: Optional[str] = ""
    confidence: Optional[str] = ""
    category: Optional[str] = ""
    notes: Optional[str] = ""

class ImageRecommendResponse(RecommendResponse):
    ingredients: List[Ingredient]
    image_analysis: List[ImageAnalysisItem] = Field(default_factory=list)

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChefChatRequest(BaseModel):
    recipe: Recipe
    messages: List[ChatMessage]

class ChefChatResponse(BaseModel):
    reply: str