import React, { useState, useEffect } from 'react';
import questionService from '../../services/questionService';
import LessonTable from './LessonTable';
import QuestionTable from './QuestionTable';
import QuestionEditor from './questionEditor';

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

  // CRUD lezioni
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

  // CRUD domande
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

  // Se c’è ricerca globale → mostro SOLO domande che matchano in tutte le lezioni
  // Altrimenti mostro quelle della lezione selezionata
  let visibleLessons = [];
  if (searchGlobal.trim()) {
    const search = searchGlobal.toLowerCase();
    visibleLessons = lessons
      .map(lesson => {
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
      <LessonTable
        lessons={lessons}
        selectedLesson={selectedLesson}
        filterLesson={filterLesson}
        renamingLesson={renamingLesson}
        newLessonName={newLessonName}
        onSelectLesson={setSelectedLesson}
        onFilterChange={setFilterLesson}
        onCreateLesson={handleCreateLesson}
        onDuplicateLesson={handleDuplicateLesson}
        onDeleteLesson={handleDeleteLesson}
        onStartRename={startRenameLesson}
        onRenameChange={setNewLessonName}
        onRenameSave={handleRenameLesson}
        onRenameCancel={() => setRenamingLesson(null)}
      />

      {/* Pannello domande */}
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
          <QuestionTable
            lessons={visibleLessons}
            searchGlobal={searchGlobal}
            onEdit={setEditingQuestion}
            onDelete={handleDeleteQuestion}
          />
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
