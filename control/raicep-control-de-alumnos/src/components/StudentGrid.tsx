import React, { useState } from 'react';
import { Student, Course, Payment } from '../types';
import { MONTH_NAMES } from '../data/mockData';
import { 
  UserX, 
  Edit3, 
  Search, 
  Plus, 
  Check, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  BookOpen, 
  X,
  CreditCard
} from 'lucide-react';

interface StudentGridProps {
  students: Student[];
  courses: Course[];
  payments: Payment[];
  selectedCourseId: string;
  onSelectCourseId: (id: string) => void;
  onEditStudent: (student: Student) => void;
  onRemoveStudent: (studentId: string) => void;
  onOpenPayments: (student: Student, course: Course) => void;
  onAddStudent: () => void;
  onAddCourse: () => void;
  simulatedDate: Date;
}

export default function StudentGrid({
  students,
  courses,
  payments,
  selectedCourseId,
  onSelectCourseId,
  onEditStudent,
  onRemoveStudent,
  onOpenPayments,
  onAddStudent,
  onAddCourse,
  simulatedDate
}: StudentGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Find course helper
  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId) || null;
  };

  // Check payment status dynamically
  const getPaymentStatus = (payment: Payment, course: Course | null) => {
    if (!course) return 'pending';
    if (payment.status === 'paid') return 'paid';

    // Calculate due date
    const paymentMonthOffset = payment.monthIndex;
    let paymentMonth = course.startMonth + paymentMonthOffset;
    let paymentYear = 2026;

    if (paymentMonth > 11) {
      paymentYear += Math.floor(paymentMonth / 12);
      paymentMonth = paymentMonth % 12;
    }

    const dueDay = course.dueDay;
    const dueDate = new Date(paymentYear, paymentMonth, dueDay, 23, 59, 59);

    if (simulatedDate > dueDate) {
      return 'overdue';
    }
    return 'pending';
  };

  // Filter students based on course selection and search term
  const filteredStudents = students.filter(student => {
    const matchesCourse = !selectedCourseId || student.courseId === selectedCourseId;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.phone.includes(searchTerm);
    return matchesCourse && matchesSearch;
  });

  // Calculate maximum duration to render enough columns
  const activeCourses = selectedCourseId 
    ? courses.filter(c => c.id === selectedCourseId)
    : courses;
  
  const maxInstallments = activeCourses.reduce((max, c) => Math.max(max, c.duration), 0) || 6;

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden font-sans">
      {/* Spreadsheet Header / Filters */}
      <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-course-all"
            onClick={() => onSelectCourseId('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
              !selectedCourseId 
                ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/15' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos los Cursados ({students.length})
          </button>
          
          {courses.map((course) => {
            const courseCount = students.filter(s => s.courseId === course.id).length;
            return (
              <button
                key={course.id}
                id={`filter-course-${course.id}`}
                onClick={() => onSelectCourseId(course.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCourseId === course.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: course.color === 'fuchsia' ? '#d946ef' : course.color === 'emerald' ? '#10b981' : '#4f46e5' }} />
                {course.name} ({courseCount})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs w-full md:w-56 focus:outline-none focus:border-indigo-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Add Buttons */}
          <button
            id="quick-add-student-btn"
            onClick={onAddStudent}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5 text-xs font-bold px-4 py-2"
          >
            <Plus className="h-4 w-4" />
            <span>Inscribir Alumno</span>
          </button>
        </div>
      </div>

      {/* Main Grid Spreadsheet */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/55 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6 select-none font-bold">Alumno / Cursado</th>
              <th className="py-4 px-4 select-none text-center font-bold">Estado</th>
              
              {/* Render Payment Columns dynamically */}
              {Array.from({ length: maxInstallments }).map((_, idx) => (
                <th key={idx} className="py-4 px-2 text-center select-none w-20 font-bold">
                  Cuota {idx + 1}
                </th>
              ))}
              
              <th className="py-4 px-6 text-right select-none font-bold">Acciones</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={3 + maxInstallments} className="text-center py-20 text-slate-400">
                  <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-base">No se encontraron alumnos registrados</p>
                  <p className="text-xs text-slate-400 mt-1">Intente cambiar de cursado o registrar un nuevo alumno.</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const studentCourse = getCourse(student.courseId);
                const studentPayments = payments.filter(p => p.studentId === student.id);

                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/40 transition-colors group"
                  >
                    {/* Student Identity and Assigned Course */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-150">
                          {student.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate leading-snug">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-400 block truncate mt-0.5">
                            {studentCourse?.name || 'Sin Curso asignado'}
                            {studentCourse?.teacherName && ` • Prof. ${studentCourse.teacherName}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 text-center shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        student.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60' 
                          : student.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border-rose-100/60'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100/60'
                      }`}>
                        {student.status === 'active' ? 'Activo' : student.status === 'suspended' ? 'Mora' : 'Egresado'}
                      </span>
                    </td>

                    {/* Render Interactive Payment Bubbles */}
                    {Array.from({ length: maxInstallments }).map((_, idx) => {
                      // Find payment for this monthIndex
                      const payment = studentPayments.find(p => p.monthIndex === idx);
                      
                      // If course duration is shorter than this index, render empty block
                      if (!studentCourse || idx >= studentCourse.duration) {
                        return (
                          <td key={idx} className="py-4 px-2 text-center select-none opacity-25">
                            <span className="text-xs text-slate-300">-</span>
                          </td>
                        );
                      }

                      // If payment is missing, we render a default pending cell
                      const activePayment = payment || {
                        id: `missing-${student.id}-${idx}`,
                        studentId: student.id,
                        monthIndex: idx,
                        status: 'pending' as const
                      };

                      const pStatus = getPaymentStatus(activePayment, studentCourse);
                      const monthName = MONTH_NAMES[(studentCourse.startMonth + idx) % 12];

                      // Define cell styling depending on calculated status
                      let cellColorClass = '';
                      let icon = null;
                      let tooltip = '';

                      if (pStatus === 'paid') {
                        cellColorClass = 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200';
                        icon = <Check className="h-4 w-4 stroke-[3]" />;
                        tooltip = `Pagado el ${new Date(activePayment.paidDate || '').toLocaleDateString('es-AR')} vía ${activePayment.paymentMethod || 'Efectivo'}`;
                      } else if (pStatus === 'overdue') {
                        cellColorClass = 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 animate-pulse-subtle';
                        icon = <AlertTriangle className="h-4 w-4" />;
                        tooltip = `¡ATRASADO! Vence el ${studentCourse.dueDay} de ${monthName}`;
                      } else {
                        cellColorClass = 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700';
                        icon = <Clock className="h-4 w-4" />;
                        tooltip = `Pendiente • Vence el ${studentCourse.dueDay} de ${monthName}`;
                      }

                      return (
                        <td key={idx} className="py-4 px-2 text-center">
                          <button
                            id={`pay-cell-${student.id}-${idx}`}
                            onClick={() => onOpenPayments(student, studentCourse)}
                            title={tooltip}
                            className={`h-8 w-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer relative group/cell ${cellColorClass}`}
                          >
                            {icon}
                            {/* Hover status popover helper */}
                            <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 scale-0 group-hover/cell:scale-100 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg font-bold whitespace-nowrap z-20 pointer-events-none transition-transform origin-bottom shadow-xl border border-slate-800">
                              {tooltip}
                            </span>
                          </button>
                        </td>
                      );
                    })}

                    {/* Actions panel */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`manage-payments-btn-${student.id}`}
                          onClick={() => onOpenPayments(student, studentCourse!)}
                          title="Gestionar Pagos y WhatsApp"
                          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                        <button
                          id={`edit-student-btn-${student.id}`}
                          onClick={() => onEditStudent(student)}
                          title="Editar Datos"
                          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          id={`remove-student-btn-${student.id}`}
                          onClick={() => onRemoveStudent(student.id)}
                          title="Eliminar de Cursado"
                          className="p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Legend */}
      <div className="px-6 py-5 bg-slate-50/40 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span>Al día (Pagado)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-slate-200 bg-slate-50 inline-block shrink-0" />
            <span>Pendiente (A tiempo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-rose-200 bg-rose-50 inline-block shrink-0 animate-pulse" />
            <span>Atrasado (En mora)</span>
          </div>
        </div>
        <p className="font-semibold text-slate-500">
          * Haga clic en cualquiera de las cuotas de un alumno para registrar pagos, emitir WhatsApp o ver detalles.
        </p>
      </div>
    </div>
  );
}
