import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, gradeLevel, duration, lang } = req.body;

  if (!topic || !gradeLevel || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment variables' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const isEn = lang === 'en';
  const prompt = isEn 
    ? `You are an expert teacher's assistant. Create a highly detailed lesson plan and a ready-to-read teleprompter script for a class.
       Topic: ${topic}
       Grade Level: ${gradeLevel}
       Estimated Duration: ${duration}
       
       Format the response strictly as a JSON object with this exact structure:
       {
         "lessonPlan": "A highly detailed breakdown of the class structure, objectives, and activities.",
         "teleprompterScript": "A natural, engaging script written specifically to be read aloud by the teacher on camera.",
         "suggestedChapters": ["Introduction", "Main Concept 1", "Example", "Q&A Session", "Summary"]
       }
       
       Make sure the script length makes sense for the ${duration} duration.`
    : `Eres un experto asistente de profesores. Crea un plan de clase muy detallado y un guión de teleprompter listo para leer en cámara.
       Tema: ${topic}
       Nivel / Curso: ${gradeLevel}
       Duración Estimada: ${duration}
       
       Formatea la respuesta estrictamente como un objeto JSON con esta estructura exacta:
       {
         "lessonPlan": "Un desglose muy detallado de la estructura, objetivos y actividades de la clase.",
         "teleprompterScript": "Un guión natural y atractivo escrito específicamente para ser leído en voz alta por el profesor en cámara.",
         "suggestedChapters": ["Introducción", "Concepto Principal 1", "Ejemplo", "Sesión de Dudas", "Resumen"]
       }
       
       Asegúrate de que la longitud del guión tenga sentido para la duración de ${duration}.`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Intentando generar con el modelo: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      
      const text = response.text;
      if (text) {
        return res.status(200).json(JSON.parse(text));
      }
    } catch (error) {
      console.warn(`Falló el modelo ${model}:`, error);
      lastError = error;
      // Continuar con el siguiente modelo en el bucle
    }
  }

  // Si llegamos aquí, todos los modelos fallaron
  console.error("Todos los modelos de Gemini fallaron.", lastError);
  return res.status(500).json({ error: isEn ? 'AI Generation failed.' : 'Error al generar con IA.' });
}
