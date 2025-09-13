// QuizResults.jsx
import React from "react";
import ImageRender from "../Images/ImageRender";

export default function QuizResults({ results, lessons }) {
  if (!results || results.length === 0) {
    return <p className="text-gray-600 text-sm">Nessun risultato da mostrare.</p>;
  }

  // Flatten tutte le domande delle lezioni selezionate
  const allQuestions = lessons.flatMap(l => l.questions);

  const getQuestionData = (id) => allQuestions.find(q => q.id === id);

  // Calcola percentuale corrette
  const total = results.length;
  const correctCount = results.filter(r => {
    const q = getQuestionData(r.questionId);
    if (!q) return false;
    const correctIndex = q.answers.findIndex(a => a.correct);
    return r.answerIndex === correctIndex;
  }).length;

  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-green-700 text-lg">Risultati Quiz</h4>
        <div className="font-semibold text-green-800">
          {correctCount} / {total} corrette ({percentage}%)
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-auto pr-2">
        {results.map((r, i) => {
          const q = getQuestionData(r.questionId);
          if (!q) return null;

          const correctIndex = q.answers.findIndex(a => a.correct);
          const isCorrect = r.answerIndex === correctIndex;

          return (
            <div
              key={i}
              className={`p-4 rounded-lg border ${isCorrect ? "border-green-400 bg-green-100" : "border-red-400 bg-red-100"}`}
            >
              <p className="font-medium text-green-900 mb-2">{i + 1}. {q.question}</p>

              {q.img && (
                <ImageRender
                  src={q.img}
                  alt="Immagine domanda"
                  className="w-full max-h-48 rounded-lg mt-1 object-contain shadow"
                />
              )}

              <ul className="mt-2 space-y-1">
                {q.answers.map((a, idx) => (
                  <li
                    key={idx}
                    className={`px-2 py-1 rounded text-sm flex items-center gap-2 ${
                      idx === correctIndex
                        ? "bg-green-200 font-semibold"
                        : idx === r.answerIndex
                        ? "bg-red-200"
                        : "text-gray-700"
                    }`}
                  >
                    {idx + 1}. {a.text}
                    {a.img && (
                      <ImageRender
                        src={a.img}
                        alt="Immagine risposta"
                        className="w-full max-h-48 rounded-lg mt-2 object-contain shadow"
                      />
                    )}
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-sm">
                Tua risposta: {r.answerIndex !== null ? r.answerIndex + 1 : "Non selezionata"} {isCorrect ? "✅" : "❌"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
