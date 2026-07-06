import React, { useState } from 'react';
import { CommunityPost, Comment } from '../types';
import { 
  MessageSquare, 
  ThumbsUp, 
  Flame, 
  BrainCircuit, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityFeedProps {
  posts: CommunityPost[];
  currentUser: { name: string; avatar: string };
  onAddPost: (text: string, category: CommunityPost['category'], image?: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onReact: (postId: string, reactionType: 'like' | 'fire' | 'brain') => void;
}

export default function CommunityFeed({
  posts,
  currentUser,
  onAddPost,
  onAddComment,
  onReact
}: CommunityFeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('avance');
  const [newPostImage, setNewPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | CommunityPost['category']>('all');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onAddPost(newPostText, newPostCategory, newPostImage || undefined);
    setNewPostText('');
    setNewPostImage('');
    setShowImageInput(false);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = commentInputs[postId];
    if (!txt || !txt.trim()) return;
    onAddComment(postId, txt);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const filteredPosts = posts.filter(post => 
    activeFilter === 'all' ? true : post.category === activeFilter
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
      {/* Category selector left sidebar (3 columns) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 px-2">
            El Pulso Diario
          </h4>
          {[
            { id: 'all', label: 'Todo el Muro', icon: Compass, color: 'text-slate-600 bg-slate-50' },
            { id: 'avance', label: 'Proyectos & Avance', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'pregunta', label: 'Preguntas / Ayuda', icon: HelpCircle, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'recurso', label: 'Recursos Copados', icon: FolderOpen, color: 'text-teal-600 bg-teal-50' },
            { id: 'inspiracion', label: 'Inspiración Visual', icon: Sparkles, color: 'text-pink-600 bg-pink-50' }
          ].map(cat => {
            const IconComp = cat.icon;
            const isSelected = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id as any)}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/10 text-white' : cat.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span>{cat.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.id === 'all' 
                    ? posts.length 
                    : posts.filter(p => p.category === cat.id).length
                  }
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Widget */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300">Cohesión Social</span>
            <h4 className="font-bold text-sm tracking-tight">Co-aprendizaje Activo</h4>
            <p className="text-[11px] text-teal-100 leading-relaxed">
              En las academias modernas el conocimiento es colectivo. Comparte tus experimentos para recibir valoraciones de tus mentores y catalizar tu crecimiento.
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-teal-500/20 rounded-full blur-xl" />
        </div>
      </div>

      {/* Primary posting area and feed (9 columns) */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Creation Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex items-start gap-4">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 border border-white shadow-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1 space-y-4">
                <textarea
                  required
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="¿En qué andas trabajando hoy? Comparte tus ideas o sube una captura..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 resize-y"
                  rows={2}
                />

                {showImageInput && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Inserta URL de imagen inspiradora:</label>
                    <input
                      type="url"
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-50">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category selectors inside creator block */}
                <span className="text-[10px] text-slate-400 font-medium font-sans">Etiqueta:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['avance', 'pregunta', 'recurso', 'inspiracion'] as CommunityPost['category'][]).map(catName => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setNewPostCategory(catName)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer border transition-colors ${
                        newPostCategory === catName 
                          ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {catName === 'avance' ? '🚀 Avance' : catName === 'pregunta' ? '❓ Pregunta' : catName === 'recurso' ? '📦 Recurso' : '⭐ Inspiración'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`p-2 rounded-xl border text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    showImageInput || newPostImage ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Imagen</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredPosts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
              >
                {/* Post body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {post.authorAvatar ? (
                        <img 
                          src={post.authorAvatar} 
                          alt={post.authorName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-sm shrink-0 border border-white">
                          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm font-sans">{post.authorName}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            post.role === 'teacher' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {post.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                      </div>
                    </div>

                    {/* Post Category Badge */}
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                      post.category === 'avance' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : post.category === 'pregunta'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-100'
                        : post.category === 'recurso'
                        ? 'bg-teal-50 text-teal-800 border-teal-100'
                        : 'bg-pink-50 text-pink-800 border-pink-100'
                    }`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                    {post.text}
                  </p>

                  {/* Attachment Image */}
                  {post.image && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 aspect-video max-h-72 bg-slate-50 flex items-center justify-center">
                      <img 
                        src={post.image} 
                        alt="Subido por estudiante" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Reactions Bar with Quick Tap Counter */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => onReact(post.id, 'like')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.reactions.like}</span>
                    </button>
                    
                    <button
                      onClick={() => onReact(post.id, 'fire')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-orange-600 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{post.reactions.fire}</span>
                    </button>

                    <button
                      onClick={() => onReact(post.id, 'brain')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-purple-600 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>{post.reactions.brain}</span>
                    </button>
                  </div>
                </div>

                {/* Comments section */}
                <div className="bg-slate-50/50 border-t border-slate-100 p-4 sm:p-6 space-y-4">
                  {post.comments.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map(comm => (
                        <div key={comm.id} className="flex gap-3 items-start text-xs">
                          {comm.authorAvatar ? (
                            <img 
                              src={comm.authorAvatar} 
                              alt={comm.authorName} 
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-100" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-300 text-white font-bold flex items-center justify-center text-[10px] shrink-0 border border-white">
                              {comm.authorName ? comm.authorName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-xs space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-bold text-slate-800">{comm.authorName}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  comm.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {comm.role === 'teacher' ? 'Mentora' : 'Alumno'}
                                </span>
                                <span className="text-[9px] text-slate-400">{comm.timestamp}</span>
                              </div>
                            </div>
                            <p className="text-slate-600 leading-normal font-sans">
                              {comm.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post new comment form */}
                  <form 
                    onSubmit={(e) => handleCommentSubmit(post.id, e)} 
                    className="flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Aporta feedback constructivo..."
                      className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 font-sans">
                No hay publicaciones en esta categoría todavía. ¡Inaugura el muro aportando algo genial!
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
