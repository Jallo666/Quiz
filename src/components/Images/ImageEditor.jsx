import React, { useState, useEffect } from 'react';
import imageService from '../../services/imageService';

export default function ImageEditor({ selectedImage, setImages, showMessage }) {
  const [editFields, setEditFields] = useState({ description: '', questions: '', answers: '' });

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

  async function handleSaveChanges() {
    if (!selectedImage) return;

    const updates = {
      description: editFields.description,
      questions: editFields.questions.split(',').map(s => s.trim()).filter(Boolean),
      answers: editFields.answers.split(',').map(s => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };

    setImages(prev => prev.map(img =>
      img.id === selectedImage.id ? { ...img, ...updates } : img
    ));
    await imageService.updateImage({ ...selectedImage, ...updates });
    showMessage('Modifiche salvate');
  }

  function handleExportImage() {
    if (!selectedImage) return;
    const a = document.createElement('a');
    a.href = selectedImage.base64;
    a.download = (selectedImage.description || 'exported_image') + '.png';
    a.click();
  }

  if (!selectedImage) {
    return <div className="p-4 border border-blue-300 rounded bg-white text-blue-400 text-center">
      Seleziona un'immagine per vedere i dettagli
    </div>;
  }

  return (
    <div className="p-4 border border-blue-300 rounded flex flex-col gap-3 bg-white shadow-sm">
      <h3 className="font-semibold text-blue-700">Dettagli Immagine</h3>
      <img
        src={selectedImage.base64}
        alt=""
        className="w-full h-48 object-contain border border-gray-300 rounded"
      />

      {/* Timestamp */}
      <div className="text-xs text-gray-500 flex flex-col gap-1 mb-2">
        <span>Caricata il: {new Date(selectedImage.createdAt).toLocaleString()}</span>
        <span>Ultima modifica: {new Date(selectedImage.updatedAt).toLocaleString()}</span>
      </div>

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
  );
}
