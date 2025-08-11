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

    // Estrai immagine dalla domanda
    const questionImg = extractImageUrl(q.question);

    // Rimuovi eventuale tag <img> dalla domanda (se vuoi pulire il testo)
    const questionText = q.question.replace(/<img[^>]*>/gi, "").trim();

    const answers = q.answers.map((a, i) => {
      // Estrai immagine dalla risposta
      const answerImg = extractImageUrl(a.answer);
      // Rimuovi tag <img> dal testo risposta (se vuoi pulire)
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

  const result = Array.from(lessonsMap.entries()).map(([lessonNumber, questions]) => ({
    lessonNumber,
    questions,
  }));

  return result;
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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Importa domande da file JSON</h2>

      <label className="mb-2 flex items-center space-x-2">
        <input
          type="checkbox"
          checked={replaceAll}
          onChange={e => setReplaceAll(e.target.checked)}
        />
        <span>Sostituisci tutte le domande (se non selezionato aggiunge)</span>
      </label>

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

      <button
        onClick={() => questionService.clearAll()}
        className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors duration-300"
      >
        Elimina tutto
      </button>
    </div>
  );
}
