class FeedApiError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'FeedApiError';
        this.cause = cause;
    }
}

class PostsApi {
    constructor(endpoint, fetcher = (...args) => window.fetch(...args)) {
        this.endpoint = endpoint;
        this.fetcher = fetcher;
    }

    async fetchPortion(offset, limit) {
        const url = `${this.endpoint}?_start=${offset}&_limit=${limit}`;

        try {
            const response = await this.fetcher(url);

            if (!response.ok) {
                throw new FeedApiError(
                    `Сервер вернул ошибку ${response.status}. Попробуйте ещё раз чуть позже.`
                );
            }
            return await response.json();
        } catch (err) {
            if (err instanceof FeedApiError) throw err;
            throw new FeedApiError(
                'Не удалось получить посты. Проверьте подключение к интернету и повторите попытку.',
                err
            );
        }
    }
}

class LikeStore {
    constructor(storage, key) {
        this.storage = storage;
        this.key = key;
        this.ids = new Set(this.#readSaved());
    }

    has(id) {
        return this.ids.has(id);
    }

    add(id) {
        this.ids.add(id);
        this.#save();
    }

    remove(id) {
        this.ids.delete(id);
        this.#save();
    }

    #readSaved() {
        try {
            const list = JSON.parse(this.storage.getItem(this.key));
            return Array.isArray(list) ? list : [];
        } catch (err) {
            return [];
        }
    }

    #save() {
        try {
            this.storage.setItem(this.key, JSON.stringify([...this.ids]));
        } catch (err) {}
    }
}

class FeedModel {
    constructor(api, likeStore, portionSize) {
        this.api = api;
        this.likeStore = likeStore;
        this.portionSize = portionSize;

        this.posts = [];
        this.query = '';
        this.tab = 'all';
        this.isLoading = false;
        this.isExhausted = false;
        this.errorText = '';
    }

    get canLoadMore() {
        return !this.isLoading && !this.isExhausted && !this.errorText;
    }

    get shouldAutoLoad() {
        if (!this.canLoadMore) return false;
        return this.tab === 'all' || this.hasUnloadedLikes;
    }

    get hasUnloadedLikes() {
        const loadedIds = new Set(this.posts.map(p => p.id));
        return [...this.likeStore.ids].some(id => !loadedIds.has(id));
    }

    get visiblePosts() {
        const needle = this.query.trim().toLowerCase();
        return this.posts.filter(post => {
            if (this.tab === 'liked' && !this.isLiked(post.id)) return false;
            return !needle || post.title.toLowerCase().includes(needle);
        });
    }

    get likedLoadedCount() {
        return this.posts.filter(p => this.isLiked(p.id)).length;
    }

    applyQuery(text) {
        this.query = text;
    }

    switchTab(name) {
        if (name === 'all' || name === 'liked') this.tab = name;
    }

    dismissError() {
        this.errorText = '';
    }

    isLiked(id) {
        return this.likeStore.has(id);
    }

    likesOf(post) {
        const base = (post.id * 7 + post.userId * 3);
        return base + (this.isLiked(post.id) ? 1 : 0);
    }

    toggleLike(id) {
        if (this.isLiked(id)) this.likeStore.remove(id);
        else this.likeStore.add(id);
    }

    async loadNextPortion() {
        if (!this.canLoadMore) return;

        this.isLoading = true;
        try {
            const portion = await this.api.fetchPortion(this.posts.length, this.portionSize);
            this.posts.push(...portion);
            if (portion.length < this.portionSize) this.isExhausted = true;
        } catch (err) {
            this.errorText = err.message;
        } finally {
            this.isLoading = false;
        }
    }
}