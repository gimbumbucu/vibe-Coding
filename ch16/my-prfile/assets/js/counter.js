/**
 * Statistics Counter Animation Module
 * Uses IntersectionObserver to trigger smooth count-up animations when scrolled into view.
 */

export function initCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const isDecimal = el.getAttribute('data-decimal') === 'true';
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // easeOutExpo progress curve
      const progress = 1 - Math.pow(2, -10 * (frame / totalFrames));
      const currentVal = target * progress;

      if (isDecimal) {
        el.textContent = currentVal.toFixed(1);
      } else {
        el.textContent = Math.floor(currentVal).toLocaleString();
      }

      if (frame >= totalFrames) {
        el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        clearInterval(counter);
      }
    }, frameDuration);
  }
}
