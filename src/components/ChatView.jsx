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

    // Stop speaking when chat changes
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chat?.id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() && !fileAttachment) return;

    const messageText = input;
    setInput('');
    const attachedFile = fileAttachment;
    setFileAttachment(null);

    // Call parent handler to create User message
    onSendMessage(messageText, attachedFile);
  };

  // Simulated Speech Input fallback if WebSpeech is not supported
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // Simulation fallback
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
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech Synthesis
  const speakMessage = (messageId, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Biometric Speech Synthesis is not supported in this environment.");
      return;
    }

    if (speechActiveId === messageId) {
      window.speechSynthesis.cancel();
      setSpeechActiveId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop current speech
    
    // Clean markdown before speaking
    const cleanText = text
      .replace(/###\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/`[^`]+`/g, 'code block')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Load config from settings
    const speed = localStorage.getItem('aether_speech_speed') || '1';
    utterance.rate = parseFloat(speed);
    
    const voiceName = localStorage.getItem('aether_speech_voice');
    if (voiceName) {
      const selected = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
      if (selected) utterance.voice = selected;
    }

    utterance.onend = () => {
      setSpeechActiveId(null);
    };

    utterance.onerror = () => {
      setSpeechActiveId(null);
    };

    setSpeechActiveId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Clipboard Copier
  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // File Uploader
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttachment({
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  // Edit Message
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

  // Share conversation simulation
  const handleShare = () => {
    const mockLink = `https://aether.ai/share/session-${chat.id}`;
    setShareLink(mockLink);
    setShowShare(true);
  };

  // Custom parser to format markdown/latex blocks
  const renderMessageContent = (text) => {
    if (!text) return null;

    // Line parser
    const lines = text.split('\n');
    const elements = [];
    let codeBlock = [];
    let isCode = false;
    let codeLanguage = '';
    let tableRows = [];
    let isTable = false;

    lines.forEach((line, index) => {
      // Check code block
      if (line.trim().startsWith('```')) {
        if (isCode) {
          // End of code
          elements.push(
            <div key={`code-${index}`} style={{ margin: '14px 0', width: '100%' }}>
              <div className="code-header">
                <span>{codeLanguage || 'terminal'}</span>
                <button 
                  onClick={() => copyToClipboard(`code-snippet-${index}`, codeBlock.join('\n'))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <div className="code-container">
                <code className="code-block">{codeBlock.join('\n')}</code>
              </div>
            </div>
          );
          codeBlock = [];
          isCode = false;
        } else {
          // Start of code
          isCode = true;
          codeLanguage = line.trim().substring(3) || 'javascript';
        }
        return;
      }

      if (isCode) {
        codeBlock.push(line);
        return;
      }

      // Check tables (start with |)
      if (line.trim().startsWith('|')) {
        isTable = true;
        // Ignore separating lines e.g. | :--- | :--- |
        if (!line.includes('---')) {
          const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
          tableRows.push(cells);
        }
        return;
      } else if (isTable) {
        // Table finished, render table elements
        isTable = false;
        elements.push(
          <div key={`table-${index}`} style={{ overflowX: 'auto', margin: '16px 0', width: '100%' }}>
            <table className="markdown-table">
              <thead>
                <tr>
                  {tableRows[0]?.map((cell, idx) => <th key={idx}>{cell}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }

      // Parse headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: '18px 0 8px', letterSpacing: '-0.01em' }}>{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={index} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-cyan)', margin: '14px 0 6px' }}>{line.replace('#### ', '')}</h4>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={index} style={{ fontWeight: 600, color: '#fff', margin: '8px 0' }}>{line.replace(/\*\*/g, '')}</p>);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        // Simple bullets support
        const bulletText = line.substring(2);
        // Inline bold parsing
        const formattedText = parseInlineMarkdown(bulletText);
        elements.push(
          <div key={index} style={{ display: 'flex', gap: '8px', margin: '6px 0 6px 12px', fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--color-cyan)' }}>•</span>
            <span>{formattedText}</span>
          </div>
        );
      } else if (line.trim().startsWith('\\[')) {
        // LaTeX math blocks
        const math = line.replace('\\[', '').replace('\\]', '');
        elements.push(
          <div key={index} className="latex-block">
            {math}
          </div>
        );
      } else if (line.trim()) {
        const formattedText = parseInlineMarkdown(line);
        elements.push(<p key={index} style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '8px 0' }}>{formattedText}</p>);
      }
    });

    return elements;
  };

  // Helper for inline markdown bold / code tags
  const parseInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\\\(.*?\\\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--color-pink)' }}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        return <span key={i} style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Top Banner Toolbar */}
      <div 
        style={{
          padding: '16px 24px 16px 72px',
          borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
          background: 'rgba(3, 0, 20, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 90
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{chat?.title}</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secure Quantum Channel Active</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleShare}
            className="cyber-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Share2 size={14} />
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
          backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(0, 210, 255, 0.04) 0%, transparent 50%)',
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>Aether AI Workspace Node</h3>
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
                className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}
                style={{
                  position: 'relative',
                  width: 'fit-content',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* File Attachment Pill in bubble if present */}
                {msg.file && (
                  <div 
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--color-cyan)' }} />
                    <span style={{ fontWeight: 500 }}>{msg.file.name}</span>
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
                      style={{ width: '100%', resize: 'none', background: '#0a0522' }}
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
                  <div>{renderMessageContent(msg.text)}</div>
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
          borderTop: '1px solid rgba(139, 92, 246, 0.15)',
          background: 'rgba(3, 0, 20, 0.55)',
          backdropFilter: 'blur(15px)',
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
            background: 'rgba(8, 4, 32, 0.8)'
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
            placeholder={fileAttachment ? "Add prompt notes to compile with file..." : "Compile instructions for Aether..."}
            value={input}
            onChange={e => setInput(e.target.value)}
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
              boxShadow: 'none'
            }}
            disabled={!input.trim() && !fileAttachment}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Share Modal simulation Dialog */}
      {showShare && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3,0,20,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="glass-panel glow-ring"
            style={{
              padding: '30px',
              width: '100%',
              maxWidth: '440px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid rgba(139,92,246,0.15)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Share Conversation Node</h3>
              <X size={18} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowShare(false)} />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Generate a shareable public terminal link for this active synapse thread.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="cyber-input"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: '#0a0522' }}
              />
              <button 
                onClick={() => copyToClipboard('share-link', shareLink)}
                className="cyber-btn"
                style={{ padding: '10px' }}
              >
                Copy
              </button>
            </div>
            
            {copiedId === 'share-link' && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Check size={14} /> Link copied to clipboard.
              </span>
            )}
            
            <button onClick={() => setShowShare(false)} className="cyber-btn-secondary" style={{ width: '100%', padding: '10px' }}>
              Close Shared Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
