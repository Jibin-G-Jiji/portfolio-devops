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

const botResponses = [
  'That\'s great! I\'m Jibin\'s assistant. How can I help you today?',
  'I can tell you about Jibin\'s AWS expertise, DevOps projects, and more!',
  'Feel free to ask about cloud infrastructure, CI/CD pipelines, or Jibin\'s skills.',
  'Interested in learning more? Check out the projects section or contact Jibin directly!',
  'Jibin specializes in AWS, automation, and secure infrastructure. What would you like to know?',
  'Great question! Jibin focuses on reliability, speed, and clean automation in cloud environments.',
];

const addMessage = (text, sender = 'user') => {
  const msgEl = document.createElement('div');
  msgEl.className = `chatbot-message ${sender}`;
  msgEl.textContent = text;
  chatbotMessages.appendChild(msgEl);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
};

const sendMessage = () => {
  const text = chatbotInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatbotInput.value = '';
  setTimeout(() => {
    const response = botResponses[Math.floor(Math.random() * botResponses.length)];
    addMessage(response, 'bot');
  }, 400);
};

chatbotToggle.addEventListener('click', () => {
  chatbotContainer.classList.toggle('active');
});

chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
