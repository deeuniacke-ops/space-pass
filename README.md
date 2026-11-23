# SPACE Pass

A phone card that helps autistic children and young people at medical and dental appointments. A parent fills it in once. At the appointment, the child or parent shows it to the doctor, dentist or nurse.

It has three views:

- **For staff:** a card staff can read in about 10 seconds. It shows who the child is, what to do and not do (with a different list for the GP, dentist, blood tests and hospital), how the child might answer, and what to do if they get overwhelmed.
- **SPACE plan:** the full plan under Sensory, Predictability, Acceptance, Communication and Empathy.
- **Tap to say:** large buttons the child can tap to show a phrase full screen, like "I need a break" or "It hurts".

An "I'm overwhelmed. Please pause." button is always on screen.

## Privacy

SPACE Pass is a static web page. There is no server, database, account, analytics or tracking.

- Everything a parent types is stored in the browser's local storage on their own phone.
- `index.html` sets a Content Security Policy with `connect-src 'none'`. The browser then refuses any network connection from the page, so the app can't send data anywhere even if the code tried to.
- Fonts and icons are bundled. The page loads nothing from other websites.
- The offline service worker (`sw.js`) caches only the app's own files.
- Backups are JSON files the parent saves and keeps themselves.

The host (for example GitHub Pages) can see that someone visited, like any website. It never sees what anyone typed.

**Limits.** Clearing browser data deletes plans, so parents should save a backup. On iPhone, Home Screen apps have separate storage from Safari, so parents should add SPACE Pass to the Home Screen *before* making their plan.

## Running it

Serve the folder from any static host. To try it on your own computer:

```sh
python3 -m http.server 8765
```

Then open http://localhost:8765.

The service worker caches files on first load. When you change any file, bump `CACHE` in `sw.js` so phones pick up the new version.

## Credits

- The SPACE framework is by Mary Doherty, Sue McCowan and Sebastian Shaw (2023), Autistic Doctors International. SPACE Pass isn't made by or connected to them.
- Fonts: Atkinson Hyperlegible (Braille Institute) and Lexend, both under the SIL Open Font License. See `fonts/`.

SPACE Pass isn't medical advice.
