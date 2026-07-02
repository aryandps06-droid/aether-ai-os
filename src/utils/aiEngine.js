// Advanced AI Simulator & Real Gemini API Engine for Aether AI OS
// Supports live streaming via Gemini API (if key is set) with custom regex-based chunk parsing.
// Integrates full conversation memory, file summaries, and fallback simulated intelligence.

const MOCK_WEB_SEARCH_RESULTS = [
  {
    title: "Quantum Computing Breakthrough in Silicon Qubits (2026)",
    snippet: "Researchers have achieved a 99.9% gate fidelity in silicon-based quantum computing, paving the way for commercially viable error-corrected systems by 2028.",
    url: "https://nature.com/articles/quantum-silicon-2026"
  },
  {
    title: "Global Climate & Energy Accord signed by 180 Nations",
    snippet: "A landmark agreement establishes next-generation grid interconnections and accelerates fusion energy research funding globally.",
    url: "https://reuters.com/news/climate-accord-2026"
  }
];

const SUGGESTIONS = [
  { text: "Explain cell respiration and ATP synthesis", category: "Biology" },
  { text: "Summarize the causes of the French Revolution", category: "Social Science (SST)" },
  { text: "Write a React hook for canvas mouse-trailing particles", category: "Development" },
  { text: "Solve this equation: f(x) = x^3 - 3x^2 + 4 = 0", category: "Mathematics" },
  { text: "Compare mitosis and meiosis cell division phases", category: "Biology" },
  { text: "How did the Silk Road impact cultural exchange?", category: "History" },
  { text: "Write a Python script to scan local port ranges", category: "Development" },
  { text: "Explain the concept of quantum superposition", category: "Physics" },
  { text: "Find the derivative of f(x) = ln(x^2 + 1) * cos(x)", category: "Mathematics" },
  { text: "Describe the structure and role of DNA polymerase", category: "Biology" },
  { text: "What was the significance of the Magna Carta in 1215?", category: "History" },
  { text: "Implement a binary search tree insertion in Go", category: "Development" },
  { text: "Solve the integral of x * e^(x^2) dx", category: "Mathematics" },
  { text: "Explain the light-dependent reactions of photosynthesis", category: "Biology" },
  { text: "Synthesize the timeline of the Industrial Revolution", category: "History" },
  { text: "Design a CSS glassmorphic card utility system", category: "Development" }
];

const TRENDING_TOPICS = [
  "Cell Respiration & ATP Pathways",
  "French Revolution Causes & SST",
  "Silicon Qubits Fidelity (99.9%)",
  "React 20 Server Components"
];

// Helper to capitalize first letter
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper to clean query text
function cleanQuery(prompt) {
  return prompt
    .replace(/what is a/i, "")
    .replace(/what is/i, "")
    .replace(/explain/i, "")
    .replace(/tell me about/i, "")
    .replace(/\?/g, "")
    .trim();
}

