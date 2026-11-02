document.addEventListener('DOMContentLoaded', () => {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('timer');
    const levelDisplay = document.getElementById('current-diff-label');
    const restartButton = document.getElementById('reset-btn');
    const playAgainButton = document.getElementById('play-again-btn');
    const gameArea = document.getElementById('game-board');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');

    let score = 0;
    let targetScore = 20;
    let timeLeft = 30;
    let timer = null;
    let spawner = null;
    let gameActive = false;

    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log("Difficulty clicked:", e.target.textContent);
            targetScore = parseInt(e.target.dataset.goal) || 20;
            if (levelDisplay) levelDisplay.textContent = e.target.textContent;
            
            // Directly hide the setup screen and show the game screen
            const setupDiv = document.getElementById('setup-screen');
            const gameDiv = document.getElementById('game-screen');
            if (setupDiv) setupDiv.style.display = 'none';
            if (gameDiv) gameDiv.classList.remove('hidden');
            
            startGame();
        });
    });

    function startGame() {
        score = 0;
        timeLeft = 30;
        gameActive = true;
        scoreDisplay.textContent = `${score} / ${targetScore}`;
        timeDisplay.textContent = `${timeLeft}s`;
        gameOverScreen.style.display = 'none';
        gameArea.innerHTML = '';

        clearInterval(timer);
        clearInterval(spawner);

        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0 || score >= targetScore) {
                endGame();
            }
        }, 1000);

        spawner = setInterval(spawnJerryCan, 800);
    }

    function spawnJerryCan() {
        if (!gameActive) return;

        const jerryCan = document.createElement('div');
        jerryCan.classList.add('jerry-can');
        jerryCan.textContent = '🛢️';

        const maxX = gameArea.clientWidth - 50;
        const maxY = gameArea.clientHeight - 50;
        jerryCan.style.left = `${Math.random() * maxX}px`;
        jerryCan.style.top = `${Math.random() * maxY}px`;

        jerryCan.addEventListener('click', () => {
            if (!gameActive) return;
            score++;
            scoreDisplay.textContent = `${score} / ${targetScore}`;
            jerryCan.remove();
            if (score >= targetScore) {
                endGame();
            }
        });

        gameArea.appendChild(jerryCan);

        setTimeout(() => {
            if (jerryCan.parentElement) {
                jerryCan.remove();
            }
        }, 1200);
    }

    function endGame() {
        gameActive = false;
        clearInterval(timer);
        clearInterval(spawner);
        gameArea.innerHTML = '';
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'block';
    }

    if (restartButton) {
        restartButton.addEventListener('click', startGame);
    }
    if (playAgainButton) {
        playAgainButton.addEventListener('click', startGame);
    }
});