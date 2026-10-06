const BASE_LIGHT_MS = 500;
const BASE_GAP_MS = 250;
const MIN_LIGHT_MS = 180;
const MIN_GAP_MS = 90;
const PLAYER_FLASH_MS = 200;
const BEFORE_SHOW_MS = 600;
const AFTER_ROUND_MS = 500;

const padElements = Array.from(document.querySelectorAll('.pad'));
const hubElement = document.getElementById('hubValue');
const roundValueElement = document.getElementById('roundValue');
const bestValueElement = document.getElementById('bestValue');
const statusElement = document.getElementById('statusText');
const startButtonElement = document.getElementById('startButton');
const soundButtonElement = document.getElementById('soundButton');
const modeButtonElements = Array.from(document.querySelectorAll('.mode-btn'));

const PAD_FREQUENCIES = [262, 330, 392, 523];

const state = {
    pattern: [],
    inputPosition: 0,
    isShowingPattern: false,
    isRunning: false,
    round: 0,
    mode: 'classic',
    bestScores: { classic: 0, reverse: 0 },
    isSoundOn: true,
    sessionId: 0,
    activeTimeouts: new Set()
};

function wait(ms) {
    return new Promise(resolve => {
        const timeoutId = setTimeout(() => {
            state.activeTimeouts.delete(timeoutId);
            resolve();
        }, ms);
        state.activeTimeouts.add(timeoutId);
    });
}

function cancelAllTimeouts() {
    state.activeTimeouts.forEach(clearTimeout);
    state.activeTimeouts.clear();
}


let audioContext = null;

function playTone(padIndex, durationMs = 300) {
    if (!state.isSoundOn) return;
    try {
        audioContext = audioContext || new (window.AudioContext)();
        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();
        oscillator.frequency.value = PAD_FREQUENCIES[padIndex];
        volume.gain.value = 0.15;
        oscillator.connect(volume).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + durationMs / 1000);
    } catch (error) {}
}

function playErrorTone() {
    if (!state.isSoundOn) return;
    try {
        audioContext = audioContext || new (window.AudioContext)();
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
    void hubElement.offsetWidth; // перезапуск анимации
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

function selectMode(mode) {
    state.mode = mode;
    modeButtonElements.forEach(button => {
        button.classList.toggle('is-selected', button.dataset.mode === mode);
    });
    renderScores();
}


function getLightDuration() {
    return Math.max(MIN_LIGHT_MS, BASE_LIGHT_MS - (state.round - 1) * 25);
}

function getGapDuration() {
    return Math.max(MIN_GAP_MS, BASE_GAP_MS - (state.round - 1) * 12);
}


function getExpectedPad() {
    return state.mode === 'reverse' ? state.pattern[state.pattern.length - 1 - state.inputPosition] : state.pattern[state.inputPosition];
}

async function playPattern(sessionId) {
    state.isShowingPattern = true;
    setPadsEnabled(false);
    showStatus('Запоминайте…');

    await wait(BEFORE_SHOW_MS);
    for (const padIndex of state.pattern) {
        if (sessionId !== state.sessionId) return;
        lightPad(padIndex);
        await wait(getLightDuration());
        dimPad(padIndex);
        await wait(getGapDuration());
    }
    if (sessionId !== state.sessionId) return;

    state.isShowingPattern = false;
    state.inputPosition = 0;
    setPadsEnabled(true);
    showStatus(state.mode === 'reverse' ? 'Повторяйте с конца!' : 'Ваш ход');
}

function startNextRound() {
    state.pattern.push(Math.floor(Math.random() * 4));
    state.round++;
    renderScores();
    bumpHub();
    playPattern(state.sessionId);
}

function startGame() {
    state.sessionId++;
    cancelAllTimeouts();
    dimAllPads();

    state.pattern = [];
    state.inputPosition = 0;
    state.round = 0;
    state.isRunning = true;
    state.isShowingPattern = false;
    startButtonElement.textContent = 'Заново';
    setModeButtonsEnabled(false);

    startNextRound();
}

function endGame() {
    state.sessionId++;
    cancelAllTimeouts();
    dimAllPads()
    state.isRunning = false;
    state.isShowingPattern = false;
    setPadsEnabled(false);
    setModeButtonsEnabled(true);

    const reachedRound = state.round;
    if (reachedRound > state.bestScores[state.mode]) {
        state.bestScores[state.mode] = reachedRound;
        saveBestScores();
    }
    renderScores();
    showStatus(`Ошибка! Вы дошли до уровня ${reachedRound}`, true);
    startButtonElement.textContent = 'Старт';

    playErrorTone();
}

function handlePadPress(padIndex) {
    if (!state.isRunning || state.isShowingPattern) return;

    const sessionId = state.sessionId;
    lightPad(padIndex);
    wait(PLAYER_FLASH_MS).then(() => {
        if (sessionId === state.sessionId) dimPad(padIndex);
    });

    if (padIndex !== getExpectedPad()) {
        endGame();
        return;
    }

    state.inputPosition++;
    if (state.inputPosition === state.pattern.length) {
        setPadsEnabled(false);
        state.isShowingPattern = true;
        showStatus('Верно!');
        wait(AFTER_ROUND_MS).then(() => {
            if (sessionId === state.sessionId) startNextRound();
        });
    }
}

function loadBestScores() {
    try {
        state.bestScores.classic = Number(localStorage.getItem('simon-best-classic')) || 0;
        state.bestScores.reverse = Number(localStorage.getItem('simon-best-reverse')) || 0;
    } catch (error) {}
}

function saveBestScores() {
    try {
        localStorage.setItem('simon-best-classic', state.bestScores.classic);
        localStorage.setItem('simon-best-reverse', state.bestScores.reverse);
    } catch (error) {}
}

padElements.forEach(pad => {
    pad.addEventListener('click', () => handlePadPress(Number(pad.dataset.pad)));
});

modeButtonElements.forEach(button => {
    button.addEventListener('click', () => {
        if (!state.isRunning) selectMode(button.dataset.mode);
    });
});

startButtonElement.addEventListener('click', startGame);

soundButtonElement.addEventListener('click', () => {
    state.isSoundOn = !state.isSoundOn;
    soundButtonElement.textContent = state.isSoundOn ? 'Звук: вкл' : 'Звук: выкл';
    soundButtonElement.setAttribute('aria-pressed', String(state.isSoundOn));
});

hubElement.addEventListener('animationend', () => {
    hubElement.classList.remove('is-bumped');
});

loadBestScores();
renderScores();