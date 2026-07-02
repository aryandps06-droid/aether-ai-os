// Cinematic WebGL-like Canvas Particle Splash Screen for Aether AI OS
import React, { useEffect, useRef, useState } from 'react';

export const SplashScreen = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [stage, setStage] = useState(0); // 0: Init, 1: Text, 2: Dissolve, 3: Sphere, 4: Logo, 5: FadeOut

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set dimensions
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 0.8;
        this.color = `hsla(${140 + Math.random() * 60}, 90%, 65%, ${0.3 + Math.random() * 0.6})`;
        this.speedFactor = 0.04 + Math.random() * 0.05;
        this.friction = 0.88 + Math.random() * 0.04;
      }

      update(state, time) {
        if (state === 0) {
          // Ambient slow float around center
          const angle = Math.atan2(this.y - canvas.height/2, this.x - canvas.width/2);
          const dist = Math.sqrt((this.x - canvas.width/2)**2 + (this.y - canvas.height/2)**2);
          this.vx += Math.cos(angle + Math.PI/2) * 0.01 + (Math.random() - 0.5) * 0.05;
          this.vy += Math.sin(angle + Math.PI/2) * 0.01 + (Math.random() - 0.5) * 0.05;
          
          this.x += this.vx;
          this.y += this.vy;
          this.vx *= 0.98;
          this.vy *= 0.98;
        } else {
          // Physics movement to target
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          
          this.vx += dx * this.speedFactor;
          this.vy += dy * this.speedFactor;
          
          this.x += this.vx;
          this.y += this.vy;
          
          this.vx *= this.friction;
          this.vy *= this.friction;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = 2000;

    // Initialize particles randomly across screen
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (Math.min(canvas.width, canvas.height) * 0.8);
      const px = canvas.width / 2 + Math.cos(angle) * radius;
      const py = canvas.height / 2 + Math.sin(angle) * radius;
      particles.push(new Particle(px, py));
    }

    // Generate Text Target Coordinates (Offscreen Buffer)
    const getTextTargets = (text) => {
      const textCanvas = document.createElement('canvas');
      const tctx = textCanvas.getContext('2d');
      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      
      tctx.fillStyle = '#ffffff';
      tctx.textAlign = 'center';
      tctx.textBaseline = 'middle';
      // Responsive font sizing
      const fontSize = Math.min(canvas.width * 0.08, 90);
      tctx.font = `800 ${fontSize}px Outfit`;
      tctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const imgData = tctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const coords = [];
      const step = Math.max(1, Math.floor((canvas.width * canvas.height) / particleCount * 0.12));
      
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const index = (y * canvas.width + x) * 4;
          if (imgData[index + 3] > 128) {
            coords.push({ x, y });
          }
        }
      }
      return coords;
    };

    // Generate Sphere Target Coordinates (3D rotated projection)
    const getSphereTargets = (time) => {
      const coords = [];
      const radius = Math.min(canvas.width, canvas.height) * 0.22;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      // Calculate rotating spherical points
      const rotY = time * 0.001;
      const rotX = time * 0.0005;

      for (let i = 0; i < particleCount; i++) {
        // Golden spiral distribution on a sphere
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;

        // 3D Cartesian coordinates
        let sx = radius * Math.sin(phi) * Math.cos(theta);
        let sy = radius * Math.sin(phi) * Math.sin(theta);
        let sz = radius * Math.cos(phi);

        // Y-axis rotation
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = sx * cosY - sz * sinY;
        const z1 = sx * sinY + sz * cosY;

        // X-axis rotation
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = sy * cosX - z1 * sinX;
        const z2 = sy * sinX + z1 * cosX;

        // Perspective projection factor
        const scale = 350 / (350 + z2);

        coords.push({
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          color: `hsla(${150 + scale * 50}, 90%, 60%, ${0.2 + scale * 0.6})`
        });
      }
      return coords;
    };

    // Generate Logo Target Coordinates
    const getLogoTargets = () => {
      const logoCanvas = document.createElement('canvas');
      const lctx = logoCanvas.getContext('2d');
      logoCanvas.width = canvas.width;
      logoCanvas.height = canvas.height;
      
      lctx.fillStyle = '#ffffff';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      const fontSize = Math.min(canvas.width * 0.16, 200);
      lctx.font = `800 ${fontSize}px Outfit`;
      lctx.fillText("Æ", canvas.width / 2, canvas.height / 2);
      
      const imgData = lctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const coords = [];
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const index = (y * canvas.width + x) * 4;
          if (imgData[index + 3] > 128) {
            coords.push({ x, y });
          }
        }
      }
      return coords;
    };

    const textCoords = getTextTargets("AETHER AI");
    const logoCoords = getLogoTargets();

    let currentStage = 0;
    let time = 0;

    // Timeline control timeouts
    const timeline = [
      setTimeout(() => { currentStage = 1; setStage(1); }, 1500),  // form text
      setTimeout(() => { currentStage = 2; setStage(2); }, 5000),  // dissolve
      setTimeout(() => { currentStage = 3; setStage(3); }, 6500),  // form sphere
      setTimeout(() => { currentStage = 4; setStage(4); }, 10500), // form logo
      setTimeout(() => { currentStage = 5; setStage(5); }, 12500), // fade-out
      setTimeout(() => {
        onComplete();
      }, 13200) // complete
    ];

    // Animation Loop
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.2)'; // trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      time += 16.67; // standard 60fps increment

      let sphereCoords = [];
      if (currentStage === 3) {
        sphereCoords = getSphereTargets(time);
      }

      particles.forEach((p, idx) => {
        if (currentStage === 1) {
          // Assign text coordinate
          const coord = textCoords[idx % textCoords.length];
          p.targetX = coord.x + (Math.random() - 0.5) * 10;
          p.targetY = coord.y + (Math.random() - 0.5) * 10;
        } else if (currentStage === 2) {
          // Explode outwards
          const angle = Math.atan2(p.y - canvas.height/2, p.x - canvas.width/2);
          const force = 12;
          p.targetX = p.x + Math.cos(angle) * force + (Math.random() - 0.5) * 15;
          p.targetY = p.y + Math.sin(angle) * force + (Math.random() - 0.5) * 15;
        } else if (currentStage === 3 && sphereCoords.length > 0) {
          // Assign rotating sphere coordinate
          const coord = sphereCoords[idx];
          p.targetX = coord.x;
          p.targetY = coord.y;
          p.color = coord.color;
        } else if (currentStage === 4) {
          // Assign logo coordinate
          const coord = logoCoords[idx % logoCoords.length];
          p.targetX = coord.x;
          p.targetY = coord.y;
          p.color = `hsla(${160 + Math.sin(time * 0.003) * 40}, 90%, 60%, 0.8)`;
        }

        p.update(currentStage, time);
        p.draw();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      timeline.forEach(t => clearTimeout(t));
      cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#02020a',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.8s ease'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      {/* Loading Percentage indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: '24%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--color-cyan)',
          letterSpacing: '0.12em',
          opacity: stage === 5 ? 0 : 0.85,
          transition: 'all 0.5s ease',
          textShadow: '0 0 8px rgba(0, 210, 255, 0.4)'
        }}
      >
        {stage === 0 && "SYNAPSE_INIT // 15%"}
        {stage === 1 && "CORE_ALIGN // 40%"}
        {stage === 2 && "MEM_SYNC // 60%"}
        {stage === 3 && "GEOMETRY_COMPILE // 85%"}
        {stage === 4 && "LINK_STABILIZED // 100%"}
      </div>

      {/* Sleek Centered Neon Loading Progress Bar */}
      <div 
        style={{
          position: 'absolute',
          bottom: '21%',
          width: '280px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          opacity: stage === 5 ? 0 : 1,
          transition: 'all 0.5s ease',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div 
          style={{
            height: '100%',
            width: stage === 0 ? '15%' : stage === 1 ? '40%' : stage === 2 ? '60%' : stage === 3 ? '85%' : stage === 4 ? '100%' : '0%',
            background: 'linear-gradient(90deg, var(--color-cyan) 0%, var(--color-emerald) 100%)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Subtitles to narrate the OS bootloader */}
      <div 
        style={{
          position: 'absolute',
          bottom: '12%',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.2em',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: stage === 5 ? 0 : 0.8,
          transition: 'all 0.5s ease',
          textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }}
      >
        {stage === 0 && "Initializing Core Kernel..."}
        {stage === 1 && "Aligning Quantum States..."}
        {stage === 2 && "Synchronizing Core Memory..."}
        {stage === 3 && "Constructing Neural Geometry..."}
        {stage === 4 && "Aether AI OS - Ready for Session"}
      </div>
    </div>
  );
};
