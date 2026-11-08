# Brendan — Web Portfolio (with a Video Club)

A normal portfolio site that has a second mode. Click **Enter the Video Club** and the page
turns into a retro video store. Each project is a case on the shelf: click it and it comes
off the shelf, flies to the middle of the screen and opens. Inside you'll find the details,
a little TV for a trailer, and links to play the project or see its source.

A toggle at the top switches between two aisles:

- **📼 Movies**: VHS clamshells, with a tape inside
- **🎮 Games**: game cases, with a disc and instruction booklet inside

## Run it

There's no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

Linking to `yoursite/#club` opens the site straight into the store.

## Add or edit a project

Everything is in **`projects.js`**. Each entry feeds both the normal grid and the shelf:

| Field | What it does |
| --- | --- |
| `title`, `tagline`, `description` | Text on the cover and in the detail panel |
| `year`, `genre`, `rating`, `status` | Small labels. Any `status` except `"Live"` shows as a sticker on the shelf |
| `tech` | List of technologies, shown as chips |
| `cover.from` / `cover.to` / `cover.accent` | Colors for the generated cover art |
| `cover.image` | Optional real cover image (e.g. `"covers/java-game.jpg"`). Replaces the generated art |
| `links.demo` | "▶ Play / Watch" button (opens in a new tab) |
| `links.video` | Plays on the TV in the case. Use a YouTube **embed** URL or an `.mp4` path |
| `links.repo` | "Source code" button |

## Deploy on GitHub Pages

In the repo, go to Settings → Pages → Deploy from branch → `main` / root.

## Files

- `index.html`: page structure (normal site, store, case overlay)
- `styles.css`: all styling, including the 3D case and the generated cover art
- `app.js`: rendering, switching between modes, and the open/close animation
- `projects.js`: your content
