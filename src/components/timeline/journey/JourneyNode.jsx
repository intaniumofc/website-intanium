'use client';

import { memo } from 'react';
import { Star } from 'lucide-react';

const CATEGORY_CLASS = {
  Milestone: 'milestone',
  Theater: 'theater',
  Live: 'live',
  'Video Call': 'video-call',
  Event: 'event',
  Content: 'content',
  'Fan Project': 'fan-project',
};

/**
 * A single destination marker on the path.
 *  - inactive : small, faint
 *  - lit      : previously visited, stays illuminated
 *  - active   : gold glow + pulse + ring ripple
 * Real <button> so it is clickable and keyboard-navigable.
 */
function JourneyNode({ achievement, state, onSelect }) {
  const category = CATEGORY_CLASS[achievement.category] || 'milestone';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Menuju ${achievement.title}`}
      aria-current={state === 'active' ? 'true' : undefined}
      className={`journey-node ${category} state-${state} ${achievement.isMajor ? 'is-major' : ''}`}
    >
      <span className="journey-node-ripple" aria-hidden="true" />
      <span className="journey-node-ripple journey-node-ripple-2" aria-hidden="true" />
      <span className="journey-node-core">
        {achievement.isMajor && <Star className="journey-node-star" aria-hidden="true" />}
      </span>
    </button>
  );
}

export default memo(JourneyNode);
