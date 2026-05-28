export default function Header({ theme, onToggleTheme }) {
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
          <span className="nav-badge nav-badge--orange">🤖 Claude AI</span>
          <span className="nav-badge nav-badge--green">🩺 Health-Aware</span>
          <span className="nav-badge nav-badge--purple">♻️ Zero Waste</span>
          <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
            <span className="theme-toggle-icon">{isDark ? '☀️' : '🌙'}</span>
            <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
