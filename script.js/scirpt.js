// Game State Variables
let score = 0;
let targetScore = 20;
let timeLeft = 30;
let gameInterval = null;
let spawnInterval = null;
let currentDifficulty = 'normal';
let isPlaying = false;

// Difficulty Settings (Easy, Normal, Hard)
const difficulties = {
    easy: { target: 10, time: 40, spawnRate: 1200, canLifetime: 2000, label: 'Easy' },
    normal: { target: 20, time: 30, spawnRate: 900, canLifetime: 1500, label: 'Normal' },
    hard: { target: 30, time: 25, spawnRate: 650, canLifetime: 1100, label: 'Hard' }
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const targetScoreDisplay = document.getElementById('target-score');
const timerDisplay = document.getElementById('timer');
const currentDiffLabel = document.getElementById('current-diff-label');
const gameBoard = document.getElementById('game-board');
const messageBanner = document.getElementById('message-banner');
const resetBtn = document.getElementById('reset-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const finalScoreDisplay = document.getElementById('final-score');

// Event Listeners for Difficulty Buttons
document.querySelectorAll('.diff-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const diff = e.target.getAttribute('data-diff');
        startGame(diff);
    });
});

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', returnToSetup);

// Web Audio API Sound Effects (LevelUp Feature)
function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'collect') {
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); 
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        console.log("Audio not supported", e);
    }
}

function startGame(diff) {
    currentDifficulty = diff;
    const settings = difficulties[diff];
    
    score = 0;
    targetScore = settings.target;
    timeLeft = settings.time;
    isPlaying = true;

    scoreDisplay.textContent = score;
    targetScoreDisplay.textContent = targetScore;
    timerDisplay.textContent = timeLeft;
    currentDiffLabel.textContent = settings.label;
    messageBanner.textContent = "Catch the yellow jerry cans!";

    setupScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Timer Interval
    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);

    // Spawning Cans Interval
    spawnInterval = setInterval(() => {
        if (isPlaying) {
            spawnJerryCan(settings.canLifetime);
        }
    }, settings.spawnRate);
}

// DOM Element Creation and Removal
function spawnJerryCan(lifetime) {
    if (!isPlaying) return;

    const can = document.createElement('div');
    can.classList.add('jerry-can');
    can.innerHTML = `<span>🛢️</span>`;

    const maxX = gameBoard.clientWidth - 70;
    const maxY = gameBoard.clientHeight - 80;
    const randomX = Math.floor(Math.random() * Math.max(10, maxX));
    const randomY = Math.floor(Math.random() * Math.max(10, maxY));

    can.style.left = `${randomX}px`;
    can.style.top = `${randomY}px`;

    // Interaction handler (removes element on click and updates score)
    can.addEventListener('click', () => {
        if (!isPlaying) return;
        score++;
        scoreDisplay.textContent = score;
        playSound('collect');
        checkMilestones(); // Milestone Tracker LevelUp
        
        can.remove(); // Removes element from DOM

        if (score >= targetScore) {
            endGame(true);
        }
    });

    gameBoard.appendChild(can);

    // Auto-remove can if missed
    setTimeout(() => {
        if (can.parentNode === gameBoard) {
            can.remove();
        }
    }, lifetime);
}

// Milestone Tracking (LevelUp Feature)
function checkMilestones() {
    const halfTarget = Math.floor(targetScore / 2);
    if (score === 1) {
        messageBanner.textContent = "Great start! Keep going!";
    } else if (score === halfTarget) {
        messageBanner.textContent = "🎉 Halfway there! You're making a difference!";
    } else if (score === targetScore - 2) {
        messageBanner.textContent = "🔥 Almost at your goal! Push through!";
    }
}

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameBoard.innerHTML = '';
    startGame(currentDifficulty);
}

function endGame(isWin) {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameBoard.innerHTML = '';

    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');

    finalScoreDisplay.textContent = score;

    if (isWin) {
        gameOverTitle.textContent = "Victory! Clean Water Delivered! 💧";
        gameOverMessage.textContent = `Amazing work! You reached your goal of ${targetScore} cans and helped bring clean water to communities in need.`;
        playSound('win');
    } else {
        gameOverTitle.textContent = "Time's Up!";
        gameOverMessage.textContent = `You collected ${score} out of ${targetScore} jerry cans. Every drop counts—try again!`;
        playSound('lose');
    }
}

function returnToSetup() {
    gameOverScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
}