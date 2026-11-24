import { useTodoController } from './controller/useTodoController.js';
import TodoForm from './view/TodoForm.jsx';
import Filters from './view/Filters.jsx';
import SortSelect from './view/SortSelect.jsx';
import Stats from './view/Stats.jsx';
import TodoList from './view/TodoList.jsx';

export default function App() {
  const {
    visibleTodos, stats,
    filters, filterId, setFilterId,
    sorts, sortId, setSortId,
    addTodo, toggleTodo, deleteTodo,
  } = useTodoController();

  return (
    <main className="app">
      <h1>Список задач</h1>
      <TodoForm onAdd={addTodo} />
      <div className="toolbar">
        <Filters options={filters} current={filterId} onChange={setFilterId} />
        <SortSelect options={sorts} current={sortId} onChange={setSortId} />
      </div>
      <Stats active={stats.active} completed={stats.completed} />
      <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  );
}
