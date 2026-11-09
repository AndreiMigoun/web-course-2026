import { useTodoController } from './controller/useTodoController.js';
import TodoForm from './view/TodoForm.jsx';
import Filters from './view/Filters.jsx';
import Stats from './view/Stats.jsx';
import TodoList from './view/TodoList.jsx';

export default function App() {
  const { visibleTodos, stats, filter, setFilter, addTodo, toggleTodo, deleteTodo } =
    useTodoController();

  return (
    <main className="app">
      <h1>Список задач</h1>
      <TodoForm onAdd={addTodo} />
      <Filters current={filter} onChange={setFilter} />
      <Stats active={stats.active} completed={stats.completed} />
      <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  );
}
