import { memo } from 'react';

function SortSelect({ options, current, onChange }) {
  return (
    <label className="sort">
      Сортировка:
      <select className="sort-select" value={current} onChange={(e) => onChange(e.target.value)}>
        {options.map(({ id, label }) => (
          <option key={id} value={id}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export default memo(SortSelect);
