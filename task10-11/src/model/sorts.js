const byText = (a, b) => a.text.localeCompare(b.text, 'ru');

export const sorts = [
  { id: 'date-asc', label: 'Сначала старые', compare: (a, b) => a.createdAt - b.createdAt },
  { id: 'date-desc', label: 'Сначала новые', compare: (a, b) => b.createdAt - a.createdAt },
  { id: 'alpha-asc', label: 'По алфавиту (А → Я)', compare: byText },
  { id: 'alpha-desc', label: 'По алфавиту (Я → А)', compare: (a, b) => byText(b, a) },
];
