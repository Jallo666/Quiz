const STORAGE_KEY = 'quiz_lessons_questions';

const getAllLessons = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveAllLessons = (lessons) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
};

const getLesson = (lessonNumber) => {
  const lessons = getAllLessons();
  return lessons.find(l => l.lessonNumber === lessonNumber) || null;
};

const addQuestion = (lessonNumber, question) => {
  const lessons = getAllLessons();
  const lessonIndex = lessons.findIndex(l => l.lessonNumber === lessonNumber);

  if (lessonIndex === -1) {
    // Se la lezione non esiste, la creo con la nuova domanda
    lessons.push({
      lessonNumber,
      questions: [question],
    });
  } else {
    // Altrimenti aggiungo la domanda alla lezione esistente
    lessons[lessonIndex].questions.push(question);
  }

  saveAllLessons(lessons);
};

const updateQuestion = (lessonNumber, updatedQuestion) => {
  const lessons = getAllLessons();
  const lessonIndex = lessons.findIndex(l => l.lessonNumber === lessonNumber);

  if (lessonIndex === -1) return; // Lezione non trovata

  lessons[lessonIndex].questions = lessons[lessonIndex].questions.map(q =>
    q.id === updatedQuestion.id ? updatedQuestion : q
  );

  saveAllLessons(lessons);
};

const deleteQuestion = (lessonNumber, questionId) => {
  const lessons = getAllLessons();
  const lessonIndex = lessons.findIndex(l => l.lessonNumber === lessonNumber);

  if (lessonIndex === -1) return; // Lezione non trovata

  lessons[lessonIndex].questions = lessons[lessonIndex].questions.filter(q => q.id !== questionId);

  saveAllLessons(lessons);
};

const addLessons = (newLessons) => {
  const existingLessons = getAllLessons();

  newLessons.forEach(newLesson => {
    const lessonIndex = existingLessons.findIndex(l => l.lessonNumber === newLesson.lessonNumber);

    if (lessonIndex === -1) {
      // Lezione nuova: aggiungo direttamente
      existingLessons.push(newLesson);
    } else {
      // Lezione esistente: aggiungo solo nuove domande (evitando duplicati tramite id)
      const existingQuestionIds = new Set(existingLessons[lessonIndex].questions.map(q => q.id));
      newLesson.questions.forEach(q => {
        if (!existingQuestionIds.has(q.id)) {
          existingLessons[lessonIndex].questions.push(q);
        }
      });
    }
  });

  saveAllLessons(existingLessons);
};


const clearAll = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export default {
  getAllLessons,
  getLesson,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  clearAll,
  saveAllLessons,
  addLessons
};
