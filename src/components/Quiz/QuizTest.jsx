// QuizTest.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import ImageRender from "../Images/ImageRender";
import { showQuizModal } from "../shared/quizModalService";

export default function QuizTest({
  lessons,
  quizMode,
  timeLimit,
  maxQuestions,
  groupSize = 0,
  randomOrder = false,
  groupMode = false,
  soulsLike = false,
  onFinish,
  onExitQuiz
}) {
  const allQuestions = useMemo(() => lessons.flatMap(l => l.questions), [lessons]);

  // Preparo domande e randomizzo se richiesto
  const preparedQuestions = useMemo(() => {
    let qs = [...allQuestions];
    if (randomOrder) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    return maxQuestions ? qs.slice(0, maxQuestions) : qs;
  }, [allQuestions, randomOrder, maxQuestions]);

  // Divido in gruppi se groupMode
  const groupedQuestions = useMemo(() => {
    if (!groupMode || !groupSize) return [preparedQuestions];
    const groups = [];
    for (let i = 0; i < preparedQuestions.length; i += groupSize) {
      groups.push(preparedQuestions.slice(i, i + groupSize));
    }
    return groups;
  }, [preparedQuestions, groupMode, groupSize]);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState({});
  const [answersGiven, setAnswersGiven] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);

  const currentGroup = groupMode
    ? groupedQuestions[currentGroupIndex] || []
    : [preparedQuestions[currentQuestionIndex]];

  // Timer
  useEffect(() => {
    if (quizMode !== "tempo") return;
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizMode, timeLimit, currentGroupIndex, currentQuestionIndex]);

  const handleAnswerSelect = (qId, index) => {
    setLocalAnswers(prev => ({ ...prev, [qId]: index }));
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setCurrentGroupIndex(0);
    setLocalAnswers({});
    setAnswersGiven([]);
  };

  const handleSubmit = (timeUp = false) => {
    if (!timeUp && groupMode) {
      const allAnswered = currentGroup.every(q => localAnswers[q.id] !== undefined);
      if (!allAnswered) {
        showQuizModal({ text: "Rispondi a tutte le domande del gruppo prima di procedere" });
        return;
      }
    }

    const newAnswers = currentGroup.map(q => ({
      questionId: q.id,
      answerIndex: localAnswers[q.id] ?? null
    }));

    if (!groupMode && soulsLike) {
      const q = preparedQuestions[currentQuestionIndex];
      const selected = localAnswers[q.id];
      if (selected == null) return;
      if (!q.answers[selected].correct) {
        showQuizModal({ text: "❌ Hai sbagliato! SoulsLike: ricominci da capo!" });
        resetQuiz();
        return;
      }
    }

    setAnswersGiven(prev => [...prev, ...newAnswers]);
    setLocalAnswers({});
    setShowHint(false);

    if (groupMode) {
      if (currentGroupIndex + 1 < groupedQuestions.length) {
        setCurrentGroupIndex(i => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onFinish && onFinish([...answersGiven, ...newAnswers]);
      }
    } else {
      if (currentQuestionIndex + 1 < preparedQuestions.length) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onFinish && onFinish([...answersGiven, ...newAnswers]);
      }
    }
  };

  if (!preparedQuestions.length) return (
    <p className="text-center text-gray-600 mt-10">Nessuna domanda disponibile.</p>
  );

  return (
    <div className={`max-w-3xl mx-auto p-6 rounded-lg shadow-lg h-[85vh] flex flex-col
      ${soulsLike ? "bg-red-50 border-red-400" : "bg-white border-blue-200"} border`}>
      {quizMode === "tempo" && (
        <div className={`mb-4 text-right font-semibold ${soulsLike ? "text-red-700" : "text-blue-700"}`}>
          Tempo rimasto: {timeLeft}s
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${soulsLike ? "text-red-800" : "text-blue-800"}`}>
          {groupMode
            ? `Gruppo ${currentGroupIndex + 1} / ${groupedQuestions.length}`
            : `Domanda ${currentQuestionIndex + 1} / ${preparedQuestions.length}`}
        </h3>
        <button
          className={`px-3 py-1 rounded border font-semibold text-sm
            ${soulsLike ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
          onClick={() => setShowHint(prev => !prev)}
        >
          {showHint ? "Nascondi Suggerimento" : "Mostra Suggerimento"}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-6">
        {currentGroup.map((q, qIdx) => (
          <div key={q.id} className={`p-4 rounded-lg border shadow-sm
            ${soulsLike ? "border-red-500 bg-red-100" : "border-blue-200 bg-white"}`}>
            <p className={`text-lg font-semibold mb-3 whitespace-pre-wrap`}>
              {groupMode ? `${qIdx + 1}. ` : ""}{q.question}
            </p>

            {q.img && <ImageRender src={q.img} alt="Immagine domanda" className="max-h-48 rounded-lg mb-3 object-contain shadow" />}

            <ul className="space-y-2">
              {q.answers.map((a, i) => {
                const isSelected = localAnswers[q.id] === i;
                const isCorrect = a.correct && showHint;
                return (
                  <li
                    key={i}
                    onClick={() => handleAnswerSelect(q.id, i)}
                    className={`cursor-pointer rounded-lg p-3 border transition
                      ${isSelected
                        ? soulsLike
                          ? "bg-red-600 text-white border-red-700"
                          : "bg-blue-600 text-white border-blue-700"
                        : isCorrect
                          ? soulsLike
                            ? "bg-red-400 text-white border-red-700 animate-pulse"
                            : "bg-green-200 border-green-600 relative"
                          : soulsLike
                            ? "bg-red-50 border-red-300 hover:border-red-500"
                            : "bg-white border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    {a.text}
                    {isCorrect && !soulsLike && (
                      <span className="ml-2 text-yellow-500">⭐</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onExitQuiz}
          className={`px-4 py-2 rounded font-semibold transition
            ${soulsLike ? "bg-red-300 hover:bg-red-400 text-red-800" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}>
          Esci
        </button>
        <button
          onClick={() => handleSubmit()}
          className={`px-6 py-2 rounded font-semibold transition
            ${soulsLike ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          {groupMode
            ? currentGroupIndex + 1 === groupedQuestions.length
              ? "Termina Quiz"
              : "Prossimo Gruppo"
            : currentQuestionIndex + 1 === preparedQuestions.length
              ? "Termina Quiz"
              : "Domanda Successiva"}
        </button>
      </div>
    </div>
  );
}
