import React, { useState } from 'react';
import { Student, Course, Payment } from '../types';
import Modal from './Modal';
import { MONTH_NAMES } from '../data/mockData';
import { AlertTriangle, Send, Check, MessageSquare, Copy } from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  courses: Course[];
  payments: Payment[];
  simulatedDate: Date;
  onUpdatePayment: (payment: Payment) => void;
}

export default function AlertsModal({
  isOpen,
  onClose,
  students,
  courses,
  payments,
  simulatedDate,
  onUpdatePayment
}: AlertsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Function to determine if a payment is overdue based on simulated Date
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

  // Compile list of overdue items
  const overdueItems = payments
    .filter((p) => {
      const student = students.find((s) => s.id === p.studentId);
      if (!student || student.status !== 'active') return false; // only alert on active students
      const course = courses.find((c) => c.id === student.courseId);
      if (!course) return false;
      return isPaymentOverdue(p, course);
    })
    .map((p) => {
      const student = students.find((s) => s.id === p.studentId)!;
      const course = courses.find((c) => c.id === student.courseId)!;
      const monthName = MONTH_NAMES[(course.startMonth + p.monthIndex) % 12];
      
      // Calculate payment month and year
      let m = course.startMonth + p.monthIndex;
      let y = 2026;
      if (m > 11) {
        y += Math.floor(m / 12);
        m = m % 12;
      }
      const dueDate = new Date(y, m, course.dueDay);
      
      return {
        payment: p,
        student,
        course,
        monthName,
        dueDate,
        daysLate: Math.max(0, Math.floor((simulatedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      };
    })
    .sort((a, b) => b.daysLate - a.daysLate); // Sort by most days late

  const handleQuickCollect = (item: any) => {
    const updated: Payment = {
      ...item.payment,
      status: 'paid',
      paidDate: simulatedDate.toISOString(),
      paymentMethod: 'Transferencia',
      amountPaid: item.course.tuitionFee
    };
    onUpdatePayment(updated);
  };

  const handleSendWhatsApp = (item: any) => {
    const message = `Estimado/a ${item.student.name}, le recordamos de administración que registra un saldo pendiente de ${item.course.currency}${item.course.tuitionFee.toLocaleString('es-AR')} por la cuota de *${item.monthName}* del cursado *${item.course.name}* (Venció el ${item.dueDate.getDate()}/${item.dueDate.getMonth() + 1}). Agradecemos regularizar su situación. ¡Saludos!`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = item.student.phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleCopyText = (item: any) => {
    const message = `Estimado/a ${item.student.name}, le recordamos de administración que registra un saldo pendiente de ${item.course.currency}${item.course.tuitionFee.toLocaleString('es-AR')} por la cuota de *${item.monthName}* del cursado *${item.course.name}* (Venció el ${item.dueDate.getDate()}/${item.dueDate.getMonth() + 1}). Agradecemos regularizar su situación. ¡Saludos!`;
    navigator.clipboard.writeText(message);
    setCopiedId(item.payment.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alerta de Alumnos Atrasados"
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs font-semibold leading-relaxed">
            <span className="font-bold block text-sm text-rose-900 mb-0.5">Control de Mora Activa Automatizado</span>
            Aquí se listan las cuotas cuyo día de vencimiento ha pasado con respecto a la fecha del simulador y aún siguen pendientes. Se recomienda enviar recordatorios.
          </div>
        </div>

        {overdueItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">¡Al día! No hay cuotas atrasadas.</p>
            <p className="text-xs mt-1 text-slate-450 font-medium">Todos los alumnos activos tienen sus cuotas pagas o se encuentran dentro del plazo de gracia.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {overdueItems.map((item) => (
              <div
                key={item.payment.id}
                className="border border-slate-150 rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white hover:bg-slate-50/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.student.name}</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100/60 px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase">
                      {item.daysLate} días de mora
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Curso: <span className="font-bold text-slate-700">{item.course.name}</span> • Cuota: <span className="font-bold text-slate-700">{item.monthName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    Monto debido: <span className="font-bold text-rose-500">{item.course.currency}{item.course.tuitionFee.toLocaleString('es-AR')}</span> • Venció: {item.dueDate.toLocaleDateString('es-AR')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleCopyText(item)}
                    title="Copiar texto de recordatorio"
                    className={`px-3 py-1.5 text-slate-550 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border border-slate-200/60`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedId === item.payment.id ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(item)}
                    className="py-1.5 px-3.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-100"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleQuickCollect(item)}
                    className="py-1.5 px-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Cobrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
