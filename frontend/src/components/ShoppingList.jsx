import { useState } from 'react';

export default function ShoppingList({ recipes, onClose }) {
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState({});

  // Deduplicate additional ingredients across all recipes
  const items = [...new Set(
    recipes.flatMap(r => r.additional_ingredients || [])
  )].filter(Boolean);

  const toggleCheck = (item) =>
    setChecked(prev => ({ ...prev, [item]: !prev[item] }));

  const copyToClipboard = () => {
    const text = `🛒 Shopping List — PantryPal\n\n` +
      items.map(i => `${checked[i] ? '✓' : '•'} ${i}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const uncheckedCount = items.filter(i => !checked[i]).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span>🛒</span>
            <div>
              <h2 className="modal-title">Shopping List</h2>
              <p className="modal-sub">
                {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} needed across {recipes.length} recipes
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="modal-empty">
            <span>🎉</span>
            <p>You already have everything you need!</p>
          </div>
        ) : (
          <>
            <div className="sl-list">
              {items.map(item => (
                <label key={item} className={`sl-item ${checked[item] ? 'sl-item--checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!checked[item]}
                    onChange={() => toggleCheck(item)}
                  />
                  <span className="sl-check">{checked[item] ? '✓' : ''}</span>
                  <span className="sl-name">{item}</span>
                </label>
              ))}
            </div>

            <div className="modal-footer">
              <button className="sl-copy-btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
              <button
                className="sl-clear-btn"
                onClick={() => setChecked({})}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
