import React, { useState } from 'react';
import AnimatedJar from './AnimatedJar';
import CozyBear from './CozyBear';
import EntryCard from './EntryCard';

export default function TodayView({ entries, getCurrentWeekJars, getTodayEntries, todayCount, canAddMore, setShowForm, setSelectedDate, handleJarClick, handleWeekJarClick, handleDeleteEntry, setExpandedEntry }) {
  // Randomly choose which bear gives the daily message
  const [dailyBear] = useState(() => Math.random() > 0.5 ? 'Cherry' : 'Beary');
  const bearEmoji = dailyBear === 'Cherry' ? '🍒🌿' : '🐻🍯';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="mb-4 mt-12">
        <div className="flex justify-between items-center mb-6">
          <span style={{ color: '#FFE4B5', fontFamily: 'Georgia, serif', fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
            Current Week
          </span>
          <div className="text-right">
            <div style={{ color: '#FFE4B5', fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div style={{ color: '#FFD700', fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Drops: {todayCount} / 3
            </div>
          </div>
        </div>

        <div className="flex justify-center items-end mb-1" style={{ marginTop: '38px', marginLeft: '20px' }}>
          {getCurrentWeekJars().map((jar, idx) => (
            <div key={idx} className="flex flex-col items-center" style={{ marginBottom: '20px', marginLeft: idx > 0 ? '-5px' : '0' }}>
              <AnimatedJar
                count={jar.count}
                size="small"
                onClick={() => handleWeekJarClick(jar.date, jar.count)}
                isToday={jar.isToday}
              />
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                color: jar.isToday ? '#FFD700' : '#FFE4B5',
                fontWeight: 'bold',
                marginTop: '12px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                marginLeft: '-10px'
              }}>
                {jar.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3" style={{ marginTop: '-90px' }}>
        <div className="flex justify-center mb-2" style={{ marginLeft: '30px' }}>
          <AnimatedJar count={todayCount} size="xlarge" />
        </div>
      </div>

      <div className="mb-3" style={{ marginTop: '-160px' }}>
        <div className="flex items-center justify-between mb-2 px-2">
          <CozyBear name="BEARY" size="large" />
          <div style={{ width: '150px' }} />
          <CozyBear name="CHERRY" size="large" />
        </div>

        <div className="p-3 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(251, 224, 179, 0.95), rgba(251, 224, 179, 0.95)',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
        }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{bearEmoji}</span>
            <div>
              <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', lineHeight: '1.4', fontSize: '11px' }}>
                <strong>{dailyBear}:</strong> I'm noticing a calm, nature-y glow in your jar ✨
              </p>
              <p style={{ fontFamily: 'Georgia, serif', color: '#A0826D', fontSize: '9px', marginTop: '4px' }}>
                Tip: Aim for 1~3 drops/day. Small is sustainable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {canAddMore && (
        <div className="mb-2 p-2 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(251, 224, 179, 0.95), rgba(251, 224, 179, 0.95))',
          boxShadow: '0 4px 16px rgba(139, 69, 19, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.6)'
        }}>
          <div className="flex items-center gap-2">
            <div className="text-xl">🐻</div>
            <input
              type="text"
              placeholder="What are you adding into your honey jar?"
              onClick={() => {
                setSelectedDate(null);
                setShowForm(true);
              }}
              readOnly
              className="flex-1 p-2 rounded-xl border-none outline-none cursor-pointer text-xs"
              style={{
                background: 'rgba(255, 248, 220, 0.6)',
                fontFamily: 'Georgia, serif',
                color: '#8B4513'
              }}
            />
            <button
              onClick={() => {
                setSelectedDate(null);
                setShowForm(true);
              }}
              className="px-3 py-2 rounded-full font-semibold transition-all hover:scale-105 text-xs"
              style={{
                background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                color: 'white',
                fontFamily: 'Georgia, serif',
                fontSize: '10px',
                boxShadow: '0 2px 6px rgba(255, 140, 0, 0.4)'
              }}
            >
              Add Drop
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {getTodayEntries().map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onDelete={() => handleDeleteEntry(entry.id)}
            onClick={() => setExpandedEntry(entry)}
          />
        ))}
      </div>
    </div>
  );
}
