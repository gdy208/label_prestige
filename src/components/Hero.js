export function setupHero() {
  const hero = document.getElementById('hero');
  const heroContent = hero?.querySelector('.hero-content');
  const heroOverlay = hero?.querySelector('.hero-overlay');

  if (!heroContent) return;

  heroContent.style.opacity = '0';
  heroContent.style.transform = 'translateY(40px)';
  heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';

  requestAnimationFrame(() => {
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
  });

  const heroTitle = heroContent.querySelector('.hero-title');
  const heroSubtitle = heroContent.querySelector('.hero-subtitle');
  const heroActions = heroContent.querySelector('.hero-actions');

  if (heroTitle) {
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(30px)';
    heroTitle.style.transition = 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s';
  }

  if (heroSubtitle) {
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(20px)';
    heroSubtitle.style.transition = 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s';
  }

  if (heroActions) {
    heroActions.style.opacity = '0';
    heroActions.style.transform = 'translateY(20px)';
    heroActions.style.transition = 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s';
  }

  requestAnimationFrame(() => {
    if (heroTitle) {
      heroTitle.style.opacity = '1';
      heroTitle.style.transform = 'translateY(0)';
    }
    if (heroSubtitle) {
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }
    if (heroActions) {
      heroActions.style.opacity = '1';
      heroActions.style.transform = 'translateY(0)';
    }
  });
}
