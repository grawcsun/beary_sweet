import React from 'react';
import { X } from 'lucide-react';
import FeaturedHoneyJar from './FeaturedHoneyJar';
import CozyBear from './CozyBear';
import EntryCard from './EntryCard';

export default function ExpandedJarModal({ date, entries, dayRecap, isGeneratingRecap, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: 'rgba(139, 111, 71, 0.9)',
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

        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold mb-4" style={{
            fontFamily: 'Georgia, serif',
            color: '#8B4513'
          }}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          
          <FeaturedHoneyJar fillLevel={(entries.length / 3) * 100} />
          
          <p style={{ fontFamily: 'Georgia, serif', color: '#CD853F', marginTop: '8px' }}>
            {entries.length} honey drop{entries.length !== 1 ? 's' : ''} collected
          </p>
        </div>

        <div className="mb-6 p-6 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.6), rgba(255, 239, 213, 0.6))',
          border: '2px solid rgba(205, 133, 63, 0.3)'
        }}>
          <div className="flex items-start gap-3">
            <CozyBear name="Cherry" />
            <div className="flex-1">
              <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                Cherry's Day Recap:
              </p>
              {isGeneratingRecap ? (
                <p style={{ fontFamily: 'Georgia, serif', color: '#A0826D', lineHeight: '1.6' }}>
                  Thinking about your day... ✨
                </p>
              ) : (
                <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.6' }}>
                  {dayRecap}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold', marginBottom: '8px' }}>
            Today's Honey Drops:
          </h4>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
