// QuestionCard.jsx
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import AnswersList from './AnswersList';
import ImageRender from '../Images/ImageRender';
export default function QuestionCard({ question, questionNumber, onEdit, onDelete, showActions = true , lessonNumber}) {
  return (
    <div
      className="bg-gradient-to-br from-white via-blue-50 to-white rounded-xl shadow-2xl border border-blue-200 overflow-hidden
                 hover:shadow-[0_10px_30px_rgba(59,130,246,0.4)] transition-shadow duration-500"
    >
      {/* Header: glass effect */}
      <div
        className="flex justify-between items-center px-5 py-3 border-b border-blue-300
                   bg-white/60 backdrop-blur-md"
      >
        <span className="font-extrabold text-blue-800 text-lg tracking-wide select-none">
          Domanda {questionNumber} - Lezione: {lessonNumber}
        </span>

        {showActions && (
          <div className="flex space-x-5">
            <button
              onClick={() => onEdit(question)}
              title="Modifica domanda"
              className="text-blue-600 hover:text-blue-900 focus:outline-none transition-colors duration-300"
              aria-label="Modifica domanda"
            >
              <FiEdit2 size={22} />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              title="Elimina domanda"
              className="text-red-600 hover:text-red-900 focus:outline-none transition-colors duration-300"
              aria-label="Elimina domanda"
            >
              <FiTrash2 size={22} />
            </button>
          </div>
        )}
      </div>

      {/* Contenuto domanda e risposte */}
      <div className="p-6">
        <p className="font-semibold text-gray-900 mb-5 text-xl leading-relaxed whitespace-pre-wrap break-words drop-shadow-sm">
          {question.question}
        </p>

        {question.img && (
          <ImageRender
            src={question.img}
            alt={"Immagine domanda"}
            className={"max-h-48 rounded-2xl mb-6 object-contain shadow-lg border border-blue-200"}
            loading="lazy"
          />
        )}

        <AnswersList answers={question.answers} />
      </div>
    </div>
  );
}
