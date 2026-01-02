# Honey Jar - Deployment Guide

A gratitude journaling app with AI-powered daily insights, featuring animated honey jars, mood tracking, and personalized recommendations.

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended - Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your repository
   - **Important: Add Environment Variable**
     - Name: `REACT_APP_ANTHROPIC_API_KEY`
     - Value: Your Anthropic API key
   - Click "Deploy"

3. **Done!** Your app will be live at `your-project.vercel.app`

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - **Build settings** (should auto-detect):
     - Build command: `npm run build`
     - Publish directory: `build`
   - **Add Environment Variable**:
     - Key: `REACT_APP_ANTHROPIC_API_KEY`
     - Value: Your Anthropic API key
   - Click "Deploy site"

3. **Done!** Your app will be live at `your-site.netlify.app`

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   "homepage": "https://yourusername.github.io/beary_sweet",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**
   - Go to your repository → Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

**Note**: GitHub Pages doesn't support environment variables, so the AI feature won't work. Use Vercel or Netlify for full functionality.

## 🔑 API Key Setup

The AI analysis feature requires an Anthropic API key:

1. Get your API key from [console.anthropic.com](https://console.anthropic.com/)
2. Add it as an environment variable in your deployment platform (see options above)
3. **Never commit your `.env` file to GitHub!** (It's already in `.gitignore`)

## 📦 What Gets Deployed

- ✅ All journal entries (stored in browser localStorage)
- ✅ User authentication (browser-based)
- ✅ AI analysis (if API key configured)
- ✅ Photos and audio recordings
- ✅ Animated honey jars and bears
- ✅ Calendar and today views

## ⚠️ Important Notes

### Data Storage
- **Your data is stored in the browser's localStorage**
- Data is device-specific and browser-specific
- Clearing browser data will delete all entries
- No cloud backup or multi-device sync (yet!)

### For Production Use
Consider adding:
- Backend database (Firebase, Supabase, MongoDB)
- User authentication service
- Cloud storage for photos/audio
- Data backup and export features

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Test production build locally
npx serve -s build
```

## 🌐 Custom Domain

### Vercel
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

## 📝 Environment Variables

Required for AI features:
```
REACT_APP_ANTHROPIC_API_KEY=your-api-key-here
```

## 🐛 Troubleshooting

### AI Analysis not working
- Check that `REACT_APP_ANTHROPIC_API_KEY` is set in deployment platform
- Verify API key is valid at console.anthropic.com
- Check browser console for error messages

### Build fails
- Ensure Node version is 18 or higher
- Run `npm install` to update dependencies
- Check build logs for specific errors

### Blank page after deployment
- Check that build directory is set to `build`
- Verify redirects are configured (handled by config files)
- Check browser console for errors

## 📱 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## 💾 Data Migration

To move data between browsers/devices:
1. Open browser console (F12)
2. Export data:
   ```javascript
   localStorage.getItem('honeyJarEntries_yourusername')
   ```
3. Copy the output
4. On new browser, set data:
   ```javascript
   localStorage.setItem('honeyJarEntries_yourusername', 'paste-data-here')
   ```

---

Made with 🍯 and ❤️
