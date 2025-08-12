import React, { useState, useEffect, useRef } from "react";

export default function QuizTest({
  lessons,          // array di lezioni con domande
  quizMode,         // 'oltranza' | 'tempo' | 'numero'
  timeLimit,        // secondi, se quizMode === 'tempo'
  maxQuestions,     // numero max di domande se quizMode === 'numero'
  onFinish,         // callback(datiRisultato) al termine quiz
}) {
  // Flatten tutte le domande da tutte le lezioni
  const allQuestions = lessons.flatMap((lesson) => lesson.questions);

  // Se quizMode 'numero', limito domande a maxQuestions, altrimenti tutte
  const questions =
    quizMode === "numero"
      ? allQuestions.slice(0, maxQuestions)
      : allQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answersGiven, setAnswersGiven] = useState([]); // { questionId, answerIndex }
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef(null);

  // Timer effetto solo se modalità tempo
  useEffect(() => {
    if (quizMode === "tempo") {
      setTimeLeft(timeLimit);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleNext();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizMode, timeLimit, currentIndex]);

  const handleAnswerSelect = (index) => {
    setSelectedAnswerIndex(index);
  };

  const handleNext = () => {
    if (selectedAnswerIndex !== null) {
      // Salvo risposta
      const currentQuestion = questions[currentIndex];
      setAnswersGiven((prev) => [
        ...prev,
        { questionId: currentQuestion.id, answerIndex: selectedAnswerIndex },
      ]);
    } else if (quizMode !== "tempo") {
      // Se non selezionata risposta, in modalità tempo si passa comunque
      alert("Seleziona una risposta per continuare");
      return;
    }

    setSelectedAnswerIndex(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Fine quiz
      if (timerRef.current) clearInterval(timerRef.current);
      onFinish && onFinish(answersGiven);
    }
  };

  if (questions.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">Nessuna domanda disponibile.</p>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Timer */}
      {quizMode === "tempo" && (
        <div className="mb-4 text-right font-semibold text-blue-700">
          Tempo rimasto: {timeLeft}s
        </div>
      )}

      {/* Domanda */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3 text-blue-800">
          Domanda {currentIndex + 1} / {questions.length}
        </h3>
        <p className="text-lg font-semibold mb-4 whitespace-pre-wrap">{currentQuestion.question}</p>
        {currentQuestion.img && (
          <img
            src={currentQuestion.img}
            alt="Immagine domanda"
            className="max-h-48 rounded-lg mb-4 object-contain border border-blue-300 shadow"
            loading="lazy"
          />
        )}

        {/* Risposte */}
        <ul className="space-y-3">
          {currentQuestion.answers.map((a, i) => {
            const isSelected = i === selectedAnswerIndex;
            return (
              <li
                key={i}
                onClick={() => handleAnswerSelect(i)}
                className={`cursor-pointer rounded-lg p-3 border transition
                  ${isSelected ? "bg-blue-600 text-white border-blue-700" : "bg-white border-gray-300 hover:border-blue-400"}
                `}
              >
                {a.text}
                {a.img && (
                  <img
                    src={a.img}
                    alt={`Immagine risposta ${i + 1}`}
                    className="max-h-20 mt-2 rounded-md object-contain border border-gray-300 shadow-sm"
                    loading="lazy"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pulsante avanti o termina */}
      <div className="text-right">
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          {currentIndex + 1 === questions.length ? "Termina Quiz" : "Prossima Domanda"}
        </button>
      </div>
    </div>
  );
}
