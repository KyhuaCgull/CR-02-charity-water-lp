// Game State Variables
let score = 0;
let targetScore = 20;
let timeLeft = 30;
let gameInterval = null;
let spawnInterval = null;
let isPlaying = false;
let currentDiff = 'normal';

const diffSettings = {
    easy: { goal: 10, time: 35, speed: 1200 },
    normal: { goal: 20, time: 30, speed: 900 },
    hard: { goal: 30, time: 22, speed: 700 }
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');

const scoreSpan = document.getElementById('score');
const targetScoreSpan = document.getElementById('target-score');
const timerSpan = document.getElementById('timer');
const currentDiffLabel = document.getElementById('current-diff-label');
const messageBanner = document.getElementById('message-banner');
const gameBoard = document.getElementById('game-board');

const finalScoreSpan = document.getElementById('final-score');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');

const diffButtons = document.querySelectorAll('.diff-btn');
const resetBtn = document.getElementById('reset-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// Start Game by Difficulty Selection
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentDiff = btn.getAttribute('data-diff');
        const settings = diffSettings[currentDiff];
        
        targetScore = settings.goal;
        timeLeft = settings.time;
        score = 0;

        scoreSpan.textContent = score;
        targetScoreSpan.textContent = targetScore;
        timerSpan.textContent = timeLeft;
        currentDiffLabel.textContent = currentDiff.charAt(0).toUpperCase() + currentDiff.slice(1);

        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        startGame(settings.speed);
    });
});

function startGame(speed) {
    isPlaying = true;
    messageBanner.textContent = "Catch the yellow jerry cans before they disappear!";

    gameInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;

        // Milestone feedback message
        if (timeLeft === Math.floor(diffSettings[currentDiff].time / 2)) {
            messageBanner.textContent = "Halfway there! Keep providing clean water!";
        }

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);

    spawnInterval = setInterval(spawnCan, speed);
    spawnCan();
}

function spawnCan() {
    if (!isPlaying) return;

    // Clear out any previous unclicked cans from the DOM
    const existingCans = gameBoard.querySelectorAll('.jerry-can');
    existingCans.forEach(can => can.remove());

    const can = document.createElement('div');
    can.classList.add('jerry-can');
    
    // Add the water icon inside the span matching your CSS structure
    const span = document.createElement('span');
    span.textContent = '🚰';
    can.appendChild(span);

    // Random positioning inside the #game-board dimensions
    const boardWidth = gameBoard.clientWidth - 70;
    const boardHeight = gameBoard.clientHeight - 80;
    
    const randomX = Math.max(10, Math.floor(Math.random() * boardWidth));
    const randomY = Math.max(10, Math.floor(Math.random() * boardHeight));

    can.style.left = `${randomX}px`;
    can.style.top = `${randomY}px`;

    // Click handler for score increment and dynamic element removal
    can.addEventListener('click', () => {
        if (!isPlaying) return;
        score++;
        scoreSpan.textContent = score;
        can.remove(); // Dynamic DOM removal on interaction

        if (score >= targetScore) {
            endGame(true);
        }
    });

    gameBoard.appendChild(can);

    // Auto-remove can if not clicked in time to maintain game pace
    setTimeout(() => {
        if (can.parentNode) {
            can.remove();
        }
    }, diffSettings[currentDiff].speed * 1.4);
}

function endGame(isWin) {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameBoard.innerHTML = '';

    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreSpan.textContent = score;

    if (isWin) {
        gameOverTitle.textContent = "Mission Accomplished! 🚰";
        gameOverMessage.textContent = "You successfully gathered enough clean water points!";
    } else {
        gameOverTitle.textContent = "Time's Up!";
        gameOverMessage.textContent = "You didn't quite reach the goal. Give it another try!";
    }
}

function resetToSetup() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameBoard.innerHTML = '';

    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
}

resetBtn.addEventListener('click', resetToSetup);
playAgainBtn.addEventListener('click', resetToSetup);