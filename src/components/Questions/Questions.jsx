import React, { useState, useEffect } from 'react';
import questionService from '../../services/questionService';
import LessonTable from '../Lessons/LessonTable';
import QuestionTable from './QuestionTable';
import QuestionEditor from './questionEditor';
import { FiPlus, FiSearch } from 'react-icons/fi';

export default function Questions() {
  const [lessons, setLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]); // <-- array invece di singolo
  const [filterLesson, setFilterLesson] = useState('');
  const [searchGlobal, setSearchGlobal] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [renamingLesson, setRenamingLesson] = useState(null);
  const [newLessonName, setNewLessonName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      const data = await questionService.getAllLessons();
      setLessons(data);
      if (data.length) setSelectedLessons([data[0]]); // default: prima lezione selezionata
      setLoading(false);
    }
    fetchLessons();
  }, []);

  async function refreshLessons(newLessons) {
    setLoading(true);
    await questionService.saveAllLessons(newLessons);
    setLessons(newLessons);
    setLoading(false);
  }

  // Toggle selezione singola
  function toggleLessonSelection(lesson) {
    setSelectedLessons(prev => {
      if (prev.some(l => l.lessonNumber === lesson.lessonNumber)) {
        return prev.filter(l => l.lessonNumber !== lesson.lessonNumber);
      } else {
        return [...prev, lesson];
      }
    });
  }

  // Seleziona / deseleziona tutto
  function toggleSelectAll(filteredLessons) {
    const allSelected = filteredLessons.every(l =>
      selectedLessons.some(sl => sl.lessonNumber === l.lessonNumber)
    );
    if (allSelected) {
      setSelectedLessons(prev =>
        prev.filter(l => !filteredLessons.some(fl => fl.lessonNumber === l.lessonNumber))
      );
    } else {
      const merged = [...selectedLessons];
      filteredLessons.forEach(fl => {
        if (!merged.some(l => l.lessonNumber === fl.lessonNumber)) {
          merged.push(fl);
        }
      });
      setSelectedLessons(merged);
    }
  }

  // CRUD lezioni (invariate tranne rename/delete per gestione array)
  async function handleCreateLesson() {
    const newName = prompt('Inserisci nome nuova lezione');
    if (!newName) return;
    if (lessons.some(l => l.lessonNumber.toLowerCase() === newName.toLowerCase())) {
      alert('Nome lezione già esistente');
      return;
    }
    const newLesson = { lessonNumber: newName, questions: [] };
    const newLessons = [...lessons, newLesson];
    await refreshLessons(newLessons);
    setSelectedLessons(prev => [...prev, newLesson]);
  }

  async function handleDuplicateLesson(lesson) {
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
    await refreshLessons(newLessons);
    setSelectedLessons(prev => [...prev, newLesson]);
  }

  async function handleDeleteLesson(lesson) {
    if (!window.confirm(`Eliminare la lezione "${lesson.lessonNumber}"?`)) return;
    const newLessons = lessons.filter(l => l.lessonNumber !== lesson.lessonNumber);
    await refreshLessons(newLessons);
    setSelectedLessons(prev => prev.filter(l => l.lessonNumber !== lesson.lessonNumber));
  }

  async function handleRenameLesson() {
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
    await refreshLessons(newLessons);

    setSelectedLessons(prev =>
      prev.map(l =>
        l.lessonNumber === renamingLesson
          ? { ...l, lessonNumber: newLessonName.trim() }
          : l
      )
    );

    setRenamingLesson(null);
  }

  // CRUD domande
  async function handleSaveQuestion(updatedQuestion) {
    if (selectedLessons.length !== 1) {
      alert('Per aggiungere o modificare una domanda devi avere UNA sola lezione selezionata.');
      return;
    }

    const targetLesson = selectedLessons[0];

    const newLessons = lessons.map(l => {
      if (l.lessonNumber !== targetLesson.lessonNumber) return l;

      const questions = [...l.questions];
      const idx = questions.findIndex(q => q.id === updatedQuestion.id);

      if (idx !== -1) {
        // Modifica domanda esistente
        questions[idx] = updatedQuestion;
      } else {
        // Nuova domanda (fallback, in teoria non serve perché l'id è già presente)
        questions.push(updatedQuestion);
      }

      return { ...l, questions };
    });

    await refreshLessons(newLessons);
    const updatedTarget = newLessons.find(l => l.lessonNumber === targetLesson.lessonNumber);
    setSelectedLessons([updatedTarget]);
    setEditingQuestion(null);
  }



  async function handleDeleteQuestion(id) {
    if (selectedLessons.length !== 1) {
      alert('Puoi eliminare domande solo se una sola lezione è selezionata.');
      return;
    }

    const targetLesson = selectedLessons[0];
    if (!window.confirm('Eliminare questa domanda?')) return;

    const newLessons = lessons.map(l => {
      if (l.lessonNumber !== targetLesson.lessonNumber) return l;
      return { ...l, questions: l.questions.filter(q => q.id !== id) };
    });

    await refreshLessons(newLessons);
    const updatedTarget = newLessons.find(l => l.lessonNumber === targetLesson.lessonNumber);
    setSelectedLessons([updatedTarget]);
  }

  const filteredLessons = lessons.filter(l =>
    l.lessonNumber.toLowerCase().includes(filterLesson.toLowerCase())
  );

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
  } else {
    visibleLessons = selectedLessons;
  }

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Caricamento...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full p-4  mx-auto gap-6">
      {/* Sidebar lezioni */}
      <LessonTable
        lessons={lessons}
        selectedLessons={selectedLessons}
        filterLesson={filterLesson}
        renamingLesson={renamingLesson}
        newLessonName={newLessonName}
        onToggleLessonSelection={toggleLessonSelection}
        onSelectAll={() => toggleSelectAll(filteredLessons)}
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
      <div className="md:w-3/4 flex flex-col h-full">
        {/* Ricerca globale */}
        <div className="flex items-center space-x-3 mb-4 p-2 border border-gray-300 rounded shadow-sm bg-white">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Cerca domande..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchGlobal}
              onChange={e => setSearchGlobal(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (selectedLessons.length === 1) {
                const targetLesson = selectedLessons[0];
                const existingNumbers = targetLesson.questions.map(q =>
                  parseInt(q.id.split('-question-')[1])
                );
                const questionNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1;
                const newId = `${targetLesson.lessonNumber}-question-${questionNumber}`;

                setEditingQuestion({
                  id: newId,
                  question: '',
                  answers: [{ text: '', correct: false, img: '' }],
                  img: ''
                });
                setSearchGlobal('');
              }
            }}
            disabled={searchGlobal.trim().length > 0 || selectedLessons.length !== 1}
            title={searchGlobal.trim() ? 'Svuota la ricerca per aggiungere nuova domanda' : 'Nuova domanda'}
            className={`flex items-center px-4 py-2 rounded text-white font-semibold transition-colors ${searchGlobal.trim() || selectedLessons.length !== 1
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            <FiPlus className="mr-2" /> Nuova domanda
          </button>
        </div>

        {selectedLessons.length === 0 && !searchGlobal && (
          <p className="text-gray-500">Seleziona almeno una lezione per vedere le domande</p>
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

      {editingQuestion && (
        <QuestionEditor
          questionData={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );

  function startRenameLesson(lesson) {
    setRenamingLesson(lesson.lessonNumber);
    setNewLessonName(lesson.lessonNumber);
  }
}
