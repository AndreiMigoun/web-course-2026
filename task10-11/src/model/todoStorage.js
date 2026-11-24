export function createMemoryStorage(initial = []) {
  let data = initial;
  return {
    load: () => data,
    save: (todos) => {
      data = todos;
    },
  };
}

export function createLocalStorageStorage(key = 'todos') {
  return {
    load: () => JSON.parse(localStorage.getItem(key)) ?? [],
    save: (todos) => localStorage.setItem(key, JSON.stringify(todos)),
  };
}
