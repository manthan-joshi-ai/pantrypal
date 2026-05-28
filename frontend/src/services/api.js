const BASE = 'http://localhost:8000/api';

export async function getRecommendations(ingredients, healthProfile, recipeCount, dishName = '') {
  const res = await fetch(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, health_profile: healthProfile, recipe_count: recipeCount, dish_name: dishName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to get recommendations');
  }
  return res.json();
}

export async function getImageRecommendations(file, healthProfile) {
  const form = new FormData();
  form.append('image', file);
  form.append('health_profile', JSON.stringify(healthProfile));

  const res = await fetch(`${BASE}/recommend/image`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to analyze image');
  }
  return res.json();
}

export async function chefChat(recipe, messages) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, messages }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Chat failed');
  }
  return res.json();
}
