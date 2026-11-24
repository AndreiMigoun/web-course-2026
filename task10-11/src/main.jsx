import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DependencyProvider } from './di/DependencyContext.jsx';
import { TodoModel } from './model/todoModel.js';
import { filters } from './model/filters.js';
import { sorts } from './model/sorts.js';
import { createLocalStorageStorage } from './model/todoStorage.js';

const dependencies = {
  todoModel: new TodoModel({
    generateId: () => crypto.randomUUID(),
    now: () => Date.now(),
    filters,
    sorts,
  }),
  todoStorage: createLocalStorageStorage(),
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DependencyProvider dependencies={dependencies}>
      <App />
    </DependencyProvider>
  </StrictMode>
);
