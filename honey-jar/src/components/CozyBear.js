import React, { useState, useEffect } from 'react';

export default function CozyBear({ name, flip, size = 'default' }) {
  const [bounceOffset, setBounceOffset] = useState(0);
  const bearSize = size === 'large' ? { width: '150px', height: '150px', fontSize: '12px' } : { width: '80px', height: '80px', fontSize: '10px' };

  // Bounce animation
  useEffect(() => {
    const bounce = setInterval(() => {
      setBounceOffset(prev => {
        const next = prev + 0.1;
        return next > Math.PI * 2 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(bounce);
  }, []);

  const bounceY = Math.sin(bounceOffset) * 5;

  return (
    <div className="flex flex-col items-center" style={{
      transform: flip ? 'scaleX(-1)' : 'none',
      transition: 'transform 0.1s ease-out'
    }}>
      <img
        src={`${process.env.PUBLIC_URL}/${name}.png`}
        alt={name}
        style={{
          width: bearSize.width,
          height: bearSize.height,
          objectFit: 'contain',
          transform: `translateY(${bounceY}px)`
        }}
        onError={(e) => {
          console.error(`Failed to load image: ${name}.png`);
          e.target.style.display = 'none';
        }}
      />
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: bearSize.fontSize,
        color: '#FFFFFF',
        marginTop: '8px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        transform: flip ? 'scaleX(-1)' : 'none'
      }}>
        {name}
      </div>
    </div>
  );
}
