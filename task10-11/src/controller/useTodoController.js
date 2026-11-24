import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDependencies } from '../di/DependencyContext.jsx';

export function useTodoController() {
  const { todoModel, todoStorage } = useDependencies();

  const [todos, setTodos] = useState(() => todoStorage.load());
  const [filterId, setFilterId] = useState(todoModel.filters[0].id);
  const [sortId, setSortId] = useState(todoModel.sorts[0].id);

  useEffect(() => {
    todoStorage.save(todos);
  }, [todos, todoStorage]);

  const addTodo = useCallback((text, completed) => {
    const result = todoModel.validate(text);
    if (result.ok) setTodos((prev) => todoModel.add(prev, text, completed));
    return result;
  }, [todoModel]);

  const toggleTodo = useCallback(
    (id) => setTodos((prev) => todoModel.toggle(prev, id)),
    [todoModel]
  );

  const deleteTodo = useCallback(
    (id) => setTodos((prev) => todoModel.remove(prev, id)),
    [todoModel]
  );

  const visibleTodos = useMemo(
    () => todoModel.sort(todoModel.filter(todos, filterId), sortId),
    [todoModel, todos, filterId, sortId]
  );

  const stats = useMemo(() => todoModel.stats(todos), [todoModel, todos]);

  return {
    visibleTodos, stats,
    filters: todoModel.filters, filterId, setFilterId,
    sorts: todoModel.sorts, sortId, setSortId,
    addTodo, toggleTodo, deleteTodo,
  };
}
