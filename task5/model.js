const BASE_LIGHT_MS = 500;
const BASE_GAP_MS = 250;
const MIN_LIGHT_MS = 180;
const MIN_GAP_MS = 90;
const PLAYER_FLASH_MS = 200;
const BEFORE_SHOW_MS = 600;
const AFTER_ROUND_MS = 500;

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

function getLightDuration() {
    return Math.max(MIN_LIGHT_MS, BASE_LIGHT_MS - (state.round - 1) * 25);
}

function getGapDuration() {
    return Math.max(MIN_GAP_MS, BASE_GAP_MS - (state.round - 1) * 12);
}

function getExpectedPad() {
    return state.mode === 'reverse'
        ? state.pattern[state.pattern.length - 1 - state.inputPosition]
        : state.pattern[state.inputPosition];
}

function resetGame() {
    state.sessionId++;
    cancelAllTimeouts();

    state.pattern = [];
    state.inputPosition = 0;
    state.round = 0;
    state.isRunning = true;
    state.isShowingPattern = false;
}

function addRandomStep() {
    state.pattern.push(Math.floor(Math.random() * 4));
    state.round = state.pattern.length;
}

function finishGame() {
    state.sessionId++;
    cancelAllTimeouts();
    state.isRunning = false;
    state.isShowingPattern = false;

    const reachedRound = state.round;
    if (reachedRound > state.bestScores[state.mode]) {
        state.bestScores[state.mode] = reachedRound;
        saveBestScores();
    }
    return reachedRound;
}

function loadBestScores() {
    try {
        state.bestScores.classic = Number(localStorage.getItem('simon-best-classic')) || 0;
        state.bestScores.reverse = Number(localStorage.getItem('simon-best-reverse')) || 0;
    } catch (error) { }
}

function saveBestScores() {
    try {
        localStorage.setItem('simon-best-classic', state.bestScores.classic);
        localStorage.setItem('simon-best-reverse', state.bestScores.reverse);
    } catch (error) { }
}