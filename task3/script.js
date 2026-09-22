let todos = [];
let currentFilter = 'all';
let nextId = 1;

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const warning = document.getElementById('warning');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');
const filterButtons = document.querySelectorAll('.filter-btn');


function addTodo(text) {
    const newTodo = {id: nextId++, text: text, completed: false,};
    todos.push(newTodo);
    render();
}


function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    render();
}


function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    render();
} 


function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('is-active', isActive);
    });
    render();
}


function render() {
    list.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    filteredTodos.map(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) {
            li.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.className = 'todo-checkbox';
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.append(checkbox, span, deleteBtn);
        list.appendChild(li);
    });

    const activeCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;
    counter.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}


form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();

    if (text === '') {
        warning.hidden = false;
        input.focus();
        return;
    }

    warning.hidden = true;

    addTodo(text);
    input.value = ''; 
    input.focus();
});

input.addEventListener('input', () => {
    if (!warning.hidden) {
        warning.hidden = true;
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

render();