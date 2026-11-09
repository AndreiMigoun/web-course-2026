import TodoItem from './TodoItem.jsx';

/**
 * VIEW. Список задач.
 * key — уникальный id задачи (не индекс), чтобы React корректно
 * сопоставлял элементы при удалении и фильтрации.
 * @param {{ todos: Array, onToggle: Function, onDelete: Function }} props
 */
export default function TodoList({ todos, onToggle, onDelete }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
