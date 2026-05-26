const BASE = 'http://localhost:8000/api';

export async function getRecommendations(ingredients, healthProfile) {
  const res = await fetch(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, health_profile: healthProfile }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to get recommendations');
  }
  return res.json();
}
