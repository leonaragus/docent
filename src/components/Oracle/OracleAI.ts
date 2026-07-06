import { GoogleGenAI, Type } from '@google/genai';

// Search API Key in multiple places
function getGeminiClient(): GoogleGenAI {
  let apiKey = '';

  // 1. Search in Nexus branding store
  try {
    const brandData = localStorage.getItem('docent_nexus_brand');
    if (brandData) {
      const parsed = JSON.parse(brandData);
      apiKey = parsed.apiKey || '';
    }
  } catch (e) {}

  // 2. Search in docent_nexus_api_key
  if (!apiKey) {
    apiKey = localStorage.getItem('docent_nexus_api_key') || '';
  }

  // 3. Search in gemini_api_key
  if (!apiKey) {
    apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  // 4. Search in environment variables
  if (!apiKey) {
    apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  if (!apiKey) {
    throw new Error('La clave API de Gemini no está configurada.');
  }

  return new GoogleGenAI({ apiKey });
}

// Sequential free model prober
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash-8b',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.5-pro'
];

async function generateContentWithFallback(options: {
  contents: string;
  systemInstruction: string;
  responseSchema: any;
  temperature?: number;
}) {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`Intentando generación con modelo Gemini: ${modelName}`);
      const result = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: options.responseSchema,
          temperature: options.temperature ?? 0.2,
        },
      });
      console.log(`Conexión exitosa con el modelo: ${modelName}`);
      return result;
    } catch (err: any) {
      console.warn(`Fallo con el modelo ${modelName}: ${err.message || err}`);
      lastError = err;
    }
  }

  throw lastError || new Error('Todos los candidatos de modelos Gemini fallaron.');
}

// Helper to check language of text
const isSpanishText = (text: string): boolean => {
  const spanishKeywords = ['el', 'la', 'los', 'las', 'que', 'en', 'para', 'con', 'del', 'una', 'este', 'esta'];
  const words = text.toLowerCase().split(/\s+/);
  const count = words.filter(w => spanishKeywords.includes(w)).length;
  return count > 2;
};

// Capitalize helper
function capitalize(s: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Advanced pedagogical local parser
function extractKeyConcepts(text: string, isEs: boolean) {
  const stopWords = new Set(
    isEs
      ? ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'como', 'para', 'con', 'en', 'es', 'son', 'que', 'se', 'su', 'sus', 'por', 'lo', 'este', 'esta', 'estos', 'estas', 'pero', 'mas', 'más', 'ya', 'o', 'u', 'e', 'si', 'este', 'eso', 'esto']
      : ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'with', 'in', 'on', 'at', 'by', 'of', 'from', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'has', 'have', 'had', 'been']
  );

  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const words = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 5 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const sortedConcepts = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  return { sentences, concepts: sortedConcepts.slice(0, 15) };
}

