import { useState, useEffect, useCallback } from 'react';

const fetchDishImage = async (recipe) => {
  const base = 'https://www.themealdb.com/api/json/v1/1';

  // Strategy 1: recipe name — try progressively shorter queries
  const words = recipe.name.split(' ');
  for (let i = words.length; i >= 1; i--) {
    try {
      const r = await fetch(`${base}/search.php?s=${encodeURIComponent(words.slice(0, i).join(' '))}`);
      const d = await r.json();
      if (d.meals?.[0]?.strMealThumb) return d.meals[0].strMealThumb;
    } catch { /* continue */ }
  }

  // Strategy 2: search by each pantry ingredient used
  for (const ing of (recipe.ingredients_used || [])) {
    const keyword = ing.split(' ').slice(-1)[0]; // last word e.g. "chicken" from "diced chicken"
    try {
      const r = await fetch(`${base}/filter.php?i=${encodeURIComponent(keyword)}`);
      const d = await r.json();
      if (d.meals?.[0]?.strMealThumb) return d.meals[0].strMealThumb;
    } catch { /* continue */ }
  }

  // Strategy 3: search by cuisine/area
  if (recipe.cuisine) {
    try {
      const r = await fetch(`${base}/filter.php?a=${encodeURIComponent(recipe.cuisine.split(' ')[0])}`);
      const d = await r.json();
      if (d.meals?.length) {
        const pick = d.meals[Math.floor(Math.random() * Math.min(5, d.meals.length))];
        if (pick.strMealThumb) return pick.strMealThumb;
      }
    } catch { /* continue */ }
  }

  // Strategy 4: random meal as last resort
  try {
    const r = await fetch(`${base}/random.php`);
    const d = await r.json();
    if (d.meals?.[0]?.strMealThumb) return d.meals[0].strMealThumb;
  } catch { /* nothing */ }

  return null;
};

export default function CookingMode({ recipe, servings, onClose }) {
  const [step, setStep] = useState(0);
  const [dishImage, setDishImage] = useState(null);
  const steps = recipe.instructions || [];
  const total = steps.length;
  const progress = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;

  // Keep screen awake
  useEffect(() => {
    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(lock => { wakeLock = lock; })
        .catch(() => {});
    }
    return () => { if (wakeLock) wakeLock.release(); };
  }, []);

  // Keyboard navigation
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowRight' && step < total - 1) setStep(s => s + 1);
    if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1);
    if (e.key === 'Escape') onClose();
  }, [step, total, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const isDone = total > 0 && step === total - 1;

  useEffect(() => {
    if (isDone && !dishImage) {
      fetchDishImage(recipe).then(url => { if (url) setDishImage(url); });
    }
  }, [isDone]);

  return (
    <div className="cooking-overlay">
      {/* Header */}
      <div className="cm-header">
        <div className="cm-title-row">
          <span className="cm-emoji">👨‍🍳</span>
          <div>
            <h2 className="cm-recipe-name">{recipe.name}</h2>
            <p className="cm-servings">Serves {servings}</p>
          </div>
        </div>
        <button className="cm-close" onClick={onClose}>✕ Exit</button>
      </div>

      {/* Progress bar */}
      <div className="cm-progress-wrap">
        <div className="cm-progress-bar">
          <div className="cm-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="cm-progress-label">Step {step + 1} of {total}</span>
      </div>

      {/* Step display */}
      <div className="cm-body">
        <div className="cm-step-number">Step {step + 1}</div>
        <p className="cm-step-text">{steps[step]}</p>

        {/* Upcoming step preview */}
        {step < total - 1 && (
          <div className="cm-next-preview">
            <span className="cm-next-label">Up next</span>
            <p className="cm-next-text">{steps[step + 1]}</p>
          </div>
        )}

        {isDone && (
          <div className="cm-done">
            <div className="cm-done-icon">🎉</div>
            <h3>You're done! Enjoy your meal.</h3>
            {dishImage && (
              <div className="cm-final-image-wrap">
                <img
                  className="cm-final-image"
                  src={dishImage}
                  alt={recipe.name}
                  onError={e => { e.target.closest('.cm-final-image-wrap').style.display = 'none'; }}
                />
                <p className="cm-final-image-label">🍽 {recipe.name}</p>
              </div>
            )}
            <button className="cm-finish-btn" onClick={onClose}>
              Back to Recipe
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!isDone && (
        <div className="cm-nav">
          <button
            className="cm-btn cm-btn--prev"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            ← Previous
          </button>
          <div className="cm-step-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`cm-dot ${i === step ? 'cm-dot--active' : ''} ${i < step ? 'cm-dot--done' : ''}`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <button
            className="cm-btn cm-btn--next"
            onClick={() => setStep(s => s + 1)}
          >
            Next Step →
          </button>
        </div>
      )}

      <p className="cm-hint">Use ← → arrow keys to navigate</p>
    </div>
  );
}
