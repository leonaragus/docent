import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Brain, Compass, HelpCircle, GraduationCap, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: '¡Hola! Soy Kairós Tutor, tu copiloto de aprendizaje inteligente en la academia. \n\nNo soy como los robots genéricos de Moodle. Conozco a fondo los talleres activos y puedo ayudarte a:\n- **Diseñar mejores rebotes (Animations)** en Framer Motion o CSS.\n- **Ponerte a prueba** con un test interactivo adaptado a tu nivel.\n- **Optimizar tu portafolio** sugiriéndote cambios tipográficos.\n\n¿Por qué hito o concepto quieres que empecemos hoy?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('No es posible conectar con el copiloto');
      }

      const data = await response.json();
      const modelMsg: Message = { role: 'model', text: data.reply };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: '⚠️ Oh, disculpa. Hubo un pequeño desajuste en mis servidores de sincronización. Por favor, asegúrate de tener una API Key válida configurada de Gemini en el panel de Secrets de AI Studio o reintenta en unos instantes!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatMessageText = (text: string) => {
    // Process bullet points and bold sections easily
    return text.split('\n').map((line, idx) => {
      let element = line;
      
      // Bold tags (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-teal-900 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const hasBold = parts.length > 0;

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 my-1 font-sans">
            {hasBold ? parts : line.substring(2)}
          </li>
        );
      }
      
      if (line.startsWith('### ')) {
        return (
          <h5 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 font-sans uppercase">
            {hasBold ? parts : line.substring(4)}
          </h5>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans mb-1.5">
          {hasBold ? parts : element}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
      {/* Informative Side Bar (4 Columns) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 px-2 text-teal-800">
            <Brain className="w-5 h-5 shrink-0" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider font-sans">
              Mentor Cognitivo IA
            </h4>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed font-sans px-2">
            Kairós Tutor funciona mediante el modelo generativo de vanguardia de Google, lo que le permite brindar interactividad fluida, comprender diagramas y analizar problemas de diseño o código en tiempo real.
          </p>

          <div className="border-t border-slate-100 pt-4 space-y-3 px-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Atajos rápidos de consulta:</span>
            
            <button 
              onClick={() => handleQuickPrompt('Ponme a prueba con un test interactivo de 3 preguntas de opción múltiple sobre jerarquía y contraste.')}
              className="w-full text-left p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-100 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Compass className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Evaluar mis conocimientos</span>
            </button>

            <button 
              onClick={() => handleQuickPrompt('¿Cómo calculo un amortiguamiento (damping) idóneo para que un menú lateral Framer Motion no rebote indefinidamente?')}
              className="w-full text-left p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-100 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Fórmula física de Springs</span>
            </button>

            <button 
              onClick={() => handleQuickPrompt('Dame ideas de microcopy alternativos para un botón de envío aburrido de un curso en línea.')}
              className="w-full text-left p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-100 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Ejemplos de Storytelling</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface (8 Columns) */}
      <div className="lg:col-span-8 flex flex-col h-[550px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-sans">Kairós Inteligo-Tutor</h4>
              <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-1">
                ● En línea y entrenado con el plan de estudios
              </span>
            </div>
          </div>
        </div>

        {/* Message History Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-teal-700">
                  <Brain className="w-4.5 h-4.5" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-4 border shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 border-slate-900 text-white rounded-tr-none'
                  : 'bg-white border-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1">
                    {formatMessageText(msg.text)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 max-w-[85%] flex items-center gap-2 shadow-2xs">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Kairós está procesando tu reto...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form panel input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            required
            disabled={loading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pregúntame sobre el plan de estudios, springs o pídemi un test..."
            className="flex-1 text-xs/normal p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
