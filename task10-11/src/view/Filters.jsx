import { memo } from 'react';

function Filters({ options, current, onChange }) {
  return (
    <div className="filters">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`filter-btn${current === id ? ' is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default memo(Filters);
