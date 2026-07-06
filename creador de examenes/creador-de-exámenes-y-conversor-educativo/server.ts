import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit for large text/files
app.use(express.json({ limit: "15mb" }));

// Lazy Initialize Gemini Client on-the-fly to support live environment variable updates
let aiClient: GoogleGenAI | null = null;
let lastApiKey: string | null = null;

function getGeminiClient() {
  const currentKey = process.env.GEMINI_API_KEY;
  
  // We initialize the client with the current key if available, otherwise we let the SDK
  // resolve ambient credentials or Application Default Credentials (ADC) inside Cloud Run.
  const initOptions: any = {
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  };
  
  if (currentKey) {
    initOptions.apiKey = currentKey;
  }

  if (!aiClient || lastApiKey !== currentKey) {
    aiClient = new GoogleGenAI(initOptions);
    lastApiKey = currentKey;
  }
  return aiClient;
}

// Fallback models definition: Primary is Gemini 3.5 Flash, Backup is Gemini 3.1 Flash Lite
async function generateContentWithFallback(options: {
  contents: string;
  systemInstruction: string;
  responseSchema: any;
  temperature?: number;
}) {
  const primaryModel = "gemini-3.5-flash";
  const backupModel = "gemini-3.1-flash-lite";

  const ai = getGeminiClient();

  try {
    console.log(`Intentando generación con el modelo principal: ${primaryModel}`);
    const result = await ai.models.generateContent({
      model: primaryModel,
      contents: options.contents,
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: options.responseSchema,
        temperature: options.temperature ?? 0.2,
      },
    });
    return result;
  } catch (err: any) {
    console.warn(`Error con ${primaryModel}: ${err.message || err}. Reintentando con el modelo de respaldo: ${backupModel}`);
    const result = await ai.models.generateContent({
      model: backupModel,
      contents: options.contents,
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: options.responseSchema,
        temperature: options.temperature ?? 0.2,
      },
    });
    return result;
  }
}

// Endpoint: Check API Key status dynamically
app.get("/api/health", (req, res) => {
  const currentKey = process.env.GEMINI_API_KEY;
  console.log("Health check called. GEMINI_API_KEY present:", !!currentKey);
  res.json({
    status: "ok",
    hasApiKey: !!currentKey,
    message: currentKey 
      ? "Conexión con Gemini lista para usar." 
      : "La clave API de Gemini no está configurada. Por favor añádela en la pestaña Secrets (esquina superior derecha)."
  });
});

