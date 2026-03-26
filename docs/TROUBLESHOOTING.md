# Troubleshooting Guide

## Common Issues and Solutions

### 1. Frontend Won't Start

#### Issue: `npm install` fails
```
Error: npm ERR! code ERESOLVE
```

**Solutions:**
```bash
# Option 1: Force resolution of dependencies
npm install --legacy-peer-deps

# Option 2: Clear cache and reinstall
npm cache clean --force
npm install

# Option 3: Use npm 7+ legacy flag
npm install --force
```

---

#### Issue: Port 5173 already in use
```
Error: Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions:**
```bash
# Option 1: Kill process on port 5173 (macOS/Linux)
lsof -ti:5173 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3000

# Option 3: Check what's using the port (Windows)
netstat -ano | findstr :5173
# Then kill the process ID
taskkill /PID <PID> /F
```

---

#### Issue: Vite build fails
```
Error: failed to resolve entry for package
```

**Solutions:**
1. Verify all imports use correct relative paths
2. Check that files actually exist
3. Ensure file names match case-sensitive: `Dashboard.jsx` not `dashboard.jsx`

---

### 2. Backend API Issues

#### Issue: Cannot connect to backend
```
Error: Failed to fetch (or CORS error)
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
```python
# Check app.py has CORS enabled
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

# Verify backend is running on correct port
# Start backend: python app.py
# Check it's running: http://localhost:5000/weather/london
```

**Windows PowerShell:**
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID <PID> /F

# Start backend
python app.py
```

---

#### Issue: 502 Bad Gateway from Backend
```
Error: 502 Bad Gateway when calling /weather/city
```

**Solutions:**
1. Verify backend is actually running: `python app.py`
2. Check Flask error logs for clues
3. Verify OpenWeatherMap API key is set in `.env`
4. Check internet connection (needs to reach OpenWeatherMap API)

---

#### Issue: OpenWeatherMap API Key Invalid
```
Error: 401 Unauthorized from OpenWeatherMap
```

**Solutions:**
1. Get your API key from https://openweathermap.org/api
2. Create `.env` file with: `OPENWEATHER_API_KEY=your_actual_key`
3. Restart backend: `python app.py`
4. Verify key in Flask app: Add print statement
   ```python
   api_key = os.getenv('OPENWEATHER_API_KEY')
   print(f"API Key loaded: {api_key[:5]}...") # First 5 chars only
   ```

---

### 3. React Application Errors

#### Issue: "Objects are not valid as a React child (found: object with keys {all})"
```
Error: Objects are not valid as a React child (found: object with keys {all})
```

**Cause:** Component trying to render object directly instead of string

**Solution:**
Always convert to string when rendering error messages:
```javascript
// ❌ WRONG
<p>{error}</p>

// ✅ CORRECT
<p>{String(error || 'An error occurred')}</p>
```

---

#### Issue: Blank page loads, nothing displays
```
Browser shows blank page, no errors in console
```

**Solutions:**
1. Open DevTools (F12) and check Console tab for errors
2. Check if `index.html` exists in root
3. Verify `main.jsx` is being imported correctly
4. Check that `App.jsx` exports default component:
   ```javascript
   export default App
   ```
5. Look for white screen of death (WSOD) - check Error Boundary
6. Try: `npm run build` to see build errors

---

#### Issue: Hot Module Replacement (HMR) not working
```
Changes not reflecting in browser during development
```

**Solutions:**
1. Save file again (sometimes takes 2 saves)
2. Hard refresh page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache
4. Restart dev server: Stop (Ctrl+C) then `npm run dev`

---

### 4. Weather Data Issues

#### Issue: Weather data shows "undefined" or "null"
```
Temperature shows: undefined
City shows: null
```

**Causes:**
- API response structure doesn't match expected format
- API call failed silently
- Data parsing error

**Solutions:**
1. Check backend response format:
   ```bash
   curl http://localhost:5000/weather/london
   ```
2. In Dashboard.jsx, add logging:
   ```javascript
   console.log('Weather response:', response)
   console.log('Weather data:', weather)
   ```
3. Verify API response has all expected fields
4. Check data types match expected (temp should be number, not string)

---

#### Issue: "Permission denied to access location"
```
Error: User denied geolocation permission
```

**Solution:**
App handles this gracefully by defaulting to London:
```javascript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    success => { /* handle */ },
    error => {
      console.log('Using fallback city: London')
      fetchWeatherData('London')
    }
  )
}
```

To fix in browser:
1. Check browser address bar for permission icon
2. Click and allow location access
3. Refresh page

---

#### Issue: Forecast data not showing
```
5-day forecast section appears empty
```

**Solutions:**
1. Verify coordinates are parsed correctly
2. Check `/forecast/{lat}/{lon}` API endpoint
3. Ensure backend is returning forecast array
4. Check browser console for errors in forecast fetch

---

### 5. Git and Deployment Issues

#### Issue: `git push` rejected
```
Error: failed to push some refs to 'origin'
```

**Solution:**
```bash
# Pull first to merge any remote changes
git pull origin master

# Then push your changes
git push origin master

# If conflicts occur, resolve them manually
```

---

#### Issue: `.env` file accidentally committed
```
Oops! API keys are now public on GitHub
```

**Emergency Solution:**
1. **Immediately revoke** API keys on OpenWeatherMap
2. Create new keys
3. Remove file from git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file"
   ```
