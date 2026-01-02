import React from 'react';
import { X } from 'lucide-react';

export default function ExpandedEntryModal({ entry, onClose, onEdit, onDelete }) {
  const getMoodEmoji = (mood) => {
    const emojis = {
      grateful: '🙏',
      joyful: '😊',
      peaceful: '🧘',
      excited: '🎉',
      anxious: '😰'
    };
    return emojis[mood] || '💛';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: 'rgba(139, 111, 71, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl relative" style={{
        background: 'linear-gradient(135deg, #FFF9E6, #FFFAF0)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '3px solid rgba(255, 255, 255, 0.8)'
      }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 transition-all"
          style={{ color: '#8B4513' }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{
                fontFamily: 'Georgia, serif',
                color: '#8B4513'
              }}>
                Honey Drop Details
              </h3>
              <p style={{ fontFamily: 'Georgia, serif', color: '#A0826D', fontSize: '14px' }}>
                {entry.date} at {entry.time}
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-2xl" style={{
            background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.6), rgba(255, 239, 213, 0.6))',
            border: '2px solid rgba(205, 133, 63, 0.3)'
          }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: '24px' }}>{getMoodEmoji(entry.mood)}</span>
              <span style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {entry.mood}
              </span>
            </div>
            <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.8', fontSize: '16px' }}>
              {entry.content}
            </p>
          </div>

          {entry.photo && (
            <div className="mb-6">
              <h4 style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
                Photo Memory
              </h4>
              <img
                src={entry.photo}
                alt="Memory"
                className="w-full rounded-2xl object-cover"
                style={{
                  border: '3px solid rgba(205, 133, 63, 0.3)',
                  maxHeight: '400px'
                }}
              />
            </div>
          )}

          {entry.audio && (
            <div className="mb-6">
              <h4 style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
                Voice Memo
              </h4>
              <audio controls className="w-full" style={{
                borderRadius: '12px',
                background: 'rgba(255, 248, 220, 0.6)',
                padding: '8px'
              }}>
                <source src={entry.audio} type="audio/webm" />
              </audio>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: 'white',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 12px rgba(255, 140, 0, 0.4)'
            }}
          >
            Edit Entry
          </button>
          <button
            onClick={onDelete}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #DC143C, #8B0000)',
              color: 'white',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
