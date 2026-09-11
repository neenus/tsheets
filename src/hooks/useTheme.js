import { useEffect, useState } from 'react';
import { THEME_COLORS, THEME_STORAGE_KEY, parseTheme, resolveTheme } from '../lib/theme.js';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

const readSaved = () => {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
};

// Light/dark theme: follows the device until the user picks one, then remembers that choice.
export const useTheme = () => {
  const [saved, setSaved] = useState(readSaved);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);
  const theme = resolveTheme(saved, systemDark);

  useEffect(() => {
    const query = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setSaved(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice still applies until the page is closed
    }
  };

  return { theme, toggleTheme };
};
