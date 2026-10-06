const padElements = Array.from(document.querySelectorAll('.pad'));
const hubElement = document.getElementById('hubValue');
const roundValueElement = document.getElementById('roundValue');
const bestValueElement = document.getElementById('bestValue');
const statusElement = document.getElementById('statusText');
const startButtonElement = document.getElementById('startButton');
const soundButtonElement = document.getElementById('soundButton');
const modeButtonElements = Array.from(document.querySelectorAll('.mode-btn'));

const PAD_FREQUENCIES = [262, 330, 392, 523];

let audioContext = null;

function playTone(padIndex, durationMs = 300) {
    if (!state.isSoundOn) return;
    try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();
        oscillator.frequency.value = PAD_FREQUENCIES[padIndex];
        volume.gain.value = 0.15;
        oscillator.connect(volume).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + durationMs / 1000);
    } catch (error) { }
}

function playErrorTone() {
    if (!state.isSoundOn) return;
    try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 110;
        volume.gain.value = 0.15;
        oscillator.connect(volume).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) { }
}

function setPadsEnabled(isEnabled) {
    padElements.forEach(pad => { pad.disabled = !isEnabled; });
}

function showStatus(text, isError = false) {
    statusElement.textContent = text;
    statusElement.classList.toggle('is-error', isError);
}

function renderScores() {
    roundValueElement.textContent = state.round;
    hubElement.textContent = state.round;
    bestValueElement.textContent = state.bestScores[state.mode];
}

function bumpHub() {
    hubElement.classList.remove('is-bumped');
    void hubElement.offsetWidth;
    hubElement.classList.add('is-bumped');
}

function lightPad(padIndex) {
    padElements[padIndex].classList.add('is-lit');
    playTone(padIndex);
}

function dimPad(padIndex) {
    padElements[padIndex].classList.remove('is-lit');
}

function dimAllPads() {
    padElements.forEach(pad => pad.classList.remove('is-lit'));
}

function setModeButtonsEnabled(isEnabled) {
    modeButtonElements.forEach(button => { button.disabled = !isEnabled; });
}

function showSelectedMode(mode) {
    modeButtonElements.forEach(button => {
        button.classList.toggle('is-selected', button.dataset.mode === mode);
    });
}

function setStartButtonText(text) {
    startButtonElement.textContent = text;
}

function showSoundState() {
    soundButtonElement.textContent = state.isSoundOn ? 'Звук: вкл' : 'Звук: выкл';
    soundButtonElement.setAttribute('aria-pressed', String(state.isSoundOn));
}

hubElement.addEventListener('animationend', () => {
    hubElement.classList.remove('is-bumped');
});