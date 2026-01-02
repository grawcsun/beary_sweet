import React, { useState } from 'react';
import MagicalForestBackground from './MagicalForestBackground';
import CozyBear from './CozyBear';

export default function LoginScreen({ onLogin }) {
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
      backgroundImage: `url(${process.env.PUBLIC_URL}/Background1.png)`,
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
            <CozyBear name="Beary" size="large" />
            <CozyBear name="Cherry" size="large" />
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
