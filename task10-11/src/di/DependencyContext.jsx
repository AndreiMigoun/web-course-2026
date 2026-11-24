import { createContext, useContext } from 'react';

const DependencyContext = createContext(null);

export function DependencyProvider({ dependencies, children }) {
  return (
    <DependencyContext value={dependencies}>
      {children}
    </DependencyContext>
  );
}

export const useDependencies = () => useContext(DependencyContext);
