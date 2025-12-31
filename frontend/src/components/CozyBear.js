import React from 'react';

export default function CozyBear({ name, flip }) {
  return (
    <div className="flex flex-col items-center" style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <svg width="60" height="80" viewBox="0 0 60 80">
        <circle cx="15" cy="15" r="10" fill="#CD853F" />
        <circle cx="45" cy="15" r="10" fill="#CD853F" />
        <circle cx="15" cy="15" r="6" fill="#DEB887" />
        <circle cx="45" cy="15" r="6" fill="#DEB887" />
        <circle cx="30" cy="28" r="18" fill="#CD853F" />
        <ellipse cx="30" cy="33" rx="12" ry="10" fill="#DEB887" />
        <circle cx="23" cy="26" r="3" fill="#000" />
        <circle cx="37" cy="26" r="3" fill="#000" />
        <circle cx="24" cy="25" r="1" fill="#FFF" />
        <circle cx="38" cy="25" r="1" fill="#FFF" />
        <ellipse cx="30" cy="35" rx="3" ry="2" fill="#000" />
        <ellipse cx="30" cy="58" rx="16" ry="20" fill="#CD853F" />
        <ellipse cx="30" cy="60" rx="10" ry="14" fill="#DEB887" />
        <ellipse cx="14" cy="55" rx="6" ry="12" fill="#CD853F" />
        <ellipse cx="46" cy="55" rx="6" ry="12" fill="#CD853F" />
      </svg>
      <div style={{ 
        fontFamily: 'Georgia, serif', 
        fontSize: '11px', 
        color: '#8B4513',
        marginTop: '4px',
        transform: flip ? 'scaleX(-1)' : 'none'
      }}>
        {name}
      </div>
    </div>
  );
}