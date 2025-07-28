(() => {
  const lessons = document.querySelectorAll('.lesson-content');
  const allResults = [];

  lessons.forEach(lesson => {
    const lessonTitle = lesson.querySelector('h2').textContent.trim();
    const lessonNumberMatch = lessonTitle.match(/Lezione:\s*(\d+)/i);
    const lessonNumber = lessonNumberMatch ? lessonNumberMatch[1] : null;

    const rows = lesson.querySelectorAll('table tbody tr');
    const questions = [];

    rows.forEach((row, index) => {
      const questionCell = row.querySelector('td:first-child');
      const answersCell = row.querySelector('td:last-child');

      // Estrai l'immagine dalla domanda, se presente
      const imgTag = questionCell.querySelector('img');
      const questionImg = imgTag ? imgTag.src : "";

      // Estrai il testo della domanda rimuovendo "DOMANDA X:" e qualsiasi immagine
      const rawQuestionHTML = questionCell.innerHTML
        .replace(/<img[^>]*>/g, '') // rimuovi l'immagine
        .replace(/<br\s*\/?>/gi, '') // rimuovi <br>
        .replace(/^\s*DOMANDA \d+:\s*/i, '')
        .trim();

      const questionText = rawQuestionHTML.replace(/<\/?[^>]+(>|$)/g, "").trim(); // togli HTML rimanente

      // Estrai le risposte
      const answers = [];
      answersCell.querySelectorAll('li').forEach(li => {
        const isCorrect = li.textContent.includes('[CORRETTA]');
        const text = li.textContent.replace('[CORRETTA]', '').trim();
        answers.push({
          text,
          correct: isCorrect,
          img: ""  // campo immagine risposta, vuoto per ora
        });
      });

      questions.push({
        id: `${lessonNumber}-question-${index + 1}`,
        question: questionText,
        img: questionImg,
        answers: answers
      });
    });

    allResults.push({
      lessonNumber,
      questions
    });
  });

  console.log(JSON.stringify(allResults, null, 2));
  return allResults;
})();
(() => {
  const lessons = document.querySelectorAll('.lesson-content');
  const allResults = [];

  lessons.forEach(lesson => {
    const lessonTitle = lesson.querySelector('h2').textContent.trim();
    const lessonNumberMatch = lessonTitle.match(/Lezione:\s*(\d+)/i);
    const lessonNumber = lessonNumberMatch ? lessonNumberMatch[1] : null;

    const rows = lesson.querySelectorAll('table tbody tr');
    const questions = [];

    rows.forEach((row, index) => {
      const questionCell = row.querySelector('td:first-child');
      const answersCell = row.querySelector('td:last-child');

      // Estrai immagine domanda, se presente
      const imgTag = questionCell.querySelector('img');
      const questionImg = imgTag ? imgTag.src : "";

      // Estrai solo il testo (senza HTML e DOMANDA X:)
      let rawText = questionCell.textContent.trim();
      rawText = rawText.replace(/^DOMANDA\s*\d+:\s*/i, '').trim();

      // Estrai le risposte
      const answers = [];
      answersCell.querySelectorAll('li').forEach(li => {
        const isCorrect = li.textContent.includes('[CORRETTA]');
        const text = li.textContent.replace('[CORRETTA]', '').trim();

        // Potresti estrarre immagine se le risposte ne avranno (attualmente lasciamo img vuoto)
        answers.push({
          text,
          correct: isCorrect,
          img: ""
        });
      });

      questions.push({
        id: `${lessonNumber}-question-${index + 1}`,
        question: rawText,
        img: questionImg,
        answers: answers
      });
    });

    allResults.push({
      lessonNumber,
      questions
    });
  });

  console.log(JSON.stringify(allResults, null, 2));
  return allResults;
})();
