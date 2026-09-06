/**
 * Contact & Toast Notification Module
 * Handles email clipboard copying, form validation, and interactive feedback toasts.
 */

export function initContact() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailTextEl = document.getElementById('email-address-text');
  const contactForm = document.getElementById('contact-form');

  // 1. Email Copy to Clipboard
  if (copyBtn && emailTextEl) {
    copyBtn.addEventListener('click', () => {
      const email = emailTextEl.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        showToast('이메일 주소가 클립보드에 복사되었습니다.');
        copyBtn.textContent = '복사 완료';
        setTimeout(() => {
          copyBtn.textContent = '복사';
        }, 2000);
      }).catch(err => {
        showToast('복사에 실패했습니다. 직접 복사해주세요.', 'error');
      });
    });
  }

  // 2. Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('sender-name');
      const emailInput = document.getElementById('sender-email');
      const subjectInput = document.getElementById('sender-subject');
      const messageInput = document.getElementById('sender-message');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !email || !message) {
        showToast('이름, 이메일, 메시지를 모두 입력해주세요.', 'error');
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('유효한 이메일 형식을 입력해주세요.', 'error');
        return;
      }

      // Simulated sending state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>전송 중...</span>`;
      }

      setTimeout(() => {
        showToast(`${name}님, 문의가 성공적으로 전송되었습니다. 곧 회신드리겠습니다.`);
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>메시지 보내기</span>`;
        }
      }, 1000);
    });
  }
}

/**
 * Global Toast Notification Generator
 */
export function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-emerald);"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-2);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  toast.innerHTML = `<span class="toast-icon" style="display:flex; align-items:center;">${icon}</span><span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
