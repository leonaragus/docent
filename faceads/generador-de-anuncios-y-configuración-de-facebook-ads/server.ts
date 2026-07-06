import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize Gemini client with User-Agent header for telemetry as requested
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY", // Handle missing key gracefully during development in client
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY no está configurado en el servidor. Por favor configúrelo en la pestaña Secrets."
        });
      }

      const { title, description, duration, certification, audience, pricing, format, extras } = req.body;

      if (!title) {
        return res.status(400).json({ error: "El título del curso es obligatorio." });
      }

      const prompt = `
Eres un experto en Marketing de Afiliación, Copywriting Profesional y Especialista en Meta/Facebook Ads con más de 10 años de experiencia.
Tu tarea es generar tres (3) copys de anuncios promocionales para Facebook altamente persuasivos y la CONFIGURACIÓN DE SEGMENTACIÓN DETALLADA e IDEAL en Meta Ads Manager para promover el siguiente curso:

=== DATOS DEL CURSO ===
- Título: ${title}
- Descripción: ${description || "No especificada"}
- Duración: ${duration || "No especificada"}
- Certificación / Certificado: ${certification || "No especificada"}
- Público Objetivo Primario: ${audience || "Público general interesado en el sector"}
- Precio / Oferta: ${pricing || "No especificado"}
- Modalidad / Formato (Ej: Online, en vivo, grabado, presencial): ${format || "Online"}
- Datos Extras: ${extras || "Ninguno"}

=== REQUISITOS DEL COPYWRITING (VARIACIONES) ===
Genera 3 variaciones de copys con los siguientes perfiles/estilos:
1. "Storytelling / Conexión Emocional": Empieza con una historia real o un dolor común en el público objetivo para enganchar emocionalmente, habla sobre la transformación y ofrece el curso como la solución.
2. "Directo enfocado en Beneficios y Urgencia": Bullet points claros de lo que aprenderán, el valor del certificado, la duración y una oferta con escasez para generar clics rápidos.
3. "Problema - Agitación - Solución (Fórmula PAS)": Corto, punzante. Enfoca el dolor principal, agita el problema de no solucionarlo, y presenta el curso con las certificaciones y el CTA inmediato.

=== REQUISITOS DE CONFIGURACIÓN DE FACEBOOK ADS ===
- Recomienda el Objetivo de campaña idóneo bajo el actual menú de Meta (ej. Clientes Potenciales si buscan registros/leads, Ventas si es compra directa de infoproducto de bajo costo, o Tráfico si envían a whatsapp de cierre).
- Proporciona ubicaciones de conversión realistas.
- Segmentación geográfica ideal, rango de edad, y género sugerido.
- Define de 4 a 6 intereses súper específicos y precisos del catálogo de Meta con el fundamento estratégico de por qué funcionarán para este curso específico. No uses intereses genéricos obvios sin valor comercial si puedes sugerir marcas, competidores u otros comportamientos calientes.
- Brinda exclusiones para optimizar el presupuesto del anunciante.
- Detalla el formato de anuncio recomendado y entrega consejos en tiempo real de optimización basados en el contexto moderno de Meta del año 2026 (por ejemplo la importancia del CBO, creativos dinámicos, retargeting de reproducciones de video o formularios instantáneos frente a landing pages lentas).

Por favor, devuélveme la respuesta siguiendo el esquema de respuesta JSON de manera rigurosa.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un consultor experto de Performance Marketing y Copywriting bilingüe. Diseñas estrategias realistas y copys persuasivos de alta conversión listos para copiar y usar.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variations: {
                type: Type.ARRAY,
                description: "Variaciones de copies creados para captar la atención de diferentes perfiles de compradores.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING, description: "Estilo conceptual del copy" },
                    hook: { type: Type.STRING, description: "Gancho inicial de alto impacto (1-2 líneas llamativas con emojis)" },
                    body: { type: Type.STRING, description: "Cuerpo persuasivo completo con bullets, emojis estructurados, duración y certificaciones integradas de forma orgánica" },
                    cta: { type: Type.STRING, description: "Llamado a la acción claro y potente" },
                    suggestedImagePrompt: { type: Type.STRING, description: "Instrucciones de diseño visual o prompt para crear/generar la imagen del anuncio" }
                  },
                  required: ["style", "hook", "body", "cta", "suggestedImagePrompt"]
                }
              },
              adsConfig: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING, description: "Objetivo de Meta recomendado" },
                  conversionLocation: { type: Type.STRING, description: "Canal ideal de conversión" },
                  estimatedBudget: { type: Type.STRING, description: "Presupuesto diario aconsejado y plan de testeo" },
                  demographics: {
                    type: Type.OBJECT,
                    properties: {
                      locations: { type: Type.STRING, description: "Países, ciudades o regiones recomendadas para este nicho" },
                      ageRange: { type: Type.STRING, description: "Rango de edades recomendado" },
                      genders: { type: Type.STRING, description: "Distribución de género ideal" }
                    },
                    required: ["locations", "ageRange", "genders"]
                  },
                  interestsToTarget: {
                    type: Type.ARRAY,
                    description: "Segmentación detallada de Meta Ads",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        interest: { type: Type.STRING, description: "Interés exacto en Meta Ads Manager" },
                        reason: { type: Type.STRING, description: "Por qué este interés específico perfila bien al público objetivo" }
                      },
                      required: ["interest", "reason"]
                    }
                  },
                  exclusions: { type: Type.STRING, description: "Exclusiones recomendadas en Meta para ahorrar presupuesto" },
                  placements: { type: Type.STRING, description: "Recomendaciones de ubicaciones manuales vs advantage+" },
                  formatRecommendation: { type: Type.STRING, description: "Formato recomendado para el anuncio creativo" },
                  dynamicRealTimeTips: {
                    type: Type.ARRAY,
                    description: "Lista de 4 a 6 tácticas avanzadas de optimización y pruebas en tiempo real para lanzar hoy mismo.",
                    items: { type: Type.STRING }
                  }
                },
                required: ["objective", "conversionLocation", "estimatedBudget", "demographics", "interestsToTarget", "exclusions", "placements", "formatRecommendation", "dynamicRealTimeTips"]
              }
            },
            required: ["variations", "adsConfig"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se pudo obtener texto de respuesta del modelo Gemini.");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Error en la generación:", error);
      res.status(500).json({ error: error.message || "Error interno del servidor al procesar la solicitud." });
    }
  });

  // Serve Vite in dev mode or Static in production
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" || !hasDist) {
    console.log("Starting Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
