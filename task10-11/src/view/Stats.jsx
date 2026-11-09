/**
 * VIEW. Счётчики.
 * @param {{ active: number, completed: number }} props
 */
export default function Stats({ active, completed }) {
  return <p className="counter">Осталось: {active}, Выполнено: {completed}</p>;
}
