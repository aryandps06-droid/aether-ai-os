// Luxury Conversational Interface for Aether AI OS (Streaming, markdown, code, tables, voice and files)
import React, { useState, useEffect, useRef } from 'react';
import { streamResponse } from '../utils/aiEngine';
import { 
  Send, Paperclip, Mic, MicOff, Volume2, VolumeX, Copy, Edit2, 
  RefreshCw, Play, Share2, CornerDownRight, Search, FileText, Check, AlertCircle, X, Sparkles 
} from 'lucide-react';

export const ChatView = ({ chat, onSendMessage, onUpdateMessage, onRegenerateMessage }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechActiveId, setSpeechActiveId] = useState(null); // ID of message currently being spoken
  const [copiedId, setCopiedId] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [fileAttachment, setFileAttachment] = useState(null);
  const [searchStates, setSearchStates] = useState({}); // tracking simulated search per streaming message
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const isStreaming = chat?.messages.length > 0 && chat.messages[chat.messages.length - 1].isStreaming;

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, searchStates]);

  // Speech Recognition API setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsRecording(false);
        };

        rec.onerror = (e) => {
          console.error("Speech Recognition Error", e);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chat?.id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (isStreaming) return;
    if (remainingCycles <= 0) return;
    if (!input.trim() && !fileAttachment) return;

    const messageText = input;
    setInput('');
    const attachedFile = fileAttachment;
    setFileAttachment(null);

    onSendMessage(messageText, attachedFile);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      if (isRecording) {
        setIsRecording(false);
      } else {
        setIsRecording(true);
        setTimeout(() => {
          setInput(prev => prev + (prev ? ' ' : '') + "Simulated speech input sequence.");
          setIsRecording(false);
        }, 2000);
      }
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      resetMessages();
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileAttachment({
          name: file.name,
          size: file.size,
          type: file.type,
          content: event.target.result
        });
      };
      
      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.js') || 
                     file.name.endsWith('.jsx') || 
                     file.name.endsWith('.ts') || 
                     file.name.endsWith('.tsx') || 
                     file.name.endsWith('.json') || 
                     file.name.endsWith('.py') || 
                     file.name.endsWith('.css') || 
                     file.name.endsWith('.html') || 
                     file.name.endsWith('.md') || 
                     file.name.endsWith('.txt') || 
                     file.name.endsWith('.java') || 
                     file.name.endsWith('.go') || 
                     file.name.endsWith('.rs') || 
                     file.name.endsWith('.cpp') || 
                     file.name.endsWith('.c') || 
                     file.name.endsWith('.sh');
                     
      if (isText) {
        reader.readAsText(file);
      } else {
        setFileAttachment({
          name: file.name,
          size: file.size,
          type: file.type,
          content: '[Binary file content - metadata only]'
        });
      }
    }
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = (msgId) => {
    if (editText.trim()) {
      onUpdateMessage(msgId, editText);
      setEditingMessageId(null);
    }
  };

  const handleShare = () => {
    const mockLink = `https://aether.ai/share/session-${chat.id}`;
    setShareLink(mockLink);
    setShowShare(true);
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let codeBlock = [];
    let isCode = false;
    let codeLanguage = '';
    let tableRows = [];
    let isTable = false;

    lines.forEach((line, index) => {
      // 1. Code Block parsing
      if (line.trim().startsWith('```')) {
        if (isCode) {
          elements.push(
            <div key={`code-${index}`} style={{ margin: '14px 0 20px', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
              <div className="code-header">
                <span>{codeLanguage || 'COMPILE'}</span>
                <span 
                  onClick={() => navigator.clipboard.writeText(codeBlock.join('\n'))}
                  style={{ cursor: 'pointer', color: 'var(--color-cyan)', fontSize: '0.72rem' }}
                >
                  Copy Node
                </span>
              </div>
              <div className="code-container">
                <code className="code-block">{codeBlock.join('\n')}</code>
              </div>
            </div>
          );
          codeBlock = [];
          isCode = false;
        } else {
          isCode = true;
          codeLanguage = line.trim().slice(3).toUpperCase();
        }
        return;
      }

      if (isCode) {
        codeBlock.push(line);
        return;
      }

      // 2. Table parsing
      if (line.trim().startsWith('|')) {
        isTable = true;
        tableRows.push(line);
        return;
      } else if (isTable) {
        // Output table
        const rows = tableRows.map(r => r.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));
        const headers = rows[0];
        const bodyRows = rows.slice(2); // Skip separator row

        elements.push(
          <div key={`table-${index}`} style={{ overflowX: 'auto', margin: '14px 0', width: '100%' }}>
            <table className="markdown-table">
              <thead>
                <tr>
                  {headers.map((h, i) => <th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        isTable = false;
      }

      // 3. LaTeX Equation Block parsing
      if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
        const formula = line.trim().slice(2, -2);
        elements.push(
          <div key={`latex-${index}`} className="latex-block">
            {formula}
          </div>
        );
        return;
      }

      // 4. Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        elements.push(
          <div key={`bullet-${index}`} style={{ display: 'flex', gap: '8px', paddingLeft: '10px', margin: '4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--color-cyan)' }}>•</span>
            <span>{line.trim().slice(2)}</span>
          </div>
        );
        return;
      }

      // 5. Default paragraphs
      if (line.trim()) {
        elements.push(
          <p key={`p-${index}`} style={{ margin: '0 0 10px', fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
            {line}
          </p>
        );
      }
    });

    if (isCode && codeBlock.length > 0) {
      elements.push(
        <div key="unclosed-code" className="code-container">
          <code className="code-block">{codeBlock.join('\n')}</code>
        </div>
      );
    }

    return elements;
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const speakMessage = (id, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speechActiveId === id) {
      window.speechSynthesis.cancel();
      setSpeechActiveId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/```[\s\S]*?```/g, '[Code Block omitted]');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeechActiveId(null);
      utterance.onerror = () => setSpeechActiveId(null);
      setSpeechActiveId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetMessages = () => {
    setEditingMessageId(null);
  };

  return (
    <div 
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000000', // OLED Black
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Session Title Header */}
      <div 
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(2, 2, 8, 0.92)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 90,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{chat?.title}</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secure Quantum Channel Active</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleShare}
            className="cyber-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 5, 12, 0.72)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <Share2 size={13} />
            Share
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '30px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 95% 80%, rgba(0, 210, 255, 0.03) 0%, transparent 50%)',
          backgroundAttachment: 'local'
        }}
      >
        {chat?.messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.85, padding: '40px 20px', textAlign: 'center', minHeight: '300px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.8rem',
              color: '#fff',
              marginBottom: '20px',
              boxShadow: '0 0 20px var(--color-violet-glow)',
              animation: 'spinSlow 20s linear infinite'
            }}>Æ</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em', color: '#fff' }}>Aether AI Workspace Node</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', lineHeight: 1.5 }}>
              Type your first query in the terminal input below to initialize compile sequences.
            </p>
          </div>
        )}

        {chat?.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
                animation: 'fadeInUp 0.3s ease'
              }}
            >
              {/* Message Header name */}
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '0 8px'
                }}
              >
                {isUser ? 'OPERATOR' : 'AETHER AI'}
                {!isUser && msg.isSearching && (
                  <span style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Search size={10} className="pulse-icon" /> searching...
                  </span>
                )}
              </span>

              {/* Chat Bubble Box */}
              <div 
                style={{
                  position: 'relative',
                  maxWidth: isUser ? '75%' : '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: isUser ? '16px 22px' : '18px 24px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser ? 'rgba(2, 2, 8, 0.85)' : 'rgba(1, 4, 16, 0.9)',
                  border: isUser ? '1px solid rgba(0, 210, 255, 0.45)' : '1px solid rgba(16, 185, 129, 0.35)',
                  boxShadow: isUser ? '0 8px 30px rgba(0, 0, 0, 0.95), 0 0 15px rgba(0, 210, 255, 0.12)' : '0 8px 30px rgba(0, 0, 0, 0.95), 0 0 15px rgba(16, 185, 129, 0.1)',
                  color: isUser ? '#ffffff' : '#f1f5f9',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = isUser ? 'var(--color-cyan)' : 'var(--color-emerald)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = isUser ? 'rgba(0, 210, 255, 0.45)' : 'rgba(16, 185, 129, 0.35)';
                }}
              >
                {/* File Attachment Pill in bubble - security data chip */}
                {msg.file && (
                  <div 
                    style={{
                      background: 'rgba(0, 210, 255, 0.05)',
                      border: '1px solid rgba(0, 210, 255, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      alignSelf: 'flex-start',
                      boxShadow: '0 2px 10px rgba(0, 210, 255, 0.05)'
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--color-cyan)', filter: 'drop-shadow(0 0 4px rgba(0,210,255,0.4))' }} />
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{msg.file.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({(msg.file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {/* Body Content */}
                {editingMessageId === msg.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="cyber-input"
                      rows={3}
                      style={{ width: '100%', resize: 'none', background: '#02020a' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                      <button onClick={() => setEditingMessageId(null)} className="cyber-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(msg.id)} className="cyber-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Save Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {renderMessageContent(msg.text)}
                    {msg.isStreaming && (
                      <span 
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '14px',
                          backgroundColor: '#10b981',
                          marginLeft: '6px',
                          verticalAlign: 'middle',
                          animation: 'pulseMic 0.8s infinite ease-in-out'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Bubble Footer Action panel (fade-in on hover) */}
                {!msg.isStreaming && !editingMessageId && (
                  <div 
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '8px',
                      alignSelf: 'flex-end'
                    }}
                  >
                    <button 
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Copy content"
                    >
                      {copiedId === msg.id ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    </button>

                    {isUser && (
                      <button 
                        onClick={() => startEdit(msg)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Edit input"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    {!isUser && (
                      <>
                        <button 
                          onClick={() => speakMessage(msg.id, msg.text)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: speechActiveId === msg.id ? 'var(--color-pink)' : 'var(--text-muted)', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center' 
                          }}
                          title={speechActiveId === msg.id ? "Mute Biospeech" : "Synthesize Biospeech"}
                        >
                          {speechActiveId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        </button>

                        <button 
                          onClick={() => onRegenerateMessage(msg.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Regenerate message"
                        >
                          <RefreshCw size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Animated Speech indicator waveform */}
                {!isUser && speechActiveId === msg.id && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="sound-wave">
                      <div className="sound-bar" />
                      <div className="sound-bar" />
                      <div className="sound-bar" />
                      <div className="sound-bar" />
                      <div className="sound-bar" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live typing loading status */}
        {chat?.messages.length > 0 && chat.messages[chat.messages.length - 1].isStreaming && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>
            <div 
              style={{
                width: '6px',
                height: '6px',
                background: 'var(--color-cyan)',
                borderRadius: '50%',
                animation: 'pulseMic 1s infinite alternate'
              }}
            />
            <span>Aether is streaming thoughts...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input panel Form */}
      <div 
        style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(2, 2, 8, 0.92)',
          backdropFilter: 'blur(20px)',
          zIndex: 80
        }}
      >
        <form 
          onSubmit={handleSend}
          className="glass-panel glow-ring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            background: 'rgba(5, 5, 10, 0.88)'
          }}
        >
          {/* File input attachment click */}
          <button 
            type="button"
            onClick={triggerFileUpload}
            style={{
              background: 'transparent',
              border: 'none',
              color: fileAttachment ? 'var(--color-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-full)'
            }}
            className="cyber-btn-secondary"
            title="Attach file payload"
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />

          {/* Text Area */}
          <input 
            type="text"
            placeholder={isStreaming ? "Aether is compiling..." : (fileAttachment ? "Add prompt notes to compile with file..." : "Compile instructions for Aether...")}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
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

          {/* Attachment Preview pill if set */}
          {fileAttachment && (
            <div 
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--color-cyan)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--color-cyan)'
              }}
            >
              <FileText size={12} />
              <span>{fileAttachment.name.slice(0, 12)}...</span>
              <X 
                size={12} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setFileAttachment(null)} 
              />
            </div>
          )}

          {/* Microphone button speech */}
          <button 
            type="button"
            onClick={toggleRecording}
            style={{
              background: 'transparent',
              border: 'none',
              color: isRecording ? 'var(--color-pink)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              animation: isRecording ? 'pulseMic 1.5s infinite ease-in-out' : 'none'
            }}
            className="cyber-btn-secondary"
            title="Bio-Voice Recognition input"
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Trigger */}
          <button 
            type="submit"
            className="cyber-btn"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              minWidth: 'auto',
              boxShadow: 'none',
              background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)'
            }}
            disabled={isStreaming || (!input.trim() && !fileAttachment)}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Share Modal simulation Dialog */}
      {showShare && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <div 
            className="glass-panel"
            style={{
              padding: '30px',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '460px',
              width: '90%',
              background: '#04040c',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 210, 255, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Sync Link Generated</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Your quantum workspace session link is primed. Copy link to deploy to peer terminal nodes.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="cyber-input" 
                style={{ flex: 1, fontSize: '0.8rem', background: '#020206' }} 
              />
              <button 
                onClick={() => { navigator.clipboard.writeText(shareLink); alert('Link Copied!'); }}
                className="cyber-btn"
                style={{ padding: '0 16px', minWidth: 'auto' }}
              >
                Copy
              </button>
            </div>
            <button 
              onClick={() => setShowShare(false)} 
              className="cyber-btn-secondary" 
              style={{ width: '100%', padding: '10px 0', borderRadius: 'var(--radius-md)' }}
            >
              Close Link Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
