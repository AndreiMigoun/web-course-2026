class FeedView {
    static CHARACTERS = [
        { icon: '🦊', name: 'fox' },   { icon: '🐼', name: 'panda' },
        { icon: '🐸', name: 'frog' },  { icon: '🦉', name: 'owl' },
        { icon: '🐙', name: 'octo' },  { icon: '🦄', name: 'unicorn' },
        { icon: '🐝', name: 'bee' },   { icon: '🐧', name: 'penguin' },
        { icon: '🦁', name: 'lion' },  { icon: '🐳', name: 'whale' }
    ];

    static SVG_NS = 'http://www.w3.org/2000/svg';
    static HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3' +
        'c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5' +
        'c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

    constructor(doc) {
        const byId = id => doc.getElementById(id);
        this.doc = doc;

        this.searchField = byId('searchField');
        this.retryBtn = byId('retryBtn');
        this.tabs = byId('tabs');

        this.feed = byId('feed');
        this.counter = byId('counter');
        this.loader = byId('loader');
        this.errorBox = byId('errorBox');
        this.errorText = byId('errorText');
        this.emptyNote = byId('emptyNote');
        this.endNote = byId('endNote');

        this.tabButtons = {
            all: byId('tabAll'),
            liked: byId('tabLiked')
        };
        this.likedCount = byId('likedCount');
    }

    render(model) {
        const shown = model.visiblePosts;

        this.#paintCards(shown, model);
        this.#paintTabs(model);
        this.counter.textContent = `Показано ${shown.length} из ${model.posts.length} загруженных`;

        this.loader.hidden = !model.isLoading;
        this.errorBox.hidden = !model.errorText;
        this.errorText.textContent = model.errorText;

        this.#paintNotes(model, shown.length);
    }

    playLikeEffect(postId) {
        const card = this.feed.querySelector(`.post[data-id="${postId}"]`);
        if (!card) return;

        const btn = card.querySelector('.like-btn');
        btn.classList.add('pop');
        btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
    }

    #paintNotes(model, shownCount) {
        const inLikedTab = model.tab === 'liked';

        const likedEmpty = inLikedTab && shownCount === 0 && !model.isLoading
            && !model.errorText && !model.shouldAutoLoad;
        const searchEmpty = !inLikedTab && shownCount === 0 && model.posts.length > 0
            && model.isExhausted;

        this.emptyNote.hidden = !(likedEmpty || searchEmpty);
        this.emptyNote.textContent = inLikedTab
            ? 'Здесь пока пусто. Нажмите ♥ под любым постом.'
            : 'По вашему запросу ничего не найдено.';

        this.endNote.hidden = !(!inLikedTab && model.isExhausted && shownCount > 0);
    }

    #paintTabs(model) {
        for (const [name, btn] of Object.entries(this.tabButtons)) {
            const active = name === model.tab;
            btn.classList.toggle('active', active);
        }
        this.likedCount.textContent = model.likedLoadedCount;
    }

    #paintCards(posts, model) {
        const fragment = this.doc.createDocumentFragment();
        for (const post of posts) {
            fragment.appendChild(this.#buildCard(post, model));
        }
        this.feed.replaceChildren(fragment);
    }

    #buildCard(post, model) {
        const hero = FeedView.CHARACTERS[(post.userId - 1) % FeedView.CHARACTERS.length];

        const card = this.#makeEl('article', 'post');
        card.dataset.id = post.id;

        const avatar = this.#makeEl('div', 'avatar', hero.icon);
        avatar.style.setProperty('--hue', (post.userId * 47) % 360);

        const main = this.#makeEl('div', 'post-main');
        const head = this.#makeEl('div', 'post-head');
        head.append(
            this.#makeEl('span', 'post-user', `${hero.name}_${post.userId}`),
            this.#makeEl('span', 'post-meta', `пост №${post.id}`)
        );

        main.append(
            head,
            this.#makeEl('h2', 'post-title', post.title),
            this.#makeEl('p', 'post-body', post.body),
            this.#buildActions(post, model)
        );

        card.append(avatar, main);
        return card;
    }

    #buildActions(post, model) {
        const liked = model.isLiked(post.id);

        const btn = this.#makeEl('button', 'like-btn' + (liked ? ' liked' : ''));
        btn.type = 'button';
        btn.dataset.id = post.id;
        btn.setAttribute('aria-pressed', String(liked));
        btn.append(this.#makeHeart(), this.#makeEl('span', 'like-count', model.likesOf(post)));

        const row = this.#makeEl('div', 'post-actions');
        row.appendChild(btn);
        return row;
    }

    #makeHeart() {
        const svg = this.doc.createElementNS(FeedView.SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('class', 'heart');

        const path = this.doc.createElementNS(FeedView.SVG_NS, 'path');
        path.setAttribute('d', FeedView.HEART_PATH);
        svg.appendChild(path);
        return svg;
    }

    #makeEl(tag, className = '', text = '') {
        const el = this.doc.createElement(tag);
        if (className) el.className = className;
        el.textContent = text;
        return el;
    }
}