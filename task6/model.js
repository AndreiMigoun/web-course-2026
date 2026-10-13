const BONUS_LIFETIME = 35;
const BONUS_CHANCE = 0.35;
const POINTS_PER_LEVEL = 5;
const NUM_FOODS = 5;

const HEADINGS = { up: { dx: 0,  dy: -1 }, down: { dx: 0,  dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1,  dy: 0 } };

const cellKey = (x, y) => `${x},${y}`;

class SnakeModel {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.bestScore = this.#loadBest();
        this.reset();
    }

    reset() {
        const cx = Math.floor(this.cols / 2);
        const cy = Math.floor(this.rows / 2);

        this.body = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
        this.taken = new Set(this.body.map(c => cellKey(c.x, c.y)));
        this.heading = 'right';
        this.turnBuffer = [];
        this.score = 0;
        this.phase = 'playing';
        this.foods = [];
        this.bonus = null;

        for (let i = 0; i < NUM_FOODS; i++) {
            this.#placeFood();
        }
    }

    get level() {
        return 1 + Math.floor(this.score / POINTS_PER_LEVEL);
    }

    get stepDelay() {
        return Math.max(70, 160 - (this.level - 1) * 12);
    }

    get isFinished() {
        return this.phase === 'over' || this.phase === 'won';
    }

    steer(name) {
        const last = this.turnBuffer.length ? this.turnBuffer[this.turnBuffer.length - 1] : this.heading;
        const a = HEADINGS[last];
        const b = HEADINGS[name];

        const isReverse = a.dx + b.dx === 0 && a.dy + b.dy === 0;
        const isSame = name === last;
        if (isReverse || isSame) return;
        if (this.turnBuffer.length < 2) this.turnBuffer.push(name);
    }

    togglePause() {
        if (this.phase === 'playing') this.phase = 'paused';
        else if (this.phase === 'paused') this.phase = 'playing';
    }

    update() {
        if (this.phase !== 'playing') return;

        if (this.turnBuffer.length) this.heading = this.turnBuffer.shift();

        const head = this.body[0];
        const { dx, dy } = HEADINGS[this.heading];
        const next = { x: head.x + dx, y: head.y + dy };

        const foodIndex = this.foods.findIndex(f => this.#sameCell(f, next));
        const hitsFood = foodIndex !== -1;
        const hitsBonus = this.#sameCell(this.bonus, next);
        const grows = hitsFood || hitsBonus;

        const tail = this.body[this.body.length - 1];
        if (!grows) this.taken.delete(cellKey(tail.x, tail.y));

        if (this.#isDeadly(next)) {
            this.#finish('over');
            return;
        }

        this.body.unshift(next);
        this.taken.add(cellKey(next.x, next.y));
        if (!grows) this.body.pop();

        this.#tickBonus();

        if (hitsFood) {
            this.score += 1;
            this.foods.splice(foodIndex, 1);
            this.#placeFood();
            if (!this.bonus && Math.random() < BONUS_CHANCE) this.#placeBonus();
        }
        if (hitsBonus) {
            this.score += 3;
            this.bonus = null;
        }
    }

    #sameCell(item, cell) {
        return item !== null && item.x === cell.x && item.y === cell.y;
    }

    #isDeadly(cell) {
        const outside = cell.x < 0 || cell.y < 0 || cell.x >= this.cols || cell.y >= this.rows;
        return outside || this.taken.has(cellKey(cell.x, cell.y));
    }

    #randomFreeCell() {
        const free = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.taken.has(cellKey(x, y))) continue;

                const isFood = this.foods.some(f => this.#sameCell(f, { x, y }));
                if (isFood) continue;

                if (this.#sameCell(this.bonus, { x, y })) continue;
                free.push({ x, y });
            }
        }
        return free.length ? free[Math.floor(Math.random() * free.length)] : null;
    }

    #placeFood() {
        const cell = this.#randomFreeCell();
        if (cell) this.foods.push(cell);
        else this.#finish('won');
    }

    #placeBonus() {
        const cell = this.#randomFreeCell();
        if (cell) this.bonus = { ...cell, ttl: BONUS_LIFETIME };
    }

    #tickBonus() {
        if (!this.bonus) return;
        this.bonus.ttl -= 1;
        if (this.bonus.ttl <= 0) this.bonus = null;
    }

    #finish(phase) {
        this.phase = phase;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.#saveBest();
        }
    }

    #loadBest() {
        try { return Number(localStorage.getItem('snake-best-v2')) || 0; }
        catch (e) { return 0; }
    }

    #saveBest() {
        try { localStorage.setItem('snake-best-v2', this.bestScore); }
        catch (e) { }
    }
}