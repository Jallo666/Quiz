import React, { useState } from 'react';
import questionService from '../../services/questionService';
import { remapRawSource } from '../Import/remapper';
import { importQuestionsWithProgress } from './lessonImporter';
export default function ImportQuestions() {
  const [message, setMessage] = useState('');
  const [replaceAll, setReplaceAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  function transformData(source) {
    if (Array.isArray(source) && source.length > 0 && source[0].lessonNumber && source[0].questions) {
      return source;
    }
    return remapRawSource(source);
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setProgress(0);
    setTotal(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const lessons = transformData(json);

        // calcolo totale domande
        const totalQuestions = lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
        setTotal(totalQuestions);

        // importa con callback di progresso
        await importQuestionsWithProgress(lessons, {
          replaceAll,
          onProgress: (done) => setProgress(done)
        });

        setMessage('Domande importate con successo!');
      } catch (err) {
        console.error(err);
        setMessage('Errore nel parsing del file JSON o formato non valido.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    setLoading(true);
    await questionService.clearAll();
    setMessage('Tutte le domande sono state eliminate.');
    setLoading(false);
  };

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="p-6 max-w-md mx-auto bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-extrabold mb-6 text-indigo-700 drop-shadow-md">
        Importa domande da file JSON
      </h2>

      <label className="mb-4 flex items-center space-x-3 text-indigo-900 font-semibold cursor-pointer select-none">
        <input
          type="checkbox"
          checked={replaceAll}
          onChange={e => setReplaceAll(e.target.checked)}
          className="w-5 h-5 rounded border-indigo-400 focus:ring-2 focus:ring-indigo-500 transition"
        />
        <span>Sostituisci tutte le domande (se non selezionato aggiunge)</span>
      </label>

      <input
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        disabled={loading}
        className="mb-6 block w-full text-indigo-700 text-sm file:mr-4 file:py-2 file:px-4 file:border file:border-indigo-300 file:rounded-lg file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
      />

      {loading && total > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm mt-2 text-indigo-700 font-semibold">
            {progress} / {total} domande importate ({percentage}%)
          </p>
        </div>
      )}

      {message && !loading && (
        <p
          className={`mb-6 text-sm font-semibold ${message.includes('successo') ? 'text-green-600' : 'text-red-600'}`}
          role="alert"
        >
          {message}
        </p>
      )}

      <button
        onClick={handleClearAll}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg transition"
      >
        {loading ? 'Attendere...' : 'Elimina tutto'}
      </button>
    </div>
  );
}