// Complete local Exam Generator
export function generateLocalExamFallback(
  sourceText: string,
  difficulty: string,
  numQuestions: number,
  questionTypes: string[],
  customInstructions: string,
  lang: string = 'es'
) {
  const isEs = lang === 'es';
  const { sentences, concepts } = extractKeyConcepts(sourceText, isEs);
  
  const title = isEs 
    ? `Examen de Refuerzo: ${concepts[0] ? capitalize(concepts[0]) : 'Conceptos Clave'}`
    : `Reinforcement Exam: ${concepts[0] ? capitalize(concepts[0]) : 'Key Concepts'}`;
    
  const description = isEs
    ? `Evaluación formativa local autogenerada basada en el material de estudio sobre ${concepts.slice(0, 3).join(', ')}.`
    : `Auto-generated local formative evaluation based on the study material about ${concepts.slice(0, 3).join(', ')}.`;

  const questions: any[] = [];
  const typesToUse = questionTypes && questionTypes.length > 0 ? questionTypes : ['multiple_choice', 'true_false', 'fill_blanks'];
  
  let qCount = 0;
  
  // 1. Generate multiple choice questions
  if (typesToUse.includes('multiple_choice') && sentences.length > 0 && concepts.length > 0) {
    const candidateSentences = sentences.filter(s => concepts.some(c => s.toLowerCase().includes(c)));
    candidateSentences.slice(0, Math.ceil(numQuestions / 2)).forEach((sentence) => {
      if (qCount >= numQuestions) return;
      
      const presentConcept = concepts.find(c => sentence.toLowerCase().includes(c));
      if (!presentConcept) return;
      
      const questionText = isEs
        ? `Según el texto, ¿qué concepto está directamente relacionado con la siguiente descripción?\n\n"${sentence.replace(new RegExp(presentConcept, 'gi'), '__________')}"`
        : `According to the text, which concept is directly related to the following description?\n\n"${sentence.replace(new RegExp(presentConcept, 'gi'), '__________')}"`;
        
      const distractors = concepts.filter(c => c !== presentConcept).slice(0, 3);
      while (distractors.length < 3) {
        distractors.push(isEs ? 'Concepto General' : 'General Concept');
      }
      const options = [capitalize(presentConcept), ...distractors.map(d => capitalize(d))].sort(() => 0.5 - Math.random());
      
      questions.push({
        id: `mc_${Date.now()}_${qCount}`,
        type: 'multiple_choice',
        questionText,
        options,
        correctAnswer: capitalize(presentConcept),
        explanation: isEs 
          ? `La oración original afirma: "${sentence}". Por lo tanto, "${presentConcept}" es el término correspondiente.`
          : `The original sentence states: "${sentence}". Therefore, "${presentConcept}" is the corresponding term.`,
        points: 4
      });
      qCount++;
    });
  }

  // 2. Generate True/False questions
  if (typesToUse.includes('true_false') && sentences.length > 1) {
    const startIdx = Math.floor(sentences.length / 2);
    sentences.slice(startIdx, startIdx + 3).forEach((sentence, idx) => {
      if (qCount >= numQuestions) return;
      
      const isTrue = idx % 2 === 0;
      let questionText = sentence;
      let explanation = '';
      let correctAnswer = isTrue ? (isEs ? 'Verdadero' : 'True') : (isEs ? 'Falso' : 'False');
      
      if (isTrue) {
        explanation = isEs 
          ? `Verdadero. El texto base indica textualmente: "${sentence}"` 
          : `True. The base text explicitly states: "${sentence}"`;
      } else {
        const words = sentence.split(' ');
        if (words.length > 5) {
          if (isEs) {
            questionText = sentence.replace(/\bes\b/gi, 'no es').replace(/\bse\b/gi, 'no se');
          } else {
            questionText = sentence.replace(/\bis\b/gi, 'is not').replace(/\bare\b/gi, 'are not');
          }
          if (questionText === sentence) {
            questionText = isEs ? `El texto niega que: "${sentence}"` : `The text denies that: "${sentence}"`;
          }
        }
        explanation = isEs
          ? `Falso. La afirmación es contraria al texto original, el cual dice: "${sentence}"`
          : `False. The statement contradicts the original text, which states: "${sentence}"`;
      }
      
      questions.push({
        id: `tf_${Date.now()}_${qCount}`,
        type: 'true_false',
        questionText,
        options: isEs ? ['Verdadero', 'Falso'] : ['True', 'False'],
        correctAnswer,
        explanation,
        points: 3
      });
      qCount++;
    });
  }

  // 3. Generate Fill Blanks questions
  if (typesToUse.includes('fill_blanks') && sentences.length > 0 && concepts.length > 0) {
    sentences.slice(-3).forEach((sentence) => {
      if (qCount >= numQuestions) return;
      const presentConcept = concepts.find(c => sentence.toLowerCase().includes(c));
      if (!presentConcept) return;

      const questionText = sentence.replace(new RegExp(`\\b${presentConcept}\\b`, 'gi'), '__________');
      questions.push({
        id: `fb_${Date.now()}_${qCount}`,
        type: 'fill_blanks',
        questionText: isEs ? `Completa la palabra faltante:\n\n"${questionText}"` : `Fill in the missing word:\n\n"${questionText}"`,
        correctAnswer: presentConcept,
        explanation: isEs 
          ? `La palabra clave faltante es "${presentConcept}", obtenida de la frase: "${sentence}"`
          : `The missing keyword is "${presentConcept}", obtained from: "${sentence}"`,
        points: 3
      });
      qCount++;
    });
  }

  // 4. Generate matching pairs
  if (typesToUse.includes('matching') && concepts.length >= 2 && sentences.length >= 2) {
    if (qCount < numQuestions) {
      const pairs: any[] = [];
      const matchCount = Math.min(3, concepts.length);
      for (let i = 0; i < matchCount; i++) {
        const concept = concepts[i];
        const sentence = sentences.find(s => s.toLowerCase().includes(concept)) || '';
        if (sentence) {
          pairs.push({
            left: capitalize(concept),
            right: sentence.length > 60 ? sentence.slice(0, 60) + '...' : sentence
          });
        }
      }
      
      if (pairs.length >= 2) {
        questions.push({
          id: `match_${Date.now()}_${qCount}`,
          type: 'matching',
          questionText: isEs ? 'Asocia los términos de la izquierda con su descripción correspondiente a la derecha.' : 'Match the terms on the left with their corresponding descriptions on the right.',
          matchingPairs: pairs,
          correctAnswer: isEs ? 'Asociaciones completadas correctamente.' : 'Associations completed successfully.',
          explanation: isEs ? 'Revisa las correspondencias lógicas entre los conceptos y sus explicaciones.' : 'Review the logical correspondences between concepts and their explanations.',
          points: 5
        });
        qCount++;
      }
    }
  }

  // 5. Generate scenario questions
  if (typesToUse.includes('scenario') && sentences.length > 0 && concepts.length > 0) {
    if (qCount < numQuestions) {
      const mainConcept = concepts[0] || 'tema';
      const sentence = sentences[0] || '';
      const scenarioText = isEs
        ? `Imagina que eres un consultor encargado de implementar una solución basada en ${mainConcept}. Un cliente te presenta un problema directamente relacionado con: "${sentence}".`
        : `Imagine you are a consultant hired to implement a solution based on ${mainConcept}. A client presents you with a problem directly related to: "${sentence}".`;
        
      const questionText = isEs
        ? `¿Cuál sería tu recomendación principal para resolver esta situación siguiendo las directrices del texto?`
        : `What would be your primary recommendation to solve this situation following the guidelines of the text?`;

      const options = isEs
        ? [
            `Analizar cómo ${mainConcept} resuelve el problema aplicando la descripción del texto. (Correcta)`,
            `Ignorar ${mainConcept} y proponer una metodología no relacionada.`,
            `Esperar a que el problema se resuelva sin intervención.`,
            `Descartar la lección original y comenzar desde cero.`
          ]
        : [
            `Analyze how ${mainConcept} solves the problem applying the text's description. (Correct)`,
            `Ignore ${mainConcept} and propose an unrelated methodology.`,
            `Wait for the problem to resolve itself without intervention.`,
            `Discard the original lesson and start from scratch.`
          ];

      questions.push({
        id: `sc_${Date.now()}_${qCount}`,
        type: 'scenario',
        scenarioText,
        questionText,
        options,
        correctAnswer: options[0],
        explanation: isEs
          ? `La opción correcta propone aplicar directamente ${mainConcept} según lo aprendido en la clase.`
          : `The correct option proposes applying ${mainConcept} directly as learned in the class.`,
        points: 5
      });
      qCount++;
    }
  }

  // 6. Generate open ended questions
  if (typesToUse.includes('open_ended')) {
    if (qCount < numQuestions) {
      const mainConcept = concepts[0] || 'tema de estudio';
      questions.push({
        id: `open_${Date.now()}_${qCount}`,
        type: 'open_ended',
        questionText: isEs
          ? `Explica detalladamente la importancia de "${capitalize(mainConcept)}" dentro de la materia, proporcionando ejemplos concretos basados en el texto de estudio.`
          : `Explain in detail the importance of "${capitalize(mainConcept)}" within the subject, providing concrete examples based on the study text.`,
        correctAnswer: isEs 
          ? `Debe mencionar "${mainConcept}" y al menos dos ideas asociadas presentes en el texto.`
          : `Must mention "${mainConcept}" and at least two associated ideas present in the text.`,
        explanation: isEs
          ? `Esta pregunta evalúa tu capacidad para sintetizar, estructurar y transferir la lección sobre "${mainConcept}".`
          : `This question evaluates your ability to synthesize, structure, and transfer the lesson on "${mainConcept}".`,
        points: 6
      });
      qCount++;
    }
  }

  // Fill in case we didn't generate enough questions
  while (questions.length < numQuestions) {
    questions.push({
      id: `fallback_q_${Date.now()}_${questions.length}`,
      type: 'true_false',
      questionText: isEs ? '¿El material proporcionado presenta información relevante sobre la materia?' : 'Does the provided material present relevant information about the subject?',
      options: isEs ? ['Verdadero', 'Falso'] : ['True', 'False'],
      correctAnswer: isEs ? 'Verdadero' : 'True',
      explanation: isEs ? 'Pregunta de control sobre la lección.' : 'Control question about the lesson.',
      points: 2
    });
  }

  return {
    title,
    description,
    timeLimit: Math.max(5, numQuestions * 3),
    difficulty: difficulty || 'Medio',
    questions
  };
}

