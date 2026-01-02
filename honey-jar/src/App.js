import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Mic, MicOff, Camera, Sparkles, Lock, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';

export default function HoneyJarApp() {
  const [currentUser, setCurrentUser] = useState(null); // Track logged in user
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ content: '', mood: 'grateful', photo: null, audio: null });
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Track which date we're adding to
  const [view, setView] = useState('today');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedDay, setExpandedDay] = useState(null);
  const [dayRecap, setDayRecap] = useState(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null); // Track which entry is expanded
  const [editingEntry, setEditingEntry] = useState(null); // Track which entry is being edited
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Load saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Load entries for current user
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`honeyJarEntries_${currentUser.username}`);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    }
  }, [currentUser]);

  // Save entries for current user
  useEffect(() => {
    if (currentUser) {
      if (entries.length > 0) {
        try {
          localStorage.setItem(`honeyJarEntries_${currentUser.username}`, JSON.stringify(entries));
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please delete some old entries or avoid adding large photos. Photos are now automatically compressed to save space.');
            console.error('LocalStorage quota exceeded:', error);
          }
        }
      } else {
        localStorage.removeItem(`honeyJarEntries_${currentUser.username}`);
      }
    }
  }, [entries, currentUser]);

  const handleLogin = (username, password) => {
    // Simple authentication - in production, use proper backend authentication
    const user = { username, password };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEntries([]);
    localStorage.removeItem('currentUser');
  };

  // Helper function to check localStorage usage
  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // Return size in KB
  };

  const handleAddEntry = () => {
    if (currentEntry.content.trim() || currentEntry.photo || currentEntry.audio) {
      if (editingEntry) {
        // Update existing entry
        setEntries(entries.map(e => e.id === editingEntry.id
          ? { ...e, ...currentEntry }
          : e
        ));
        setEditingEntry(null);
      } else {
        // Use selectedDate if provided, otherwise use today
        const targetDate = selectedDate || new Date().toLocaleDateString();
        const targetDateObj = selectedDate ? new Date(selectedDate) : new Date();

        const newEntry = {
          id: Date.now(),
          ...currentEntry,
          timestamp: targetDateObj.toISOString(),
          date: targetDate,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setEntries([newEntry, ...entries]);
        setSelectedDate(null); // Reset selected date
      }
      setCurrentEntry({ content: '', mood: 'grateful', photo: null, audio: null });
      setShowForm(false);
    }
  };

  const handleDeleteEntry = (entryId) => {
    setEntries(entries.filter(e => e.id !== entryId));
    setExpandedEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry({
      content: entry.content,
      mood: entry.mood,
      photo: entry.photo,
      audio: entry.audio
    });
    setExpandedEntry(null);
    setExpandedDay(null); // Close the calendar day view modal
    setShowForm(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress the image before storing
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set max dimensions (reduce size to save storage)
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality (smaller file size)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setCurrentEntry({ ...currentEntry, photo: compressedDataUrl });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use webm format with opus codec for smaller file size
      const options = { mimeType: 'audio/webm;codecs=opus' };
      mediaRecorder.current = new MediaRecorder(stream, options);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // Convert blob to base64 for localStorage (more compact than object URL)
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentEntry({ ...currentEntry, audio: reader.result });
        };
        reader.readAsDataURL(audioBlob);
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

  const handleWeekJarClick = (dateStr, count) => {
    // If the jar has less than 3 drops, allow adding a new entry
    if (count < 3) {
      setSelectedDate(dateStr);
      setShowForm(true);
    } else {
      // If full, show the expanded view
      handleJarClick(dateStr);
    }
  };

  const getTodayEntries = () => {
    const today = new Date().toLocaleDateString();
    return entries.filter(e => e.date === today);
  };

  const getCurrentWeekJars = () => {
    const week = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
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
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
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

  const backgrounds = [
    '/Background1.png'
  ];

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative overflow-hidden" style={{
      width: '480px',
      height: '932px',
      margin: '0 auto',
      backgroundImage: `url(${backgrounds[0]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <MagicalForestBackground />

      <div className="relative z-10 p-3 h-full flex flex-col">
        <header className="text-center py-2 mb-2 relative">
          <button
            onClick={handleLogout}
            className="absolute top-2 right-2 px-3 py-1 rounded-full font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 220, 0.9))',
              color: '#8B4513',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <Lock className="w-3 h-3" />
            Logout
          </button>
          <h1 className="text-3xl font-bold mb-1 relative inline-block" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            textShadow: `
              2px 2px 0px #FFA500,
              4px 4px 0px #FF8C00,
              6px 6px 8px rgba(139, 69, 19, 0.5),
              0 0 15px rgba(255, 215, 0, 0.3)
            `,
            letterSpacing: '0.05em',
            WebkitTextStroke: '1px #FF8C00'
          }}>
            Honey Jar
            {/* Honey drips on letters */}
            <span style={{
              position: 'absolute',
              top: '85%',
              left: '15%',
              width: '5px',
              height: '10px',
              background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
              borderRadius: '0 0 50% 50%',
              opacity: 0.7
            }} />
            <span style={{
              position: 'absolute',
              top: '85%',
              left: '45%',
              width: '6px',
              height: '12px',
              background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
              borderRadius: '0 0 50% 50%',
              opacity: 0.8
            }} />
            <span style={{
              position: 'absolute',
              top: '85%',
              left: '75%',
              width: '4px',
              height: '8px',
              background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
              borderRadius: '0 0 50% 50%',
              opacity: 0.6
            }} />
          </h1>
          <p className="text-xs" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFE4B5',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            fontWeight: '500'
          }}>
            Your Daily Memory Keeper
          </p>
        </header>

        <div className="flex gap-2 mb-2 justify-center">
          <button
            onClick={() => setView('today')}
            className={`px-3 py-1 rounded-full font-semibold transition-all text-xs ${
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
            className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 text-xs ${
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
            <Calendar className="w-3 h-3" />
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
            setSelectedDate={setSelectedDate}
            handleJarClick={handleJarClick}
            handleWeekJarClick={handleWeekJarClick}
            handleDeleteEntry={handleDeleteEntry}
            setExpandedEntry={setExpandedEntry}
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
            onClose={() => {
              setShowForm(false);
              setSelectedDate(null);
              setEditingEntry(null);
              setCurrentEntry({ content: '', mood: 'grateful', photo: null, audio: null });
            }}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            selectedDate={selectedDate}
            isEditing={!!editingEntry}
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
            handleDeleteEntry={handleDeleteEntry}
            setExpandedEntry={setExpandedEntry}
            onNavigate={(newDate) => {
              handleJarClick(newDate);
            }}
          />
        )}

        {expandedEntry && (
          <ExpandedEntryModal
            entry={expandedEntry}
            onClose={() => setExpandedEntry(null)}
            onEdit={() => handleEditEntry(expandedEntry)}
            onDelete={() => handleDeleteEntry(expandedEntry.id)}
          />
        )}
      </div>
    </div>
  );
}

// Animated Jar Component using custom images
function AnimatedJar({ count, size = 'medium', onClick, isToday }) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCount = useRef(count);
  const isInitialMount = useRef(true);

  // Get jar state based on count (0, 1, 2, or 3 drops)
  const getJarState = (dropCount) => {
    if (dropCount === 0) return 'empty';
    if (dropCount === 1) return 'onethird';
    if (dropCount === 2) return 'twothird';
    return 'full';
  };

  const getStaticImage = (state) => {
    const images = {
      empty: '/emptyjar.png',
      onethird: '/onethirdjar.png',
      twothird: '/twothirdjar.png',
      full: '/fulljar.png'
    };
    return images[state];
  };

  // Animate jar filling/emptying
  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousCount.current = count;
      return;
    }

    if (previousCount.current === count) return;

    const oldCount = previousCount.current;
    const newCount = count;
    const isAdding = newCount > oldCount;

    // Determine which frames to animate through
    let startFrame, endFrame;

    if (isAdding) {
      // Adding honey drop - animate forward through frames
      if (oldCount === 0 && newCount === 1) {
        startFrame = 1; endFrame = 9;
      } else if (oldCount === 1 && newCount === 2) {
        startFrame = 10; endFrame = 18;
      } else if (oldCount === 2 && newCount === 3) {
        startFrame = 19; endFrame = 27;
      }
    } else {
      // Removing honey drop - animate backward from checkpoint
      if (oldCount === 3 && newCount === 2) {
        startFrame = 27; endFrame = 19;
      } else if (oldCount === 2 && newCount === 1) {
        startFrame = 18; endFrame = 10;
      } else if (oldCount === 1 && newCount === 0) {
        startFrame = 9; endFrame = 1;
      }
    }

    // Animate through frames
    if (startFrame && endFrame) {
      setIsAnimating(true);
      const step = isAdding ? 1 : -1;
      const frames = [];
      for (let i = startFrame; isAdding ? i <= endFrame : i >= endFrame; i += step) {
        frames.push(i);
      }

      let frameIndex = 0;
      const interval = setInterval(() => {
        if (frameIndex < frames.length) {
          setCurrentFrame(frames[frameIndex]);
          frameIndex++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
          previousCount.current = newCount;
        }
      }, 200); // 200ms per frame for smoother, faster animation

      return () => clearInterval(interval);
    } else {
      // If no animation needed, still update previousCount
      previousCount.current = newCount;
    }
  }, [count]);

  const sizes = {
    small: { width: 70, height: 96 },
    medium: { width: 80, height: 110 },
    large: { width: 120, height: 165 },
    xlarge: { width: 150, height: 206 }
  };

  const jarSize = sizes[size];

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-110"
      style={{
        width: jarSize.width,
        height: jarSize.height,
        position: 'relative'
      }}
    >
      <img
        src={isAnimating ? `/filljar${currentFrame}.png` : getStaticImage(getJarState(count))}
        alt="Honey Jar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: '-webkit-optimize-contrast',
          WebkitFontSmoothing: 'antialiased',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      />
      {isToday && (
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#FF8C00',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap'
        }}>
        </div>
      )}
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

      {/* Honey drips along the top */}
      <div className="absolute top-0 left-0 right-0 h-24 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={`drip-${i}`}
            className="absolute"
            style={{
              left: `${(i * 8.33) + Math.random() * 3}%`,
              top: '-10px',
              width: '20px',
              height: '60px',
              background: 'linear-gradient(to bottom, #FFA500, #FF8C00, transparent)',
              borderRadius: '0 0 50% 50%',
              opacity: 0.6,
              animation: `drip ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: 'linear-gradient(to top, rgba(107, 142, 35, 0.3), transparent)'
      }} />
    </div>
  );
}

function CozyBear({ name, flip, size = 'default' }) {
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
        src={`/${name}.png`}
        alt={name}
        style={{
          width: bearSize.width,
          height: bearSize.height,
          objectFit: 'contain',
          transform: `translateY(${bounceY}px)`
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

function TodayView({ entries, getCurrentWeekJars, getTodayEntries, todayCount, canAddMore, setShowForm, setSelectedDate, handleJarClick, handleWeekJarClick, handleDeleteEntry, setExpandedEntry }) {
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
    <div className="flex-1 flex flex-col overflow-hidden p-2 rounded-2xl" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 248, 220, 0.6))',
      boxShadow: '0 4px 16px rgba(139, 69, 19, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    }}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-amber-100 transition-all"
          style={{ color: '#8B4513' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold" style={{
          fontFamily: 'Georgia, serif',
          color: '#8B4513'
        }}>
          {monthNames[selectedMonth]} {selectedYear}
        </h2>

        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-amber-100 transition-all"
          style={{ color: '#8B4513' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-left" style={{
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#8B4513',
            fontWeight: 'bold',
            paddingLeft: '13px'
          }}>
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-start gap-1">
        {getMonthWeeks().map((week, weekIdx) => (
          <div key={weekIdx}>
            <div className="grid grid-cols-7 gap-1">
              {week.map((day, dayIdx) => (
                <div key={dayIdx} className="flex flex-col items-center">
                  <AnimatedJar
                    count={day.count}
                    size="small"
                    onClick={() => day.isCurrentMonth && handleJarClick(day.date)}
                  />
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '9px',
                    color: day.isCurrentMonth ? '#8B4513' : '#999',
                    marginTop: '1px',
                    fontWeight: day.isCurrentMonth ? 'bold' : 'normal'
                  }}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
            {weekIdx < getMonthWeeks().length - 1 && (
              <div className="h-0.5 rounded-full my-0.5" style={{
                background: 'linear-gradient(to bottom, #8B4513, #654321)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete, onClick }) {
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

function EntryForm({ currentEntry, setCurrentEntry, handlePhotoUpload, handleAddEntry, onClose, isRecording, startRecording, stopRecording, selectedDate, isEditing }) {
  const [customMood, setCustomMood] = useState('');
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);

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

  const getDateDisplay = () => {
    if (!selectedDate) return "today";
    const date = new Date(selectedDate);
    const today = new Date();
    const dateStr = selectedDate;
    const todayStr = today.toLocaleDateString();

    if (dateStr === todayStr) return "today";

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: 'rgba(139, 111, 71, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl" style={{
        background: '#fbde8eff',
        boxShadow: '0 20px 60px rgba(111, 46, 2, 0.3)',
        border: '3px solid rgba(255, 255, 255, 0.8)'
      }}>
        <h3 className="text-3xl font-bold text-center mb-2" style={{
          fontFamily: 'Georgia, serif',
          color: '#8B4513'
        }}>
          {isEditing ? 'Edit Honey Drop' : 'Add Honey Drop'}
        </h3>
        {selectedDate && !isEditing && (
          <p className="text-center mb-4" style={{
            fontFamily: 'Georgia, serif',
            color: '#A0826D',
            fontSize: '14px'
          }}>
            for {getDateDisplay()}
          </p>
        )}
        
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
            {['grateful', 'joyful', 'peaceful', 'excited', 'anxious'].map((mood) => (
              <button
                key={mood}
                onClick={() => {
                  setCurrentEntry({ ...currentEntry, mood });
                  setShowCustomMoodInput(false);
                }}
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
            <button
              onClick={() => setShowCustomMoodInput(!showCustomMoodInput)}
              className="p-3 rounded-xl transition-all"
              style={{
                background: showCustomMoodInput
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'rgba(255, 248, 220, 0.5)',
                border: `2px solid ${showCustomMoodInput ? '#FF8C00' : 'rgba(205, 133, 63, 0.3)'}`,
                fontFamily: 'Georgia, serif',
                color: showCustomMoodInput ? 'white' : '#8B4513',
                fontWeight: showCustomMoodInput ? 'bold' : 'normal'
              }}
            >
              ✏️ Custom
            </button>
          </div>
          {showCustomMoodInput && (
            <input
              type="text"
              value={customMood}
              onChange={(e) => {
                setCustomMood(e.target.value);
                setCurrentEntry({ ...currentEntry, mood: e.target.value });
              }}
              placeholder="Enter your own feeling..."
              className="w-full mt-2 p-3 rounded-xl outline-none"
              style={{
                background: 'rgba(255, 248, 220, 0.5)',
                border: '2px solid rgba(205, 133, 63, 0.3)',
                fontFamily: 'Georgia, serif',
                color: '#8B4513'
              }}
            />
          )}
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
                : 'linear-gradient(135deg, #c76712ff, #e09a5dff)',
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
              <source src={currentEntry.audio} type="audio/webm" />
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
            {isEditing ? 'Update Honey Drop' : 'Save Honey Drop'}
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

function ExpandedJarModal({ date, entries, dayRecap, isGeneratingRecap, onClose, handleDeleteEntry, setExpandedEntry, onNavigate }) {
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
      backgroundImage: 'url(/ForestBackground.png)',
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
            <AnimatedJar count={entries.length} size="xlarge" />
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
                src={`/${recapBear}.png`}
                alt={recapBear}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain'
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
              <p style={{ fontFamily: 'Georgia, serif', color: '#8B4513', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                {recapBear}'s Day Recap:
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

function ExpandedEntryModal({ entry, onClose, onEdit, onDelete }) {
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

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username.trim(), password);
    }
  };

  return (
    <div className="relative overflow-hidden flex items-center justify-center" style={{
      width: '480px',
      height: '932px',
      margin: '0 auto',
      backgroundImage: 'url(/Background1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <MagicalForestBackground />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 relative inline-block" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            textShadow: `
              2px 2px 0px #FFA500,
              4px 4px 0px #FF8C00,
              6px 6px 8px rgba(139, 69, 19, 0.5),
              0 0 15px rgba(255, 215, 0, 0.3)
            `,
            letterSpacing: '0.05em',
            WebkitTextStroke: '1px #FF8C00'
          }}>
            Honey Jar
          </h1>
          <p className="text-sm" style={{
            fontFamily: 'Georgia, serif',
            color: '#FFE4B5',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            fontWeight: '500'
          }}>
            Your Personal Gratitude Journal
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <CozyBear name="BEARY" size="large" />
            <CozyBear name="CHERRY" size="large" />
          </div>
        </div>

        <div className="p-8 rounded-3xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 220, 0.95))',
          boxShadow: '0 20px 60px rgba(139, 69, 19, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.8)'
        }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{
            fontFamily: 'Georgia, serif',
            color: '#8B4513'
          }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2" style={{
                fontFamily: 'Georgia, serif',
                color: '#8B4513',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-3 rounded-xl outline-none"
                style={{
                  background: 'rgba(255, 248, 220, 0.5)',
                  border: '2px solid rgba(205, 133, 63, 0.3)',
                  fontFamily: 'Georgia, serif',
                  color: '#8B4513'
                }}
                required
              />
            </div>

            <div>
              <label className="block mb-2" style={{
                fontFamily: 'Georgia, serif',
                color: '#8B4513',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 rounded-xl outline-none"
                style={{
                  background: 'rgba(255, 248, 220, 0.5)',
                  border: '2px solid rgba(205, 133, 63, 0.3)',
                  fontFamily: 'Georgia, serif',
                  color: '#8B4513'
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: 'white',
                fontFamily: 'Georgia, serif',
                boxShadow: '0 4px 12px rgba(255, 140, 0, 0.4)',
                border: 'none'
              }}
            >
              {isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm transition-all hover:underline"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#A0826D',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(251, 224, 179, 0.5), rgba(251, 224, 179, 0.5))',
            border: '2px solid rgba(205, 133, 63, 0.2)'
          }}>
            <p style={{
              fontFamily: 'Georgia, serif',
              color: '#8B4513',
              fontSize: '12px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Your journal entries are stored securely in your browser's local memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}