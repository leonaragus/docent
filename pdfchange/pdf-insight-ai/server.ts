import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body limit to support PDF uploads as base64
app.use(express.json({ limit: '35mb' }));

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in your environment variables. Please add it via the Settings/Secrets panel in Google AI Studio.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Robust helper to perform requests with automatic retry and model fallback to survive load peaks
async function generateContentWithFallback(
  ai: GoogleGenAI,
  contents: any,
  systemInstruction: string,
  temperature: number
) {
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ];

  let lastError: any = null;
  // Track status of models to avoid retrying those with permanent errors (404, 400 bad requests)
  const modelStatus: Record<string, { skip: boolean; reason?: string }> = {};

  // Define local helper for individual model request with self-retry
  async function attemptModelWithRetry(modelName: string, maxAttempts = 3) {
    let modelError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini Engine] Intentando modelo ${modelName} (intento ${attempt}/${maxAttempts})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: temperature,
          }
        });
        console.log(`[Gemini Engine] ¡Éxito con ${modelName} en intento ${attempt}!`);
        return response;
      } catch (err: any) {
        modelError = err;
        const errStr = err.message || JSON.stringify(err) || String(err);
        console.warn(`[Gemini Engine] Falló intento ${attempt} en ${modelName}:`, errStr.substring(0, 180));

        // If it's a permanent model-not-found (404) or bad parameter request, do not retry this model
        if (errStr.includes("404") || (errStr.includes("400") && !errStr.includes("503") && !errStr.includes("500") && !errStr.includes("429"))) {
          modelStatus[modelName] = { skip: true, reason: 'permanent_404_400' };
          throw err;
        }

        // Wait a short delay on transient error (503, 500, etc.) before the next attempt
        if (attempt < maxAttempts) {
          const delay = attempt * 1000;
          console.log(`[Gemini Engine] Error transitorio en ${modelName}. Esperando ${delay}ms para el reintento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw modelError;
  }

  // Pass 1: Try each model with its built-in self-retry loop
  for (const model of modelsToTry) {
    if (modelStatus[model]?.skip) continue;

    try {
      const response = await attemptModelWithRetry(model, 3);
      return response;
    } catch (err: any) {
      lastError = err;
      const errStr = err.message || JSON.stringify(err) || String(err);
      
      if (errStr.includes("404") || errStr.includes("429")) {
        console.log(`[Gemini Engine] Saltando modelo ${model} para futuros pasos (404 o límite de cuota).`);
        modelStatus[model] = { skip: true, reason: '404_429' };
      }
    }
  }

  // Pass 2: If we reach here, all models failed completely (including all retries).
  // We wait a larger delay of 2.5 seconds, then try one last sweep across any non-skipped models.
  const activeModelsForPass2 = modelsToTry.filter(m => !modelStatus[m]?.skip);
  if (activeModelsForPass2.length > 0) {
    const finalDelay = 2500;
    console.log(`[Gemini Engine] [Último Recurso] Todos los modelos saturados. Esperando ${finalDelay}ms para barrido final...`);
    await new Promise(resolve => setTimeout(resolve, finalDelay));

    for (const model of activeModelsForPass2) {
      try {
        console.log(`[Gemini Engine] [Último Recurso] Intentando de nuevo: ${model}...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: temperature,
          }
        });
        console.log(`[Gemini Engine] ¡Barrido final exitoso con modelo ${model}!`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = err.message || JSON.stringify(err) || String(err);
        console.warn(`[Gemini Engine] [Último Recurso] Falló barrido final en ${model}:`, errStr.substring(0, 180));
      }
    }
  }

  // If we got here, everything failed. Throw a high-quality, friendly error.
  const friendlyMsg = lastError?.message || JSON.stringify(lastError) || "Servicio temporalmente saturado.";
  throw new Error(`Los servidores de Inteligencia Artificial están experimentando una alta demanda temporal. Por favor, reintentá en unos segundos. Detalles técnicos: ${friendlyMsg}`);
}

