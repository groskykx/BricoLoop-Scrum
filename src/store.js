import { seed as defaultSeed } from './seed.js';

// Stockage en mémoire. Chaque appel renvoie un store neuf :
// les tests ne se marchent jamais dessus.
export function createStore(seed = defaultSeed) {
  const data = structuredClone(seed);
  let sequence = 100;

  return {
    users: data.users ?? [],
    tools: data.tools ?? [],
    loans: data.loans ?? [],
    nextId(prefix) {
      sequence += 1;
      return `${prefix}${sequence}`;
    },
  };
}
