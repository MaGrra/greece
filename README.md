# Greece 2026 trip guide

A phone-first guide for the family trip to Athens and the Peloponnese (Oct 13–20, 2026).
Plain static site (no build step), hosted on GitHub Pages, with shared data in a Google Sheet.

**Tabs:** Today · Days · Map · Food · More (Latvian stories, car quiz, expenses, Greek cheat sheet, trip info, settings).

## 1. Publish on GitHub Pages

Pages is set to **Deploy from a branch → main / root**, so every push to `main` updates `https://magrra.github.io/greece/` within a minute or two. `.nojekyll` tells GitHub to serve the files as they are.

## 2. Connect the Google Sheet (shared notes, day order, expenses)

1. Open the sheet → **Extensions → Apps Script**.
2. Replace the editor contents with `backend/Code.gs` → **Save**.
3. Pick the `setup` function in the toolbar → **Run** → allow the permissions. Google warns that the app is unverified: **Advanced → Go to project**. It's your own script.
4. **Deploy → New deployment** → gear icon → **Web app**. Set *Execute as: Me* and *Who has access: Anyone* → **Deploy**.
5. Copy the web app URL (ends in `/exec`) into `backendUrl` in `data/config.js`, then commit and push.

The script creates the `settings`, `notes` and `expenses` tabs itself. You can edit them in the sheet directly.
After changing the script later, use **Deploy → Manage deployments → Edit → Version: New version**, so the URL stays the same.

Without a backend URL, everything still works but stays on each phone.

## 3. Editing content

| What | File |
|---|---|
| Day plans, stops, times, swaps | `data/plans.js` |
| Places: facts, links, coordinates, Latvian narration | `data/places.js` |
| Dishes, menu words | `data/food.js` |
| Restaurants | `data/restaurants.js` |
| Latvian story episodes | `data/stories.js` |
| Quiz | `data/quiz.js` |
| Phrases, signs, alphabet | `data/cheats.js` |
| Heads-up, checklist, tickets, addresses | `data/info.js` |

Map pins come live from the shared Google My Maps through the backend. `data/mymap.js` is the offline fallback; refresh it with `python3 tools/kml_to_pins.py`.

## 4. Audio

Narration is generated with Microsoft's neural voices (Latvian: Everita, Greek: Athina):

```sh
pip install edge-tts      # also needs ffmpeg
npm run audio             # only regenerates clips whose text changed
```

## Local preview

```sh
npm run serve   # http://localhost:8080
```
