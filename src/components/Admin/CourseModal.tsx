import React, { useState, useEffect } from 'react';
import { Course } from './adminTypes';
import Modal from './Modal';
import { MONTH_NAMES } from './mockData';
import { BookOpen, DollarSign, Calendar, Clock, Palette, User } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  courseToEdit?: Course | null;
}

const COLORS = [
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-600' },
  { name: 'Fucsia', value: 'fuchsia', bg: 'bg-fuchsia-500', text: 'text-fuchsia-600' },
  { name: 'Esmeralda', value: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-600' },
  { name: 'Violeta', value: 'violet', bg: 'bg-violet-500', text: 'text-violet-600' },
  { name: 'Azul', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-600' },
  { name: 'Rosa', value: 'rose', bg: 'bg-rose-500', text: 'text-rose-600' },
  { name: 'Naranja', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-600' }
];

export default function CourseModal({
  isOpen,
  onClose,
  onSave,
  courseToEdit
}: CourseModalProps) {
  const [name, setName] = useState('');
  const [tuitionFee, setTuitionFee] = useState(20000);
  const [dueDay, setDueDay] = useState(10);
  const [startMonth, setStartMonth] = useState(2); // Marzo por defecto
  const [duration, setDuration] = useState(6);
  const [color, setColor] = useState('indigo');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name);
      setTuitionFee(courseToEdit.tuitionFee);
      setDueDay(courseToEdit.dueDay);
      setStartMonth(courseToEdit.startMonth);
      setDuration(courseToEdit.duration);
      setColor(courseToEdit.color);
      setTeacherName(courseToEdit.teacherName || '');
    } else {
      // Reset to defaults
      setName('');
      setTuitionFee(20000);
      setDueDay(10);
      setStartMonth(2);
      setDuration(6);
      setColor('indigo');
      setTeacherName('');
    }
  }, [courseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: courseToEdit?.id || `course-${Date.now()}`,
      name: name.trim(),
      tuitionFee: Number(tuitionFee),
      currency: '$',
      dueDay: Number(dueDay),
      startMonth: Number(startMonth),
      duration: Number(duration),
      color,
      teacherName: teacherName.trim() || undefined
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={courseToEdit ? 'Editar Cursado / Turno' : 'Crear Nuevo Cursado'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Nombre del Cursado / Turno
          </label>
          <input
            id="course-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Curso de Programación Frontend, Matemática 5° Año"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Teacher Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-400" />
            Nombre del Profesor / Docente
          </label>
          <input
            id="course-teacher-input"
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Ej. Prof. Alejandro Gómez (opcional)"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Tuition Fee & Due Day */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-slate-400" />
              Valor de Cuota Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                id="course-fee-input"
                type="number"
                required
                min="0"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              Día de Vencimiento
            </label>
            <input
              id="course-dueday-input"
              type="number"
              required
              min="1"
              max="28" // Limit standard days for safety
              value={dueDay}
              onChange={(e) => setDueDay(Number(e.target.value))}
              placeholder="Ej. 10"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block font-medium">Día del mes límite para abonar sin recargo.</span>
          </div>
        </div>

        {/* Start Month & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Mes de Inicio
            </label>
            <select
              id="course-startmonth-select"
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Duración (Meses)
            </label>
            <input
              id="course-duration-input"
              type="number"
              required
              min="1"
              max="12"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="Ej. 6"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-slate-400" />
            Color Distintivo del Cursado
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`relative h-10 w-10 rounded-xl cursor-pointer transition-all flex items-center justify-center border-2 ${
                  color === c.value
                    ? 'border-slate-900 scale-105 shadow-md'
                    : 'border-transparent hover:scale-102 hover:shadow-sm'
                }`}
              >
                <span className={`h-6 w-6 rounded-lg ${c.bg} block`} />
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            id="course-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="course-submit-btn"
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all text-sm font-bold cursor-pointer shadow-md shadow-indigo-600/10"
          >
            {courseToEdit ? 'Guardar Cambios' : 'Crear Cursado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
