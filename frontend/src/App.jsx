import { useState, useEffect } from 'react';
import Header from './components/Header';
import IngredientPanel from './components/IngredientPanel';
import ImageUploadPanel from './components/ImageUploadPanel';
import HealthPanel from './components/HealthPanel';
import RecipeCard from './components/RecipeCard';
import ShoppingList from './components/ShoppingList';
import { getImageRecommendations, getRecommendations } from './services/api';
import './App.css';

const DEFAULT_HEALTH = { chronic: [], dietary: [], lifestyle: [], notes: '' };

const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem('pp-saved') || '[]'); }
  catch { return []; }
};

const analysisToIngredients = (items) => (
  items
    .map((item, index) => ({
      id: `review-${Date.now()}-${index}`,
      name: (item.name || '').trim(),
      quantity: (item.estimated_quantity || item.quantity || '').trim(),
      unit: (item.unit || '').trim(),
    }))
    .filter(item => item.name)
);

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pp-theme') || 'dark');
  const [ingredients, setIngredients] = useState([]);
  const [health, setHealth] = useState(DEFAULT_HEALTH);
  const [recipes, setRecipes] = useState([]);
  const [imageAnalysis, setImageAnalysis] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState(loadSaved);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [resultsView, setResultsView] = useState('results'); // 'results' | 'saved'
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [recipeCount, setRecipeCount] = useState(5);
  const [customRecipeInput, setCustomRecipeInput] = useState('');
  const [recipeCountError, setRecipeCountError] = useState('');
  const [dishName, setDishName] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pp-theme', next);
  };

  const toggleSave = (recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.find(r => r.name === recipe.name);
      const updated = exists
        ? prev.filter(r => r.name !== recipe.name)
        : [...prev, recipe];
      localStorage.setItem('pp-saved', JSON.stringify(updated));
      return updated;
    });
  };

  const isSaved = (recipe) => savedRecipes.some(r => r.name === recipe.name);

  const handleFind = async () => {
    if (ingredients.length === 0) {
      setError('Add at least one ingredient to your pantry.');
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
    setImageAnalysis([]);
    setResultsView('results');
    try {
      const data = await getRecommendations(ingredients, health, recipeCount, dishName);
      setRecipes(data.recipes || []);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCorrectedAnalysis = async () => {
    const correctedIngredients = analysisToIngredients(imageAnalysis);
    if (correctedIngredients.length === 0) {
      setError('Keep at least one corrected ingredient before updating recipes.');
      return;
    }
    setIngredients(correctedIngredients);
    setLoading(true);
    setError('');
    setRecipes([]);
    setResultsView('results');
    try {
      const data = await getRecommendations(correctedIngredients, health);
      setRecipes(data.recipes || []);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(e.message || 'Could not update recipes from the corrected analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalyze = async (file) => {
    setImageLoading(true);
    setLoading(true);
    setError('');
    setRecipes([]);
    setImageAnalysis([]);
    setResultsView('results');
    try {
      const data = await getImageRecommendations(file, health);
      const found = data.ingredients || [];
      setImageAnalysis(data.image_analysis || found);
      setIngredients(found);
      setRecipes(data.recipes || []);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(e.message || 'Could not analyze the image. Please try another photo.');
    } finally {
      setImageLoading(false);
      setLoading(false);
    }
  };

  const totalHealth = health.chronic.length + health.dietary.length + health.lifestyle.length;
  const displayedRecipes = resultsView === 'saved' ? savedRecipes : recipes;

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">✦ AI-Powered Nutrition</div>
          <h1 className="hero-title">
            Cook Smart.<br />
            <span className="gradient-text">Eat Healthy.</span>
          </h1>
          <p className="hero-sub">
            Tell PantryPal what's in your kitchen and share your health goals.
            We'll craft the perfect recipes — tailored just for you.
          </p>
          <div className="hero-stats">
            <div className="stat"><span>{recipeCount}</span><p>Recipes per search</p></div>
            <div className="stat-divider" />
            <div className="stat"><span>AI</span><p>Powered by Claude</p></div>
            <div className="stat-divider" />
            <div className="stat"><span>0%</span><p>Food waste</p></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="food-orbit">
            <div className="orbit-ring" />
            <div className="orbit-center">🥘</div>
            {['🥕','🥦','🍳','🧅','🍅','🌿','🫙','🥚'].map((e, i) => (
              <div key={i} className="orbit-item" style={{ '--i': i, '--total': 8 }}>{e}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INPUT SECTION ── */}
      <section className="input-section">
        <div className="input-wrapper">
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'ingredients' ? 'tab-active' : ''}`} onClick={() => setActiveTab('ingredients')}>
              🥦 Ingredients {ingredients.length > 0 && <span className="tab-count">{ingredients.length}</span>}
            </button>
            <button className={`tab-btn ${activeTab === 'health' ? 'tab-active' : ''}`} onClick={() => setActiveTab('health')}>
              🩺 Health Profile {totalHealth > 0 && <span className="tab-count">{totalHealth}</span>}
            </button>
            <div className="recipe-count-row">
              <span className="recipe-label">📊 Recipes</span>
              <div className="recipe-preset-btns">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    className={`recipe-btn ${recipeCount === num ? 'recipe-btn--active' : ''}`}
                    onClick={() => setRecipeCount(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="recipe-custom">
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Custom (max 5)"
                  value={recipeCount > 3 ? recipeCount : ''}
                  onChange={e => {
                    const value = Number(e.target.value);
                    if (e.target.value === '') {
                      // Clear input
                    } else if (!Number.isNaN(value)) {
                      setRecipeCount(Math.min(5, Math.max(1, value)));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="panels-grid">
            <div className={`panel-wrapper ${activeTab === 'ingredients' ? 'panel-visible' : 'panel-hidden'}`}>
              <div className="top-panels-grid">
                <IngredientPanel ingredients={ingredients} onChange={setIngredients} />
                <ImageUploadPanel
                  analyzing={imageLoading}
                  imageAnalysis={imageAnalysis}
                  recipeLoading={loading && !imageLoading}
                  onAnalyze={handleImageAnalyze}
                  onAnalysisChange={setImageAnalysis}
                  onUseCorrected={handleUseCorrectedAnalysis}
                />
              </div>
            </div>
            <div className={`panel-wrapper ${activeTab === 'health' ? 'panel-visible' : 'panel-hidden'}`}>
              <HealthPanel profile={health} onChange={setHealth} />
            </div>
          </div>

          {error && <div className="error-toast">⚠ {error}</div>}

          <div className="dish-request-row">
            <span className="dish-request-label">🍽 Have a dish in mind? <span>(optional)</span></span>
            <input
              className="dark-inp dish-request-input"
              type="text"
              placeholder="e.g. Pasta, Biryani, Stir fry…"
              value={dishName}
              onChange={e => setDishName(e.target.value)}
            />
          </div>

          <div className="cta-area">
            <div className="cta-meta">
              <div className="cta-pill">🧺 {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}</div>
              {totalHealth > 0 && <div className="cta-pill cta-pill--green">🩺 {totalHealth} health filter{totalHealth !== 1 ? 's' : ''}</div>}
            </div>
            <div className="recipe-count-row">
              <span className="recipe-label">📊 Recipes</span>
              <div className="recipe-preset-btns">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    className={`recipe-btn ${recipeCount === num ? 'recipe-btn--active' : ''}`}
                    onClick={() => {
                      setRecipeCount(num);
                      setCustomRecipeInput('');
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="recipe-custom">
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Custom (max 5)"
                  value={recipeCount > 3 ? customRecipeInput : ''}
                  onChange={e => {
                    const input = e.target.value;
                    setCustomRecipeInput(input);
                    if (input === '') {
                      setRecipeCountError('');
                    } else {
                      const num = Number(input);
                      if (!isNaN(num) && num > 5) {
                        setRecipeCountError('Only 5 recipes allowed as of now.');
                      } else if (!isNaN(num) && num >= 1) {
                        setRecipeCountError('');
                        setRecipeCount(num);
                      }
                    }
                  }}
                />
                {recipeCountError && (
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem' }}>
                    ⚠ {recipeCountError}
                  </div>
                )}
              </div>
            </div>
            <button className="btn-cta" onClick={handleFind} disabled={loading || ingredients.length === 0}>
              {loading
                ? <><span className="cta-spinner" /> Finding your recipes…</>
                : <><span className="cta-icon">✨</span> Find My Recipes</>}
            </button>
          </div>
        </div>
      </section>

      {/* ── LOADING ── */}
      {loading && (
        <section className="loading-section">
          <div className="loading-label"><span className="pulse-dot" /> PantryPal is crafting your personalised recipes…</div>
          <div className="skeleton-grid">
            {[0,1,2].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </section>
      )}

      {/* ── RESULTS ── */}
      {(recipes.length > 0 || savedRecipes.length > 0) && !loading && (
        <section className="results-section" id="results">
          <div className="results-header">
            <div className="results-tabs">
              <button
                className={`results-tab ${resultsView === 'results' ? 'results-tab--active' : ''}`}
                onClick={() => setResultsView('results')}
                disabled={recipes.length === 0}
              >
                🍽 Recipes {recipes.length > 0 && <span className="rtab-count">{recipes.length}</span>}
              </button>
              <button
                className={`results-tab ${resultsView === 'saved' ? 'results-tab--active' : ''}`}
                onClick={() => setResultsView('saved')}
              >
                ❤️ Saved {savedRecipes.length > 0 && <span className="rtab-count">{savedRecipes.length}</span>}
              </button>
              {resultsView === 'results' && recipes.length > 0 && (
                <button className="shopping-btn" onClick={() => setShowShoppingList(true)}>
                  🛒 Shopping List
                </button>
              )}
            </div>

            <h2 className="results-title">
              {resultsView === 'saved'
                ? `${savedRecipes.length} Saved Recipe${savedRecipes.length !== 1 ? 's' : ''}`
                : `${recipes.length} Healthy Recipes Found`}
            </h2>
            <p className="results-sub">
              {resultsView === 'saved'
                ? 'Your favourites — ready to cook anytime'
                : `Based on your pantry${totalHealth > 0 ? ' & health profile' : ''} — click any card to explore`}
            </p>
          </div>

          {resultsView === 'saved' && savedRecipes.length === 0 ? (
            <div className="saved-empty">
              <span>💔</span>
              <p>No saved recipes yet. Hit the heart on any recipe to save it!</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {displayedRecipes.map((r, i) => (
                <RecipeCard
                  key={r.name + i}
                  recipe={r}
                  index={i}
                  saved={isSaved(r)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── EMPTY STATE ── */}
      {recipes.length === 0 && savedRecipes.length === 0 && !loading && (
        <section className="empty-section">
          <div className="empty-card">
            <div className="empty-emojis">
              {['🥗','🍲','🥘','🍱','🥙'].map((e, i) => (
                <span key={i} className="empty-emoji" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
              ))}
            </div>
            <h3>Your recipes are waiting</h3>
            <p>Add ingredients from your pantry, set your health preferences, and let PantryPal do the magic.</p>
          </div>
        </section>
      )}

      {/* ── SHOPPING LIST MODAL ── */}
      {showShoppingList && (
        <ShoppingList recipes={recipes} onClose={() => setShowShoppingList(false)} />
      )}

      <footer className="footer">
        <span>🥘 PantryPal</span>
        <span>·</span>
        <span>Powered by Claude (Anthropic)</span>
        <span>·</span>
        <span>2026</span>
      </footer>
    </div>
  );
}
