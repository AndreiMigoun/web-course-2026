import { memo } from 'react';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <button type="button" className="btn btn-delete" onClick={() => onDelete(todo.id)}>
        Удалить
      </button>
    </li>
  );
}

export default memo(TodoItem);
