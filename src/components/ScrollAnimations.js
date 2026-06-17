export function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('section[id]').forEach(section => {
    section.classList.add('scroll-hidden');
    observer.observe(section);
  });

  document.querySelectorAll('.glass, .glassmorphic-card, .doc-card').forEach(el => {
    if (el.closest('header, footer, .admin-overlay, .login-modal-overlay')) return;
    el.classList.add('scroll-hidden');
    observer.observe(el);
  });
}
