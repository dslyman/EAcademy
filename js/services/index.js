import { config } from '../config.js';
import { api } from './http.js';
import { mockRequest } from '../mock/mockApi.js';
import { auth, db } from './firebaseClient.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, getDocFromServer
} from 'firebase/firestore';
import { courses } from '../data/courses.js';

// Optional Firestore connection test (non-blocking)
(async () => {
  if (!config.useMock) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch {
      // Quietly ignore in case of offline or initial load
    }
  }
})();

function formatUser(firebaseUser, profileData = {}) {
  if (!firebaseUser) return null;
  return {
    id: firebaseUser.uid,
    name: profileData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    phone: profileData.phone || '',
    preferences: profileData.preferences || { courseUpdates: true, reminders: true, news: false },
  };
}

export const authService = {
  session: async () => {
    if (config.useMock) return api('/auth/session').then(r => r.user);
    return new Promise((resolve) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(null);
        }
      }, 2000);
      try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          if (!firebaseUser) {
            resolve(null);
            return;
          }
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            const profileData = userSnap.exists() ? userSnap.data() : {};
            resolve(formatUser(firebaseUser, profileData));
          } catch {
            resolve(formatUser(firebaseUser));
          }
        }, () => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            resolve(null);
          }
        });
      } catch {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve(null);
        }
      }
    });
  },
  login: async (email, password) => {
    if (config.useMock) return api('/auth/login', { method: 'POST', body: { email, password } }).then(r => r.user);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userSnap = await getDoc(userDocRef);
    const profileData = userSnap.exists() ? userSnap.data() : {};
    return formatUser(cred.user, profileData);
  },
  signup: async (data) => {
    if (config.useMock) return api('/auth/signup', { method: 'POST', body: data }).then(r => r.user);
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const userData = {
      id: cred.user.uid,
      name: data.name || data.email.split('@')[0],
      email: data.email,
      phone: '',
      preferences: { courseUpdates: true, reminders: true, news: false },
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    return formatUser(cred.user, userData);
  },
  logout: async () => {
    if (config.useMock) return api('/auth/logout', { method: 'POST' });
    await signOut(auth);
  },
  forgotPassword: async (email) => {
    if (config.useMock) return api('/auth/forgot-password', { method: 'POST', body: { email } });
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  },
  resetPassword: async (token, password) => {
    if (config.useMock) return api('/auth/reset-password', { method: 'POST', body: { token, password } });
    await confirmPasswordReset(auth, token, password);
    return { ok: true };
  },
};

export const courseService = {
  list: async () => {
    if (config.useMock) return api('/courses');
    return courses.map(({ modules, ...c }) => ({ ...c, lessonCount: modules.flatMap(m => m.lessons).length, modules }));
  },
  get: async (slug) => {
    if (config.useMock) return api(`/courses/${encodeURIComponent(slug)}`);
    const found = courses.find(c => c.slug === decodeURIComponent(slug));
    if (!found) {
      const err = new Error('Course not found');
      err.status = 404;
      throw err;
    }
    return found;
  },
};

export const enrollmentService = {
  list: async () => {
    if (config.useMock) return api('/enrollments');
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await getDocs(collection(db, 'users', user.uid, 'enrollments'));
    return snap.docs.map(d => d.data());
  },
  enroll: async (courseId) => {
    if (config.useMock) return api('/enrollments', { method: 'POST', body: { courseId } });
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid, 'enrollments', courseId);
    const data = { courseId, enrolledAt: new Date().toISOString() };
    await setDoc(ref, data, { merge: true });
    return enrollmentService.list();
  },
};

export const progressService = {
  list: async () => {
    if (config.useMock) return api('/progress');
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await getDocs(collection(db, 'users', user.uid, 'progress'));
    return snap.docs.map(d => d.data());
  },
  setLessonComplete: async (courseId, lessonId, completed) => {
    if (config.useMock) return api(`/progress/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: { completed } });
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid, 'progress', courseId);
    const snap = await getDoc(ref);
    let p = snap.exists() ? snap.data() : { courseId, completedLessonIds: [], lastLessonId: lessonId, lastAccessedAt: null };
    const set = new Set(p.completedLessonIds);
    completed ? set.add(lessonId) : set.delete(lessonId);
    p = {
      courseId,
      completedLessonIds: [...set],
      lastLessonId: lessonId,
      lastAccessedAt: new Date().toISOString()
    };
    await setDoc(ref, p, { merge: true });
    return p;
  },
};

export const userService = {
  update: async (patch) => {
    if (config.useMock) return api('/me', { method: 'PATCH', body: patch });
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, patch);
    const snap = await getDoc(ref);
    return formatUser(user, snap.exists() ? snap.data() : {});
  },
  setPreferences: async (prefs) => {
    if (config.useMock) return api('/me/preferences', { method: 'PATCH', body: prefs });
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { preferences: prefs });
    const snap = await getDoc(ref);
    return formatUser(user, snap.exists() ? snap.data() : {});
  },
  changePassword: async (current, next) => {
    if (config.useMock) return api('/me/password', { method: 'POST', body: { current, next } });
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    await updatePassword(user, next);
    return { ok: true };
  },
};
