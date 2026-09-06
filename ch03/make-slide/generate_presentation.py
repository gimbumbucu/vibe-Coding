import sys

with open("neon-terminal-ref.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find where the deck starts
header_end = html.find('<div class="deck">') + len('<div class="deck">')
header = html[:header_end]

# remove notes-panel from css, it's not needed, but keeping it doesn't break anything.
# wait, I should also make sure font-face doesn't break. 
# It uses CDNs, so it's fine.

slides_html = """
    <!-- Slide 1: Title -->
    <div class="slide active" data-notes="바이브 코딩이라는 새로운 패러다임에 대해 이야기해보겠습니다.">
      <div class="slide-title">
        <div class="a tag">[VIBE CODING]</div>
        <h1 class="a">🌊 바이브 코딩<span class="cursor"></span></h1>
        <p class="a subtitle">새로운 물결: 손끝의 타이핑에서 생각의 지휘(Directing)로</p>
      </div>
    </div>

    <!-- Slide 2: Content -->
    <div class="slide" data-notes="직접 코드를 한 줄씩 작성하는 대신, 자연어로 의도와 방향성을 제시합니다. AI가 코드 작성을 주도하고 개발자는 문제 해결에 집중합니다.">
      <div class="content-body">
        <h2 class="a">🌊 바이브 코딩이란?</h2>
        <ul>
          <li class="a">직접 코드를 한 줄씩 작성하는 대신, 자연어로 <strong>의도와 방향성(Vibe)</strong>을 제시</li>
          <li class="a">AI가 실제 코드를 작성하고 코드베이스 구조화를 주도</li>
          <li class="a">개발자는 기계적 타이핑에서 벗어나 <strong>창의적 문제 해결</strong>에 몰입</li>
        </ul>
        <div style="text-align: center; margin-top: 24px;">
            <img src="vibe_coding_clay_art.png" alt="Vibe Coding Concept" class="a" style="max-height: 280px; border-radius: 4px; box-shadow: var(--glow-green);">
        </div>
      </div>
    </div>

    <!-- Slide 3: Content -->
    <div class="slide" data-notes="2021년부터 AI 코딩 툴이 어떻게 발전해 왔는지 살펴보겠습니다. 현재는 단순 코딩에서 디렉팅으로 패러다임이 전환되었습니다.">
      <div class="content-body">
        <h2 class="a">⏳ 시대별 발전 과정</h2>
        <ul>
          <li class="a"><strong>태동기 (2021~2023)</strong>
            <ul>
              <li>GitHub Copilot, ChatGPT 출시</li>
              <li>대화형 코딩 및 AI 어시스턴트의 초기 형태 등장</li>
            </ul>
          </li>
          <li class="a"><strong>발전기 (2023~2024)</strong>
            <ul>
              <li>AI 네이티브 IDE 부상 (Cursor, Windsurf, Antigravity)</li>
              <li>프롬프트 엔지니어링의 중요성 대두</li>
            </ul>
          </li>
          <li class="a"><strong>확산기 (2025)</strong>
            <ul>
              <li>안드레이 카파시의 언급으로 '바이브 코딩' 폭발적 유행</li>
              <li>코딩에서 <strong>디렉팅(Directing)</strong>으로 패러다임 전환</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- Slide 4: Cards -->
    <div class="slide" data-notes="바이브 코딩으로 인해 개발 진입 장벽이 낮아지고 개발자의 역할이 감독자로 진화하며, 애자일 방법론과도 잘 결합됩니다.">
      <h2 class="a" style="margin-bottom: 28px;">🚀 현재와 미래: 역할의 변화</h2>
      <div class="cards">
        <div class="card a">
          <span class="card-icon">🚪</span>
          <h3>진입 장벽 완화</h3>
          <p>기획자/디자이너도 아이디어만으로 프로토타입 제작 가능</p>
        </div>
        <div class="card a">
          <span class="card-icon">🎼</span>
          <h3>정체성의 진화</h3>
          <p>단순 작성자(Coder) ➡️ <strong>시스템 감독/지휘자</strong></p>
        </div>
        <div class="card a">
          <span class="card-icon">🔄</span>
          <h3>애자일 결합</h3>
          <p>'선 구축, 후 최적화' 방식을 통해 빠른 피드백 루프와 혁신 주도</p>
        </div>
      </div>
    </div>

    <!-- Slide 5: Content -->
    <div class="slide" data-notes="단순 코드 생성을 넘어 이제는 에이전트 엔지니어링 단계입니다. 개발자는 다수의 에이전트 워크플로우를 조율하게 됩니다.">
      <div class="content-body">
        <h2 class="a">🤖 에이전트 엔지니어링</h2>
        <ul>
          <li class="a"><strong>다음 기술적 단계: Agent Engineering</strong></li>
          <li class="a">단순한 코드 생성을 넘어, 스스로 계획하고 도구를 사용하는 <strong>자율형 AI 에이전트</strong> 활용</li>
          <li class="a">개발자는 다수의 에이전트 워크플로우를 설계하고 조율하는 역할을 담당</li>
        </ul>
      </div>
    </div>

    <!-- Slide 6: Cards -->
    <div class="slide" data-notes="하지만 AI 환각 문제나 기술 부채 등 해결해야 할 과제들도 있습니다. 인간 고유의 역할은 여전히 중요합니다.">
      <h2 class="a" style="margin-bottom: 28px;">⚠️ 한계와 새로운 과제</h2>
      <div class="cards">
        <div class="card a">
          <span class="card-icon">🔍</span>
          <h3>철저한 검증</h3>
          <p>AI 환각 현상 대비<br>(TDD, 타입 체커, CI/CD 필수)</p>
        </div>
        <div class="card a">
          <span class="card-icon">🔧</span>
          <h3>기술 부채 관리</h3>
          <p>블랙박스 문제 방지<br>지속적인 코드 리뷰 및 문서화</p>
        </div>
        <div class="card a">
          <span class="card-icon">🧠</span>
          <h3>인간 고유의 영역</h3>
          <p>비즈니스 목표 정렬, 독창성,<br><strong>최종 판단은 인간의 몫</strong></p>
        </div>
      </div>
    </div>

    <!-- Slide 7: Quote -->
    <div class="slide" data-notes="마지막으로 바이브 코딩은 인간의 직관과 AI의 기술이 결합된 상징적인 개발 방식입니다. 경청해 주셔서 감사합니다.">
      <div class="slide-quote">
        <p class="a quote-prompt">$ echo "conclusion"</p>
        <p class="a quote-text" style="font-size: 1.4rem;">바이브 코딩은 기계적인 노동에서 벗어나, 인간의 직관과 아이디어를 자연어로 표현해 AI와 함께 소프트웨어를 창조하는 현시대를 가장 잘 보여주는 상징적인 개발 방식입니다.</p>
        <p class="a quote-attr"><strong>결론</strong></p>
      </div>
    </div>
"""

footer_html = """
  </div>

  <script>
    (function () {
      'use strict';
      const slides = [...document.querySelectorAll('.slide')];
      let current = 0;

      function goTo(index) {
        if (index < 0 || index >= slides.length) return;
        slides[current].classList.remove('active');
        slides[index].classList.add('active');
        current = index;
        updateProgress();
        updateCounter();
        updateNotes();
      }

      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
        if (e.key.toLowerCase() === 'f') toggleFullscreen();
        if (e.key.toLowerCase() === 's') toggleNotes();
      });

      let touchStartX = 0;
      document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, {passive: true});
      document.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }, {passive: true});

      function updateProgress() {
        if(document.getElementById('progress')) {
          document.getElementById('progress').style.width = (current / (slides.length - 1) * 100) + '%';
        }
      }

      function updateCounter() {
        if(document.getElementById('counter')) {
          document.getElementById('counter').textContent = (current + 1) + ' / ' + slides.length;
        }
      }

      function toggleFullscreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {});
        } else {
          document.exitFullscreen().catch(e => {});
        }
      }

      let notesWindow = null;
      function toggleNotes() {
        if (notesWindow && !notesWindow.closed) {
          notesWindow.close();
          notesWindow = null;
          return;
        }
        notesWindow = window.open('', 'SpeakerNotes', 'width=520,height=420,top=80,left=80');
        notesWindow.document.write(`<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
         background: #1a1a1a; color: #e0e0e0; padding: 24px; }
  .slide-num { font-size: 12px; color: #888; margin-bottom: 12px; font-family: monospace; }
  .label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
           color: #666; margin-bottom: 8px; }
  .notes { font-size: 16px; line-height: 1.8; color: #ccc; }
</style></head><body>
  <div class="slide-num" id="sn"></div>
  <div class="label">Speaker Notes</div>
  <div class="notes" id="nt"></div>
</body></html>`);
        notesWindow.document.close();
        updateNotes();
      }

      function updateNotes() {
        if (!notesWindow || notesWindow.closed) return;
        try {
          const note = slides[current].dataset.notes || '(No notes)';
          notesWindow.document.getElementById('nt').textContent = note;
          notesWindow.document.getElementById('sn').textContent = 'Slide ' + (current + 1) + ' / ' + slides.length;
        } catch(e) {}
      }
      
      goTo(0);
    })();
  </script>
</body>
</html>
"""

final_html = header + slides_html + footer_html

with open("index.html", "w", encoding="utf-8") as f:
    f.write(final_html)
