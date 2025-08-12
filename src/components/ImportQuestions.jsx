import React, { useState } from 'react';
import questionService from '../services/questionService';

export default function ImportQuestions() {
  const [message, setMessage] = useState('');
  const [replaceAll, setReplaceAll] = useState(true); // default sostituisci tutto

  function extractImageUrl(htmlString) {
    if (!htmlString) return "";
    const imgTagMatch = htmlString.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
    return imgTagMatch ? imgTagMatch[1] : "";
  }

  function transformData(source) {
    if (Array.isArray(source) && source.length > 0 && source[0].lessonNumber && source[0].questions) {
      return source;
    }

    if (!source?.data?.testSource) {
      throw new Error("Formato sorgente non valido");
    }

    const lessonsMap = new Map();

    source.data.testSource.forEach((q, index) => {
      const lessonNumber = q.titolo_videolezione || "Unknown";

      if (!lessonsMap.has(lessonNumber)) {
        lessonsMap.set(lessonNumber, []);
      }

      const lessonKey = lessonNumber.replace(/\s+/g, "-").toLowerCase();
      const questionId = `${lessonKey}-question-${index + 1}`;

      const questionImg = extractImageUrl(q.question);
      const questionText = q.question.replace(/<img[^>]*>/gi, "").trim();

      const answers = q.answers.map((a, i) => {
        const answerImg = extractImageUrl(a.answer);
        const answerText = a.answer.replace(/<img[^>]*>/gi, "").trim();

        return {
          text: answerText,
          correct: String(i) === q.correct_answer,
          img: answerImg,
        };
      });

      lessonsMap.get(lessonNumber).push({
        id: questionId,
        question: questionText,
        img: questionImg,
        answers,
      });
    });

    return Array.from(lessonsMap.entries()).map(([lessonNumber, questions]) => ({
      lessonNumber,
      questions,
    }));
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const transformed = transformData(json);

        if (replaceAll) {
          questionService.saveAllLessons(transformed);
        } else {
          questionService.addLessons(transformed);
        }

        setMessage('Domande importate con successo!');
      } catch (err) {
        setMessage('Errore nel parsing del file JSON o formato non valido.');
      }
    };

    reader.readAsText(file);
  };

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
        className="mb-6 block w-full text-indigo-700 text-sm file:mr-4 file:py-2 file:px-4 file:border file:border-indigo-300 file:rounded-lg file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
      />

      {message && (
        <p
          className={`mb-6 text-sm font-semibold ${
            message.includes('successo') ? 'text-green-600' : 'text-red-600'
          }`}
          role="alert"
        >
          {message}
        </p>
      )}

      <button
        onClick={() => {
          questionService.clearAll();
          setMessage('Tutte le domande sono state eliminate.');
        }}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-lg transition"
      >
        Elimina tutto
      </button>
    </div>
  );
}
