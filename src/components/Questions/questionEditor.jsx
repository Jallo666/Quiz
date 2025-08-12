import React, { useState } from 'react';

export default function QuestionEditor({ questionData, onSave, onCancel }) {
  const [question, setQuestion] = useState(questionData.question || '');
  const [img, setImg] = useState(questionData.img || '');
  const [answers, setAnswers] = useState(
    questionData.answers.length > 0
      ? questionData.answers
      : [{ text: '', correct: false, img: '' }]
  );

  function addAnswer() {
    setAnswers([...answers, { text: '', correct: false, img: '' }]);
  }

  function updateAnswer(index, key, value) {
    const newAnswers = answers.map((a, i) =>
      i === index ? { ...a, [key]: value } : a
    );
    setAnswers(newAnswers);
  }

  function removeAnswer(index) {
    if (answers.length === 1) return;
    setAnswers(answers.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!question.trim()) return alert('La domanda non può essere vuota.');
    if (
      answers.length === 0 ||
      !answers.some(a => a.correct) ||
      answers.some(a => !a.text.trim())
    ) {
      return alert(
        'Assicurati che almeno una risposta sia corretta e che tutte le risposte abbiano testo.'
      );
    }
    onSave({
      ...questionData,
      question: question.trim(),
      img: img.trim(),
      answers: answers.map(a => ({
        text: a.text.trim(),
        correct: a.correct,
        img: a.img.trim(),
      })),
    });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-8">
        <h3 className="text-2xl font-extrabold mb-6 text-indigo-700 drop-shadow-md">
          {questionData.id ? 'Modifica domanda' : 'Nuova domanda'}
        </h3>

        <label className="block mb-2 font-semibold text-indigo-900">Testo domanda</label>
        <textarea
          className="w-full border border-indigo-300 rounded-lg p-3 mb-6 resize-none shadow-inner focus:ring-2 focus:ring-indigo-400 transition"
          rows={3}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Inserisci qui il testo della domanda..."
        />

        <label className="block mb-2 font-semibold text-indigo-900">URL immagine (opzionale)</label>
        <input
          type="text"
          className="w-full border border-indigo-300 rounded-lg p-3 mb-4 shadow-inner focus:ring-2 focus:ring-indigo-400 transition"
          placeholder="https://..."
          value={img}
          onChange={e => setImg(e.target.value)}
        />
        {img && (
          <img
            src={img}
            alt="Immagine domanda"
            className="mb-6 max-h-56 rounded-xl shadow-lg object-contain border border-indigo-200 mx-auto"
            loading="lazy"
          />
        )}

        <h4 className="text-xl font-semibold mb-4 text-indigo-800">Risposte</h4>
        <div className="space-y-4 mb-8">
          {answers.map((a, i) => (
            <div
              key={i}
              className="border border-indigo-300 rounded-xl p-4 bg-white shadow hover:shadow-lg transition flex flex-col md:flex-row md:items-center md:space-x-6"
            >
              <textarea
                className="flex-grow border border-indigo-200 rounded-lg p-3 mb-3 md:mb-0 resize-none shadow-inner focus:ring-2 focus:ring-indigo-400 transition"
                rows={2}
                placeholder="Testo risposta"
                value={a.text}
                onChange={e => updateAnswer(i, 'text', e.target.value)}
              />
              <input
                type="text"
                placeholder="URL immagine (opzionale)"
                className="border border-indigo-200 rounded-lg p-3 mb-3 md:mb-0 md:w-52 shadow-inner focus:ring-2 focus:ring-indigo-400 transition"
                value={a.img}
                onChange={e => updateAnswer(i, 'img', e.target.value)}
              />
              {a.img && (
                <img
                  src={a.img}
                  alt={`Immagine risposta ${i + 1}`}
                  className="max-h-20 rounded-xl border border-indigo-300 shadow-lg object-contain mb-3 md:mb-0"
                  loading="lazy"
                />
              )}
              <label className="flex items-center space-x-2 text-indigo-900 font-semibold whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={a.correct}
                  onChange={e => updateAnswer(i, 'correct', e.target.checked)}
                  className="w-5 h-5 rounded border-indigo-400 focus:ring-2 focus:ring-indigo-500 transition"
                />
                <span>Corretto</span>
              </label>
              <button
                className={`ml-auto md:ml-0 text-red-600 hover:text-red-800 transition text-2xl font-bold select-none ${
                  answers.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => removeAnswer(i)}
                disabled={answers.length === 1}
                title={
                  answers.length === 1
                    ? 'Deve esserci almeno una risposta'
                    : 'Elimina risposta'
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addAnswer}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
          >
            + Aggiungi risposta
          </button>
        </div>

        <div className="flex justify-end space-x-6">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-extrabold shadow-lg hover:from-indigo-700 hover:to-indigo-900 transition"
          >
            Salva domanda
          </button>
        </div>
      </div>
    </div>
  );
}
