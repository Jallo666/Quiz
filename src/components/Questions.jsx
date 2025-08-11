import React, { useState, useEffect } from 'react';
import questionService from '../services/questionService';

function QuestionEditor({ questionData, onSave, onCancel }) {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto p-6">
        <h3 className="text-xl font-semibold mb-4">
          {questionData.id ? 'Modifica domanda' : 'Nuova domanda'}
        </h3>

        <label className="block mb-2 font-semibold">Testo domanda</label>
        <textarea
          className="w-full border rounded p-2 mb-4 resize-none"
          rows={3}
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <label className="block mb-2 font-semibold">URL immagine (opzionale)</label>
        <input
          type="text"
          className="w-full border rounded p-2 mb-4"
          placeholder="https://..."
          value={img}
          onChange={e => setImg(e.target.value)}
        />
        {img && (
          <img
            src={img}
            alt="Immagine domanda"
            className="mb-4 max-h-48 rounded shadow object-contain"
          />
        )}

        <h4 className="text-lg font-semibold mb-2">Risposte</h4>
        <div className="space-y-3 mb-6">
          {answers.map((a, i) => (
            <div
              key={i}
              className="border rounded p-3 flex flex-col md:flex-row md:items-center md:space-x-4"
            >
              <textarea
                className="flex-grow border rounded p-2 mb-2 md:mb-0 resize-none"
                rows={2}
                placeholder="Testo risposta"
                value={a.text}
                onChange={e => updateAnswer(i, 'text', e.target.value)}
              />
              <input
                type="text"
                placeholder="URL immagine (opzionale)"
                className="border rounded p-2 mb-2 md:mb-0 md:w-48"
                value={a.img}
                onChange={e => updateAnswer(i, 'img', e.target.value)}
              />
              {a.img && (
                <img
                  src={a.img}
                  alt={`Immagine risposta ${i + 1}`}
                  className="max-h-16 rounded mb-2 md:mb-0"
                />
              )}
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={a.correct}
                  onChange={e => updateAnswer(i, 'correct', e.target.checked)}
                />
                <span>Corretto</span>
              </label>
              <button
                className="text-red-500 hover:text-red-700 ml-auto md:ml-0"
                onClick={() => removeAnswer(i)}
                disabled={answers.length === 1}
                title={
                  answers.length === 1
                    ? 'Deve esserci almeno una risposta'
                    : 'Elimina risposta'
                }
              >
                ❌
              </button>
            </div>
          ))}
          <button
            onClick={addAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Aggiungi risposta
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Salva domanda
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Questions() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [filterLesson, setFilterLesson] = useState('');
  const [searchGlobal, setSearchGlobal] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [renamingLesson, setRenamingLesson] = useState(null);
  const [newLessonName, setNewLessonName] = useState('');

  useEffect(() => {
    const data = questionService.getAllLessons();
    setLessons(data);
    if (data.length) setSelectedLesson(data[0]);
  }, []);

  function refreshLessons(newLessons) {
    questionService.saveAllLessons(newLessons);
    setLessons(newLessons);
  }

  // CRUD Lezioni
  function handleCreateLesson() {
    const newName = prompt('Inserisci nome nuova lezione');
    if (!newName) return;
    if (lessons.some(l => l.lessonNumber.toLowerCase() === newName.toLowerCase())) {
      alert('Nome lezione già esistente');
      return;
    }
    const newLesson = { lessonNumber: newName, questions: [] };
    const newLessons = [...lessons, newLesson];
    refreshLessons(newLessons);
    setSelectedLesson(newLesson);
  }

  function handleDuplicateLesson(lesson) {
    const newName = prompt('Inserisci nome per la lezione duplicata');
    if (!newName) return;
    if (lessons.some(l => l.lessonNumber.toLowerCase() === newName.toLowerCase())) {
      alert('Nome lezione già esistente');
      return;
    }
    const newLesson = {
      lessonNumber: newName,
      questions: JSON.parse(JSON.stringify(lesson.questions)),
    };
    const newLessons = [...lessons, newLesson];
    refreshLessons(newLessons);
    setSelectedLesson(newLesson);
  }

  function handleDeleteLesson(lesson) {
    if (!window.confirm(`Eliminare la lezione "${lesson.lessonNumber}"?`)) return;
    const newLessons = lessons.filter(l => l.lessonNumber !== lesson.lessonNumber);
    refreshLessons(newLessons);
    if (selectedLesson?.lessonNumber === lesson.lessonNumber) {
      setSelectedLesson(newLessons[0] || null);
    }
  }

  function startRenameLesson(lesson) {
    setRenamingLesson(lesson.lessonNumber);
    setNewLessonName(lesson.lessonNumber);
  }

  function handleRenameLesson() {
    if (!newLessonName.trim()) {
      alert('Il nome non può essere vuoto');
      return;
    }
    if (
      lessons.some(
        l =>
          l.lessonNumber.toLowerCase() === newLessonName.toLowerCase() &&
          l.lessonNumber !== renamingLesson
      )
    ) {
      alert('Nome lezione già esistente');
      return;
    }
    const newLessons = lessons.map(l =>
      l.lessonNumber === renamingLesson ? { ...l, lessonNumber: newLessonName.trim() } : l
    );
    refreshLessons(newLessons);

    if (selectedLesson?.lessonNumber === renamingLesson) {
      setSelectedLesson({ ...selectedLesson, lessonNumber: newLessonName.trim() });
    }
    setRenamingLesson(null);
  }

  // CRUD Domande
  function handleSaveQuestion(updatedQuestion) {
    if (!selectedLesson) return;

    const newLessons = lessons.map(l => {
      if (l.lessonNumber !== selectedLesson.lessonNumber) return l;

      const questions = [...l.questions];
      if (updatedQuestion.id) {
        const idx = questions.findIndex(q => q.id === updatedQuestion.id);
        if (idx !== -1) questions[idx] = updatedQuestion;
      } else {
        const newId = `${selectedLesson.lessonNumber}-q${Date.now()}`;
        questions.push({ ...updatedQuestion, id: newId });
      }
      return { ...l, questions };
    });

    refreshLessons(newLessons);
    setSelectedLesson(newLessons.find(l => l.lessonNumber === selectedLesson.lessonNumber));
    setEditingQuestion(null);
  }

  function handleDeleteQuestion(id) {
    if (!selectedLesson) return;

    if (!window.confirm('Eliminare questa domanda?')) return;

    const newLessons = lessons.map(l => {
      if (l.lessonNumber !== selectedLesson.lessonNumber) return l;
      return { ...l, questions: l.questions.filter(q => q.id !== id) };
    });

    refreshLessons(newLessons);
    setSelectedLesson(newLessons.find(l => l.lessonNumber === selectedLesson.lessonNumber));
  }

  // Filtra lezioni per filtro
  const filteredLessons = lessons.filter(l =>
    l.lessonNumber.toLowerCase().includes(filterLesson.toLowerCase())
  );

  // Se c’è ricerca globale, mostro SOLO domande con la parola, in tutte le lezioni
  // Altrimenti, mostro solo domande della lezione selezionata

  let visibleLessons = [];

  if (searchGlobal.trim()) {
    const search = searchGlobal.toLowerCase();
    visibleLessons = lessons
      .map(lesson => {
        // filtro domande che matchano testo domanda o risposte
        const filteredQuestions = lesson.questions.filter(q => {
          if (q.question.toLowerCase().includes(search)) return true;
          if (q.answers.some(a => a.text.toLowerCase().includes(search))) return true;
          return false;
        });
        return filteredQuestions.length > 0
          ? { ...lesson, questions: filteredQuestions }
          : null;
      })
      .filter(Boolean);
  } else if (selectedLesson) {
    visibleLessons = filteredLessons.filter(l => l.lessonNumber === selectedLesson.lessonNumber);
  }

  return (
    <div className="flex flex-col md:flex-row h-full p-4 max-w-7xl mx-auto gap-6">
      {/* Sidebar lezioni */}
      <div className="md:w-1/3 bg-gray-50 rounded-lg border border-gray-300 p-4 flex flex-col">
        <div className="flex items-center mb-3 space-x-2">
          <input
            type="text"
            placeholder="Cerca lezione..."
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterLesson}
            onChange={e => setFilterLesson(e.target.value)}
          />
          <button
            onClick={handleCreateLesson}
            className="text-white bg-green-600 hover:bg-green-700 rounded px-3 py-2"
            title="Crea nuova lezione"
          >
            +
          </button>
        </div>

        <div className="overflow-auto flex-grow">
          {filteredLessons.length === 0 && <p className="text-gray-500">Nessuna lezione trovata.</p>}
          <ul>
            {filteredLessons.map(lesson => (
              <li
                key={lesson.lessonNumber}
                className={`flex items-center justify-between p-2 rounded cursor-pointer
                ${
                  selectedLesson?.lessonNumber === lesson.lessonNumber
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-blue-100'
                }`}
                onClick={() => {
                  if (renamingLesson !== lesson.lessonNumber) setSelectedLesson(lesson);
                }}
              >
                {renamingLesson === lesson.lessonNumber ? (
                  <input
                    type="text"
                    className="flex-grow mr-2 p-1 rounded border border-gray-300"
                    value={newLessonName}
                    onChange={e => setNewLessonName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameLesson();
                      if (e.key === 'Escape') setRenamingLesson(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{lesson.lessonNumber}</span>
                )}

                <div className="flex space-x-1">
                  {renamingLesson === lesson.lessonNumber ? (
                    <>
                      <button
                        onClick={handleRenameLesson}
                        title="Salva nome"
                        className="text-green-600 hover:text-green-800"
                      >
                        ✔️
                      </button>
                      <button
                        onClick={() => setRenamingLesson(null)}
                        title="Annulla"
                        className="text-red-600 hover:text-red-800"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          startRenameLesson(lesson);
                        }}
                        title="Rinomina"
                        className="hover:text-blue-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDuplicateLesson(lesson);
                        }}
                        title="Duplica"
                        className="hover:text-green-600"
                      >
                        📄
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson);
                        }}
                        title="Elimina"
                        className="hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pannello di destra - domande */}
      <div className="md:w-2/3 flex flex-col h-full">
        {/* Ricerca globale */}
        <div className="mb-4 flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Ricerca globale tra tutte le domande..."
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchGlobal}
            onChange={e => setSearchGlobal(e.target.value)}
          />
          <button
            onClick={() => {
              setEditingQuestion({ question: '', answers: [{ text: '', correct: false, img: '' }], img: '' });
              setSearchGlobal('');
            }}
            disabled={searchGlobal.trim().length > 0}
            title={searchGlobal.trim() ? 'Svuota ricerca per aggiungere nuova domanda' : 'Nuova domanda'}
            className={`px-3 py-2 rounded text-white ${
              searchGlobal.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            ➕ Nuova domanda
          </button>
        </div>

        {!selectedLesson && !searchGlobal && (
          <p className="text-gray-500">Seleziona una lezione per vedere le domande</p>
        )}

        <div className="overflow-auto flex-grow border border-gray-300 rounded p-2">
          {visibleLessons.length === 0 && (
            <p className="text-gray-500">Nessuna domanda trovata.</p>
          )}

          {visibleLessons.map(lesson => (
            <div key={lesson.lessonNumber} className="mb-6">
              {!searchGlobal && (
                <h2 className="text-xl font-bold mb-3">{lesson.lessonNumber}</h2>
              )}
              <ul>
                {lesson.questions.map(q => (
                  <li
                    key={q.id}
                    className="border border-gray-300 rounded p-3 mb-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="font-semibold mb-1">{q.question}</p>
                        {q.img && (
                          <img
                            src={q.img}
                            alt="Immagine domanda"
                            className="max-h-32 rounded mb-1 object-contain"
                          />
                        )}
<ul className="ml-4 list-disc text-sm">
  {q.answers.map((a, i) => (
    <li
      key={i}
      className={a.correct ? 'text-green-700 font-semibold' : ''}
    >
      {a.text}
      {a.img && (
        <img
          src={a.img}
          alt={`Immagine risposta ${i + 1}`}
          className="max-h-16 rounded mt-1 object-contain"
        />
      )}
    </li>
  ))}
</ul>

                      </div>
                      {!searchGlobal && (
                        <div className="flex flex-col space-y-1 ml-4">
                          <button
                            onClick={() => setEditingQuestion(q)}
                            title="Modifica domanda"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Elimina domanda"
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal editor domanda */}
      {editingQuestion && (
        <QuestionEditor
          questionData={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
