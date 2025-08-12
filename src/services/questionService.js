import { dbPromise } from './db';

const STORE_NAME = 'lessons';

async function getAllLessons() {
  const db = await dbPromise;
  return (await db.getAll(STORE_NAME)) || [];
}

async function saveAllLessons(lessons) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Pulisco tutto e reinserisco
  await store.clear();

  for (const lesson of lessons) {
    await store.put(lesson);
  }

  await tx.done;
}

async function getLesson(lessonNumber) {
  const db = await dbPromise;
  return await db.get(STORE_NAME, lessonNumber);
}

async function addQuestion(lessonNumber, question) {
  const db = await dbPromise;
  const lesson = (await db.get(STORE_NAME, lessonNumber)) || { lessonNumber, questions: [] };
  lesson.questions.push(question);
  await db.put(STORE_NAME, lesson);
}

async function updateQuestion(lessonNumber, updatedQuestion) {
  const db = await dbPromise;
  const lesson = await db.get(STORE_NAME, lessonNumber);
  if (!lesson) return;

  lesson.questions = lesson.questions.map(q =>
    q.id === updatedQuestion.id ? updatedQuestion : q
  );
  await db.put(STORE_NAME, lesson);
}

async function deleteQuestion(lessonNumber, questionId) {
  const db = await dbPromise;
  const lesson = await db.get(STORE_NAME, lessonNumber);
  if (!lesson) return;

  lesson.questions = lesson.questions.filter(q => q.id !== questionId);
  await db.put(STORE_NAME, lesson);
}

async function addLessons(newLessons) {
  const db = await dbPromise;
  for (const newLesson of newLessons) {
    const lesson = (await db.get(STORE_NAME, newLesson.lessonNumber)) || { lessonNumber: newLesson.lessonNumber, questions: [] };
    const existingIds = new Set(lesson.questions.map(q => q.id));

    newLesson.questions.forEach(q => {
      if (!existingIds.has(q.id)) lesson.questions.push(q);
    });

    await db.put(STORE_NAME, lesson);
  }
}

async function clearAll() {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
}

export default {
  getAllLessons,
  saveAllLessons,
  getLesson,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addLessons,
  clearAll,
};
