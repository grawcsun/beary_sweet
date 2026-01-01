/*
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import MagicalForestBackground from './components/MagicalForestBackground';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import EntryForm from './components/EntryForm';
import ExpandedJarModal from './components/ExpandedJarModal';

export default function HoneyJarApp() {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ content: '', mood: 'grateful', photo: null, audio: null });
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('today');
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
*/