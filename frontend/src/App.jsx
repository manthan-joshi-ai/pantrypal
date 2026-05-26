import { useState, useEffect } from 'react';
import Header from './components/Header';
import IngredientPanel from './components/IngredientPanel';
import HealthPanel from './components/HealthPanel';
import RecipeCard from './components/RecipeCard';
import { getRecommendations } from './services/api';
import './App.css';

const DEFAULT_HEALTH = { chronic: [], dietary: [], lifestyle: [], notes: '' };

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pp-theme') || 'dark');
  const [ingredients, setIngredients] = useState([]);
  const [health, setHealth] = useState(DEFAULT_HEALTH);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pp-theme', next);
  };
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');

  const handleFind = async () => {
    if (ingredients.length === 0) {
      setError('Add at least one ingredient to your pantry.');
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const data = await getRecommendations(ingredients, health);
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

  const totalHealth = health.chronic.length + health.dietary.length + health.lifestyle.length;

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
            <div className="stat"><span>3</span><p>Recipes per search</p></div>
            <div className="stat-divider" />
            <div className="stat"><span>AI</span><p>Powered by MiniMax</p></div>
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

          {/* Tab switcher (mobile) */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'ingredients' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              🥦 Ingredients {ingredients.length > 0 && <span className="tab-count">{ingredients.length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'health' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              🩺 Health Profile {totalHealth > 0 && <span className="tab-count">{totalHealth}</span>}
            </button>
          </div>

          <div className="panels-grid">
            <div className={`panel-wrapper ${activeTab === 'ingredients' ? 'panel-visible' : 'panel-hidden'}`}>
              <IngredientPanel ingredients={ingredients} onChange={setIngredients} />
            </div>
            <div className={`panel-wrapper ${activeTab === 'health' ? 'panel-visible' : 'panel-hidden'}`}>
              <HealthPanel profile={health} onChange={setHealth} />
            </div>
          </div>

          {error && <div className="error-toast">⚠ {error}</div>}

          {/* CTA */}
          <div className="cta-area">
            <div className="cta-meta">
              <div className="cta-pill">🧺 {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}</div>
              {totalHealth > 0 && <div className="cta-pill cta-pill--green">🩺 {totalHealth} health filter{totalHealth !== 1 ? 's' : ''}</div>}
            </div>
            <button
              className="btn-cta"
              onClick={handleFind}
              disabled={loading || ingredients.length === 0}
            >
              {loading ? (
                <><span className="cta-spinner" /> Finding your recipes…</>
              ) : (
                <><span className="cta-icon">✨</span> Find My Recipes</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── LOADING ── */}
      {loading && (
        <section className="loading-section">
          <div className="loading-label">
            <span className="pulse-dot" />
            PantryPal is crafting your personalised recipes…
          </div>
          <div className="skeleton-grid">
            {[0,1,2].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </section>
      )}

      {/* ── RESULTS ── */}
      {recipes.length > 0 && !loading && (
        <section className="results-section" id="results">
          <div className="results-header">
            <div className="results-label">✦ Your Personalised Menu</div>
            <h2 className="results-title">
              {recipes.length} Healthy Recipes Found
            </h2>
            <p className="results-sub">
              Based on your pantry{totalHealth > 0 ? ' & health profile' : ''} — click any card to explore
            </p>
          </div>
          <div className="recipes-grid">
            {recipes.map((r, i) => <RecipeCard key={i} recipe={r} index={i} />)}
          </div>
        </section>
      )}

      {/* ── EMPTY STATE ── */}
      {recipes.length === 0 && !loading && (
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

      <footer className="footer">
        <span>🥘 PantryPal</span>
        <span>·</span>
        <span>Powered by MiniMax AI on AWS Bedrock</span>
        <span>·</span>
        <span>2026</span>
      </footer>
    </div>
  );
}
