import React from 'react';

export default function FeaturedHoneyJar({ fillLevel }) {
  return (
    <div className="flex-1 flex justify-center">
      <svg width="120" height="160" viewBox="0 0 120 160">
        <rect x="20" y="30" width="80" height="100" rx="4" fill="rgba(255, 255, 255, 0.7)" stroke="#CD853F" strokeWidth="2" />
        <rect x="15" y="20" width="90" height="12" rx="3" fill="#8B4513" />
        <ellipse cx="60" cy="20" rx="45" ry="6" fill="#A0522D" />
        <rect
          x="24"
          y={30 + (100 - (100 * fillLevel / 100))}
          width="72"
          height={100 * fillLevel / 100}
          rx="3"
          fill="url(#featuredHoney)"
          opacity="0.95"
        />
        
        {fillLevel > 30 && (
          <>
            <circle cx="40" cy="90" r="2" fill="#FFD700" opacity="0.8" />
            <circle cx="80" cy="100" r="2" fill="#FFD700" opacity="0.8" />
            <circle cx="60" cy="110" r="3" fill="#FFD700" opacity="0.8" />
          </>
        )}
        
        <ellipse cx="35" cy="60" rx="8" ry="30" fill="rgba(255, 255, 255, 0.3)" />
        
        {fillLevel > 50 && (
          <path d="M 60 30 Q 58 35, 60 40 T 60 45" stroke="#FFA500" strokeWidth="3" fill="none" opacity="0.6" />
        )}
        
        <defs>
          <linearGradient id="featuredHoney" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}