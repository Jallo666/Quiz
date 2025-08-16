// src/services/imageService.js
import { openDB } from 'idb';

const DB_NAME = 'imagesDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

const imageService = {
  async getAllImages() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async addImage(image) {
    const db = await getDB();
    const timestamp = new Date().toISOString();
    const newImage = {
      ...image,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    return db.add(STORE_NAME, newImage);
  },

  async updateImage(image) {
    const db = await getDB();
    const updatedImage = {
      ...image,
      updatedAt: new Date().toISOString(),
    };
    return db.put(STORE_NAME, updatedImage);
  },

  async deleteImage(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
  },

  async getImageById(id) {
    const db = await getDB();
    const img = await db.get(STORE_NAME, id);
    return img ? img.base64 : null;
  },
};

export default imageService;
