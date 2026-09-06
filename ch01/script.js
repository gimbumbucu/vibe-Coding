document.addEventListener('DOMContentLoaded', () => {
    const COLS = 17;
    const ROWS = 10;
    const GAME_TIME = 120; // 2 minutes in seconds

    let score = 0;
    let timeLeft = GAME_TIME;
    let timerInterval = null;
    let isPlaying = false;
    let isDragging = false;
    
    let startX = 0;
    let startY = 0;
    
    let cellsData = []; // { element, value, cleared, highlighted }

    const board = document.getElementById('game-board');
    const selectionBox = document.getElementById('selection-box');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');

    function initGame() {
        score = 0;
        timeLeft = GAME_TIME;
        updateScore();
        updateTimerDisplay();
        gameOverOverlay.classList.add('hidden');
        board.innerHTML = '<div id="selection-box"></div>'; // Reset board
        
        // Re-fetch selection box reference
        const newSelectionBox = document.getElementById('selection-box');
        
        cellsData = [];
        
        for (let i = 0; i < ROWS * COLS; i++) {
            const val = Math.floor(Math.random() * 9) + 1;
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            cellEl.innerText = val;
            
            board.appendChild(cellEl);
            
            cellsData.push({
                element: cellEl,
                value: val,
                cleared: false,
                highlighted: false
            });
        }
        
        isPlaying = true;
        clearInterval(timerInterval);
        timerInterval = setInterval(timerTick, 1000);
    }

    function timerTick() {
        if (!isPlaying) return;
        
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.innerText = `${m}:${s}`;
    }

    function updateScore() {
        scoreDisplay.innerText = score;
    }

    function endGame() {
        isPlaying = false;
        clearInterval(timerInterval);
        finalScoreDisplay.innerText = score;
        gameOverOverlay.classList.remove('hidden');
    }

    // Drag interaction
    board.addEventListener('mousedown', (e) => {
        if (!isPlaying || e.button !== 0) return;
        
        const boardRect = board.getBoundingClientRect();
        startX = e.clientX - boardRect.left;
        startY = e.clientY - boardRect.top;
        
        isDragging = true;
        
        const selectionBox = document.getElementById('selection-box');
        selectionBox.style.display = 'block';
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !isPlaying) return;
        
        const boardRect = board.getBoundingClientRect();
        let currentX = e.clientX - boardRect.left;
        let currentY = e.clientY - boardRect.top;
        
        // Clamp to board bounds
        currentX = Math.max(0, Math.min(currentX, boardRect.width));
        currentY = Math.max(0, Math.min(currentY, boardRect.height));
        
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(startX - currentX);
        const height = Math.abs(startY - currentY);
        
        const selectionBox = document.getElementById('selection-box');
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
        
        // Calculate viewport coordinates for the box
        const boxRect = {
            left: boardRect.left + left,
            right: boardRect.left + left + width,
            top: boardRect.top + top,
            bottom: boardRect.top + top + height
        };
        
        highlightIntersectingCells(boxRect);
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const selectionBox = document.getElementById('selection-box');
        selectionBox.style.display = 'none';
        
        processSelection();
    });

    function isIntersecting(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    function highlightIntersectingCells(boxRect) {
        cellsData.forEach(cell => {
            if (cell.cleared) return;
            
            const cellRect = cell.element.getBoundingClientRect();
            
            if (isIntersecting(boxRect, cellRect)) {
                if (!cell.highlighted) {
                    cell.element.classList.add('highlight');
                    cell.highlighted = true;
                }
            } else {
                if (cell.highlighted) {
                    cell.element.classList.remove('highlight');
                    cell.highlighted = false;
                }
            }
        });
    }

    function processSelection() {
        let sum = 0;
        const selectedCells = [];
        
        cellsData.forEach(cell => {
            if (cell.highlighted && !cell.cleared) {
                sum += cell.value;
                selectedCells.push(cell);
            }
        });
        
        if (sum === 10) {
            // Success!
            selectedCells.forEach(cell => {
                cell.cleared = true;
                cell.element.classList.remove('highlight');
                cell.element.classList.add('cleared');
            });
            score += selectedCells.length;
            updateScore();
        } else {
            // Failed to make 10
            selectedCells.forEach(cell => {
                cell.element.classList.remove('highlight');
                cell.highlighted = false;
            });
        }
    }

    restartBtn.addEventListener('click', initGame);

    // Start initial game
    initGame();
});
