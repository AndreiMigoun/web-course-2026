export const filters = [
  { id: 'all', label: 'Все', predicate: () => true },
  { id: 'active', label: 'Активные', predicate: (todo) => !todo.completed },
  { id: 'completed', label: 'Завершённые', predicate: (todo) => todo.completed },
];
