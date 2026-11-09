import { createContext, useContext } from 'react';

const DependencyContext = createContext(null);

export function DependencyProvider({ dependencies, children }) {
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies() {
  const deps = useContext(DependencyContext);
  if (!deps) throw new Error('useDependencies нужно вызывать внутри <DependencyProvider>');
  return deps;
}
