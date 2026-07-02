// Portal Home View for Aether AI OS (Greetings, avatar, suggestion prompts, widgets)
import React, { useState, useEffect, useRef } from 'react';
import { SUGGESTIONS, TRENDING_TOPICS } from '../utils/aiEngine';
import { Terminal, Shield, Zap, Search, Globe, Mic, Send } from 'lucide-react';

// 3D Parallax Hover Suggestion Card Component (Depth Layer 10px)
const SuggestionCard = ({ text, category, onClick }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1, glowX: 50, glowY: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setTilt({
      x: rotateX,
      y: rotateY,
      scale: 1.04,
      glowX,
      glowY
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      x: 0,
      y: 0,
      scale: 1,
      glowX: 50,
      glowY: 50
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255, 255, 255, 0.04) 0%, rgba(5, 5, 12, 0.88) 100%)`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8)',
        cursor: 'pointer',
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale}) translateZ(10px)`,
        transition: 'transform 0.15s ease-out, background 0.15s ease-out, border 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '110px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = category === 'Search' ? 'rgba(6, 182, 212, 0.45)' : category === 'Development' ? 'rgba(139, 92, 246, 0.45)' : 'rgba(236, 72, 153, 0.45)';
      }}
    >
      <div 
        style={{ 
          fontSize: '0.82rem', 
          fontWeight: 500, 
          color: '#ffffff', 
          lineHeight: 1.4,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}
      >
        "{text}"
      </div>
      <div 
        style={{
          fontSize: '0.65rem',
          color: category === 'Search' ? 'var(--color-cyan)' : category === 'Development' ? 'var(--color-violet)' : 'var(--color-pink)',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textShadow: `0 0 8px ${category === 'Search' ? 'rgba(6,182,212,0.3)' : category === 'Development' ? 'rgba(139,92,246,0.3)' : 'rgba(236,72,153,0.3)'}`
        }}
      >
        {category}
      </div>
    </div>
  );
};

