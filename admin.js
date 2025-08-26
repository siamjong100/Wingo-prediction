import { database, ref, set, update, onValue, auth, signInWithEmailAndPassword, signOut } from './firebase.js';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const predictionForm = document.getElementById('predictionForm');
const currentPeriodElement = document.getElementById('currentPeriod');
const currentPredictionElement = document.getElementById('currentPrediction');
const timerStatusElement = document.getElementById('timerStatus');
const startTimerButton = document.getElementById('startTimer');
const pauseTimerButton = document.getElementById('pauseTimer');
const resetTimerButton = document.getElementById('resetTimer');
const triggerStartAnimationButton = document.getElementById('triggerStartAnimation');
const triggerFinishAnimationButton = document.getElementById('triggerFinishAnimation');

// Timer variables
let timerInterval;
let timerSeconds = 60;
let isTimerRunning = false;

// Initialize admin application
function initAdmin() {
    // Check if user is already logged in
    const user = auth.currentUser;
    if (user) {
        showAdminPanel();
        setupFirebaseListeners();
    } else {
        showLoginForm();
    }
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Prediction form submission
    predictionForm.addEventListener('submit', handlePredictionSubmit);
    
    // Timer controls
    startTimerButton.addEventListener('click', startTimer);
    pauseTimerButton.addEventListener('click', pauseTimer);
    resetTimerButton.addEventListener('click', resetTimer);
    
    // Animation controls
    triggerStartAnimationButton.addEventListener('click', triggerStartAnimation);
    triggerFinishAnimationButton.addEventListener('click', triggerFinishAnimation);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Logged in as:', userCredential.user.email);
        
        showAdminPanel();
        setupFirebaseListeners();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Show admin panel
function showAdminPanel() {
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
}

// Show login form
function showLoginForm() {
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
}

// Set up Firebase listeners for admin
function setupFirebaseListeners() {
    // Listen for current prediction
    const predictionRef = ref(database, 'predictions/current');
    onValue(predictionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateCurrentSettings(data);
        }
    });
    
    // Listen for timer status
    const timerRef = ref(database, 'timer');
    onValue(timerRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateTimerStatus(data);
        }
    });
}

// Update current settings display
function updateCurrentSettings(data) {
    currentPeriodElement.textContent = data.period || '--';
    currentPredictionElement.textContent = data.prediction || '--';
}

// Update timer status display
function updateTimerStatus(data) {
    if (data && data.status) {
        timerStatusElement.textContent = data.status;
        
        if (data.remaining) {
            timerStatusElement.textContent += ` (${formatTime(data.remaining)})`;
        }
    }
}

// Handle prediction form submission
function handlePredictionSubmit(e) {
    e.preventDefault();
    
    const period = document.getElementById('period').value;
    const prediction = document.getElementById('prediction').value;
    const startTime = document.getElementById('startTime').value;
    
    // Save prediction to Firebase
    const predictionRef = ref(database, 'predictions/current');
    set(predictionRef, {
        period: period,
        prediction: prediction,
        timestamp: new Date().toISOString(),
        startTime: startTime
    }).then(() => {
        alert('Prediction saved successfully!');
        predictionForm.reset();
    }).catch((error) => {
        console.error('Error saving prediction:', error);
        alert('Error saving prediction: ' + error.message);
    });
}

// Start timer
function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    const timerRef = ref(database, 'timer');
    
    // Update timer status
    update(timerRef, {
        status: 'running',
        duration: timerSeconds,
        remaining: timerSeconds,
        lastUpdated: new Date().toISOString()
    });
    
    // Start countdown
    timerInterval = setInterval(() => {
        timerSeconds--;
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerSeconds = 60;
            
            // Update timer status to finished
            update(timerRef, {
                status: 'finished',
                remaining: 0
            });
            
            // Trigger finish animation
            triggerFinishAnimation();
        } else {
            // Update remaining time
            update(timerRef, {
                remaining: timerSeconds
            });
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    const timerRef = ref(database, 'timer');
    update(timerRef, {
        status: 'paused'
    });
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 60;
    
    const timerRef = ref(database, 'timer');
    update(timerRef, {
        status: 'reset',
        remaining: timerSeconds
    });
}

// Format time to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Trigger start animation
function triggerStartAnimation() {
    const animationRef = ref(database, 'animations');
    set(animationRef, {
        start: true,
        finish: false,
        timestamp: new Date().toISOString()
    });
}

// Trigger finish animation
function triggerFinishAnimation() {
    const animationRef = ref(database, 'animations');
    set(animationRef, {
        start: false,
        finish: true,
        timestamp: new Date().toISOString()
    });
}

// Initialize the admin application
document.addEventListener('DOMContentLoaded', initAdmin);
