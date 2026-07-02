// Main App Shell Layout for Aether AI OS (Sidebar navigation & background animations)
import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Settings, MessageSquare, Terminal, ChevronLeft, ChevronRight, Activity, Cpu, Trash2 } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { authSystem } from '../utils/authSystem';

export const AppShell = ({ children, user, onLogout, onUpdateUser, chats, activeChatId, onSelectChat, onCreateNewChat, onDeleteChat }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [systemLoad, setSystemLoad] = useState({ cpu: 12, ram: 42, sync: 99.8 });
  const neuralCoreRef = useRef(null);

  // System status fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemLoad({
        cpu: Math.max(5, Math.min(95, Math.floor(15 + (Math.random() - 0.5) * 8))),
        ram: Math.max(30, Math.min(80, Math.floor(45 + (Math.random() - 0.5) * 2))),
        sync: parseFloat((99.5 + Math.random() * 0.49).toFixed(2))
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-collapse sidebar on mobile/tablet widths (<768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Real-time Spinning 3D Holographic Neural Core Loop
  useEffect(() => {
    const canvas = neuralCoreRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let angle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 26 + Math.sin(Date.now() * 0.002) * 2; // subtle pulse

      // Draw outer scan circle
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 37, 0, Math.PI * 2);
      ctx.stroke();

      // Golden ratio distributed 3D spherical nodes
      const nodeCount = 18;
      const nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        const theta = (i / nodeCount) * Math.PI * 2 + angle;
        const phi = (i % 3) * (Math.PI / 3) + angle * 0.4;
        
        // Project 3D coordinate space
        const sx = radius * Math.sin(phi) * Math.cos(theta);
        const sy = radius * Math.cos(phi);
        const sz = radius * Math.sin(phi) * Math.sin(theta);
        
        const scale = (sz + radius) / (radius * 2);
        const px = cx + sx;
        const py = cy + sy;
        
        const size = scale * 2 + 1;
        const opacity = scale * 0.6 + 0.25;
        
        nodes.push({ x: px, y: py, size, opacity });
      }

      // Draw synapse linkages
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.14)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 34) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw glowing neurons
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${n.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();
      });

      angle += 0.012;
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);
  return (
    <div 
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }}
    >

      {/* Sidebar Panel */}
      <aside 
        className="glass-panel"
        style={{
          width: sidebarOpen ? '280px' : '0px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          borderRadius: 0,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Header Branding */}
        <div 
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#fff',
              boxShadow: '0 0 15px var(--color-violet-glow)'
            }}
          >
            Æ
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>AETHER AI OS</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontWeight: 600, letterSpacing: '0.1em' }}>KERNEL v2.0.6</span>
          </div>
        </div>

        {/* Action Button: Initialize Chat */}
        <div style={{ padding: '16px 20px' }}>
          <button 
            className="cyber-btn"
            style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
            onClick={onCreateNewChat}
          >
            <MessageSquare size={16} />
            Initialize Chat Node
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
          <div style={{ padding: '0 8px 10px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>
            Session Threads
          </div>
          {chats.length === 0 ? (
            <div style={{ padding: '16px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No active nodes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {chats.map(chat => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    className="sidebar-chat-item animate-fade-in"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '2px 4px 2px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '8px 0',
                        outline: 'none'
                      }}
                    >
                      <Terminal size={13} style={{ color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</span>
                    </button>

                    <button
                      onClick={(e) => onDeleteChat(chat.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isActive ? 0.7 : 0,
                        transition: 'opacity 0.2s ease, color 0.2s ease',
                        flexShrink: 0,
                        outline: 'none'
                      }}
                      className="delete-chat-btn"
                      title="Delete chat thread"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operating System Diagnostics */}
        <div 
          style={{
            padding: '16px',
            background: 'rgba(5, 2, 25, 0.5)',
            borderTop: '1px solid rgba(139, 92, 246, 0.12)',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12} /> CPU Load</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: systemLoad.cpu > 70 ? '#ef4444' : 'var(--color-cyan)' }}>{systemLoad.cpu}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} /> RAM Usage</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{systemLoad.ram}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Telemetry Link</span>
            <span style={{ color: 'var(--color-pink)' }}>SYNC {systemLoad.sync}%</span>
          </div>
        </div>

        {/* Real-time Spinning Neural Orb Core */}
        <div 
          style={{
            padding: '12px 16px',
            background: 'rgba(3, 0, 20, 0.3)',
            borderTop: '1px solid rgba(139, 92, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <canvas 
            ref={neuralCoreRef} 
            width="80" 
            height="80" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(2, 2, 10, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.05)'
            }} 
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-cyan)', letterSpacing: '0.05em' }}>AETHER NEURAL CORE</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mode: Synaptic Loop Active</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulseMic 1.2s infinite alternate' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulseMic 1.2s infinite alternate', animationDelay: '0.3s' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00d2ff', display: 'inline-block', animation: 'pulseMic 1.2s infinite alternate', animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>

        {/* Bottom User Area */}
        <div 
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(139, 92, 246, 0.15)',
            background: 'rgba(5, 2, 25, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ overflow: 'hidden', marginRight: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || 'Operator Node'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setShowSettings(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              className="cyber-btn-secondary"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
              className="cyber-btn-secondary"
              title="Logout Node"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main 
        style={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          background: 'transparent'
        }}
      >
        {/* Toggle Sidebar floating button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            background: 'rgba(10, 5, 30, 0.6)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100
          }}
          title={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {children}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <ProfileSettings 
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdateUser={onUpdateUser}
        />
      )}
    </div>
  );
};
