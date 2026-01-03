import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  ref,
  set,
  get
} from 'firebase/database';

// Check if Firebase Auth is available
const isAuthAvailable = () => auth !== null;

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} username - User's username (used as displayName)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signUp = async (email, password, username) => {
  if (!isAuthAvailable()) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured. Please add Firebase config to your .env file.'
    };
  }

  try {
    // Check if username is already taken (if Firebase is configured)
    if (db) {
      const usernameRef = ref(db, `usernames/${username.toLowerCase()}`);
      const usernameSnapshot = await get(usernameRef);
      if (usernameSnapshot.exists()) {
        return {
          success: false,
          error: 'This username is already taken. Please choose another.'
        };
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Set display name
    await updateProfile(userCredential.user, {
      displayName: username
    });

    // Store username-to-email mapping in Realtime Database (if available)
    if (db) {
      const usernameRef = ref(db, `usernames/${username.toLowerCase()}`);
      await set(usernameRef, {
        email: email.toLowerCase(),
        uid: userCredential.user.uid,
        username: username
      });
    }

    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username
      }
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Sign in an existing user with email or username and password
 * @param {string} emailOrUsername - User's email or username
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signIn = async (emailOrUsername, password) => {
  if (!isAuthAvailable()) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured. Please add Firebase config to your .env file.'
    };
  }

  try {
    let email = emailOrUsername;

    // Check if input looks like an email (contains @)
    if (!emailOrUsername.includes('@')) {
      // It's a username, look up the email
      if (db) {
        const usernameRef = ref(db, `usernames/${emailOrUsername.toLowerCase()}`);
        const usernameSnapshot = await get(usernameRef);
        if (usernameSnapshot.exists()) {
          email = usernameSnapshot.val().email;
        } else {
          return {
            success: false,
            error: 'Username not found. Please check your username or use your email.'
          };
        }
      } else {
        return {
          success: false,
          error: 'Firebase not configured. Please use email to sign in.'
        };
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOut = async () => {
  if (!isAuthAvailable()) {
    return { success: true }; // No-op if auth not available
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Listen for authentication state changes
 * @param {Function} callback - Called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  if (!isAuthAvailable()) {
    // If Firebase auth not available, immediately call callback with null
    callback(null);
    // Return a no-op unsubscribe function
    return () => {};
  }

  return firebaseOnAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Get current authenticated user
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  if (!isAuthAvailable()) {
    return null;
  }

  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  }
  return null;
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return `Authentication error: ${errorCode}`;
  }
};
