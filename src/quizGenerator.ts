import { QuizQuestion } from './types';

// Algoritmo determinista para generar un quiz basado en el texto de la clase cuando no hay internet
export function generateLocalQuizFallback(text: string, lang = 'es'): QuizQuestion[] {
  const cleanText = text.trim();
  if (!cleanText) return [];

  // Dividir en oraciones significativas
  const sentences = cleanText
    .split(/(?<=[.?!])\s+/)
    .filter(s => s.trim().length > 15 && s.trim().length < 150); // Oraciones no muy cortas ni larguísimas

  if (sentences.length === 0) return [];

  const questions: QuizQuestion[] = [];
  
  // Barajar las oraciones (semi-random predecible)
  const shuffled = sentences.sort(() => 0.5 - Math.random());
  
  // Tomar hasta 3 oraciones para hacer un quiz rápido
  const selectedSentences = shuffled.slice(0, 3);

  selectedSentences.forEach((sentence, index) => {
    // Buscar una palabra importante (sustantivos largos)
    const words = sentence.split(' ').map(w => w.replace(/[.,?!]/g, ''));
    const longWords = words.filter(w => w.length >= 6);
    
    if (longWords.length > 0) {
      // Elegimos la primera palabra larga como la respuesta
      const targetWord = longWords[Math.floor(Math.random() * longWords.length)];
      
      // Armar la pregunta "fill_blank"
      const questionText = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '__________');

      const questionPrefix = lang === 'en' ? 'Complete the sentence:\n' : 'Completa la frase:\n';
      const explanationText = lang === 'en' ? 'Question generated from the class notes.' : 'Pregunta generada a partir de los apuntes de la clase.';

      questions.push({
        id: `local-q-${index}-${Date.now()}`,
        type: 'fill_blank',
        question: `${questionPrefix}"${questionText}"`,
        correctAnswer: targetWord,
        explanation: explanationText
      });
    }
  });

  // Agregar una pregunta genérica de verdadero o falso si tenemos menos de 3
  if (questions.length < 3) {
    const isEn = lang === 'en';
    questions.push({
      id: `local-q-tf-${Date.now()}`,
      type: 'true_false',
      question: isEn ? 'The teacher gave a class with clear and concise content.' : 'El profesor impartió una clase con contenido claro y conciso.',
      correctAnswer: isEn ? 'True' : 'Verdadero',
      options: isEn ? ['True', 'False'] : ['Verdadero', 'Falso'],
      explanation: isEn ? 'This is an auto-generated control question.' : 'Esta es una pregunta autogenerada de control.'
    });
  }

  return questions;
}
