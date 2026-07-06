import { Course, Student, Payment } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    name: 'Desarrollo Web Full Stack',
    tuitionFee: 35000,
    currency: '$',
    dueDay: 10,
    startMonth: 2, // Marzo
    duration: 6,
    color: 'indigo'
  },
  {
    id: 'course-2',
    name: 'Diseño UX/UI Avanzado',
    tuitionFee: 28000,
    currency: '$',
    dueDay: 15,
    startMonth: 3, // Abril
    duration: 4,
    color: 'fuchsia'
  },
  {
    id: 'course-3',
    name: 'Marketing Digital y SEO',
    tuitionFee: 22000,
    currency: '$',
    dueDay: 5,
    startMonth: 4, // Mayo
    duration: 3,
    color: 'emerald'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // Course 1
  {
    id: 'student-1',
    name: 'Lautaro Martínez',
    email: 'lautaro.m@gmail.com',
    phone: '+54 9 11 5432-8765',
    courseId: 'course-1',
    status: 'active',
    joinedDate: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'student-2',
    name: 'Valentina Rossi',
    email: 'valen.rossi@outlook.com',
    phone: '+54 9 341 987-6543',
    courseId: 'course-1',
    status: 'active',
    joinedDate: '2026-03-02T14:30:00.000Z'
  },
  {
    id: 'student-3',
    name: 'Mateo Fernández',
    email: 'mateo.f@hotmail.com',
    phone: '+54 9 261 456-1122',
    courseId: 'course-1',
    status: 'suspended',
    joinedDate: '2026-03-05T09:15:00.000Z'
  },
  {
    id: 'student-4',
    name: 'Sofía Díaz',
    email: 'sofia.diaz@gmail.com',
    phone: '+54 9 11 3211-5544',
    courseId: 'course-1',
    status: 'active',
    joinedDate: '2026-03-03T11:00:00.000Z'
  },
  // Course 2
  {
    id: 'student-5',
    name: 'Thiago Almada',
    email: 'thiago.a@gmail.com',
    phone: '+54 9 351 654-7890',
    courseId: 'course-2',
    status: 'active',
    joinedDate: '2026-04-01T10:00:00.000Z'
  },
  {
    id: 'student-6',
    name: 'Camila López',
    email: 'camila.lopez@yahoo.com',
    phone: '+54 9 11 7654-3210',
    courseId: 'course-2',
    status: 'active',
    joinedDate: '2026-04-03T16:20:00.000Z'
  },
  // Course 3
  {
    id: 'student-7',
    name: 'Benjamín Agüero',
    email: 'benja.aguero@gmail.com',
    phone: '+54 9 11 4444-5555',
    courseId: 'course-3',
    status: 'active',
    joinedDate: '2026-05-02T11:45:00.000Z'
  },
  {
    id: 'student-8',
    name: 'Emilia Mernes',
    email: 'emilia.mernes@gmail.com',
    phone: '+54 9 3447 55-6677',
    courseId: 'course-3',
    status: 'graduated',
    joinedDate: '2026-05-01T08:00:00.000Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  // Lautaro Martinez (Course 1 - starts March. Paid: Cuota 1 (March), Cuota 2 (April), Cuota 3 (May). Pending: Cuota 4 (June), etc.)
  {
    id: 'pay-1-0',
    studentId: 'student-1',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-03-09T18:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-1-1',
    studentId: 'student-1',
    monthIndex: 1,
    status: 'paid',
    paidDate: '2026-04-08T11:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-1-2',
    studentId: 'student-1',
    monthIndex: 2,
    status: 'paid',
    paidDate: '2026-05-10T15:30:00.000Z',
    paymentMethod: 'Mercado Pago',
    amountPaid: 35000
  },
  {
    id: 'pay-1-3',
    studentId: 'student-1',
    monthIndex: 3,
    status: 'pending'
  },
  {
    id: 'pay-1-4',
    studentId: 'student-1',
    monthIndex: 4,
    status: 'pending'
  },
  {
    id: 'pay-1-5',
    studentId: 'student-1',
    monthIndex: 5,
    status: 'pending'
  },

  // Valentina Rossi (Course 1 - starts March. Paid: Cuota 1, Cuota 2. Pending: Cuota 3 (May) - Atrasado!, Cuota 4 (June) etc)
  {
    id: 'pay-2-0',
    studentId: 'student-2',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-03-05T10:00:00.000Z',
    paymentMethod: 'Efectivo',
    amountPaid: 35000
  },
  {
    id: 'pay-2-1',
    studentId: 'student-2',
    monthIndex: 1,
    status: 'paid',
    paidDate: '2026-04-09T12:00:00.000Z',
    paymentMethod: 'Tarjeta',
    amountPaid: 35000
  },
  {
    id: 'pay-2-2',
    studentId: 'student-2',
    monthIndex: 2,
    status: 'pending' // Atrasada si el simulador está en Mayo o posterior pasado el día 10
  },
  {
    id: 'pay-2-3',
    studentId: 'student-2',
    monthIndex: 3,
    status: 'pending'
  },
  {
    id: 'pay-2-4',
    studentId: 'student-2',
    monthIndex: 4,
    status: 'pending'
  },
  {
    id: 'pay-2-5',
    studentId: 'student-2',
    monthIndex: 5,
    status: 'pending'
  },

  // Mateo Fernandez (Course 1 - starts March. Suspended. Paid: Cuota 1. Pending: Cuota 2 (April) - Atrasado!, Cuota 3 (May), etc)
  {
    id: 'pay-3-0',
    studentId: 'student-3',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-03-10T17:00:00.000Z',
    paymentMethod: 'Mercado Pago',
    amountPaid: 35000
  },
  {
    id: 'pay-3-1',
    studentId: 'student-3',
    monthIndex: 1,
    status: 'pending'
  },
  {
    id: 'pay-3-2',
    studentId: 'student-3',
    monthIndex: 2,
    status: 'pending'
  },
  {
    id: 'pay-3-3',
    studentId: 'student-3',
    monthIndex: 3,
    status: 'pending'
  },
  {
    id: 'pay-3-4',
    studentId: 'student-3',
    monthIndex: 4,
    status: 'pending'
  },
  {
    id: 'pay-3-5',
    studentId: 'student-3',
    monthIndex: 5,
    status: 'pending'
  },

  // Sofia Diaz (Course 1 - Paid all up to June)
  {
    id: 'pay-4-0',
    studentId: 'student-4',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-03-08T09:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-4-1',
    studentId: 'student-4',
    monthIndex: 1,
    status: 'paid',
    paidDate: '2026-04-07T14:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-4-2',
    studentId: 'student-4',
    monthIndex: 2,
    status: 'paid',
    paidDate: '2026-05-09T11:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-4-3',
    studentId: 'student-4',
    monthIndex: 3,
    status: 'paid',
    paidDate: '2026-06-05T10:15:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 35000
  },
  {
    id: 'pay-4-4',
    studentId: 'student-4',
    monthIndex: 4,
    status: 'pending'
  },
  {
    id: 'pay-4-5',
    studentId: 'student-4',
    monthIndex: 5,
    status: 'pending'
  },

  // Thiago Almada (Course 2 - starts April. Paid: Cuota 1 (April). Pending: Cuota 2 (May) - Atrasado!)
  {
    id: 'pay-5-0',
    studentId: 'student-5',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-04-12T16:00:00.000Z',
    paymentMethod: 'Mercado Pago',
    amountPaid: 28000
  },
  {
    id: 'pay-5-1',
    studentId: 'student-5',
    monthIndex: 1,
    status: 'pending'
  },
  {
    id: 'pay-5-2',
    studentId: 'student-5',
    monthIndex: 2,
    status: 'pending'
  },
  {
    id: 'pay-5-3',
    studentId: 'student-5',
    monthIndex: 3,
    status: 'pending'
  },

  // Camila Lopez (Course 2 - starts April. Paid: Cuota 1, Cuota 2 (May))
  {
    id: 'pay-6-0',
    studentId: 'student-6',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-04-14T09:30:00.000Z',
    paymentMethod: 'Tarjeta',
    amountPaid: 28000
  },
  {
    id: 'pay-6-1',
    studentId: 'student-6',
    monthIndex: 1,
    status: 'paid',
    paidDate: '2026-05-15T18:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 28000
  },
  {
    id: 'pay-6-2',
    studentId: 'student-6',
    monthIndex: 2,
    status: 'pending'
  },
  {
    id: 'pay-6-3',
    studentId: 'student-6',
    monthIndex: 3,
    status: 'pending'
  },

  // Benjamin Aguero (Course 3 - starts May. Paid: None - Atrasado con Cuota 1!)
  {
    id: 'pay-7-0',
    studentId: 'student-7',
    monthIndex: 0,
    status: 'pending'
  },
  {
    id: 'pay-7-1',
    studentId: 'student-7',
    monthIndex: 1,
    status: 'pending'
  },
  {
    id: 'pay-7-2',
    studentId: 'student-7',
    monthIndex: 2,
    status: 'pending'
  },

  // Emilia Mernes (Course 3 - Graduated - Paid all!)
  {
    id: 'pay-8-0',
    studentId: 'student-8',
    monthIndex: 0,
    status: 'paid',
    paidDate: '2026-05-04T10:00:00.000Z',
    paymentMethod: 'Efectivo',
    amountPaid: 22000
  },
  {
    id: 'pay-8-1',
    studentId: 'student-8',
    monthIndex: 1,
    status: 'paid',
    paidDate: '2026-06-03T11:15:00.000Z',
    paymentMethod: 'Mercado Pago',
    amountPaid: 22000
  },
  {
    id: 'pay-8-2',
    studentId: 'student-8',
    monthIndex: 2,
    status: 'paid',
    paidDate: '2026-07-02T15:00:00.000Z',
    paymentMethod: 'Transferencia',
    amountPaid: 22000
  }
];

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];
