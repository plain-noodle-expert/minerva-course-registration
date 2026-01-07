# Contributing to Minerva Course Auto-Register

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help make the project better for everyone

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser version and OS

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives considered
   - Why this would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly:
   - Load the extension in Chrome
   - Test on actual Minerva pages
   - Verify no console errors
5. Commit with clear messages: `git commit -m "Add feature X"`
6. Push to your fork: `git push origin feature-name`
7. Create a Pull Request with:
   - Description of changes
   - Why the changes are needed
   - Testing performed

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Use meaningful variable names
- Keep functions focused and small

### Testing

Before submitting:
- [ ] Extension loads without errors
- [ ] Popup displays correctly
- [ ] Course management works
- [ ] Registration logic functions (if applicable)
- [ ] No console errors
- [ ] Works on latest Chrome version

### File Organization

- `manifest.json` - Extension configuration
- `popup.*` - User interface files
- `content.js` - Minerva page interaction
- `background.js` - Background processes
- `icons/` - Icon assets

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add course validation`
- `fix: resolve notification timing`
- `docs: update installation steps`
- `style: improve popup layout`

## Questions?

Feel free to:
- Open an issue for discussion
- Comment on existing issues
- Reach out to maintainers

## Legal Note

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make this project better! 🎓
