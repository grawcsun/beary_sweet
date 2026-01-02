import React from 'react';

export default function MagicalForestBackground() {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#FFD700',
            boxShadow: '0 0 10px #FFD700',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: '3s'
          }}
        />
      ))}

      {/* Honey drips along the top */}
      <div className="absolute top-0 left-0 right-0 h-24 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={`drip-${i}`}
            className="absolute"
            style={{
              left: `${(i * 8.33) + Math.random() * 3}%`,
              top: '-10px',
              width: '20px',
              height: '60px',
              background: 'linear-gradient(to bottom, #FFA500, #FF8C00, transparent)',
              borderRadius: '0 0 50% 50%',
              opacity: 0.6,
              animation: `drip ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: 'linear-gradient(to top, rgba(107, 142, 35, 0.3), transparent)'
      }} />
    </div>
  );
}