4. Add to `.gitignore`:
   ```
   .env
   *.env
   ```

---

### 6. Performance Issues

#### Issue: App is slow or sluggish
```
Dashboard takes 5+ seconds to load data
Animations are janky/stuttering
```

**Solutions:**
1. Check Network tab in DevTools
2. Identify slow API calls
3. Implement caching (backend already does 1-hour cache)
4. Check if browser extensions are interfering
5. Clear browser cache: DevTools → Storage → Clear All

**Backend optimization:**
```python
# Add response compression in app.py
from flask_compress import Compress
Compress(app)
```

---

#### Issue: High memory usage
```
Memory usage grows over time
Application becomes unresponsive
```

**Solutions:**
1. Clear browser cache and cookies
2. Restart application
3. Check for memory leaks in components:
   - Verify `useEffect` cleanup functions
   - Check for event listener leaks
4. Use Chrome DevTools Memory profiler

---

### 7. Database Issues

#### Issue: Database file is locked or corrupted
```
Error: database is locked (SQLite)
```

**Solutions:**
```bash
# Delete the corrupted database
rm weather.db

# Restart backend - it will recreate empty database
python app.py
```

---

### 8. Configuration Issues

#### Issue: Environment variables not loading
```
API key not found
FLASK_ENV undefined
```

**Solutions:**
1. Create `.env` file in root directory (for frontend)
2. Create `backend/.env` file (for Flask)
3. Restart dev server after changing `.env`
4. Frontend: Ensure variables start with `VITE_`
5. Verify `.env` is NOT in `.gitignore` (should not be!)

---

### 9. Browser Compatibility

#### Issue: App works on Chrome but not on Firefox/Safari
```
Features not working in specific browser
Styling looks different
```

**Solutions:**
1. Test in multiple browsers
2. Check CSS vendor prefixes for animations
3. Verify API compatibility
4. Use browser-compatible polyfills if needed
5. Check console for browser-specific errors

---

## Debugging Tips

### 1. Enable Debug Logging
```javascript
// In Dashboard.jsx or any component
console.log('Current weather:', weather)
console.log('Error state:', error)
console.log('Loading:', loading)
```

### 2. Use React DevTools
1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component props and state

### 3. Check Network Requests
1. Open DevTools → Network tab
2. Make request (search city, refresh, etc.)
3. Look for failed requests (red X)
4. Click request to see response details

### 4. Backend Logging
```python
# Add to Flask app routes
@app.route('/weather/<city>')
def get_weather(city):
    print(f"Weather request for: {city}")  # Log input
    print(f"API response: {response}")     # Log response
    return jsonify(data)
```

### 5. Use Browser Console
```javascript
// Check API responses
fetch('http://localhost:5000/weather/london')
  .then(r => r.json())
  .then(data => console.log(data))

// Check environment variables (frontend)
console.log(import.meta.env.VITE_OPENWEATHER_API_KEY)
```

---

## Getting Help

### Before Reporting an Issue

1. **Reproduce the issue:**
   - Write down exact steps
   - Try it again to confirm
   - Note the error message exactly

2. **Check logs:**
   - Browser console (F12)
   - Backend terminal output
   - Network tab in DevTools

3. **Search existing issues:**
   - GitHub Issues
   - Stack Overflow
   - Project wiki/docs

4. **Gather information:**
   - Window/OS version
   - Browser version
   - Node version (`node --version`)
   - Python version (`python --version`)

### Reporting Format

```
**Issue Title:** Clear, specific title

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: v18.0.0
- Python: 3.11

**Steps to Reproduce:**
1. Start the app
2. Search for "London"
3. See blank forecast

**Expected Behavior:**
Forecast should display 5 days

**Actual Behavior:**
Forecast is completely empty

**Error Message:**
(Paste exact error from console)

**Screenshots:**
(Helpful screenshots or screen recording)
```

---

## Prevention

### Keep the App Healthy

1. **Update dependencies regularly:**
   ```bash
   npm outdated        # See what's outdated
   npm update          # Update patch/minor versions
   npm audit fix       # Fix security issues
   ```

2. **Run linter regularly:**
   ```bash
   npm run lint        # Check code quality
   ```

3. **Test before pushing:**
   ```bash
   npm run build       # Test production build
   npm run preview     # Preview production build
   ```

4. **Commit frequently:**
   ```bash
   git status          # Check changes
   git add .           # Stage files
   git commit -m "descriptive message"
   git push            # Push to GitHub
   ```

---

## Performance Checklist

- [ ] API keys properly configured
- [ ] CORS properly set up
- [ ] Database not corrupted
- [ ] Node modules installed
- [ ] `.env` properly filled
- [ ] No console errors
- [ ] API responses valid
- [ ] Component renders correctly
- [ ] No memory leaks
- [ ] Animations smooth

---

## Still Stuck?

1. Check [GitHub Issues](https://github.com/yourusername/weather-app/issues)
2. Ask in project discussions
3. Check the [Architecture](./ARCHITECTURE.md) for design details
4. Review [API Documentation](./API_DOCUMENTATION.md) for endpoints
5. Check [Installation Guide](./INSTALLATION.md) for setup steps
