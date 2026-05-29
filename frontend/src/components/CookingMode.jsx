import { useState, useEffect, useCallback } from 'react';

export default function CookingMode({ recipe, servings, onClose }) {
  const [step, setStep] = useState(0);
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

      <p className="cm-hint">Use ← → arrow keys to navigate. Exiting before Mark Done records this recipe as discarded.</p>
    </div>
  );
}
