import { db } from '../firebase';
import {
  ref,
  set,
  get,
  onValue,
  off
} from 'firebase/database';

/**
 * Save user's entries to Firebase Realtime Database
 * @param {string} uid - User's Firebase UID
 * @param {array} entries - User's honey jar entries
 * @param {string} displayName - User's display name (optional, for reference)
 */
export const saveEntries = async (uid, entries, displayName = null) => {
  if (!db) {
    console.warn('Database not initialized - db is null');
    return { success: false, error: 'Database not initialized' };
  }

  try {
    const userRef = ref(db, `users/${uid}`);
    const data = {
      entries,
      lastUpdated: new Date().toISOString()
    };

    // Include displayName if provided
    if (displayName) {
      data.displayName = displayName;
    }

    console.log('Saving to Firebase path:', `users/${uid}`, 'Entries count:', entries.length);
    await set(userRef, data);
    console.log('Firebase save successful');
    return { success: true };
  } catch (error) {
    console.error('Error saving entries to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load user's entries from Firebase Realtime Database
 * @param {string} uid - User's Firebase UID
 */
export const loadEntries = async (uid) => {
  if (!db) {
    console.warn('Database not initialized - db is null');
    return { success: false, error: 'Database not initialized', entries: [] };
  }

  try {
    const userRef = ref(db, `users/${uid}`);
    console.log('Loading from Firebase path:', `users/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Firebase data found:', data.entries?.length || 0, 'entries');
      return {
        success: true,
        entries: data.entries || [],
        lastUpdated: data.lastUpdated
      };
    } else {
      console.log('No Firebase data found for user - returning empty array');
      // User doesn't exist yet - return empty entries
      return { success: true, entries: [] };
    }
  } catch (error) {
    console.error('Error loading entries from Firebase:', error);
    return { success: false, error: error.message, entries: [] };
  }
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = () => {
  return !!(
    process.env.REACT_APP_FIREBASE_API_KEY &&
    process.env.REACT_APP_FIREBASE_PROJECT_ID
  );
};

/**
 * Fallback to localStorage if Firebase not configured
 */
export const getStorageKey = (username) => `honeyJarEntries_${username}`;

export const saveToLocalStorage = (username, entries) => {
  try {
    localStorage.setItem(getStorageKey(username), JSON.stringify(entries));
    return { success: true };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { success: false, error: error.message };
  }
};

export const loadFromLocalStorage = (username) => {
  try {
    const stored = localStorage.getItem(getStorageKey(username));
    return {
      success: true,
      entries: stored ? JSON.parse(stored) : []
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return { success: false, error: error.message, entries: [] };
  }
};

/**
 * Smart save - uses Firebase if available, falls back to localStorage
 * @param {string} uid - User's Firebase UID (or username for localStorage fallback)
 * @param {array} entries - User's honey jar entries
 * @param {string} displayName - User's display name (optional)
 */
export const saveEntriesSmart = async (uid, entries, displayName = null) => {
  if (isFirebaseConfigured() && db) {
    const result = await saveEntries(uid, entries, displayName);
    if (result.success) {
      // Also save to localStorage as backup
      saveToLocalStorage(uid, entries);
    }
    return result;
  } else {
    return saveToLocalStorage(uid, entries);
  }
};

/**
 * Smart load - uses Firebase if available, falls back to localStorage
 * @param {string} uid - User's Firebase UID (or username for localStorage fallback)
 */
export const loadEntriesSmart = async (uid) => {
  if (isFirebaseConfigured() && db) {
    const result = await loadEntries(uid);
    if (result.success) {
      // Always save to localStorage for offline access, even if empty
      saveToLocalStorage(uid, result.entries);
      return result;
    } else {
      // If Firebase fails, try localStorage as fallback
      console.warn('Firebase load failed, falling back to localStorage');
      return loadFromLocalStorage(uid);
    }
  } else {
    return loadFromLocalStorage(uid);
  }
};

/**
 * Subscribe to real-time updates for user's entries
 * @param {string} uid - User's Firebase UID
 * @param {function} callback - Function to call when data changes (receives entries array)
 * @returns {function} Unsubscribe function to stop listening
 */
export const subscribeToEntries = (uid, callback) => {
  if (!db) {
    console.warn('Database not initialized - cannot subscribe to real-time updates');
    // Return empty unsubscribe function
    return () => {};
  }

  const userRef = ref(db, `users/${uid}`);

  console.log('Setting up real-time listener for:', `users/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Real-time update received:', data.entries?.length || 0, 'entries');
      callback(data.entries || []);
    } else {
      console.log('Real-time update: No data exists yet');
      callback([]);
    }
  }, (error) => {
    console.error('Error in real-time listener:', error);
  });

  return () => {
    console.log('Unsubscribing from real-time updates');
    off(userRef);
  };
};
