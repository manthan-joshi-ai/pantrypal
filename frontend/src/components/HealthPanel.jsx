import { useState } from 'react';

const SECTIONS = [
  { key: 'chronic',   icon: '💊', label: 'Chronic Conditions', items: ['Diabetes','Hypertension','Heart Disease','Kidney Disease'] },
  { key: 'dietary',   icon: '🚫', label: 'Dietary Restrictions', items: ['Gluten-Free','Lactose Intolerance','Nut Allergy','Low-Sodium'] },
  { key: 'lifestyle', icon: '🏃', label: 'Lifestyle & Diet',    items: ['Vegan','Vegetarian','Keto','Low-Carb','High-Protein'] },
];

export default function HealthPanel({ profile, onChange }) {
  const [customValue, setCustomValue] = useState({ chronic: '', dietary: '', lifestyle: '' });

  const toggle = (key, val) => {
    const list = profile[key];
    onChange({ ...profile, [key]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] });
  };

  const addCustom = (key) => {
    const value = customValue[key].trim();
    if (!value) return;
    if (!profile[key].includes(value)) {
      onChange({ ...profile, [key]: [...profile[key], value] });
    }
    setCustomValue(prev => ({ ...prev, [key]: '' }));
  };

  const handleKeyDown = (e, key) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom(key);
    }
  };

  const total = profile.chronic.length + profile.dietary.length + profile.lifestyle.length;

  return (
    <div className="glass-panel">
      <div className="gp-header">
        <div className="gp-icon-wrap gp-icon--green">🩺</div>
        <div>
          <h2 className="gp-title">Health Profile</h2>
          <p className="gp-sub">{total > 0 ? `${total} condition${total > 1 ? 's' : ''} selected` : 'Personalise your recipes'}</p>
        </div>
      </div>

      {SECTIONS.map(({ key, icon, label, items }) => (
        <div key={key} className="hp-section">
          <p className="hp-section-label">{icon} {label}</p>
          <div className="hp-chips">
            {items.map(item => {
              const active = profile[key].includes(item);
              return (
                <button
                  key={item}
                  className={`hp-chip ${active ? 'hp-chip--active' : ''}`}
                  onClick={() => toggle(key, item)}
                >
                  {active && <span className="hp-check">✓</span>}
                  {item}
                </button>
              );
            })}
          </div>

          <div className="hp-custom-row">
            <input
              className="dark-inp"
              type="text"
              placeholder={`Add custom ${label.toLowerCase().replace(' & ', ' ')}...`}
              value={customValue[key]}
              onChange={(e) => setCustomValue(prev => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, key)}
            />
            <button type="button" className="hp-custom-add" onClick={() => addCustom(key)}>
              Add
            </button>
          </div>
        </div>
      ))}

      <div className="hp-notes">
        <p className="hp-section-label">📝 Additional notes</p>
        <textarea
          className="dark-textarea"
          placeholder="E.g. post-surgery recovery, low energy, prefer anti-inflammatory foods…"
          value={profile.notes}
          onChange={e => onChange({ ...profile, notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