// API endpoint to analyze PDF (Supports single or multiple PDFs)
app.post('/api/analyze-pdf', async (req, res) => {
  try {
    const { pdfs, pdfBase64, filename, action, question, chatHistory, tone } = req.body;

    // Normalize input to support both single PDF payload and multiple PDF list
    let filesToAnalyze: { base64: string; name: string }[] = [];

    if (pdfs && Array.isArray(pdfs) && pdfs.length > 0) {
      filesToAnalyze = pdfs.map((p: any) => ({
        base64: p.base64,
        name: p.name
      }));
    } else if (pdfBase64) {
      filesToAnalyze = [{
        base64: pdfBase64,
        name: filename || 'document.pdf'
      }];
    }

    if (filesToAnalyze.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un archivo para el análisis." });
    }

    const ai = getAI();

    const pdfParts: { inlineData: { data: string; mimeType: string } }[] = [];
    let textDocsContent = "";

    for (const file of filesToAnalyze) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, "");

      if (extension === 'pdf') {
        pdfParts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: 'application/pdf'
          }
        });
      } else if (extension === 'docx') {
        try {
          const buffer = Buffer.from(cleanBase64, 'base64');
          const result = await mammoth.extractRawText({ buffer });
          const plainText = result.value || "";
          textDocsContent += `\n\n=== CONTENIDO DEL DOCUMENTO: "${file.name}" ===\n${plainText}\n============================================\n`;
        } catch (docxErr: any) {
          console.error(`Error parsing docx file ${file.name}:`, docxErr);
          textDocsContent += `\n\n=== ERROR AL LEER EL DOCUMENTO: "${file.name}" ===\n[No se pudo extraer el texto de este archivo de Word]\n============================================\n`;
        }
      } else if (extension && ['txt', 'csv', 'json', 'md', 'html', 'xml'].includes(extension)) {
        try {
          const buffer = Buffer.from(cleanBase64, 'base64');
          const plainText = buffer.toString('utf-8');
          textDocsContent += `\n\n=== CONTENIDO DEL DOCUMENTO: "${file.name}" ===\n${plainText}\n============================================\n`;
        } catch (txtErr: any) {
          console.error(`Error parsing text file ${file.name}:`, txtErr);
          textDocsContent += `\n\n=== ERROR AL LEER EL DOCUMENTO: "${file.name}" ===\n[No se pudo leer el contenido como texto]\n============================================\n`;
        }
      } else {
        // Fallback for any other file with text
        try {
          const buffer = Buffer.from(cleanBase64, 'base64');
          const plainText = buffer.toString('utf-8');
          if (plainText && !plainText.includes('\ufffd')) { // simple check to ensure it's readable text
            textDocsContent += `\n\n=== CONTENIDO DEL DOCUMENTO: "${file.name}" ===\n${plainText}\n============================================\n`;
          }
        } catch (e) {
          console.warn(`Generic text conversion failed for ${file.name}:`, e);
        }
      }
    }

    // Define tone descriptions to inject into the system or prompt instruction
    let toneInstruction = "";
    if (tone === "argentino") {
      toneInstruction = `
[INSTRUCCIÓN DE TONO Y PERSONALIDAD: LENGUAJE ARGENTINO]
- Debés responder en castellano con un tono argentino súper cálido, amigable y muy inteligente.
- Usá el voseo rioplatense de forma natural (ej. "fijate", "tenés", "podés", "mirá", "querés").
- Incorporá expresiones típicas pero sutiles y profesionales (ej. "che", "viste", "posta", "totalmente", "ojo con esto", "es clave", "buenísimo", "darle bola").
- Explicá los razonamientos paso a paso de manera lúcida y cercana, como si estuviésemos charlando y tomando unos mates con facturas, pero con un rigor de análisis impresionante. No seas robótico ni distante.
`;
    } else if (tone === "humano") {
      toneInstruction = `
[INSTRUCCIÓN DE TONO Y PERSONALIDAD: MANERA HUMANA]
- Respondé de forma sumamente natural, empática y conversacional.
- Evitá introducciones acartonadas o frases robóticas de IA como "Como un modelo de lenguaje...".
- Escribí de persona a persona. Usá la primera persona para involucrarte ("Estuve revisando el documento y encontré...", "Me llamó la atención que...").
- Explicá conceptos complejos de forma simple pero sin perder profundidad intelectual.
`;
    } else if (tone === "moderno") {
      toneInstruction = `
[INSTRUCCIÓN DE TONO Y PERSONALIDAD: MUY MODERNO / EJECUTIVO PREMIUM]
- Respondé con un estilo corporativo moderno, dinámico y estilizado. Estilo Silicon Valley / High-Tech.
- Utilizá títulos potentes, viñetas de alto impacto visual y resúmenes ejecutivos muy sintéticos.
- El lenguaje debe ser directo, orientado a resultados, estratégico y pragmático.
`;
    } else {
      // Standard tone
      toneInstruction = `
[INSTRUCCIÓN DE TONO Y PERSONALIDAD: ESTÁNDAR]
- Respondé en español con un tono profesional, claro, riguroso y objetivo.
- Estructurá el contenido con Markdown elegante e impecable.
`;
    }

    const systemInstruction = `You are PDF Insight AI, an advanced educational cognitive assistant.
CRITICAL RULE: You generate learning material (study guides, worksheets, pedagogical activities, student summaries) intended DIRECTLY for students to read, learn from, and solve.
NEVER address the teacher. Never write meta-commentaries like "Aquí tiene el resumen para sus alumnos" or "Esta es una planificación".
Instead, address the students directly with a clear, pedagogical, encouraging, and highly structured style (e.g. using "¡Hola, estudiantes! En esta guía analizaremos...", "A continuación, les presentamos...").
Keep the tone encouraging, didactical, and focused on facilitating their learning. Use Markdown formatting. Ensure absolute honesty: do not invent data that is not in the attached documents. All answers must be strictly backed by the provided texts.
${toneInstruction}`;
    
    let prompt = "";
    const namesString = filesToAnalyze.map(f => `"${f.name}"`).join(", ");

    if (action === "summary") {
      if (filesToAnalyze.length > 1) {
        prompt = `Has recibido ${filesToAnalyze.length} documentos para estudiar: ${namesString}.
Generá una Ficha de Aprendizaje Unificada de alta calidad para los alumnos.
Estructurá tu respuesta de forma impecable usando estas secciones didácticas dirigidas al estudiante:
- **📖 Ficha de Aprendizaje Multidocumental**: Un panorama general y amigable (2-3 párrafos) explicando de qué tratan los textos y cómo se conectan entre sí para facilitar su comprensión.
- **💡 Conceptos Clave Compartidos**: ¿Qué grandes ideas, datos o saberes comparten estos textos? Explicá de forma sencilla e ilustrativa las similitudes.
- **🔍 Diferentes Enfoques y Perspectivas**: ¿Qué diferencias hay en el enfoque, datos o conclusiones entre los archivos? Presentalo como un debate o diferentes puntos de vista para desarrollar pensamiento crítico.
- **📝 Actividades y Preguntas de Autoevaluación**: Escribí de 3 a 4 preguntas reflexivas, cuestionarios o actividades sencillas basadas en el texto para que los alumnos respondan y comprueben lo aprendido.`;
      } else {
        prompt = `Analizá el documento "${filesToAnalyze[0].name}" y elaborá una Guía de Estudio para el estudiante.
Estructurá tu respuesta de forma impecable usando estas secciones didácticas:
- **📘 Guía de Estudio**: Una síntesis concisa, amigable y motivadora sobre el foco central del texto para introducir el tema a los alumnos.
- **⭐ Puntos Fundamentales para Aprender**: Lista detallada de las ideas clave, hechos o conceptos más importantes que todo estudiante debe conocer.
- **🧩 Temario Desglosado**: Un breve mapa de los temas principales abordados en el documento explicados de forma clara.
- **✍️ Cuestionario de Comprensión Lectora**: Escribí de 3 a 4 preguntas reflexivas y de opción múltiple o desarrollo directo para que los alumnos practiquen e incorporen el contenido.`;
      }
    } else if (action === "compare") {
      prompt = `Analizá los documentos: ${namesString} para crear un material didáctico de comparación.
Generá un **Cuadro Comparativo Temático** impecable diseñado para estudiantes en formato de tabla Markdown detallando las siguientes dimensiones para cada archivo:
1. Tema Principal o Propósito (Explicado de forma sencilla)
2. Autores / Organización u Origen
3. Datos de Interés / Cifras principales que deben recordar
4. Idea Fuerza o Mensaje central
5. Estilo o Enfoque didáctico del texto

Debajo del cuadro comparativo, agregá un apartado de **Razonamiento Integrado para el Alumno** explicando cómo se complementan los textos y un **Desafío Comparativo** (2 preguntas didácticas para reflexionar sobre la comparación).`;
    } else if (action === "extract") {
      prompt = `Analizá el/los documento/s (${namesString}) y extraé los datos e información clave estructurada en un formato ideal para que los estudiantes usen como material de consulta rápida o ficha técnica.
Formatéalo de manera didáctica bajo los siguientes títulos:
- **📇 Ficha Técnica del Documento**: Fechas, autores y para qué sirve este material.
- **📊 Datos y Cifras de Impacto**: Nombres importantes, fechas históricas, porcentajes, montos o estadísticas que deben conocer.
- **📋 Tabla de Referencia del Contenido**: Extraé la información numérica o datos estructurados relevantes como una tabla Markdown muy fácil de leer.
- **🔍 Glosario de Términos Clave**: Un mini-glosario definiendo de manera didáctica palabras complejas o técnicas que aparecen en el texto para ayudar a los alumnos.`;
    } else if (action === "qa" || action === "custom") {
      if (!question) {
        return res.status(400).json({ error: "Se requiere una pregunta o instrucción para ejecutar esta acción." });
      }
      prompt = `El usuario ha realizado la siguiente consulta o instrucción sobre el/los documento/s (${namesString}):
"${question}"

Proporcioná una respuesta sumamente detallada, clara y 100% fundamentada en el contenido de los archivos. 
- Mencioná qué documento y sección específica (o página si figura) respalda cada afirmación.
- Si la respuesta no figura en ninguno de los documentos provistos, aclará explícitamente que no encontraste información sobre eso en los textos. No inventes bajo ninguna circunstancia.`;
    } else if (action === "chat") {
      if (!question) {
        return res.status(400).json({ error: "El mensaje del chat no puede estar vacío." });
      }

      let contextPart = "";
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        contextPart = "Historial reciente del chat para contexto:\n" + 
          chatHistory.map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join("\n") + "\n\n";
      }

      prompt = `${contextPart}Analizá los documentos (${namesString}) y respondé a la última consulta del usuario:
"${question}"

Mantené el tono configurado, sé conversacional y utilizá Markdown para dar formato a los puntos clave.`;
    } else {
      return res.status(400).json({ error: "Acción no reconocida o no soportada." });
    }

    // Combine text content from text files and docx into the final prompt
    const finalPrompt = textDocsContent 
      ? `${prompt}\n\n[INFORMACIÓN ADICIONAL DE DOCUMENTOS COMPLEMENTARIOS (DOCX/TEXTO)]:\n${textDocsContent}`
      : prompt;

    // Prepare correct parts structure for generateContent
    const parts: any[] = [];
    for (const part of pdfParts) {
      parts.push(part);
    }
    parts.push({ text: finalPrompt });

    // Call Gemini API using the resilient fallback helper to handle peak load elegantly
    const response = await generateContentWithFallback(ai, { parts: parts }, systemInstruction, 0.2);

    const resultText = response.text || "No se pudo generar el análisis para los documentos provistos.";
    res.json({ result: resultText });

  } catch (error: any) {
    console.error("Error en la API de análisis multidocumento:", error);
    res.status(500).json({ error: error.message || "Ocurrió un error inesperado al procesar los archivos." });
  }
});

// Vite or static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
