import { useEffect, useState } from 'react';
import { createEntry, loadSchedule } from '../lib/timesheet.js';

const STORAGE_KEY = 'tsheets:schedule';

const today = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const readSaved = () => {
  try {
    return loadSchedule(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // storage blocked (e.g. some private modes)
  }
};

// The schedule (name + entries), kept in localStorage so it survives a refresh.
export const useSchedule = () => {
  const [schedule, setSchedule] = useState(() => readSaved() ?? { name: '', entries: [createEntry(undefined, today())] });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    } catch {
      // storage full or blocked: the app keeps working, it just won't remember
    }
  }, [schedule]);

  const setEntries = (update) => setSchedule((current) => ({ ...current, entries: update(current.entries) }));

  return {
    ...schedule,
    setName: (name) => setSchedule((current) => ({ ...current, name })),
    addEntry: () => setEntries((entries) => [...entries, createEntry(entries.at(-1), today())]),
    updateEntry: (id, changes) =>
      setEntries((entries) => entries.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))),
    removeEntry: (id) => setEntries((entries) => entries.filter((entry) => entry.id !== id)),
    clearEntries: () => setEntries(() => [createEntry(undefined, today())]),
  };
};
