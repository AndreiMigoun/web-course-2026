export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export class ApiClient {
    #baseUrl;
    #fetch;

    constructor(baseUrl, fetchFn = (...args) => globalThis.fetch(...args)) {
        this.#baseUrl = baseUrl;
        this.#fetch = fetchFn;
    }

    getCategories() {
        return this.#request('/categories');
    }

    createCategory({ name, type }) {
        return this.#request('/categories', { method: 'POST', body: { name, type } });
    }

    getTransactions({ category_id, type, from, to } = {}) {
        const query = this.#buildQuery({ category_id, type, from, to });
        return this.#request(`/transactions${query}`);
    }

    createTransaction(data) {
        return this.#request('/transactions', { method: 'POST', body: data });
    }

    updateTransaction(id, data) {
        return this.#request(`/transactions/${id}`, { method: 'PUT', body: data });
    }

    deleteTransaction(id) {
        return this.#request(`/transactions/${id}`, { method: 'DELETE' });
    }

    async #request(path, { method = 'GET', body } = {}) {
        const options = { method };
        if (body !== undefined) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }

        let response;
        try {
            response = await this.#fetch(`${this.#baseUrl}${path}`, options);
        } catch {
            throw new ApiError(`Не удалось связаться с сервером (${this.#baseUrl}). Запущен ли он?`);
        }

        let data = null;
        try {
            data = await response.json();
        } catch {
        }

        if (!response.ok) {
            throw new ApiError(data?.error ?? `Ошибка сервера (${response.status})`, response.status);
        }
        return data;
    }

    #buildQuery(params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                query.set(key, value);
            }
        }
        const str = query.toString();
        return str ? `?${str}` : '';
    }
}