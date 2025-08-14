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
  // Recupera tutte le immagini
  async getAllImages() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  // Aggiunge una nuova immagine
  async addImage(image) {
    const db = await getDB();
    return db.add(STORE_NAME, image);
  },

  // Aggiorna un’immagine esistente
  async updateImage(image) {
    const db = await getDB();
    return db.put(STORE_NAME, image);
  },

  // Cancella un’immagine tramite ID
  async deleteImage(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
  },
};

export default imageService;
