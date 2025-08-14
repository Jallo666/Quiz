// src/services/imageService.js
import { openDB } from 'idb';

const DB_NAME = 'imagesDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

// Funzione per aprire il DB e creare lo store se non esiste
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
    return db.add(STORE_NAME, image);
  },

  async updateImage(image) {
    const db = await getDB();
    return db.put(STORE_NAME, image);
  },

  async deleteImage(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
  },

  // Recupera un’immagine tramite ID e ritorna il base64
  async getImageById(id) {
    const db = await getDB();
    const img = await db.get(STORE_NAME, id);
    return img ? img.base64 : null;
  },
};

export default imageService;
