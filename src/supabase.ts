import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 🔐 AUTH (Google)
// ==========================================
export async function signInWithGoogle() {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ==========================================
// 📚 SHARED CLASSES (Student view)
// ==========================================
export interface SupabaseSharedClass {
  id: string;
  teacher_name: string;
  subject_name: string;
  school_name: string;
  class_title: string;
  duration: string;
  video_url: string;
  recording_id?: string;
  chapters: any;
  subtitles: any;
  quiz_questions: any;
  created_at?: string;
  expires_at?: string;
}

export const mapToSupabase = (data: any): Partial<SupabaseSharedClass> => {
  return {
    id: data.id,
    teacher_name: data.teacherName || '',
    subject_name: data.subjectName || '',
    school_name: data.schoolName || '',
    class_title: data.name || data.classTitle || 'Clase sin título',
    duration: data.duration || '0:00',
    video_url: data.url || data.videoUrl || '',
    recording_id: data.recordingId,
    chapters: data.chapters || [],
    subtitles: data.srtText ? [data.srtText] : (data.subtitles || []),
    quiz_questions: {
      questions: data.quizQuestions || [],
      oracleExam: data.oracleExam || null,
      allowFeedback: data.allowFeedback !== false
    } as any,
    expires_at: data.expiresAt
  };
};

export const mapFromSupabase = (row: any) => {
  if (!row) return null;
  const quizObj = row.quiz_questions || {};
  return {
    id: row.id,
    // Canonical aliases used throughout App.tsx
    name: row.class_title || 'Clase sin título',
    url: row.video_url || '',
    // Also kept for backwards compat
    teacherName: row.teacher_name,
    subjectName: row.subject_name,
    schoolName: row.school_name,
    classTitle: row.class_title,
    duration: row.duration,
    videoUrl: row.video_url,
    recordingId: row.recording_id,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
    chapters: row.chapters || [],
    subtitles: row.subtitles || [],
    srtText: Array.isArray(row.subtitles) && row.subtitles.length > 0 
      ? row.subtitles[0] 
      : (typeof row.subtitles === 'string' ? row.subtitles : ''),
    quizQuestions: quizObj.questions || (Array.isArray(row.quiz_questions) ? row.quiz_questions : []),
    oracleExam: quizObj.oracleExam || null,
    allowFeedback: quizObj.allowFeedback !== false,
    createdAt: row.created_at,
    expiresAt: row.expires_at
  };
};

export function subscribeToSharedClasses(onUpdate: (classes: any[]) => void) {
  if (!supabase) return () => {};

  supabase
    .from('shared_classes')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (!error && data) onUpdate(data.map(mapFromSupabase));
    });

  const channel = supabase
    .channel('shared_classes_changes_' + Math.random().toString(36).substring(2, 9))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shared_classes' },
      () => {
        supabase
          .from('shared_classes')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) onUpdate(data.map(mapFromSupabase));
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getSharedClassById(id: string) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { data, error } = await supabase.from('shared_classes').select('*').eq('id', id).single();
  if (error) throw error;
  return mapFromSupabase(data);
}

export async function insertSharedClass(classData: any) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const payload = mapToSupabase(classData);
  const { data, error } = await supabase.from('shared_classes').insert([payload]).select();
  if (error) throw error;
  return data;
}

export async function deleteSharedClass(id: string) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { error } = await supabase.from('shared_classes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// 📼 TEACHER RECORDINGS (Private History)
// ==========================================
export function subscribeToTeacherRecordings(userId: string, onUpdate: (recordings: any[]) => void) {
  if (!supabase) return () => {};

  const mapRecording = (row: any) => ({
    id: row.id,
    name: row.name,
    size: row.size,
    date: row.date,
    url: row.url,
    chapters: row.chapters || [],
    transcriptionText: row.transcription_text || '',
    srtText: row.srt_text || '',
    blob: new Blob([], { type: 'video/webm' }) // placeholder
  });

  supabase
    .from('teacher_recordings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (!error && data) onUpdate(data.map(mapRecording));
    });

  const channel = supabase
    .channel('teacher_recordings_changes_' + Math.random().toString(36).substring(2, 9))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'teacher_recordings', filter: `user_id=eq.${userId}` },
      () => {
        supabase
          .from('teacher_recordings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) onUpdate(data.map(mapRecording));
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function insertTeacherRecording(userId: string, rec: any) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const payload = {
    id: rec.id,
    user_id: userId,
    name: rec.name,
    size: rec.size,
    date: rec.date,
    url: rec.url,
    chapters: rec.chapters || [],
    transcription_text: rec.transcriptionText || '',
    srt_text: rec.srtText || ''
  };
  const { data, error } = await supabase.from('teacher_recordings').insert([payload]).select();
  if (error) throw error;
  return data;
}

export async function deleteTeacherRecording(id: string) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { error } = await supabase.from('teacher_recordings').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// 💬 FEEDBACK (Student to Teacher)
// ==========================================
export async function submitClassFeedback(sharedClassId: string, rating: number, comment: string) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { data, error } = await supabase.from('class_feedbacks').insert([{
    shared_class_id: sharedClassId,
    rating,
    comment
  }]).select();
  
  if (error) throw error;
  return data;
}

