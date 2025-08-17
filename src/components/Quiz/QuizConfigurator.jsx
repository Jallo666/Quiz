// QuizConfigurator.jsx
import React, { useState } from "react";
import { FiSettings, FiShuffle, FiUsers, FiZap } from "react-icons/fi";
import QuizTest from "./QuizTest";
import Quiz3D from "../3D/Quiz3D";
import QuizResults from "./QuizResults";

export default function QuizConfigurator({ selectedLessons }) {
  const [quizMode, setQuizMode] = useState("numero");
  const [soulsLike, setSoulsLike] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(null);
  const [groupSize, setGroupSize] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [randomOrder, setRandomOrder] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  // Aggiungi nello stato
  const [modo3D, setModo3D] = useState(false);

  // Calcola se la toggle può apparire
  const show3DToggle = groupMode && soulsLike;
  const totalQuestions = selectedLessons.reduce(
    (sum, lesson) => sum + lesson.questions.length,
    0
  );

  function onStartQuiz() {
    if (selectedLessons.length === 0) return;
    setQuizStarted(true);
    setQuizResults(null);
  }

  function onExitQuiz() {
    setQuizStarted(false);
  }

  function handleFinish(results) {
    setQuizResults(results);
    setQuizStarted(false);
  }

  const handleNumberChange = (setter, val, max) => {
    if (!val) {
      setter(null);
      return;
    }
    const num = Number(val);
    if (num > max) setter(max);
    else if (num < 1) setter(1);
    else setter(num);
  };

  const totalGroups =
    groupMode && groupSize && maxQuestions
      ? Math.ceil(maxQuestions / groupSize)
      : null;

  return (
    <div className="md:w-3/4 flex flex-col h-full rounded-lg border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-900">
          <FiSettings className="text-blue-700" /> Configuratore Quiz
        </h2>
        <button
          type="button"
          disabled={selectedLessons.length === 0}
          onClick={onStartQuiz}
          className={`inline-flex justify-center rounded border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedLessons.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          Avvia Quiz
        </button>
      </div>

      {!quizStarted && (
        <div className="flex flex-col gap-6 flex-grow overflow-auto">
          {/* Toggles */}
          <div className="flex flex-col gap-4">
            {/* Group Mode */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <FiUsers className="text-blue-600 w-5 h-5" />
              <span className="text-blue-900 font-semibold">Modalità a gruppi</span>
              <div
                className={`ml-auto w-12 h-6 flex items-center rounded-full p-1 duration-300 ${groupMode ? "bg-blue-500" : "bg-gray-300"
                  }`}
                onClick={() => setGroupMode(!groupMode)}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${groupMode ? "translate-x-6" : ""
                    }`}
                />
              </div>
            </label>


            {/* Modalità 3D, solo se groupMode e soulsLike sono attivi */}
            {soulsLike && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <FiZap className="text-purple-600 w-5 h-5" />
                <span className="text-purple-800 font-semibold">Modalità 3D 🌌</span>
                <div
                  className={`ml-auto w-12 h-6 flex items-center rounded-full p-1 duration-300 ${modo3D ? "bg-purple-500" : "bg-gray-300"}`}
                  onClick={() => {
                    const newModo3D = !modo3D;
                    setModo3D(newModo3D);
                    if (newModo3D) {
                      setGroupMode(false);   // disabilita gruppi
                      setSoulsLike(true);    // assicura SoulsLike attivo
                    }
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${modo3D ? "translate-x-6" : ""}`}
                  />
                </div>
              </label>
            )}
            {/* SoulsLike */}
            {!groupMode && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <FiZap className="text-red-600 w-5 h-5" />
                <span className="text-red-700 font-semibold">SoulsLike ⚔️</span>
                <div
                  className={`ml-auto w-12 h-6 flex items-center rounded-full p-1 duration-300 ${soulsLike ? "bg-red-500" : "bg-gray-300"
                    }`}
                  onClick={() => setSoulsLike(!soulsLike)}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${soulsLike ? "translate-x-6" : ""
                      }`}
                  />
                </div>
              </label>
            )}

            {/* Random Order */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <FiShuffle className="text-blue-600 w-5 h-5" />
              <span className="text-blue-900 font-semibold">Domande in ordine casuale</span>
              <div
                className={`ml-auto w-12 h-6 flex items-center rounded-full p-1 duration-300 ${randomOrder ? "bg-blue-500" : "bg-gray-300"
                  }`}
                onClick={() => setRandomOrder(!randomOrder)}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${randomOrder ? "translate-x-6" : ""
                    }`}
                />
              </div>
            </label>
          </div>

          {/* Numero massimo domande totali */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Numero massimo di domande
            </label>
            <input
              type="number"
              min={1}
              max={totalQuestions}
              value={maxQuestions || ""}
              onChange={(e) =>
                handleNumberChange(setMaxQuestions, e.target.value, totalQuestions)
              }
              placeholder={`Max ${totalQuestions}`}
              className="block w-full rounded border border-blue-400 bg-white py-2 px-3 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Numero domande per gruppo */}
          {groupMode && (
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Numero domande per gruppo
              </label>
              <input
                type="number"
                min={1}
                max={maxQuestions || totalQuestions}
                value={groupSize || ""}
                onChange={(e) =>
                  handleNumberChange(
                    setGroupSize,
                    e.target.value,
                    maxQuestions || totalQuestions
                  )
                }
                placeholder="Es. 5"
                className="block w-full rounded border border-blue-400 bg-white py-2 px-3 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
              />
              {totalGroups && (
                <p className="text-sm text-blue-700 mt-1">
                  Questo quiz sarà diviso in <strong>{totalGroups}</strong> gruppi
                </p>
              )}
            </div>
          )}

          {/* Lezioni selezionate */}
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
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        Nome Lezione
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wide">
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
        </div>
      )}

      {quizStarted && (
        modo3D ? (
          <Quiz3D
            maxQuestions={maxQuestions || totalQuestions}
            groupSize={groupMode ? groupSize : null}
            lessons={selectedLessons}
            randomOrder={randomOrder}
            groupMode={groupMode}
            soulsLike={soulsLike}
            onFinish={handleFinish}
            onExitQuiz={onExitQuiz}
          />
        ) : (
          <QuizTest
            quizMode={quizMode}
            maxQuestions={maxQuestions || totalQuestions}
            groupSize={groupMode ? groupSize : null}
            lessons={selectedLessons}
            randomOrder={randomOrder}
            groupMode={groupMode}
            soulsLike={soulsLike}
            onFinish={handleFinish}
            onExitQuiz={onExitQuiz}
          />
        )
      )}

      {quizResults && <QuizResults results={quizResults} />}
    </div>
  );
}
