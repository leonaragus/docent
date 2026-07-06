import React from 'react';
import { Student, Course, Payment } from '../types';
import { DollarSign, Percent, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';

interface StatsGridProps {
  students: Student[];
  courses: Course[];
  payments: Payment[];
  simulatedDate: Date;
  onAlertsClick: () => void;
}

export default function StatsGrid({
  students,
  courses,
  payments,
  simulatedDate,
  onAlertsClick
}: StatsGridProps) {
  // Helper to determine if a payment is overdue based on simulated Date
  const isPaymentOverdue = (payment: Payment, course: Course) => {
    if (payment.status === 'paid') return false;

    const paymentMonthOffset = payment.monthIndex;
    let paymentMonth = course.startMonth + paymentMonthOffset;
    let paymentYear = 2026;

    if (paymentMonth > 11) {
      paymentYear += Math.floor(paymentMonth / 12);
      paymentMonth = paymentMonth % 12;
    }

    const dueDay = course.dueDay;
    const dueDate = new Date(paymentYear, paymentMonth, dueDay, 23, 59, 59);

    return simulatedDate > dueDate;
  };

  // 1. Total Collected
  const totalCollected = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  // 2. Collection Rate %
  // Total expected payments (tuitions) for active students
  const activeStudents = students.filter(s => s.status === 'active');
  const expectedPaymentsCount = activeStudents.reduce((sum, s) => {
    const course = courses.find(c => c.id === s.courseId);
    return sum + (course ? course.duration : 0);
  }, 0);

  const paidPaymentsCount = payments.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    return student && student.status === 'active' && p.status === 'paid';
  }).length;

  const collectionRate = expectedPaymentsCount > 0 
    ? Math.round((paidPaymentsCount / expectedPaymentsCount) * 100) 
    : 0;

  // 3. Overdue active students
  const overdueActiveStudentsCount = activeStudents.filter(student => {
    const course = courses.find(c => c.id === student.courseId);
    if (!course) return false;
    
    const studentPayments = payments.filter(p => p.studentId === student.id);
    return studentPayments.some(p => isPaymentOverdue(p, course));
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
      {/* Box 1: Total Collected */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Cobrado</span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-black text-slate-900 leading-none">
            ${totalCollected.toLocaleString('es-AR')}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Monto total de cobros registrados</p>
        </div>
      </div>

      {/* Box 2: Collection Rate */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tasa de Cobro</span>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
            <Percent className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{collectionRate}%</h3>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Eficiencia
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {paidPaymentsCount} de {expectedPaymentsCount} cuotas saldadas
          </p>
        </div>
      </div>

      {/* Box 3: Overdue Students (Interactive Alert Box) */}
      <button
        id="stats-alerts-box-btn"
        onClick={onAlertsClick}
        className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:border-rose-200 hover:shadow-md hover:shadow-rose-50/20 transition-all text-left flex flex-col justify-between cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">En Mora (Atrasados)</span>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
            overdueActiveStudentsCount > 0 
              ? 'bg-rose-50 text-rose-600 animate-pulse' 
              : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-black leading-none ${
              overdueActiveStudentsCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {overdueActiveStudentsCount} Alumnos
            </h3>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
              Ver lista <ChevronRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {overdueActiveStudentsCount > 0 ? 'Requieren acción inmediata' : 'Al día con las cuotas'}
          </p>
        </div>
      </button>

      {/* Box 4: Total Courses */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cursados Activos</span>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-black text-slate-900 leading-none">
            {courses.length} Cursos
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Materias, turnos y comisiones</p>
        </div>
      </div>
    </div>
  );
}
