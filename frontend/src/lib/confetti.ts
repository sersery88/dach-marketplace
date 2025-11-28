// Simple confetti effect using CSS animations
export default function confetti() {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 2;
    const size = 8 + Math.random() * 8;

    confettiPiece.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      background:${color};
      left:${left}%;
      top:-20px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation:confetti-fall ${duration}s ease-out ${delay}s forwards;
    `;
    container.appendChild(confettiPiece);
  }

  // Add keyframes if not already present
  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Cleanup after animation
  setTimeout(() => container.remove(), 5000);
}

