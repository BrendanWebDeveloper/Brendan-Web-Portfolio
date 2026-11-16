# Brendan — Web Portfolio (with a Café)

A normal portfolio site with a second mode. Click **Step into the Café** and you're standing
outside a little café at night:

1. **Outside**: click the door. It swings open and you walk in.
2. **Inside**: there's a bookshelf and a table with chairs.
3. **The bookshelf**: each project is a book. Click one and it comes off the shelf, flies to
   the middle of the screen and opens. The inside cover has a marbled endpaper. The page has
   the description, a figure for a screenshot or video, the tech list and links.
4. **The table**: a coffee cup and a handheld console are lying on the table. Pick up the
   handheld and it boots up with the **Java game**: a title screen, then a menu with
   *Play game*, *Trailer*, *About* and *Source code*.
   - Use the D-pad, A/B, Start and Select buttons on screen.
   - Or use the keyboard: arrows, Enter = A, Backspace = B, Esc = put it down.

The browser back button works between scenes. You can also link straight to a scene:
`#cafe`, `#cafe/inside`, `#cafe/shelf` or `#cafe/table`.

## Run it

There's no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Add or edit a project

Everything is in **`projects.js`**. Each entry appears in the normal grid and in the café:

| Field | What it does |
| --- | --- |
| `place` | `"shelf"` (a book) or `"handheld"` (the console on the table; only the first one is used) |
| `title`, `tagline`, `description` | Text on the book cover / handheld title screen and the detail page |
| `year`, `genre`, `status` | Small labels. Any `status` except `"Live"` shows as a sticky label on the book's spine |
| `tech` | Technologies. These also appear on the café's chalkboard menu |
| `cover.from` / `cover.to` / `cover.accent` | Book colors (accent = gold lettering) |
| `cover.image` | Optional real cover art image |
| `links.demo` | "Live demo" button / "Play game" on the handheld (opens in a new tab) |
| `links.video` | YouTube **embed** URL or `.mp4`, shown in the book or as the handheld's trailer |
| `links.repo` | "Source code" link |

## Deploy on GitHub Pages

In the repo, go to Settings → Pages → Deploy from branch → `main` / root.

## Files

- `index.html`: page structure (normal site, the café scenes, the book overlay)
- `styles.css`: all styling. The café is drawn with CSS and small inline SVGs, with no image files
- `app.js`: scene navigation, bookshelf, book animation, handheld console
- `projects.js`: your content
