'use client';

import { memo, useMemo, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * Vertical wheel-select on the left edge of the journey section.
 * Groups milestones by year → month. Clicking a month-jump scrolls
 * the camera to the nearest milestone. The active entry follows the
 * current scroll position via activeIndex.
 */
function JourneyWheel({ nodes, activeIndex, onSelect }) {
  const activeRef = useRef(null);

  const entries = useMemo(() => {
    if (!nodes.length) return [];
    const result = [];
    let lastYM = '';

    nodes.forEach((n, i) => {
      const sd = n.achievement.sortDate || '';
      const ym = sd.slice(0, 7); // "YYYY-MM"
      if (ym === lastYM) return;
      lastYM = ym;

      const [year, month] = ym.split('-');
      const mi = parseInt(month, 10) - 1;
      result.push({
        key: ym,
        year: parseInt(year, 10),
        month: mi,
        label: `${MONTH_NAMES[mi]}`,
        yearLabel: year,
        nodeIndex: i,
        isYearBoundary: mi === 0 || result.length === 0,
      });
    });
    return result;
  }, [nodes]);

  const activeYM = useMemo(() => {
    if (!nodes.length || activeIndex < 0) return '';
    const sd = nodes[activeIndex]?.achievement.sortDate || '';
    return sd.slice(0, 7);
  }, [nodes, activeIndex]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' });
    }
  }, [activeYM]);

  if (!entries.length) return null;

  let prevYear = null;

  return (
    <div className="journey-wheel" aria-label="Navigasi bulan">
      <div className="journey-wheel-track">
        {entries.map((e) => {
          const showYear = e.year !== prevYear;
          prevYear = e.year;
          const isActive = e.key === activeYM;
          return (
            <div key={e.key} className="journey-wheel-group">
              {showYear && <span className="journey-wheel-year">{e.yearLabel}</span>}
              <button
                ref={isActive ? activeRef : null}
                className={`journey-wheel-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelect(e.nodeIndex)}
                aria-label={`${MONTH_NAMES[e.month]} ${e.yearLabel}`}
              >
                <span className="journey-wheel-dot" />
                <span className="journey-wheel-label">{e.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(JourneyWheel);
