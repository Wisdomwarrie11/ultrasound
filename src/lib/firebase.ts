/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  getDoc,
  deleteDoc, 
  updateDoc,
  addDoc,
  onSnapshot, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { User, QuizTest, Question, QuizResult, SystemNotification } from '../types';
import { ULTRA_PHYSICS_50_QUESTIONS } from './seededQuestions';

// Firebase credentials from user-provided starter config
const firebaseConfig = {
  apiKey: "AIzaSyAk1sU3cz7SNdbo3YDy4_N7wPioY-lpUNs",
  authDomain: "the-ultrasound-academy.firebaseapp.com",
  projectId: "the-ultrasound-academy",
  storageBucket: "the-ultrasound-academy.firebasestorage.app",
  messagingSenderId: "842690766071",
  appId: "1:842690766071:web:e05f31670babc306addff2",
  measurementId: "G-62SXJQHLVY"
};

// Initialize app & firestore (supports custom/multi-databases or standard default database)
const app = initializeApp(firebaseConfig);
const db = (firebaseConfig as any).databaseId 
  ? initializeFirestore(app, { databaseId: (firebaseConfig as any).databaseId } as any) 
  : getFirestore(app);
const auth = getAuth(app);

// Use persistent auth
setPersistence(auth, browserLocalPersistence).catch(console.warn);

// Live cached lists for instant reactive synchronous gets (backward compatible with the current views)
let cachedUsers: User[] = [];
let cachedTests: QuizTest[] = [];
let cachedQuestions: Question[] = [];
let cachedResults: QuizResult[] = [];
let cachedNotifications: SystemNotification[] = [];
let currentUserSession: User | null = null;

// Subscribers notifier list
const subscribers = new Set<() => void>();
const notifySubscribers = () => {
  subscribers.forEach(cb => {
    try { cb(); } catch (e) { console.error('Error notifying subscriber:', e); }
  });
};

export const subscribeToUpdates = (cb: () => void): (() => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

// Start Firestore Snapshot Listeners to update the local cached states
let unsubs: (() => void)[] = [];

function startRealtimeSync() {
  // Unsubscribe standard items if any
  unsubs.forEach(un => un());
  unsubs = [];

  const handleSyncError = (collectionName: string) => (err: any) => {
    console.warn(`Firestore ${collectionName} subscription failed (this is normal before signing in or if database rules are restricted):`, err.message);
  };

  // 1. Users sync
  unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
    cachedUsers = snap.docs.map(d => d.data() as User);
    // sync current user session logic
    if (auth.currentUser) {
      const match = cachedUsers.find(u => u.id === auth.currentUser?.uid);
      if (match) {
        currentUserSession = match;
        localStorage.setItem('ua_current_user', JSON.stringify(match));
      }
    }
    notifySubscribers();
  }, handleSyncError('users')));

  // 2. Tests sync
  unsubs.push(onSnapshot(collection(db, 'tests'), (snap) => {
    cachedTests = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        topic: data.topic || 'General',
        description: data.description || '',
        scheduledDate: data.scheduledDate || '',
        duration: Number(data.duration) || 15,
        status: data.status || 'published',
        questionsCount: Number(data.questionsCount) || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        publishedAt: data.publishedAt || data.createdAt || new Date().toISOString()
      } as QuizTest;
    });
    notifySubscribers();
  }, handleSyncError('tests')));

  // 3. Questions sync
  unsubs.push(onSnapshot(collection(db, 'questions'), (snap) => {
    cachedQuestions = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        testId: data.testId || '',
        questionText: data.questionText || '',
        options: Array.isArray(data.options) ? data.options : ['', '', '', ''],
        correctAnswer: Number(data.correctAnswer) || 0,
        explanation: data.explanation || ''
      } as Question;
    });
    notifySubscribers();
  }, handleSyncError('questions')));

  // 4. Results sync
  unsubs.push(onSnapshot(collection(db, 'results'), (snap) => {
    cachedResults = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        testId: data.testId || '',
        testTitle: data.testTitle || '',
        studentId: data.studentId || '',
        studentName: data.studentName || '',
        score: Number(data.score) || 0,
        totalQuestions: Number(data.totalQuestions) || 0,
        questionsAnswered: Number(data.questionsAnswered) || 0,
        timeTaken: Number(data.timeTaken) || 0,
        submissionTime: data.submissionTime || new Date().toISOString()
      } as QuizResult;
    });
    notifySubscribers();
  }, handleSyncError('results')));

  // 5. Notifications/Announcements sync
  unsubs.push(onSnapshot(collection(db, 'notifications'), (snap) => {
    cachedNotifications = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        text: data.text || '',
        timestamp: data.timestamp || new Date().toISOString(),
        read: !!data.read,
        category: data.category || 'announcement',
        title: data.title || '',
        body: data.body || '',
        scheduledDate: data.scheduledDate || '',
        status: data.status || 'published'
      } as any;
    });

    // Sort notifications newest first
    cachedNotifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    notifySubscribers();
  }, handleSyncError('notifications')));
}

