import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course, Student, Payment } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Types
export interface UserConfig {
  institutionName: string;
  institutionSubtitle: string;
  institutionLogo: string;
  simulatedDate: string;
  colorTheme?: string;
}

// Helpers for Auth
const googleProvider = new GoogleAuthProvider();
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
export type { FirebaseUser };

// --- FIRESTORE UTILITIES ---

/**
 * Saves the header/institution configuration for a user.
 */
export async function saveUserConfig(userId: string, config: UserConfig) {
  const configRef = doc(db, 'users', userId, 'config', 'header');
  await setDoc(configRef, config, { merge: true });
}

/**
 * Gets the header/institution configuration for a user.
 */
export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  const configRef = doc(db, 'users', userId, 'config', 'header');
  const snap = await getDoc(configRef);
  if (snap.exists()) {
    return snap.data() as UserConfig;
  }
  return null;
}

/**
 * Saves a single course to Firestore.
 */
export async function dbSaveCourse(userId: string, course: Course) {
  const docRef = doc(db, 'users', userId, 'courses', course.id);
  await setDoc(docRef, course);
}

/**
 * Deletes a course from Firestore.
 */
export async function dbDeleteCourse(userId: string, courseId: string) {
  const docRef = doc(db, 'users', userId, 'courses', courseId);
  await deleteDoc(docRef);
}

/**
 * Saves a single student to Firestore.
 */
export async function dbSaveStudent(userId: string, student: Student) {
  const docRef = doc(db, 'users', userId, 'students', student.id);
  await setDoc(docRef, student);
}

/**
 * Deletes a student from Firestore.
 */
export async function dbDeleteStudent(userId: string, studentId: string) {
  const docRef = doc(db, 'users', userId, 'students', studentId);
  await deleteDoc(docRef);
}

/**
 * Saves a single payment to Firestore.
 */
export async function dbSavePayment(userId: string, payment: Payment) {
  const docRef = doc(db, 'users', userId, 'payments', payment.id);
  await setDoc(docRef, payment);
}

/**
 * Deletes a single payment from Firestore.
 */
export async function dbDeletePayment(userId: string, paymentId: string) {
  const docRef = doc(db, 'users', userId, 'payments', paymentId);
  await deleteDoc(docRef);
}

/**
 * Syncs/Migrates all local data to Firebase (e.g. on first sign up).
 */
export async function syncLocalDataToFirebase(
  userId: string, 
  courses: Course[], 
  students: Student[], 
  payments: Payment[],
  config: UserConfig
) {
  // Save config
  await saveUserConfig(userId, config);

  // Write courses in batch
  const batch = writeBatch(db);
  
  courses.forEach(course => {
    const ref = doc(db, 'users', userId, 'courses', course.id);
    batch.set(ref, course);
  });

  students.forEach(student => {
    const ref = doc(db, 'users', userId, 'students', student.id);
    batch.set(ref, student);
  });

  payments.forEach(payment => {
    const ref = doc(db, 'users', userId, 'payments', payment.id);
    batch.set(ref, payment);
  });

  await batch.commit();
}

/**
 * Loads all data for a specific user.
 */
export async function loadUserData(userId: string) {
  const coursesColl = collection(db, 'users', userId, 'courses');
  const studentsColl = collection(db, 'users', userId, 'students');
  const paymentsColl = collection(db, 'users', userId, 'payments');

  const [coursesSnap, studentsSnap, paymentsSnap, config] = await Promise.all([
    getDocs(coursesColl),
    getDocs(studentsColl),
    getDocs(paymentsColl),
    getUserConfig(userId)
  ]);

  const courses: Course[] = [];
  coursesSnap.forEach(doc => courses.push(doc.data() as Course));

  const students: Student[] = [];
  studentsSnap.forEach(doc => students.push(doc.data() as Student));

  const payments: Payment[] = [];
  paymentsSnap.forEach(doc => payments.push(doc.data() as Payment));

  return {
    courses,
    students,
    payments,
    config
  };
}

/**
 * Clears all user data from Firestore (when they click Clear All).
 */
export async function clearAllUserDataInFirestore(userId: string) {
  const coursesColl = collection(db, 'users', userId, 'courses');
  const studentsColl = collection(db, 'users', userId, 'students');
  const paymentsColl = collection(db, 'users', userId, 'payments');

  const [coursesSnap, studentsSnap, paymentsSnap] = await Promise.all([
    getDocs(coursesColl),
    getDocs(studentsColl),
    getDocs(paymentsColl)
  ]);

  const batch = writeBatch(db);
  
  coursesSnap.forEach(doc => batch.delete(doc.ref));
  studentsSnap.forEach(doc => batch.delete(doc.ref));
  paymentsSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}
