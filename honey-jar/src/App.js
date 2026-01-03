import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Lock } from 'lucide-react';
import MagicalForestBackground from './components/MagicalForestBackground';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import EntryForm from './components/EntryForm';
import ExpandedJarModal from './components/ExpandedJarModal';
import ExpandedEntryModal from './components/ExpandedEntryModal';
import LoginScreen from './components/LoginScreen';
import { generateDayRecap } from './services/aiAgent';
import { saveEntriesSmart, loadEntriesSmart } from './services/database';
import { onAuthStateChanged, signOut as authSignOut } from './services/auth';

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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Load entries for current user
  useEffect(() => {
    if (currentUser) {
      console.log('Loading entries for user:', currentUser.uid);
      loadEntriesSmart(currentUser.uid).then(result => {
        console.log('Load result:', result);
        if (result.success) {
          console.log('Setting entries:', result.entries);
          setEntries(result.entries);
        } else {
          console.error('Failed to load entries:', result.error);
        }
      });
    } else {
      // Clear entries when user logs out
      setEntries([]);
    }
  }, [currentUser]);

  // Save entries for current user
  useEffect(() => {
    if (currentUser && entries.length >= 0) {
      console.log('Saving entries for user:', currentUser.uid, 'Entries count:', entries.length);
      saveEntriesSmart(currentUser.uid, entries, currentUser.displayName)
        .then(result => {
          console.log('Save result:', result);
        })
        .catch(error => {
          console.error('Error saving entries:', error);
          alert('Failed to save your entries. Please check your internet connection.');
        });
    }
  }, [entries, currentUser]);

  // handleLogin is no longer needed - LoginScreen will handle auth directly
  // and onAuthStateChanged will update currentUser automatically

  const handleLogout = async () => {
    const result = await authSignOut();
    if (!result.success) {
      alert('Failed to log out. Please try again.');
    }
    // onAuthStateChanged listener will handle clearing currentUser and entries
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

  const handleGenerateDayRecap = async (dateStr) => {
    setIsGeneratingRecap(true);

    const result = await generateDayRecap(dateStr, entries);

    if (result) {
      setDayRecap(result.recap);
    }

    setIsGeneratingRecap(false);
  };

  const handleJarClick = (dateStr) => {
    setExpandedDay(dateStr);
    handleGenerateDayRecap(dateStr);
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
    `${process.env.PUBLIC_URL}/Background1.png`
  ];

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen />;
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
