import React from 'react';

interface ArrayFieldManagerProps<T> {
  title: string;
  items: T[];
  onAdd: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addButtonText: string;
}

/**
 * Generic component for managing array fields in forms
 * Handles rendering list items and add button
 */
export function ArrayFieldManager<T>({
  title,
  items,
  onAdd,
  renderItem,
  addButtonText,
}: ArrayFieldManagerProps<T>) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {addButtonText}
        </button>
      </div>
    </div>
  );
}
