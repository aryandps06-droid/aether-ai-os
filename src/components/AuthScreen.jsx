// Glassmorphic Auth Screen for Aether AI OS (Login, Signup, Recovery, Verification)
import React, { useState, useEffect, useRef } from 'react';
import { authSystem } from '../utils/authSystem';
import { Mail, Lock, User, Check, ShieldAlert, Sparkles } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState('login'); // login, register, forgot, verify
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
        setSimulatedMail('123456'); // default sandbox code
        setTab('verify');
      } else {
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
      } else {
        setSimulatedMail(null);
      }
      setTab('verify');
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
      } else {
        setSimulatedMail(null);
      }
      setTab('verify-reset');
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
      setTimeout(async () => {
        const user = authSystem.getCurrentUser();
        if (user) {
          setSuccessUser(user);
        } else {
          setTab('login');
          setSuccess('Verified! You can now log in.');
        }
      }, 500);
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
      setTimeout(() => {
        setTab('login');
        resetMessages();
      }, 2000);
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
        overflow: 'hidden'
      }}
    >
      {/* Background glowing shapes */}
      <div 
        style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,210,255,0.12) 0%, transparent 75%)',
          filter: 'blur(50px)',
          zIndex: 1
        }}
      />
      
      {/* Background ambient stars (simulated with standard CSS box-shadows) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px)',
          backgroundSize: '550px 550px, 350px 350px',
          backgroundPosition: '0 0, 40px 60px',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Main Glass Panel Card */}
      <div 
        className="glass-panel glow-ring"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px',
          position: 'relative',
          zIndex: 2,
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 25px var(--color-violet-glow)',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
              animation: 'spinSlow 15s linear infinite'
            }}
          >
            Æ
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            AETHER AI OS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {tab === 'login' && 'System terminal authorization required.'}
            {tab === 'register' && 'Enroll a new biometric intelligence node.'}
            {tab === 'forgot' && 'Synchronize security credentials.'}
            {tab === 'verify' && 'Biometric telemetry code validation.'}
            {tab === 'verify-reset' && 'Credential recovery validation.'}
          </p>
        </div>

        {/* Errors & Alerts */}
        {error && (
          <div 
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div 
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Dynamic Sandbox Mailbox Notification */}
        {simulatedMail && (
          <div 
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px dashed var(--color-cyan)',
              color: 'var(--color-cyan)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.85rem',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              animation: 'fadeIn 0.5s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>Simulated Device Inbox // Sandbox Telemetry</span>
            </div>
            <span>Use code: <strong style={{ fontSize: '1.05rem', letterSpacing: '0.1em', color: '#fff' }}>{simulatedMail}</strong></span>
          </div>
        )}

        {/* Forms */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="Secure Email Address" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Access Keyphrase" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-violet)' }}
                />
                Remember Authorization
              </label>
              <span 
                onClick={() => { setTab('forgot'); resetMessages(); }}
                style={{ cursor: 'pointer', color: 'var(--color-cyan)', hover: { textDecoration: 'underline' } }}
              >
                Reset Credentials?
              </span>
            </div>

            <button type="submit" className="cyber-btn" style={{ marginTop: '12px' }} disabled={loading}>
              {loading ? 'Validating Telemetry...' : 'Authenticate'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              First session?{' '}
              <span 
                onClick={() => { setTab('register'); resetMessages(); }}
                style={{ color: 'var(--color-violet)', cursor: 'pointer', fontWeight: 600 }}
              >
                Create Node.
              </span>
            </p>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.4 }}>
              🔒 A secure 6-digit OTP verification code will be sent directly to your email inbox to enroll your node.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Operational Name (Optional)" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="Secure Email Address" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Secret Keyphrase" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Confirm Keyphrase" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="cyber-btn" style={{ marginTop: '12px' }} disabled={loading}>
              {loading ? 'Enrolling Node...' : 'Enroll Operator'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Already registered?{' '}
              <span 
                onClick={() => { setTab('login'); resetMessages(); }}
                style={{ color: 'var(--color-violet)', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In.
              </span>
            </p>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.4 }}>
              🔑 Enter your registered email address. We will email you a secure OTP recovery code to reset your access keyphrase.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="Registered Email Address" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="cyber-btn" style={{ marginTop: '12px' }} disabled={loading}>
              {loading ? 'Locating Node...' : 'Request Credentials Reset'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Go back to{' '}
              <span 
                onClick={() => { setTab('login'); resetMessages(); }}
                style={{ color: 'var(--color-violet)', cursor: 'pointer', fontWeight: 600 }}
              >
                Authorization.
              </span>
            </p>
          </form>
        )}

        {tab === 'verify' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
              Confirm your operational email code for: <br />
              <strong style={{ color: '#fff' }}>{email}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="6-Digit Telemetry Code" 
                className="cyber-input"
                style={{ paddingLeft: '48px', letterSpacing: '0.2em', textAlign: 'center' }}
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px dashed var(--color-cyan)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-cyan)', lineHeight: 1.4, textAlign: 'center' }}>
              💡 <strong>Did not get the email?</strong> System network firewall may block delivery. Enter this fallback sandbox telemetry code: <strong style={{ color: '#fff', fontSize: '0.92rem', letterSpacing: '0.05em' }}>{simulatedMail || '123456'}</strong>
            </div>

            <button type="submit" className="cyber-btn" disabled={loading}>
              {loading ? 'Confirming telemetry...' : 'Verify & Authorize'}
            </button>

            <p 
              onClick={() => { setTab('login'); resetMessages(); }}
              style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', hover: { textDecoration: 'underline' } }}
            >
              Cancel Authorization
            </p>
          </form>
        )}

        {tab === 'verify-reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Recovery Code (Check Sandbox Info)" 
                className="cyber-input"
                style={{ paddingLeft: '48px', textAlign: 'center', letterSpacing: '0.1em' }}
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="New Access Keyphrase" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Confirm New Keyphrase" 
                className="cyber-input"
                style={{ paddingLeft: '48px' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px dashed var(--color-cyan)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-cyan)', lineHeight: 1.4, textAlign: 'center' }}>
              💡 <strong>Did not get the recovery email?</strong> Enter this fallback sandbox recovery code: <strong style={{ color: '#fff', fontSize: '0.92rem', letterSpacing: '0.05em' }}>{simulatedMail || '123456'}</strong>
            </div>

            <button type="submit" className="cyber-btn" disabled={loading}>
              {loading ? 'Re-writing Credentials...' : 'Save Credentials'}
            </button>
          </form>
        )}
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
  
  // Random configurations generated once per login mount!
  const [particleConfig] = useState(() => {
    const baseHue = Math.floor(Math.random() * 360);
    const splitHue = (baseHue + 120 + Math.floor(Math.random() * 120)) % 360;
    const count = 75 + Math.floor(Math.random() * 65); // 75 to 140
    const speedMult = 1.8 + Math.random() * 4.5;
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

    // Initial blast with fully randomized counts, speeds, and color spectra!
    const pCount = particleConfig.count;
    const speedMultiplier = particleConfig.speedMult;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 4) * speedMultiplier;
      const hue = Math.random() > 0.48 ? particleConfig.baseHue : particleConfig.splitHue;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3.5,
        color: `hsla(${hue}, 95%, 60%, 1)`,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.015
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          const angle = Math.random() * Math.PI * 2;
          p.x = canvas.width / 2 + (Math.random() - 0.5) * 40;
          p.y = canvas.height / 2 + (Math.random() - 0.5) * 40;
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
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.18)',
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
