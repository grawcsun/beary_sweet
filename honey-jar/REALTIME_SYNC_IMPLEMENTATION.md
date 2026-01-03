# Real-Time Firebase Sync Implementation

## Overview
The app now uses Firebase Realtime Database's `onValue` listener to automatically sync data across all tabs, devices, and browser sessions.

## How It Works

### 1. Real-Time Listener (`subscribeToEntries`)
Located in `src/services/database.js`:

```javascript
export const subscribeToEntries = (uid, callback) => {
  const userRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(data.entries || []);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
}
```

**What it does:**
- Sets up a persistent listener on `users/{uid}` path
- Automatically triggers callback whenever data changes in Firebase
- Returns an unsubscribe function for cleanup

### 2. App Integration
In `src/App.js`, the listener is set up when user logs in:

```javascript
useEffect(() => {
  if (currentUser) {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToEntries(currentUser.uid, (entries) => {
      isSyncing.current = true;  // Prevent save loop
      setEntries(entries);
    });

    // Cleanup on logout or unmount
    return () => unsubscribe();
  }
}, [currentUser]);
```

### 3. Preventing Infinite Loops
Uses `isSyncing` ref to prevent save-update loops:

```javascript
// When Firebase sends update:
isSyncing.current = true;
setEntries(entries);  // This triggers save effect

// In save effect:
if (isSyncing.current) {
  isSyncing.current = false;
  return;  // Skip save, this came from Firebase
}
```

## Benefits

✅ **Instant sync across tabs**: Open the app in multiple tabs, changes sync immediately
✅ **Automatic refresh recovery**: Reload the page, data is automatically loaded
✅ **Cross-device sync**: Login on different devices, see the same data
✅ **Real-time updates**: Add entry in one tab, see it appear in other tabs instantly
✅ **No manual refresh needed**: Firebase pushes updates automatically

## Data Flow

```
User adds entry → setEntries() → Save effect triggers → Firebase updated
                                                              ↓
                                              onValue listener fires
                                                              ↓
                                              All subscribed clients receive update
                                                              ↓
                                              UI updates automatically
```

## Security

- Data is stored at `users/{uid}` using Firebase Authentication UID
- Security rules (in `database.rules.json`) ensure:
  - Users can only read their own data: `auth.uid == $uid`
  - Users can only write their own data: `auth.uid == $uid`
- Each user's data is completely isolated

## Testing

1. **Single tab reload**: Refresh the page → data should persist
2. **Multiple tabs**: Open app in two tabs → add entry in one → should appear in both
3. **Cross-device**: Login on phone and computer → changes sync between them
4. **Network interruption**: Disconnect internet → reconnect → data syncs automatically
