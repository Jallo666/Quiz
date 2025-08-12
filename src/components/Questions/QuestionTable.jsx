// QuestionTable.jsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QuestionCard from './QuestionCard';

export default function QuestionTable({ lessons, searchGlobal, onEdit, onDelete }) {
  if (lessons.length === 0) {
    return <p className="text-gray-500 italic text-center mt-10">Nessuna domanda trovata.</p>;
  }

  return (
    <>
      {lessons.map(lesson => (
        <div key={lesson.lessonNumber} className="mb-12">
          {!searchGlobal && (
            <h2 className="text-3xl font-extrabold mb-6 text-blue-800 tracking-wide">
              {lesson.lessonNumber}
            </h2>
          )}

          <ul className="space-y-6">
            <AnimatePresence>
              {lesson.questions.map((q, index) => (
                <motion.li
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="list-none"
                >
                  <QuestionCard
                    question={q}
                    questionNumber={index + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    showActions={!searchGlobal}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </>
  );
}
