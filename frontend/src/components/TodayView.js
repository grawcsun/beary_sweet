import React from 'react';
import { Lock, Camera, Sparkles } from 'lucide-react';
import WeekJar from './WeekJar';
import FeaturedHoneyJar from './FeaturedHoneyJar';
import CozyBear from './CozyBear';
import CuteBearBottom from './CuteBearBottom';
import FeaturePill from './FeaturePill';
import EntryCard from './EntryCard';

export default function TodayView({ entries, getCurrentWeekJars, getTodayEntries, todayCount, canAddMore, setShowForm, handleJarClick }) {
  return (
    <>
      <div className="mb-6 p-6 rounded-3xl" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
        boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }}>
        <div className="flex justify-between items-center mb-4 px-2">
          <span style={{ color: '#8B4513', fontFamily: 'Georgia, serif', fontSize: '14px' }}>
            Current Week
          </span>
          <div className="text-right">
            <div style={{ color: '#8B4513', fontFamily: 'Georgia, serif', fontSize: '14px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div style={{ color: '#CD853F', fontFamily: 'Georgia, serif', fontSize: '14px' }}>
              Honey drops: {todayCount} / 3
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-end mb-2">
          {getCurrentWeekJars().map((jar, idx) => (
            <WeekJar 
              key={idx} 
              day={jar.day} 
              count={jar.count} 
              isToday={jar.isToday}
              onClick={() => handleJarClick(jar.date)}
            />
          ))}
        </div>
        
        <div className="h-2 rounded-full mt-2" style={{
          background: 'linear-gradient(to bottom, #8B4513, #654321)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }} />
      </div>

      <div className="mb-6 p-6 rounded-3xl relative" style={{
        background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.95), rgba(255, 239, 213, 0.95))',
        boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.6)'
      }}>
        <div className="flex items-center gap-4 mb-4">
          <CozyBear name="Beary" />
          <FeaturedHoneyJar fillLevel={(todayCount / 3) * 100} />
          <CozyBear name="Cherry" flip />
        </div>
        
        <div className="p-4 rounded-2xl relative" style={{
          background: 'linear-gradient(135deg, #FFF9E6, #FFFAF0)',
          border: '2px solid rgba(205, 133, 63, 0.3)',
          boxShadow: 'inset 0 2px 8px rgba(205, 133, 63, 0.1)'
        }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍒🌿</span>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.6' }}>
                <strong>Cherry:</strong> I'm noticing a calm, nature-y glow in your jar ✨
              </p>
              <p style={{ fontFamily: 'Georgia, serif', color: '#A0826D', fontSize: '13px', marginTop: '8px' }}>
                Tip: Aim for 1~3 drops/day. Small is sustainable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6 justify-center flex-wrap">
        <FeaturePill icon={<Lock className="w-4 h-4" />} text="Privacy-first" />
        <FeaturePill icon={<Camera className="w-4 h-4" />} text="Photos + Voice" />
        <FeaturePill icon={<Sparkles className="w-4 h-4" />} text="Gentle reflections" />
      </div>

      {canAddMore && (
        <div className="mb-6 p-4 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 240, 0.95))',
          boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.6)'
        }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐻</div>
            <input
              type="text"
              placeholder="What are you grateful for today?"
              onClick={() => setShowForm(true)}
              readOnly
              className="flex-1 p-3 rounded-2xl border-none outline-none cursor-pointer"
              style={{
                background: 'rgba(255, 248, 220, 0.6)',
                fontFamily: 'Georgia, serif',
                color: '#8B4513'
              }}
            />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                color: 'white',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 4px 12px rgba(255, 140, 0, 0.4)'
              }}
            >
              Add Honey Drop
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {getTodayEntries().map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-8">
        <CuteBearBottom />
        <div className="text-4xl">🍒🍒</div>
      </div>
    </>
  );
}