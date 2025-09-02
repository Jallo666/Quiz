import questionService from '../../services/questionService';
import imageService from '../../services/imageService';

export async function importQuestionsWithProgress(lessons, { replaceAll = false, onProgress }) {
  if (replaceAll) {
    await questionService.clearAll();
  }

  const total = lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
  let done = 0;

  for (const lesson of lessons) {
    await questionService.addLesson({ lessonNumber: lesson.lessonNumber, questions: [] });

    for (const q of lesson.questions) {
      // gestione immagine della domanda
      if (q.img && q.img.length) {
        const imgId = crypto.randomUUID();
        await imageService.addImage({
          id: imgId,
          base64: q.img,
          questions: [q.id],
          answers: [],
        });
        q.img = 'imageId:'+imgId; // <-- qui il cambiamento
      }

      // gestione immagini delle risposte
      for (const a of q.answers) {
        if (a.img && a.img.length) {
          const ansImgId = crypto.randomUUID();
          await imageService.addImage({
            id: ansImgId,
            base64: a.img,
            questions: [],
            answers: [a.id],
          });
          a.img = 'imageId:'+ansImgId; // <-- qui il cambiamento
        }
      }

      await questionService.addQuestion(lesson.lessonNumber, q);

      done++;
      if (onProgress) onProgress(done, total);
    }
  }
}
