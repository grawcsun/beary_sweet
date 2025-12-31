import React from 'react';

export default function WeekJar({ day, count, isToday, onClick }) {
  const fillLevel = (count / 3) * 100;
  
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <svg width="40" height="60" viewBox="0 0 40 60" className="transition-transform hover:scale-110">
        <rect x="8" y="12" width="24" height="38" rx="2" fill="rgba(255, 255, 255, 0.6)" stroke="#CD853F" strokeWidth="1.5" />
        <rect x="6" y="8" width="28" height="6" rx="2" fill="#8B4513" />
        <rect
          x="10"
          y={12 + (38 - (38 * fillLevel / 100))}
          width="20"
          height={38 * fillLevel / 100}
          rx="1"
          fill="url(#honeyGradient)"
          opacity="0.9"
        />
        {fillLevel > 20 && (
          <ellipse
            cx="15"
            cy={20 + (38 - (38 * fillLevel / 100))}
            rx="3"
            ry="8"
            fill="rgba(255, 255, 255, 0.4)"
          />
        )}
        
        <defs>
          <linearGradient id="honeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="text-center mt-1">
        <div style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: '12px', 
          color: isToday ? '#FF8C00' : '#8B4513',
          fontWeight: isToday ? 'bold' : 'normal'
        }}>
          {day}
        </div>
        {isToday && (
          <div style={{ 
            fontFamily: 'Georgia, serif', 
            fontSize: '11px', 
            color: '#FF8C00',
            fontWeight: 'bold'
          }}>
            {count}/3
          </div>
        )}
      </div>
    </div>
  );
}
