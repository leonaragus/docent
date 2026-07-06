import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithGoogle,
  auth 
} from '../lib/firebase';
import { 
  Lock, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  X, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  Database, 
  ChevronRight, 
  Info,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (userId: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true); // Modal opens automatically for a stunning welcome

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        onLoginSuccess(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        onLoginSuccess(userCredential.user.uid);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ocurrió un error. Verifique los datos.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Email o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-credential') {
        errMsg = 'Las credenciales proporcionadas son inválidas.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'El email ya se encuentra registrado.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'El registro con Email/Contraseña no está habilitado en Firebase. Debe habilitarlo en Firebase Console > Authentication > Sign-in method.';
      } else {
        errMsg = `Error (${err.code || 'desconocido'}): ${err.message || 'Verifique la consola del navegador.'}`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      onLoginSuccess(userCredential.user.uid);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ocurrió un error al iniciar sesión con Google.';
      if (err.code === 'auth/popup-blocked') {
        errMsg = 'El navegador bloqueó la ventana emergente de Google. Por favor, permita las ventanas emergentes para este sitio.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'La ventana de inicio de sesión de Google se cerró antes de completar el proceso.';
      } else {
        errMsg = `Error de Google (${err.code || 'desconocido'}): ${err.message || 'Verifique su conexión.'}`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const appFeatures = [
    {
      icon: <Database className="h-5 w-5 text-indigo-600" />,
      badge: "Firestore",
      title: "Sincronización en la Nube y Acceso Seguro",
      description: "Cada institución accede con usuario y contraseña únicos. Toda la información de alumnos, cursados y pagos se guarda en tiempo real en la base de datos segura de Firebase, disponible desde cualquier dispositivo sin riesgo de pérdida de datos."
    },
    {
      icon: <BookOpen className="h-5 w-5 text-purple-600" />,
      badge: "Gestión",
      title: "Control Flexible de Cursados",
      description: "Cree y personalice cursos detallando costos de cuotas, docentes, días de vencimiento mensual, duración en meses y la moneda de su región. Adaptable a cualquier formato educativo o profesional."
    },
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      badge: "Alumnos",
      title: "Inscripción y Estados Automatizados",
      description: "Registre alumnos con datos de contacto completos. El sistema asigna automáticamente la grilla de cobros y monitorea en tiempo real si el estudiante está Activo, Suspendido por falta de pago, o Egresado."
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      badge: "Mora Cero",
      title: "Control de Mora Inteligente (Sin Fórmulas)",
      description: "Algoritmo interno que detecta de manera instantánea retrasos en el pago de cuotas mensuales. Emite alertas de morosidad y calcula de manera automática los montos pendientes sin necesidad de planillas de cálculo propensas a errores."
    },
    {
      icon: <Calendar className="h-5 w-5 text-rose-600" />,
      badge: "Simulador",
      title: "Viajero en el Tiempo (Simulación de Fechas)",
      description: "Exclusiva herramienta interactiva para mover la fecha del sistema. Simule el inicio de nuevos meses para verificar de forma instantánea cómo impactarán los futuros vencimientos, quiénes entrarán en mora y cuándo suspender accesos."
    },
    {
      icon: <Sliders className="h-5 w-5 text-emerald-600" />,
      badge: "Personalizable",
      title: "Identidad Institucional Configurable",
      description: "Cambie el logotipo, nombre y subtítulo de la institución activa para ajustar la estética del portal a su centro de estudios, mientras mantiene firme en la parte superior el respaldo y marco oficial de homologación de RAICEP."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative ambient background elements */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo and Title */}
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-150 shrink-0 overflow-hidden mb-5">
            <span className="text-3xl font-black text-white">R</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
            Sistema Oficial
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
            <span>RAICEP</span>
            <span className="text-slate-500 font-medium text-lg lowercase tracking-normal">control de alumnos</span>
          </h2>
          
          <p className="mt-2 text-xs text-slate-450 font-bold max-w-sm uppercase tracking-wider leading-relaxed">
            Registro Argentino de Institución y Homologación de Estudios Profesionales
          </p>

          {/* Quick Info Trigger Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100/60 text-indigo-700 text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <Info className="h-3.5 w-3.5" />
            CONOCER QUÉ PUEDE HACER CON ESTA HERRAMIENTA ✨
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100/50 sm:rounded-2xl sm:px-10 border border-slate-150">
          
          <div className="mb-6 flex border-b border-slate-100">
            <button
              onClick={() => {
                setIsRegistering(false);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                !isRegistering 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                isRegistering 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100/80 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs font-semibold leading-relaxed"
              >
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@raicep.com"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-slate-50/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegistering ? "Mínimo 6 caracteres" : "••••••••"}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-slate-50/30"
                />
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isRegistering ? 'Registrando...' : 'Iniciando Sesión...'}</span>
                  </>
                ) : (
                  <span>{isRegistering ? 'Crear Cuenta y Entrar' : 'Ingresar al Sistema'}</span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-150"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">O también</span>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Acceder con su cuenta de Google (Nube)</span>
              </button>
            </div>

            {/* Local Storage Failsafe/Demo Button */}
            <div>
              <button
                type="button"
                onClick={() => onLoginSuccess('local-user')}
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-indigo-200/60 rounded-xl shadow-xs text-xs font-extrabold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50/85 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Ingresar en Modo de Prueba Local (Sin Cuenta)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Additional Info / Help */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
              Los datos se guardan y sincronizan en la nube de forma segura mediante Firebase Firestore.
            </p>
          </div>

        </div>
      </motion.div>

      {/* --- VISUAL & DETAILED FEATURES WELCOME MODAL --- */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-8 flex flex-col max-h-[90vh]"
            >
              
              {/* Colored top ambient strip */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer z-10"
                title="Cerrar ventana"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Modal Body (Scrollable Content) */}
              <div className="p-6 md:p-8 overflow-y-auto">
                
                {/* Header section with gradient glow badge */}
                <div className="text-center md:text-left mb-8 border-b border-slate-100 pb-6">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                    Plataforma de Control Avanzado
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    ¿Qué puede hacer con <span className="text-indigo-600">RAICEP Control</span>?
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    Una suite completa, moderna y visual para centralizar el control de cursados, la facturación mensual de cuotas y alertas de morosidad.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {appFeatures.map((feat, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150/60 p-4.5 rounded-2xl flex gap-4 transition-all hover:shadow-xs group"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        {feat.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {feat.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Automation highlight row */}
                <div className="mt-8 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                      Soporte Oficial RAICEP
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Homologado
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Este sistema está optimizado para dar seguimiento a los estándares de homologación del Registro Argentino de Instituciones de Estudios Profesionales, facilitando auditorías, reportes de cobros y estados de egresos.
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer actions */}
              <div className="bg-slate-50 px-6 py-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-2 text-slate-450 text-xs font-semibold">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Sin instalar nada • 100% en la nube</span>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <span>Entendido, ir al login</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

