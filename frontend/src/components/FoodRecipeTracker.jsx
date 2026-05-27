import { useMemo, useState } from 'react';

const PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDayKey = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const formatMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildBuckets = (period) => {
  const today = startOfDay(new Date());

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: formatDayKey(date),
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        used: 0,
        leftover: 0,
        servings: 0,
      };
    });
  }

  if (period === 'month') {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
      const day = index + 1;
      return {
        key: formatDayKey(date),
        label: day === 1 || day % 5 === 0 || day === daysInMonth ? String(day) : '',
        used: 0,
        leftover: 0,
        servings: 0,
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), index, 1);
    return {
      key: formatMonthKey(date),
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      used: 0,
      leftover: 0,
      servings: 0,
    };
  });
};

const bucketKeyFor = (date, period) => (
  period === 'year' ? formatMonthKey(date) : formatDayKey(date)
);

const getChartData = (history, period) => {
  const buckets = buildBuckets(period);
  const byKey = new Map(buckets.map(bucket => [bucket.key, bucket]));

  history.forEach((event) => {
    const date = new Date(event.date);
    if (Number.isNaN(date.getTime())) return;
    const bucket = byKey.get(bucketKeyFor(date, period));
    if (!bucket) return;
    bucket.used += event.ingredientsUsed || 0;
    bucket.leftover += event.leftoverItems || 0;
    bucket.servings += event.servings || 0;
  });

  return buckets;
};

const percent = (part, total) => (
  total > 0 ? Math.round((part / total) * 100) : 0
);

export default function FoodRecipeTracker({ stats, onReset }) {
  const [period, setPeriod] = useState('week');
  const history = stats.history || [];

  const chartData = useMemo(() => getChartData(history, period), [history, period]);
  const periodTotals = chartData.reduce((acc, item) => ({
    used: acc.used + item.used,
    leftover: acc.leftover + item.leftover,
    servings: acc.servings + item.servings,
  }), { used: 0, leftover: 0, servings: 0 });

  const lifetimeTotal = (stats.possibleWasteItems || 0);
  const unusedPct = percent(stats.leftoverItems || 0, lifetimeTotal);
  const consumedPct = percent(stats.ingredientsSaved || 0, lifetimeTotal);
  const periodTotal = periodTotals.used + periodTotals.leftover;
  const periodUnusedPct = percent(periodTotals.leftover, periodTotal);
  const maxBar = Math.max(...chartData.map(item => item.used + item.leftover), 1);

  return (
    <div className="waste-tracker">
      <div className="waste-head">
        <div>
          <p className="waste-label">Food Recipe Analytics</p>
          <h2 className="waste-title">
            {stats.completedRecipes} completed · {stats.discardedRecipes || 0} discarded
          </h2>
        </div>
        {(stats.completedRecipes > 0 || stats.discardedRecipes > 0) && (
          <button className="waste-reset" onClick={onReset} type="button">Reset</button>
        )}
      </div>

      <div className="waste-kpis">
        <div className="waste-kpi waste-kpi--risk">
          <span className="waste-kpi-value">{unusedPct}%</span>
          <span className="waste-kpi-label">unused</span>
          <span className="waste-kpi-note">{stats.leftoverItems || 0} of {lifetimeTotal} items</span>
        </div>
        <div className="waste-kpi waste-kpi--saved">
          <span className="waste-kpi-value">{consumedPct}%</span>
          <span className="waste-kpi-label">consumed</span>
          <span className="waste-kpi-note">{stats.ingredientsSaved || 0} pantry items</span>
        </div>
      </div>

      <div className="waste-grid">
        <div className="waste-metric">
          <span className="waste-value">{stats.servingsCooked || 0}</span>
          <span className="waste-text">servings cooked</span>
        </div>
        <div className="waste-metric">
          <span className="waste-value">{stats.discardedRecipes || 0}</span>
          <span className="waste-text">discarded recipes</span>
        </div>
        <div className="waste-metric">
          <span className="waste-value">{periodUnusedPct}%</span>
          <span className="waste-text">{period} unused</span>
        </div>
      </div>

      <div className="waste-chart-panel">
        <div className="waste-chart-head">
          <span>Recipe Consumption Trend</span>
          <div className="waste-periods">
            {PERIODS.map(item => (
              <button
                key={item.id}
                className={`waste-period ${period === item.id ? 'waste-period--active' : ''}`}
                onClick={() => setPeriod(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="waste-bars" aria-label={`${period} recipe consumption and discarded-items chart`}>
          {chartData.map((item) => {
            const total = item.used + item.leftover;
            const height = Math.max(4, Math.round((total / maxBar) * 100));
            const usedHeight = total ? Math.round((item.used / total) * 100) : 0;
            const leftoverHeight = total ? 100 - usedHeight : 0;

            return (
              <div key={item.key} className="waste-bar-col" title={`${item.label}: ${item.used} consumed, ${item.leftover} unused`}>
                <div className="waste-bar-track">
                  <div className="waste-bar-stack" style={{ height: `${height}%` }}>
                    <span className="waste-bar-used" style={{ height: `${usedHeight}%` }} />
                    <span className="waste-bar-leftover" style={{ height: `${leftoverHeight}%` }} />
                  </div>
                </div>
                <span className="waste-bar-label">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="waste-legend">
          <span><i className="legend-dot legend-dot--used" />Consumed</span>
          <span><i className="legend-dot legend-dot--leftover" />Unused</span>
        </div>
      </div>

      {stats.lastRecipe && (
        <p className="waste-last">Latest completed: {stats.lastRecipe}</p>
      )}
      {stats.lastWasteRecipe && (
        <p className="waste-last">Latest discarded: {stats.lastWasteRecipe}</p>
      )}
    </div>
  );
}
