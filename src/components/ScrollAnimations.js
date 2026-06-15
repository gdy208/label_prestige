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

  document.querySelectorAll('.section-container').forEach(section => {
    section.classList.add('scroll-hidden');
    observer.observe(section);
  });

  document.querySelectorAll('.concours-card, .serment-pull-card').forEach(el => {
    el.classList.add('scroll-hidden');
    observer.observe(el);
  });
}