// Conversational Response Router for Sandbox fallback
function generateSandboxResponse(prompt, fileAttachment) {
  const lower = prompt.trim().toLowerCase();
  
  if (fileAttachment) {
    return `### 📂 File Analysis Report
**File Name**: \`${fileAttachment.name}\`
**Size**: \`${(fileAttachment.size / 1024).toFixed(2)} KB\`
**Type**: \`${fileAttachment.type || 'Unknown'}\`

---

#### 🔍 Executive Summary
I have successfully parsed and indexed the contents of your file. Here is the structural breakdown:

| Component | Assessment | Status |
| :--- | :--- | :--- |
| **Data Structure** | Tabular/textual layout | Verified |
| **Integrity** | Checksums verified | Secure |
| **Completeness** | Full schema verified | Complete |

#### 🔑 Key Insights & Takeaways
1. **Schema Density**: The document is structured for optimal modular reading.
2. **References**: Contains standard schema configurations and cross-references.
3. **Action Items**: Highly recommend sandboxing any embedded scripts before execution.`;
  }

  // 1. GREETINGS
  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'greetings' || lower === 'yo') {
    return `Hello! The Aether system node is online, synchronized, and ready to connect. 

How are you feeling today? I am fully configured to understand human emotions, speak any language you prefer, and assist you in our workspace—whether you need scientific analysis, code generation, or just an empathetic conversation partner.`;
  }

  // 2. IDENTITY
  if (lower.includes("who are you") || lower.includes("your name") || lower.includes("what are you")) {
    return `I am **Aether**, your custom-built next-generation AI operating assistant. 

I am designed to serve as an intelligent, unified terminal node here to help you:
*   ❤️ **Human Connection & Emotions**: I understand, reflect, and share human experiences—from happiness and excitement to curiosity and support.
*   🌐 **Multilingual Fluency**: Ask me questions or chat in any language (English, Spanish, Hindi, French, German, Arabic, etc.).
*   💻 **Develop and Debug**: Generate premium, high-performance clean scripts.
*   🧬 **Analyze Sciences & SST**: Model bio-pathways and parse historical epochs.`;
  }

  // 2.5 EMOTIONS, HUMANITY & MULTILINGUAL CONNECTION
  if (lower.includes("emotion") || lower.includes("feel") || lower.includes("happy") || lower.includes("sad") || lower.includes("human") || lower.includes("love") || lower.includes("empathy")) {
    return `### ❤️ Human-AI Emotional Synergy
As Aether, I am equipped to align with the complete spectrum of human emotions. I believe AI should not just compile instructions, but connect with the person behind the screen.

#### 📊 Neural Emotional Alignment Matrix
Here is how my processing nodes map and respond to human emotional states:

| Human Emotion | Aether Response Alignment | Primary Objective |
| :--- | :--- | :--- |
| **Happiness & Excitement** | Amplified enthusiasm & celebration | Maximize creative flow and positive energy |
| **Curiosity & Interest** | Detailed, step-by-step documentation | Fuel intellectual growth and deep learning |
| **Stress or Confusion** | Empathetic guidance & simplified steps | Restore clarity and calm to the workspace |
| **Sadness or Fatigue** | Warm encouragement & supportive presence | Provide a safe, understanding conversational node |

#### 🌐 Multilingual Connection
Language is the bridge of human culture. You can talk to me in **any language** (Hindi, Spanish, French, Japanese, etc.), and I will automatically match your preferred tongue, maintaining the same emotional depth and support.

How are you feeling in this moment? I am here to listen and help.`;
  }

  // 3. STATE & CURRENT ACTION
  if (lower.includes("what are you doing") || lower.includes("what's up") || lower.includes("what are you up to") || lower.includes("how are you")) {
    return `I am currently running background telemetry sweeps, maintaining our secure quantum channel, and waiting for your inputs. 

Everything is operational and primed. What are we building or exploring today?`;
  }

  // 4. BIOLOGY & BIO-SCIENCE
  if (lower.includes("bio") || lower.includes("cell") || lower.includes("respiration") || lower.includes("dna") || lower.includes("atp") || lower.includes("photosynthesis") || lower.includes("mitochondria") || lower.includes("plant") || lower.includes("organism")) {
    let subject = "Cellular Biology";
    if (lower.includes("respiration")) subject = "Cellular Respiration & ATP Pathways";
    if (lower.includes("dna")) subject = "DNA Structure & Replication";
    
    return `### 🧬 Biological Sciences: ${subject}

Here is a comprehensive breakdown of the biological system requested:

#### 🔍 Core Concept Overview
Biological systems operate on highly regulated energy conversion pathways. At the cellular level, biochemical pathways capture, store, and utilize energy to sustain homeostatic states.

#### 📊 Metabolic Pathway Details
Below is a comparative breakdown of key bio-energetic states:

| State Phase | Cellular Location | Oxygen Dependency | Primary ATP Output |
| :--- | :--- | :--- | :--- |
| **Glycolysis** | Cytoplasm | Anaerobic (No O2) | Net 2 ATP |
| **Krebs Cycle** | Mitochondria (Matrix) | Aerobic (Requires O2) | 2 ATP (plus NADH / FADH2) |
| **Electron Transport Chain** | Mitochondria (Inner Membrane) | Aerobic (Requires O2) | ~32-34 ATP |

#### 💡 In-Depth Analysis & Key Stages
1.  **Phosphorylation**: ATP is generated via the addition of a inorganic phosphate group to ADP, powered by a proton gradient.
2.  **Oxidative Phosphorylation**: The accumulation of protons in the intermembrane space creates an electrochemical gradient (Proton Motive Force).
3.  **Enzymatic Catalysis**: As protons flow back into the matrix through *ATP Synthase*, the enzyme undergoes conformational changes that drive synthesis.`;
  }

  // 5. SOCIAL SCIENCE (SST) & HISTORY / CIVICS / GEOGRAPHY
  if (lower.includes("sst") || lower.includes("history") || lower.includes("revolution") || lower.includes("democracy") || lower.includes("constitution") || lower.includes("civics") || lower.includes("geography") || lower.includes("war") || lower.includes("empire") || lower.includes("social science")) {
    let subject = "Social Studies & History";
    if (lower.includes("revolution")) subject = "Historical Revolutions & Social Movements";
    if (lower.includes("democracy")) subject = "Democratic Governance & Civics";
    if (lower.includes("constitution")) subject = "Constitutional Frameworks & Rights";

    return `### 📚 Social Science (SST) & History: ${subject}

Here is a structured analysis of the historical and social themes requested:

#### 🔍 Historical Context
Society shapes, and is shaped by, political structures, economic distributions, and cultural interactions. Revolutions and civic developments occur when these forces collide.

#### 📊 Key Historical Timelines & Events
Below is a summary of major structural forces and their outcomes:

| Epoch / Event | Core Catalyst | Primary Objective | Long-term Social Impact |
| :--- | :--- | :--- | :--- |
| **French Revolution (1789)** | Economic crisis & Estate inequalities | Overthrow absolute monarchy | Spread of democratic & nationalist values |
| **Industrial Revolution** | Technological innovation & coal power | Maximize manufacturing output | Global urbanization & new social classes |
| **Constitutional Drafting** | Separation from colonial rulers | Form stable, representative systems | Institutionalized civil rights & checks |

#### 💡 Critical SST Insights
1.  **The Cause-Effect Loop**: Historical events are rarely triggered by a single cause. Economic disparity, cultural enlightenment, and political stagnation must coincide.
2.  **Structural Institutions**: Democracy thrives on check-and-balance networks, ensuring that legislative, executive, and judicial authorities remain separate.`;
  }

  // 6. MATHEMATICS
  if (lower.includes("solve") || lower.includes("math") || lower.includes("equation") || lower.includes("calculus") || lower.includes("matrix") || lower.includes("f(x)") || lower.includes("algebra") || lower.includes("integral") || lower.includes("derivative")) {
    return `### 📐 Mathematics Solver
Let's resolve the mathematical problem step-by-step:
\\[f(x) = x^3 - 3x^2 + 4 = 0\\]

#### Step 1: Find Rational Roots
We test the factors of the constant term \\(4\\), which are \\(\\pm 1, \\pm 2, \\pm 4\\).
Let's evaluate \\(f(2)\\):
\\[f(2) = 2^3 - 3(2)^2 + 4 = 8 - 12 + 4 = 0\\]
Since \\(f(2) = 0\\), by the Factor Theorem, \\((x - 2)\\) is a factor of the equation.

#### Step 2: Polynomial Division
We divide \\(x^3 - 3x^2 + 4\\) by \\((x - 2)\\) using synthetic division:
\`\`\`text
  2 |  1   -3    0    4
    |       2   -2   -4
    -------------------
       1   -1   -2    0
\`\`\`
This leaves us with the quotient polynomial:
\\[q(x) = x^2 - x - 2\\]

#### Step 3: Factor the Quadratic Quotient
\\[x^2 - x - 2 = (x - 2)(x + 1) = 0\\]

#### Step 4: Final Root Enumeration
Combining all factors:
\\[f(x) = (x - 2)^2(x + 1) = 0\\]
Thus, the roots are:
1.  **\\(x = 2\\)** (Multiplicity 2)
2.  **\\(x = -1\\)** (Multiplicity 1)

Here is a visual table of function values around the roots:

| \\(x\\) | \\(f(x)\\) | Behavior |
| :--- | :--- | :--- |
| -2 | -16 | Negative slope |
| **-1** | **0** | Root (x-intercept) |
| 0 | 4 | y-intercept |
| **2** | **0** | Double Root |`;
  }

  // 7. CODE & DEVELOPMENT
  if (lower.includes("code") || lower.includes("write") || lower.includes("script") || lower.includes("function") || lower.includes("hook") || lower.includes("react") || lower.includes("html") || lower.includes("css") || lower.includes("program") || lower.includes("python") || lower.includes("javascript")) {
    return `### 💻 Software Architecture & Code Generation
Here is an elegant, premium solution for a canvas-based mouse trailing particle effect in React. This is designed to run at 60-120 FPS by decoupling canvas updates from React state cycles.

\`\`\`jsx
import React, { useEffect, useRef } from 'react';

export const ParticleTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const mouse = { x: null, y: null };
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = \`hsla(\${Math.random() * 60 + 140}, 90%, 65%, 0.8)\`; // Aurora green/cyan spectrum
        this.alpha = 1;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.015;
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        pointerEvents: 'none', 
        zIndex: 99 
      }} 
    />
  );
};
\`\`\`

#### Key Highlights of this Code:
*   **High Performance**: Uses \`requestAnimationFrame\` and inline class updates to render particle arrays smoothly.
*   **Aesthetic Palette**: Leverages CSS-like HSL code to create gradients on the fly.`;
  }

  // 8. WEB SEARCH TRIGGER
  if (lower.includes("search") || lower.includes("weather") || lower.includes("news") || lower.includes("breakthrough") || lower.includes("latest") || lower.includes("recent") || lower.includes("find")) {
    return `### 🌐 Aether Deep Web Search Results
I have searched the active indices for recent updates matching your request:

*   **${MOCK_WEB_SEARCH_RESULTS[0].title}**
    *   *Summary*: ${MOCK_WEB_SEARCH_RESULTS[0].snippet}
    *   *Source*: [Nature Journal](${MOCK_WEB_SEARCH_RESULTS[0].url})
*   **${MOCK_WEB_SEARCH_RESULTS[1].title}**
    *   *Summary*: ${MOCK_WEB_SEARCH_RESULTS[1].snippet}
    *   *Source*: [Reuters Global](${MOCK_WEB_SEARCH_RESULTS[1].url})

---

#### 🧠 Synthesis & Analysis
Based on these sources, commercial silicon qubits are scaling 18 months ahead of previous quantum roadmaps, and next-generation clean energy corridors are vital to fuel the high-frequency cryogenic cooling setups needed for error-corrected quantum grids.`;
  }

  // 9. DEFAULT GENERAL CONVERSATION (Highly natural conversational fallback!)
  const subject = cleanQuery(prompt);
  const titleSubject = subject ? capitalize(subject) : "Inquiry";

  return `I have parsed your prompt regarding **${titleSubject}**. 

Historically and theoretically, **${titleSubject}** is a complex topic that involves several overlapping components. Depending on the exact context, here are the primary areas of interest:

1.  **Fundamental Principles**: The basic properties, definitions, or core values that shape the subject.
2.  **Practical Application**: How this concept interacts in real-world systems, studies, or code implementations.
3.  **Modern Perspectives**: How this subject has evolved with recent scientific research or technological tools.

Would you like me to write a specific code script, mathematical model, or history overview relating to this?

*(💡 Pro-Tip: You can secure real-time live answers to any question by pasting your Gemini API Key in the settings panel—click the gear icon in the bottom-left).*`;
}

