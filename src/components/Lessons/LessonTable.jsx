// LessonTable.jsx
import React, { useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiCopy,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
} from "react-icons/fi";

export default function LessonTable({
  lessons,
  selectedLessons,
  filterLesson,
  renamingLesson,
  newLessonName,
  onToggleLessonSelection,
  onSelectAll,
  onFilterChange,
  onCreateLesson,
  onDuplicateLesson,
  onDeleteLesson,
  onStartRename,
  onRenameChange,
  onRenameSave,
  onRenameCancel,
  enableActions = true,
}) {
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);

  const filteredLessons = lessons.filter((l) =>
    l.lessonNumber.toLowerCase().includes(filterLesson.toLowerCase())
  );

  const allSelected =
    filteredLessons.length > 0 &&
    filteredLessons.every((l) =>
      selectedLessons.some((sl) => sl.lessonNumber === l.lessonNumber)
    );

  const handleLessonClick = (lesson) => {
    if (!multiSelectEnabled) {
      // se multi select disabilitato, deselezioniamo tutto prima
      selectedLessons.forEach((sl) => onToggleLessonSelection(sl));
    }
    onToggleLessonSelection(lesson);
  };

  return (
    <div className="md:w-1/4 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-lg border border-blue-300 p-4 flex flex-col shadow-lg">
      {/* Barra ricerca + crea */}
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
        {enableActions && (
          <button
            onClick={onCreateLesson}
            className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-2 transition shadow-md"
            title="Crea nuova lezione"
            aria-label="Crea nuova lezione"
          >
            <FiPlus size={20} />
          </button>
        )}
      </div>

      {/* Pulsante seleziona tutto + toggle multi select */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onSelectAll(filteredLessons)}
          className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {allSelected ? "Deseleziona tutto" : "Seleziona tutto"}
        </button>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={multiSelectEnabled}
            onChange={() => setMultiSelectEnabled((prev) => !prev)}
            className="w-4 h-4"
          />
          Multi-select
        </label>
      </div>

      {/* Lista lezioni */}
      <div className="overflow-y-auto max-h-[280px] md:max-h-none scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        {filteredLessons.length === 0 && (
          <p className="text-blue-400 text-center mt-8 select-none">
            Nessuna lezione trovata.
          </p>
        )}
        <ul className="space-y-2">
          {filteredLessons.map((lesson) => {
            const isSelected = selectedLessons.some(
              (sl) => sl.lessonNumber === lesson.lessonNumber
            );
            return (
              <li
                key={lesson.lessonNumber}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${isSelected
                  ? "bg-blue-600 text-white font-semibold shadow-md"
                  : "hover:bg-blue-100 text-blue-900"
                  }`}
                onClick={() => {
                  if (renamingLesson !== lesson.lessonNumber)
                    handleLessonClick(lesson);
                }}
              >
                {/* Parte sinistra: checkbox + nome */}
                <div className="flex items-center flex-grow min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleLessonClick(lesson)}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2"
                  />
                  {renamingLesson === lesson.lessonNumber ? (
                    <input
                      type="text"
                      className="flex-grow p-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>

                {/* Parte destra: azioni */}
                {enableActions && (
                  <div className="flex space-x-3 flex-shrink-0 ml-3">
                    {renamingLesson === lesson.lessonNumber ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameSave();
                          }}
                          title="Salva nome"
                          className="text-green-600 hover:text-green-800 transition"
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
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
