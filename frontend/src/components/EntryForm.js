import React from 'react';
import { Mic, MicOff } from 'lucide-react';

function getMoodEmoji(mood) {
  const emojis = {
    grateful: '🙏',
    joyful: '😊',
    peaceful: '🧘',
    excited: '🎉'
  };
  return emojis[mood] || '💛';
}

export default function EntryForm({ currentEntry, setCurrentEntry, handlePhotoUpload, handleAddEntry, onClose, isRecording, startRecording, stopRecording }) {
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