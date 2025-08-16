import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import imageService from '../../services/imageService';
import ImageList from './ImageList';
import ImageFilterSort from './ImageFilterSort';
import ImageEditor from './ImageEditor';

const MAX_DB_SIZE_MB = 5;

export default function ImagesManager() {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [message, setMessage] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterField, setFilterField] = useState('description');
  const [filterValue, setFilterValue] = useState('');

  // Carica immagini dal DB
  useEffect(() => {
    async function loadImages() {
      const allImages = await imageService.getAllImages();
      setImages(allImages);
    }
    loadImages();
  }, []);

  const selectedImage = images.find(i => i.id === selectedImageId);
  const usedMB = Number((JSON.stringify(images).length / (1024 * 1024)).toFixed(3));
  const freeMB = (MAX_DB_SIZE_MB - usedMB).toFixed(3);

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteSelected() {
    if (!selectedImageId) return;
    await imageService.deleteImage(selectedImageId);
    setImages(images.filter(img => img.id !== selectedImageId));
    setSelectedImageId(null);
    showMessage('Immagine cancellata');
  }

  async function handleDeleteAll() {
    for (const img of images) {
      await imageService.deleteImage(img.id);
    }
    setImages([]);
    setSelectedImageId(null);
    showMessage('Tutte le immagini cancellate');
  }


  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const timestamp = new Date().toISOString();
      const newImage = {
        id: uuidv4(),
        description: '',
        base64: reader.result,
        questions: [],
        answers: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      setSelectedImageId(newImage.id);
      await imageService.addImage(newImage);
      showMessage('Immagine importata con successo');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="p-6 w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg border border-blue-300 shadow-lg flex flex-col lg:flex-row gap-6">
      {/* Colonna principale */}
      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-blue-700">Gestione Immagini</h2>
        {message && <p className="text-green-600">{message}</p>}

        <div className="mb-2 flex gap-2">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition inline-flex items-center gap-2">
            <span>Importa Immagine</span>
            <input type="file" accept="image/*" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md transition"
            disabled={!selectedImageId}
          >
            Cancella Immagine
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded shadow-md transition"
            disabled={images.length === 0}
          >
            Cancella Tutte
          </button>
        </div>

        <ImageFilterSort
          sortField={sortField} setSortField={setSortField}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          filterField={filterField} setFilterField={setFilterField}
          filterValue={filterValue} setFilterValue={setFilterValue}
        />

        <ImageList
          images={images}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
          sortField={sortField}
          sortOrder={sortOrder}
          filterField={filterField}
          filterValue={filterValue}
        />

        <div className="mt-2 text-blue-800 font-medium">
          <p>Immagini: {images.length}</p>
          <p>Spazio usato: {usedMB} MB</p>
          <p>Spazio libero stimato: {freeMB > 0 ? freeMB : 0} MB</p>
        </div>
      </div>

      {/* Colonna editor */}
      <div className="flex-shrink-0 w-full lg:w-80">
        <ImageEditor
          selectedImage={selectedImage}
          setImages={setImages}
          showMessage={showMessage}
        />
      </div>
    </div>
  );
}