// Endpoint: Convert Educational Content
app.post("/api/convert", async (req, res) => {
  const { sourceText, format, tone, level, customInstructions } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "La clave API de Gemini no está configurada. Por favor, añádela en la pestaña de Secrets (icono de engranaje ⚙️ o configuración en la esquina superior derecha del editor) para activar la inteligencia artificial de Gemini." 
    });
  }

  if (!sourceText || !sourceText.trim()) {
    return res.status(400).json({ error: "El texto de origen no puede estar vacío." });
  }

  let responseSchema: any;
  let systemPrompt = `Eres un experto pedagogo, diseñador instruccional y creador de contenido educativo interactivo. Tu tarea es convertir el texto o las notas proporcionadas por el usuario en un recurso educativo altamente optimizado con el formato solicitado, con tono '${tone || 'profesional/académico'}' y adaptado para un nivel de audiencia de '${level || 'universitario'}'.

Instrucciones generales de formato:
- Sé riguroso con la información, no inventes hechos.
- Asegura una estructura clara e interactiva.
- Adapta el lenguaje al nivel de audiencia solicitado.
`;

  if (customInstructions) {
    systemPrompt += `\nInstrucciones especiales del usuario: ${customInstructions}`;
  }

  // Set schema based on format
  switch (format) {
    case 'summary':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título descriptivo del resumen" },
          mainTakeaway: { type: Type.STRING, description: "El mensaje o conclusión principal más importante de todo el texto en una frase de impacto" },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING, description: "Subtítulo o tema de la sección" },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Puntos clave resumidos de forma muy clara y concisa" }
              },
              required: ["heading", "bullets"]
            },
            description: "Estructura por secciones de los conceptos clave"
          }
        },
        required: ["title", "mainTakeaway", "sections"]
      };
      break;

    case 'flashcards':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título del mazo de fichas de estudio" },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "Pregunta, término o concepto clave para poner a prueba al estudiante (Frente de la ficha)" },
                back: { type: Type.STRING, description: "Explicación clara, definición o respuesta detallada (Dorso de la ficha)" }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["title", "flashcards"]
      };
      break;

    case 'study_guide':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título de la guía de estudio" },
          studyGuide: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                difficulty: { type: Type.STRING, description: "Dificultad de los conceptos descritos en esta sección: 'Fácil', 'Medio' o 'Difícil'" },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING, description: "Tema o concepto a estudiar" },
                      content: { type: Type.STRING, description: "Explicación detallada pero digerible, trucos de memorización, mnemónicos y ejemplos de aplicación" }
                    },
                    required: ["topic", "content"]
                  }
                }
              },
              required: ["difficulty", "sections"]
            }
          }
        },
        required: ["title", "studyGuide"]
      };
      break;

    case 'podcast_script':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título del podcast o lección en audio" },
          podcastScript: {
            type: Type.OBJECT,
            properties: {
              scene: { type: Type.STRING, description: "Descripción del ambiente, introducción y contexto de la lección (ej: Estudio con música suave...)" },
              dialogue: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING, description: "Nombre del locutor o personaje (ej: Presentador, Profesor, Alumno curioso, Experto)" },
                    text: { type: Type.STRING, description: "Lo que dice en tono conversacional, dinámico, usando analogías cotidianas" },
                    soundEffect: { type: Type.STRING, description: "Efecto de sonido sugerido entre corchetes para ambientar la lección (ej: [Sonido de campana], [Música alegre sube y baja], [Pausa reflexiva], o vacío)" }
                  },
                  required: ["speaker", "text"]
                }
              }
            },
            required: ["scene", "dialogue"]
          }
        },
        required: ["title", "podcastScript"]
      };
      break;

    case 'glossary':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título del glosario técnico" },
          glossary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: "Término técnico, acrónimo o palabra clave" },
                definition: { type: Type.STRING, description: "Definición pedagógica, clara y exacta" },
                example: { type: Type.STRING, description: "Ejemplo contextualizado o analogía para entenderlo de inmediato" }
              },
              required: ["term", "definition", "example"]
            }
          }
        },
        required: ["title", "glossary"]
      };
      break;

    case 'concept_map':
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título del mapa conceptual" },
          conceptMap: {
            type: Type.OBJECT,
            properties: {
              mermaidCode: { type: Type.STRING, description: "Código Mermaid.js válido para renderizar un diagrama de flujo (debe empezar con 'graph TD' o 'flowchart TD'). Usa IDs numéricos o de palabras cortas sin caracteres especiales o espacios, con etiquetas de texto entre comillas dobles, por ejemplo: A[\"Termo\"] -->|conecta| B[\"Calor\"]." },
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "El ID exacto de la caja que usaste en el diagrama de Mermaid" },
                    label: { type: Type.STRING, description: "La etiqueta de texto corta del nodo" },
                    description: { type: Type.STRING, description: "Una breve explicación o definición de este nodo de 1-2 oraciones" }
                  },
                  required: ["id", "label", "description"]
                }
              }
            },
            required: ["mermaidCode", "nodes"]
          }
        },
        required: ["title", "conceptMap"]
      };
      break;

    default:
      return res.status(400).json({ error: "Formato de conversión no válido." });
  }

  try {
    const prompt = `Por favor, convierte el siguiente contenido en el formato educativo '${format}'.
Sigue estrictamente las especificaciones del esquema JSON para estructurar los datos del resultado.

Texto fuente:
"""
${sourceText}
"""`;

    const result = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: systemPrompt,
      responseSchema: responseSchema,
      temperature: 0.2
    });

    if (!result.text) {
      throw new Error("No se recibió respuesta válida del modelo de IA.");
    }

    const parsedData = JSON.parse(result.text);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error en /api/convert:", err);
    res.status(500).json({ error: "No se pudo realizar la conversión de contenido educativo.", details: err.message });
  }
});

