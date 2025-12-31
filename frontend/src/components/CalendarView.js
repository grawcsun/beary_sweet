import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarJar from './CalendarJar';

export default function CalendarView({ getMonthWeeks, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, handleJarClick }) {
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