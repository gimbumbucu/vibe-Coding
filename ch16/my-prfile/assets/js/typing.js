/**
 * Korean Typing Animation Module
 * Smoothly loops through developer catchphrases with typing and deleting effects.
 */

export function initTyping() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const sentences = [
    "문제를 끝까지 파고드는 풀스택 엔지니어",
    "240만 건의 빅데이터를 100ms로 단축하는 데이터 최적화",
    "Google Gemini 2.0 & SSE 실시간 AI 어시스턴트 설계",
    "FastAPI & React 19 기반 견고한 풀스택 아키텍처",
    "가르치며 함께 성장하는 선순환 개발자"
  ];

  let sentenceIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentSentence = sentences[sentenceIndex];

    if (isDeleting) {
      typingElement.textContent = currentSentence.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      typingElement.textContent = currentSentence.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentSentence.length) {
      // Pause at end of sentence
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sentenceIndex = (sentenceIndex + 1) % sentences.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  // Start typing
  setTimeout(type, 600);
}
