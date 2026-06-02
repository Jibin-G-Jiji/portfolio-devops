const themeToggle = document.getElementById('themeToggle');
const root = document.body;
const motionContainer = document.querySelector('.page-motion');
const canvas = document.querySelector('.constellation-canvas');
const ctx = canvas.getContext('2d');

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const constellationPoints = [];
const constellationCount = 60;
const maxDistance = 280;

const setTheme = (theme) => {
  root.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  localStorage.setItem('portfolioTheme', theme);
};

const savedTheme = localStorage.getItem('portfolioTheme');
const defaultTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(defaultTheme);

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

const resizeCanvas = () => {
  const ratio = window.devicePixelRatio || 1;
  const height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
  canvas.width = window.innerWidth * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const createConstellationPoints = () => {
  constellationPoints.length = 0;
  const height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
  for (let i = 0; i < constellationCount; i += 1) {
    constellationPoints.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      radius: 1.6 + Math.random() * 2.2,
    });
  }
};

const drawConstellation = () => {
  const height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
  ctx.clearRect(0, 0, window.innerWidth, height);
  constellationPoints.forEach((point) => {
    point.x += point.vx;
    point.y += point.vy;
    if (point.x < 0 || point.x > window.innerWidth) point.vx *= -1;
    if (point.y < 0 || point.y > height) point.vy *= -1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  for (let i = 0; i < constellationPoints.length; i += 1) {
    for (let j = i + 1; j < constellationPoints.length; j += 1) {
      const a = constellationPoints[i];
      const b = constellationPoints[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDistance) {
        const opacity = 0.52 * (1 - dist / maxDistance);
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.shadowBlur = 0;
};

const animate = () => {
  drawConstellation();
  requestAnimationFrame(animate);
};

window.addEventListener('mousemove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY + window.scrollY;
});

window.addEventListener('touchmove', (event) => {
  if (event.touches[0]) {
    pointer.x = event.touches[0].clientX;
    pointer.y = event.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('resize', () => {
  resizeCanvas();
  createConstellationPoints();
});

resizeCanvas();
createConstellationPoints();
animate();

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

// Rolling chat history for conversational memory
let chatHistory = [];

const addMessage = (text, sender = 'user') => {
  const msgEl = document.createElement('div');
  msgEl.className = `chatbot-message ${sender}`;
  msgEl.textContent = text;
  chatbotMessages.appendChild(msgEl);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
};

const sendMessage = async () => {
  const text = chatbotInput.value.trim();
  if (!text) return;

  // 1. Display user message
  addMessage(text, 'user');
  chatbotInput.value = '';

  // 2. Add to chat history
  chatHistory.push({
    role: 'user',
    parts: [{ text: text }]
  });

  // Limit context to last 10 messages (5 rounds of Q&A)
  if (chatHistory.length > 10) {
    chatHistory = chatHistory.slice(chatHistory.length - 10);
  }

  // 3. Create & show typing indicator bubble
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chatbot-message bot typing';
  typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
  chatbotMessages.appendChild(typingIndicator);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents: chatHistory })
    });

    // Remove typing indicator
    typingIndicator.remove();

    if (!response.ok) {
      const errData = await response.json();
      if (errData.error === 'API_KEY_MISSING') {
        addMessage("⚠️ The AI assistant is not configured. Please add your GROQ_API_KEY to the .env file.", 'bot');
      } else {
        addMessage("🤖 Sorry, I encountered an issue. Please try again!", 'bot');
      }
      return;
    }

    const data = await response.json();
    const replyText = data.text;

    // 4. Display AI response
    addMessage(replyText, 'bot');

    // 5. Save response to chat history
    chatHistory.push({
      role: 'model',
      parts: [{ text: replyText }]
    });

    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(chatHistory.length - 10);
    }
  } catch (error) {
    typingIndicator.remove();
    console.error('Backend fetch failed:', error);
    addMessage("🔌 Cannot reach the server. Please make sure the backend is running with 'npm run dev'.", 'bot');
    chatHistory.pop();
  }
};

chatbotToggle.addEventListener('click', () => {
  chatbotContainer.classList.toggle('active');
});

chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
