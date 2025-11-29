/**
 * Application-wide constants
 * Centralized configuration for magic numbers and strings
 */

// Toast message durations (milliseconds)
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

// SyncManager delays
export const SYNC_DELAY_MS = 2000;

// Default form values
export const DEFAULT_PERSONNEL = {
  role: 'Worker',
  count: 1,
} as const;

export const DEFAULT_EQUIPMENT = {
  type: 'Excavator',
  count: 1,
  hours: 8,
} as const;

export const DEFAULT_MATERIALS = {
  name: 'Concrete',
  quantity: 10,
  unit: 'cubic meters',
} as const;
