// Portal Home View for Aether AI OS (Greetings, avatar, suggestion prompts, widgets)
import React, { useState } from 'react';
import { SUGGESTIONS, TRENDING_TOPICS } from '../utils/aiEngine';
import { Terminal, Shield, Zap, Search, Globe, Mic, Send } from 'lucide-react';

export const HomeView = ({ user, onSelectSuggestion, onQuickAction }) => {
  const [inputText, setInputText] = useState('');
  const [randomSuggestions] = useState(() => {
    const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSelectSuggestion(inputText.trim());
      setInputText('');
    }
  };
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div 
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px 40px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Centered Avatar and Welcome Card */}
      <div 
        style={{
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Futuristic Interactive Hologram Core Reticle */}
        <div 
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Ripple Effect Ring 1 */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-violet)',
              opacity: 0,
              animation: 'radarRipple 3s infinite cubic-bezier(0.1, 0.8, 0.3, 1)'
            }}
          />
          {/* Ripple Effect Ring 2 (Offset delay) */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-cyan)',
              opacity: 0,
              animation: 'radarRipple 3s infinite cubic-bezier(0.1, 0.8, 0.3, 1)',
              animationDelay: '1.5s'
            }}
          />

          {/* Outermost Techno-Orbit Ring (Clockwise) */}
          <div 
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: 'var(--radius-full)',
              border: '2px solid transparent',
              borderTopColor: 'var(--color-violet)',
              borderBottomColor: 'var(--color-violet)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
              animation: 'spinSlow 16s linear infinite'
            }}
          />

          {/* Middle Dotted Ring (Counter-Clockwise) */}
          <div 
            style={{
              position: 'absolute',
              width: '116px',
              height: '116px',
              borderRadius: 'var(--radius-full)',
              border: '2px dotted var(--color-cyan)',
              opacity: 0.7,
              animation: 'spinCounter 8s linear infinite'
            }}
          />

          {/* Inner Solid Tech Ring (Clockwise) */}
          <div 
            style={{
              position: 'absolute',
              width: '96px',
              height: '96px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderLeftColor: 'var(--color-violet)',
              animation: 'spinSlow 4s linear infinite'
            }}
          />

          {/* Outer Pulsing Glow */}
          <div 
            style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
              animation: 'pulseMic 2s infinite ease-in-out'
            }}
          />

          {/* Inner solid avatar logo core */}
          <div 
            style={{
              width: '76px',
              height: '76px',
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle at 30% 30%, #064e3b 0%, #02020a 100%)',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
              zIndex: 2
            }}
          >
            Æ
          </div>
        </div>

        <h1 
          style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            background: 'linear-gradient(to right, #ffffff 30%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {getGreeting()}, {user?.displayName || 'Operator'}
        </h1>
        
        <p 
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            maxWidth: '540px',
            lineHeight: 1.6,
            marginBottom: '48px'
          }}
        >
          Aether Kernel is primed. Address the intelligent matrix to compile, search, solve, or speak.
        </p>

        {/* Suggestion Grid */}
        <div style={{ width: '100%', marginBottom: '48px' }}>
          <div 
            style={{
              textAlign: 'left',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: '18px'
            }}
          >
            Suggested Directives
          </div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              width: '100%'
            }}
          >
            {randomSuggestions.map((sug, idx) => (
              <div 
                key={idx}
                className="suggestion-card"
                onClick={() => onSelectSuggestion(sug.text)}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '14px' }}>
                  "{sug.text}"
                </div>
                <div 
                  style={{
                    fontSize: '0.7rem',
                    color: sug.category === 'Search' ? 'var(--color-cyan)' : sug.category === 'Development' ? 'var(--color-violet)' : 'var(--color-pink)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                  }}
                >
                  {sug.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending & Quick Actions split grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            width: '100%'
          }}
        >
          {/* Quick Actions Panel */}
          <div style={{ textAlign: 'left' }}>
            <div 
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: '18px'
              }}
            >
              Quick Action Nodes
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => onQuickAction("Initiate web crawler search...")}
                className="cyber-btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '12px 18px', width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <Globe size={16} style={{ color: 'var(--color-cyan)' }} />
                <span>Deep Web Search Index</span>
              </button>
              
              <button 
                onClick={() => onQuickAction("Write a script for ")}
                className="cyber-btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '12px 18px', width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <Terminal size={16} style={{ color: 'var(--color-violet)' }} />
                <span>Launch Script Terminal</span>
              </button>
              
              <button 
                onClick={() => onQuickAction("Listen to my voice input...")}
                className="cyber-btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: '12px 18px', width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <Mic size={16} style={{ color: 'var(--color-pink)' }} />
                <span>Configure Bio-Voice Node</span>
              </button>
            </div>
          </div>

          {/* Trending Index */}
          <div style={{ textAlign: 'left' }}>
            <div 
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: '18px'
              }}
            >
              Trending Synapse Mappings
            </div>
            <div 
              className="glass-panel" 
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(10, 5, 30, 0.3)'
              }}
            >
              {TRENDING_TOPICS.map((topic, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Zap size={12} style={{ color: 'var(--color-cyan)' }} />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Input Bar inside Home Portal */}
        <form 
          onSubmit={handleSubmit}
          className="glass-panel glow-ring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            borderWidth: '1px',
            background: 'rgba(8, 4, 32, 0.8)',
            width: '100%',
            marginTop: '40px',
            boxShadow: '0 0 20px var(--color-violet-glow)'
          }}
        >
          <input 
            type="text"
            placeholder="Compile instructions for Aether..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sans)',
              padding: '10px 0'
            }}
          />
          <button 
            type="submit"
            className="cyber-btn"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              minWidth: 'auto'
            }}
            disabled={!inputText.trim()}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};
