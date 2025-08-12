import React from "react";
import { FiPlus, FiEdit2, FiCopy, FiTrash2, FiCheck, FiX, FiSearch } from "react-icons/fi";

export default function LessonTable({
  lessons,
  selectedLesson,
  filterLesson,
  renamingLesson,
  newLessonName,
  onSelectLesson,
  onFilterChange,
  onCreateLesson,
  onDuplicateLesson,
  onDeleteLesson,
  onStartRename,
  onRenameChange,
  onRenameSave,
  onRenameCancel,
}) {
  const filteredLessons = lessons.filter((l) =>
    l.lessonNumber.toLowerCase().includes(filterLesson.toLowerCase())
  );

  return (
    <div className="md:w-1/3 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg border border-blue-300 p-4 flex flex-col shadow-lg">
      <div className="flex items-center mb-3 space-x-2">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cerca lezione..."
            className="w-full pl-9 pr-3 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={filterLesson}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateLesson}
          className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-2 transition shadow-md"
          title="Crea nuova lezione"
          aria-label="Crea nuova lezione"
        >
          <FiPlus size={20} />
        </button>
      </div>

      <div
        className="overflow-y-auto
        max-h-[280px] md:max-h-none
        scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
      >
        {filteredLessons.length === 0 && (
          <p className="text-blue-400 text-center mt-8 select-none">Nessuna lezione trovata.</p>
        )}
        <ul className="space-y-2">
          {filteredLessons.map((lesson) => (
            <li
              key={lesson.lessonNumber}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition
                ${
                  selectedLesson?.lessonNumber === lesson.lessonNumber
                    ? "bg-blue-600 text-white font-semibold shadow-md"
                    : "hover:bg-blue-100 text-blue-900"
                }`}
              onClick={() => {
                if (renamingLesson !== lesson.lessonNumber) onSelectLesson(lesson);
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelectLesson(lesson);
              }}
              aria-selected={selectedLesson?.lessonNumber === lesson.lessonNumber}
            >
              {renamingLesson === lesson.lessonNumber ? (
                <input
                  type="text"
                  className="flex-grow mr-3 p-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newLessonName}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRenameSave();
                    if (e.key === "Escape") onRenameCancel();
                  }}
                  autoFocus
                />
              ) : (
                <span className="truncate">{lesson.lessonNumber}</span>
              )}

              <div className="flex space-x-3">
                {renamingLesson === lesson.lessonNumber ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameSave();
                      }}
                      title="Salva nome"
                      className="text-green-600 hover:text-green-800 transition"
                      aria-label="Salva nome lezione"
                    >
                      <FiCheck size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameCancel();
                      }}
                      title="Annulla"
                      className="text-red-600 hover:text-red-800 transition"
                      aria-label="Annulla modifica nome"
                    >
                      <FiX size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartRename(lesson);
                      }}
                      title="Rinomina"
                      className="hover:text-blue-600 transition"
                      aria-label="Rinomina lezione"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateLesson(lesson);
                      }}
                      title="Duplica"
                      className="hover:text-green-600 transition"
                      aria-label="Duplica lezione"
                    >
                      <FiCopy size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLesson(lesson);
                      }}
                      title="Elimina"
                      className="hover:text-red-600 transition"
                      aria-label="Elimina lezione"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
