# Minerva Course Auto-Register

Smart Chrome helper that watches McGill’s Minerva registration portal and keeps trying to enroll you in the courses you care about.

---

## Safety First

- Educational use only; you assume all risk.
- McGill may restrict automated traffic—verify their policies first.
- Always confirm results directly in Minerva after the tool runs.

---

## Highlights

- **Mixed identifiers** – add either a `DEPT-NNN-NNN` code (e.g., `COMP-251-001`) or a 4-digit CRN.
- **Hands-free retries** – background worker re-attempts registration every 5 minutes when auto-refresh is enabled.
- **Status-aware UI** – popup tracks each course as Pending, Registered, Full, or Failed.
- **Desktop notifications** – celebrate wins or react to problems instantly.
- **Local-only storage** – no external services, analytics, or tracking.

---

## Requirements

- Chrome 115+ (or any Chromium browser with Manifest V3 support).
- Access to McGill’s Minerva Add/Drop page.
- Three PNG icons in `icons/` (`icon16.png`, `icon48.png`, `icon128.png`). Use the bundled generators if you don’t already have artwork.

---

## Installation

1. **Get the source**
   ```bash
   git clone https://github.com/yourusername/minerva-course-registration.git
   cd minerva-course-registration
   ```

2. **Create icons** (pick one)
   - Run `python3 generate_icons.py` (requires Pillow), or
   - Run `./generate-icons.sh` (requires ImageMagick), or
   - Open `icon-generator.html` in a browser and save the canvases into `icons/`.

3. **Load the extension**
   - Visit `chrome://extensions/`, toggle **Developer mode**, click **Load unpacked**, and choose this folder.
   - Pin the extension button so the popup is easy to reach.

---

## Using the Extension

1. **Prepare Minerva**
   - Log in at `https://horizon.mcgill.ca/`.
   - Navigate to Student Menu → Registration → Add/Drop Classes for the correct term.

2. **Add courses**
   - Open the popup, type a course code or 4-digit CRN, and press **Add**.
   - Repeat for all desired courses; duplicates are ignored automatically.

3. **Configure preferences**
   - Enable auto-refresh if you want the background worker to retry every 5 minutes.
   - Leave notifications on to receive browser alerts for successes or errors.

4. **Start/Stop automation**
   - Click **Start Auto-Registration** once the Add/Drop page is loaded.
   - The background worker will loop through pending courses, submit CRNs, and update statuses.
   - Use **Stop** to pause the process or **Clear All** to reset your list.

---

## How It Works

| Component | Role |
| --- | --- |
| `popup.html/css/js` | Manages user input, settings, and live course status display. |
| `background.js` | Handles scheduling, retries, Chrome notifications, and storage updates. |
| `content.js` | Executes inside Minerva pages, injects CRNs, submits the Add/Drop form, and parses the results. |
| `manifest.json` | Declares permissions (tabs, storage, notifications) and wires the extension together. |

Communication flows from the popup → background → content script via `chrome.runtime` messaging, ensuring the UI stays responsive while automation runs in the background.

---

## Troubleshooting Cheatsheet

- **Popup says “Open Minerva first”** – make sure the active tab is a `mcgill.ca` page, ideally the Add/Drop screen.
- **Course stuck on “Pending”** – confirm the CRN is valid, the term is correct, and there are no holds or time conflicts.
- **Notifications missing** – verify Chrome’s notification permissions and the popup setting.
- **Icons missing / manifest error** – ensure `icons/icon16.png`, `icon48.png`, and `icon128.png` exist and reload via `chrome://extensions/`.
- **Content script errors** – open DevTools on the Minerva tab (Cmd/Ctrl+Shift+I) and inspect the console for detailed logs.

---

## Development Notes

1. Edit files as needed, then reload the extension from `chrome://extensions/`.
2. To debug:
   - Popup: right-click the action button → Inspect.
   - Background: click “Service Worker” under the extension entry.
   - Content script: use DevTools on the Minerva tab.
3. Scripts included:
   - `generate_icons.py`, `generate-icons.sh`, and `icon-generator.html` for icon creation.
   - `create-icons.js` / `package.sh` for contributor tooling (optional).

Pull requests are welcome—please describe the feature/fix, add screenshots when relevant, and note any manual testing performed.

---

## Security, Privacy, and Ethics

- All data (courses, settings, run state) lives in Chrome’s local storage on your machine.
- No network calls are made beyond the normal Minerva traffic already triggered by the browser.
- Use the tool responsibly: do not overwhelm university systems, respect registration policies, and verify your schedule after automation finishes.
- The project is not affiliated with McGill University.

---

## License & Support

- Licensed under the MIT License (see `LICENSE`).
- For help: open an issue in the repository with reproduction steps and console logs.
- Contributors: see `CONTRIBUTING.md` for guidelines.

---

Made with care for fellow McGill students—double-check everything before the add/drop clock runs out! 🎓
