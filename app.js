import { database, ref, onValue } from './firebase.js';

// DOM Elements
const periodNumberElement = document.getElementById('periodNumber');
const predictionValueElement = document.getElementById('predictionValue');
const timerElement = document.getElementById('timer');
const progressBarElement = document.getElementById('progressBar');
const nextPredictionTimeElement = document.getElementById('nextPredictionTime');
const startAnimationContainer = document.getElementById('startAnimation');
const finishAnimationContainer = document.getElementById('finishAnimation');

// Animation setup
let startAnimation, finishAnimation;

// Load animations
function loadAnimations() {
    // Start animation (replace with your Lottie JSON path)
    startAnimation = lottie.loadAnimation({
        container: startAnimationContainer,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'assets/animations/start.json' // Replace with your animation path
    });
    
    // Finish animation (replace with your Lottie JSON path)
    finishAnimation = lottie.loadAnimation({
        container: finishAnimationContainer,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'assets/animations/finish.json' // Replace with your animation path
    });
    
    // Reset animation containers
    startAnimationContainer.style.display = 'none';
    finishAnimationContainer.style.display = 'none';
}

// Listen for real-time updates from Firebase
function setupFirebaseListeners() {
    // Listen for period and prediction updates
    const predictionRef = ref(database, 'predictions/current');
    onValue(predictionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateDisplay(data);
        }
    });
    
    // Listen for timer updates
    const timerRef = ref(database, 'timer');
    onValue(timerRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateTimer(data);
        }
    });
    
    // Listen for animation triggers
    const animationRef = ref(database, 'animations');
    onValue(animationRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            handleAnimations(data);
        }
    });
}

// Update display with new data
function updateDisplay(data) {
    periodNumberElement.textContent = data.period || '--';
    
    if (data.prediction) {
        predictionValueElement.textContent = data.prediction;
        predictionValueElement.className = 'prediction ' + data.prediction.toLowerCase();
    }
}

// Update timer display
function updateTimer(data) {
    if (data && data.remaining) {
        timerElement.textContent = formatTime(data.remaining);
        
        // Update progress bar
        if (data.duration && data.remaining) {
            const percentage = (data.remaining / data.duration) * 100;
            progressBarElement.style.width = percentage + '%';
        }
    }
    
    if (data && data.nextPredictionTime) {
        nextPredictionTimeElement.textContent = formatTime(data.nextPredictionTime);
    }
}

// Format time to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Handle animation triggers
function handleAnimations(data) {
    if (data.start) {
        playStartAnimation();
    }
    
    if (data.finish) {
        playFinishAnimation();
    }
}

// Play start animation
function playStartAnimation() {
    startAnimationContainer.style.display = 'block';
    finishAnimationContainer.style.display = 'none';
    
    startAnimation.goToAndPlay(0, true);
    
    // Hide animation after it completes
    setTimeout(() => {
        startAnimationContainer.style.display = 'none';
    }, startAnimation.getDuration() * 1000);
}

// Play finish animation
function playFinishAnimation() {
    startAnimationContainer.style.display = 'none';
    finishAnimationContainer.style.display = 'block';
    
    finishAnimation.goToAndPlay(0, true);
    
    // Hide animation after it completes
    setTimeout(() => {
        finishAnimationContainer.style.display = 'none';
    }, finishAnimation.getDuration() * 1000);
}

// Initialize the application
function init() {
    loadAnimations();
    setupFirebaseListeners();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
