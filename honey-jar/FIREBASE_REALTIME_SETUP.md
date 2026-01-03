# Firebase Realtime Database Setup Guide

This guide will help you set up Firebase Realtime Database (instead of Firestore) for cross-device data synchronization.

## 🔥 What is Firebase Realtime Database?

Firebase Realtime Database is a cloud-hosted NoSQL database that:
- Syncs data in real-time across all connected devices
- Works offline with automatic synchronization when back online
- Stores data as JSON
- Is simpler and faster for basic use cases than Firestore

## 📋 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select existing project)
3. Enter project name (e.g., "honey-jar")
4. Accept terms and click **"Continue"**
5. Disable Google Analytics (optional) or configure it
6. Click **"Create project"**
7. Wait for setup to complete, then click **"Continue"**

## 🔧 Step 2: Add Web App to Your Project

1. In the Firebase Console, click the **Web icon** `</>`
2. Enter app nickname (e.g., "Honey Jar Web App")
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. **Copy the Firebase configuration** - you'll need this later
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     databaseURL: "https://YOUR-PROJECT.firebaseio.com" // Important for Realtime Database!
   };
   ```
6. Click **"Continue to console"**

## 💾 Step 3: Enable Realtime Database

1. In the Firebase Console sidebar, click **"Realtime Database"**
2. Click **"Create Database"**
3. **Select a location** (choose closest to your users):
   - United States: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. **Choose starting mode**: Select **"Locked mode"** (we'll set up proper rules next)
5. Click **"Enable"**

Your database URL will be: `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/`

## 🔐 Step 4: Configure Security Rules

1. In Realtime Database, click the **"Rules"** tab
2. Replace the rules with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "usernames": {
      "$username": {
        ".read": true,
        ".write": "!data.exists() && auth != null && newData.child('uid').val() == auth.uid",
        ".validate": "newData.hasChildren(['email', 'uid', 'username'])",
        "email": {
          ".validate": "newData.isString()"
        },
        "uid": {
          ".validate": "newData.isString() && newData.val() == auth.uid"
        },
        "username": {
          ".validate": "newData.isString()"
        },
        "$other": {
          ".validate": false
        }
      }
    }
  }
}
```

3. Click **"Publish"**

### 🔒 What These Rules Do:

- **`users/$uid`**: Only authenticated users can read/write their own data
- **`usernames/$username`**:
  - Anyone can read (needed for login username lookup)
  - Can only be created once (`.write: !data.exists()`)
  - Can only be created by the owner (`.write: auth.uid == $uid`)
  - Cannot be updated or deleted after creation
  - Validates required fields exist

## 🔐 Step 5: Enable Firebase Authentication

1. In the Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

## 🔑 Step 6: Add Firebase Config to Your App

### Local Development (`.env` file)

Create a `.env` file in the `honey-jar/` folder:

```bash
# Anthropic API Key (for AI features)
REACT_APP_ANTHROPIC_API_KEY=your-anthropic-api-key

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

⚠️ **Important**:
- Replace all `your-*` placeholders with your actual Firebase config values
- The `.env` file is gitignored - never commit it to Git
- Make sure to include `REACT_APP_FIREBASE_DATABASE_URL` for Realtime Database

### Deployment (Vercel Environment Variables)

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each `REACT_APP_FIREBASE_*` variable from above
4. Add `REACT_APP_ANTHROPIC_API_KEY` as well
5. Click **"Save"**
6. Redeploy your app

## 📱 Step 7: Initialize Firebase with CLI (Optional)

If you want to manage your database rules via CLI:

### 1. Login to Firebase:
```bash
npx firebase-tools login
```

### 2. Initialize Realtime Database:
```bash
npx firebase-tools init database
```

When prompted:
- Select: **Use an existing project**
- Choose your Firebase project
- For "Database Rules file": press Enter (default: `database.rules.json`)

### 3. Update `firebase.json`:

Your `firebase.json` should look like:
```json
{
  "database": {
    "rules": "database.rules.json"
  }
}
```

### 4. Deploy rules via CLI:
```bash
npx firebase-tools deploy --only database
```

## ✅ Step 8: Test It!

1. **On your computer**:
   - Restart your development server (if running)
   - Open http://localhost:3000
   - Create an account with username, email, and password
   - Add a honey drop entry
   - Check Firebase Console → Realtime Database → Data tab
   - You should see your data under `users/{uid}/entries`

2. **On your phone**:
   - Go to your deployed website
   - Sign in with either your **username** or **email** and password
   - Your entry should appear! 🎉
   - Add a new entry on your phone
   - Check your computer - it should sync automatically!

## 📊 How Data is Structured

```
{
  "users": {
    "{user-uid}": {
      "entries": [ ... ],
      "displayName": "username",
      "lastUpdated": "2024-01-03T..."
    }
  },
  "usernames": {
    "johndoe": {
      "email": "john@example.com",
      "uid": "{user-uid}",
      "username": "johndoe"
    }
  }
}
```

## 🔍 Viewing Your Data

1. Go to Firebase Console → **Realtime Database**
2. Click the **"Data"** tab
3. Expand the tree to see your data structure
4. You can edit values directly in the console (useful for debugging)

## 💡 Realtime Database vs Firestore

| Feature | Realtime Database | Firestore |
|---------|-------------------|-----------|
| **Data Model** | JSON tree | Collections & documents |
| **Queries** | Limited | Rich, complex queries |
| **Pricing** | Pay for bandwidth | Pay for operations |
| **Offline Support** | Yes | Yes |
| **Real-time** | Yes | Yes |
| **Best For** | Simple structures, real-time sync | Complex queries, larger scale |

For this Honey Jar app, **Realtime Database is perfect** because:
- Simple data structure (just user entries)
- Real-time sync is the priority
- Lower cost for small user base

## 🐛 Troubleshooting

### "Permission denied" errors
- Check that Firebase Authentication is enabled
- Verify you're signed in with a valid account
- Check security rules in Firebase Console

### Data not syncing
- Ensure you're signed in with the same email/username on both devices
- Check that `REACT_APP_FIREBASE_DATABASE_URL` is set correctly
- Verify internet connection
- Check browser console for errors

### "Firebase not configured" message
- Make sure all `REACT_APP_FIREBASE_*` environment variables are set in `.env`
- Restart your development server after adding `.env` variables
- For Vercel, ensure environment variables are set and redeploy

### Rules validation errors
- Check that your data structure matches the rules
- Verify authentication is working (user is signed in)
- Test rules in Firebase Console → Realtime Database → Rules → Simulator

## 🔒 Security Best Practices

✅ **Do:**
- Keep your Firebase config in `.env` (don't commit to Git)
- Use proper authentication before allowing data access
- Validate data structure in security rules
- Test your security rules using the Firebase Console simulator

❌ **Don't:**
- Commit `.env` file to Git
- Use overly permissive rules like `.read: true, .write: true`
- Store sensitive data in Realtime Database without encryption
- Share your Firebase API keys publicly

## 📚 Additional Resources

- [Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Best Practices](https://firebase.google.com/docs/database/usage/best-practices)

---

**Need help?** Check the Firebase [documentation](https://firebase.google.com/docs) or the troubleshooting section above.
