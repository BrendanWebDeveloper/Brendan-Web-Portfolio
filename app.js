(function () {
  "use strict";

  const projects = window.PROJECTS || [];
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const site = $("#site");
  const cafe = $("#cafe");
  const fadeEl = $("#fade");
  const room = $("#room");
  const backBtn = $("#backBtn");
  const VIEWS = { outside: $("#vOutside"), inside: $("#vRoom"), shelf: $("#vShelf"), table: $("#vTable") };

  // The first "handheld" project lives on the table; everything else is a book.
  const handheldProject = projects.find((p) => p.place === "handheld") || null;
  const shelfProjects = projects.filter((p) => p !== handheldProject);

  /* =========================================================
     Helpers
     ========================================================= */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function colorVars(p) {
    const c = p.cover || {};
    return `--from:${c.from || "#555"};--to:${c.to || "#222"};--accent:${c.accent || "#e8c56a"};`;
  }
  // Small deterministic random so the shelf looks the same on every visit.
  function rng(seed) {
    return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  }
  let timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, reduceMotion ? 0 : ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  /* =========================================================
     Normal site grid
     ========================================================= */
  function renderGrid() {
    $("#projectGrid").innerHTML = projects.map((p, i) => `
      <article class="card">
        <div class="card-thumb" style="${colorVars(p)}"><span>${esc(p.title)}</span></div>
        <div class="card-body">
          <p class="meta">${esc(p.status)}</p>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <button type="button" class="btn primary" data-open="${i}">Read more</button>
        </div>
      </article>`).join("");
  }

  /* =========================================================
     Café: room decorations
     ========================================================= */
  function renderRoomDetails() {
    // Chalkboard menu lists the tech you use.
    const tech = [...new Set(projects.flatMap((p) => p.tech || []))].slice(0, 6);
    $("#boardList").innerHTML = tech.map((t) => `<li>${esc(t)}</li>`).join("");

    // Mini bookshelf in the room view.
    const r = rng(7);
    const palette = ["#7a1f3d", "#1f4e79", "#2f5d3a", "#8a5a1e", "#4b2e5c", "#9c3d2a", "#26545a", "#c49a3a"];
    let html = "";
    for (let row = 0; row < 4; row++) {
      html += '<span class="ms-row">';
      for (let b = 0; b < 11; b++) {
        html += `<i style="height:${55 + r() * 40}%;flex-grow:${1 + r() * 1.5};background:${palette[Math.floor(r() * palette.length)]}"></i>`;
      }
      html += "</span>";
    }
    $("#miniShelf").innerHTML = html;
  }

  /* =========================================================
     Café: bookcase
     ========================================================= */
  const FILLER = ["#6e2c2c", "#2c3e5c", "#3d5a3a", "#7a5a2e", "#4a3555", "#8c4a32", "#2e5257", "#5c4a3a", "#a08050", "#3a3a48"];
  let shelfBucket = null;

  function fillerBook(r) {
    const w = 18 + Math.round(r() * 20);
    const h = 62 + Math.round(r() * 28);
    const c = FILLER[Math.floor(r() * FILLER.length)];
    return `<span class="book filler" aria-hidden="true" style="--c:${c};width:${w}px;height:${h}%"></span>`;
  }

  const DECOR = [
    '<span class="decor pot" aria-hidden="true"><i></i></span>',
    '<span class="decor stack" aria-hidden="true"><i></i><i></i><i></i></span>',
    '<span class="decor mug" aria-hidden="true"></span>',
    '<span class="decor frame" aria-hidden="true"></span>',
  ];

  function renderBookcase() {
    const narrow = window.innerWidth < 640;
    shelfBucket = narrow;
    const perShelf = narrow ? 2 : 3;
    const rows = Math.max(3, Math.ceil(shelfProjects.length / perShelf) + 1);
    const r = rng(42);
    let idx = 0;
    let html = "";

    for (let row = 0; row < rows; row++) {
      let items = "";
      if (row % 2 === 1) items += DECOR[row % DECOR.length];
      const n = Math.min(perShelf, shelfProjects.length - idx);
      for (let k = 0; k < n; k++, idx++) {
        const p = shelfProjects[idx];
        const gi = projects.indexOf(p);
        const lead = narrow ? 1 + Math.floor(r() * 2) : 2 + Math.floor(r() * 3);
        for (let f = 0; f < lead; f++) items += fillerBook(r);
        const label = p.status && p.status !== "Live"
          ? `<span class="note">${esc(p.status)}</span>`
          : `<span class="spine-author">BRENDAN</span>`;
        items += `
          <button type="button" class="book proj" data-open="${gi}" style="${colorVars(p)}" aria-label="Open the book: ${esc(p.title)}">
            <span class="spine-title">${esc(p.title)}</span>
            ${label}
          </button>`;
      }
      if (row % 2 === 0) {
        for (let f = 0; f < 2; f++) items += fillerBook(r);
        items += DECOR[(row + 2) % DECOR.length];
      }
      // Fill the rest of the shelf; overflow is clipped.
      for (let f = 0; f < 30; f++) items += fillerBook(r);
      html += `<div class="shelf-row">${items}</div>`;
    }
    $("#bookcase").innerHTML = html;
  }

  /* =========================================================
     Book cover + detail page
     ========================================================= */
  function coverHTML(p) {
    const img = p.cover && p.cover.image ? `<img class="bk-img" src="${esc(p.cover.image)}" alt="" />` : "";
    return `
      <div class="bk-cover" style="${colorVars(p)}">
        ${img}
        <div class="bk-frame">
          <span class="bk-orn">❦</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.tagline)}</p>
          <span class="bk-orn">❦</span>
          <span class="bk-author">BRENDAN</span>
        </div>
      </div>`;
  }

  function insideCoverHTML(p) {
    return `
      <div class="bk-inside" style="${colorVars(p)}">
        <div class="ex-libris">
          <small>Ex Libris</small>
          <strong>Brendan's Café</strong>
          <span>${esc(p.year)}</span>
          <em>${esc((p.tech || []).join(" · "))}</em>
        </div>
      </div>`;
  }

  function mediaHTML(p) {
    const v = p.links && p.links.video;
    if (v && /\.(mp4|webm)(\?|$)/i.test(v)) return `<video src="${esc(v)}" controls playsinline></video>`;
    if (v) return `<iframe src="${esc(v)}" title="${esc(p.title)} video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    return `<div class="fig-empty"><span>✎</span>Screenshots coming soon</div>`;
  }

  function detailHTML(p, mode) {
    const l = p.links || {};
    const n = projects.indexOf(p) + 1;
    let actions = "";
    if (l.demo) actions += `<a class="btn primary" href="${esc(l.demo)}" target="_blank" rel="noopener">▶ Live demo</a>`;
    if (l.repo) actions += `<a class="btn" href="${esc(l.repo)}" target="_blank" rel="noopener">Source code</a>`;
    if (mode === "plain" && p === handheldProject) actions += `<button type="button" class="btn" data-goto="table">☕ Play it in the café</button>`;
    if (!actions) actions = `<span class="btn disabled">Links coming soon</span>`;
    actions += `<button type="button" class="btn ghost" data-close>${mode === "book" ? "Close the book" : "Close"}</button>`;

    return `
      <article class="detail">
        <p class="chapter">${mode === "book" ? `Chapter ${n} · ` : ""}${esc(p.year)} · ${esc(p.genre)}</p>
        <h2 id="detailTitle">${esc(p.title)}</h2>
        <p class="tagline">${esc(p.tagline)}</p>
        <span class="stamp">${esc(p.status)}</span>
        <figure class="fig">${mediaHTML(p)}<figcaption>Fig. ${n} — ${esc(p.title)}</figcaption></figure>
        <p class="desc">${esc(p.description)}</p>
        <p class="built"><b>Built with:</b> ${esc((p.tech || []).join(", "))}</p>
        <div class="actions">${actions}</div>
        ${mode === "book" ? `<p class="page-num">— ${n} —</p>` : ""}
      </article>`;
  }

  /* =========================================================
     Open / close a book (or the plain detail popup)
     ========================================================= */
  const overlay = $("#overlay");
  const stage = overlay.querySelector(".book-stage");
  const bookEl = $("#book");
  const page = $("#bookPage");
  let lastTrigger = null;
  let bookBusy = false;

  function flyTransform(fromRect, toRect, rotate) {
    const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
    const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
    const s = fromRect.height / toRect.height;
    return `translate(${dx}px,${dy}px) perspective(1400px) rotateY(${rotate}deg) scale(${s})`;
  }

  function openProject(i, trigger) {
    const p = projects[i];
    if (!p || bookBusy) return;
    lastTrigger = trigger;
    const asBook = trigger.classList.contains("proj");

    page.innerHTML = detailHTML(p, asBook ? "book" : "plain");
    overlay.className = "overlay " + (asBook ? "as-book" : "plain");
    if (asBook) {
      $("#coverFront").innerHTML = coverHTML(p);
      $("#coverBack").innerHTML = insideCoverHTML(p);
    }
    overlay.hidden = false;
    page.scrollTop = 0; // after unhiding, or an old scroll position sticks
    document.body.classList.add("no-scroll");
    const focusClose = () => { const c = page.querySelector("[data-close]"); if (c) c.focus({ preventScroll: true }); };

    if (!asBook || reduceMotion) {
      requestAnimationFrame(() => { overlay.classList.add("show", "open"); focusClose(); });
      return;
    }

    // Fly the book off the shelf (spine first), then swing the cover open.
    bookBusy = true;
    overlay.classList.add("show");
    trigger.classList.add("taken");
    const anim = stage.animate(
      [
        { transform: flyTransform(trigger.getBoundingClientRect(), bookEl.getBoundingClientRect(), 82) },
        { transform: "translate(0,0) perspective(1400px) rotateY(0deg) scale(1.04)", offset: 0.75 },
        { transform: "none" },
      ],
      { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    anim.onfinish = () => {
      overlay.classList.add("open");
      setTimeout(() => { bookBusy = false; focusClose(); }, 700);
    };
  }

  function closeProject(instant) {
    if (overlay.hidden) return;
    if (bookBusy && !instant) return;
    const trigger = lastTrigger;
    const asBook = overlay.classList.contains("as-book");

    const finish = () => {
      overlay.hidden = true;
      overlay.className = "overlay";
      page.innerHTML = ""; // stops any playing video
      document.body.classList.remove("no-scroll");
      if (trigger) {
        trigger.classList.remove("taken");
        if (!instant && document.contains(trigger)) trigger.focus({ preventScroll: true });
      }
      bookBusy = false;
    };

    if (instant || !asBook || reduceMotion || !document.contains(trigger)) {
      overlay.classList.remove("show", "open");
      instant ? finish() : setTimeout(finish, reduceMotion ? 0 : 200);
      return;
    }

    bookBusy = true;
    overlay.classList.remove("open"); // close the cover
    setTimeout(() => {
      overlay.classList.add("leaving");
      const anim = stage.animate(
        [{ transform: "none" }, { transform: flyTransform(trigger.getBoundingClientRect(), bookEl.getBoundingClientRect(), 82) }],
        { duration: 450, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }
      );
      anim.onfinish = () => { anim.cancel(); finish(); };
    }, 650);
  }

  /* =========================================================
     Café navigation (#cafe, #cafe/inside, #cafe/shelf, #cafe/table)
     ========================================================= */
  let current = null; // null = normal site

  function routeFromHash() {
    const m = location.hash.match(/^#cafe(?:\/(inside|shelf|table))?$/);
    return m ? m[1] || "outside" : null;
  }
  function urlFor(route) {
    if (route === null) return location.pathname + location.search;
    return route === "outside" ? "#cafe" : "#cafe/" + route;
  }
  function navigate(route) {
    history.pushState(null, "", urlFor(route));
    onRoute();
  }

  function fade(mid) {
    if (reduceMotion) { mid(); return; }
    fadeEl.classList.add("on");
    later(() => { mid(); fadeEl.classList.remove("on"); }, 380);
  }

  function showView(name, appear) {
    Object.entries(VIEWS).forEach(([key, el]) => {
      el.hidden = key !== name;
      el.classList.remove("appear", "opening", "entering");
    });
    $("#facade").style.cssText = "";
    room.style.transform = "";
    room.style.transition = "";
    backBtn.hidden = !(name === "shelf" || name === "table");
    const v = VIEWS[name];
    if (appear && !reduceMotion) { void v.offsetWidth; v.classList.add("appear"); }
    if (name === "shelf" && shelfBucket !== (window.innerWidth < 640)) renderBookcase();
  }

  function showSite() {
    cafe.hidden = true;
    site.hidden = false;
    document.body.classList.remove("in-cafe");
    window.scrollTo(0, 0);
  }
  function showCafe() {
    site.hidden = true;
    cafe.hidden = false;
    document.body.classList.add("in-cafe");
    window.scrollTo(0, 0);
  }

  function hotspotTransform(name) {
    const hs = room.querySelector(name === "shelf" ? ".r-shelf" : ".r-table");
    const rr = room.getBoundingClientRect();
    const hr = hs.getBoundingClientRect();
    const hx = hr.left + hr.width / 2, hy = hr.top + hr.height / 2;
    room.style.transformOrigin = `${hx - rr.left}px ${hy - rr.top}px`;
    const s = Math.min(3, (window.innerHeight * 0.9) / hr.height);
    return `translate(${window.innerWidth / 2 - hx}px, ${window.innerHeight / 2 - hy}px) scale(${s})`;
  }

  function onRoute() {
    const next = routeFromHash();
    if (next === current) return;
    const prev = current;
    current = next;
    clearTimers();
    closeProject(true);
    if (next !== "table") putDown(true);

    if (next === null) { fade(showSite); return; }
    if (prev === null) { fade(() => { showCafe(); showView(next); }); return; }

    if (reduceMotion) { showView(next); return; }

    if (prev === "outside" && next === "inside") {
      // Push the door open, step through it.
      const out = VIEWS.outside;
      const facade = $("#facade");
      const door = $("#door").getBoundingClientRect();
      const fr = facade.getBoundingClientRect();
      facade.style.transformOrigin = `${door.left + door.width / 2 - fr.left}px ${door.top + door.height / 2 - fr.top}px`;
      out.classList.add("opening");
      later(() => out.classList.add("entering"), 700);
      later(() => {
        showView("inside");
        room.style.transition = "none";
        room.style.transform = "scale(1.25)";
        room.style.opacity = "0";
        void room.offsetWidth;
        room.style.transition = "";
        room.style.transform = "";
        room.style.opacity = "";
      }, 1450);
      return;
    }

    if (prev === "inside" && (next === "shelf" || next === "table")) {
      // Walk up to the bookshelf / table.
      room.style.transform = hotspotTransform(next);
      room.classList.add("walking");
      later(() => { room.classList.remove("walking"); showView(next, true); }, 750);
      return;
    }

    if ((prev === "shelf" || prev === "table") && next === "inside") {
      // Step back: start zoomed in on where we were, then zoom out.
      showView("inside");
      room.style.transition = "none";
      room.style.transform = hotspotTransform(prev);
      void room.offsetWidth;
      room.style.transition = "";
      room.style.transform = "";
      return;
    }

    fade(() => showView(next));
  }

  /* =========================================================
     The handheld
     ========================================================= */
  const hhWrap = $("#hhWrap");
  const screen = $("#hhScreen");
  const hh = { held: false, state: "off", idx: 0, menu: [] };

  const SPRITE = [
    "..3333..",
    ".333333.",
    ".3.33.3.",
    ".333333.",
    "..3..3..",
    ".333333.",
    "3.3333.3",
    "..3..3..",
  ];
  const spriteShadow = SPRITE.flatMap((row, y) =>
    [...row].map((c, x) => (c === "3" ? `${x}em ${y}em 0 #0f380f` : null)).filter(Boolean)
  ).join(",");

  function buildMenu() {
    const p = handheldProject;
    const items = [
      { label: "PLAY GAME", act: "play" },
      { label: "TRAILER", act: "trailer" },
      { label: "ABOUT", act: "about" },
    ];
    if (p.links && p.links.repo) items.push({ label: "SOURCE CODE", act: "source" });
    items.push({ label: "PUT DOWN", act: "down" });
    return items;
  }

  function renderScreen() {
    const p = handheldProject;
    let html = "";
    switch (hh.state) {
      case "off":
        html = "";
        break;
      case "boot":
        html = `<div class="scr boot"><span class="boot-logo">Brendan<sup>®</sup></span></div>`;
        break;
      case "title":
        html = `
          <div class="scr title">
            <span class="sprite" style="box-shadow:${spriteShadow}"></span>
            <div class="t-name">${esc(p.title)}</div>
            <div class="t-tag">${esc(p.tagline)}</div>
            <button type="button" class="blink" data-btn="start">PRESS START</button>
            <div class="t-copy">© ${esc(p.year)} BRENDAN</div>
          </div>`;
        break;
      case "menu":
        html = `
          <div class="scr menu">
            <div class="m-title">${esc(p.title)}</div>
            <ul>${hh.menu.map((m, i) => `<li><button type="button" data-hh-item="${i}" class="${i === hh.idx ? "sel" : ""}">${i === hh.idx ? "▶" : "&nbsp;"} ${m.label}</button></li>`).join("")}</ul>
            <div class="m-hint">A:OK  B:BACK</div>
          </div>`;
        break;
      case "about":
        html = `
          <div class="scr about" id="hhScroll">
            <p>${esc(p.description)}</p>
            <p>BUILT WITH:<br/>${(p.tech || []).map(esc).join("<br/>")}</p>
            <p>STATUS: ${esc(p.status)}</p>
            <p class="m-hint">B:BACK</p>
          </div>`;
        break;
      case "trailer": {
        const v = p.links && p.links.video;
        if (v && /\.(mp4|webm)(\?|$)/i.test(v)) html = `<div class="scr media"><video src="${esc(v)}" controls autoplay playsinline></video></div>`;
        else if (v) html = `<div class="scr media"><iframe src="${esc(v)}" title="${esc(p.title)} trailer" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
        else html = `<div class="scr msg"><p>NO TRAILER YET</p><p>CHECK BACK SOON!</p><p class="m-hint">B:BACK</p></div>`;
        break;
      }
      case "msg":
        html = `<div class="scr msg">${hh.msg}<p class="m-hint">B:BACK</p></div>`;
        break;
    }
    screen.innerHTML = html;
    screen.dataset.state = hh.state;
  }

  function setState(s) { hh.state = s; renderScreen(); }

  function pickUp() {
    if (!handheldProject || hh.held) return;
    hh.held = true;
    hh.menu = buildMenu();
    hh.idx = 0;
    VIEWS.table.classList.add("holding");
    later(() => {
      setState("boot");
      later(() => setState("title"), 2000);
    }, 600);
    later(() => { const s = $('#handheld [data-btn="start"]'); if (s) s.focus({ preventScroll: true }); }, 700);
  }

  function putDown(instant) {
    if (!hh.held) return;
    hh.held = false;
    VIEWS.table.classList.remove("holding");
    setState("off");
    if (!instant) $("#hhPickup").focus({ preventScroll: true });
  }

  function select(item) {
    const p = handheldProject;
    const l = p.links || {};
    switch (item.act) {
      case "play":
        if (l.demo) {
          window.open(l.demo, "_blank", "noopener");
          hh.msg = "<p>LOADING…</p><p>GAME OPENED IN A NEW TAB</p>";
        } else {
          hh.msg = "<p>INSERT CARTRIDGE</p><p>PLAYABLE DEMO COMING SOON!</p>";
        }
        setState("msg");
        break;
      case "source":
        window.open(l.repo, "_blank", "noopener");
        break;
      case "down":
        putDown();
        break;
      default:
        setState(item.act);
    }
  }

  function press(btn) {
    if (!hh.held) return;
    const s = hh.state;
    if (s === "title") {
      if (btn === "start" || btn === "a") setState("menu");
      else if (btn === "b") putDown();
    } else if (s === "menu") {
      if (btn === "up") { hh.idx = (hh.idx + hh.menu.length - 1) % hh.menu.length; renderScreen(); }
      else if (btn === "down" || btn === "select") { hh.idx = (hh.idx + 1) % hh.menu.length; renderScreen(); }
      else if (btn === "a" || btn === "start") select(hh.menu[hh.idx]);
      else if (btn === "b") setState("title");
    } else if (s === "about") {
      const sc = $("#hhScroll");
      if (btn === "up") sc.scrollTop -= 40;
      else if (btn === "down") sc.scrollTop += 40;
      else if (btn === "a" || btn === "b") setState("menu");
    } else if (s === "trailer" || s === "msg") {
      if (btn === "a" || btn === "b") setState("menu");
    }
  }

  /* =========================================================
     Events
     ========================================================= */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const opener = t.closest("[data-open]");
    if (opener) { openProject(Number(opener.dataset.open), opener); return; }
    if (t.closest("[data-close]")) { closeProject(); return; }
    const goto = t.closest("[data-goto]");
    if (goto) { closeProject(true); navigate(goto.dataset.goto); return; }
    const hot = t.closest("[data-go]");
    if (hot) { navigate(hot.dataset.go); return; }
    const item = t.closest("[data-hh-item]");
    if (item) { hh.idx = Number(item.dataset.hhItem); select(hh.menu[hh.idx]); return; }
    const btn = t.closest("[data-btn]");
    if (btn) { press(btn.dataset.btn); return; }
  });

  // Clicking the closed cover opens it.
  $("#coverFront").addEventListener("click", () => {
    if (!bookBusy && overlay.classList.contains("as-book")) overlay.classList.add("open");
  });

  $("#door").addEventListener("click", () => navigate("inside"));
  $("#enterCafe").addEventListener("click", () => navigate("outside"));
  $("#leaveCafe").addEventListener("click", () => navigate(null));
  backBtn.addEventListener("click", () => navigate("inside"));
  $("#hhPickup").addEventListener("click", pickUp);
  $("#putDown").addEventListener("click", () => putDown());
  window.addEventListener("popstate", onRoute);

  const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "a", z: "a", " ": "a", Backspace: "b", x: "b", Shift: "select" };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!overlay.hidden) closeProject();
      else if (hh.held) putDown();
      return;
    }
    if (hh.held && KEYS[e.key]) {
      // Let Enter/Space activate a focused on-screen button normally.
      if ((e.key === "Enter" || e.key === " ") && e.target.closest("button")) return;
      e.preventDefault();
      press(KEYS[e.key]);
    }
  });

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (shelfBucket !== (window.innerWidth < 640)) renderBookcase(); }, 150);
  });

  /* =========================================================
     Init
     ========================================================= */
  $("#year").textContent = new Date().getFullYear();
  renderGrid();
  renderRoomDetails();
  renderBookcase();
  if (!handheldProject) {
    $("#vRoom .r-table svg g[transform]").remove();
    hhWrap.hidden = true;
    $("#hhActions").hidden = true;
  }

  const start = routeFromHash();
  if (start) { current = start; showCafe(); showView(start); }
})();
