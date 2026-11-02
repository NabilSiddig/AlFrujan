/* Al Furjan Elite Living — interactions */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "en";

  /* ---------- Analytics ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = Object.assign({ event: event, language: lang }, data || {});
    window.dataLayer.push(payload);
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"), { link: el.getAttribute("href") });
  });

  /* ---------- Language ---------- */
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function t(key) {
    var el = document.querySelector('[data-i18n="' + key + '"]');
    if (lang === "ar" && window.I18N_AR[key]) return window.I18N_AR[key];
    return el ? (el.dataset.en || el.innerHTML) : key;
  }
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }

  function setLang(next) {
    lang = next === "ar" ? "ar" : "en";
    var html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      var ar = window.I18N_AR[el.getAttribute("data-i18n")];
      el.innerHTML = lang === "ar" && ar ? ar : el.dataset.en;
    });
    $$(".lang-switch button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    document.title = window.I18N_MSG[lang].title;
    store("lang", lang);
    document.dispatchEvent(new CustomEvent("langchange"));
  }
  $$(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); track("language_switch"); });
  });
  var qs = new URLSearchParams(location.search).get("lang");
  setLang(qs || read("lang") || "en");

  /* ---------- Header ---------- */
  var header = $("#top-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = $(".menu-toggle");
  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach(function (a) {
    a.addEventListener("click", function () { header.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); });
  });

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$(".reveal").forEach(function (el) { ro.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Villa floor plan viewer ---------- */
  var PLANS = {
    sv: {
      name: "fp.sv",
      ground: { src: "assets/img/sv-plan-ground.webp", w: 1183, h: 691 },
      first: { src: "assets/img/sv-plan-first.webp", w: 1183, h: 691 },
      roof: { src: "assets/img/sv-plan-roof.webp", w: 1643, h: 957, note: "fp.sv.roofnote" }
    },
    a3: {
      name: "fp.a3",
      ground: { src: "assets/img/a3-plan-ground.webp", w: 1512, h: 1040 },
      first: { src: "assets/img/a3-plan-first.webp", w: 1513, h: 1040 },
      roof: { src: "assets/img/a3-plan-roof.webp", w: 1513, h: 1040, note: "a3.note" }
    }
  };
  var ROOF_NOTE_EN = { "fp.sv.roofnote": "A large roof terrace, plus a terrace on the garage roof." };
  var viewer = $("[data-plan-viewer]");
  var planState = { group: "sv", floor: "ground" };

  function renderPlan() {
    var p = PLANS[planState.group][planState.floor];
    var img = $(".plan-card img", viewer);
    img.src = p.src; img.width = p.w; img.height = p.h;
    var label = plain(t(PLANS[planState.group].name)) + " · " + plain(t("floor." + planState.floor));
    img.alt = label + " plan";
    $(".plan-label", viewer).textContent = label;
    var note = "";
    if (p.note) note = lang === "ar" ? window.I18N_AR[p.note] : (ROOF_NOTE_EN[p.note] || plain(t(p.note)));
    $(".plan-note", viewer).textContent = note || "";
  }
  function selectTab(list, btn) {
    $$("button", list).forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
  }
  $$("[data-plan-group] button").forEach(function (b) {
    b.addEventListener("click", function () { planState.group = b.dataset.group; selectTab(b.parentNode, b); renderPlan(); });
  });
  $$(".tabs button[data-floor]", viewer).forEach(function (b) {
    b.addEventListener("click", function () { planState.floor = b.dataset.floor; selectTab(b.parentNode, b); renderPlan(); });
  });
  $(".plan-open", viewer).addEventListener("click", function () {
    var g = PLANS[planState.group];
    var floors = ["ground", "first", "roof"];
    var items = floors.map(function (f) {
      return { src: g[f].src, caption: plain(t(g.name)) + " · " + plain(t("floor." + f)), plan: true };
    });
    Lightbox.open(items, floors.indexOf(planState.floor));
    track("floorplan_open", { plan: planState.group + "-" + planState.floor });
  });
  document.addEventListener("langchange", renderPlan);
  renderPlan();

  /* ---------- Townhouse plans ---------- */
  var th = $("[data-th-plans]");
  $$(".tabs button", th).forEach(function (b) {
    b.addEventListener("click", function () {
      selectTab(b.parentNode, b);
      $$(".th-panel", th).forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.floor; });
    });
  });
  $$(".plan-open", th).forEach(function (b) {
    b.addEventListener("click", function () {
      var floors = ["ground", "first", "roof"];
      var items = floors.map(function (f) {
        return { src: "assets/img/th-plan-" + f + ".webp", caption: plain(t("th.title")) + " · " + plain(t("floor." + f)), plan: true };
      });
      var current = b.closest(".th-panel").dataset.panel;
      Lightbox.open(items, floors.indexOf(current));
      track("floorplan_open", { plan: "townhouse-" + current });
    });
  });

  /* ---------- Lightbox with zoom / pan / swipe ---------- */
  var Lightbox = (function () {
    var box = $("#lightbox"), stage = $(".lb-stage", box), img = $("img", stage);
    var cap = $(".lb-caption", box), count = $(".lb-count", box);
    var items = [], idx = 0, lastFocus = null;
    var s = 1, x = 0, y = 0;
    var pointers = new Map(), start = null;

    function apply() { img.style.transform = "translate(calc(-50% + " + x + "px), calc(-50% + " + y + "px)) scale(" + s + ")"; }
    function reset() { s = 1; x = 0; y = 0; apply(); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function zoomAt(factor, cx, cy) {
      var r = stage.getBoundingClientRect();
      var px = (cx === undefined ? r.width / 2 : cx - r.left) - r.width / 2;
      var py = (cy === undefined ? r.height / 2 : cy - r.top) - r.height / 2;
      var ns = clamp(s * factor, 1, 6);
      var k = ns / s;
      x = px - (px - x) * k; y = py - (py - y) * k; s = ns;
      if (s === 1) { x = 0; y = 0; }
      apply();
    }
    function show(i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      img.classList.toggle("photo", !it.plan);
      img.src = it.src; img.alt = plain(it.caption || "");
      cap.innerHTML = it.caption || "";
      count.textContent = items.length > 1 ? String(idx + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0") : "";
      $$(".lb-nav", box).forEach(function (b) { b.hidden = items.length < 2; });
      reset();
    }
    function open(list, i) {
      items = list; lastFocus = document.activeElement;
      box.classList.add("open"); document.body.style.overflow = "hidden";
      show(i || 0);
      $("[data-close]", box).focus();
    }
    function close() {
      box.classList.remove("open"); document.body.style.overflow = "";
      img.removeAttribute("src");
      if (lastFocus) lastFocus.focus();
    }

    $("[data-close]", box).addEventListener("click", close);
    $(".lb-prev", box).addEventListener("click", function () { show(idx - (lang === "ar" ? -1 : 1)); });
    $(".lb-next", box).addEventListener("click", function () { show(idx + (lang === "ar" ? -1 : 1)); });
    $$("[data-zoom]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var z = b.dataset.zoom;
        if (z === "in") zoomAt(1.5); else if (z === "out") zoomAt(1 / 1.5); else reset();
      });
    });
    stage.addEventListener("wheel", function (e) { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener("dblclick", function (e) { if (s > 1) reset(); else zoomAt(2.5, e.clientX, e.clientY); });

    stage.addEventListener("pointerdown", function (e) {
      stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) start = { x: e.clientX, y: e.clientY, ox: x, oy: y, t: Date.now() };
      if (pointers.size === 2) {
        var p = Array.from(pointers.values());
        start = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: s };
      }
      stage.classList.add("dragging");
    });
    stage.addEventListener("pointermove", function (e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && start.dist) {
        var p = Array.from(pointers.values());
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        zoomAt((start.s * d / start.dist) / s, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
      } else if (pointers.size === 1 && start && start.ox !== undefined && s > 1) {
        x = start.ox + (e.clientX - start.x); y = start.oy + (e.clientY - start.y); apply();
      }
    });
    function up(e) {
      if (pointers.size === 1 && start && start.ox !== undefined && s === 1) {
        var dx = e.clientX - start.x;
        if (Math.abs(dx) > 60 && Date.now() - start.t < 600) {
          var dir = dx < 0 ? 1 : -1;
          show(idx + dir);
        }
      }
      pointers.delete(e.pointerId);
      if (pointers.size === 0) { start = null; stage.classList.remove("dragging"); }
      else { var p = Array.from(pointers.values())[0]; start = { x: p.x, y: p.y, ox: x, oy: y, t: Date.now() }; }
    }
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      var rtl = lang === "ar";
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
      else if (e.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
      else if (e.key === "+" || e.key === "=") zoomAt(1.4);
      else if (e.key === "-") zoomAt(1 / 1.4);
      else if (e.key === "Tab") { // keep focus inside the viewer
        var f = $$("button:not([hidden])", box);
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    return { open: open, close: close };
  })();

  /* Photo galleries: every .ph button opens its data-lb group */
  function captionFor(btn) {
    var fig = btn.closest("figure");
    var c = fig && fig.querySelector("figcaption");
    return c && c.textContent.trim() ? c.innerHTML : $("img", btn).alt;
  }
  $$("[data-lb]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.dataset.lb;
      var list = $$('[data-lb="' + group + '"]');
      var items = list.map(function (b) {
        var im = $("img", b);
        return { src: b.dataset.full || (im.getAttribute("src") || "").replace("-sm.webp", ".webp"), caption: captionFor(b), plan: group === "map" };
      });
      Lightbox.open(items, list.indexOf(btn));
      track("gallery_open", { gallery: group });
    });
  });

  /* ---------- Show Villa tour: progress rail + plan locator ---------- */
  var stops = $$(".stop[data-stop]");
  var rail = $(".tour-rail");
  var locator = $(".locator");
  var locImg = $(".locator-plan img", locator);
  var locPlan = $(".locator-plan", locator);
  var PLAN_SRC = { ground: "assets/img/sv-plan-ground.webp", first: "assets/img/sv-plan-first.webp", roof: "assets/img/sv-plan-roof.webp" };
  var PLAN_DIM = { ground: [1183, 691], first: [1183, 691], roof: [1643, 957] };
  var current = -1;

  function stopTitle(st) {
    var n = st.dataset.stop.padStart(2, "0");
    var a = document.querySelector('.index-list a[href="#stop-' + n + '"] span[data-i18n]');
    return a ? a.textContent : "";
  }
  function buildRail() {
    rail.innerHTML = "";
    stops.forEach(function (st) {
      var n = st.dataset.stop.padStart(2, "0");
      var a = document.createElement("a");
      a.href = "#" + st.id;
      a.innerHTML = '<span class="lbl">' + stopTitle(st) + "</span>" + n;
      rail.appendChild(a);
    });
  }
  function setActive(i) {
    if (i === current) return;
    current = i;
    var st = stops[i];
    $$("a", rail).forEach(function (a, k) {
      a.classList.toggle("active", k === i);
      if (k === i) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current");
    });
    var floor = st.dataset.plan;
    if (locImg.getAttribute("src") !== PLAN_SRC[floor]) {
      locImg.src = PLAN_SRC[floor]; locImg.width = PLAN_DIM[floor][0]; locImg.height = PLAN_DIM[floor][1];
    }
    $(".locator-floor", locator).textContent = plain(t("floor." + floor));
    $(".locator-name .n", locator).textContent = st.dataset.stop.padStart(2, "0");
    $(".locator-name .t", locator).textContent = stopTitle(st);
    $(".locator-bar span", locator).style.width = ((i + 1) / stops.length * 100) + "%";
    $$(".locator-dot", locPlan).forEach(function (d) { d.remove(); });
    st.dataset.xy.split(";").forEach(function (pt) {
      var xy = pt.split(",");
      var d = document.createElement("span");
      d.className = "locator-dot";
      d.style.left = xy[0] + "%"; d.style.top = xy[1] + "%";
      locPlan.appendChild(d);
    });
  }
  function updateTour() {
    var first = stops[0].getBoundingClientRect();
    var last = stops[stops.length - 1].getBoundingClientRect();
    var vh = window.innerHeight;
    var inTour = first.top < vh * 0.6 && last.bottom > vh * 0.4;
    rail.classList.toggle("on", inTour);
    locator.classList.toggle("on", inTour);
    if (!inTour) return;
    var mid = vh * 0.5, best = 0;
    stops.forEach(function (st, i) { if (st.getBoundingClientRect().top < mid) best = i; });
    setActive(best);
  }
  buildRail();
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; updateTour(); }); }
  }, { passive: true });
  window.addEventListener("resize", updateTour);
  document.addEventListener("langchange", function () { buildRail(); var c = current; current = -1; setActive(Math.max(c, 0)); updateTour(); });
  $(".locator-close", locator).addEventListener("click", function () {
    var min = locator.classList.toggle("min");
    this.textContent = min ? "+" : "–";
    this.setAttribute("aria-label", min ? "Show plan" : "Minimise plan");
  });
  updateTour();

  /* ---------- Enquiry form ---------- */
  var form = $("#enquiry-form");
  var success = $("#form-success");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $(".err", form);
    var name = form.name.value.trim(), phone = form.mobile.value.trim(), email = form.email.value.trim();
    var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || phone.replace(/\D/g, "").length < 6 || !okEmail || !form.consent.checked) {
      err.textContent = window.I18N_MSG[lang].required;
      return;
    }
    err.textContent = "";
    var data = new FormData(form);
    data.append("language", lang);
    data.append("page", location.href);
    var done = function () {
      track("generate_lead", { interest: form.interest.value, form: "enquiry" });
      form.style.display = "none";
      success.classList.add("show");
      success.focus();
    };
    var action = form.getAttribute("action");
    if (action) {
      fetch(action, { method: "POST", body: data }).then(done, done);
    } else {
      done();
    }
  });

  /* ---------- Brochure modal ---------- */
  var modal = $("#brochure-modal");
  var BROCHURE = "assets/Elite-Living-Brochure.pdf";
  var modalReturn = null;
  function openModal() { modalReturn = document.activeElement; modal.classList.add("open"); $("input", modal).focus(); }
  function closeModal() { modal.classList.remove("open"); if (modalReturn) modalReturn.focus(); }
  $$("[data-open-brochure]").forEach(function (b) { b.addEventListener("click", openModal); });
  $("[data-close]", modal).addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });
  $("#brochure-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    track("brochure_download", { with_details: !!(f.name.value.trim() || f.email.value.trim()) });
    // TODO: send f.name / f.email to the CRM here if provided
    var a = document.createElement("a");
    a.href = BROCHURE; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
    closeModal();
  });
  $(".text-btn", modal).addEventListener("click", function () { setTimeout(closeModal, 50); });

  /* ---------- Misc ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
