import { ApiClient } from './api.js';
import { UI } from './ui.js';

class App {
    static EMPTY_FILTERS = Object.freeze({ category_id: '', type: '', from: '', to: '' });
    static SETTINGS_KEY = 'zen-money-settings';

    #api;
    #ui;
    #storage;

    categories = [];
    transactions = [];
    filters = { ...App.EMPTY_FILTERS };
    editingId = null;

    constructor({ api, ui, storage }) {
        this.#api = api;
        this.#ui = ui;
        this.#storage = storage;
        this.#loadSettings();
    }

    async init() {
        this.#bindEvents();

        this.#resetTransactionForm();

        await this.#guard(() => this.#refreshCategories());
        this.#ui.renderFilters(this.filters);
        await this.#guard(() => this.#refreshTransactions());
    }

    #bindEvents() {
        const ui = this.#ui;

        ui.bindOpenTransaction(() => ui.openTransactionDialog());
        ui.bindOpenCategory(() => ui.openCategoryDialog());
        ui.bindTransactionSubmit(() => this.#onTransactionSubmit());
        ui.bindCategorySubmit(() => this.#onCategorySubmit());
        ui.bindFormTypeChange(() => this.#renderCategories());
        ui.bindFiltersChange(() => this.#onFiltersChange());
        ui.bindFiltersReset(() => this.#onFiltersReset());
        ui.bindTransactionDialogClosed(() => this.#resetTransactionForm());
        ui.bindTransactionActions({
            onEdit: (id) => this.#onEdit(id),
            onDelete: (id) => this.#onDelete(id)
        });
    }

    async #onTransactionSubmit() {
        const result = this.#validateTransaction(this.#ui.transactionFormValues());
        this.#ui.showTransactionErrors(result.errors);
        if (!result.valid) return;

        const wasEditing = this.editingId !== null;
        const saved = await this.#guard(async () => {
            if (wasEditing) await this.#api.updateTransaction(this.editingId, result.data);
            else await this.#api.createTransaction(result.data);
        });
        if (!saved) return;

        this.#ui.showMessage(wasEditing ? 'Операция обновлена' : 'Операция добавлена', 'success');
        this.#ui.closeTransactionDialog();
        await this.#guard(() => this.#refreshTransactions());
    }

    #onEdit(id) {
        const transaction = this.#findTransaction(id);
        if (!transaction) return;

        const ui = this.#ui;
        this.editingId = id;

        ui.clearTransactionErrors();
        ui.setFormType(transaction.category_type);
        ui.renderFormCategories(this.#categoriesByType(transaction.category_type));
        ui.setFormCategory(transaction.category_id);
        ui.fillTransactionForm(transaction);
        ui.setTransactionFormMode(true);
        ui.openTransactionDialog();
    }

    async #onDelete(id) {
        const transaction = this.#findTransaction(id);
        if (!transaction || !this.#ui.confirmDelete(transaction)) return;

        const wasEditing = this.editingId === id;
        const deleted = await this.#guard(async () => {
            await this.#api.deleteTransaction(id);
        });
        if (deleted) this.#ui.showMessage('Операция удалена', 'success');
        if (wasEditing) this.#resetTransactionForm();

        await this.#guard(() => this.#refreshTransactions());
    }

    async #onCategorySubmit() {
        const result = this.#validateCategory(this.#ui.categoryFormValues());
        this.#ui.showCategoryErrors(result.errors);
        if (!result.valid) return;

        let created;
        const ok = await this.#guard(async () => {
            created = await this.#api.createCategory(result.data);
            await this.#loadCategories();
        });
        if (!ok) return;

        const ui = this.#ui;
        ui.showMessage(`Категория «${created.name}» создана`, 'success');
        ui.closeCategoryDialog();

        ui.setFormType(created.type);
        this.#renderCategories();
        ui.setFormCategory(created.id);
    }

    async #onFiltersChange() {
        const filters = this.#ui.filterValues();

        if (filters.from && filters.to && filters.from > filters.to) {
            this.#ui.showMessage('Дата «с» не может быть позже даты «по»');
            return;
        }

        this.filters = { ...App.EMPTY_FILTERS, ...filters };
        this.#saveSettings();
        await this.#guard(() => this.#refreshTransactions());
    }

    async #onFiltersReset() {
        this.filters = { ...App.EMPTY_FILTERS };
        this.#saveSettings();
        this.#ui.renderFilters(this.filters);
        await this.#guard(() => this.#refreshTransactions());
    }

    async #loadCategories() {
        this.categories = await this.#api.getCategories();

        const exists = this.categories.some((c) => String(c.id) === this.filters.category_id);
        if (!exists) this.filters = { ...this.filters, category_id: '' };
    }

    async #refreshCategories() {
        await this.#loadCategories();
        this.#renderCategories();
    }

    async #refreshTransactions() {
        this.transactions = await this.#api.getTransactions(this.filters);
        this.#ui.renderTransactions(this.transactions);
        this.#ui.renderTotals(this.#totals());
    }

    #renderCategories() {
        const { type } = this.#ui.transactionFormValues();
        this.#ui.renderFormCategories(this.#categoriesByType(type));
        this.#ui.renderFilterCategories(this.categories, this.filters.category_id);
    }

    #resetTransactionForm() {
        this.editingId = null;
        this.#ui.resetTransactionForm();
        this.#renderCategories();
    }

    #totals() {
        let income = 0;
        let expense = 0;
        for (const t of this.transactions) {
            if (t.category_type === 'income') income += t.amount;
            else expense += t.amount;
        }
        return { income, expense, balance: income - expense };
    }

    #findTransaction(id) {
        return this.transactions.find((t) => t.id === id);
    }

    #categoriesByType(type) {
        return this.categories.filter((category) => category.type === type);
    }

    async #guard(action) {
        try {
            await action();
            return true;
        } catch (err) {
            this.#ui.showMessage(err.message);
            return false;
        }
    }

    #validateTransaction({ amount, categoryId, date, comment }) {
        const errors = {};
        const parsedAmount = this.#parseAmount(amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.amount = 'Введите сумму больше 0';
        if (!categoryId) errors.category = 'Выберите категорию';
        if (!date) errors.date = 'Укажите дату';

        return this.#validationResult(errors, () => ({
            amount: parsedAmount,
            category_id: Number(categoryId),
            date,
            comment: comment.trim() || null
        }));
    }

    #validateCategory({ name, type }) {
        const errors = {};
        if (!name.trim()) errors['new-category-name'] = 'Введите название категории';

        return this.#validationResult(errors, () => ({ name: name.trim(), type }));
    }

    #parseAmount(raw) {
        const normalized = raw.trim().replace(',', '.');
        return normalized === '' ? NaN : Number(normalized);
    }

    #validationResult(errors, buildData) {
        const valid = Object.keys(errors).length === 0;
        return { valid, errors, data: valid ? buildData() : null };
    }

    #loadSettings() {
        const saved = JSON.parse(this.#storage.getItem(App.SETTINGS_KEY)) ?? {};
        if (saved.filters) this.filters = { ...App.EMPTY_FILTERS, ...saved.filters };
    }

    #saveSettings() {
        this.#storage.setItem(App.SETTINGS_KEY, JSON.stringify({ filters: this.filters }));
    }
}

new App({
    api: new ApiClient('http://localhost:3001'),
    ui: new UI(document),
    storage: window.localStorage
}).init();