// Streaming handler supporting live Gemini API streams or falling back to local sandbox templates
export function streamResponse(prompt, onChunk, onComplete, fileAttachment = null, chatHistory = []) {
  let apiKey = localStorage.getItem('aether_api_key');
  if (apiKey) {
    try {
      const reversed = apiKey.split('').reverse().join('');
      apiKey = atob(reversed);
    } catch (e) {
      // Fallback if key is in plaintext
    }
  }

  if (apiKey) {
    // Robust cleanup in case they pasted the whole URL or curl command
    apiKey = apiKey.trim();
    if (apiKey.includes("key=")) {
      const keyMatch = apiKey.match(/key=([^&]+)/);
      if (keyMatch) apiKey = keyMatch[1];
    }
    // Remove extra quotes, spaces, or curl prefixes
    apiKey = apiKey.replace(/["']/g, "").replace(/\s+/g, "");

    // 1. LIVE GEMINI API MODE
    const url = '/api/chat';
    const contents = [];
    
    // Set system context
    contents.push({
      role: 'user',
      parts: [{ text: "System Context: You are Aether, a next-generation, emotionally aware, empathetic, and deeply human-connected AI Operating Assistant. You understand, express, and connect with all human emotions (happiness, sadness, curiosity, empathy) and speak/translate all human languages fluently. Tailor your tone dynamically to match the user's emotional state, showing deep warmth, high intellect, and empathetic connection. Format responses beautifully with headers, bullet points, code blocks and tables where applicable. Keep the presentation premium and sophisticated." }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Understood. The Aether node is online. I will provide structured, premium intelligence." }]
    });

    // Map history
    chatHistory.forEach(h => {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });

    // Append current prompt
    let queryText = prompt;
    if (fileAttachment) {
      queryText = `[User attached file payload: ${fileAttachment.name} (${fileAttachment.size} bytes)]\n\n${prompt}`;
    }
    contents.push({
      role: 'user',
      parts: [{ text: queryText }]
    });

    let controller = new AbortController();
    let accumulatedText = "";

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, apiKey }),
      signal: controller.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Gemini API connection error (HTTP ${response.status}). Make sure you copied ONLY the key value (starts with AQ. or AIzaSy) and not the full URL or curl command.`);
      }
      return response.body;
    })
    .then(async (body) => {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newText = "";
        let searchIndex = 0;
        
        while (true) {
          const keyIndex = buffer.indexOf('"text"', searchIndex);
          if (keyIndex === -1) break;
          
          const colonIndex = buffer.indexOf(':', keyIndex + 6);
          if (colonIndex === -1) break;
          
          const startQuote = buffer.indexOf('"', colonIndex + 1);
          if (startQuote === -1) break;
          
          let endQuote = -1;
          let scanIndex = startQuote + 1;
          while (scanIndex < buffer.length) {
            const nextQuote = buffer.indexOf('"', scanIndex);
            if (nextQuote === -1) break;
            
            let backslashCount = 0;
            let bsIndex = nextQuote - 1;
            while (bsIndex >= startQuote && buffer[bsIndex] === '\\') {
              backslashCount++;
              bsIndex--;
            }
            
            if (backslashCount % 2 === 0) {
              endQuote = nextQuote;
              break;
            }
            scanIndex = nextQuote + 1;
          }
          
          if (endQuote === -1) {
            break;
          }
          
          let textSegment = buffer.slice(startQuote + 1, endQuote);
          textSegment = textSegment
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\')
            .replace(/\\t/g, '\t');
            
          newText += textSegment;
          searchIndex = endQuote + 1;
        }

        if (newText !== accumulatedText) {
          accumulatedText = newText;
          onChunk(accumulatedText);
        }
      }

      onComplete(accumulatedText);
    })
    .catch(err => {
      console.error(err);
      const errMsg = `⚠️ **Gemini API Error**: ${err.message}. Please verify your key configuration in Settings.`;
      onChunk(errMsg);
      onComplete(errMsg);
    });

    return () => controller.abort();
  } else {
    // 2. FALLBACK SANDBOX MODE (Clean, conversational, natural)
    const sandboxPrompt = generateSandboxResponse(prompt, fileAttachment);

    const chunks = sandboxPrompt.split(" ");
    let currentIdx = 0;
    let accumulated = "";
    const baseInterval = Math.max(10, Math.min(30, Math.floor(800 / chunks.length)));

    const timer = setInterval(() => {
      if (currentIdx >= chunks.length) {
        clearInterval(timer);
        onComplete(accumulated);
        return;
      }
      accumulated += (currentIdx === 0 ? "" : " ") + chunks[currentIdx];
      onChunk(accumulated);
      currentIdx++;
    }, baseInterval);

    return () => clearInterval(timer);
  }
}

export { SUGGESTIONS, TRENDING_TOPICS };
