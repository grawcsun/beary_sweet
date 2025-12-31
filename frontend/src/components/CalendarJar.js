import React from 'react';

export default function CalendarJar({ day, count, isCurrentMonth, onClick }) {
  const fillLevel = Math.min((count / 3) * 100, 100);
  
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <svg width="50" height="70" viewBox="0 0 50 70" className="transition-transform hover:scale-110">
        <rect x="10" y="15" width="30" height="45" rx="2" 
          fill={isCurrentMonth ? "rgba(255, 255, 255, 0.7)" : "rgba(200, 200, 200, 0.3)"} 
          stroke="#CD853F" strokeWidth="1.5" />
        
        <rect x="8" y="11" width="34" height="6" rx="2" fill="#8B4513" />
        
        {count > 0 && (
          <rect
            x="12"
            y={15 + (45 - (45 * fillLevel / 100))}
            width="26"
            height={45 * fillLevel / 100}
            rx="1"
            fill="url(#honeyGradient)"
            opacity="0.9"
          />
        )}
        
        {fillLevel > 20 && (
          <ellipse
            cx="18"
            cy={25 + (45 - (45 * fillLevel / 100))}
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
      
      <div style={{ 
        fontFamily: 'Georgia, serif', 
        fontSize: '11px', 
        color: isCurrentMonth ? '#8B4513' : '#999',
        marginTop: '2px'
      }}>
        {day}
      </div>
      {count > 0 && (
        <div style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: '10px', 
          color: '#FF8C00',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
  );
}