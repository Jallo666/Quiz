import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import imageService from '../../services/imageService';
export default function ImageUploader({ onUploaded }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gestione drag & drop
    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleFile = (f) => {
        if (!f) return;
        if (!f.type.startsWith('image/')) {
            setError('Il file deve essere un’immagine');
            return;
        }
        setError('');
        setFile(f);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleInputChange = (e) => {
        const f = e.target.files[0];
        handleFile(f);
    };

    const handleConfirm = async () => {
        if (!file) return;
        setLoading(true);
        const newImage = {
            id: uuidv4(),
            description: '',
            base64: preview,
            questions: [],
            answers: [],
        };
        try {
            await imageService.addImage(newImage);
            if (onUploaded && typeof onUploaded === 'function') {
                onUploaded(newImage.id); // restituisco l'id
            }
            setFile(null);
            setPreview(null);
        } catch (err) {
            setError('Errore durante il caricamento');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-dashed border-2 border-blue-400 p-6 text-center cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
            >
                {preview ? (
                    <img src={preview} alt="preview" className="mx-auto max-h-48 object-contain" />
                ) : (
                    <p>Trascina qui un'immagine o clicca per selezionarla</p>
                )}
            </div>

            <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {preview && (
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    {loading ? 'Caricamento...' : 'Conferma'}
                </button>
            )}
        </div>
    );
}
