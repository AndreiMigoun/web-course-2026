const CODE_LENGTH = 6;
const MIN_ROWS = 6;

const state = {
    hiddenCode: '',
    history: [],
    attempts: 0,
    isGameOver: false
};

let errorMessage = '';

const gridEl = document.getElementById('grid');
const historyEl = document.getElementById('history');
const attemptsEl = document.getElementById('attempts');
const errorEl = document.getElementById('error');
const winEl = document.getElementById('winMessage');
const formEl = document.getElementById('guessForm');
const inputEl = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const keypadEl = document.getElementById('keypad');


function pluralize(n, one, few, many) {
    const mod100 = n % 100;
    const mod10 = n % 10;
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
}

function getTileStatuses(hiddenCode, guess) {
    const s = Array(CODE_LENGTH);

    for(let i = 0; i < CODE_LENGTH; i++){
        if (hiddenCode[i] === guess[i]){
            s[i] = 'bull';
        }
        else if (hiddenCode.includes(guess[i])){
            s[i] = 'cow';
        }
        else {
            s[i] = 'miss';
        }
    }
    return s;
}

function renderGrid() {
    gridEl.innerHTML = '';
    const typed = inputEl.value.slice(0, CODE_LENGTH);

    state.history.forEach((item, index) => {
        const statuses = getTileStatuses(state.hiddenCode, item.guess);
        const row = document.createElement('div');
        row.className = 'row';

        for (let i = 0; i < CODE_LENGTH; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile' + (statuses[i] ? ' ' + statuses[i] : '');
            tile.textContent = item.guess[i];
            row.appendChild(tile);
        }
    gridEl.appendChild(row);
    });

    let rowsDrawn = state.history.length;


    if (!state.isGameOver) {
        const row = document.createElement('div');
        row.className = 'row active-row';
        for (let i = 0; i < CODE_LENGTH; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile' + (typed[i] ? ' filled' : '');
        tile.textContent = typed[i] || '';
        row.appendChild(tile);
    }
    gridEl.appendChild(row);
    rowsDrawn++;
    }

    for (let r = rowsDrawn; r < MIN_ROWS; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let i = 0; i < CODE_LENGTH; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
    gridEl.appendChild(row);
    }

    gridEl.scrollTop = gridEl.scrollHeight;
}

function formatResult(bulls, cows) {
    const b = `${bulls} ${pluralize(bulls, 'бык', 'быка', 'быков')}`;
    const c = `${cows} ${pluralize(cows, 'корова', 'коровы', 'коров')}`;
    return `${b}, ${c}`;
}


function renderHistory() {
    historyEl.innerHTML = '';

    if (state.history.length === 0) {
        const li = document.createElement('li');
        li.className = 'history-empty';
        li.textContent = 'Пока нет попыток';
        historyEl.appendChild(li);
        return;
    }

    state.history.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.guess} -> ${formatResult(item.bulls, item.cows)}`;
        if (item.bulls === CODE_LENGTH) li.classList.add('win-line');
        historyEl.appendChild(li);
    });
}

function renderKeypad() {
    const priority = ['miss', 'cow', 'bull'];

    const best = {};
    state.history.forEach((item) => {
        const statuses = getTileStatuses(state.hiddenCode, item.guess);
        item.guess.split('').forEach((d, i) => {
        const cur = best[d];
        const next = statuses[i];
        if (cur === undefined || priority.indexOf(next) > priority.indexOf(cur)) {
            best[d] = next;
        }
        });
    });

    keypadEl.innerHTML = '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Enter', 'Backspace'];
    keys.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'key';
        btn.dataset.key = key;
        btn.disabled = state.isGameOver;

        if (key === 'Enter') {
            btn.textContent = 'Enter';
            btn.classList.add('wide');
        }
        else if (key === 'Backspace') {
            btn.textContent = '⌫';
            btn.classList.add('wide');
        } 
        else {
            btn.textContent = key;
            if (best[key]) 
                btn.classList.add(best[key]);
        }
        keypadEl.appendChild(btn);
    });
}

function updateUI() {
    attemptsEl.textContent = state.attempts;
    errorEl.textContent = errorMessage;

    if (state.isGameOver) {
        const n = state.attempts;
        winEl.textContent = `Победа! Угадано за ${n} ${pluralize(n, 'попытку', 'попытки', 'попыток')}`;
        winEl.hidden = false;
    } 
    else {
        winEl.hidden = true;
        winEl.textContent = '';
    }

    inputEl.disabled = state.isGameOver;
    checkBtn.disabled = state.isGameOver;

    renderGrid();
    renderHistory();
    renderKeypad();
}

function generateHiddenCode() {
    const digits = [0,1,2,3,4,5,6,7,8,9];
    const result = [];
    while (result.length < CODE_LENGTH) {
        const idx = Math.floor(Math.random() * digits.length);
        result.push(digits.splice(idx, 1)[0]);
    }
    return result.join('');
}

function newGame() {
    state.hiddenCode = generateHiddenCode();
    state.history = [];
    state.attempts = 0;
    state.isGameOver = false;

    errorMessage = '';
    inputEl.value = '';

    updateUI();
}

function validateGuess(value) {
    const str = String(value).trim();

    if (str.length !== CODE_LENGTH) {
        return { valid: false, message: 'Введите 4 цифры' };
    }
    if (!/^[0-9]{6}$/.test(str)) {
        return { valid: false, message: 'Допустимы только цифры (без букв и символов)' };
    }
    if (new Set(str).size !== CODE_LENGTH) {
        return { valid: false, message: 'Все цифры должны быть разными' };
    }
    return { valid: true };
}

function countBullsAndCows(hiddenCode, guess) {
    let bulls = 0;
    let cows = 0;

    for(let i = 0; i < CODE_LENGTH; i++){
        if (hiddenCode[i] === guess[i]){
            bulls++
        }
        else if (hiddenCode.includes(guess[i])) {
            cows++;
        }
    }
    return {bulls, cows}
}    

function handleCheck() {
    if (state.isGameOver) return;

    const value = inputEl.value.slice(0, CODE_LENGTH);

    const check = validateGuess(value);
    if (!check.valid) {
        errorMessage = check.message;
        updateUI();
        return;
    }

    const { bulls, cows } = countBullsAndCows(state.hiddenCode, value);

    state.history.push({ guess: value, bulls, cows });
    state.attempts++;
    errorMessage = '';
    inputEl.value = '';

    if (4 <= bulls ) {
        state.isGameOver = true;
    }

    updateUI();
}


function handleKeypadClick(key) {
    if (state.isGameOver) return;

    if (key === 'Enter') {
        handleCheck();
    return;
    }

    if (key === 'Backspace') {
        inputEl.value = inputEl.value.slice(0, -1);
    } else if (/^\d$/.test(key) && inputEl.value.length < CODE_LENGTH) {
        inputEl.value += key;
    }

    errorMessage = '';
    updateUI();
}

function handleInputChange() {
    errorMessage = '';
    errorEl.textContent = '';
    renderGrid();
}


formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCheck();
});

inputEl.addEventListener('input', handleInputChange);

newGameBtn.addEventListener('click', newGame);

keypadEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-key]');
    if (btn) handleKeypadClick(btn.dataset.key);
});

newGame();