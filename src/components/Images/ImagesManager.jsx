import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import imageService from '../../services/imageService';

const MAX_DB_SIZE_MB = 5;

export default function ImagesManager() {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [message, setMessage] = useState('');
  const [editFields, setEditFields] = useState({
    description: '',
    questions: '',
    answers: ''
  });

  // Carica immagini dal DB all'avvio
  useEffect(() => {
    async function loadImages() {
      const allImages = await imageService.getAllImages();
      setImages(allImages);
    }
    loadImages();
  }, []);

  // Aggiorna i campi dell'editor quando si seleziona un'immagine
  const selectedImage = images.find(i => i.id === selectedImageId);
  useEffect(() => {
    if (selectedImage) {
      setEditFields({
        description: selectedImage.description,
        questions: selectedImage.questions.join(','),
        answers: selectedImage.answers.join(',')
      });
    } else {
      setEditFields({ description: '', questions: '', answers: '' });
    }
  }, [selectedImage]);

  const usedMB = Number((JSON.stringify(images).length / (1024 * 1024)).toFixed(3));
  const freeMB = (MAX_DB_SIZE_MB - usedMB).toFixed(3);

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const newImage = {
        id: uuidv4(),
        description: '',
        base64: reader.result,
        questions: [],
        answers: [],
      };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      setSelectedImageId(newImage.id);
      await imageService.addImage(newImage); 
      showMessage('Immagine importata con successo');
    };
    reader.readAsDataURL(file);
  }

  function handleSelectImage(id) {
    setSelectedImageId(id);
  }

  async function handleSaveChanges() {
    if (!selectedImage) return;

    const updates = {
      description: editFields.description,
      questions: editFields.questions.split(',').map(s => s.trim()).filter(Boolean),
      answers: editFields.answers.split(',').map(s => s.trim()).filter(Boolean),
    };

    const updatedImages = images.map(img =>
      img.id === selectedImage.id ? { ...img, ...updates } : img
    );

    setImages(updatedImages);
    await imageService.updateImage({ ...selectedImage, ...updates });
    showMessage('Modifiche salvate');
  }

  async function handleDeleteSelected() {
    if (!selectedImageId) return;
    await imageService.deleteImage(selectedImageId);
    const updatedImages = images.filter(img => img.id !== selectedImageId);
    setImages(updatedImages);
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

  function handleExportImage() {
    const img = images.find(i => i.id === selectedImageId);
    if (!img) return;

    const a = document.createElement('a');
    a.href = img.base64;
    a.download = (img.description || 'exported_image') + '.png';
    a.click();
  }

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <div className="p-6 w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg border border-blue-300 shadow-lg flex gap-6">
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

        <ul className="list-none max-h-[400px] overflow-y-auto border border-blue-300 rounded p-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          {images.length > 0 ? (
            images.map(img => (
              <li
                key={img.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer
                  hover:bg-blue-200
                  ${selectedImageId === img.id ? 'bg-blue-300 font-semibold' : 'bg-white'}
                `}
                onClick={() => handleSelectImage(img.id)}
              >
                <img src={img.base64} alt="" className="w-16 h-16 object-cover rounded" />
                <span className="flex-1">{img.description || '(nessuna descrizione)'}</span>
              </li>
            ))
          ) : (
            <li className="text-center text-blue-400 select-none">Nessuna immagine importata</li>
          )}
        </ul>

        <div className="mt-2 text-blue-800 font-medium">
          <p>Immagini: {images.length}</p>
          <p>Spazio usato: {usedMB} MB</p>
          <p>Spazio libero stimato: {freeMB > 0 ? freeMB : 0} MB</p>
        </div>
      </div>

      {/* Colonna di recap / editor */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        {selectedImage ? (
          <div className="p-4 border border-blue-300 rounded flex flex-col gap-3 bg-white shadow-sm">
            <h3 className="font-semibold text-blue-700">Dettagli Immagine</h3>
            <img
              src={selectedImage.base64}
              alt=""
              className="w-full h-48 object-contain border border-gray-300 rounded"
            />

            <label className="text-sm text-blue-800">Descrizione</label>
            <input
              type="text"
              value={editFields.description}
              onChange={e => setEditFields({ ...editFields, description: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1"
              placeholder="Facoltativa"
            />

            <label className="text-sm text-blue-800">Domande (ID)</label>
            <input
              type="text"
              value={editFields.questions}
              onChange={e => setEditFields({ ...editFields, questions: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1"
              placeholder="Facoltativo, separa con virgola"
            />

            <label className="text-sm text-blue-800">Risposte (ID)</label>
            <input
              type="text"
              value={editFields.answers}
              onChange={e => setEditFields({ ...editFields, answers: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1"
              placeholder="Facoltativo, separa con virgola"
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveChanges}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md transition"
              >
                Salva Modifiche
              </button>
              <button
                onClick={handleExportImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition"
              >
                Esporta Immagine
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-blue-300 rounded bg-white text-blue-400 text-center">
            Seleziona un'immagine per vedere i dettagli
          </div>
        )}
      </div>
    </div>
  );
}
