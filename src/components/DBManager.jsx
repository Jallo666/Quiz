import React, { useState, useEffect } from 'react';
import questionService from '../services/questionService';

const MAX_DB_SIZE_MB = 5; // Limite approssimativo (5MB)

export default function DatabaseManager() {
  const [lessons, setLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState(new Set());
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      const allLessons = await questionService.getAllLessons();
      if (Array.isArray(allLessons)) {
        setLessons(allLessons);
      } else {
        console.warn('getAllLessons() non ha restituito un array:', allLessons);
        setLessons([]);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle lezioni:', error);
      setLessons([]);
    }
  }

  // Funzione helper per calcolare dimensione in MB di un oggetto JS serializzato JSON
  function getSizeInMB(obj) {
    const str = JSON.stringify(obj);
    return (new Blob([str]).size / (1024 * 1024)).toFixed(3);
  }

  // Toggle selezione singola lezione
  function toggleSelectLesson(lessonNumber) {
    const newSet = new Set(selectedLessons);
    if (newSet.has(lessonNumber)) {
      newSet.delete(lessonNumber);
    } else {
      newSet.add(lessonNumber);
    }
    setSelectedLessons(newSet);
  }

  // Seleziona tutte le lezioni oppure deseleziona tutte
  function toggleSelectAll() {
    if (selectedLessons.size === lessons.length) {
      // Deseleziona tutte
      setSelectedLessons(new Set());
    } else {
      // Seleziona tutte
      setSelectedLessons(new Set(lessons.map(l => l.lessonNumber)));
    }
  }

  // Svuota il DB senza alert
  function handleClearDB() {
    questionService.clearAll();
    setLessons([]);
    setSelectedLessons(new Set());
    setMessage('DB svuotato correttamente.');
  }

  // Export tutto o solo selezionate
  function handleExport() {
    let dataToExport = [];
    if (selectedLessons.size === 0) {
      dataToExport = lessons;
    } else {
      dataToExport = lessons.filter(l => selectedLessons.has(l.lessonNumber));
    }

    if (dataToExport.length === 0) {
      alert('Seleziona almeno una lezione o lascia vuoto per esportare tutto');
      return;
    }

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = selectedLessons.size === 0 ? 'quiz_database_export.json' : 'quiz_database_export_selected.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const usedMB = Number(getSizeInMB(lessons));
  const freeMB = (MAX_DB_SIZE_MB - usedMB).toFixed(3);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg border border-blue-300 shadow-lg flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Gestione Database Locale</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="mb-4 flex flex-col gap-1">
        <p className="text-blue-800 font-medium">Lezioni salvate: <span className="font-semibold">{lessons.length}</span></p>
        <p className="text-blue-800 font-medium">Spazio usato: <span className="font-semibold">{usedMB} MB</span></p>
        <p className="text-blue-800 font-medium">Spazio libero stimato: <span className="font-semibold">{freeMB > 0 ? freeMB : 0} MB</span></p>
      </div>

      <button
        onClick={toggleSelectAll}
        className="mb-3 self-start text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
        aria-pressed={selectedLessons.size === lessons.length}
        title={selectedLessons.size === lessons.length ? 'Deseleziona tutte le lezioni' : 'Seleziona tutte le lezioni'}
      >
        {selectedLessons.size === lessons.length ? 'Deseleziona tutte' : 'Seleziona tutte'}
      </button>

      <ul className="mb-4 list-none max-h-72 overflow-y-auto border border-blue-300 rounded p-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <li
              key={lesson.lessonNumber}
              className={`flex items-center justify-between p-2 rounded cursor-pointer select-none
                hover:bg-blue-200
                ${selectedLessons.has(lesson.lessonNumber) ? 'bg-blue-300 font-semibold' : 'bg-white'}
              `}
              onClick={() => toggleSelectLesson(lesson.lessonNumber)}
              aria-pressed={selectedLessons.has(lesson.lessonNumber)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSelectLesson(lesson.lessonNumber);
                }
              }}
            >
              <span>{lesson.lessonNumber}</span>
              <span className="text-sm text-blue-700 font-mono">{lesson.questions.length} domande</span>
            </li>
          ))
        ) : (
          <li className="text-center text-blue-400 select-none">Nessuna lezione trovata</li>
        )}
      </ul>

      <div className="flex gap-4 justify-end">
        <button
          onClick={handleClearDB}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded shadow-md transition"
          title="Svuota tutto il database"
        >
          Svuota Database
        </button>

        <button
          onClick={handleExport}
          className={`px-5 py-2 rounded shadow-md text-white transition
            ${lessons.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
          disabled={lessons.length === 0}
          title="Esporta tutto il database o solo le lezioni selezionate"
        >
          Esporta {selectedLessons.size === 0 ? 'Tutto' : `(${selectedLessons.size}) Lezioni`}
        </button>
      </div>
    </div>
  );
}
