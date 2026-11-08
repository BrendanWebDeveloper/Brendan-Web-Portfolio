/*
 * ─────────────────────────────────────────────────────────────
 *  YOUR PROJECTS
 *  Every entry shows up in BOTH the normal portfolio grid and
 *  on the Video Club shelf. To add a project, copy a block.
 *
 *  cover.image   optional path to real cover art (e.g. "covers/java-game.jpg").
 *                If left null, a cover is generated from the colors below.
 *  links.demo    URL people can open to try it (opens in a new tab)
 *  links.video   a YouTube *embed* URL ("https://www.youtube.com/embed/ID")
 *                or a path to an .mp4. It plays on the little TV inside the case.
 *  links.repo    source code
 * ─────────────────────────────────────────────────────────────
 */
window.PROJECTS = [
  {
    id: "java-game",
    title: "Java Game",
    tagline: "One developer. One JVM. No mercy.",
    year: 2026,
    genre: "Action · Arcade",
    rating: "E",
    runtime: "Playable",
    status: "In development",
    tech: ["Java", "Swing / AWT", "Game loop", "Sprites"],
    description:
      "A 2D game built from scratch in Java. Replace this text with what the game is, how you play it, and what you learned building it (game loop, collision, rendering, input handling…).",
    cover: { from: "#ff3d6e", to: "#2b0f54", accent: "#ffd23f", image: null },
    links: { demo: null, video: null, repo: null },
  },
  {
    id: "angular-site",
    title: "Angular Website",
    tagline: "Components. Services. Total control.",
    year: 2026,
    genre: "Web App · Thriller",
    rating: "PG",
    runtime: "SPA",
    status: "Coming soon",
    tech: ["Angular", "TypeScript", "RxJS", "SCSS"],
    description:
      "A website built with Angular. Add a description, a link to the live site, and a short screen recording when it's ready.",
    cover: { from: "#00c2ff", to: "#0a1a3f", accent: "#ff4fd8", image: null },
    links: { demo: null, video: null, repo: null },
  },
  {
    id: "video-club",
    title: "The Video Club",
    tagline: "A portfolio you can rent.",
    year: 2026,
    genre: "Interactive · Nostalgia",
    rating: "G",
    runtime: "You're watching it",
    status: "Live",
    tech: ["HTML", "CSS 3D transforms", "Vanilla JS"],
    description:
      "This site. A normal portfolio that turns into a retro video store, where each project is a case on the shelf you can pull down and open.",
    cover: { from: "#ffb300", to: "#5a1300", accent: "#ffffff", image: null },
    links: { demo: null, video: null, repo: "https://github.com/BrendanWebDeveloper/Brendan-Web-Portfolio" },
  },
];
