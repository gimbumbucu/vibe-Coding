/**
 * Main Application Orchestrator
 * Jackson Portfolio System (ch16)
 */

import { initTheme } from './theme.js';
import { initTyping } from './typing.js';
import { initCounter } from './counter.js';
import { initSkills } from './skills.js';
import { initProjects } from './projects.js';
import { initTimeline } from './timeline.js';
import { initInsights } from './insights.js';
import { initContact } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sub-modules
  initTheme();
  initTyping();
  initCounter();
  initSkills();
  initProjects();
  initTimeline();
  initInsights();
  initContact();

  // 2. DOM Elements
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const sidebarNav = document.getElementById('sidebar-nav');
  const sidebarMenuItems = document.querySelectorAll('#sidebar-menu li');
  const navLinks = document.querySelectorAll('#sidebar-menu a.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('sidebar');

  // 3. Scroll & ScrollSpy Handling
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Scroll-to-top button visibility
    if (scrollY > 400) {
      scrollTopBtn?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
    }

    // Jackson ScrollSpy: Active menu item update based on current section
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      sidebarMenuItems.forEach(item => {
        const link = item.querySelector('a.nav-link');
        if (link && link.getAttribute('href') === `#${currentSectionId}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });

  // 4. Smooth Anchor Scrolling & Mobile Menu Close
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          
          // Close mobile menu if open
          document.body.classList.remove('offcanvas');
          mobileNavToggle?.setAttribute('aria-expanded', 'false');

          // Smooth scroll
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 5. Scroll to Top Action
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 6. Mobile Off-canvas Navigation Toggle
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOffcanvas = document.body.classList.toggle('offcanvas');
      mobileNavToggle.setAttribute('aria-expanded', isOffcanvas ? 'true' : 'false');
    });

    // Close off-canvas when clicking outside the sidebar
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('offcanvas')) {
        if (sidebar && !sidebar.contains(e.target) && !mobileNavToggle.contains(e.target)) {
          document.body.classList.remove('offcanvas');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Close off-canvas on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && document.body.classList.contains('offcanvas')) {
        document.body.classList.remove('offcanvas');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 7. Scroll Reveal Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
});
