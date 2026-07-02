// Settings Dialog and Configuration Panel for Aether AI OS
import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Shield, Database, Trash2, Cpu } from 'lucide-react';

export const ProfileSettings = ({ user, onClose, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [theme, setTheme] = useState('dark-fusion');
  const [speechVoice, setSpeechVoice] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [voices, setVoices] = useState([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // Load speech voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Load saved settings
    const speed = localStorage.getItem('aether_speech_speed');
    if (speed) setSpeechSpeed(parseFloat(speed));
    const savedTheme = localStorage.getItem('aether_theme');
    if (savedTheme) setTheme(savedTheme);
    const savedVoice = localStorage.getItem('aether_speech_voice');
    if (savedVoice) setSpeechVoice(savedVoice);
    const savedApiKey = localStorage.getItem('aether_api_key');
    if (savedApiKey) {
      try {
        const reversed = savedApiKey.split('').reverse().join('');
        setApiKey(atob(reversed));
      } catch (e) {
        setApiKey(savedApiKey);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser && displayName) {
      onUpdateUser({ ...user, displayName });
    }
    localStorage.setItem('aether_speech_speed', speechSpeed.toString());
    localStorage.setItem('aether_theme', theme);
    localStorage.setItem('aether_speech_voice', speechVoice);
    
    const obfuscated = apiKey ? btoa(apiKey.trim()).split('').reverse().join('') : '';
    localStorage.setItem('aether_api_key', obfuscated);
    onClose();
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to purge all neural conversation chains from this session?")) {
      setClearing(true);
      setTimeout(() => {
        localStorage.removeItem('aether_chats');
        setClearing(false);
        alert("Session caches cleared successfully.");
      }, 1000);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 0, 20, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div 
        className="glass-panel glow-ring"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} style={{ color: 'var(--color-cyan)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
              System Configuration Control
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
            className="cyber-btn-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Tabs */}
        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Identity Parameters */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)' }}>
              <User size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Identity Profile
              </h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Operator Call-Sign</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                className="cyber-input" 
                placeholder="Operator Name"
              />
            </div>
          </section>

          {/* AI Core Credentials */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)' }}>
              <Shield size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Core Credentials
              </h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gemini API Key</label>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', textDecoration: 'none' }}
                >
                  Get Key from AI Studio ➜
                </a>
              </div>
              <input 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                className="cyber-input" 
                placeholder="Paste your API Key here (stored locally)"
                style={{ letterSpacing: apiKey ? '0.12em' : 'normal' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Leave blank to use the Sandbox simulation mode.
                </span>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setApiKey('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Audio Synthesis */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)' }}>
              <Cpu size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Text-to-Speech Biosynthesis
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Synthesizer Voice Voice</label>
                <select 
                  value={speechVoice}
                  onChange={e => setSpeechVoice(e.target.value)}
                  className="cyber-input"
                  style={{ background: 'rgba(8, 4, 32, 0.95)', padding: '12px' }}
                >
                  <option value="">Default OS Synthesizer</option>
                  {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <label style={{ color: 'var(--text-secondary)' }}>Biometric Read Frequency (Speed)</label>
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{speechSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min={0.5} 
                  max={2.0} 
                  step={0.1}
                  value={speechSpeed} 
                  onChange={e => setSpeechSpeed(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
                />
              </div>
            </div>
          </section>

          {/* Theme Geometry */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)' }}>
              <Sliders size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Geometry Styles (Themes)
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setTheme('dark-fusion')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'dark-fusion' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(20, 12, 56, 0.2)',
                  border: `1px solid ${theme === 'dark-fusion' ? 'var(--color-violet)' : 'rgba(139, 92, 246, 0.15)'}`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                🔮 Dark Fusion
              </button>
              <button 
                type="button" 
                onClick={() => setTheme('neon-matrix')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'neon-matrix' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(20, 12, 56, 0.2)',
                  border: `1px solid ${theme === 'neon-matrix' ? 'var(--color-cyan)' : 'rgba(139, 92, 246, 0.15)'}`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                💚 Neon Matrix
              </button>
              <button 
                type="button" 
                onClick={() => setTheme('cyber-pink')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'cyber-pink' ? 'rgba(217, 70, 239, 0.2)' : 'rgba(20, 12, 56, 0.2)',
                  border: `1px solid ${theme === 'cyber-pink' ? 'var(--color-pink)' : 'rgba(139, 92, 246, 0.15)'}`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                💖 Cyber Pink
              </button>
            </div>
          </section>

          {/* Database Operations */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-violet)' }}>
              <Database size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Memory Protocols
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={handleClearHistory}
                disabled={clearing}
                className="cyber-btn-secondary"
                style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', hover: { background: 'rgba(239, 68, 68, 0.1)' } }}
              >
                <Trash2 size={16} />
                {clearing ? 'Clearing Index...' : 'Clear Session Chats'}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button onClick={onClose} className="cyber-btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="cyber-btn" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            Save Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
