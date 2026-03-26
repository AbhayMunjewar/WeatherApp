# Contributing to Weather App

Thank you for your interest in contributing! We welcome contributions from everyone, whether it's reporting bugs, suggesting features, or submitting code.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Pull Request Process](#pull-request-process)
6. [Reporting Issues](#reporting-issues)
7. [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge
We are committed to making this project a welcoming environment for everyone. We expect all contributors to:
- Be respectful and inclusive
- Provide constructive feedback
- Accept criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment, discrimination, or abuse
- Trolling or intentional disruption
- Publishing others' private information
- Any other conduct unethical or unprofessional

**Violations** should be reported to project maintainers.

---

## How to Contribute

### 1. Report Bugs
Found a bug? Please report it on [GitHub Issues](https://github.com/AbhayMunjewar/WeatherApp/issues).

**Report Format:**
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or error logs
- Your environment (OS, browser, Node version)

**Example:**
```
Title: Search doesn't work for city names with spaces

Steps:
1. Click search box
2. Type "New York"
3. Press Enter

Expected: Display weather for New York
Actual: No results or error

Browser: Chrome 120.0
OS: Windows 11
Node: 18.17.0
```

### 2. Suggest Features
Have an idea? Open a [Discussion](https://github.com/AbhayMunjewar/WeatherApp/discussions) or [Issue](https://github.com/AbhayMunjewar/WeatherApp/issues) with label `enhancement`.

**Feature Request Format:**
- Clear title describing the feature
- Detailed description of functionality
- Why it would be useful
- Possible implementation approach
- List of alternative approaches

### 3. Submit Code Changes
- Fork the repository
- Create a new branch
- Make changes with good commit messages
- Submit a pull request
- Follow code review feedback

---

## Development Setup

### Clone & Install
```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR-USERNAME/WeatherApp.git
cd WeatherApp/weather-app

# Install dependencies
npm install
cd backend
pip install -r requirements.txt
```

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Start Development
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Make Changes
- Edit files
- Test thoroughly in browser
- Check console for errors
- Test on mobile if possible

### Commit Changes
```bash
git add .
git commit -m "Clear message describing changes"
git push origin feature/your-feature-name
```

---

## Coding Standards

### JavaScript/React
- Use modern ES6+ syntax
- Follow React best practices
- Use functional components with hooks
- Add PropTypes or JSDoc comments
- Keep components focused and reusable
- Use meaningful variable names

**Example:**
```javascript
// ✅ Good
const WeatherCard = ({ city, temperature, condition }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      <h2>{city}</h2>
      <p>{temperature}°C - {condition}</p>
    </div>
  );
};

// ❌ Avoid
const wc = ({ c, t, cond }) => {
  const [exp, setExp] = useState(false);
  return <div onClick={() => setExp(!exp)}><h2>{c}</h2></div>;
};
```

### Python/Flask
- Follow PEP 8 style guide
- Use descriptive function/variable names
- Add docstrings to functions
- Handle errors gracefully
- Use type hints where possible

**Example:**
```python
# ✅ Good
def get_weather_by_city(city_name: str) -> dict:
    """
    Fetch weather data for a specific city.
    
    Args:
        city_name: Name of the city
        
    Returns:
        Dictionary with weather data or error
    """
    try:
        response = requests.get(f"https://api.openweathermap.org/...")
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching weather: {e}")
        return {"error": str(e)}

# ❌ Avoid
def gw(cn):
    r = requests.get(f"https://api.openweathermap.org/...")
    return r.json()
```

### CSS/Styling
- Use consistent spacing and formatting
- Use meaningful class names
- Avoid inline styles where possible
- Ensure responsive design
- Use CSS variables for colors

### Commit Messages
- Start with action verb (Add, Fix, Update, Remove)
- Be descriptive but concise
- Reference issues if applicable
- Use present tense

**Examples:**
```
✅ Add weather alert notifications to dashboard
✅ Fix search debounce not resetting on clear
✅ Update API error messages for clarity
✅ Remove unused DebugComponent from production
❌ fixed stuff
❌ asdf
❌ updated
```

---

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No console errors or warnings
- [ ] Changes are documented
- [ ] Commit messages are clear

### Submitting PR
1. Push to your fork
2. Open PR on GitHub
3. Fill in PR template completely
4. Link related issues
5. Request review from maintainers

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (breaking changes)
- [ ] New feature (breaking changes)
- [ ] Documentation update

## How to Test
Steps to verify:
1. 
2.
3.

## Screenshots (if applicable)
Add screenshots or GIFs

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for clarity
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process
- Team will review within 48 hours
- May request changes
- Be responsive to feedback
- Update PR if needed
- PR will be merged once approved

---

## Reporting Issues

### Bug Reports
- [Open Issue](https://github.com/AbhayMunjewar/WeatherApp/issues/new?labels=bug)
- Include clear reproduction steps
- Provide environment details
- Attach logs or screenshots
- Don't forget API key (✅ remove from examples)

### Security Issues
- **Do not** file public issues
- Email maintainer privately
- Include vulnerability details
- Allow time for fix before disclosure

---

## Feature Requests

### Process
1. Search existing issues/discussions
2. Open GitHub Discussion
3. Describe use case and value
4. Get community feedback
5. If approved, submit implementation PR

---

## Development Workflow

```
Branch: main (stable code)
    ↓
Create: feature/your-feature
    ↓
Make changes & test locally
    ↓
Commit with good messages
    ↓
Push: feature/your-feature
    ↓
Create Pull Request
    ↓
Code Review & Feedback
    ↓
Make requested changes
    ↓
PR Approved & Merged to main
```

---

## Common Issues

### Tests Failing
```bash
# Run tests locally
npm run test

# Debug tests
npm run test -- --debug
```

### Linting Errors
```bash
# Check linter
npm run lint

# Fix automatically
npm run lint -- --fix
```

### Merge Conflicts
```bash
# Update your branch
git fetch origin
git rebase origin/main

# Resolve conflicts in editor
# Then continue
git rebase --continue
git push --force-with-lease
```

---

## Resources

- 📖 [React Documentation](https://react.dev/)
- 🐍 [Python/Flask Docs](https://flask.palletsprojects.com/)
- 📚 [Git Guide](https://guides.github.com/)
- ✨ [GitHub Discussions](https://github.com/AbhayMunjewar/WeatherApp/discussions)

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

## Questions?

- 💬 [GitHub Discussions](https://github.com/AbhayMunjewar/WeatherApp/discussions)
- 🐛 [Open an Issue](https://github.com/AbhayMunjewar/WeatherApp/issues)
- 📧 Contact maintainer

---

**Thank you for contributing!** 🙏
