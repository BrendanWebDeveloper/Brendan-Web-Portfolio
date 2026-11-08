(function () {
  "use strict";

  var projects = window.PROJECTS || [];
  var $ = function (sel) { return document.querySelector(sel); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var site = $("#site");
  var store = $("#store");
  var shelf = $("#shelf");
  var grid = $("#projectGrid");
  var overlay = $("#overlay");
  var stage = overlay.querySelector(".case-stage");
  var caseEl = $("#case");
  var caseBody = $("#caseBody");
  var coverFront = $("#coverFront");
  var coverBack = $("#coverBack");
  var staticEl = $("#static");

  var aisle = "vhs";
  var lastTrigger = null;
  var busy = false;

  var AISLES = {
    vhs: { sign: "Brendan's Video Club", sub: "Pick a tape off the shelf · Be kind, rewind", play: "▶ Watch", media: "tape" },
    game: { sign: "Brendan's Game Shack", sub: "Pick a game · Blow on the cartridge first", play: "▶ Play", media: "disc" },
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function coverVars(p) {
    var c = p.cover || {};
    return "--from:" + (c.from || "#444") + ";--to:" + (c.to || "#111") + ";--accent:" + (c.accent || "#fff") + ";";
  }

  /* ---------- Cover art ---------- */
  function coverHTML(p, kind) {
    var c = p.cover || {};
    var art = c.image
      ? '<img class="cv-img" src="' + esc(c.image) + '" alt="" />'
      : '<span class="cv-sun"></span><span class="cv-grid"></span>';
    var top = kind === "game"
      ? '<div class="cv-platform"><span>BW</span>·64 <small>PORTFOLIO SYSTEM</small></div>'
      : '<div class="cv-band">PORTFOLIO <b>HOME VIDEO</b></div>';
    var logo = kind === "game" ? "1 PLAYER" : "VHS";
    return (
      '<div class="cover ' + kind + '" style="' + coverVars(p) + '">' +
        top +
        '<div class="cv-art">' + art + "</div>" +
        '<div class="cv-title">' + esc(p.title) + "</div>" +
        '<div class="cv-tag">' + esc(p.tagline) + "</div>" +
        '<div class="cv-bottom"><span class="cv-rating">' + esc(p.rating || "E") + '</span><span class="cv-logo">' + logo + "</span></div>" +
      "</div>"
    );
  }

  function itemHTML(p, kind) {
    return kind === "game"
      ? '<div class="disc" style="' + coverVars(p) + '"><span>' + esc(p.title) + "</span></div>"
      : '<div class="tape"><span class="reel"></span><span class="tape-label">' + esc(p.title) + '</span><span class="reel"></span></div>';
  }

  function coverBackHTML(p, kind) {
    var note = kind === "game"
      ? '<div class="manual"><small>Instruction Booklet</small><strong>' + esc(p.title) + "</strong><p>Warning: may contain bugs. Save often.</p></div>"
      : '<div class="sticker">BE KIND<br/>REWIND</div>';
    return (
      '<div class="inside ' + kind + '-inside">' +
        note + itemHTML(p, kind) +
        '<div class="credits">A <b>Brendan</b> production · ' + esc(p.year) + "<br/>" + esc((p.tech || []).join(" · ")) + "</div>" +
      "</div>"
    );
  }

  /* ---------- Detail panel (shared by both modes) ---------- */
  function mediaHTML(p, kind) {
    var v = p.links && p.links.video;
    var screen;
    if (v && /\.(mp4|webm)(\?|$)/i.test(v)) {
      screen = '<video src="' + esc(v) + '" controls playsinline></video>';
    } else if (v) {
      screen = '<iframe src="' + esc(v) + '" title="' + esc(p.title) + ' video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else {
      screen = '<div class="no-signal"><span>NO SIGNAL</span><small>Trailer coming soon</small></div>';
    }
    return '<div class="tv"><div class="tv-screen">' + screen + "</div></div>";
  }

  function detailHTML(p, kind) {
    var l = p.links || {};
    var playLabel = kind ? AISLES[kind].play : "▶ Live demo";
    var actions = "";
    if (l.demo) actions += '<a class="btn primary" href="' + esc(l.demo) + '" target="_blank" rel="noopener">' + playLabel + "</a>";
    if (l.repo) actions += '<a class="btn" href="' + esc(l.repo) + '" target="_blank" rel="noopener">Source code</a>';
    if (!l.demo && !l.repo) actions += '<span class="btn disabled">Links coming soon</span>';
    actions += '<button type="button" class="btn ghost" data-close>' + (kind ? "⏏ Eject" : "Close") + "</button>";

    return (
      '<div class="detail">' +
        '<div class="detail-media">' + mediaHTML(p, kind) + "</div>" +
        '<div class="detail-info">' +
          '<p class="meta">' + esc(p.year) + " · " + esc(p.genre) + " · Rated " + esc(p.rating) + "</p>" +
          '<h2 id="detailTitle">' + esc(p.title) + "</h2>" +
          '<p class="tagline">' + esc(p.tagline) + "</p>" +
          '<p class="status">' + esc(p.status) + "</p>" +
          '<p class="desc">' + esc(p.description) + "</p>" +
          '<ul class="chips">' + (p.tech || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
          '<div class="actions">' + actions + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ---------- Render: normal grid ---------- */
  function renderGrid() {
    grid.innerHTML = projects.map(function (p, i) {
      return (
        '<article class="card">' +
          '<div class="card-thumb" style="' + coverVars(p) + '"><span>' + esc(p.title) + "</span></div>" +
          '<div class="card-body">' +
            '<p class="meta">' + esc(p.status) + "</p>" +
            "<h3>" + esc(p.title) + "</h3>" +
            "<p>" + esc(p.description) + "</p>" +
            '<button type="button" class="btn primary" data-open="' + i + '">Read more</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ---------- Render: shelf ---------- */
  function renderShelf() {
    shelf.innerHTML = projects.map(function (p, i) {
      var sticker = p.status && p.status !== "Live" ? '<span class="price-sticker">' + esc(p.status) + "</span>" : "";
      return (
        '<button type="button" class="case-item" data-open="' + i + '" aria-label="Open ' + esc(p.title) + '">' +
          coverHTML(p, aisle) + sticker +
        "</button>"
      );
    }).join("");
  }

  function setAisle(next) {
    aisle = next === "game" ? "game" : "vhs";
    store.dataset.aisle = aisle;
    $("#storeSign").textContent = AISLES[aisle].sign;
    $("#storeSub").textContent = AISLES[aisle].sub;
    document.querySelectorAll("[data-aisle]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.aisle === aisle));
    });
    try { localStorage.setItem("vc-aisle", aisle); } catch (e) {}
    renderShelf();
  }

  /* ---------- Mode switching with VHS static ---------- */
  function flashStatic(midway) {
    if (reduceMotion) { midway(); return; }
    staticEl.classList.add("on");
    setTimeout(midway, 280);
    setTimeout(function () { staticEl.classList.remove("on"); }, 650);
  }

  function enterStore(skipFx) {
    var go = function () {
      site.hidden = true;
      store.hidden = false;
      document.body.classList.add("in-store");
      window.scrollTo(0, 0);
      if (location.hash !== "#club") history.replaceState(null, "", "#club");
    };
    skipFx ? go() : flashStatic(go);
  }

  function exitStore() {
    flashStatic(function () {
      store.hidden = true;
      site.hidden = false;
      document.body.classList.remove("in-store");
      history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo(0, 0);
    });
  }

  /* ---------- Open / close a case ---------- */
  function openProject(i, trigger) {
    var p = projects[i];
    if (!p || busy) return;
    lastTrigger = trigger;
    var inStore = !store.hidden;
    var kind = inStore ? aisle : null;

    caseBody.innerHTML = detailHTML(p, kind);
    overlay.className = "overlay " + (inStore ? "boxed kind-" + kind : "plain");
    if (inStore) {
      coverFront.innerHTML = coverHTML(p, kind);
      coverBack.innerHTML = coverBackHTML(p, kind);
    }
    overlay.hidden = false;
    caseBody.scrollTop = 0; // must happen after unhiding, or the old scroll position sticks
    document.body.classList.add("no-scroll");

    var focusClose = function () {
      var c = caseBody.querySelector("[data-close]");
      if (c) c.focus({ preventScroll: true });
    };

    if (!inStore || reduceMotion) {
      requestAnimationFrame(function () { overlay.classList.add("show", "open"); focusClose(); });
      return;
    }

    // FLIP: fly the case from its spot on the shelf to the center, then swing it open.
    busy = true;
    overlay.classList.add("show");
    var from = trigger.querySelector(".cover").getBoundingClientRect();
    var to = caseEl.getBoundingClientRect();
    var dx = from.left + from.width / 2 - (to.left + to.width / 2);
    var dy = from.top + from.height / 2 - (to.top + to.height / 2);
    var s = from.width / to.width;
    trigger.classList.add("taken");

    var anim = stage.animate(
      [
        { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")" },
        { transform: "translate(0,0) scale(1.06)", offset: 0.75 },
        { transform: "none" },
      ],
      { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    anim.onfinish = function () {
      overlay.classList.add("open");
      setTimeout(function () { busy = false; focusClose(); }, 650);
    };
  }

  function closeProject() {
    if (overlay.hidden || busy) return;
    var boxed = overlay.classList.contains("boxed");
    var trigger = lastTrigger;

    var finish = function () {
      overlay.hidden = true;
      overlay.className = "overlay";
      caseBody.innerHTML = ""; // stops any playing video
      document.body.classList.remove("no-scroll");
      if (trigger) { trigger.classList.remove("taken"); trigger.focus({ preventScroll: true }); }
      busy = false;
    };

    if (!boxed || reduceMotion || !trigger) {
      overlay.classList.remove("show", "open");
      setTimeout(finish, reduceMotion ? 0 : 200);
      return;
    }

    busy = true;
    overlay.classList.remove("open"); // swing cover shut
    setTimeout(function () {
      var to = trigger.querySelector(".cover").getBoundingClientRect();
      var from = caseEl.getBoundingClientRect();
      var dx = to.left + to.width / 2 - (from.left + from.width / 2);
      var dy = to.top + to.height / 2 - (from.top + from.height / 2);
      var s = to.width / from.width;
      overlay.classList.add("leaving");
      var anim = stage.animate(
        [{ transform: "none" }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")" }],
        { duration: 420, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }
      );
      anim.onfinish = function () { anim.cancel(); finish(); };
    }, 600);
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open]");
    if (opener) { openProject(Number(opener.dataset.open), opener); return; }
    if (e.target.closest("[data-close]")) { closeProject(); return; }
    var aisleBtn = e.target.closest("[data-aisle]");
    if (aisleBtn) setAisle(aisleBtn.dataset.aisle);
  });

  // While the cover is still shut, clicking it opens it.
  coverFront.addEventListener("click", function () {
    if (!busy && overlay.classList.contains("boxed")) overlay.classList.add("open");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeProject();
  });

  $("#enterStore").addEventListener("click", function () { enterStore(false); });
  $("#exitStore").addEventListener("click", exitStore);
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Init ---------- */
  var saved = null;
  try { saved = localStorage.getItem("vc-aisle"); } catch (e) {}
  renderGrid();
  setAisle(saved || "vhs");
  if (location.hash === "#club") enterStore(true);
})();
