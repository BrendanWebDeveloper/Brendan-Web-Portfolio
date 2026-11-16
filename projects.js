/*
 * ─────────────────────────────────────────────────────────────
 *  YOUR PROJECTS
 *  Every entry shows up in the normal portfolio grid AND in the café.
 *
 *  place         "shelf"    → a book on the café bookshelf (default)
 *                "handheld" → the handheld console on the café table
 *                             (only the first "handheld" project is used;
 *                              any others go on the shelf)
 *  cover.from/to/accent  book colors (from = cover, accent = gold lettering)
 *  cover.image   optional real cover art (e.g. "covers/angular.jpg")
 *  links.demo    URL people can open to try it (opens in a new tab)
 *  links.video   YouTube *embed* URL ("https://www.youtube.com/embed/ID")
 *                or a path to an .mp4 — shown in the book / on the handheld
 *  links.repo    source code
 * ─────────────────────────────────────────────────────────────
 */
window.PROJECTS = [
  {
    id: "java-game",
    place: "handheld",
    title: "Java Game",
    tagline: "One developer. One JVM. No mercy.",
    year: 2026,
    genre: "Action · Arcade",
    status: "In development",
    tech: ["Java", "Swing / AWT", "Game loop", "Sprites"],
    description:
      "A 2D game built from scratch in Java. Replace this text with what the game is, how you play it, and what you learned building it (game loop, collision, rendering, input handling…).",
    cover: { from: "#7a1f3d", to: "#2b0f24", accent: "#e8c56a", image: null },
    links: { demo: null, video: null, repo: null },
  },
  {
    id: "angular-site",
    place: "shelf",
    title: "Angular Website",
    tagline: "Components, services, and a lot of TypeScript.",
    year: 2026,
    genre: "Web App",
    status: "Coming soon",
    tech: ["Angular", "TypeScript", "RxJS", "SCSS"],
    description:
      "A website built with Angular. Add a description, a link to the live site, and a short screen recording when it's ready.",
    cover: { from: "#1f4e79", to: "#0d2440", accent: "#e8c56a", image: null },
    links: { demo: null, video: null, repo: null },
  },
  {
    id: "cafe-portfolio",
    place: "shelf",
    title: "The Café",
    tagline: "A portfolio you can walk into.",
    year: 2026,
    genre: "Interactive",
    status: "Live",
    tech: ["HTML", "CSS 3D transforms", "Vanilla JS"],
    description:
      "This site. A normal portfolio that turns into a café: walk in through the door, browse the bookshelf where every book is a project, or sit down and pick up the handheld on the table.",
    cover: { from: "#2f5d3a", to: "#132a1a", accent: "#f0d58a", image: null },
    links: { demo: null, video: null, repo: "https://github.com/BrendanWebDeveloper/Brendan-Web-Portfolio" },
  },
];
