import { describe, expect, test } from 'vitest';
import { parseTheme, resolveTheme } from './theme.js';

describe('parseTheme', () => {
  test('accepts a saved light or dark choice', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
  });

  test('ignores anything else', () => {
    expect(parseTheme(null)).toBeNull();
    expect(parseTheme('purple')).toBeNull();
  });
});

describe('resolveTheme', () => {
  test('uses the saved choice over the system setting', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  test('follows the system setting when nothing is saved', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
});
