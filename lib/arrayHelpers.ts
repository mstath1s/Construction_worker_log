/**
 * Utility functions for managing form arrays
 * Provides reusable logic for adding/removing/updating array items
 */

/**
 * Adds a new item to an array
 */
export function addArrayItem<T>(array: T[], newItem: T): T[] {
  return [...array, newItem];
}

/**
 * Removes an item from an array by index
 */
export function removeArrayItem<T>(array: T[], index: number): T[] {
  return array.filter((_, i) => i !== index);
}

/**
 * Updates an item in an array by index
 */
export function updateArrayItem<T>(array: T[], index: number, updates: Partial<T>): T[] {
  return array.map((item, i) => (i === index ? { ...item, ...updates } : item));
}

/**
 * Generic hook for managing array state in forms
 */
export function useArrayField<T>(initialValue: T[] = []) {
  const add = (array: T[], item: T) => addArrayItem(array, item);
  const remove = (array: T[], index: number) => removeArrayItem(array, index);
  const update = (array: T[], index: number, updates: Partial<T>) =>
    updateArrayItem(array, index, updates);

  return { add, remove, update };
}
