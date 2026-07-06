export interface Course {
  id: string;
  name: string;
  tuitionFee: number;
  currency: string;
  dueDay: number; // Día del mes de vencimiento (ej. 10)
  startMonth: number; // Mes de inicio (0 = Enero, 11 = Diciembre)
  duration: number; // Duración en meses
  color: string; // Color para UI (ej. 'blue', 'purple', 'emerald')
  teacherName?: string; // Nombre del profesor del curso
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  status: 'active' | 'suspended' | 'graduated';
  joinedDate: string; // ISO String
}

export interface Payment {
  id: string;
  studentId: string;
  monthIndex: number; // Índice de cuota (0 a duración-1)
  status: 'paid' | 'pending';
  paidDate?: string; // Fecha de pago
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Mercado Pago';
  amountPaid?: number;
}

export interface Notification {
  id: string;
  studentId: string;
  message: string;
  date: string;
  type: 'alert' | 'payment_received' | 'course_created';
  isRead: boolean;
}
