import { FILTERS } from '../model/todoModel.js';

const OPTIONS = [
  { value: FILTERS.ALL, label: 'Все' },
  { value: FILTERS.ACTIVE, label: 'Активные' },
  { value: FILTERS.COMPLETED, label: 'Завершённые' },
];

/**
 * VIEW. Кнопки фильтра.
 * @param {{ current: string, onChange: (filter: string) => void }} props
 */
export default function Filters({ current, onChange }) {
  return (
    <div className="filters">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`filter-btn${current === value ? ' is-active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
