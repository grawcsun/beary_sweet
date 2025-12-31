import React from 'react';

export default function FeaturePill({ icon, text, onClick, active }) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className="px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
        border: '1.5px solid rgba(205, 133, 63, 0.3)',
        boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: '#8B4513'
      }}
    >
      {icon}
      {text}
    </button>
  );
}