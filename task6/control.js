const KEY_TO_HEADING = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right'
};

class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.lastStamp = null;
        this.lag = 0; 
        this.rafId = null;

        document.addEventListener('keydown', e => this.#onKey(e));
        view.againBtn.addEventListener('click', () => this.restart());
    }

    start() {
        this.lastStamp = null;
        this.lag = 0;
        this.view.draw(this.model);
        this.rafId = requestAnimationFrame(t => this.#frame(t));
    }

    restart() {
        cancelAnimationFrame(this.rafId);
        this.model.reset();
        this.start();
    }

    #frame(stamp) {
        const dt = this.lastStamp === null ? 0 : stamp - this.lastStamp;
        this.lastStamp = stamp;

        if (this.model.phase === 'playing') {
            this.lag += Math.min(dt, 500); 

            while (this.lag >= this.model.stepDelay && this.model.phase === 'playing') {
                this.model.update();
                this.lag -= this.model.stepDelay;
            }
        }

        this.view.draw(this.model);

        if (this.model.isFinished) return;
        this.rafId = requestAnimationFrame(t => this.#frame(t));
    }

    #onKey(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.model.togglePause();
            return;
        }
        const heading = KEY_TO_HEADING[event.code];
        if (!heading) return;
        event.preventDefault();
        if (this.model.phase === 'playing') this.model.steer(heading);
    }
}

const model = new SnakeModel(20, 20);
const view = new GameView();
new GameController(model, view).start();