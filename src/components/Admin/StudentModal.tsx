import React, { useState, useEffect } from 'react';
import { Student, Course } from './adminTypes';
import Modal from './Modal';
import { User, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: { name: string; email: string; phone: string; courseId: string; status: 'active' | 'suspended' | 'graduated' }) => void;
  courses: Course[];
  studentToEdit?: Student | null;
}

export default function StudentModal({
  isOpen,
  onClose,
  onSave,
  courses,
  studentToEdit
}: StudentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'graduated'>('active');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setEmail(studentToEdit.email);
      setPhone(studentToEdit.phone);
      setCourseId(studentToEdit.courseId);
      setStatus(studentToEdit.status);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCourseId(courses[0]?.id || '');
      setStatus('active');
    }
  }, [studentToEdit, isOpen, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseId) return;

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      courseId,
      status
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Editar Datos del Alumno' : 'Registrar Nuevo Alumno'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-400" />
            Nombre y Apellido
          </label>
          <input
            id="student-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            Correo Electrónico
          </label>
          <input
            id="student-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ej. juan.perez@email.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-slate-400" />
            Teléfono de Contacto (WhatsApp)
          </label>
          <input
            id="student-phone-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. +54 9 11 1234-5678"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Incluye el código de país para habilitar el envío directo por WhatsApp.</span>
        </div>

        {/* Course Assignment */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Asignar a Cursado / Turno
          </label>
          <select
            id="student-course-select"
            required
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white"
          >
            <option value="" disabled>Seleccione un cursado...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.currency}{c.tuitionFee.toLocaleString('es-AR')}/mes)
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        {studentToEdit && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              Estado del Alumno
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'suspended', 'graduated'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    status === s
                      ? s === 'active'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : s === 'suspended'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-indigo-500 bg-indigo-50 text-indigo-750'
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}
                >
                  {s === 'active' ? 'Activo' : s === 'suspended' ? 'Mora' : 'Egresado'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            id="student-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="student-submit-btn"
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all text-sm font-bold cursor-pointer shadow-md shadow-indigo-600/10"
          >
            {studentToEdit ? 'Guardar Cambios' : 'Registrar Alumno'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
