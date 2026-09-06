document.addEventListener('DOMContentLoaded', () => {
  const slides = [
    '01-cover.html',
    '02-definition.html',
    '03-history.html',
    '04-role-change.html',
    '05-agent-engineering.html',
    '06-limitations.html',
    '07-conclusion.html'
  ];

  // Get current slide filename
  const currentPath = window.location.pathname;
  // Handle empty path or cases without filename by defaulting to the first slide
  const currentFilename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || '01-cover.html';
  
  const currentIndex = slides.indexOf(currentFilename);

  document.addEventListener('keydown', (event) => {
    // Navigate to previous slide
    if (event.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        window.location.href = slides[currentIndex - 1];
      }
    }
    // Navigate to next slide
    else if (event.key === 'ArrowRight' || event.key === ' ' || event.code === 'Space') {
      if (currentIndex !== -1 && currentIndex < slides.length - 1) {
        window.location.href = slides[currentIndex + 1];
      }
    }
  });
});
