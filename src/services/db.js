// src/services/db.js
import { openDB } from 'idb';

export const dbPromise = openDB('quiz-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('lessons')) {
      db.createObjectStore('lessons', { keyPath: 'lessonNumber' });
    }
  },
});
