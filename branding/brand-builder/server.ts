import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateContentWithExponentialBackoff(params: any, onProgress: (msg: string) => void, maxRetries = 4): Promise<any> {
  const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let modelIndex = 0;

  for (let i = 0; i < maxRetries; i++) {
    const currentModel = models[modelIndex % models.length];
    const currentParams = { ...params, model: currentModel };
    
    try {
      onProgress(`Conectando con Gemini utilizando ${currentModel} (intento ${i + 1}/${maxRetries})...`);
      return await ai.models.generateContent(currentParams);
    } catch (error: any) {
      console.error(`Attempt ${i + 1} with ${currentModel} failed:`, error);
      // Check if it's a rate limit, quota, or service unavailable error
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      const isUnavailable = error.status === 503 || error.message?.includes('503') || error.message?.includes('UNAVAILABLE');
      
      if (isRateLimit || isUnavailable) {
        modelIndex++;
        const nextModel = models[modelIndex % models.length];
        const retryDelay = 1000; // Fast rotation: 1 second
        const reason = isRateLimit ? "Límite de cuota" : "Alta demanda";
        onProgress(`${reason} en ${currentModel}. Probando ${nextModel} en 1s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Límite de reintentos alcanzado. El servicio de Gemini está sobrecargado en este momento.");
}

function generateLocalBranding(institutionName: string, vibe: string, type: string, fontPreference: string) {
  const normVibe = (vibe || "Moderna").toLowerCase();
  const normFont = (fontPreference || "Sans-serif").toLowerCase();
  
  // Decidir paleta de colores por vibra y tipo
  let colors: string[] = ["#1E3A8A", "#3B82F6", "#60A5FA"]; // default azul elegante
  
  if (normVibe.includes("solemne") || normVibe.includes("tradicional")) {
    colors = ["#111827", "#1E3A8A", "#D97706"]; // Negro noche, Azul Real, Oro cálido
    if (type.includes("Universidad") || type.includes("Escuela") || type.includes("Instituto")) {
      colors = ["#4C1D95", "#8B5CF6", "#F59E0B"]; // Púrpura Imperial y Dorado
    }
  } else if (normVibe.includes("moderna") || normVibe.includes("técnica") || normVibe.includes("tecnica")) {
    colors = ["#0F172A", "#06B6D4", "#22D3EE"]; // Cyber slate, Teal brillante, Aqua
  } else if (normVibe.includes("cálida") || normVibe.includes("calida") || normVibe.includes("creativa")) {
    colors = ["#431407", "#EA580C", "#FDBA74"]; // Terracota, Naranja vibrante, Melocotón cálido
  } else if (type.toLowerCase().includes("médica") || type.toLowerCase().includes("salud") || type.toLowerCase().includes("clínica")) {
    colors = ["#064E3B", "#10B981", "#A7F3D0"]; // Verde pino, Esmeralda, Verde menta
  }

  // Decidir fuente elegante
  let font = "Inter";
  if (normFont.includes("serif")) {
    font = "Playfair Display";
  } else if (normFont.includes("slab")) {
    font = "Arvo";
  } else if (normFont.includes("mono")) {
    font = "Space Mono";
  } else if (normFont.includes("sans")) {
    font = "Outfit";
  }

  // Descripción estilizada del membrete
  const pdfHeaderDescription = `Un diseño de encabezado de PDF sumamente profesional para "${institutionName}". En la esquina superior izquierda, se presenta un isotipo minimalista moderno de alta definición en color principal ${colors[0]}, representando la excelencia de esta entidad de tipo ${type || "Institución"}. Al lado, el nombre completo "${institutionName}" se muestra con la tipografía premium "${font}" en un acabado seminegrita y elegante tono ${colors[1]}. El margen derecho superior muestra sutilmente los campos de metadatos del documento (Fecha, Folio, Autor) alineados con precisión de cuadrícula. Todo el encabezado está coronado con un sutil patrón de líneas vectoriales en color de acento ${colors[2]}, lo que transmite un estilo marcadamente ${vibe || "elegante"} y corporativo.`;

  return {
    colors,
    pdfHeaderDescription,
    font,
    isFallback: true
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API routes
  app.get("/api/generate-branding", async (req, res) => {
    const { institutionName, vibe, type, font } = req.query as any;
    console.log(`Generating branding for ${institutionName}, type: ${type}, vibe: ${vibe}, font: ${font}`);
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    try {
      sendEvent("progress", { message: "Iniciando generación de identidad..." });
      
      const response = await generateContentWithExponentialBackoff({
        model: "gemini-2.5-flash",
        contents: `Genera una identidad de marca para una institución llamada "${institutionName}" de tipo "${type}" con un estilo "${vibe}" y fuentes de tipo "${font}". 
        Proporciona un conjunto de 3 colores de marca complementarios en código hexadecimal, una breve descripción en español de un diseño de encabezado de PDF adecuado para esta institución, y el nombre de la fuente elegida.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 códigos de color hexadecimal.",
              },
              pdfHeaderDescription: {
                type: Type.STRING,
                description: "Una descripción en español del diseño del encabezado PDF.",
              },
              font: {
                type: Type.STRING,
                description: "El nombre de la fuente elegida.",
              },
            },
            required: ["colors", "pdfHeaderDescription", "font"],
          },
        },
      }, (msg) => {
        sendEvent("progress", { message: msg });
      });

      const text = response.text;
      console.log('Gemini response:', text);
      const parsedResult = JSON.parse(text!);
      
      sendEvent("progress", { message: "¡Identidad de marca completada con éxito!" });
      sendEvent("result", { result: parsedResult });
      res.end();
    } catch (error: any) {
      console.error('Gemini error:', error);
      
      try {
        sendEvent("progress", { message: "Servidores de Gemini con alta demanda. Activando generador local inteligente de respaldo..." });
        // Wait 2 seconds for smooth UI transition
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const fallbackResult = generateLocalBranding(
          institutionName || "Institución",
          vibe || "Moderna",
          type || "Instituto",
          font || "Sans-serif"
        );
        
        sendEvent("progress", { message: "¡Identidad de marca completada con éxito (generador de respaldo)!" });
        sendEvent("result", { result: fallbackResult });
      } catch (fallbackError: any) {
        console.error('Fallback error:', fallbackError);
        sendEvent("error", { message: "No pudimos generar la marca en este momento. Intenta de nuevo en unos segundos." });
      }
      res.end();
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
