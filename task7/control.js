class FeedController {
    constructor(model, view, options) {
        this.model = model;
        this.view = view;
        this.debounceMs = options.debounceMs;
        this.edgeGap = options.edgeGap;
        this.typingTimer = null;

        window.addEventListener('scroll', () => this.#fillIfNearEdge());
        view.searchField.addEventListener('input', () => this.#onTyping());
        view.retryBtn.addEventListener('click', () => this.#retryAfterError());
        view.tabs.addEventListener('click', e => this.#onTabClick(e));
        view.feed.addEventListener('click', e => this.#onLikeClick(e));
    }

    async start() {
        this.view.render(this.model);
        await this.#fillIfNearEdge();
    }

    #onTyping() {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => this.#applySearch(), this.debounceMs);
    }

    async #applySearch() {
        this.model.applyQuery(this.view.searchField.value);
        this.view.render(this.model);
        await this.#fillIfNearEdge();
    }

    async #onTabClick(event) {
        const btn = event.target.closest('[data-tab]');
        if (!btn) return;

        this.model.switchTab(btn.dataset.tab);
        this.view.render(this.model);
        window.scrollTo(0, 0);
        await this.#fillIfNearEdge();
    }

    #onLikeClick(event) {
        const btn = event.target.closest('.like-btn');
        if (!btn) return;

        const id = Number(btn.dataset.id);
        this.model.toggleLike(id);
        this.view.render(this.model);
        if (this.model.isLiked(id)) this.view.playLikeEffect(id);
    }

    async #retryAfterError() {
        this.model.dismissError();
        await this.#pullPortion();
        await this.#fillIfNearEdge();
    }

    async #fillIfNearEdge() {
        while (this.model.shouldAutoLoad && this.#isNearBottom()) {
            await this.#pullPortion();
        }
    }

    async #pullPortion() {
        const pending = this.model.loadNextPortion();
        this.view.render(this.model);
        await pending;
        this.view.render(this.model);
    }

    #isNearBottom() {
        const viewportBottom = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        return viewportBottom >= pageHeight - this.edgeGap;
    }
}

function pickStorage() {
    try { return window.localStorage; }
    catch (err) { return null; }
}

const api = new PostsApi('https://jsonplaceholder.typicode.com/posts');
const likeStore = new LikeStore(pickStorage(), 'feed-liked-v1');
const model = new FeedModel(api, likeStore, 10);
const view = new FeedView(document);

new FeedController(model, view, { debounceMs: 300, edgeGap: 200 }).start();