function extractImageUrl(htmlString) {
  if (!htmlString) return null;
  const match = htmlString.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

export function remapRawSource(source) {
  if (!source) throw new Error("Formato sorgente non valido");

  return Object.entries(source).map(([lessonNumber, questions]) => ({
    lessonNumber,
    questions: questions.map((q, qIndex) => {
      const questionImg = extractImageUrl(q.question);
      const questionText = q.question.replace(/<img[^>]*>/gi, "").trim();
      const questionId = `${lessonNumber}-question-${qIndex + 1}`;

      const answers = q.answers.map((a, aIndex) => {
        const answerImg = extractImageUrl(a.answer);
        const answerText = a.answer.replace(/<img[^>]*>/gi, "").trim();

        return {
          id: `${questionId}-answer-${aIndex + 1}`,
          text: answerText,
          correct: Number(q.correct_answer) - 1 === aIndex,
          img: answerImg,
        };
      });

      return {
        id: questionId,
        question: questionText,
        img: questionImg,
        answers,
      };
    }),
  }));
}
