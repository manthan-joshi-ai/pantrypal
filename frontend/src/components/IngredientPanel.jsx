import { useState } from 'react';

const QUICK = ['Eggs', 'Rice', 'Chicken', 'Tomato', 'Onion', 'Garlic', 'Spinach', 'Lentils', 'Oats', 'Tofu', 'Carrot', 'Potato'];

export default function IngredientPanel({ ingredients, onChange }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onChange([...ingredients, { id: Date.now().toString(), name: name.trim(), quantity: qty.trim(), unit: unit.trim() }]);
    setName(''); setQty(''); setUnit('');
  };

  const quickAdd = (item) => {
    if (ingredients.find(i => i.name.toLowerCase() === item.toLowerCase())) return;
    onChange([...ingredients, { id: Date.now().toString(), name: item, quantity: '', unit: '' }]);
  };

  const remove = (id) => onChange(ingredients.filter(i => i.id !== id));

  return (
    <div className="glass-panel">
      <div className="gp-header">
        <div className="gp-icon-wrap gp-icon--orange">🥦</div>
        <div>
          <h2 className="gp-title">Ingredients</h2>
          <p className="gp-sub">What's in your kitchen?</p>
        </div>
        {ingredients.length > 0 && (
          <button className="gp-clear" onClick={() => onChange([])}>Clear</button>
        )}
      </div>

      <form className="ing-form" onSubmit={add}>
        <div className="ing-form-main">
          <input className="dark-inp" placeholder="Add ingredient…" value={name} onChange={e => setName(e.target.value)} required />
          <input className="dark-inp dark-inp--sm" placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} />
          <select className="dark-sel" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value="">Unit</option>
            {['g','kg','ml','L','cups','tbsp','tsp','pcs','slices'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <button className="btn-add-dark" type="submit">+ Add</button>
      </form>

      <div className="quick-section">
        <p className="quick-title">Quick add</p>
        <div className="quick-row">
          {QUICK.map(item => {
            const added = ingredients.some(i => i.name.toLowerCase() === item.toLowerCase());
            return (
              <button key={item} className={`quick-chip ${added ? 'quick-chip--added' : ''}`} onClick={() => quickAdd(item)}>
                {added ? '✓ ' : ''}{item}
              </button>
            );
          })}
        </div>
      </div>

      {ingredients.length === 0 ? (
        <div className="gp-empty">
          <span>🛒</span>
          <p>Add ingredients or use quick-add above</p>
        </div>
      ) : (
        <div className="ing-tags">
          {ingredients.map(ing => (
            <div key={ing.id} className="ing-tag">
              <span className="ing-tag-name">{ing.name}</span>
              {ing.quantity && <span className="ing-tag-qty">{ing.quantity}{ing.unit}</span>}
              <button className="ing-tag-remove" onClick={() => remove(ing.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
