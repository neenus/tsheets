// Keep in sync with the inline script in index.html, which applies the theme before first paint.
export const THEME_STORAGE_KEY = 'tsheets:theme';

export const THEME_COLORS = { light: '#f3f4f9', dark: '#10121b' };

export const parseTheme = (raw) => (raw === 'light' || raw === 'dark' ? raw : null);

// A saved choice wins; without one the app follows the device setting.
export const resolveTheme = (saved, systemPrefersDark) => saved ?? (systemPrefersDark ? 'dark' : 'light');
