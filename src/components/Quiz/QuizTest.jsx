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
  soulsLike = false, // 🔹 nuova prop
  onFinish,
  onExitQuiz
}) {
  const allQuestions = useMemo(
    () => lessons.flatMap(lesson => lesson.questions),
    [lessons]
  );

  // 🔹 Preparo domande
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

  // 🔹 Se groupMode => divido in blocchi
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
  const [answersGiven, setAnswersGiven] = useState([]);
  const [localAnswers, setLocalAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
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
          handleSubmitGroup(true);
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

  // 🔹 Reset completo (SoulsLike)
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setCurrentGroupIndex(0);
    setAnswersGiven([]);
    setLocalAnswers({});
  };

  const handleSubmitGroup = (timeUp = false) => {
    if (!timeUp && groupMode) {
      const allAnswered = currentGroup.every(q => localAnswers[q.id] !== undefined);
      if (!allAnswered) {
        showQuizModal({text:"Rispondi a tutte le domande del gruppo prima di procedere"});
        return;
      }
    }

    const newAnswers = currentGroup.map(q => ({
      questionId: q.id,
      answerIndex: localAnswers[q.id] ?? null
    }));

    // 🔹 SoulsLike: se sbagli, resetta
    if (!groupMode && soulsLike) {
      const justAnswered = newAnswers[0];
      const q = preparedQuestions[currentQuestionIndex];
      if (
        justAnswered.answerIndex !== null &&
        !q.answers[justAnswered.answerIndex]?.isCorrect
      ) {
        showQuizModal({text:"❌ Hai sbagliato! SoulsLike mode: ricominci da capo!"});
        resetQuiz();
        return;
      }
    }

    const updatedAnswers = [...answersGiven, ...newAnswers];
    setAnswersGiven(updatedAnswers);
    setLocalAnswers({});

    if (groupMode) {
      if (currentGroupIndex + 1 < groupedQuestions.length) {
        setCurrentGroupIndex(i => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onFinish && onFinish(updatedAnswers);
      }
    } else {
      if (currentQuestionIndex + 1 < preparedQuestions.length) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onFinish && onFinish(updatedAnswers);
      }
    }
  };

  if (!preparedQuestions.length) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Nessuna domanda disponibile.
      </p>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto p-6 rounded-lg shadow-lg h-[85vh] flex flex-col
    ${soulsLike ? "bg-red-50 border-red-400" : "bg-white border-blue-200"} 
    border`}
    >
      {quizMode === "tempo" && (
        <div className={`mb-4 text-right font-semibold ${soulsLike ? "text-red-700" : "text-blue-700"
          }`}>
          Tempo rimasto: {timeLeft}s
        </div>
      )}

      <h3 className={`text-xl font-bold mb-4 ${soulsLike ? "text-red-800" : "text-blue-800"
        }`}>
        {groupMode
          ? `Gruppo ${currentGroupIndex + 1} / ${groupedQuestions.length}`
          : `Domanda ${currentQuestionIndex + 1} / ${preparedQuestions.length}`}
      </h3>

      <div
        className={`flex-grow overflow-y-auto pr-2 space-y-8`}
      >
        <div className="w-full max-w-2xl">
          {currentGroup.map((q, qIdx) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg border shadow-sm
            ${soulsLike ? "border-red-500 bg-red-100" : "border-blue-200 bg-white"}`}
            >
              <p className={`text-lg font-semibold mb-3 whitespace-pre-wrap ${soulsLike ? "text-red-900" : ""
                }`}>
                {groupMode ? `${qIdx + 1}. ` : ""}{q.question}
              </p>

              {q.img && (
                <ImageRender
                  src={q.img}
                  alt="Immagine domanda"
                  className={`max-h-48 rounded-lg mb-3 object-contain shadow
                ${soulsLike ? "border-red-500" : "border-blue-300"}`}
                  loading="lazy"
                />
              )}

              <ul className="space-y-2">
                {q.answers.map((a, i) => {
                  const isSelected = localAnswers[q.id] === i;
                  return (
                    <li
                      key={i}
                      onClick={() => handleAnswerSelect(q.id, i)}
                      className={`cursor-pointer rounded-lg p-3 border transition
                    ${isSelected
                          ? soulsLike
                            ? "bg-red-600 text-white border-red-700"
                            : "bg-blue-600 text-white border-blue-700"
                          : soulsLike
                            ? "bg-red-50 border-red-300 hover:border-red-500"
                            : "bg-white border-gray-300 hover:border-blue-400"
                        }`}
                    >
                      {a.text}
                      {a.img && (
                        <ImageRender
                          src={a.img}
                          alt={`Immagine risposta ${i + 1}`}
                          className={`max-h-20 mt-2 rounded-md object-contain shadow-sm
                        ${soulsLike ? "border-red-400" : "border-gray-300"}`}
                          loading="lazy"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onExitQuiz}
          className={`px-4 py-2 rounded font-semibold transition
        ${soulsLike ? "bg-red-300 hover:bg-red-400 text-red-800" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}
        >
          Esci
        </button>
        <button
          onClick={() => handleSubmitGroup()}
          className={`px-6 py-2 rounded font-semibold transition
        ${soulsLike ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
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
