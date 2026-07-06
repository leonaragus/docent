import React, { useState } from 'react';
import { Student, Course, Payment } from './adminTypes';
import Modal from './Modal';
import { MONTH_NAMES } from './mockData';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Send, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  course: Course | null;
  payments: Payment[];
  onUpdatePayment: (payment: Payment) => void;
  simulatedDate: Date;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  student,
  course,
  payments,
  onUpdatePayment,
  simulatedDate
}: PaymentDetailsModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payMethod, setPayMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Mercado Pago'>('Mercado Pago');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!student || !course) return null;

  // Function to determine if a payment is overdue based on simulated Date
  const getPaymentStatus = (payment: Payment) => {
    if (payment.status === 'paid') return 'paid';

    // Calculate due year and month for this payment index
    const paymentMonthOffset = payment.monthIndex;
    let paymentMonth = course.startMonth + paymentMonthOffset;
    let paymentYear = 2026; // Base year matching mock dates

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

  const handleOpenRegister = (payment: Payment) => {
    setSelectedPayment(payment);
    setPayAmount(course.tuitionFee);
    setIsRegistering(true);
  };

  const handleSavePayment = () => {
    if (!selectedPayment) return;

    const updated: Payment = {
      ...selectedPayment,
      status: 'paid',
      paidDate: simulatedDate.toISOString(),
      paymentMethod: payMethod,
      amountPaid: payAmount
    };

    onUpdatePayment(updated);
    setIsRegistering(false);
    setSelectedPayment(null);
  };

  const handleUndoPayment = (payment: Payment) => {
    const updated: Payment = {
      ...payment,
      status: 'pending',
      paidDate: undefined,
      paymentMethod: undefined,
      amountPaid: undefined
    };
    onUpdatePayment(updated);
  };

  // Generate WhatsApp text for reminder or receipt
  const sendWhatsApp = (type: 'reminder' | 'receipt', payment: Payment) => {
    const monthName = MONTH_NAMES[(course.startMonth + payment.monthIndex) % 12];
    let message = '';

    if (type === 'reminder') {
      message = `Hola ${student.name}! Te escribimos de la institución para recordarte que se encuentra disponible para abonar la cuota de *${monthName}* correspondiente al curso *${course.name}*. El valor es de ${course.currency}${course.tuitionFee.toLocaleString('es-AR')}. ¡Muchas gracias!`;
    } else {
      message = `¡Hola ${student.name}! Te confirmamos el recibo de pago correspondiente a la cuota de *${monthName}* del curso *${course.name}* por un valor de ${course.currency}${(payment.amountPaid || course.tuitionFee).toLocaleString('es-AR')} abonado vía *${payment.paymentMethod || 'Efectivo'}*. ¡Muchas gracias por tu compromiso!`;
    }

    const encoded = encodeURIComponent(message);
    const cleanPhone = student.phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Calculate current stats for this student
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const totalPaid = studentPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amountPaid || course.tuitionFee), 0);
  
  const pendingCount = studentPayments.filter(p => getPaymentStatus(p) === 'pending').length;
  const overdueCount = studentPayments.filter(p => getPaymentStatus(p) === 'overdue').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial y Control de Pagos`}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Profile Info */}
        <div className="md:col-span-1 bg-slate-50/75 rounded-3xl p-5 border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md">
                {student.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base leading-tight">{student.name}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  student.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/65' 
                    : student.status === 'suspended'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100/65'
                    : 'bg-indigo-50 text-indigo-750 border border-indigo-100/65'
                }`}>
                  {student.status === 'active' ? 'Activo' : student.status === 'suspended' ? 'Mora' : 'Egresado'}
                </span>
              </div>
            </div>

            <hr className="border-slate-200/60" />

            {/* General contact info */}
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate font-bold text-slate-800">{course.name}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate text-slate-500 font-medium">{student.email || 'Sin correo'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-medium">{student.phone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4.5 border-t border-slate-200 space-y-3 font-medium">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Total Abonado</span>
              <span className="font-black text-slate-900 text-sm">{course.currency}{totalPaid.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Cuotas Pendientes</span>
              <span className="font-bold text-amber-600">{pendingCount} cuotas</span>
            </div>
            {overdueCount > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-bold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 animate-pulse" />
                  Cuotas Atrasadas
                </span>
                <span className="font-black text-rose-600">{overdueCount} cuotas</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Installments Grid */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-sans font-black text-slate-400 text-[10px] tracking-wider uppercase mb-1">
            Cronograma de Cuotas Mensuales
          </h4>

          {isRegistering && selectedPayment ? (
            /* Register Payment Form in Modal */
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Registrar Cuota N° {selectedPayment.monthIndex + 1} ({MONTH_NAMES[(course.startMonth + selectedPayment.monthIndex) % 12]})
                </span>
                <button 
                  onClick={() => setIsRegistering(false)} 
                  className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
                >
                  Volver
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Medio de Pago</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Monto Cobrado</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">$</span>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Confirmar Cobro
                </button>
              </div>
            </div>
          ) : (
            /* Installment List */
            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {studentPayments.map((payment) => {
                const status = getPaymentStatus(payment);
                const monthName = MONTH_NAMES[(course.startMonth + payment.monthIndex) % 12];
                
                // Calculate installment due date
                const paymentMonthOffset = payment.monthIndex;
                let paymentMonth = course.startMonth + paymentMonthOffset;
                let paymentYear = 2026;
                if (paymentMonth > 11) {
                  paymentYear += Math.floor(paymentMonth / 12);
                  paymentMonth = paymentMonth % 12;
                }
                const formattedDueDate = `${course.dueDay} de ${MONTH_NAMES[paymentMonth]} ${paymentYear}`;

                return (
                  <div 
                    key={payment.id} 
                    className="border border-slate-150 rounded-2xl p-4 hover:bg-slate-50/30 transition-all flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      {/* Visual Status Indicator */}
                      {status === 'paid' ? (
                        <div className="h-8.5 w-8.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : status === 'overdue' ? (
                        <div className="h-8.5 w-8.5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 animate-pulse">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-8.5 w-8.5 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                          <Clock className="h-4 w-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            Cuota N° {payment.monthIndex + 1} ({monthName})
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            status === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : status === 'overdue'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-slate-50 text-slate-600 border border-slate-150'
                          }`}>
                            {status === 'paid' ? 'Pagado' : status === 'overdue' ? 'Mora' : 'Pendiente'}
                          </span>
                        </div>

                        {status === 'paid' ? (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Abonado el {new Date(payment.paidDate!).toLocaleDateString('es-AR')} vía <span className="font-bold text-slate-600">{payment.paymentMethod}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-slate-300" />
                            Vence el {formattedDueDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {status === 'paid' ? (
                        <>
                          {/* Share receipt via WhatsApp */}
                          <button
                            onClick={() => sendWhatsApp('receipt', payment)}
                            title="Enviar Comprobante Digital"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          {/* Undo payment */}
                          <button
                            onClick={() => handleUndoPayment(payment)}
                            title="Revertir Pago"
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Send payment reminder */}
                          <button
                            onClick={() => sendWhatsApp('reminder', payment)}
                            title="Enviar Recordatorio de Pago"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          {/* Register Payment Button */}
                          <button
                            onClick={() => handleOpenRegister(payment)}
                            className="text-xs bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Cobrar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
