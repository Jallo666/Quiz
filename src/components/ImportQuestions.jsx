import React, { useState } from 'react';
import questionService from '../services/questionService';

export default function ImportQuestions() {
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);

        if (!Array.isArray(json)) {
          setMessage('Il file JSON deve essere un array di lezioni.');
          return;
        }

        // Sovrascrive tutto lo storage con il nuovo contenuto
        localStorage.setItem('quiz_lessons_questions', JSON.stringify(json));
        setMessage('Domande importate con successo!');
      } catch (err) {
        setMessage('Errore nel parsing del file JSON.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Importa domande da file JSON</h2>
      <input
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
      />
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.includes('successo') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
