import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import QuizTest from "./QuizTest";

export default function QuizConfigurator({
  quizMode,
  setQuizMode,
  timeLimit,
  setTimeLimit,
  selectedLessons,
}) {
  const [quizStarted, setQuizStarted] = useState(false);

  function onStartQuiz() {
    if (selectedLessons.length === 0) return;
    setQuizStarted(true);
  }

  function onExitQuiz() {
    setQuizStarted(false);
  }

  return (
    <div className="md:w-3/4 flex flex-col h-full rounded-lg border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 shadow-lg">
      {/* Header configuratore + bottone */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-900">
          <FiSettings className="text-blue-700" /> Configuratore Quiz
        </h2>

        <button
          type="button"
          disabled={selectedLessons.length === 0}
          onClick={onStartQuiz}
          className={`inline-flex justify-center rounded border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            selectedLessons.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Avvia Quiz"
          aria-disabled={selectedLessons.length === 0}
        >
          Avvia Quiz
        </button>
      </div>

      {/* Corpo configuratore */}
      <div className="flex flex-col gap-8 flex-grow overflow-auto">
        {/* Modalità */}
        <div>
          <label
            htmlFor="quizMode"
            className="block text-sm font-semibold text-blue-900 mb-2"
          >
            Modalità quiz
          </label>
          <select
            id="quizMode"
            className="block w-full rounded border border-blue-400 bg-white py-2 px-3 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value)}
          >
            <option value="oltranza">Quiz a oltranza</option>
            <option value="tempo">Quiz a tempo</option>
            <option value="numero">Quiz a numero di domande</option>
          </select>
        </div>

        {/* Tempo solo se modalità tempo */}
        {quizMode === "tempo" && (
          <div>
            <label
              htmlFor="timeLimit"
              className="block text-sm font-semibold text-blue-900 mb-2"
            >
              Tempo limite (secondi)
            </label>
            <input
              type="number"
              id="timeLimit"
              min={10}
              max={3600}
              className="block w-full rounded border border-blue-400 bg-white py-2 px-3 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </div>
        )}

        {/* QUI: QUIZ TEST O LEZIONI SELEZIONATE */}
        {quizStarted ? (
          <QuizTest
            quizMode={quizMode}
            timeLimit={timeLimit}
            lessons={selectedLessons}
            onExitQuiz={onExitQuiz}
          />
        ) : (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 border-b border-blue-400 pb-1">
              Lezioni selezionate
            </h3>

            {selectedLessons.length === 0 ? (
              <p className="text-blue-500 text-sm italic">
                Seleziona almeno una lezione per iniziare il quiz
              </p>
            ) : (
              <div className="overflow-auto max-h-60 rounded border border-blue-300 shadow-inner bg-white">
                <table className="min-w-full divide-y divide-blue-300">
                  <thead className="bg-blue-50 border-b border-blue-400">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Nome Lezione
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Numero Domande
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-200">
                    {selectedLessons.map((lesson) => (
                      <tr
                        key={lesson.lessonNumber}
                        className="hover:bg-blue-100 cursor-default"
                      >
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-blue-900">
                          {lesson.lessonNumber}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-blue-900">
                          {lesson.questions.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
