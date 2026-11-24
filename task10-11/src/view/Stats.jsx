import { memo } from 'react';

function Stats({ active, completed }) {
  return <p className="counter">Осталось: {active}, Выполнено: {completed}</p>;
}

export default memo(Stats);
