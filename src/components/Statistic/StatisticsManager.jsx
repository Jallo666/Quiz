import React, { useEffect, useState } from "react";
import statisticService from "../../services/statisticService";
import lessonService from "../../services/questionService";
import QuizResults from "../Quiz/QuizResults";

export default function StatisticsManager() {
    const [stats, setStats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [viewMode, setViewMode] = useState("detail"); // 'detail' | 'errors'
    const [wrongStats, setWrongStats] = useState([]);

    const loadStats = async () => {
        const data = await statisticService.getAll();
        setStats(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        // Aggrega tutti gli errori di tutti i quiz
        const errorMap = new Map();
        const lessonMap = new Map();

        for (const quiz of data) {
            if (!quiz.results) continue;
            for (const r of quiz.results) {
                if (!r.correct) {
                    errorMap.set(r.questionId, (errorMap.get(r.questionId) || 0) + 1);
                    if (!lessonMap.has(r.questionId)) {
                        lessonMap.set(r.questionId, r.lessonNumber || r.questionId.split("-")[0]);
                    }
                }
            }
        }

        const questionIds = Array.from(errorMap.keys());
        const lessonsCache = new Map();

        const errorsList = await Promise.all(
            questionIds.map(async (qid) => {
                const lessonNumber = lessonMap.get(qid);
                let lesson = lessonsCache.get(lessonNumber);
                if (!lesson) {
                    lesson = await lessonService.getLesson(lessonNumber);
                    if (lesson) lessonsCache.set(lessonNumber, lesson);
                }
                const question = lesson?.questions.find((q) => q.id === qid);
                return {
                    id: qid,
                    text: question ? question.question : `Domanda ${qid}`,
                    count: errorMap.get(qid),
                };
            })
        );

        errorsList.sort((a, b) => b.count - a.count);
        setWrongStats(errorsList);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleSelect = async (result) => {
        setSelected(result);
        if (!result.lessonIds || result.lessonIds.length === 0) {
            setLessons([]);
            return;
        }

        setLoadingLessons(true);
        const lessonsData = await Promise.all(
            result.lessonIds.map((id) => lessonService.getLesson(id))
        );
        setLessons(lessonsData.filter(Boolean));
        setLoadingLessons(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Vuoi davvero eliminare questo risultato?")) {
            await statisticService.deleteResult(id);
            if (selected?.id === id) {
                setSelected(null);
                setLessons([]);
            }
            loadStats();
        }
    };

    const handleClearAll = async () => {
        if (window.confirm("Vuoi davvero cancellare TUTTE le statistiche?")) {
            await statisticService.clearAll();
            setSelected(null);
            setLessons([]);
            loadStats();
        }
    };

    // MOCK: salva come lezione
const handleSaveGlobalErrorsAsLesson = async () => {
  if (wrongStats.length === 0) {
    alert("Non ci sono domande sbagliate da salvare!");
    return;
  }

  // Flatten tutte le domande disponibili dai lessons caricati
  const allQuestions = lessons.flatMap(l => l.questions);
  const questionsToSave = wrongStats.map(q => {
    const fullQuestion = allQuestions.find(fq => fq.id === q.id);
    return fullQuestion || { id: q.id, question: q.text, answers: [] }; // fallback
  });

  const now = new Date();
  const lessonNumber = `Quiz ${now.toLocaleString()}`;

  const lesson = {
    lessonNumber,
    questions: questionsToSave,
  };

  try {
    await lessonService.addLesson(lesson);
    alert(`✅ Lezione "${lessonNumber}" creata con ${questionsToSave.length} domande sbagliate.`);
  } catch (err) {
    console.error("Errore salvando lezione:", err);
    alert("❌ Errore durante il salvataggio della lezione.");
  }
};



    return (
        <div className="mt-6 grid grid-cols-3 gap-6">
            {/* Colonna sinistra: lista risultati */}
            <div className="col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Statistiche Quiz</h3>
                    {stats.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition"
                        >
                            Cancella Tutto
                        </button>
                    )}
                </div>

                {stats.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center mt-10">Nessun risultato salvato.</p>
                ) : (
                    <div className="overflow-auto max-h-[500px]">
                        <ul className="space-y-2">
                            {stats.map((s) => (
                                <li
                                    key={s.id}
                                    className={`p-3 rounded-xl cursor-pointer border ${selected?.id === s.id
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                        } transition`}
                                    onClick={() => handleSelect(s)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-700 font-medium">{new Date(s.createdAt).toLocaleString()}</p>
                                            <p className="text-gray-500 text-sm">
                                                {s.correctCount}/{s.total} ({s.percentage}%)
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(s.id);
                                            }}
                                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                        >
                                            Elimina
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Colonna destra: dettaglio / errori */}
            <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`flex-1 text-center py-2 rounded-t-xl font-medium transition ${viewMode === "detail"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setViewMode("detail")}
                    >
                        Dettaglio Quiz
                    </button>
                    <button
                        className={`flex-1 text-center py-2 rounded-t-xl font-medium transition ${viewMode === "errors"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setViewMode("errors")}
                    >
                        Errori Totali
                    </button>
                </div>

                {/* Contenuto */}
                <div className="flex-1 overflow-auto">
                    {viewMode === "detail" ? (
                        selected ? (
                            loadingLessons ? (
                                <p className="text-gray-500 text-sm">Caricamento lezioni...</p>
                            ) : (
                                <>
                                    <QuizResults
                                        results={selected.results}
                                        lessons={lessons}
                                        highlightErrors
                                    />

                                </>
                            )
                        ) : (
                            <p className="text-gray-400 text-sm text-center mt-10">
                                Seleziona un risultato dalla lista per vedere i dettagli.
                            </p>
                        )
                    ) : (
                        <div className="overflow-auto max-h-[500px] flex flex-col">
                            {wrongStats.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center mt-10">Non ci sono domande sbagliate.</p>
                            ) : (
                                <>
                                    <ul className="space-y-2 mb-4">
                                        {wrongStats.map((q) => (
                                            <li
                                                key={q.id}
                                                className="p-3 flex justify-between items-center bg-white rounded-xl border border-gray-200 shadow-sm"
                                            >
                                                <span className="text-gray-800 font-medium">{q.text}</span>
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                                    Sbagliata {q.count} {q.count > 1 ? "volte" : "volta"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Pulsante salva tutti gli errori come lezione mock */}
                                    <div className="flex justify-end">
<div className="flex justify-end mt-2">
  <button
    onClick={handleSaveGlobalErrorsAsLesson}
    className="px-4 py-2 bg-purple-100 text-purple-800 font-semibold rounded-lg shadow hover:bg-purple-200 transition"
  >
    Salva Errori Come Lezione
  </button>
</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