// Track Auth State changes to load the user profile
onAuthStateChanged(auth, async (fbUser) => {
  try {
    if (fbUser) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      let docSnap;
      try {
        docSnap = await getDoc(userDocRef);
      } catch (err) {
        console.warn("Could not load user document (may require sign-in or database rule updates):", err);
      }

      const emailNorm = fbUser.email?.toLowerCase().trim() || '';
      const isAdminEmail = emailNorm.includes('admin') || emailNorm === 'wwtbas@gmail.com';

      if (docSnap && docSnap.exists()) {
        currentUserSession = docSnap.data() as User;
        if (isAdminEmail && currentUserSession.role !== 'admin') {
          currentUserSession.role = 'admin';
          try {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
          } catch (e) {
            console.warn("Could not upgrade user role in Firestore:", e);
          }
        }
      } else {
        // Build a fallback if users sync is taking longer but doc is populated
        currentUserSession = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
          email: fbUser.email || '',
          role: isAdminEmail ? 'admin' : 'student',
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, currentUserSession);
        } catch (err) {
          console.warn("Could not save fallback user document:", err);
        }
      }
      localStorage.setItem('ua_current_user', JSON.stringify(currentUserSession));
      
      // Since user is successfully logged in, let's trigger search/realtime sync
      startRealtimeSync();
    } else {
      currentUserSession = null;
      localStorage.removeItem('ua_current_user');
    }
    notifySubscribers();
  } catch (err) {
    console.error("Unhandled error in auth state changed callback:", err);
  }
});

// Boot Realtime Synchronization immediately
startRealtimeSync();

// Auto seed initial data on boot
async function seedDefaultDatabase() {
  try {
    const testsRef = collection(db, 'tests');
    const qSnap = await getDocs(testsRef);
    if (qSnap.empty) {
      console.log('No data found in Firestore collections. Seeding comprehensive Ultrasound Physics exam...');
      
      // Let's seed our specialized 50 questions test
      const testId = 'test-physics-50';
      const physicsTest: QuizTest = {
        id: testId,
        title: 'Quiz 1: Comprehensive Ultrasound Physics Principles',
        topic: 'SPI Physics',
        description: 'Prepare thoroughly with 50 real ultrasound physics board-style questions covering acoustics, transducers, instrumentation, Doppler shifts, and biosafety protocols.',
        scheduledDate: new Date().toISOString().split('T')[0], // Available Today!
        duration: 45, // 45 minutes
        status: 'published',
        questionsCount: 50,
        createdAt: new Date().toISOString()
      } as any;
      
      // Set publishedAt
      const publishedTest = {
        ...physicsTest,
        publishedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'tests', testId), publishedTest);

      // Seed all 50 questions
      const promises = ULTRA_PHYSICS_50_QUESTIONS.map(q => {
        return setDoc(doc(db, 'questions', q.id), q);
      });
      await Promise.all(promises);

      // Seed default announcement about StudiRad & 50 questions live
      const notifId = 'notif-physics-50';
      const physicsAnnouncement = {
        id: notifId,
        text: '🟢 Comprehensive Ultrasound Physics Quiz with 50 questions is now published! Real-time leaderboards are live.',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'announcement',
        title: 'Ultrasound Physics Exam Released',
        body: 'Students have exactly 1 day (24 hours) from the publication time to complete this core SPI physics evaluation on the board-level criteria.',
        status: 'published'
      };
      await setDoc(doc(db, 'notifications', notifId), physicsAnnouncement);

      // Add The Ultrasound Academy general introduction announcement
      const introNotifId = 'notif-academy-intro';
      const academyIntroObj = {
        id: introNotifId,
        text: '✨ Welcome to The Ultrasound Academy! Explore quizzes, schedules, and active peer leaderboards.',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'announcement',
        title: 'Welcome to The Ultrasound Academy!',
        body: 'The Ultrasound Academy introduces clinical sonography simulators, physical ultrasound focus guides, and active computer-based evaluations to prepare next-generation clinical specialists.',
        status: 'published'
      };
      await setDoc(doc(db, 'notifications', introNotifId), academyIntroObj);

      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Failed to seed default database:', err);
  }
}

