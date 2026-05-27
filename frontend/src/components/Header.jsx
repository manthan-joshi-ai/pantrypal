import { useState } from 'react';

export default function Header({ theme, onToggleTheme }) {
  const [showTechInfo, setShowTechInfo] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-logo">🥘</span>
          <span className="brand-name">PantryPal</span>
          <span className="brand-tag">AI Chef</span>
        </div>
        <nav className="header-nav">
          <span className="nav-badge nav-badge--orange">🤖 Ollama AI</span>
          <span className="nav-badge nav-badge--green">🩺 Health-Aware</span>
          <span className="nav-badge nav-badge--purple">📊 Recipe Tracker</span>
          <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
            <span className="theme-toggle-icon">{isDark ? '☀️' : '🌙'}</span>
            <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button className="info-button" onClick={() => setShowTechInfo(true)} title="Project AI usage details">
            ℹ️ About
          </button>
        </nav>
      </div>

      {showTechInfo && (
        <div className="info-modal-backdrop" onClick={() => setShowTechInfo(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <div>
                <h3>AI vs Human intervention</h3>
                <p>Technology and model usage in PantryPal</p>
              </div>
              <button className="modal-close" onClick={() => setShowTechInfo(false)}>✕</button>
            </div>
            <div className="info-stat-row">
              <div className="info-stat-card info-stat-card--split">
                <strong>Approximate split</strong>
                <div className="split-summary">
                  <span><strong>70%</strong> AI</span>
                  <span><strong>30%</strong> Human</span>
                </div>
                <div className="split-bar">
                  <span className="split-segment split-segment--ai" style={{ width: '70%' }} />
                  <span className="split-segment split-segment--human" style={{ width: '30%' }} />
                </div>
                <div className="split-labels">
                  <span>AI handles recipe generation, nutrition inference, and recommendation ranking.</span>
                  <span>Human input stays in ingredient choices, review, and final decision-making.</span>
                </div>
              </div>
              <div className="info-stat-card info-stat-card--stack">
                <strong>Core stack</strong>
                <div className="stack-bar">
                  <span className="stack-pill stack-pill--react">React</span>
                  <span className="stack-pill stack-pill--fastapi">FastAPI</span>
                  <span className="stack-pill stack-pill--ollama">Ollama</span>
                </div>
                <div className="stack-detail">
                  <span>React UI drives ingredient input, layout, and modal interactions.</span>
                  <span>FastAPI powers the backend API, validation, and data orchestration.</span>
                  <span>Ollama provides the AI prompt engine for recipe and nutrition responses.</span>
                </div>
              </div>
            </div>
            <div className="info-modal-body">
              <p><strong>Human intervention:</strong> user input of ingredients, health profile selection, recipe review, and manual overrides.</p>
              <p><strong>AI-powered:</strong> Ollama model generation for recipes, image analysis for food recognition, nutrition inference, and recommendation ranking.</p>
              <ul>
                <li><strong>AI model:</strong> Ollama (`phi3:mini` by default)</li>
                <li><strong>Image analysis:</strong> backend image recognition flow</li>
                <li><strong>Frontend:</strong> React + Vite with FastAPI backend</li>
                <li><strong>Backend:</strong> FastAPI, Pydantic, Requests</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
