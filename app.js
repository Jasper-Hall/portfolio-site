/* =========================================================================
   Jasper Hall — portfolio
   Vanilla JS. No dependencies, no build step.
   1. Theme toggle (writes data-theme on <html>, persisted)
   2. Scroll reveal (IntersectionObserver, reduced-motion aware)
   3. Autoplaying video, disabled under prefers-reduced-motion
   4. Hero accordion (flex-grow spotlight, auto-advancing)
   5. Deck (full-viewport project slides, type-band wipe transitions)
   ========================================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --------------------------------------------------------------------
     1. Theme
     ------------------------------------------------------------------ */

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var toggleLabel = document.getElementById("theme-toggle-label");
  var themeListeners = [];

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function activeTheme() {
    return root.getAttribute("data-theme") || systemTheme();
  }

  function syncToggle() {
    var dark = activeTheme() === "dark";
    if (toggleLabel) toggleLabel.textContent = dark ? "Light" : "Dark";
    if (toggle) {
      toggle.setAttribute("aria-pressed", dark ? "true" : "false");
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    themeListeners.forEach(function (fn) { fn(); });
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = activeTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("jh-theme", next); } catch (e) {}
      syncToggle();
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener
    && window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncToggle);

  syncToggle();

  /* --------------------------------------------------------------------
     2. Scroll reveal
     ------------------------------------------------------------------ */

  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    root.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------
     3. Autoplaying video, under reduced motion
     --------------------------------------------------------------------
     The markup asks for autoplay because a silent looping clip is the
     point of those two projects. But autoplay is motion, so anyone who
     has asked for less of it gets a still first frame and a play button.
     Handled here rather than in CSS because `autoplay` is an attribute,
     not a style. Applied live, so toggling the OS setting takes effect
     without a reload.
     ------------------------------------------------------------------ */

  var autoVideos = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]"));

  function applyMotionPreference() {
    var reduce = reduceMotion.matches;
    autoVideos.forEach(function (v) {
      v.setAttribute("controls", "");
      if (reduce) {
        v.autoplay = false;
        v.removeAttribute("autoplay");
        v.loop = false;
        if (!v.paused) v.pause();
      } else {
        v.loop = true;
        /* Videos inside an active deck play when their slide is reached,
           not on page load — the deck owns them. */
        if (root.classList.contains("js-deck") && v.closest && v.closest("#deck-pin")) return;
        if (v.paused && v.dataset.userPaused !== "1") {
          var p = v.play();
          if (p && typeof p.catch === "function") p.catch(function () {});
        }
      }
    });
  }

  /* If someone deliberately pauses a clip, never restart it behind their back.
     Pauses the deck makes itself (sysPause) don't count as the user's. */
  autoVideos.forEach(function (v) {
    v.addEventListener("pause", function () {
      if (v.dataset.sysPause === "1") { v.dataset.sysPause = ""; return; }
      if (!v.ended && !v.seeking) v.dataset.userPaused = "1";
    });
    v.addEventListener("play", function () { v.dataset.userPaused = "0"; });
  });

  applyMotionPreference();
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", applyMotionPreference);
  }

  /* --------------------------------------------------------------------
     4. Hero accordion

     Six project panels in one strip: everything visible at once as
     slivers, the focused panel wide open. Focus advances on a timer and
     follows the pointer on hover. Pure CSS flex-grow transitions; JS only
     moves the .is-focus class. With JS dead the strip still renders with
     the first panel open.
     -------------------------------------------------------------------- */

  (function accordion() {
    var strip = document.getElementById("acc");
    var nameEl = document.getElementById("reel-name");
    if (!strip || !nameEl) return;

    var panels = Array.prototype.slice.call(strip.querySelectorAll(".acc-panel"));
    if (panels.length < 2) return;

    var ADVANCE_MS = 2600;
    var index = 0;
    var timer = null;
    var hovered = false;

    /* Panels with a capture hold live video, but only the open one plays —
       slivers keep a still frame. The videos carry no autoplay attribute,
       so this is the only thing that starts them; under reduced motion
       nothing plays and the posters stand. */
    function syncVideos() {
      panels.forEach(function (panel, i) {
        var v = panel.querySelector("video");
        if (!v) return;
        if (i === index && !reduceMotion.matches && !document.hidden) {
          if (v.paused) {
            var p = v.play();
            if (p && typeof p.catch === "function") p.catch(function () {});
          }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }

    function focus(next) {
      if (next === index) return;
      panels[index].classList.remove("is-focus");
      index = next;
      panels[index].classList.add("is-focus");
      nameEl.textContent = panels[index].dataset.name;
      nameEl.setAttribute("href", panels[index].getAttribute("href"));
      syncVideos();
    }

    function schedule() {
      if (timer) clearTimeout(timer);
      syncVideos();
      if (reduceMotion.matches || hovered || document.hidden) return;
      timer = setTimeout(function () {
        focus((index + 1) % panels.length);
        schedule();
      }, ADVANCE_MS);
    }

    panels.forEach(function (panel, i) {
      /* Desktop: pointing at a sliver opens it. Touch has no hover, so the
         first tap opens instead of navigating; a tap on the open panel
         follows the link. */
      panel.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "mouse" && i !== index) focus(i);
      });
      panel.addEventListener("click", function (e) {
        if (i !== index) {
          e.preventDefault();
          focus(i);
        }
      });
    });

    strip.addEventListener("pointerenter", function () {
      hovered = true;
      if (timer) clearTimeout(timer);
    });
    strip.addEventListener("pointerleave", function () {
      hovered = false;
      schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", schedule);

    schedule();
  })();

  /* --------------------------------------------------------------------
     5. The deck — full-viewport projects with type-band transitions

     Every child of .deck-pin is a slide. The outer .deck element is given
     enough height that scrolling through it walks a sequence of segments:

       [dwell 0][wipe 0][dwell 1][wipe 1] ... [dwell N-1]

     During a dwell the slide holds the screen; if its content is taller
     than the viewport, the first part of the dwell scrolls it internally
     (slide.scrollTop — real scroll play, clamped at the bottom). When the
     content bottoms out and the dwell is spent, the wipe segment clips
     the slide away from the top, the character band flickering at the
     front, revealing the next slide already in place beneath.

     Everything is scrubbed from the document scroll position — no
     hijacking, no wheel handlers, and the scrollbar stays honest.
     Reduced motion, or JS failing entirely, leaves the section as the
     plain long page the markup already is.
     -------------------------------------------------------------------- */

  (function deck() {
    if (reduceMotion.matches) return;

    var outer = document.getElementById("deck");
    var pin = document.getElementById("deck-pin");
    if (!outer || !pin) return;

    var slides = Array.prototype.slice.call(pin.children);
    if (slides.length < 2) return;

    root.classList.add("js-deck");

    /* Leading title slides (method payoff, work intro) ride the same wipe
       but stay out of the project count. */
    var leadCount = 0;
    while (leadCount < slides.length && !slides[leadCount].classList.contains("project")) leadCount++;

    slides.forEach(function (slide, i) {
      slide.classList.add("deck-slide", "is-visible"); // reveal-anims off inside the deck
      slide.style.zIndex = String(slides.length - i);  // first on top
    });

    /* The deck owns its clips: strip the native autoplay (which fires on page
       load) and start each video only when the scroll reaches its slide. */
    var slideVideos = slides.map(function (slide) {
      var vids = Array.prototype.slice.call(slide.querySelectorAll("video"));
      vids.forEach(function (v) {
        v.autoplay = false;
        v.removeAttribute("autoplay");
        if (!v.paused) { v.dataset.sysPause = "1"; v.pause(); }
      });
      return vids;
    });

    var slideActive = slides.map(function () { return false; });

    function setVideos(activeIdx, withNext) {
      slides.forEach(function (slide, j) {
        var active = j === activeIdx || (withNext && j === activeIdx + 1);
        if (active === slideActive[j]) return;
        slideActive[j] = active;
        slideVideos[j].forEach(function (v) {
          if (active) {
            if (reduceMotion.matches || v.dataset.userPaused === "1") return;
            try { v.currentTime = 0; } catch (e) {}
            var p = v.play();
            if (p && typeof p.catch === "function") p.catch(function () {});
          } else if (!v.paused) {
            v.dataset.sysPause = "1";
            v.pause();
          }
        });
      });
    }

    var canvas = document.createElement("canvas");
    canvas.className = "deck-canvas";
    canvas.setAttribute("aria-hidden", "true");
    pin.appendChild(canvas);
    var ctx2 = canvas.getContext("2d");

    var counter = document.createElement("p");
    counter.className = "deck-count";
    counter.setAttribute("aria-hidden", "true");
    pin.appendChild(counter);

    /* ---------------- band ---------------- */

    var CELL = 16;
    /* The band is set in the site's own name: the letters of the phrase are
       tiled across the grid but shuffled, so the wipe is built from the
       alphabet of JASPER HALL without ever spelling it out. Spaces stay
       empty. */
    var PHRASE = "JASPER HALL ";
    var SPREAD_ABOVE = 0.22, SPREAD_BELOW = 0.26;
    var TRAVEL = 1 + SPREAD_ABOVE + SPREAD_BELOW;

    var bw = 0, bh = 0, cols = 0, rows = 0, thresholds = [], scatter = [], glyphs = [];

    function accent() {
      var v = getComputedStyle(root).getPropertyValue("--cobalt").trim();
      return v || "#2547b8";
    }

    function sizeBand() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = pin.clientWidth, h = pin.clientHeight;
      if (w === bw && h === bh && thresholds.length) return;
      bw = w; bh = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      thresholds = []; scatter = []; glyphs = [];
      for (var i = 0; i < cols * rows; i++) {
        thresholds.push(Math.random());
        scatter.push((Math.random() - 0.5) * 0.16);
        glyphs.push(PHRASE.charAt(i % PHRASE.length));
      }
      /* Fisher–Yates shuffle: keeps the exact letter mix of the phrase but
         kills the tiling, so no row ever reads as the name itself. */
      for (var j = glyphs.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = glyphs[j]; glyphs[j] = glyphs[k]; glyphs[k] = tmp;
      }
    }

    function paintBand(centerFrac) {
      ctx2.clearRect(0, 0, bw, bh);
      if (centerFrac <= -SPREAD_ABOVE || centerFrac >= 1 + SPREAD_BELOW) return;
      ctx2.fillStyle = accent();
      ctx2.font = "600 " + Math.round(CELL * 0.7) + "px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx2.textBaseline = "top";
      var lineY = centerFrac * bh;
      var above = SPREAD_ABOVE * bh, below = SPREAD_BELOW * bh;
      var rowStart = Math.max(0, Math.floor((lineY - above) / CELL));
      var rowEnd = Math.min(rows - 1, Math.ceil((lineY + below) / CELL));
      for (var r = rowStart; r <= rowEnd; r++) {
        for (var c = 0; c < cols; c++) {
          var i = r * cols + c;
          var ch = glyphs[i];
          if (ch === " ") continue;
          var d = (r * CELL + CELL / 2 - lineY) / bh + scatter[i];
          var norm = d >= 0 ? d / SPREAD_BELOW : -d / SPREAD_ABOVE;
          if (norm >= 1) continue;
          /* Fixed letters, flickering visibility: the per-frame noise keeps
             the band shimmering while the phrase itself stays legible. */
          if ((1 - norm) * (1 - norm) > thresholds[i] * 0.68 + (Math.random() - 0.5) * 0.1) {
            ctx2.fillText(ch, c * CELL + 2, r * CELL + 1);
          }
        }
      }
    }

    /* ---------------- budgets ---------------- */

    var HOLD_FRAC = 0.6;    // dwell floor, in viewports — the beat a fitting slide holds
    var TRANS_FRAC = 1.6;   // wipe length, in viewports — long on purpose, so the
                            // band transition has real scroll friction to it

    var dwells = [], transPx = 0, starts = [], total = 0;

    function measure() {
      var vh = window.innerHeight;
      transPx = TRANS_FRAC * vh;
      dwells = slides.map(function (slide) {
        var overflow = Math.max(0, slide.scrollHeight - vh);
        return overflow + HOLD_FRAC * vh;
      });
      starts = []; total = 0;
      for (var i = 0; i < slides.length; i++) {
        starts.push(total);
        total += dwells[i];
        if (i < slides.length - 1) total += transPx;
      }
      outer.style.height = (total + vh) + "px";
    }

    /* ---------------- drive ---------------- */

    var lastLocal = -1;

    function setMask(el, m) {
      el.style.webkitMaskImage = m;
      el.style.maskImage = m;
    }

    function update() {
      sizeBand();
      var vh = window.innerHeight;
      var rect = outer.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) { requestAnimationFrame(update); return; }

      var local = Math.max(0, Math.min(total, -rect.top));

      /* Which segment? */
      var idx = 0, inTrans = false, segP = 0;
      for (var i = 0; i < slides.length; i++) {
        var dEnd = starts[i] + dwells[i];
        if (local < dEnd || i === slides.length - 1) {
          idx = i; inTrans = false;
          segP = Math.max(0, local - starts[i]);
          break;
        }
        if (local < dEnd + transPx) {
          idx = i; inTrans = true;
          segP = (local - dEnd) / transPx;
          break;
        }
      }

      var flickering = inTrans;
      if (local !== lastLocal || flickering) {
        lastLocal = local;

        for (var j = 0; j < slides.length; j++) {
          var s = slides[j];
          if (j < idx || j > idx + 1) {        // wiped away, or not yet reached
            s.style.visibility = "hidden";
            setMask(s, "none");
          } else {
            s.style.visibility = "visible";
            if (j === idx + 1) { setMask(s, "none"); s.scrollTop = 0; }
          }
        }

        var cur = slides[idx];
        if (!inTrans) {
          setMask(cur, "none");
          cur.scrollTop = Math.min(segP, Math.max(0, cur.scrollHeight - vh));
          paintBand(-1); // clear
        } else {
          /* A gradient mask instead of a clip-path: the outgoing slide fades
             out across a feathered zone behind the character band, so the
             wipe front is a soft edge, not a hard line. */
          var remapped = -SPREAD_ABOVE + segP * TRAVEL;
          var p = remapped * 100;
          setMask(cur,
            "linear-gradient(180deg, transparent " + (p - 14) + "%, #000 " + (p + 4) + "%)");
          paintBand(remapped);
        }

        setVideos(idx, inTrans);

        var shown = inTrans && segP > 0.5 ? idx + 1 : idx;
        if (shown < leadCount) {
          counter.style.visibility = "hidden";
        } else {
          counter.style.visibility = "visible";
          counter.textContent =
            ("0" + (shown - leadCount + 1)).slice(-2) + " / " + ("0" + (slides.length - leadCount)).slice(-2);
        }
      }
      requestAnimationFrame(update);
    }

    /* ---------------- anchors ---------------- */

    /* Links to a project (from the hero accordion or nav) must land on its
       dwell inside the deck, not on the collapsed markup position. */
    function offsetFor(id) {
      for (var i = 0; i < slides.length; i++) {
        var hit = slides[i].id === id || slides[i].querySelector("#" + id);
        if (hit) {
          var top = outer.getBoundingClientRect().top + window.scrollY;
          return top + starts[i] + 1;
        }
      }
      return null;
    }

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (id === "work") id = "work-intro"; // land on the intro slide's dwell
      var off = offsetFor(id);
      if (off !== null) {
        e.preventDefault();
        window.scrollTo({ top: off, behavior: "smooth" });
      }
    });

    measure();
    if (location.hash) {
      var off0 = offsetFor(location.hash.slice(1));
      if (off0 !== null) window.scrollTo({ top: off0, behavior: "instant" });
    }
    window.addEventListener("resize", function () { measure(); });
    window.addEventListener("load", function () { measure(); });

    requestAnimationFrame(update);
  })();

  /* --------------------------------------------------------------------
     Ambient ASCII orbit on the payoff slide: a dotted ellipse, a comet of
     wordmark glyphs riding it, and the loop's stage names taking turns in
     the centre. Static single frame under prefers-reduced-motion.
     -------------------------------------------------------------------- */
  (function () {
    var pre = document.getElementById("loop-orbit");
    if (!pre || !root.classList.contains("js-deck")) return;

    var W = 72, H = 15;               // character grid
    var CX = (W - 1) / 2, CY = (H - 1) / 2, RX = 31, RY = 6.4;
    var N = 120;                      // samples around the ellipse
    var TRAIN = "LLAH REPSAJ ";       // comet glyphs, head first — reads
                                      // "JASPER HALL" along the top arc
    var STAGES = ["plan", "build", "critique", "ship"];
    var PERIOD = 10000;               // ms per orbit

    // Precompute grid cells for each sample; dots use every 3rd sample.
    var pts = [];
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2; // start at 12 o'clock
      pts.push([Math.round(CX + RX * Math.cos(a)), Math.round(CY + RY * Math.sin(a))]);
    }

    function frame(t) {
      var grid = [], bright = [];
      for (var y = 0; y < H; y++) { grid.push(new Array(W).fill(" ")); bright.push(new Array(W).fill(false)); }
      for (var i = 0; i < N; i += 3) grid[pts[i][1]][pts[i][0]] = "·";
      // Walk the comet backward from the head, one distinct cell per glyph —
      // on the steep sides several samples round to the same cell and the
      // letters would otherwise pile up.
      var head = Math.floor((t % PERIOD) / PERIOD * N);
      var s = head, used = {};
      for (var k = 0; k < TRAIN.length; k++) {
        var p = pts[((s % N) + N) % N], guard = 0;
        while (used[p[0] + "," + p[1]] && guard < N) { s--; guard++; p = pts[((s % N) + N) % N]; }
        used[p[0] + "," + p[1]] = true;
        if (TRAIN[k] !== " ") { grid[p[1]][p[0]] = TRAIN[k]; bright[p[1]][p[0]] = true; }
        s--;
      }
      var word = STAGES[Math.floor((t % PERIOD) / PERIOD * 4) % 4];
      var x0 = Math.round(CX - word.length / 2);
      for (var c = 0; c < word.length; c++) { grid[Math.round(CY)][x0 + c] = word[c]; bright[Math.round(CY)][x0 + c] = true; }
      var html = "";
      for (var r = 0; r < H; r++) {
        var row = "", inB = false;
        for (var x = 0; x < W; x++) {
          if (bright[r][x] && !inB) { row += "<b>"; inB = true; }
          if (!bright[r][x] && inB) { row += "</b>"; inB = false; }
          row += grid[r][x];
        }
        if (inB) row += "</b>";
        html += row + "\n";
      }
      pre.innerHTML = html;
    }

    if (reduceMotion.matches) { frame(PERIOD * 0.6); return; }

    var last = -1;
    (function tick(now) {
      var head = Math.floor((now % PERIOD) / PERIOD * N);
      if (head !== last) { last = head; frame(now); }
      requestAnimationFrame(tick);
    })(0);
  })();

})();