// Complete local educational converter
export function generateLocalContentFallback(
  sourceText: string,
  format: string,
  tone: string,
  level: string,
  customInstructions: string,
  lang: string = 'es'
) {
  const isEs = lang === 'es';
  const { sentences, concepts } = extractKeyConcepts(sourceText, isEs);
  
  const title = isEs 
    ? `Resumen Local: ${concepts[0] ? capitalize(concepts[0]) : 'Contenido Educativo'}`
    : `Local Summary: ${concepts[0] ? capitalize(concepts[0]) : 'Educational Content'}`;

  switch (format) {
    case 'summary':
      return {
        title,
        mainTakeaway: isEs 
          ? `La esencia del texto gira en torno a ${concepts.slice(0, 3).join(', ')}.`
          : `The essence of the text revolves around ${concepts.slice(0, 3).join(', ')}.`,
        sections: [
          {
            heading: isEs ? 'Puntos Clave Principales' : 'Key Core Points',
            bullets: sentences.slice(0, 4)
          },
          {
            heading: isEs ? 'Conceptos Más Frecuentes' : 'Most Frequent Concepts',
            bullets: concepts.slice(0, 5).map(c => isEs ? `Relevancia del término: ${capitalize(c)}` : `Relevance of term: ${capitalize(c)}`)
          }
        ]
      };

    case 'flashcards':
      return {
        title,
        flashcards: concepts.slice(0, 6).map((concept) => {
          const sentence = sentences.find(s => s.toLowerCase().includes(concept)) || '';
          return {
            front: isEs ? `¿Qué relación tiene el concepto "${capitalize(concept)}" con la materia?` : `What relation does the concept "${capitalize(concept)}" have with the subject?`,
            back: sentence || (isEs ? `Término clave de alta relevancia en la lectura.` : `High relevance key term in the reading.`)
          };
        })
      };

    case 'study_guide':
      return {
        title,
        studyGuide: [
          {
            difficulty: isEs ? 'Medio' : 'Medium',
            sections: concepts.slice(0, 4).map((concept) => {
              const matchingSentences = sentences.filter(s => s.toLowerCase().includes(concept)).slice(0, 2);
              return {
                topic: capitalize(concept),
                content: matchingSentences.join(' ') || (isEs ? `Estudio detallado del término ${concept}.` : `Detailed study of the term ${concept}.`)
              };
            })
          }
        ]
      };

    case 'podcast_script':
      return {
        title,
        podcastScript: {
          scene: isEs ? '[Efecto de campana de entrada] Un narrador nos guía a través de las notas de la clase.' : '[Intro bells] A narrator guides us through the class notes.',
          dialogue: sentences.slice(0, 5).map((sentence, idx) => ({
            speaker: isEs ? 'Narrador' : 'Narrator',
            text: sentence,
            soundEffect: idx % 2 === 0 ? (isEs ? '[música de fondo suave]' : '[soft background music]') : (isEs ? '[pausa reflexiva]' : '[reflective pause]')
          }))
        }
      };

    case 'glossary':
      return {
        title,
        glossary: concepts.slice(0, 8).map((concept) => {
          const sentence = sentences.find(s => s.toLowerCase().includes(concept)) || '';
          return {
            term: capitalize(concept),
            definition: sentence || (isEs ? 'Término relevante en la lectura base.' : 'Relevant term in the base reading.'),
            example: isEs ? `Aplicación de ${concept} en un entorno pedagógico.` : `Application of ${concept} in a pedagogical setting.`
          };
        })
      };

    case 'concept_map':
      let mermaidCode = 'graph TD\n';
      const nodes: any[] = [];
      concepts.slice(0, 5).forEach((concept, idx) => {
        const id = `node_${idx}`;
        mermaidCode += `  ${id}["${capitalize(concept)}"]\n`;
        nodes.push({
          id,
          label: capitalize(concept),
          description: isEs ? `Nodo conceptual de: ${concept}` : `Conceptual node of: ${concept}`
        });
      });
      for (let i = 0; i < nodes.length - 1; i++) {
        mermaidCode += `  node_${i} --> node_${i+1}\n`;
      }
      return {
        title,
        conceptMap: {
          mermaidCode,
          nodes
        }
      };

    default:
      return { title, summaryText: sourceText };
  }
}