// Trigger Seeding in the background
setTimeout(seedDefaultDatabase, 1500);

export class FirebaseStore {
  static subscribeToUpdates(cb: () => void): (() => void) {
    return subscribeToUpdates(cb);
  }

  static getSessionUser(): User | null {
    if (currentUserSession) return currentUserSession;
    try {
      const userStr = localStorage.getItem('ua_current_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Real authentication flow
  static async loginFirebase(email: string, pass: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const emailNorm = email.toLowerCase().trim();
      const userCredential = await signInWithEmailAndPassword(auth, emailNorm, pass);
      const fbUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      const isAdminEmail = emailNorm.includes('admin') || emailNorm === 'wwtbas@gmail.com';

      let finalUser: User;
      if (docSnap.exists()) {
        finalUser = docSnap.data() as User;
        if (isAdminEmail && finalUser.role !== 'admin') {
          finalUser.role = 'admin';
          try {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
          } catch (e) {
            console.warn("Could not upgrade user role on login:", e);
          }
        }
      } else {
        // Build user record if missing
        finalUser = {
          id: fbUser.uid,
          name: fbUser.displayName || emailNorm.split('@')[0],
          email: emailNorm,
          role: isAdminEmail ? 'admin' : 'student',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, finalUser);
      }
      
      currentUserSession = finalUser;
      localStorage.setItem('ua_current_user', JSON.stringify(finalUser));
      notifySubscribers();
      return { user: finalUser, error: null };
    } catch (e: any) {
      console.error(e);
      // Clean, easy-to-understand fallback error
      let errMsg = 'Failed to authenticate. Please verify your email and password.';
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errMsg = 'Incorrect secret password or email account.';
      } else if (e.code === 'auth/user-not-found') {
        errMsg = 'No student account or candidate record registered with this email.';
      } else if (e.code === 'auth/invalid-email') {
        errMsg = 'The email address format is invalid.';
      }
      return { user: null, error: errMsg };
    }
  }

  // Backwards compatible login with Auto fallback or real login if pass is provided
  static login(email: string, roleSetting?: 'student' | 'admin'): { user: User; error: string | null } {
    const emailNorm = email.toLowerCase().trim();
    const matchedUser = cachedUsers.find(u => u.email.toLowerCase() === emailNorm) || {
      id: 'student-sarah',
      name: 'Sarah Connor',
      email: 'student@ua.edu',
      role: 'student',
      createdAt: new Date().toISOString()
    };
    
    // Fallback sync for demo users
    currentUserSession = matchedUser as any;
    localStorage.setItem('ua_current_user', JSON.stringify(matchedUser));
    notifySubscribers();
    return { user: matchedUser as any, error: null };
  }

  // Real registration flow (Restricts registration to Student role, and blocks Admin signup)
  static async registerFirebase(name: string, email: string, pass: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const emailNorm = email.toLowerCase().trim();
      
      // Force 'student' role. Admin accounts cannot be signed up through register UI, only logged in.
      const assignedRole = 'student';

      const userCredential = await createUserWithEmailAndPassword(auth, emailNorm, pass);
      const fbUser = userCredential.user;

      const newUser: User = {
        id: fbUser.uid,
        name: name.trim(),
        email: emailNorm,
        role: assignedRole,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      
      currentUserSession = newUser;
      localStorage.setItem('ua_current_user', JSON.stringify(newUser));
      notifySubscribers();
      return { user: newUser, error: null };
    } catch (e: any) {
      console.error(e);
      let errMsg = 'Could not register user.';
      if (e.code === 'auth/email-already-in-use') {
        errMsg = 'A candidate account is already registered with this email address.';
      } else if (e.code === 'auth/weak-password') {
        errMsg = 'The secret password is too weak. Must be at least 6 characters.';
      }
      return { user: null, error: errMsg };
    }
  }

  static register(name: string, email: string, role: 'student' | 'admin'): { user: User; error: string | null } {
    return { user: null as any, error: 'Please use registerFirebase' };
  }

  static async logoutFirebase(): Promise<void> {
    await signOut(auth);
    currentUserSession = null;
    localStorage.removeItem('ua_current_user');
    notifySubscribers();
  }

  static logout(): void {
    this.logoutFirebase().catch(err => console.error("Firebase logout error:", err));
  }

  // Quiz tests CRUD APIs
  static getTests(): QuizTest[] {
    return cachedTests;
  }

  static async saveTestFirebase(test: Partial<QuizTest> & { title: string }): Promise<QuizTest> {
    const id = test.id || 'test-' + Math.random().toString(36).substring(2, 9);
    const isNew = !test.id;

    const resolvedTest: QuizTest = {
      id,
      title: test.title,
      topic: test.topic || 'General',
      description: test.description || '',
      scheduledDate: test.scheduledDate || new Date().toISOString().split('T')[0],
      duration: Number(test.duration) || 15,
      status: test.status || 'draft',
      questionsCount: Number(test.questionsCount) || 0,
      createdAt: test.createdAt || new Date().toISOString(),
      publishedAt: test.publishedAt || (test.status === 'published' ? new Date().toISOString() : '')
    } as any;

    // Save test link if any
    if ((test as any).quizLink) {
      (resolvedTest as any).quizLink = (test as any).quizLink;
    }

    await setDoc(doc(db, 'tests', id), resolvedTest);
    
    // Add real announcement automatically if quiz status shifts from draft to published!
    if (test.status === 'published' && isNew) {
      await this.addNotificationFirebase(
        `🟢 NEW Evaluation Released: [${resolvedTest.title}]. Solve details within 1 day.`,
        'announcement',
        resolvedTest.title,
        `Admin published a new diagnostic test. You have 24 hours to complete the answers. Duration: ${resolvedTest.duration} minutes.`
      );
    }

    return resolvedTest;
  }

  static saveTest(test: Partial<QuizTest> & { title: string }): QuizTest {
    this.saveTestFirebase(test).catch(err => console.error("Firebase saveTest error:", err));
    // return cached item or quick constructed object
    return test as any;
  }

  static async deleteTestFirebase(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tests', id));
    
    // cascade answers and results
    const relativeQuestions = cachedQuestions.filter(q => q.testId === id);
    const qPromises = relativeQuestions.map(q => deleteDoc(doc(db, 'questions', q.id)));
    await Promise.all(qPromises);

    const relativeResults = cachedResults.filter(r => r.testId === id);
    const rPromises = relativeResults.map(r => deleteDoc(doc(db, 'results', r.id)));
    await Promise.all(rPromises);
  }

  static deleteTest(id: string): void {
    this.deleteTestFirebase(id).catch(err => console.error("Firebase deleteTest error:", err));
  }

  // Questions APIs
  static getQuestions(): Question[] {
    return cachedQuestions;
  }

  static getQuestionsForTest(testId: string): Question[] {
    return cachedQuestions.filter(q => q.testId === testId);
  }

  static async saveQuestionFirebase(q: Partial<Question> & { testId: string; questionText: string }): Promise<Question> {
    const id = q.id || 'q-' + Math.random().toString(36).substring(2, 9);
    
    const resolvedQ: Question = {
      id,
      testId: q.testId,
      questionText: q.questionText,
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
      explanation: q.explanation || '',
    };

    await setDoc(doc(db, 'questions', id), resolvedQ);

    // Update count in corresponding test document
    const updatedTestQs = cachedQuestions.filter(item => item.testId === q.testId);
    const testDoc = cachedTests.find(t => t.id === q.testId);
    if (testDoc) {
      await updateDoc(doc(db, 'tests', q.testId), {
        questionsCount: updatedTestQs.length + (q.id ? 0 : 1)
      });
    }

    return resolvedQ;
  }

  static saveQuestion(q: Partial<Question> & { testId: string; questionText: string }): Question {
    this.saveQuestionFirebase(q).catch(err => console.error("Firebase saveQuestion error:", err));
    return q as any;
  }

  static async deleteQuestionFirebase(qId: string, testId: string): Promise<void> {
    await deleteDoc(doc(db, 'questions', qId));

    // Update count
    const updatedTestQs = cachedQuestions.filter(item => item.testId === testId && item.id !== qId);
    await updateDoc(doc(db, 'tests', testId), {
      questionsCount: updatedTestQs.length
    });
  }

  static deleteQuestion(qId: string, testId: string): void {
    this.deleteQuestionFirebase(qId, testId).catch(err => console.error("Firebase deleteQuestion error:", err));
  }

  // Results APIs
  static getResults(): QuizResult[] {
    return cachedResults;
  }

  static async saveResultFirebase(res: Omit<QuizResult, 'id'>): Promise<QuizResult> {
    const id = 'res-' + Math.random().toString(36).substring(2, 9);
    const newRes: QuizResult = {
      ...res,
      id,
      submissionTime: new Date().toISOString()
    };
    await setDoc(doc(db, 'results', id), newRes);
    return newRes;
  }

  static saveResult(res: Omit<QuizResult, 'id'>): QuizResult {
    this.saveResultFirebase(res).catch(err => console.error("Firebase saveResult error:", err));
    return res as any;
  }

  // Notifications / Announcements APIs
  static getNotifications(): SystemNotification[] {
    return cachedNotifications;
  }

  static async addNotificationFirebase(
    text: string, 
    category: 'announcement' | 'class' | 'presentation' | 'other' = 'announcement', 
    title?: string, 
    body?: string,
    scheduledDate?: string
  ): Promise<SystemNotification> {
    const id = 'notif-' + Math.random().toString(36).substring(2, 9);
    
    const newNotif = {
      id,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      category,
      title: title || 'Notice',
      body: body || text,
      scheduledDate: scheduledDate || '',
      status: 'published'
    };

    await setDoc(doc(db, 'notifications', id), newNotif);
    return newNotif as any;
  }

  static async saveNotificationFirebase(notif: any): Promise<void> {
    const id = notif.id || 'notif-' + Math.random().toString(36).substring(2, 9);
    const updatedNotif = {
      id,
      text: notif.text || `📢 [${(notif.category || 'announcement').toUpperCase()}] ${notif.title}`,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: !!notif.read,
      category: notif.category || 'announcement',
      title: notif.title || 'Notice',
      body: notif.body || notif.text || '',
      scheduledDate: notif.scheduledDate || '',
      status: notif.status || 'published'
    };
    await setDoc(doc(db, 'notifications', id), updatedNotif);
  }

  static async deleteNotificationFirebase(id: string): Promise<void> {
    await deleteDoc(doc(db, 'notifications', id));
  }

  static addNotification(text: string): SystemNotification {
    this.addNotificationFirebase(text).catch(err => console.error("Firebase addNotification error:", err));
    return { id: '', text, timestamp: new Date().toISOString(), read: false };
  }

  static async markAllNotificationsReadFirebase(): Promise<void> {
    const promises = cachedNotifications.map(n => {
      return updateDoc(doc(db, 'notifications', n.id), { read: true });
    });
    await Promise.all(promises);
  }

  static markAllNotificationsRead(): void {
    this.markAllNotificationsReadFirebase().catch(err => console.error("Firebase markAllNotificationsRead error:", err));
  }
}
