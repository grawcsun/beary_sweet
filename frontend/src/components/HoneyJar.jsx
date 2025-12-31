import React, { useState, useEffect, useRef } from 'react';
import { Heart, Mic, MicOff, Camera, Sparkles, Lock, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function HoneyJarApp() {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ content: '', mood: 'grateful', photo: null, audio: null });
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('today'); // 'today' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedDay, setExpandedDay] = useState(null);
  const [dayRecap, setDayRecap] = useState(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const saved = localStorage.getItem('honeyJarEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('honeyJarEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const handleAddEntry = () => {
    if (currentEntry.content.trim() || currentEntry.photo || currentEntry.audio) {
      const newEntry = {
        id: Date.now(),
        ...currentEntry,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setEntries([newEntry, ...entries]);
      setCurrentEntry({ content: '', mood: 'grateful', photo: null, audio: null });
      setShowForm(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentEntry({ ...currentEntry, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setCurrentEntry({ ...currentEntry, audio: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const generateDayRecap = async (dateStr) => {
    const dayEntries = entries.filter(e => e.date === dateStr);
    if (dayEntries.length === 0) return;
    
    setIsGeneratingRecap(true);
    
    const entrySummary = dayEntries.map(e => e.content).join('\n');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are Cherry, a gentle bear companion. Here are gratitude entries from ${dateStr}:\n\n${entrySummary}\n\nProvide a warm recap (2-3 sentences) covering: emotions felt, what happened, places mentioned, and people involved. Be specific and caring.`
          }]
        })
      });

      const data = await response.json();
      const recapText = data.content[0].text;
      setDayRecap(recapText);
    } catch (error) {
      console.error('Error generating recap:', error);
      setDayRecap("What a lovely day filled with gratitude! 🍯✨");
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const handleJarClick = (dateStr) => {
    setExpandedDay(dateStr);
    generateDayRecap(dateStr);
  };

  const getTodayEntries = () => {
    const today = new Date().toLocaleDateString();
    return entries.filter(e => e.date === today);
  };

  const getCurrentWeekJars = () => {
    const week = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    
    // Start from Sunday of current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOfWeek + i);
      const dateStr = date.toLocaleDateString();
      const dayEntries = entries.filter(e => e.date === dateStr);
      const isToday = dateStr === new Date().toLocaleDateString();
      
      week.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        date: dateStr,
        dateObj: date,
        count: dayEntries.length,
        isToday
      });
    }
    return week;
  };

  const getMonthWeeks = () => {
    const weeks = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    let currentWeek = [];
    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
    
    while (currentDate <= lastDay || currentWeek.length > 0) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      const dateStr = currentDate.toLocaleDateString();
      const dayEntries = entries.filter(e => e.date === dateStr);
      const isCurrentMonth = currentDate.getMonth() === selectedMonth;
      
      currentWeek.push({
        date: dateStr,
        dateObj: new Date(currentDate),
        count: dayEntries.length,
        isCurrentMonth,
        day: currentDate.getDate()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (currentDate > lastDay && currentWeek.length === 7) {
        weeks.push(currentWeek);
        break;
      }
    }
    
    return weeks;
  };

  const todayCount = getTodayEntries().length;
  const canAddMore = todayCount < 3;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #8B6F47 0%, #A0826D 30%, #C9A875 60%, #E8D4B0 100%)'
    }}>
      <MagicalForestBackground />
      
      <div className="max-w-6xl mx-auto relative z-10 p-6">
        <header className="text-center py-6 mb-6">
          <h1 className="text-5xl font-bold mb-2" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFF8E7',
            textShadow: '2px 2px 4px rgba(139, 69, 19, 0.3)'
          }}>
            Honey Jar
          </h1>
          <p className="text-lg" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFE4B5',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Your Daily Gratitude & Memory Keeper
          </p>
        </header>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setView('today')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              view === 'today' ? 'scale-105' : ''
            }`}
            style={{
              background: view === 'today' 
                ? 'linear-gradient(135deg, #FFA500, #FF8C00)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
              color: view === 'today' ? 'white' : '#8B4513',
              fontFamily: 'Georgia, serif',
              boxShadow: view === 'today' ? '0 4px 12px rgba(255, 140, 0, 0.4)' : '0 2px 8px rgba(139, 69, 19, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            Today
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              view === 'calendar' ? 'scale-105' : ''
            }`}
            style={{
              background: view === 'calendar' 
                ? 'linear-gradient(135deg, #FFA500, #FF8C00)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
              color: view === 'calendar' ? 'white' : '#8B4513',
              fontFamily: 'Georgia, serif',
              boxShadow: view === 'calendar' ? '0 4px 12px rgba(255, 140, 0, 0.4)' : '0 2px 8px rgba(139, 69, 19, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>

        {view === 'today' ? (
          <TodayView 
            entries={entries}
            getCurrentWeekJars={getCurrentWeekJars}
            getTodayEntries={getTodayEntries}
            todayCount={todayCount}
            canAddMore={canAddMore}
            setShowForm={setShowForm}
            handleJarClick={handleJarClick}
          />
        ) : (
          <CalendarView 
            getMonthWeeks={getMonthWeeks}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            handleJarClick={handleJarClick}
          />
        )}

        {showForm && (
          <EntryForm
            currentEntry={currentEntry}
            setCurrentEntry={setCurrentEntry}
            handlePhotoUpload={handlePhotoUpload}
            handleAddEntry={handleAddEntry}
            onClose={() => setShowForm(false)}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        )}

        {expandedDay && (
          <ExpandedJarModal 
            date={expandedDay}
            entries={entries.filter(e => e.date === expandedDay)}
            dayRecap={dayRecap}
            isGeneratingRecap={isGeneratingRecap}
            onClose={() => {
              setExpandedDay(null);
              setDayRecap(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function TodayView({ entries, getCurrentWeekJars, getTodayEntries, todayCount, canAddMore, setShowForm, handleJarClick }) {
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

function CalendarView({ getMonthWeeks, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, handleJarClick }) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  return (
    <div className="p-6 rounded-3xl" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
      boxShadow: '0 8px 32px rgba(139, 69, 19, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    }}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-amber-100 transition-all"
          style={{ color: '#8B4513' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-bold" style={{
          fontFamily: 'Georgia, serif',
          color: '#8B4513'
        }}>
          {monthNames[selectedMonth]} {selectedYear}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-amber-100 transition-all"
          style={{ color: '#8B4513' }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center" style={{
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#8B4513',
            fontWeight: 'bold'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Weeks with Jars */}
      <div className="space-y-6">
        {getMonthWeeks().map((week, weekIdx) => (
          <div key={weekIdx}>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {week.map((day, dayIdx) => (
                <CalendarJar 
                  key={dayIdx}
                  day={day.day}
                  count={day.count}
                  isCurrentMonth={day.isCurrentMonth}
                  onClick={() => day.isCurrentMonth && handleJarClick(day.date)}
                />
              ))}
            </div>
            {/* Shelf */}
            <div className="h-2 rounded-full" style={{
              background: 'linear-gradient(to bottom, #8B4513, #654321)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarJar({ day, count, isCurrentMonth, onClick }) {
  // Max 3 drops per jar, show fill level in stages
  const fillLevel = Math.min((count / 3) * 100, 100);
  
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <svg width="50" height="70" viewBox="0 0 50 70" className="transition-transform hover:scale-110">
        {/* Jar */}
        <rect x="10" y="15" width="30" height="45" rx="2" 
          fill={isCurrentMonth ? "rgba(255, 255, 255, 0.7)" : "rgba(200, 200, 200, 0.3)"} 
          stroke="#CD853F" strokeWidth="1.5" />
        
        {/* Lid */}
        <rect x="8" y="11" width="34" height="6" rx="2" fill="#8B4513" />
        
        {/* Honey - 7 stages */}
        {count > 0 && (
          <rect
            x="12"
            y={15 + (45 - (45 * fillLevel / 100))}
            width="26"
            height={45 * fillLevel / 100}
            rx="1"
            fill="url(#honeyGradient)"
            opacity="0.9"
          />
        )}
        
        {/* Shine */}
        {fillLevel > 20 && (
          <ellipse
            cx="18"
            cy={25 + (45 - (45 * fillLevel / 100))}
            rx="3"
            ry="8"
            fill="rgba(255, 255, 255, 0.4)"
          />
        )}
        
        <defs>
          <linearGradient id="honeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      
      <div style={{ 
        fontFamily: 'Georgia, serif', 
        fontSize: '11px', 
        color: isCurrentMonth ? '#8B4513' : '#999',
        marginTop: '2px'
      }}>
        {day}
      </div>
      {count > 0 && (
        <div style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: '10px', 
          color: '#FF8C00',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
  );
}

function ExpandedJarModal({ date, entries, dayRecap, isGeneratingRecap, onClose }) {
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
          
          {/* Large Featured Jar */}
          <FeaturedHoneyJar fillLevel={(entries.length / 3) * 100} />
          
          <p style={{ fontFamily: 'Georgia, serif', color: '#CD853F', marginTop: '8px' }}>
            {entries.length} honey drop{entries.length !== 1 ? 's' : ''} collected
          </p>
        </div>

        {/* AI Recap */}
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

        {/* Entries */}
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

function MagicalForestBackground() {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#FFD700',
            boxShadow: '0 0 10px #FFD700',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: '3s'
          }}
        />
      ))}
      
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: 'linear-gradient(to top, rgba(107, 142, 35, 0.3), transparent)'
      }} />
    </div>
  );
}

function WeekJar({ day, count, isToday, onClick }) {
  const fillLevel = (count / 3) * 100;
  
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <svg width="40" height="60" viewBox="0 0 40 60" className="transition-transform hover:scale-110">
        <rect x="8" y="12" width="24" height="38" rx="2" fill="rgba(255, 255, 255, 0.6)" stroke="#CD853F" strokeWidth="1.5" />
        <rect x="6" y="8" width="28" height="6" rx="2" fill="#8B4513" />
        <rect
          x="10"
          y={12 + (38 - (38 * fillLevel / 100))}
          width="20"
          height={38 * fillLevel / 100}
          rx="1"
          fill="url(#honeyGradient)"
          opacity="0.9"
        />
        {fillLevel > 20 && (
          <ellipse
            cx="15"
            cy={20 + (38 - (38 * fillLevel / 100))}
            rx="3"
            ry="8"
            fill="rgba(255, 255, 255, 0.4)"
          />
        )}
        
        <defs>
          <linearGradient id="honeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="text-center mt-1">
        <div style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: '12px', 
          color: isToday ? '#FF8C00' : '#8B4513',
          fontWeight: isToday ? 'bold' : 'normal'
        }}>
          {day}
        </div>
        {isToday && (
          <div style={{ 
            fontFamily: 'Georgia, serif', 
            fontSize: '11px', 
            color: '#FF8C00',
            fontWeight: 'bold'
          }}>
            {count}/3
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedHoneyJar({ fillLevel }) {
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

function CozyBear({ name, flip }) {
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

function CuteBearBottom() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="20" cy="20" r="12" fill="#CD853F" />
      <circle cx="60" cy="20" r="12" fill="#CD853F" />
      <circle cx="40" cy="35" r="25" fill="#CD853F" />
      <ellipse cx="40" cy="42" rx="18" ry="15" fill="#DEB887" />
      <circle cx="30" cy="32" r="4" fill="#000" />
      <circle cx="50" cy="32" r="4" fill="#000" />
      <ellipse cx="40" cy="45" rx="4" ry="3" fill="#000" />
      <path d="M 40 45 Q 35 50, 30 48" stroke="#000" strokeWidth="2" fill="none" />
      <path d="M 40 45 Q 45 50, 50 48" stroke="#000" strokeWidth="2" fill="none" />
      <circle cx="65" cy="55" r="6" fill="#DC143C" />
      <circle cx="72" cy="58" r="6" fill="#DC143C" />
      <path d="M 68 50 Q 68 45, 70 40" stroke="#228B22" strokeWidth="2" fill="none" />
    </svg>
  );
}

function FeaturePill({ icon, text, onClick, active }) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className="px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
        border: '1.5px solid rgba(205, 133, 63, 0.3)',
        boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: '#8B4513'
      }}
    >
      {icon}
      {text}
    </button>
  );
}

function EntryCard({ entry }) {
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

function EntryForm({ currentEntry, setCurrentEntry, handlePhotoUpload, handleAddEntry, onClose, isRecording, startRecording, stopRecording }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: 'rgba(139, 111, 71, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl" style={{
        background: 'linear-gradient(135deg, #FFF9E6, #FFFAF0)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '3px solid rgba(255, 255, 255, 0.8)'
      }}>
        <h3 className="text-3xl font-bold text-center mb-6" style={{
          fontFamily: 'Georgia, serif',
          color: '#8B4513'
        }}>
          Add Honey Drop
        </h3>
        
        <textarea
          value={currentEntry.content}
          onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
          placeholder="What are you grateful for today?"
          className="w-full h-32 p-4 rounded-2xl resize-none outline-none mb-4"
          style={{
            background: 'rgba(255, 248, 220, 0.5)',
            border: '2px solid rgba(205, 133, 63, 0.3)',
            fontFamily: 'Georgia, serif',
            color: '#8B4513'
          }}
        />

        <div className="mb-4">
          <label className="block mb-2" style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold' }}>
            How do you feel?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['grateful', 'joyful', 'peaceful', 'excited'].map((mood) => (
              <button
                key={mood}
                onClick={() => setCurrentEntry({ ...currentEntry, mood })}
                className="p-3 rounded-xl transition-all capitalize"
                style={{
                  background: currentEntry.mood === mood 
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : 'rgba(255, 248, 220, 0.5)',
                  border: `2px solid ${currentEntry.mood === mood ? '#FF8C00' : 'rgba(205, 133, 63, 0.3)'}`,
                  fontFamily: 'Georgia, serif',
                  color: currentEntry.mood === mood ? 'white' : '#8B4513',
                  fontWeight: currentEntry.mood === mood ? 'bold' : 'normal'
                }}
              >
                {getMoodEmoji(mood)} {mood}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2" style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold' }}>
            Add a photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full"
            style={{ fontFamily: 'Georgia, serif', fontSize: '14px' }}
          />
          {currentEntry.photo && (
            <img 
              src={currentEntry.photo} 
              alt="Preview" 
              className="mt-4 w-full h-40 object-cover rounded-xl"
              style={{ border: '2px solid rgba(205, 133, 63, 0.3)' }}
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2" style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontWeight: 'bold' }}>
            Voice note (optional)
          </label>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            style={{
              background: isRecording 
                ? 'linear-gradient(135deg, #DC143C, #8B0000)'
                : 'linear-gradient(135deg, #87CEEB, #4682B4)',
              color: 'white',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              border: 'none'
            }}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" /> 
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" /> 
                Start Recording
              </>
            )}
          </button>
          {currentEntry.audio && (
            <audio controls className="w-full mt-2">
              <source src={currentEntry.audio} type="audio/wav" />
            </audio>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddEntry}
            disabled={!currentEntry.content && !currentEntry.photo && !currentEntry.audio}
            className="flex-1 py-4 rounded-xl font-bold transition-all"
            style={{
              background: !currentEntry.content && !currentEntry.photo && !currentEntry.audio
                ? 'rgba(200, 200, 200, 0.5)'
                : 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: 'white',
              fontFamily: 'Georgia, serif',
              cursor: !currentEntry.content && !currentEntry.photo && !currentEntry.audio ? 'not-allowed' : 'pointer',
              boxShadow: !currentEntry.content && !currentEntry.photo && !currentEntry.audio ? 'none' : '0 4px 12px rgba(255, 140, 0, 0.4)'
            }}
          >
            Save Honey Drop
          </button>
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-xl font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 220, 220, 0.9), rgba(200, 200, 200, 0.9))',
              color: '#8B4513',
              fontFamily: 'Georgia, serif',
              border: '2px solid rgba(139, 69, 19, 0.2)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function getMoodEmoji(mood) {
  const emojis = {
    grateful: '🙏',
    joyful: '😊',
    peaceful: '🧘',
    excited: '🎉'
  };
  return emojis[mood] || '💛';
}