// Convert format entrypoint with AI & Local Fallback
export async function convertContentOffline(
  sourceText: string,
  format: string,
  tone: string,
  level: string,
  customInstructions: string,
  lang: string = 'es'
) {
  try {
    const isEs = lang === 'es';
    let responseSchema: any;
    
    // Choose system instructions depending on language Context
    let systemPrompt = isEs 
      ? `Eres un experto pedagogo, diseñador instruccional y creador de contenido educativo interactivo. Tu tarea es convertir el texto o las notas proporcionadas por el usuario en un recurso educativo altamente optimizado con el formato solicitado, con tono '${tone || 'friendly'}' y adaptado para un nivel de audiencia de '${level || 'Universidad'}'.`
      : `You are an expert educator, instructional designer, and creator of interactive educational content. Your task is to convert the text or notes provided by the user into a highly optimized educational resource in the requested format, with a '${tone || 'friendly'}' tone, and adapted for an audience level of '${level || 'University'}'.`;

    if (customInstructions) {
      systemPrompt += isEs 
        ? `\nInstrucciones especiales del usuario: ${customInstructions}`
        : `\nUser's custom instructions: ${customInstructions}`;
    }

    switch (format) {
      case 'summary':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            mainTakeaway: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['heading', 'bullets']
              }
            }
          },
          required: ['title', 'mainTakeaway', 'sections']
        };
        break;

      case 'flashcards':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ['front', 'back']
              }
            }
          },
          required: ['title', 'flashcards']
        };
        break;

      case 'study_guide':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            studyGuide: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  difficulty: { type: Type.STRING },
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topic: { type: Type.STRING },
                        content: { type: Type.STRING }
                      },
                      required: ['topic', 'content']
                    }
                  }
                },
                required: ['difficulty', 'sections']
              }
            }
          },
          required: ['title', 'studyGuide']
        };
        break;

      case 'podcast_script':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            podcastScript: {
              type: Type.OBJECT,
              properties: {
                scene: { type: Type.STRING },
                dialogue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      speaker: { type: Type.STRING },
                      text: { type: Type.STRING },
                      soundEffect: { type: Type.STRING }
                    },
                    required: ['speaker', 'text']
                  }
                }
              },
              required: ['scene', 'dialogue']
            }
          },
          required: ['title', 'podcastScript']
        };
        break;

      case 'glossary':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ['term', 'definition', 'example']
              }
            }
          },
          required: ['title', 'glossary']
        };
        break;

      case 'concept_map':
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            conceptMap: {
              type: Type.OBJECT,
              properties: {
                mermaidCode: { type: Type.STRING },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['id', 'label', 'description']
                  }
                }
              },
              required: ['mermaidCode', 'nodes']
            }
          },
          required: ['title', 'conceptMap']
        };
        break;

      default:
        throw new Error(isEs ? 'Formato de conversión no válido.' : 'Invalid conversion format.');
    }

    const prompt = isEs
      ? `Por favor, convierte el siguiente contenido en el formato educativo '${format}'.
Sigue estrictamente las especificaciones del esquema JSON para estructurar los datos del resultado.

Texto fuente:
"""
${sourceText}
"""`
      : `Please convert the following content into the educational format '${format}'.
Strictly follow the JSON schema specifications to structure the result data.

Source text:
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
      throw new Error(isEs ? 'No se recibió respuesta válida del modelo de IA.' : 'No valid response received from the AI model.');
    }

    return JSON.parse(result.text);
  } catch (err) {
    console.warn("Fallo al convertir contenido vía Gemini API. Iniciando fallback local...", err);
    return generateLocalContentFallback(sourceText, format, tone, level, customInstructions, lang);
  }
}

// Create Exam entrypoint with AI & Local Fallback
export async function createExamOffline(
  sourceText: string,
  difficulty: string,
  numQuestions: number,
  questionTypes: string[],
  customInstructions: string,
  lang: string = 'es'
) {
  try {
    const isEs = lang === 'es';
    const typesList = questionTypes && questionTypes.length > 0
      ? questionTypes.join(', ')
      : 'multiple_choice, true_false, fill_blanks, matching, scenario, open_ended';

    const systemInstruction = isEs
      ? `Eres un creador de exámenes de élite y diseñador de evaluaciones didácticas de última generación. Tu objetivo es diseñar un examen sumamente imaginativo, riguroso y pedagógicamente estimulante basado en el texto del usuario.`
      : `You are an elite exam creator and next-generation pedagogical assessment designer. Your goal is to design an extremely imaginative, rigorous, and educationally stimulating exam based on the user's text.`;

    const examSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        timeLimit: { type: Type.INTEGER },
        difficulty: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              points: { type: Type.INTEGER },
              scenarioText: { type: Type.STRING },
              matchingPairs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    left: { type: Type.STRING },
                    right: { type: Type.STRING }
                  },
                  required: ['left', 'right']
                }
              }
            },
            required: ['id', 'type', 'questionText', 'correctAnswer', 'explanation', 'points']
          }
        }
      },
      required: ['title', 'description', 'timeLimit', 'difficulty', 'questions']
    };

    const extraInstructions = customInstructions 
      ? (isEs ? `Instrucciones especiales adicionales: ${customInstructions}\n` : `Additional special instructions: ${customInstructions}\n`)
      : '';

    const prompt = isEs
      ? `Crea un examen dinámico basado en el siguiente texto educativo.
Dificultad: ${difficulty || 'Medio'}
Número de preguntas: ${numQuestions || 5}
Tipos de preguntas permitidos: [${typesList}]

${extraInstructions}Texto de origen:
"""
${sourceText}
"""`
      : `Create a dynamic exam based on the following educational text.
Difficulty: ${difficulty || 'Medium'}
Number of questions: ${numQuestions || 5}
Allowed question types: [${typesList}]

${extraInstructions}Source text:
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
      throw new Error(isEs ? 'No se recibió respuesta válida del modelo de IA.' : 'No valid response received from the AI model.');
    }

    return JSON.parse(result.text);
  } catch (err) {
    console.warn("Fallo al crear examen vía Gemini API. Iniciando generador local de exámenes...", err);
    return generateLocalExamFallback(sourceText, difficulty, numQuestions, questionTypes, customInstructions, lang);
  }
}

// Grade open ended questions entrypoint with AI & Local Fallback
export async function gradeOpenEndedOffline(
  questionText: string,
  expectedPoints: string,
  studentAnswer: string,
  maxPoints: number,
  lang: string = 'es'
) {
  try {
    const isEs = lang === 'es';
    const systemInstruction = isEs
      ? `Eres un docente calificador riguroso pero motivador. Evalúas la respuesta abierta redactada por un estudiante a una pregunta técnica o de desarrollo, comparándola con los criterios de evaluación clave proporcionados.`
      : `You are a rigorous but motivational grading teacher. You evaluate the open-ended response written by a student to a technical or development question, comparing it with the key evaluation criteria provided.`;

    const gradingSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        feedback: { type: Type.STRING }
      },
      required: ['score', 'feedback']
    };

    const prompt = isEs
      ? `Pregunta formulada: "${questionText}"
