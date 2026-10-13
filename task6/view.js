class GameView {
    constructor() {
        this.canvas = document.getElementById('field');
        this.ctx = this.canvas.getContext('2d');

        this.scoreOut = document.getElementById('scoreOut');
        this.levelOut = document.getElementById('levelOut');
        this.bestOut = document.getElementById('bestOut');
        this.endScreen = document.getElementById('endScreen');
        this.endTitle = document.getElementById('endTitle');
        this.endScore = document.getElementById('endScore');
        this.againBtn = document.getElementById('againBtn');
    }

    draw(model) {
        const size = this.canvas.width / model.cols;

        this.#paintField(model, size);
        
        for (const food of model.foods) {
            this.#paintFood(food, size);
        }

        this.#paintBonus(model.bonus, size);
        this.#paintSnake(model, size);
        if (model.phase === 'paused') this.#paintPause();

        this.#updatePanel(model);
    }

    #paintField(model, size) {
        const ctx = this.ctx;
        for (let y = 0; y < model.rows; y++) {
            for (let x = 0; x < model.cols; x++) {
                ctx.fillStyle = (x + y) % 2 ? '#16202a' : '#1a2530';
                ctx.fillRect(x * size, y * size, size, size);
            }
        }
    }

    #paintSnake(model, size) {
        const ctx = this.ctx;
        const total = model.body.length;

        model.body.forEach((cell, i) => {
            const light = 55 - 22 * (i / total);
            ctx.fillStyle = `hsl(145 65% ${light}%)`;
            this.#roundedBox(cell.x * size + 1, cell.y * size + 1, size - 2, size - 2, i === 0 ? 7 : 5);
            ctx.fill();
        });

        this.#paintEyes(model, size);
    }

    #paintEyes(model, size) {
        const ctx = this.ctx;
        const head = model.body[0];
        const { dx, dy } = HEADINGS[model.heading];
        const cx = head.x * size + size / 2;
        const cy = head.y * size + size / 2;

        ctx.fillStyle = '#0b1a12';
        for (const side of [-1, 1]) {
            const ex = cx + dx * 4 + -dy * 4 * side;
            const ey = cy + dy * 4 + dx * 4 * side;
            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    #paintFood(food, size) {
        const ctx = this.ctx;
        const cx = food.x * size + size / 2;
        const cy = food.y * size + size / 2;

        ctx.fillStyle = '#ff5a5a';
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7bd66b';
        ctx.fillRect(cx, cy - size / 2 + 1, 3, 4);
    }

    #paintBonus(bonus, size) {
        if (!bonus) return;
        const { ctx } = this;
        const cx = bonus.x * size + size / 2;
        const cy = bonus.y * size + size / 2;

        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7bd66b';
        ctx.fillRect(cx, cy - size / 2 + 1, 3, 4);

        const share = bonus.ttl / BONUS_LIFETIME;
        ctx.strokeStyle = '#fff3b0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share);
        ctx.stroke();
    }

    #paintPause() {
        const { ctx, canvas } = this;
        ctx.fillStyle = 'rgba(10, 14, 18, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e8eef4';
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Пауза', canvas.width / 2, canvas.height / 2);
    }

    #roundedBox(x, y, w, h, r) {
        const { ctx } = this;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
    }

    #updatePanel(model) {
        this.scoreOut.textContent = model.score;
        this.levelOut.textContent = model.level;
        this.bestOut.textContent = model.bestScore;

        this.endScreen.hidden = !model.isFinished;
        if (model.isFinished) {
            this.endTitle.textContent = model.phase === 'won' ? 'Победа!' : 'Игра окончена';
            this.endScore.textContent = `Итоговый счёт: ${model.score}`;
        }
    }
}