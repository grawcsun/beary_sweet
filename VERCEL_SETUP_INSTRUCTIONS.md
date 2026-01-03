# Fix Cross-Device Data Sync on Vercel

## Problem
Data doesn't sync between devices/tabs on deployed website because Firebase Realtime Database URL is missing.

## Solution

### 1. Add Environment Variable to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **beary-sweet** project
3. Go to **Settings** → **Environment Variables**
4. Add this new variable:

   **Variable Name:** `REACT_APP_FIREBASE_DATABASE_URL`

   **Value:** `https://beary-sweet-default-rtdb.firebaseio.com`

   **Environments:** Check all three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### 2. Enable Firebase Realtime Database

1. Go to https://console.firebase.google.com/
2. Select your **beary-sweet** project
3. In the left sidebar, click **Realtime Database**
4. Click **Create Database**
5. Choose a location:
   - For USA: `United States (us-central1)`
   - For other regions: Choose closest to you
6. Security rules: Select **Start in locked mode**
7. Click **Enable**

### 3. Set Up Security Rules

1. Still in **Realtime Database**, click the **Rules** tab
2. Copy these rules:

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

3. Click **Publish**

### 4. Redeploy Your App

After adding the environment variable, you need to trigger a redeploy:

**Option A: In Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (...) next to the latest deployment
3. Click **Redeploy**
4. Confirm the redeploy

**Option B: Push a small change to trigger auto-deploy**
1. Make any small change to your code
2. Commit and push to GitHub
3. Vercel will automatically redeploy

### 5. Test It!

1. On your computer:
   - Go to your deployed website
   - Create an account and add a honey drop

2. On your phone (or another browser):
   - Go to the same deployed website
   - Sign in with the same username/email and password
   - **You should see the honey drop!** 🎉

## Verification Checklist

After setup, verify these:

- [ ] Environment variable `REACT_APP_FIREBASE_DATABASE_URL` is set in Vercel
- [ ] Realtime Database is created in Firebase Console
- [ ] Security rules are published
- [ ] App has been redeployed
- [ ] Can create account and add entries
- [ ] Same account on different device/tab shows same data

## Security Notes

✅ **Safe to expose in Vercel:**
- All `REACT_APP_FIREBASE_*` variables (they're public by design)
- Firebase config is embedded in frontend JavaScript anyway
- Security comes from Firebase Security Rules, not hiding config

⚠️ **Keep private:**
- `REACT_APP_ANTHROPIC_API_KEY` (already correctly set in Vercel only)
- Never commit `.env` file to git (already in `.gitignore`)

## Troubleshooting

### "Permission denied" errors
- Make sure Firebase Authentication is enabled
- Check that security rules are published
- Verify you're signed in

### Data still not syncing
- Check browser console for errors
- Verify `REACT_APP_FIREBASE_DATABASE_URL` is in Vercel
- Make sure you redeployed after adding the variable
- Clear browser cache and try again

### "Firebase not configured" error
- Add `REACT_APP_FIREBASE_DATABASE_URL` to Vercel
- Redeploy the app
- Wait for deployment to complete

---

**Questions?** Check the [FIREBASE_REALTIME_SETUP.md](honey-jar/FIREBASE_REALTIME_SETUP.md) for more details.
