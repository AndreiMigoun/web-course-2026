export class TodoModel {
  constructor({ generateId, now, filters, sorts }) {
    this.generateId = generateId;
    this.now = now;
    this.filters = filters;
    this.sorts = sorts;
  }

  validate(text) {
    return text.trim() === ''
      ? { ok: false, error: 'Введите текст задачи!' }
      : { ok: true };
  }

  add(todos, text, completed = false) {
    const todo = {
      id: this.generateId(),
      text: text.trim(),
      completed,
      createdAt: this.now(),
    };
    return [...todos, todo];
  }

  toggle(todos, id) {
    return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  }

  remove(todos, id) {
    return todos.filter((t) => t.id !== id);
  }

  filter(todos, filterId) {
    const { predicate } = this.filters.find((f) => f.id === filterId);
    return todos.filter(predicate);
  }

  sort(todos, sortId) {
    const { compare } = this.sorts.find((s) => s.id === sortId);
    return [...todos].sort(compare);
  }

  stats(todos) {
    const completed = todos.filter((t) => t.completed).length;
    return { active: todos.length - completed, completed };
  }
}