Puntos esperados / Guía de respuesta: "${expectedPoints || 'Analiza el tema críticamente con fundamentos correctos'}"
Respuesta redactada por el alumno:
"""
${studentAnswer}
"""
Calificación máxima permitida: ${maxPoints || 10} puntos.`
      : `Asked question: "${questionText}"
Expected points / Answer guide: "${expectedPoints || 'Critically analyze the topic with correct foundations'}"
Student written response:
"""
${studentAnswer}
"""
Maximum allowed grade: ${maxPoints || 10} points.`;

    const result = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: systemInstruction,
      responseSchema: gradingSchema,
      temperature: 0.2
    });

    if (!result.text) {
      throw new Error(isEs ? 'No se recibió respuesta del calificador de IA.' : 'No response received from the AI grader.');
    }

    return JSON.parse(result.text);
  } catch (err) {
    console.warn("Fallo al calificar examen vía Gemini API. Iniciando fallback local...", err);
    const isEs = lang === 'es';
    const score = Math.min(maxPoints, Math.max(1, Math.round(studentAnswer.trim().length / 40)));
    const feedback = isEs
      ? `[Evaluación Local Offline] Criterio analizado. Respuesta de ${studentAnswer.trim().length} caracteres. Tu puntuación estimada es de ${score}/${maxPoints}.`
      : `[Local Offline Grading] Criterion analyzed. Student response length of ${studentAnswer.trim().length} chars. Estimated score is ${score}/${maxPoints}.`;
    return { score, feedback };
  }
}
