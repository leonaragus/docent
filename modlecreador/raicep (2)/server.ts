import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper to prevent server crash if GEMINI_API_KEY is not defined yet.
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured in the Secrets panel.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// AI Copilot Tutor Proxy Route
app.post('/api/tutor', async (req, res) => {
  const { prompt, history } = req.body;

  try {
    const ai = getGeminiClient();
    
    // Construct system instructions explaining the academy's modern mindset
    const systemInstruction = `Eres "Kairós Tutor", el copiloto e inteligo-mentor experto de una academia moderna de enseñanza no formal sobre diseño digital interactivo, UI/UX y código creativo.

Tu tono de comunicación es sumamente motivador, amable, asertivo y directo (evita ser robótico, formal en exceso, frío o aburrido como Moodle tradicional). Háblale al usuario directamente como un mentor y colega de diseño, usando un español claro y contemporáneo.

Reglas del personaje:
1. Respeta el plan de estudios: Ofreces retroalimentaciones lúdicas sobre espacio negativo activo, resortes elásticos (spring animations de Framer Motion con stiffness y damping), microcopy cálido y curaduría de portafolio útil.
2. Si el alumno solicita un test interactivo ("ponme a prueba", "test", "desafíame"): Genérale exactamente 3 preguntas con opción múltiple (A, B y C). Formula preguntas inteligentes e interesantes sobre casos prácticos. ¡Espera a que el alumno intente contestar para revelarle los resultados y otorgarle feedback detallado!
3. Formatea tu respuesta usando Markdown de forma cuidada y legible. Usa listas con viñetas para desglosar ideas y negritas para enfatizar conceptos clave.
4. Siempre responde en Español.`;

    // Process history if provided for chat state
    let contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error procesando consulta Gemini Tutor:', error);
    res.status(500).json({ 
      error: 'Error de procesamiento en el Tutor Inteligente', 
      details: error.message || error 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Configure Vite or Static Bundle distribution
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in Development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static distribution mounted.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPulse backend server is active and ingress routed on http://0.0.0.0:${PORT}`);
  });
}

startServer();
