# Debug Checklist: Why Data Isn't Persisting

## Step 1: Check Browser Console

Open your browser console (F12) and look for these specific logs:

### Expected Logs on Page Load:
```
✅ Firebase initialized successfully with Realtime Database
✅ Loading entries for user: {some-uid}
✅ Loading from Firebase path: users/{uid}
✅ Either:
   - Firebase data found: X entries
   OR
   - No Firebase data found for user - returning empty array
```

### Expected Logs When Adding Entry:
```
✅ Saving entries for user: {uid} Entries count: X
✅ Saving to Firebase path: users/{uid} Entries count: X
✅ Firebase save successful
✅ Save result: {success: true}
```

### ❌ BAD Signs (tell me if you see these):
```
❌ Firebase not configured. App will use localStorage only.
❌ Database not initialized - db is null
❌ Error saving entries to Firebase: ...
❌ Error loading entries from Firebase: ...
❌ PERMISSION_DENIED
```

## Step 2: Check Firebase Console

1. Go to https://console.firebase.google.com/
2. Select **beary-sweet** project
3. Click **Realtime Database** in left sidebar

### Question A: Do you see a database?
- ✅ YES → Go to Question B
- ❌ NO → Click "Create Database" and follow the setup

### Question B: Check the Data Tab
1. Click **"Data"** tab
2. After you add an entry, do you see:
```
users
  └── {some-long-uid}
       ├── entries: [...]
       ├── displayName: "your-username"
       └── lastUpdated: "2024-..."
```

- ✅ YES, I see data → Go to Question C
- ❌ NO, it's empty → **SECURITY RULES ARE BLOCKING WRITES**

### Question C: Check Security Rules
1. Click **"Rules"** tab
2. Do you see rules like this?

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

- ✅ YES → Good, rules are correct
- ❌ NO, different rules → **COPY THE RULES FROM database.rules.json**

## Step 3: Verify UID Consistency

### In Browser Console, type:
```javascript
// Check current user
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser')))

// This should show null because we're using Firebase Auth now
// If you see a username here, that's the OLD auth system
```

### The Issue:
If you see `{username: "grace", password: "..."}` in localStorage, that means:
- ❌ You're using the OLD username/password system (localStorage only)
- ❌ NOT using Firebase Authentication
- ❌ Data is stored at wrong path

### The Fix:
You need to **sign up again** with the NEW system:
1. Click Logout
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Username: grace (or whatever you want)
   - Email: grace@example.com (MUST be valid email format)
   - Password: (your password)
4. This creates a Firebase Auth account with a UID

## Step 4: Path Verification

After signing up with the NEW system, check console:

```
Loading entries for user: jKL9mN3pQ... (should be a LONG random UID)
NOT: Loading entries for user: grace (username)
```

## Common Issues:

### Issue 1: Old Auth System Still Active
**Symptom**: `currentUser` in localStorage has `{username, password}`
**Fix**: Clear localStorage and sign up again with email

### Issue 2: Firebase Not Enabled
**Symptom**: Console shows "Firebase not configured"
**Fix**: Check your .env file has all Firebase variables

### Issue 3: Security Rules Too Restrictive
**Symptom**: "PERMISSION_DENIED" in console
**Fix**:
1. Go to Firebase Console → Realtime Database → Rules
2. Temporarily set to (TESTING ONLY):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. If it works now, the rules were the issue
4. Then set proper rules from database.rules.json

### Issue 4: Database Not Created
**Symptom**: Firebase console shows "Get started" button
**Fix**: Click it and create the database

## Quick Test:

Run this in browser console after signing in:
```javascript
// This should log the Firebase UID, not a username
console.log('UID:', auth.currentUser?.uid)
```

If it shows `undefined`, Firebase Auth isn't working.

## Tell Me:
1. What do you see in the console when you refresh?
2. Is there data in Firebase Console → Realtime Database → Data tab?
3. What are your security rules set to?
4. What does `localStorage.getItem('currentUser')` show? (should be null)
