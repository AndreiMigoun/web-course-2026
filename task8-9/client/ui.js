export class UI {
    static TYPE_LABELS = { income: 'Доход', expense: 'Расход' };

    #doc;
    #money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN' });
    #messageTimer = null;

    constructor(doc) {
        this.#doc = doc;
        this.#setupDialogs();
    }

    bindOpenTransaction(handler) {
        this.#$('open-transaction-btn').addEventListener('click', () => handler());
    }

    bindOpenCategory(handler) {
        this.#$('open-category-btn').addEventListener('click', () => handler());
    }

    bindTransactionSubmit(handler) {
        this.#$('transaction-form').addEventListener('submit', (event) => {
            event.preventDefault();
            handler();
        });
    }

    bindCategorySubmit(handler) {
        this.#$('category-form').addEventListener('submit', (event) => {
            event.preventDefault();
            handler();
        });
    }

    bindFormTypeChange(handler) {
        this.#$('type').addEventListener('change', () => handler());
    }

    bindFiltersChange(handler) {
        this.#$('filters-form').addEventListener('change', () => handler());
    }

    bindFiltersReset(handler) {
        this.#$('filters-reset').addEventListener('click', () => handler());
    }

    bindTransactionDialogClosed(handler) {
        this.#$('transaction-dialog').addEventListener('close', () => handler());
    }

    bindTransactionActions({ onEdit, onDelete }) {
        this.#$('transactions').addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;

            const id = Number(button.closest('li').dataset.id);
            if (button.dataset.action === 'edit') onEdit(id);
            else onDelete(id);
        });
    }

    transactionFormValues() {
        return {
            amount: this.#$('amount').value,
            type: this.#$('type').value,
            categoryId: this.#$('category').value,
            date: this.#$('date').value,
            comment: this.#$('comment').value
        };
    }

    categoryFormValues() {
        return {
            name: this.#$('new-category-name').value,
            type: this.#$('new-category-type').value
        };
    }

    filterValues() {
        return {
            category_id: this.#$('filter-category').value,
            type: this.#$('filter-type').value,
            from: this.#$('filter-from').value,
            to: this.#$('filter-to').value
        };
    }

    renderFormCategories(categories) {
        this.#renderOptions(this.#$('category'), categories, 'Выберите категорию');
    }

    renderFilterCategories(categories, selectedId) {
        const select = this.#$('filter-category');
        this.#renderOptions(select, categories, 'Все категории', true);
        select.value = selectedId;
    }

    renderFilters(filters) {
        this.#$('filter-category').value = filters.category_id;
        this.#$('filter-type').value = filters.type;
        this.#$('filter-from').value = filters.from;
        this.#$('filter-to').value = filters.to;
    }

    renderTransactions(transactions) {
        const list = this.#$('transactions');
        list.replaceChildren();

        if (transactions.length === 0) {
            const empty = this.#create('li', 'empty');
            empty.append(this.#create('strong', undefined, 'Операций не найдено'));
            empty.append(this.#create('span', undefined, 'Добавьте первую операцию или измените фильтры'));
            list.append(empty);
            return;
        }

        for (const t of transactions) {
            list.append(this.#createTransactionItem(t));
        }
    }

    renderTotals({ income, expense, balance }) {
        this.#$('sum-income').textContent = this.#money.format(income);
        this.#$('sum-expense').textContent = this.#money.format(expense);
        this.#$('sum-balance').textContent = this.#money.format(balance);
    }

    setFormType(type) {
        this.#$('type').value = type;
    }

    setFormCategory(categoryId) {
        this.#$('category').value = categoryId;
    }

    fillTransactionForm(transaction) {
        this.#$('amount').value = transaction.amount;
        this.#$('date').value = transaction.date;
        this.#$('comment').value = transaction.comment ?? '';
    }

    resetTransactionForm() {
        const form = this.#$('transaction-form');
        form.reset();
        this.#$('date').value = this.#todayISO();
        this.#clearErrors(form);
        this.setTransactionFormMode(false);
    }

    setTransactionFormMode(editing) {
        this.#$('form-title').textContent = editing ? 'Редактирование операции' : 'Новая операция';
        this.#$('submit-btn').textContent = editing ? 'Сохранить' : 'Добавить';
    }

    showTransactionErrors(errors) {
        this.#showErrors(this.#$('transaction-form'), errors);
    }

    clearTransactionErrors() {
        this.#clearErrors(this.#$('transaction-form'));
    }

    showCategoryErrors(errors) {
        this.#showErrors(this.#$('category-form'), errors);
    }

    openTransactionDialog() {
        this.#$('transaction-dialog').showModal();
        this.#$('amount').focus();
    }

    closeTransactionDialog() {
        this.#$('transaction-dialog').close();
    }

    openCategoryDialog() {
        this.#$('category-dialog').showModal();
        this.#$('new-category-name').focus();
    }

    closeCategoryDialog() {
        this.#$('category-dialog').close();
    }

    showMessage(text, kind = 'error') {
        const box = this.#$('message');
        box.textContent = text;
        box.className = `message message--${kind}`;
        box.showPopover();

        clearTimeout(this.#messageTimer);
        this.#messageTimer = setTimeout(() => this.#hideMessage(), kind === 'error' ? 8000 : 3000);
    }

    confirmDelete(transaction) {
        const text = `Удалить операцию «${transaction.category_name}» на ${this.#money.format(transaction.amount)}?`;
        return this.#doc.defaultView.confirm(text);
    }

    #$(id) {
        return this.#doc.getElementById(id);
    }

    #create(tag, className, text) {
        const node = this.#doc.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    #setupDialogs() {
        for (const button of this.#doc.querySelectorAll('[data-close]')) {
            button.addEventListener('click', () => button.closest('dialog').close());
        }

        for (const id of ['transaction-dialog', 'category-dialog']) {
            const dialog = this.#$(id);
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) dialog.close();
            });
        }

        this.#$('category-dialog').addEventListener('close', () => {
            const form = this.#$('category-form');
            form.reset();
            this.#clearErrors(form);
        });
    }

    #hideMessage() {
        this.#$('message').hidePopover();
    }

    #renderOptions(select, categories, placeholder, withType = false) {
        const previous = select.value;
        select.replaceChildren(new Option(placeholder, ''));

        for (const category of categories) {
            const label = withType
                ? `${category.name} (${UI.TYPE_LABELS[category.type].toLowerCase()})`
                : category.name;
            select.append(new Option(label, category.id));
        }

        if ([...select.options].some((o) => o.value === previous)) {
            select.value = previous;
        }
    }

    #createTransactionItem(t) {
        const item = this.#create('li', `transaction transaction--${t.category_type}`);
        item.dataset.id = t.id;

        const avatar = this.#create('div', 'transaction__avatar', t.category_name.trim().charAt(0).toUpperCase() || '?');

        const main = this.#create('div', 'transaction__main');
        main.append(this.#create('span', 'transaction__category', t.category_name));
        const meta = t.comment ? `${this.#formatDate(t.date)} · ${t.comment}` : this.#formatDate(t.date);
        main.append(this.#create('span', 'transaction__meta', meta));

        const sign = t.category_type === 'income' ? '+' : '−';
        const amount = this.#create('div', 'transaction__amount', `${sign}${this.#money.format(t.amount)}`);

        const actions = this.#create('div', 'transaction__actions');
        actions.append(
            this.#createActionButton('edit', 'Изменить', 'btn btn--small'),
            this.#createActionButton('delete', 'Удалить', 'btn btn--small btn--danger')
        );

        item.append(avatar, main, amount, actions);
        return item;
    }

    #createActionButton(action, label, className) {
        const button = this.#create('button', className, label);
        button.type = 'button';
        button.dataset.action = action;
        return button;
    }

    #showErrors(form, errors) {
        this.#clearErrors(form);
        for (const [name, text] of Object.entries(errors)) {
            const node = form.querySelector(`[data-error-for="${name}"]`);
            if (node) node.textContent = text;
        }
    }

    #clearErrors(form) {
        for (const node of form.querySelectorAll('[data-error-for]')) {
            node.textContent = '';
        }
    }

    #formatDate(iso) {
        const [y, m, d] = iso.split('-');
        return `${d}.${m}.${y}`;
    }

    #todayISO() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }
}