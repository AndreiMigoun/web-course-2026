import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDependencies } from '../di/DependencyContext.jsx';
import { FILTERS } from '../model/todoModel.js';

/**
 * CONTROLLER — связывает View и Model.
 * Хранит состояние (useState), обрабатывает действия пользователя,
 * делегирует бизнес-логику модели и сохранение — хранилищу.
 * Модель и хранилище получает через DI, а не создаёт сам.
 */
export function useTodoController() {
  const { todoModel, todoStorage } = useDependencies();

  const [todos, setTodos] = useState(() => todoStorage.load());
  const [filter, setFilter] = useState(FILTERS.ALL);

  // Синхронизация с хранилищем при каждом изменении списка
  useEffect(() => {
    todoStorage.save(todos);
  }, [todos, todoStorage]);

  /** @returns {{ ok: boolean, error?: string }} */
  const addTodo = useCallback((text) => {
    const result = todoModel.validate(text);
    if (result.ok) setTodos((prev) => todoModel.add(prev, text));
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

  const visibleTodos = useMemo(() => todoModel.filter(todos, filter), [todoModel, todos, filter]);
  const stats = useMemo(() => todoModel.stats(todos), [todoModel, todos]);

  return { visibleTodos, stats, filter, setFilter, addTodo, toggleTodo, deleteTodo };
}
