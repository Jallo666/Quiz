import React, { useState, useEffect } from 'react';
import questionService from '../../services/questionService';
import LessonTable from '../Lessons/LessonTable';
import QuizConfigurator from './QuizConfigurator';  // <-- importa

export default function QuizHome() {
  const [lessons, setLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [filterLesson, setFilterLesson] = useState('');
  const [loading, setLoading] = useState(true);

  const [quizMode, setQuizMode] = useState('oltranza');
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      const data = await questionService.getAllLessons();
      setLessons(data);
      if (data.length) setSelectedLessons([data[0]]);
      setLoading(false);
    }
    fetchLessons();
  }, []);

  function toggleLessonSelection(lesson) {
    setSelectedLessons(prev => {
      if (prev.some(l => l.lessonNumber === lesson.lessonNumber)) {
        return prev.filter(l => l.lessonNumber !== lesson.lessonNumber);
      } else {
        return [...prev, lesson];
      }
    });
  }

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

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Caricamento...</div>;
  }

  const filteredLessons = lessons.filter(l =>
    l.lessonNumber.toLowerCase().includes(filterLesson.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full p-4  mx-auto gap-6">
      {/* Sidebar lezioni */}
      <LessonTable
        lessons={lessons}
        enableActions={false}
        selectedLessons={selectedLessons}
        filterLesson={filterLesson}
        onToggleLessonSelection={toggleLessonSelection}
        onSelectAll={() => toggleSelectAll(filteredLessons)}
        onFilterChange={setFilterLesson}
      />

      {/* Pannello configuratore quiz */}
      <QuizConfigurator
        quizMode={quizMode}
        setQuizMode={setQuizMode}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        selectedLessons={selectedLessons}
        onStartQuiz={() => alert(`Avvio quiz in modalità ${quizMode}`)}
      />
    </div>
  );
}
