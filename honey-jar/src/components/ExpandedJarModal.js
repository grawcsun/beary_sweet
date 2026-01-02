import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import AnimatedJar from './AnimatedJar';
import EntryCard from './EntryCard';

export default function ExpandedJarModal({ date, entries, dayRecap, isGeneratingRecap, onClose, handleDeleteEntry, setExpandedEntry, onNavigate }) {
  // Randomly choose which bear gives the day recap
  const [recapBear] = useState(() => Math.random() > 0.5 ? 'Cherry' : 'Beary');

  const navigateDay = (direction) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + direction);
    const newDateStr = currentDate.toLocaleDateString();
    if (onNavigate) {
      onNavigate(newDateStr);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      backgroundImage: `url(${process.env.PUBLIC_URL}/ForestBackground.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Navigation arrows - outside the modal box */}
      <button
        onClick={() => navigateDay(-1)}
        className="absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all hover:scale-110"
        style={{
          color: 'white',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={() => navigateDay(1)}
        className="absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all hover:scale-110"
        style={{
          color: 'white',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

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

        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold mb-4" style={{
            fontFamily: 'Georgia, serif',
            color: '#8B4513'
          }}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          <div className="flex justify-center">
            <AnimatedJar count={entries.length} size="xlarge" skipAnimation={true} />
          </div>

          <p style={{ fontFamily: 'Georgia, serif', color: '#CD853F', marginTop: '8px' }}>
            {entries.length} honey drop{entries.length !== 1 ? 's' : ''} collected
          </p>
        </div>

        <div className="mb-6 p-6 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.6), rgba(255, 239, 213, 0.6))',
          border: '2px solid rgba(205, 133, 63, 0.3)'
        }}>
          <div className="flex items-start gap-3">
            <div style={{ width: '120px', flexShrink: 0 }}>
              <img
                src={`${process.env.PUBLIC_URL}/${recapBear}.png`}
                alt={recapBear}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error(`Failed to load bear image: ${recapBear}.png`);
                  e.target.style.display = 'none';
                }}
              />
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: '#8B4513',
                marginTop: '4px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {recapBear}
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Some Beary Good Advice For You...
              </p>
              {isGeneratingRecap ? (
                <div style={{ fontFamily: 'Georgia, serif', color: '#A0826D', lineHeight: '1.6' }}>
                  <p>✨ Analyzing your day...</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    I'm reading through your entries, understanding your emotions,
                    identifying patterns, and preparing personalized insights and recommendations just for you.
                  </p>
                </div>
              ) : (
                <div style={{
                  fontFamily: 'Georgia, serif',
                  color: '#8B4513',
                  lineHeight: '1.8',
                  fontSize: '15px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {dayRecap}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold', marginBottom: '8px' }}>
            Today's Honey Drops:
          </h4>
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeleteEntry(entry.id)}
              onClick={() => setExpandedEntry(entry)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
