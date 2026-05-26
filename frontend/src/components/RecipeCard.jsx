import { useState } from 'react';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #ff6b35, #f7c59f)',
  'linear-gradient(135deg, #00c48c, #00e5a0)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
];

const DIFF_STYLE = {
  Easy:   { bg: '#00c48c22', color: '#00c48c', label: '● Easy' },
  Medium: { bg: '#f59e0b22', color: '#f59e0b', label: '◆ Medium' },
  Hard:   { bg: '#ef444422', color: '#ef4444', label: '▲ Hard' },
};

export default function RecipeCard({ recipe, index }) {
  const [open, setOpen] = useState(index === 0);
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const diff = DIFF_STYLE[recipe.difficulty] || DIFF_STYLE.Easy;

  return (
    <div className="rcard">
      {/* Card top banner */}
      <div className="rcard-banner" style={{ background: grad }} onClick={() => setOpen(!open)}>
        <div className="rcard-banner-left">
          <span className="rcard-index">0{index + 1}</span>
          <div>
            <h3 className="rcard-name">{recipe.name}</h3>
            <span className="rcard-cuisine">{recipe.cuisine}</span>
          </div>
        </div>
        <button className="rcard-toggle">{open ? '▲' : '▼'}</button>
      </div>

      {/* Card summary strip */}
      <div className="rcard-strip">
        <div className="rcard-strip-item">⏱ <span>{recipe.prep_time}</span> prep</div>
        <div className="rcard-strip-sep" />
        <div className="rcard-strip-item">🔥 <span>{recipe.cook_time}</span> cook</div>
        <div className="rcard-strip-sep" />
        <div className="rcard-strip-item">👤 <span>{recipe.servings}</span> servings</div>
        <div className="rcard-strip-sep" />
        <div className="rcard-strip-item diff-item" style={{ color: diff.color, background: diff.bg }}>
          {diff.label}
        </div>
      </div>

      {/* Health tags */}
      {recipe.health_tags?.length > 0 && (
        <div className="rcard-tags">
          {recipe.health_tags.map(tag => <span key={tag} className="rcard-tag">✓ {tag}</span>)}
        </div>
      )}

      {/* Description */}
      <p className="rcard-desc">{recipe.description}</p>

      {/* Why good for you */}
      <div className="rcard-why">
        <span className="why-icon">💚</span>
        <p>{recipe.why_good_for_you}</p>
      </div>

      {/* Expandable body */}
      {open && (
        <div className="rcard-body">
          <div className="rcard-cols">

            {/* Left col */}
            <div className="rcard-col">
              <h4 className="col-title">From Your Pantry</h4>
              <div className="ingredient-list-dark">
                {recipe.ingredients_used?.map((i, k) => (
                  <div key={k} className="idark idark--matched">
                    <span className="idark-dot" style={{ background: grad }} />
                    {i}
                  </div>
                ))}
                {recipe.additional_ingredients?.map((i, k) => (
                  <div key={k} className="idark idark--extra">
                    <span className="idark-dot idark-dot--muted" />
                    {i} <span className="idark-needed">(needed)</span>
                  </div>
                ))}
              </div>

              {recipe.nutritional_info && (
                <div className="nutrition-card">
                  <h4 className="col-title">Nutrition / Serving</h4>
                  {[
                    { label: 'Calories', val: recipe.nutritional_info.calories, color: '#ff6b35' },
                    { label: 'Protein',  val: recipe.nutritional_info.protein,  color: '#00c48c' },
                    { label: 'Carbs',    val: recipe.nutritional_info.carbs,    color: '#a855f7' },
                    { label: 'Fat',      val: recipe.nutritional_info.fat,      color: '#f59e0b' },
                    { label: 'Fiber',    val: recipe.nutritional_info.fiber,    color: '#06b6d4' },
                  ].filter(n => n.val).map(n => (
                    <div key={n.label} className="nutr-row">
                      <span className="nutr-dot" style={{ background: n.color }} />
                      <span className="nutr-label">{n.label}</span>
                      <span className="nutr-val">{n.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="rcard-col">
              <h4 className="col-title">Instructions</h4>
              <div className="steps-list">
                {recipe.instructions?.map((step, k) => (
                  <div key={k} className="step-item">
                    <div className="step-num" style={{ background: grad }}>{k + 1}</div>
                    <p className="step-text">{step}</p>
                  </div>
                ))}
              </div>

              {recipe.tips && (
                <div className="tip-card">
                  <span className="tip-icon">💡</span>
                  <div>
                    <p className="tip-label">Chef's Tip</p>
                    <p className="tip-text">{recipe.tips}</p>
                  </div>
                </div>
              )}

              {recipe.health_benefits?.length > 0 && (
                <div className="benefits-list">
                  {recipe.health_benefits.map((b, k) => (
                    <div key={k} className="benefit-row">
                      <span className="benefit-icon">🌱</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
