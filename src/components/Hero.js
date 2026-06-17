export function setupHero() {
  const hero = document.getElementById('hero');
  const glassCard = hero?.querySelector('[data-3d-tilt]');
  const heroTitle = hero?.querySelector('.hero-title');
  const heroSubtitle = hero?.querySelector('.hero-subtitle');
  const heroBtn = hero?.querySelector('.btn-hero-primary');
  const featureCards = hero?.querySelectorAll('.md\\:grid-cols-3 > div');

  const fadeInUp = (el, delay = 0) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  };

  fadeInUp(glassCard, 0);
  fadeInUp(heroTitle, 0.2);
  fadeInUp(heroSubtitle, 0.4);
  fadeInUp(heroBtn, 0.6);
  if (featureCards) {
    featureCards.forEach((card, i) => fadeInUp(card, 0.8 + i * 0.1));
  }

  setup3DTilt();
}

function setup3DTilt() {
  const el = document.querySelector('[data-3d-tilt]');
  if (!el) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  el.style.willChange = 'transform';

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;

  function lerp() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    el.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale(1.02)`;

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      rafId = requestAnimationFrame(lerp);
    } else {
      rafId = null;
    }
  }

  const handleMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    targetX = (y - centerY) / 15;
    targetY = (centerX - x) / 15;

    if (!rafId) rafId = requestAnimationFrame(lerp);
  };

  const handleMouseLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(lerp);
  };

  el.addEventListener('mousemove', handleMouseMove);
  el.addEventListener('mouseleave', handleMouseLeave);
}


