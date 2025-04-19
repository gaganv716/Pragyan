import React from 'react';
import '../public/css/components/NotificationBadge.css';

// Custom Effects object — mimicking original library
export const Effect = {
  POP: 'pop',
  ROTATE: 'rotate',
  PULSE: 'pulse'
};

const NotificationBadge = ({
  count = 0,
  effect = Effect.POP,
  className = '',
  style = {},
  containerStyle = {}
}) => {
  return (
    <div className="badge-container" style={containerStyle}>
      <button className="icon-btn">
        🔔
        {count > 0 && (
          <span
            className={`badge ${effect} ${className}`}
            style={style}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBadge;
