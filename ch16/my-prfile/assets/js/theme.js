/**
 * Theme Switcher Module
 * Handles Cyber Dark & Minimalist Light themes with localStorage persistence.
 */

export function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 1. Get saved theme or system preference (Default to light for classic Jackson archetype)
  const savedTheme = localStorage.getItem('vibe_portfolio_theme');
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'light'); // Default Jackson Light
  }

  // 2. Toggle button listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('vibe_portfolio_theme', targetTheme);
    });
  }
}