// Endpoint: Create Custom Exam with Multiple Presentation Variants
app.post("/api/create-exam", async (req, res) => {
  const { sourceText, difficulty, numQuestions, questionTypes, customInstructions } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "La clave API de Gemini no está configurada. Por favor, añádela en la pestaña de Secrets (icono de engranaje ⚙️ o configuración en la esquina superior derecha del editor) para activar la inteligencia artificial de Gemini." 
    });
  }

  if (!sourceText || !sourceText.trim()) {
    return res.status(400).json({ error: "Se necesita un texto fuente o tema para generar el examen." });
  }

  const typesList = questionTypes && questionTypes.length > 0 
    ? questionTypes.join(", ") 
    : "multiple_choice, true_false, fill_blanks, matching, scenario, open_ended";

  const systemInstruction = `Eres un creador de exámenes de élite y diseñador de evaluaciones didácticas de última generación. Tu objetivo es diseñar un examen sumamente imaginativo, riguroso y pedagógicamente estimulante basado en el texto del usuario.
  
Debes crear preguntas que desafíen el pensamiento crítico, no solo la memorización literal.
Los tipos de preguntas solicitados son: [${typesList}].

Variantes y pautas de preguntas:
1. 'multiple_choice': Proporciona 4 opciones interesantes y realistas (una correcta). Evita distractores absurdos.
2. 'true_false': Plantea enunciados que analicen sutilezas o conceptos erróneos comunes.
3. 'fill_blanks': Un enunciado interactivo donde falte una palabra clave o concepto exacto que el estudiante deba escribir.
4. 'matching': Emparejamiento de conceptos. Proporciona una lista de 'matchingPairs' con atributos 'left' y 'right'. El atributo 'correctAnswer' debe resumir la asociación.
5. 'scenario': Presenta un estudio de caso real, un problema práctico o situación ficticia ('scenarioText') y luego haz una pregunta que requiera aplicar el conocimiento para resolverla.
6. 'open_ended': Preguntas abiertas de desarrollo donde el alumno redacte una respuesta. Estas se calificarán luego mediante IA.

Asegúrate de proporcionar una 'explanation' rica para cada pregunta que detalle el porqué de la respuesta y ofrezca un minitutorial de aprendizaje.`;

  const examSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Título llamativo e inspirador para el examen o quiz" },
      description: { type: Type.STRING, description: "Un texto introductorio motivacional que explica qué evalúa este examen y de qué trata" },
      timeLimit: { type: Type.INTEGER, description: "Límite de tiempo recomendado en minutos para completar este examen entero (ej: 10, 15, 20 o 30)" },
      difficulty: { type: Type.STRING, description: "Nivel de dificultad global: Fácil, Medio, Difícil o Mixto" },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "ID único autogenerado corto, por ejemplo: q1, q2, q3" },
            type: { type: Type.STRING, description: "Uno de: multiple_choice, true_false, fill_blanks, matching, scenario, open_ended" },
            questionText: { type: Type.STRING, description: "El texto completo de la pregunta o instrucción" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Lista de 4 opciones de respuesta para multiple_choice. Vacío o nulo para otros tipos." 
            },
            correctAnswer: { 
              type: Type.STRING, 
              description: "La respuesta correcta exacta. Para true_false debe ser 'true' o 'false'. Para multiple_choice, la opción exacta que es correcta. Para fill_blanks, la palabra o concepto exacto que falta. Para matching, una explicación resumen del emparejamiento correcto. Para open_ended, una breve guía de puntos clave que se esperan en la respuesta." 
            },
            explanation: { type: Type.STRING, description: "Una explicación pedagógica brillante, rica en detalles, que ayuda al estudiante a entender por qué es la respuesta correcta y qué concepto subyacente enseña." },
            points: { type: Type.INTEGER, description: "Puntos otorgados por responder correctamente (ej: 10, 15 o 20)" },
            scenarioText: { type: Type.STRING, description: "Obligatorio si el tipo es 'scenario'. El texto detallado de la situación, dilema o caso de estudio para analizar." },
            matchingPairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING, description: "Concepto, término o elemento izquierdo" },
                  right: { type: Type.STRING, description: "Definición, atributo o elemento derecho emparejado" }
                },
                required: ["left", "right"]
              },
              description: "Obligatorio si el tipo es 'matching'. Entrega entre 3 y 4 pares para relacionar columnas."
            }
          },
          required: ["id", "type", "questionText", "correctAnswer", "explanation", "points"]
        }
      }
    },
    required: ["title", "description", "timeLimit", "difficulty", "questions"]
  };

  try {
    const prompt = `Crea un examen dinámico basado en el siguiente texto educativo.
Dificultad: ${difficulty || 'Medio'}
Número de preguntas: ${numQuestions || 5}
Tipos de preguntas permitidos: [${typesList}]

${customInstructions ? `Instrucciones especiales adicionales: ${customInstructions}\n` : ''}
Texto de origen:
"""
${sourceText}
"""`;

    const result = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: systemInstruction,
      responseSchema: examSchema,
      temperature: 0.3
    });

    if (!result.text) {
      throw new Error("No se recibió respuesta válida del modelo de IA.");
    }

    const parsedExam = JSON.parse(result.text);
    res.json(parsedExam);
  } catch (err: any) {
    console.error("Error en /api/create-exam:", err);
    res.status(500).json({ error: "Ocurrió un error al generar el examen interactivo.", details: err.message });
  }
});

