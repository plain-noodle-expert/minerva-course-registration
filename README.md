# Minerva Course Auto-Register

A Chrome extension to automatically register for courses at McGill University's Minerva student system.

## ⚠️ Important Disclaimer

This extension is provided for educational purposes only. Use at your own risk. The author is not responsible for:
- Any issues with your course registration
- Violations of McGill's policies regarding automated systems
- Any academic or administrative consequences

**Always verify your registration manually after using this tool.**

## Features

- 📝 **Course Management**: Add multiple courses using course codes (e.g., COMP-251-001) or 4-digit CRNs
- 🔄 **Auto-Refresh**: Automatically checks for available spots every 5 minutes
- 🔔 **Notifications**: Get notified when courses are successfully registered
- 📊 **Status Tracking**: Monitor the status of each course (Pending, Registered, Full, Failed)
- 🎨 **Clean UI**: User-friendly popup interface with McGill branding

## Installation

### Step 1: Download the Extension

Clone or download this repository:
```bash
git clone https://github.com/yourusername/minerva-course-registration.git
# or download and extract the ZIP file
```

### Step 2: Generate Icons

The extension needs icon files. Choose one method:

**Method A: Use the HTML Generator (Easiest)**
1. Open `icon-generator.html` in your browser
2. Click "Yes" when prompted to auto-download
3. Save the 3 PNG files to the `icons/` folder

**Method B: Use Python**
```bash
python3 -m venv venv
source venv/bin/activate
pip install Pillow
python3 generate_icons.py
```

**Method C: Use ImageMagick**
```bash
brew install imagemagick
./generate-icons.sh
```

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `minerva-course-registration` folder
5. The extension icon should appear in your Chrome toolbar

## Usage

### 1. Add Courses

1. Click the extension icon in Chrome toolbar
2. Enter course codes `DEPT-NNN-NNN` *or* 4-digit CRNs
   - Example code: `COMP-251-001`
   - Example CRN: `1234`
3. Click **Add** button
4. Repeat for all desired courses

### 2. Configure Settings

- **Enable auto-refresh**: Checks every 5 minutes for available spots
- **Enable notifications**: Get browser notifications for successful registrations

### 3. Start Registration

1. **Important**: Open Minerva and log in first
   - Go to https://horizon.mcgill.ca/pban1/twbkwbis.P_GenMenu?name=bmenu.P_MainMnu
   - Log in with your credentials
   - Navigate to **Student Menu** → **Registration** → **Add/Drop Courses**

2. Click **Start Auto-Registration** in the extension popup

3. The extension will:
   - Monitor the courses you added
   - Attempt to register when spots become available
   - Update status in real-time
   - Send notifications for successful registrations

4. Click **Stop** when done or when all courses are registered

## File Structure

```
minerva-course-registration/
├── manifest.json           # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── popup.js               # Popup logic
├── content.js             # Minerva page interaction script
├── background.js          # Background service worker
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── icon-generator.html    # HTML-based icon generator
├── generate_icons.py      # Python icon generator
├── generate-icons.sh      # Shell script icon generator
└── README.md             # This file
```

## How It Works

1. **Content Script** (`content.js`): Runs on Minerva pages, interacts with the registration form
2. **Background Worker** (`background.js`): Manages timing, notifications, and coordination
3. **Popup Interface** (`popup.html/js/css`): User interface for managing courses and settings

## Troubleshooting

### Extension doesn't work
- Make sure you're logged into Minerva
- Navigate to the Add/Drop Courses page before starting
- Check the browser console for errors (F12 → Console)

### Course not registering
- Verify the course code format is correct (DEPT-NNN-NNN)
- Check if you meet prerequisites
- Ensure no time conflicts with other courses
- Verify you haven't exceeded maximum credit hours

### No notifications
- Enable notifications in extension settings
- Check browser notification permissions
- Allow notifications for Chrome in System Preferences (macOS)

### Icons not showing
- Follow the icon generation steps in Installation
- Make sure all 3 icon files exist in `icons/` folder
- Reload the extension after adding icons

## Development

### Testing Locally

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test functionality on Minerva

### Debugging

- **Content Script**: Open Minerva page → F12 → Console
- **Background Script**: Go to `chrome://extensions/` → Click "Inspect views: background page"
- **Popup**: Right-click extension icon → Inspect popup

## Security & Privacy

- All data stored locally in your browser (Chrome storage API)
- No external servers or data collection
- No tracking or analytics
- Code is open source and auditable

## Legal & Ethics

This extension automates interaction with McGill's Minerva system. Consider the following:

1. **McGill's Policies**: Check if automated registration tools are permitted
2. **Fair Use**: Don't use this to gain unfair advantage over other students
3. **Server Load**: The auto-refresh feature may increase server requests
4. **Responsibility**: You are responsible for your registration and course selection

**Use responsibly and ethically.**

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review McGill's Minerva documentation

## Changelog

### Version 1.0.0 (January 2026)
- Initial release
- Course management interface
- Auto-registration functionality
- Status tracking and notifications
- McGill branding and styling

---

**Made with ❤️ for McGill students**

*Not affiliated with or endorsed by McGill University*
