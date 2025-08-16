import React, { useState, useEffect } from 'react';
import imageService from '../../services/imageService';

export default function ImageRepository({ value, onConfirm }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterField, setFilterField] = useState('description');
  const [filterValue, setFilterValue] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imgs = await imageService.getAllImages();
        setImages(imgs);
      } catch (err) {
        console.error('Errore nel recupero delle immagini dal repository:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) return <p className="text-indigo-500 text-sm">Caricamento repository...</p>;
  if (!images.length) return <p className="text-indigo-400 text-sm">Nessuna immagine disponibile.</p>;

  // Filtra immagini
  const filteredImages = images.filter(img => {
    if (!filterValue) return true;
    const val = filterValue.toLowerCase();
    switch (filterField) {
      case 'description':
        return (img.description || '').toLowerCase().includes(val);
      case 'id':
        return img.id.toLowerCase().includes(val);
      default:
        return true;
    }
  });

  const handleConfirm = () => {
    if (previewImage && onConfirm) onConfirm(previewImage);
    setPreviewImage(null);
  };

  return (
    <div className="w-full border border-indigo-300 rounded-lg p-2 shadow-inner">
      {/* Filtri */}
      <div className="flex gap-1 mb-2 items-center text-xs">
        <select
          value={filterField}
          onChange={e => setFilterField(e.target.value)}
          className="border border-indigo-300 rounded px-1 py-0.5 text-xs"
        >
          <option value="description">Descrizione</option>
          <option value="id">ID Immagine</option>
        </select>
        <input
          type="text"
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
          placeholder="Cerca..."
          className="border border-indigo-300 rounded px-1 py-0.5 text-xs flex-1"
        />
      </div>

      {/* Griglia compatta */}
      <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
        {filteredImages.map(img => (
          <div
            key={img.id}
            className="cursor-pointer border rounded overflow-hidden transition transform hover:scale-105"
            onClick={() => setPreviewImage(img)}
          >
            <img
              src={img.base64}
              alt={img.description || 'Immagine'}
              className="w-full h-16 object-cover"
            />
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <p className="text-center text-indigo-400 text-xs mt-1">Nessuna immagine trovata</p>
      )}

      {/* Modal di preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full flex flex-col gap-4">
            <img
              src={previewImage.base64}
              alt={previewImage.description || 'Preview'}
              className="w-full h-64 object-contain rounded"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{previewImage.description || '(nessuna descrizione)'}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  Conferma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