export async function getClassFeedbacks(sharedClassId: string) {
  if (!supabase) throw new Error("Supabase no configurado.");
  const { data, error } = await supabase
    .from('class_feedbacks')
    .select('*')
    .eq('shared_class_id', sharedClassId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
// ==========================================
// ?? DOCENT ADMIN (ERP/Control)
// ==========================================
import { Course, Student, Payment } from './components/Admin/adminTypes';

export interface UserConfig {
  institutionName: string;
  institutionSubtitle: string;
  institutionLogo: string;
  simulatedDate: string;
  colorTheme?: string;
}

export async function saveUserConfig(userId: string, config: UserConfig) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_config').upsert({ user_id: userId, ...config });
  if (error) throw error;
}

export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('admin_config').select('*').eq('user_id', userId).single();
  if (error || !data) return null;
  return {
    institutionName: data.institutionName,
    institutionSubtitle: data.institutionSubtitle,
    institutionLogo: data.institutionLogo,
    simulatedDate: data.simulatedDate,
    colorTheme: data.colorTheme
  };
}

export async function dbSaveCourse(userId: string, course: Course) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_courses').upsert({ user_id: userId, id: course.id, data: course });
  if (error) throw error;
}

export async function dbDeleteCourse(userId: string, courseId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_courses').delete().eq('user_id', userId).eq('id', courseId);
  if (error) throw error;
}

export async function dbSaveStudent(userId: string, student: Student) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_students').upsert({ user_id: userId, id: student.id, data: student });
  if (error) throw error;
}

export async function dbDeleteStudent(userId: string, studentId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_students').delete().eq('user_id', userId).eq('id', studentId);
  if (error) throw error;
}

export async function dbSavePayment(userId: string, payment: Payment) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_payments').upsert({ user_id: userId, id: payment.id, data: payment });
  if (error) throw error;
}

export async function dbDeletePayment(userId: string, paymentId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('admin_payments').delete().eq('user_id', userId).eq('id', paymentId);
  if (error) throw error;
}

export async function loadUserData(userId: string) {
  if (!supabase) return { courses: [], students: [], payments: [], config: null };
  const [coursesRes, studentsRes, paymentsRes, config] = await Promise.all([
    supabase.from('admin_courses').select('data').eq('user_id', userId),
    supabase.from('admin_students').select('data').eq('user_id', userId),
    supabase.from('admin_payments').select('data').eq('user_id', userId),
    getUserConfig(userId)
  ]);

  return {
    courses: coursesRes.data?.map(row => row.data as Course) || [],
    students: studentsRes.data?.map(row => row.data as Student) || [],
    payments: paymentsRes.data?.map(row => row.data as Payment) || [],
    config
  };
}

export async function syncLocalDataToFirebase(
  userId: string, 
  courses: Course[], 
  students: Student[], 
  payments: Payment[],
  config: UserConfig
) {
  // Renamed from Firebase to Supabase internally but keeping function signature for now to match App.tsx
  await saveUserConfig(userId, config);
  if (courses.length > 0) {
    await supabase?.from('admin_courses').upsert(courses.map(c => ({ user_id: userId, id: c.id, data: c })));
  }
  if (students.length > 0) {
    await supabase?.from('admin_students').upsert(students.map(s => ({ user_id: userId, id: s.id, data: s })));
  }
  if (payments.length > 0) {
    await supabase?.from('admin_payments').upsert(payments.map(p => ({ user_id: userId, id: p.id, data: p })));
  }
}

export async function clearAllUserDataInFirestore(userId: string) {
  if (!supabase) return;
  await Promise.all([
    supabase.from('admin_courses').delete().eq('user_id', userId),
    supabase.from('admin_students').delete().eq('user_id', userId),
    supabase.from('admin_payments').delete().eq('user_id', userId)
  ]);
}

// ==========================================
// 🎓 CAMPUS ACADEMIES PERSISTENCE (LMS Moodle)
// ==========================================
export async function saveAcademiesToDb(academiesList: any[]) {
  if (!supabase) return;
  const payload = academiesList.map(a => ({
    id: a.id,
    subdomain: a.subdomain || '',
    name: a.name || '',
    description: a.description || '',
    theme_id: a.themeId || 'indigo',
    logo_url: a.logoUrl || '',
    banner_url: a.bannerUrl || '',
    courses: a.courses || [],
    talleres: a.talleres || [],
    feed: a.feed || [],
    user_state: a.user || {},
    students: a.students || []
  }));
  const { error } = await supabase.from('campus_academies').upsert(payload);
  if (error) {
    console.warn("Could not save academies to Supabase table campus_academies:", error.message);
    throw error;
  }
}

export async function loadAcademiesFromDb(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('campus_academies').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn("Could not load academies from Supabase table campus_academies:", error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  return data.map(row => ({
    id: row.id,
    subdomain: row.subdomain,
    name: row.name,
    description: row.description,
    themeId: row.theme_id,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    courses: row.courses || [],
    talleres: row.talleres || [],
    feed: row.feed || [],
    user: row.user_state || {},
    students: row.students || []
  }));
}
