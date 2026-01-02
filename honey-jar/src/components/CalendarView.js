import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedJar from './AnimatedJar';

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
