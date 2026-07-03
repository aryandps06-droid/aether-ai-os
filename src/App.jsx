// Core App Controller and state management for Aether AI OS
import React, { useState, useEffect, useRef } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { AppShell } from './components/AppShell';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { authSystem } from './utils/authSystem';
import { streamResponse } from './utils/aiEngine';

function App() {
  const [screen, setScreen] = useState('splash'); // splash, auth, app
  const [currentUser, setCurrentUser] = useState(null);
  const globalBackgroundCanvasRef = useRef(null);
  
  // Chats State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize and check active sessions
  useEffect(() => {
    const user = authSystem.getCurrentUser();
    if (user && user.verified) {
      setCurrentUser(user);
    }
    
    // Load chats from LocalStorage
    const savedChats = localStorage.getItem('aether_chats');
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (e) {
        console.error("Failed to load cached conversations", e);
      }
    }
  }, []);

  // Global background constellation plexus animation
  useEffect(() => {
    if (screen === 'splash') return;

    const canvas = globalBackgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking
    const mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // 80 slow-moving background particles
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.15
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.15)'; // trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Read current primary color dynamically from CSS variables
      const style = getComputedStyle(document.documentElement);
      const colorViolet = style.getPropertyValue('--color-violet').trim() || '#10b981';

      // Render grid overlay faintly
      ctx.strokeStyle = `${colorViolet}05`; // transparent overlay
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw constellation plexus lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const opacity = (1 - dist / 110) * 0.15;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`; // matching emerald base
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render and update flowing nodes
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Mouse gravity pull
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 160) {
            const pullForce = (1 - mdist / 160) * 0.06;
            p.x += mdx * pullForce;
            p.y += mdy * pullForce;
          }
        }

        // Screen boundary bounce
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`; // matching emerald base
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(frameId);
    };
  }, [screen]);

  const handleSplashComplete = () => {
    if (currentUser) {
      setScreen('app');
    } else {
      setScreen('auth');
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setScreen('app');
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      authSystem.logout();
      setCurrentUser(null);
      setScreen('auth');
      setActiveChatId(null);
      setIsLoggingOut(false);
    }, 1800);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Persist in localStorage session
    const current = localStorage.getItem('aether_current_user');
    if (current) {
      const parsed = JSON.parse(current);
      localStorage.setItem('aether_current_user', JSON.stringify({
        ...parsed,
        displayName: updatedUser.displayName
      }));
    }
  };

  // Helper to persist chats
  const saveChats = (updatedChats) => {
    setChats(updatedChats);
    localStorage.setItem('aether_chats', JSON.stringify(updatedChats));
  };

  // Chat Operations
  const handleCreateNewChat = () => {
    const activeId = 'chat-' + Date.now();
    const newChat = {
      id: activeId,
      title: 'New Chat Thread',
      messages: [],
      createdAt: new Date().toISOString()
    };
    saveChats([newChat, ...chats]);
    setActiveChatId(activeId);
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId, e) => {
    if (e) e.stopPropagation();
    const updatedChats = chats.filter(c => c.id !== chatId);
    saveChats(updatedChats);
    if (activeChatId === chatId) {
      if (updatedChats.length > 0) {
        setActiveChatId(updatedChats[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  };

  const MAX_MESSAGES_PER_CHAT = 10;

  const handleSendMessage = (text, file) => {
    let currentChats = [...chats];
    let activeId = activeChatId;

    // Enforce 10 user-message limit per chat session to protect API quota
    if (activeId) {
      const existingChat = currentChats.find(c => c.id === activeId);
      if (existingChat) {
        const userMsgCount = existingChat.messages.filter(m => m.sender === 'user').length;
        if (userMsgCount >= MAX_MESSAGES_PER_CHAT) {
          const limitMsg = {
            id: 'msg-limit-' + Date.now(),
            sender: 'assistant',
            text: `⚠️ **Neural Capacity Reached** (${MAX_MESSAGES_PER_CHAT} messages per thread).\n\nEven an advanced AI OS needs to clear its short-term cache. To keep our quantum channels lightning fast, each thread is limited to **${MAX_MESSAGES_PER_CHAT} exchanges**.\n\n👉 Click **Initialize Chat Node** in the sidebar to start a fresh neural thread and continue our conversation!`,
            isStreaming: false,
            timestamp: new Date().toISOString()
          };
          const updatedChat = { ...existingChat, messages: [...existingChat.messages, limitMsg] };
          const updatedChats = currentChats.map(c => c.id === activeId ? updatedChat : c);
          saveChats(updatedChats);
          return;
        }
      }
    }

    const userMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      file: file,
      timestamp: new Date().toISOString()
    };

    let targetChat;

    if (!activeId) {
      // Create new chat session node
      const topicTitle = file ? `File: ${file.name}` : (text.length > 28 ? text.substring(0, 25) + '...' : text);
      activeId = 'chat-' + Date.now();
      
      targetChat = {
        id: activeId,
        title: topicTitle,
        messages: [userMessage],
        createdAt: new Date().toISOString()
      };
      
      currentChats.unshift(targetChat);
      setActiveChatId(activeId);
    } else {
      // Append to existing chat
      currentChats = currentChats.map(c => {
        if (c.id === activeId) {
          targetChat = {
            ...c,
            messages: [...c.messages, userMessage]
          };
          return targetChat;
        }
        return c;
      });
    }

    // Append a temporary assistant message to show streaming status
    const assistantMessageId = 'msg-ai-' + Date.now();
    const assistantMessage = {
      id: assistantMessageId,
      sender: 'assistant',
      text: '',
      isStreaming: true,
      timestamp: new Date().toISOString()
    };

    targetChat.messages.push(assistantMessage);
    saveChats(currentChats);

    // Call stream simulation
    let streamCancel;
    streamCancel = streamResponse(text, (chunk) => {
      // Chunk update callback
      setChats(prevChats => {
        const next = prevChats.map(c => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return { ...m, text: chunk };
                }
                return m;
              })
            };
          }
          return c;
        });
        localStorage.setItem('aether_chats', JSON.stringify(next));
        return next;
      });
    }, (finalText) => {
      // Stream complete callback
      setChats(prevChats => {
        const next = prevChats.map(c => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return { ...m, text: finalText, isStreaming: false };
                }
                return m;
              })
            };
          }
          return c;
        });
        localStorage.setItem('aether_chats', JSON.stringify(next));
        return next;
      });
    }, file, targetChat.messages.slice(0, -2));
  };

  const handleUpdateMessage = (msgId, newText) => {
    // GPT-style message editing
    const currentChats = chats.map(c => {
      if (c.id === activeChatId) {
        const msgIdx = c.messages.findIndex(m => m.id === msgId);
        if (msgIdx === -1) return c;

        // Truncate messages after this edited user message
        const nextMessages = c.messages.slice(0, msgIdx + 1).map(m => {
          if (m.id === msgId) {
            return { ...m, text: newText };
          }
          return m;
        });

        // Add streaming assistant response
        const assistantMessageId = 'msg-ai-edit-' + Date.now();
        nextMessages.push({
          id: assistantMessageId,
          sender: 'assistant',
          text: '',
          isStreaming: true,
          timestamp: new Date().toISOString()
        });

        // Trigger stream
        streamResponse(newText, (chunk) => {
          setChats(prev => {
            const upd = prev.map(ch => {
              if (ch.id === activeChatId) {
                return {
                  ...ch,
                  messages: ch.messages.map(m => (m.id === assistantMessageId ? { ...m, text: chunk } : m))
                };
              }
              return ch;
            });
            localStorage.setItem('aether_chats', JSON.stringify(upd));
            return upd;
          });
        }, (finalText) => {
          setChats(prev => {
            const upd = prev.map(ch => {
              if (ch.id === activeChatId) {
                return {
                  ...ch,
                  messages: ch.messages.map(m => (m.id === assistantMessageId ? { ...m, text: finalText, isStreaming: false } : m))
                };
              }
              return ch;
            });
            localStorage.setItem('aether_chats', JSON.stringify(upd));
            return upd;
          });
        }, null, nextMessages.slice(0, -2));

        return {
          ...c,
          messages: nextMessages
        };
      }
      return c;
    });

    saveChats(currentChats);
  };

  const handleRegenerateMessage = (msgId) => {
    let currentChats = [...chats];
    const activeChat = currentChats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const msgIdx = activeChat.messages.findIndex(m => m.id === msgId);
    if (msgIdx === -1) return;

    // Find the user prompt preceding this response
    const userPrompt = activeChat.messages.slice(0, msgIdx).reverse().find(m => m.sender === 'user');
    if (!userPrompt) return;

    // Replace the AI message with a streaming indicator
    const newChats = currentChats.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId) {
              return { ...m, text: '', isStreaming: true };
            }
            return m;
          })
        };
      }
      return c;
    });

    setChats(newChats);

    // Call stream simulation on the original user prompt
    streamResponse(userPrompt.text, (chunk) => {
      setChats(prev => {
        const upd = prev.map(ch => {
          if (ch.id === activeChatId) {
            return {
              ...ch,
              messages: ch.messages.map(m => (m.id === msgId ? { ...m, text: chunk } : m))
            };
          }
          return ch;
        });
        localStorage.setItem('aether_chats', JSON.stringify(upd));
        return upd;
      });
    }, (finalText) => {
      setChats(prev => {
        const upd = prev.map(ch => {
          if (ch.id === activeChatId) {
            return {
              ...ch,
              messages: ch.messages.map(m => (m.id === msgId ? { ...m, text: finalText, isStreaming: false } : m))
            };
          }
          return ch;
        });
        localStorage.setItem('aether_chats', JSON.stringify(upd));
        return upd;
      });
    }, userPrompt.file, activeChat.messages.slice(0, activeChat.messages.indexOf(userPrompt)));
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <>
      {/* Global background constellation plexus */}
      {screen !== 'splash' && (
        <canvas 
          ref={globalBackgroundCanvasRef} 
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* Cyber overlay scanlines */}
      {screen !== 'splash' && <div className="scanline-effect" />}

      {screen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {screen === 'auth' && (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}

      {screen === 'app' && (
        <AppShell 
          user={currentUser} 
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onDeleteChat={handleDeleteChat}
        >
          {activeChat ? (
            <ChatView 
              chat={activeChat} 
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
              onRegenerateMessage={handleRegenerateMessage}
            />
          ) : (
            <HomeView 
              user={currentUser} 
              onSelectSuggestion={handleSendMessage}
              onQuickAction={setInput => handleSendMessage(setInput)}
            />
          )}
        </AppShell>
      )}

      {isLoggingOut && (
        <LogoutOverlay />
      )}
    </>
  );
}

const LogoutOverlay = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let frameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial outer edge particles converging inward
    const pCount = 75;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 320 + Math.random() * 280;
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * dist,
        y: canvas.height / 2 + Math.sin(angle) * dist,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.45 ? '#ef4444' : '#f43f5e',
        alpha: 1
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.28)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += (p.targetX - p.x) * 0.05;
        p.y += (p.targetY - p.y) * 0.05;
        
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 18) {
          p.alpha -= 0.06;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      frameId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#02020a',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} 
      />
      
      <div 
        style={{
          zIndex: 10,
          textAlign: 'center',
          padding: '40px 30px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(5, 2, 25, 0.75)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)',
          backdropFilter: 'blur(12px)',
          maxWidth: '430px',
          width: '90%',
          animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
          }}
        >
          🔒
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', marginBottom: '8px' }}>
          SECURE CHANNEL CLOSED
        </h2>
        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-pink)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
          [ DISCONNECTED ]
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
          Closing neural telemetry bridge, clearing session memory channels, and locking operator terminal node...
        </p>
      </div>
    </div>
  );
};

export default App;
