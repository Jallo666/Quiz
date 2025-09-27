import { openDB } from "idb";

const DB_NAME = "statisticsDB";
const STORE_NAME = "quizResults";
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

const statisticService = {
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async addResult(result) {
    const db = await getDB();
    const timestamp = new Date().toISOString();
    const newResult = {
      ...result,          // es. { lessonId, results, percentage }
      createdAt: timestamp,
    };
    return db.add(STORE_NAME, newResult);
  },

  async deleteResult(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
  },

  async clearAll() {
    const db = await getDB();
    return db.clear(STORE_NAME);
  },
};

export default statisticService;
