'use client';

import React, { useState } from 'react';

export function AvatarSmartGroup({
  users,
  variant = 'uniform',
  size = 40,
  sizeStep = 6,
  overlap = -10,
  ringColor = 'ring-white',
  hoverScale = 1.1,
  tooltipBg = 'bg-slate-900',
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const centerIndex = Math.floor(users.length / 2);

  return (
    <div className="flex flex-row items-center justify-center flex-wrap" style={{ gap: `${overlap}px` }}>
      {users.map((user, index) => {
        const isCenter = variant === 'centered' && index === centerIndex;
        const avatarSize =
          variant === 'centered'
            ? isCenter
              ? size + sizeStep
              : size
            : size;

        const initials = user.name
          ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : '';

        return (
          <div key={index} className="relative group select-none">
            {/* Tooltip Content */}
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${tooltipBg} text-white shadow-xl rounded-xl px-3 py-1.5 text-center min-w-[120px]`}
            >
              <p className="font-extrabold text-xs whitespace-nowrap">{user.name}</p>
              {user.role && <p className="text-[10px] text-white/80 mt-0.5 whitespace-nowrap">{user.role}</p>}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>

            {/* Avatar Circle Container */}
            <div
              className={`rounded-full ring-2 ${ringColor} transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center`}
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                transform:
                  activeIndex === index
                    ? `scale(${hoverScale})`
                    : 'scale(1)',
                zIndex: activeIndex === index ? 30 : (isCenter ? 10 : index + 1),
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />
              ) : (
                <span className="font-black text-xs text-indigo-600 select-none">
                  {initials}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
