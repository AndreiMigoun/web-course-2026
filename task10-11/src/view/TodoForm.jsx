import { memo, useState } from 'react';

function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onAdd(text, status === 'completed');
    if (result.ok) {
      setText('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setError('');
  };

  return (
    <>
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="todo-input"
          placeholder="Что нужно сделать?"
          autoComplete="off"
          value={text}
          onChange={handleChange}
        />
        <select
          className="status-select"
          aria-label="Тип задачи"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Невыполненная</option>
          <option value="completed">Выполненная</option>
        </select>
        <button type="submit" className="btn btn-add">Добавить</button>
      </form>
      {error && <p className="warning">{error}</p>}
    </>
  );
}

export default memo(TodoForm);
