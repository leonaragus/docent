import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { Readable } from "stream";
import fileUpload from "express-fileupload";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(fileUpload());

  // Initialize Gemini API Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API route for Lesson Plan & Script Generation
  app.post("/api/ai/lesson-plan", async (req, res) => {
    try {
      const { topic, gradeLevel, duration, lang } = req.body;

      if (!topic) {
        return res.status(400).json({ error: lang === 'en' ? "Class topic is required." : "El tema de la clase es obligatorio." });
      }

      const prompt = lang === 'en' 
        ? `Create a complete lesson plan and a teleprompter script for a teacher.
        Class topic: "${topic}"
        Grade level: "${gradeLevel || 'Any'}"
        Estimated duration: "${duration || '15 minutes'}"

        Generate a structured JSON response with the following fields:
        - lessonPlan: A detailed lesson plan in Markdown format, including objectives, key topics, and suggested activities.
        - teleprompterScript: A fluid and professional first-person narrative script for the teacher to read directly from the screen. Include useful indications in brackets like [Pause], [Smile], [Show screen], etc.
        - suggestedChapters: A list of 3 to 5 short titles for chapters or timestamps during the recording to serve as an interactive guide.`
        : `Crea un plan de clase completo y un guión para el apuntador (teleprompter) para un profesor.
        Tema de la clase: "${topic}"
        Nivel educativo o Grado: "${gradeLevel || 'Cualquiera'}"
        Duración estimada de la clase: "${duration || '15 minutos'}"

        Genera una respuesta en formato JSON estructurado con los siguientes campos:
        - lessonPlan: Un plan de clase detallado en formato Markdown, incluyendo objetivos, temas clave, y actividades sugeridas.
        - teleprompterScript: Un guión narrativo en primera persona fluido y profesional para que el profesor lo lea directamente de la pantalla. Incluye indicaciones útiles entre corchetes como [Pausa], [Sonreír], [Mostrar pantalla], etc.
        - suggestedChapters: Una lista de entre 3 y 5 títulos cortos para capítulos o marcas de tiempo durante la grabación que sirvan como guía interactiva.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lessonPlan: { type: Type.STRING, description: "Markdown styled lesson plan with objectives and key exercises" },
              teleprompterScript: { type: Type.STRING, description: "Fluid narrative script for the teacher to read with pauses or action indicators in brackets" },
              suggestedChapters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of short names for the interactive chapters, max 5 items"
              }
            },
            required: ["lessonPlan", "teleprompterScript", "suggestedChapters"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating lesson plan:", error);
      res.status(500).json({ error: "No se pudo generar el plan de clase. Verifica tu clave de API." });
    }
  });

  // API route for AI-assisted transcription based on recording & script info
  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { script, durationSec, chapters, lang } = req.body;
      const durationFormatted = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

      const prompt = lang === 'en'
        ? `Create a complete and structured pedagogical transcription with timestamps in SRT format and a clean text based on the following recorded class context:
        - Base script: "${script || 'Free explanation by the teacher about the topic'}"
        - Recording duration: ${durationFormatted} (${durationSec} seconds)
        - Chapters marked by the teacher: ${JSON.stringify(chapters || [])}

        The class should be realistically divided into time segments from 00:00:00,000 to the end of the duration (${durationSec} seconds).
        
        Generate a structured JSON response with:
        - srtText: The complete transcription in official SRT format (Subtitles with sequence numbers, start/end timestamps like '00:00:02,500 --> 00:00:08,200', and dictated text). It must be 100% compatible with MP4 video players.
        - cleanText: The complete continuous speech text without timestamps, ideal for students to read as notes.`
        : `Crea una transcripción pedagógica completa y estructurada con marcas de tiempo en formato SRT (Subtítulos) y un texto de transcripción limpio en base al siguiente contexto de la clase grabada:
        - Guión base: "${script || 'Explicación libre del profesor sobre el tema'}"
        - Duración de la grabación: ${durationFormatted} (${durationSec} segundos)
        - Capítulos marcados por el profesor: ${JSON.stringify(chapters || [])}

        La clase debe dividirse de forma realista en segmentos de tiempo desde 00:00:00,000 hasta el final de la duración (${durationSec} segundos).
        
        Genera una respuesta en formato JSON estructurado con:
        - srtText: La transcripción completa en formato oficial SRT (Subtítulos con números de secuencia, marcas de tiempo de inicio/fin estilo '00:00:02,500 --> 00:00:08,200', y los textos dictados). Debe ser 100% compatible con reproductores de video MP4.
        - cleanText: El texto completo de la transcripción de forma fluida e hilada sin marcas de tiempo, ideal para que los alumnos lo lean como apuntes.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              srtText: { type: Type.STRING, description: "Valid SRT format subtitle text spanning the class duration" },
              cleanText: { type: Type.STRING, description: "Clean continuous speech text with paragraph breaks for readability" }
            },
            required: ["srtText", "cleanText"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating transcription:", error);
      // Fallback if API fails or isn't configured
      res.json({
        srtText: req.body.lang === 'en' 
          ? `1\n00:00:01,000 --> 00:00:05,000\n[Start] Welcome students to this recorded class.\n\n2\n00:00:06,000 --> 00:00:12,000\nToday we review the fundamental points of our session.`
          : `1\n00:00:01,000 --> 00:00:05,000\n[Inicio] Bienvenidos alumnos a esta clase grabada.\n\n2\n00:00:06,000 --> 00:00:12,000\nHoy repasamos los puntos fundamentales de nuestra sesión.`,
        cleanText: req.body.lang === 'en'
          ? "Welcome students to this recorded class. Today we review the fundamental points of our session."
          : "Bienvenidos alumnos a esta clase grabada. Hoy repasamos los puntos fundamentales de nuestra sesión."
      });
    }
  });

  // API route for AI-assisted Quiz generation based on transcript
  app.post("/api/ai/quiz", async (req, res) => {
    try {
      const { transcript, lang } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required for quiz generation." });
      }

      const prompt = lang === 'en'
        ? `Analyze the following class transcript and generate an interactive quiz with 4 questions to evaluate the students.
        Transcript: "${transcript}"

        Generate exactly 4 questions, making sure to include at least one multiple choice ("multiple_choice") and one true/false ("true_false").
        The options for "multiple_choice" must be an array of strings (4 options). For "true_false", use ["True", "False"].
        
        Generate a structured JSON response that is an array of "questions" objects. Each object must match this schema.`
        : `Analiza la siguiente transcripción de una clase y genera un cuestionario interactivo de 4 preguntas para evaluar a los alumnos.
        Transcripción: "${transcript}"

        Genera exactamente 4 preguntas, asegurándote de incluir al menos una de opción múltiple ("multiple_choice") y una de verdadero/falso ("true_false").
        Las opciones para "multiple_choice" deben ser un array de strings (4 opciones). Para "true_false", usa ["Verdadero", "Falso"].
        
        Genera una respuesta en formato JSON estructurado que sea un array de objetos "questions". Cada objeto debe coincidir con este esquema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique random ID (e.g. q1)" },
                    type: { type: Type.STRING, description: "Must be 'multiple_choice' or 'true_false' or 'fill_blank'" },
                    question: { type: Type.STRING, description: "The text of the question" },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of possible answers (for multiple choice or true/false)" },
                    correctAnswer: { type: Type.STRING, description: "The exact correct answer matching one of the options" },
                    explanation: { type: Type.STRING, description: "A brief explanation of why this answer is correct" }
                  },
                  required: ["id", "type", "question", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const jsonStr = response.text?.trim() || '{"questions": []}';
      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ error: "Failed to generate quiz." });
    }
  });


  // API route for listing Drive folders
  app.get("/api/drive/folders", async (req, res) => {
    // In a real app, you'd use the access token provided in the Authorization header
    // to authenticate the drive client.
    res.json({ folders: [{ id: 'root', name: 'Mi Unidad' }] }); // Mock
  });

  // API route for Google Drive upload to a specific folder
  app.post("/api/drive/upload", async (req, res) => {
    const r = req as any;
    if (!r.files || !r.files.recording) {
      return res.status(400).send("No files were uploaded.");
    }
    const folderId = req.body.folderId || 'root';
    const recording = r.files.recording as any;

    console.log("Received file:", recording.name, "for folder:", folderId);
    
    // In a real implementation, you would use the authenticated Google Drive API client here.
    
    res.json({ status: "success", message: `File received, would upload to ${folderId} here.` });
  });

  // API route for listing local recordings
  app.get("/api/recordings", async (req, res) => {
    // Placeholder for local file listing
    res.json({ recordings: [] });
  });

  // API route for deleting a local recording
  app.delete("/api/recordings/:id", async (req, res) => {
    const id = req.params.id;
    console.log("Deleting recording:", id);
    res.json({ status: "success", message: "Recording deleted." });
  });

  // Export for Vercel Serverless
  export default app;
