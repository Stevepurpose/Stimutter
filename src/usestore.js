// useStore.js
import { useReducer, useEffect } from 'react';

export function useStore(eventStore) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    // Subscribe to store's change event
    const handleChange = () => {
      forceUpdate(); // Trigger re-render
    };
    const delist = eventStore.enlist(handleChange);
    return () => delist(); // Clean up
  }, [eventStore]);

  return  eventStore.getState(); // Return current state
}