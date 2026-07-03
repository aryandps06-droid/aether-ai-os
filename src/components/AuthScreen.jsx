// 3D Flippable Auth Screen with Biometric Sound Synthesis for Aether AI OS
import React, { useState, useEffect, useRef } from 'react';
import { authSystem } from '../utils/authSystem';
import { Mail, Lock, User, Check, ShieldAlert, Sparkles } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState('login'); // login, register, forgot, verify, verify-reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedMail, setSimulatedMail] = useState(null);
  const [successUser, setSuccessUser] = useState(null);

  const cardRef = useRef(null);
  const [frontScanCanvas, setFrontScanCanvas] = useState(null);
  const [backScanCanvas, setBackScanCanvas] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1, transition: 'transform 0.5s ease' });

  const playMechClick = () => {};
  const playTabSlide = () => {};
  const playEpicStartupSound = () => {};

  // 3D Parallax Mouse Move Handler
  const handleCardMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    setTilt({
      x: rotateX,
      y: rotateY,
      scale: 1.025,
      transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({
      x: 0,
      y: 0,
      scale: 1,
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    });
  };

  // Biometric scanner loop generator
  const initRadarScan = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120;
    canvas.height = 120;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let scanY = 10;
    let dir = 1;
    let animationId;

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 12, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 210, 255, 0.22)';
      ctx.lineWidth = 1;
      for (let r = 15; r < 50; r += 10) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy); ctx.lineTo(cx + 50, cy);
      ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50);
      ctx.stroke();

      scanY += 1.6 * dir;
      if (scanY > canvas.height - 15 || scanY < 15) {
        dir *= -1;
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
      ctx.beginPath();
      ctx.moveTo(20, scanY);
      ctx.lineTo(canvas.width - 20, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  };

  useEffect(() => {
    if (!frontScanCanvas) return;
    const cancel = initRadarScan(frontScanCanvas);
    return () => cancel && cancel();
  }, [frontScanCanvas]);

  useEffect(() => {
    if (!backScanCanvas) return;
    const cancel = initRadarScan(backScanCanvas);
    return () => cancel && cancel();
  }, [backScanCanvas]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
    setSimulatedMail(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter all fields.');

    resetMessages();
    setLoading(true);
    try {
      const user = await authSystem.login(email, password, rememberMe);
      if (!user.verified) {
        setSuccess('Verification required. Sending verification code...');
        setSimulatedMail('123456');
        setTab('verify');
        playTabSlide();
      } else {
        playEpicStartupSound();
        setSuccessUser(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return setError('Please enter all fields.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    resetMessages();
    setLoading(true);
    try {
      const res = await authSystem.register(email, password, displayName);
      setSuccess(res.message);
      if (res.sandboxCode) {
        setSimulatedMail(res.sandboxCode);
      }
      setTab('verify');
      playTabSlide();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email.');

    resetMessages();
    setLoading(true);
    try {
      const res = await authSystem.forgotPassword(email);
      setSuccess(res.message);
      if (res.sandboxCode) {
        setSimulatedMail(res.sandboxCode);
      }
      setTab('verify-reset');
      playTabSlide();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return setError('Please enter verification code.');

    resetMessages();
    setLoading(true);
    try {
      await authSystem.verifyCode(email, code);
      setSuccess('Email verified successfully! Logging you in...');
      playEpicStartupSound();
      setTimeout(async () => {
        const user = authSystem.getCurrentUser();
        if (user) {
          setSuccessUser(user);
        } else {
          setTab('login');
          resetMessages();
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !password || !confirmPassword) return setError('Please fill all fields.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    resetMessages();
    setLoading(true);
    try {
      const res = await authSystem.resetPassword(email, code, password);
      setSuccess(res.message);
      playEpicStartupSound();
      setTimeout(() => {
        setTab('login');
        resetMessages();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1200px'
      }}
    >
      {/* Background glowing blobs */}
      <div style={{ position: 'absolute', top: '22%', left: '20%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 75%)', filter: 'blur(60px)', zIndex: 1 }} />
      
      {/* 3D Flippable cyber deck console card */}
      <div 
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '590px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tab === 'register' ? 180 + tilt.y : tilt.y}deg) scale3d(${tilt.scale}, ${tilt.scale}, ${tilt.scale})`,
          transition: tilt.transition,
          zIndex: 10
        }}
      >
        {/* FRONT DECK (Login Form Panel + Forgot/Verification Sub-panels) */}
        <div 
          className="glass-panel glow-ring"
          style={{
            position: 'absolute',
            inset: 0,
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(4, 8, 24, 0.78)',
            borderWidth: '1px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(20px)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Header & Biometric scanner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', paddingBottom: '14px' }}>
            <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(0, 210, 255, 0.25)' }}>
              <canvas ref={setFrontScanCanvas} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                AETHER AI OS
              </h2>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                {tab === 'login' && 'Terminal link requested'}
                {tab === 'forgot' && 'Credential recovery portal'}
                {tab === 'verify' && 'Confirm security codes'}
                {tab === 'verify-reset' && 'Sync new keyphrase codes'}
              </div>
            </div>
          </div>

          {/* Form Switchers */}
          {tab !== 'verify' && tab !== 'verify-reset' && tab !== 'forgot' && (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
              <button 
                onClick={() => { setTab('login'); resetMessages(); playTabSlide(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tab === 'login' ? 'var(--color-cyan)' : 'var(--text-muted)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingBottom: '8px',
                  borderBottom: tab === 'login' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => { setTab('register'); resetMessages(); playTabSlide(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingBottom: '8px',
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} /> <span>{success}</span>
            </div>
          )}

          {simulatedMail && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px dashed var(--color-cyan)', color: 'var(--color-cyan)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px' }}>
              🔑 Sandbox OTP Code: <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{simulatedMail}</strong>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Secure Email Address" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
                  value={email}
                  onFocus={playMechClick}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Access Keyphrase" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
                  value={password}
                  onFocus={playMechClick}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-violet)' }}
                  />
                  Remember me
                </label>
                <span 
                  onClick={() => { setTab('forgot'); resetMessages(); playTabSlide(); }}
                  style={{ cursor: 'pointer', color: 'var(--color-cyan)' }}
                >
                  Forgot password?
                </span>
              </div>

              <button type="submit" className="cyber-btn" style={{ marginTop: '10px', fontSize: '0.85rem', padding: '11px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)' }} disabled={loading}>
                {loading ? 'Validating Link...' : 'Authenticate →'}
              </button>
            </form>
          )}

          {/* Forgot credentials Form */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                🔑 Enter email address to receive an OTP code to reset credentials.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Registered Email" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
                  value={email}
                  onFocus={playMechClick}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="cyber-btn" style={{ marginTop: '6px' }} disabled={loading}>
                {loading ? 'Requesting Reset...' : 'Request Code'}
              </button>

              <span 
                onClick={() => { setTab('login'); resetMessages(); playTabSlide(); }}
                style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-cyan)', cursor: 'pointer', marginTop: '6px' }}
              >
                Back to Login
              </span>
            </form>
          )}

          {/* Validation Form */}
          {tab === 'verify' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Confirm code for: <strong style={{ color: '#fff' }}>{email}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="6-digit code" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', letterSpacing: '0.25em', textAlign: 'center', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
                  value={code}
                  onFocus={playMechClick}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" className="cyber-btn" disabled={loading}>
                Verify & Authorize
              </button>

              <span 
                onClick={() => { setTab('login'); resetMessages(); playTabSlide(); }}
                style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '6px' }}
              >
                Cancel Validation
              </span>
            </form>
          )}

          {/* Reset password Form */}
          {tab === 'verify-reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Recovery Code" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                  value={code}
                  onFocus={playMechClick}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                  value={password}
                  onFocus={playMechClick}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  className="cyber-input"
                  style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                  value={confirmPassword}
                  onFocus={playMechClick}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="cyber-btn" disabled={loading}>
                Save Password
              </button>
            </form>
          )}



        </div>

        {/* BACK DECK (Register Form Panel - Rotated 180 deg) */}
        <div 
          className="glass-panel glow-ring"
          style={{
            position: 'absolute',
            inset: 0,
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(4, 12, 32, 0.78)',
            borderWidth: '1px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(20px)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Header & Biometric scanner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', paddingBottom: '14px' }}>
            <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(0, 210, 255, 0.25)' }}>
              <canvas ref={setBackScanCanvas} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                AETHER AI OS
              </h2>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                Enroll operator node
              </div>
            </div>
          </div>

          {/* Form Switchers */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
            <button 
              onClick={() => { setTab('login'); resetMessages(); playTabSlide(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                paddingBottom: '8px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => { setTab('register'); resetMessages(); playTabSlide(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-cyan)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                paddingBottom: '8px',
                borderBottom: '2px solid var(--color-cyan)',
                transition: 'all 0.3s ease'
              }}
            >
              Register
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} /> <span>{success}</span>
            </div>
          )}

          {simulatedMail && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px dashed var(--color-cyan)', color: 'var(--color-cyan)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', marginBottom: '16px' }}>
              🔑 Sandbox OTP Code: <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{simulatedMail}</strong>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Username (Optional)" 
                className="cyber-input"
                style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                value={displayName}
                onFocus={playMechClick}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="Email address" 
                className="cyber-input"
                style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                value={email}
                onFocus={playMechClick}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Password" 
                className="cyber-input"
                style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                value={password}
                onFocus={playMechClick}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Confirm password" 
                className="cyber-input"
                style={{ paddingLeft: '42px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                value={confirmPassword}
                onFocus={playMechClick}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="cyber-btn" style={{ marginTop: '8px', fontSize: '0.82rem', padding: '10px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)' }} disabled={loading}>
              {loading ? 'Enrolling Node...' : 'Register Operator →'}
            </button>
          </form>
        </div>

      </div>

      {successUser && (
        <SuccessGrantedOverlay 
          user={successUser} 
          onComplete={() => onAuthSuccess(successUser)} 
        />
      )}
    </div>
  );
};

const SuccessGrantedOverlay = ({ user, onComplete }) => {
  const canvasRef = useRef(null);
  
  const [particleConfig] = useState(() => {
    const baseHue = Math.floor(Math.random() * 360);
    const splitHue = (baseHue + 120 + Math.floor(Math.random() * 120)) % 360;
    const count = 90 + Math.floor(Math.random() * 70);
    const speedMult = 2.4 + Math.random() * 4.0;
    return { baseHue, splitHue, count, speedMult };
  });

  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

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

    const pCount = particleConfig.count + 80;
    const speedMultiplier = particleConfig.speedMult * 1.5;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 5.5) * speedMultiplier;
      const hue = Math.random() > 0.5 ? particleConfig.baseHue : particleConfig.splitHue;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 4.5,
        color: `hsla(${hue}, 95%, 65%, 1)`,
        alpha: 1,
        decay: 0.005 + Math.random() * 0.015,
        wobble: Math.random() * 0.1
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(p.alpha * 10) * p.wobble;
        p.y += p.vy;
        p.vy += 0.015;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;
        p.size = Math.max(0, p.size - 0.02);

        if (p.alpha <= 0) {
          const angle = Math.random() * Math.PI * 2;
          p.x = canvas.width / 2 + (Math.random() - 0.5) * 30;
          p.y = canvas.height / 2 + (Math.random() - 0.5) * 30;
          p.vx = Math.cos(angle) * (1 + Math.random() * 2);
          p.vy = Math.sin(angle) * (1 + Math.random() * 2);
          p.alpha = 1;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
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
  }, [canvasRef.current]);

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
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      
      <div 
        style={{
          zIndex: 10,
          textAlign: 'center',
          padding: '40px 30px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(5, 2, 25, 0.8)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.22)',
          backdropFilter: 'blur(12px)',
          maxWidth: '430px',
          width: '90%',
          animation: 'scaleUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', marginBottom: '8px' }}>
          COGNITIVE LINK ESTABLISHED
        </h2>
        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
          [ ACCESS GRANTED ]
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
          Welcome back, operator **{user?.displayName || 'Operator'}**. Secure node access keys synchronized. Initializing workspace...
        </p>
      </div>
    </div>
  );
};