// Endpoint: AI Open Ended Grading Service
app.post("/api/grade-open-ended", async (req, res) => {
  const { questionText, expectedPoints, studentAnswer, maxPoints } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "La clave API de Gemini no está configurada. Por favor, añádela en la pestaña de Secrets (icono de engranaje ⚙️ o configuración en la esquina superior derecha del editor) para activar la inteligencia artificial de Gemini." 
    });
  }

  if (!questionText || studentAnswer === undefined) {
    return res.status(400).json({ error: "Faltan parámetros requeridos para la calificación." });
  }

  const systemInstruction = `Eres un docente calificador riguroso pero motivador. Evalúas la respuesta abierta redactada por un estudiante a una pregunta técnica o de desarrollo, comparándola con los criterios de evaluación clave proporcionados.
Debes devolver una calificación numérica justa basada en la escala de 0 a ${maxPoints || 10} puntos y dar un feedback constructivo estructurado de la siguiente forma:
- Lo positivo: Qué puntos clave o razonamientos correctos mencionó.
- Lo que faltó o se puede mejorar: Qué conceptos importantes omitió o en qué erró.
- Consejo de estudio: Una recomendación amigable para dominar el tema.`;

  const gradingSchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: `Calificación justa de 0 a ${maxPoints || 10}` },
      feedback: { type: Type.STRING, description: "Feedback constructivo, claro y redactado en español directamente para el alumno" }
    },
    required: ["score", "feedback"]
  };

  try {
    const prompt = `Pregunta formulada: "${questionText}"
Puntos esperados / Guía de respuesta: "${expectedPoints || 'Analiza el tema críticamente con fundamentos correctos'}"
Respuesta redactada por el alumno:
"""
${studentAnswer}
"""
Calificación máxima permitida: ${maxPoints || 10} puntos.
Por favor, califica y redacta el feedback en formato JSON exacto de acuerdo al esquema.`;

    const result = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: systemInstruction,
      responseSchema: gradingSchema,
      temperature: 0.2
    });

    if (!result.text) {
      throw new Error("No se recibió respuesta del calificador de IA.");
    }

    const parsedGrading = JSON.parse(result.text);
    res.json(parsedGrading);
  } catch (err: any) {
    console.error("Error en /api/grade-open-ended:", err);
    res.status(500).json({ error: "Error de conexión con el servicio de calificación de IA.", details: err.message });
  }
});

// Vite Middleware & Static files routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware montado.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Sirviendo archivos estáticos de producción.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor activo en puerto: ${PORT}`);
  });
}

startServer();
