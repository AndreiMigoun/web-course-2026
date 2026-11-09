/**
 * MODEL — предметная логика задач. Ничего не знает о React и DOM.
 * Все методы чистые: принимают массив и возвращают новый.
 * Генератор id приходит снаружи (DI).
 */

export const FILTERS = Object.freeze({
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
});

export class TodoModel {
  /** @param {{ generateId: () => (string|number) }} deps */
  constructor({ generateId }) {
    this.generateId = generateId;
  }

  /** @returns {{ ok: boolean, error?: string }} */
  validate(text) {
    if (text.trim() === '') return { ok: false, error: 'Введите текст задачи!' };
    return { ok: true };
  }

  add(todos, text) {
    const todo = { id: this.generateId(), text: text.trim(), completed: false };
    return [...todos, todo];
  }

  toggle(todos, id) {
    return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  }

  remove(todos, id) {
    return todos.filter((t) => t.id !== id);
  }

  filter(todos, filter) {
    if (filter === FILTERS.ACTIVE) return todos.filter((t) => !t.completed);
    if (filter === FILTERS.COMPLETED) return todos.filter((t) => t.completed);
    return todos;
  }

  stats(todos) {
    const completed = todos.filter((t) => t.completed).length;
    return { active: todos.length - completed, completed };
  }
}
