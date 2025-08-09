import React, { useState, useEffect, useRef } from "react";

export default function QuizApp() {
  const [data, setData] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [baseQuestionSet, setBaseQuestionSet] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [soulslike, setSoulslike] = useState(false);
  const [shuffle, setShuffle] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [customCount, setCustomCount] = useState("");
  const [basketMode, setBasketMode] = useState(false);
  const [resultsMode, setResultsMode] = useState(false);

  const fileInputRef = useRef(null);

  // Caricamento iniziale da localStorage
  useEffect(() => {
    const stored = localStorage.getItem("quizData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setMessage("Domande caricate da memoria locale.");
      } catch {
        localStorage.removeItem("quizData");
      }
    }
  }, []);

  const saveQuestionsToStorage = (newData) => {
    setData(newData);
    localStorage.setItem("quizData", JSON.stringify(newData));
  };

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const getRandomQuestions = (arr, num) => {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < num; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  };

  const handleFileLoad = () => {
    if (!fileInputRef.current.files.length) {
      setMessage("Seleziona un file JSON");
      return;
    }
    const file = fileInputRef.current.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let newData = [];
        if (Array.isArray(parsed) && parsed[0]?.question_text) {
          const formatted = parsed.map((d) => ({
            question: d.question_text,
            img: d.image_path || null,
            answers: d.options.map((opt) => ({
              text: opt,
              correct: opt === d.correct_answer,
            })),
            explanation: d.explanation || "",
          }));
          const chunks = [];
          for (let i = 0; i < formatted.length; i += 10) {
            chunks.push(formatted.slice(i, i + 10));
          }
          chunks.forEach((chunk, index) => {
            newData.push({
              lessonNumber: `INEDITE ${index + 1}`,
              questions: chunk,
            });
          });
          setMessage(`Inedite caricate in ${chunks.length} lezioni da 10 domande`);
        } else if (Array.isArray(parsed)) {
          newData = parsed;
          setMessage("File caricato con successo!");
        } else {
          throw new Error("Formato JSON non riconosciuto");
        }
        saveQuestionsToStorage(newData);
      } catch (err) {
        setMessage("Errore nel parsing JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const startCustomQuiz = () => {
    if (!selectedLessons.length) {
      setMessage("Seleziona almeno una lezione");
      return;
    }
    let selectedData = data.filter((l) => selectedLessons.includes(l.lessonNumber));
    let allQuestions = selectedData.flatMap((l) => l.questions);
    const count = parseInt(customCount);
    if (count && count > 0) {
      if (count > allQuestions.length) {
        setMessage("Numero di domande richiesto superiore al totale");
        return;
      }
      allQuestions = getRandomQuestions(allQuestions, count);
    }
    setBaseQuestionSet(allQuestions);
    generateQuizFromBase(allQuestions);
  };

  const generateQuizFromBase = (questions) => {
    let qCopy = [...questions];
    if (shuffle) qCopy = shuffleArray(qCopy);
    qCopy = qCopy.map((q) => ({
      ...q,
      answers: shuffleArray([...q.answers]),
    }));
    setQuizQuestions(qCopy);
    setCurrentIndex(0);
    setUserAnswers(new Array(qCopy.length).fill(null));
    setResultsMode(false);
    setBasketMode(false);
  };

  const handleAnswer = (selectedIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = selectedIndex;
    setUserAnswers(newAnswers);
    const correctIndex = quizQuestions[currentIndex].answers.findIndex((a) => a.correct);
    if (soulslike && selectedIndex !== correctIndex) {
      generateQuizFromBase(baseQuestionSet);
      return;
    }
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setResultsMode(true);
    }
  };

  const dedupeQuestions = () => {
    if (!data.length) {
      setMessage("Nessuna domanda da processare.");
      return;
    }
    const seen = new Map();
    let removed = 0;
    data.forEach((lesson) => {
      lesson.questions.forEach((q) => {
        const key = q.question.trim().toLowerCase();
        const existing = seen.get(key);
        const hasPlaceholders = q.answers.some((a) => a.text.includes("???"));
        if (!existing) {
          seen.set(key, { q, hasPlaceholders });
        } else {
          if (existing.hasPlaceholders && !hasPlaceholders) {
            seen.set(key, { q, hasPlaceholders });
          } else {
            removed++;
          }
        }
      });
    });
    const allQs = Array.from(seen.values()).map((e) => e.q);
    const newChunks = [];
    for (let i = 0; i < allQs.length; i += 10) {
      newChunks.push(allQs.slice(i, i + 10));
    }
    const newData = newChunks.map((chunk, idx) => ({
      lessonNumber: `DEDUPED ${idx + 1}`,
      questions: chunk,
    }));
    saveQuestionsToStorage(newData);
    setMessage(`Rimossi ${removed} duplicati. Ora ci sono ${allQs.length} domande uniche.`);
  };

  const exportSelected = () => {
    if (!data.length) {
      setMessage("Nessuna domanda da esportare.");
      return;
    }
    if (!selectedLessons.length) {
      setMessage("Seleziona almeno una lezione da esportare.");
      return;
    }
    const filteredData = data.filter((lesson) => selectedLessons.includes(lesson.lessonNumber));
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "domande_selezionate.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const showBasket = () => {
    if (!selectedLessons.length) {
      setMessage("Seleziona almeno una lezione");
      return;
    }
    let allQuestions = data
      .filter((l) => selectedLessons.includes(l.lessonNumber))
      .flatMap((l) => l.questions);
    if (shuffle) allQuestions = shuffleArray(allQuestions);
    setBaseQuestionSet(allQuestions);
    setBasketMode(true);
    setResultsMode(false);
    setQuizQuestions(allQuestions);
  };

  const correctIndex = quizQuestions[currentIndex]?.answers.findIndex((a) => a.correct);

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <h1 className="text-3xl font-bold p-4 text-center bg-white shadow">Quiz Domande Personalizzato</h1>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white p-4 border-r overflow-auto space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Carica file JSON:</label>
            <input type="file" ref={fileInputRef} accept=".json" className="mb-4 block w-full p-2 border rounded" />
            <button onClick={handleFileLoad} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Carica Domande</button>
          </div>
          {data.length > 0 && (
            <>
              <label className="block font-semibold">Seleziona Lezioni:</label>
              <button onClick={() => setSelectedLessons(data.map((l) => l.lessonNumber))} className="text-sm text-blue-600 hover:underline">Seleziona tutte</button>
              <select multiple value={selectedLessons} onChange={(e) => setSelectedLessons(Array.from(e.target.selectedOptions).map((o) => o.value))} className="w-full p-2 border rounded h-32">
                {data.map((lesson) => (
                  <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
                    {`Lezione ${lesson.lessonNumber} (${lesson.questions.length})`}
                  </option>
                ))}
              </select>
              <label className="block font-semibold">Numero di domande:</label>
              <input type="number" value={customCount} onChange={(e) => setCustomCount(e.target.value)} className="w-full p-2 border rounded" min="1" />
              <label className="inline-flex items-center">
                <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="mr-2" /> Mescola domande
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" checked={soulslike} onChange={(e) => setSoulslike(e.target.checked)} className="mr-2" /> Modalità Souls-like
              </label>
              <button onClick={startCustomQuiz} className="bg-purple-600 text-white py-2 rounded w-full">Inizia Quiz</button>
              {selectedLessons.length > 0 && (
                <button onClick={showBasket} className="bg-yellow-600 text-white py-2 rounded w-full">Apri Paniere (ripasso)</button>
              )}
              <button onClick={() => { localStorage.removeItem("quizData"); setData([]); setSelectedLessons([]); }} className="bg-red-600 text-white py-2 rounded w-full">Cancella Tutte le Domande Salvate</button>
              <button onClick={exportSelected} className="bg-green-600 text-white py-2 rounded w-full">Esporta Domande in JSON</button>
              <button onClick={dedupeQuestions} className="bg-yellow-500 text-white py-2 rounded w-full">Cancella Doppioni ({data.flatMap(l => l.questions).length} domande)</button>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {message && <div className="text-center text-red-600 font-semibold mb-4">{message}</div>}

          {/* Quiz Mode */}
          {!resultsMode && !basketMode && quizQuestions.length > 0 && (
            <div className="bg-white p-6 rounded shadow">
              <div className="mb-4 text-lg font-semibold">Domanda {currentIndex + 1} di {quizQuestions.length}:</div>
              <div className="mb-6">{quizQuestions[currentIndex].question}</div>
              {quizQuestions[currentIndex].img && <img src={quizQuestions[currentIndex].img} alt="" className="mb-6 max-h-64 mx-auto" />}
              {quizQuestions[currentIndex].answers.map((a, i) => (
                <label key={i} className={`block cursor-pointer p-2 rounded ${userAnswers[currentIndex] === i ? (i === correctIndex ? "bg-green-200" : "bg-red-200") : "hover:bg-blue-50"}`} onClick={() => handleAnswer(i)}>
                  <input type="radio" readOnly checked={userAnswers[currentIndex] === i} className="mr-2" /> {a.text}
                </label>
              ))}
            </div>
          )}

          {/* Results Mode */}
          {resultsMode && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Risultati</h2>
              <p className="mb-6">
                Hai risposto correttamente a{" "}
                <strong>{userAnswers.filter((ans, i) => ans === quizQuestions[i].answers.findIndex((a) => a.correct)).length}</strong> su <strong>{quizQuestions.length}</strong> domande.
              </p>
              <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-5 py-2 rounded">Ricomincia</button>
            </div>
          )}

          {/* Basket Mode */}
          {basketMode && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Paniere - Domande e Risposte</h2>
              <button onClick={() => setBasketMode(false)} className="mb-4 bg-red-600 text-white px-4 py-2 rounded">Chiudi Paniere</button>
              <div className="space-y-6">
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="border-b pb-4">
                    <div className="font-semibold mb-2">Domanda {idx + 1}:</div>
                    <div className="mb-2">{q.question}</div>
                    {q.img && <img src={q.img} alt="" className="mb-4 max-h-64" />}
                    <ul className="list-disc ml-5">
                      {q.answers.map((a, i) => (
                        <li key={i} className={a.correct ? "font-bold text-green-700" : ""}>{a.text}</li>
                      ))}
                    </ul>
                    {q.explanation && <div className="mt-2 text-sm text-gray-600 italic">Spiegazione: {q.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
