import React from 'react';
import { Trash2 } from 'lucide-react';

export default function EntryCard({ entry, onDelete, onClick }) {
  const handleCardClick = (e) => {
    // Don't trigger card click when clicking delete button or audio controls
    if (e.target.closest('button') || e.target.closest('audio')) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="p-4 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.95))',
        border: '2px solid rgba(205, 133, 63, 0.2)',
        boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)'
      }}
      onClick={handleCardClick}
    >
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
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '13px', color: '#A0826D' }}>{entry.time}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded-full hover:bg-red-100 transition-all"
                style={{ color: '#DC143C' }}
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div style={{
            maxHeight: '60px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.4', fontSize: '11px' }}>
              {entry.content}
            </p>
          </div>
          {entry.audio && (
            <audio controls className="w-full mt-2 h-8" onClick={(e) => e.stopPropagation()}>
              <source src={entry.audio} type="audio/webm" />
            </audio>
          )}
        </div>
      </div>
    </div>
  );
}
