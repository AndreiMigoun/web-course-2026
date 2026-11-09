import { useState } from 'react';

/**
 * VIEW. Поле ввода + кнопка.
 * Локальное состояние — только текст поля и сообщение (состояние интерфейса).
 * Валидацию выполняет модель через onAdd.
 * @param {{ onAdd: (text: string) => { ok: boolean, error?: string } }} props
 */
export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onAdd(text);
    if (result.ok) {
      setText('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (error) setError('');
  };

  return (
    <>
      <form className="todo-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          className="todo-input"
          placeholder="Что нужно сделать?"
          autoComplete="off"
          value={text}
          onChange={handleChange}
        />
        <button type="submit" className="btn btn-add">Добавить</button>
      </form>
      {error && <p className="warning">{error}</p>}
    </>
  );
}