export const HomeView = ({ user, onSelectSuggestion, onQuickAction }) => {
  const [inputText, setInputText] = useState('');
  const [randomSuggestions] = useState(() => {
    const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });
  const [accCanvas, setAccCanvas] = useState(null);
  
  // Page-level 3D Parallax Tilt coordinates
  const [pageTilt, setPageTilt] = useState({ x: 0, y: 0 });

  const handlePageMouseMove = (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (e.clientX - w / 2) / (w / 2);
    const y = (e.clientY - h / 2) / (h / 2);
    
    // Dampened rotational angle (max 5 degrees)
    setPageTilt({
      x: -y * 4,
      y: x * 4
    });
  };

  const handlePageMouseLeave = () => {
    setPageTilt({ x: 0, y: 0 });
  };

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

  // 3D Perspective Accretion Disk Particle Singularity (Optimized for High FPS)
  useEffect(() => {
    if (!accCanvas) return;
    const ctx = accCanvas.getContext('2d');
    
    const resize = () => {
      accCanvas.width = 160;
      accCanvas.height = 160;
    };
    resize();

    const cx = accCanvas.width / 2;
    const cy = accCanvas.height / 2;
    
    // Reduced count to 110 for locked high-refresh-rate FPS performance
    const particles = [];
    for (let i = 0; i < 110; i++) {
      const radius = 32 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.016 + Math.random() * 0.02) * (45 / radius);
      const size = 0.8 + Math.random() * 1.5;
      const zOffset = (Math.random() - 0.5) * 12;
      const hue = radius < 50 ? 165 + Math.random() * 35 : 255 + Math.random() * 35;
      particles.push({ radius, angle, speed, size, zOffset, hue });
    }

    let animationId;
    let rotationTime = 0;
    
    // Pre-calculate perspective constants
    const cosPitch = Math.cos(0.55);
    const sinPitch = Math.sin(0.55);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, accCanvas.width, accCanvas.height);

      rotationTime += 0.005;

      // Draw perspective ring guides
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.38);
      ctx.rotate(rotationTime);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const projected = [];
      const len = particles.length;

      // Cache-friendly projection loop
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        p.angle += p.speed;
        
        const x3d = p.radius * Math.cos(p.angle);
        const y3d = p.radius * Math.sin(p.angle);
        const z3d = p.zOffset;

        const projX = x3d;
        const projY = y3d * cosPitch - z3d * sinPitch;
        const projZ = y3d * sinPitch + z3d * cosPitch;

        const scale = 140 / (140 + projZ);

        projected.push({
          x: cx + projX * scale,
          y: cy + projY * scale,
          size: p.size * scale,
          color: `hsla(${p.hue}, 95%, 65%, ${scale * 0.85})`,
          depth: projZ
        });
      }

      // Depth sort
      projected.sort((a, b) => b.depth - a.depth);

      // Render loops
      for (let i = 0; i < len; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [accCanvas]);

  return (
    <div 
      onMouseMove={handlePageMouseMove}
      onMouseLeave={handlePageMouseLeave}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between', // Spaces elements cleanly to fit full-screen
        padding: '30px 40px 24px',
        backgroundColor: '#000000',
        width: '100%',
        height: '100%',
        maxHeight: 'calc(100vh - 40px)', // Snug cockpit layout bounds
        overflow: 'hidden',
        perspective: '1500px' // Cockpit level perspective
      }}
    >
      {/* 3D PARALLAX HOLOGRAPHIC CONTAINER */}
      <div 
        style={{
          width: '100%',
          maxWidth: '850px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${pageTilt.x}deg) rotateY(${pageTilt.y}deg)`,
          transition: 'transform 0.1s ease-out',
          height: '100%',
          justifyContent: 'space-between'
        }}
      >
        {/* Core welcoming stack (Depth Layer 40px) */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateZ(40px)',
            transformStyle: 'preserve-3d',
            flexShrink: 0,
            marginBottom: '16px'
          }}
        >
          {/* Avatar Singularity Well */}
          <div 
            style={{
              position: 'relative',
              width: '160px',
              height: '160px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateZ(10px)'
            }}
          >
            <canvas 
              ref={setAccCanvas} 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%',
                borderRadius: '50%'
              }} 
            />

            <div 
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #0c1a3a 0%, #000000 100%)',
                border: '2px solid rgba(0, 210, 255, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(0, 210, 255, 0.35)',
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 0 12px rgba(0, 210, 255, 0.7)',
                zIndex: 2
              }}
            >
              Æ
            </div>
          </div>

          <h1 
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 4px',
              background: 'linear-gradient(to right, #ffffff 40%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 10px rgba(0,0,0,0.95)'
            }}
          >
            {getGreeting()}, {user?.displayName || 'Operator'}
          </h1>
          
          <p 
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.96rem',
              maxWidth: '540px',
              lineHeight: 1.4,
              margin: 0,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.85)'
            }}
          >
            Aether Kernel is primed. Address the intelligent matrix to compile, search, solve, or speak.
          </p>
        </div>

        {/* Suggestion Grid (Depth Layer 20px) */}
        <div 
          style={{ 
            width: '100%', 
            transform: 'translateZ(20px)',
            marginBottom: '16px',
            flexShrink: 0
          }}
        >
          <div 
            style={{
              textAlign: 'left',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              fontWeight: 700,
              marginBottom: '12px'
            }}
          >
            Suggested Directives
          </div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              width: '100%'
            }}
          >
            {randomSuggestions.map((sug, idx) => (
              <SuggestionCard
                key={idx}
                text={sug.text}
                category={sug.category}
                onClick={() => onSelectSuggestion(sug.text)}
              />
            ))}
          </div>
        </div>

        {/* Bottom split grids (Depth Layer 15px) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            width: '100%',
            transform: 'translateZ(15px)',
            marginBottom: '16px',
            flexShrink: 1
          }}
        >
          {/* Quick Actions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                fontWeight: 700,
                marginBottom: '10px',
                textAlign: 'left'
              }}
            >
              Quick Action Nodes
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <button 
                onClick={() => onQuickAction("Initiate web crawler search...")}
                className="cyber-btn-secondary" 
                style={{ 
                  justifyContent: 'flex-start', 
                  padding: '10px 16px', 
                  width: '100%', 
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(5, 5, 12, 0.72)',
                  borderColor: 'rgba(0, 210, 255, 0.12)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.85)',
                  fontSize: '0.8rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 210, 255, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.12)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.85)';
                }}
              >
                <Globe size={14} style={{ color: 'var(--color-cyan)', filter: 'drop-shadow(0 0 8px rgba(0,210,255,0.4))' }} />
                <span style={{ fontWeight: 600 }}>Deep Web Search Index</span>
              </button>
              
              <button 
                onClick={() => onQuickAction("Write a script for ")}
                className="cyber-btn-secondary" 
                style={{ 
                  justifyContent: 'flex-start', 
                  padding: '10px 16px', 
                  width: '100%', 
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(5, 5, 12, 0.72)',
                  borderColor: 'rgba(139, 92, 246, 0.12)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.85)',
                  fontSize: '0.8rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-violet)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.12)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.85)';
                }}
              >
                <Terminal size={14} style={{ color: 'var(--color-violet)', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))' }} />
                <span style={{ fontWeight: 600 }}>Launch Script Terminal</span>
              </button>
              
              <button 
                onClick={() => onQuickAction("Listen to my voice input...")}
                className="cyber-btn-secondary" 
                style={{ 
                  justifyContent: 'flex-start', 
                  padding: '10px 16px', 
                  width: '100%', 
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(5, 5, 12, 0.72)',
                  borderColor: 'rgba(236, 72, 153, 0.12)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.85)',
                  fontSize: '0.8rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-pink)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(236, 72, 153, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.12)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.85)';
                }}
              >
                <Mic size={14} style={{ color: 'var(--color-pink)', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))' }} />
                <span style={{ fontWeight: 600 }}>Configure Bio-Voice Node</span>
              </button>
            </div>
          </div>

          {/* Trending Index */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                fontWeight: 700,
                marginBottom: '10px',
                textAlign: 'left'
              }}
            >
              Trending Synapse Mappings
            </div>
            <div 
              className="glass-panel" 
              style={{
                padding: '14px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(5, 5, 12, 0.72)',
                borderColor: 'rgba(255, 255, 255, 0.04)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.9)',
                flex: 1
              }}
            >
              {TRENDING_TOPICS.map((topic, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Zap size={12} style={{ color: 'var(--color-cyan)', filter: 'drop-shadow(0 0 6px rgba(0,210,255,0.4))' }} />
                  <span style={{ fontWeight: 500 }}>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Input Bar (Depth Layer 30px) */}
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
            borderColor: 'rgba(255, 255, 255, 0.05)',
            background: 'rgba(5, 5, 10, 0.9)',
            width: '100%',
            transform: 'translateZ(30px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.95), 0 0 20px rgba(124, 58, 237, 0.05)',
            flexShrink: 0
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
              fontSize: '0.94rem',
              fontFamily: 'var(--font-sans)',
              padding: '8px 0'
            }}
          />
          <button 
            type="submit"
            className="cyber-btn"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              minWidth: 'auto',
              background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)'
            }}
            disabled={!inputText.trim()}
          >
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
};
