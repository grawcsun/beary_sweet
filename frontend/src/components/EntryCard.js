import React from 'react';

export default function EntryCard({ entry }) {
  return (
    <div className="p-4 rounded-2xl" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.95))',
      border: '2px solid rgba(205, 133, 63, 0.2)',
      boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)'
    }}>
      <div className="flex gap-3">
        {entry.photo && (
          <img
            src={entry.photo}
            alt="Memory"
            className="w-24 h-24 rounded-xl object-cover"
            style={{ border: '2px solid rgba(205, 133, 63, 0.3)' }}
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#A0826D', fontWeight: 'bold' }}>
              {entry.date}
            </span>
            <span style={{ fontSize: '13px', color: '#A0826D' }}>{entry.time}</span>
          </div>
          <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.6' }}>
            {entry.content}
          </p>
          {entry.audio && (
            <audio controls className="w-full mt-2 h-8">
              <source src={entry.audio} type="audio/wav" />
            </audio>
          )}
        </div>
      </div>
    </div>
  );
}
