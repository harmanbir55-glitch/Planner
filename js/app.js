/* Becoming Planner — app shell, routes and every page. */
(function () {
  const VERSION = "3";
  const CT = window.CONTENT;
  if (!window.GROWTH) window.GROWTH = { areas: { Read: ["Read 20 pages of a good book"], Learn: ["Learn one new thing today"], Skill: ["Practise your main skill for 20 minutes"] }, words: [["Resilient", "able to recover quickly from difficulty", "A resilient mind treats setbacks as lessons."]], ideas: [["Kaizen", "Small, continuous improvements beat rare big changes."]], habits: [] };
  const START = new Date(2026, 9, 1);
  const $app = document.getElementById("app");
  const $rail = document.getElementById("rail");

  // ---------- dates ----------
  const p2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const ym = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d || 1); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const mondayOf = (d) => add(d, -((d.getDay() + 6) % 7));
  const dayIdx = (d) => Math.round((d - START) / 864e5);
  const mod = (a, n) => ((a % n) + n) % n;
  const pick = (arr, i) => arr[mod(i, arr.length)];
  const fmtLong = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const monthName = (d) => d.toLocaleDateString("en-US", { month: "long" });
  const isoWeek = (d) => { const t = new Date(d); t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7)); const w1 = new Date(t.getFullYear(), 0, 4); return 1 + Math.round(((t - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7); };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- words & pictures ----------
  const ALL_AFFS = Object.values(CT.months).flatMap((m) => m.affs);
  function themeOf(d) {
    const m = CT.months[ym(d)];
    if (m) return m;
    const mo = d.getMonth() + 1;
    return CT.months[mo >= 10 ? `2026-${p2(mo)}` : `2027-${p2(mo)}`];
  }
  function affOf(d) { const m = CT.months[ym(d)]; return m ? m.affs[d.getDate() - 1] : pick(ALL_AFFS, dayIdx(d)); }
  const WHOLE = new Set(["read", "new", "rest", "free", "fly", "rich", "kind", "hard", "page", "still", "sun", "star", "root", "seed"]);
  function motifOf(text, fallback) {
    const t = text.toLowerCase();
    for (const [k, m] of CT.motifKeywords) if (new RegExp("\\b" + k + (WHOLE.has(k) ? "\\b" : "")).test(t)) return m;
    return fallback === "arch" ? "sunrise" : fallback;
  }
  const ALT = ["sunrise", "flowers", "bird", "leaf", "star", "wave", "sprout", "heart", "sun", "book", "mountain", "moon"];
  const seasonOf = (d) => Art.season(d.getMonth() + 1);

  // ---------- data defaults ----------
  const rows = (n, f) => Array.from({ length: n }, f);
  const DEF = {
    day: () => ({ mood: null, water: 0, move: 0, types: {}, bed: "", wake: "", hrs: 7, energy: 0, top3: rows(3, () => ({ t: "", d: false })), todos: [], sched: {}, stars: 0, e1: "", e2: "" }),
    jour: () => ({ wake: "", a1: "", a2: "", routine: {}, ga: "", g: ["", "", ""], ma: "", aff: ["", "", ""], signs: "" }),
    week: () => ({
      big3: rows(3, () => ({ t: "", d: false })), focus: "", forward: "", days: rows(7, () => rows(5, () => ({ t: "", d: false }))), notes: "",
      hab: { names: ["Water goal", "Move my body", "Read 20 pages", "Journal", "Job search task", "Asleep by 11"], c: {} }, gold: {}, refl: ["", "", ""], next: "",
      jobs: rows(10, () => ({ co: "", role: "", date: "", src: "", st: "", fu: "" })), fups: rows(6, () => ({ t: "", by: "", d: false })), rem: rows(6, () => ({ t: "", d: false })), win: "", reach: "",
      dump: [], focusNext: "",
    }),
    month: () => ({ goals: rows(6, () => ({ t: "", d: false })), word: "", feel: "", remember: rows(6, () => ({ d: "", t: "" })), hab: {}, moods: {}, stats: { books: "", workouts: "", water: "", apps: "" }, rating: 0, oneWord: "", wins: "", learned: "", grateful: "", next: "" }),
    settings: () => ({ name: "Harmanbir", habits: ["8 glasses of water", "Move 30 min", "Read 20 pages", "Journal", "Job search task", "No phone in bed", "Asleep by 11"] }),
    vision: () => ({ word: "", perfect: "", areas: rows(8, () => ""), dreams: rows(4, () => ({ want: "", why: "", steps: rows(3, () => ({ t: "", d: false })), by: "" })), feel: {}, prep: {}, checks: {}, tiles: rows(9, () => ({ img: null, cap: "" })), words: [] }),
    grat: () => ({ items: [] }),
    mani: () => ({ aff: "", dots: {}, script: "" }),
    manifest: () => ({ main: "", by: "", why: "", beliefs: rows(3, () => ({ o: "", n: "" })), signs: [] }),
    grow: () => ({ done: {}, learned: "", usedWord: false }),
    reading: () => ({ goal: 24, cur: { title: "", author: "", page: 0, total: 300 }, books: [], bingo: {}, tbr: [], nextId: 1 }),
  };
  const doc = (key) => Store.doc(key, DEF[key.split(":")[0]] || {});
  function getP(o, path) { return path.split(".").reduce((a, k) => (a == null ? a : a[k]), o); }
  function setP(o, path, v) {
    const ks = path.split("."); let a = o;
    for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[ks[i]]; }
    a[ks[ks.length - 1]] = v;
  }

  // ---------- template helpers ----------
  const B = (k, p) => `data-doc="${k}" data-path="${p}"`;
  const inp = (k, p, ph = "", cls = "lineinput", type = "text", label) => `<input class="${cls}" type="${type}" ${B(k, p)} value="${esc(getP(doc(k), p))}" placeholder="${esc(ph)}" aria-label="${esc(label || ph || p)}">`;
  const ta = (k, p, ph = "", rows = 3, label) => `<textarea class="lined" rows="${rows}" ${B(k, p)} placeholder="${esc(ph)}" aria-label="${esc(label || ph || p)}">${esc(getP(doc(k), p))}</textarea>`;
  const chk = (k, p, label, round) => `<button type="button" class="chk ${round ? "round" : ""}" data-act="toggle" ${B(k, p)} aria-pressed="${!!getP(doc(k), p)}" aria-label="${esc(label)}"><span>${Art.check}</span></button>`;
  const item = (k, base, ph, label) => `<div class="item ${getP(doc(k), base + ".d") ? "done" : ""}">${chk(k, base + ".d", "Done: " + (label || ph))}${inp(k, base + ".t", ph, "lineinput", "text", label || ph)}</div>`;
  const head = (eyebrow, title, sub, art, extra = "") => `<div class="head"><div style="min-width:0"><p class="eyebrow">${eyebrow}</p><h1 class="title">${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}${extra}</div>${art ? `<div class="art">${art}</div>` : ""}</div>`;
  const banner = (label, text) => `<div class="banner"><div class="label">${label}</div><p>${esc(text)}</p>${Art.sparkle}</div>`;
  const pills = (items, cur) => `<nav class="pills" aria-label="Related pages">${items.map(([l, h]) => `<a class="pill ${h === cur ? "on" : ""}" href="${h}">${l}</a>`).join("")}</nav>`;
  const arrow = (dir) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F5B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}"/></svg>`;
  const starRow = (k, p, n, size = 30, fill = "#F2B888", stroke = "#DE8644") => `<div class="stars">${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="starbtn" data-act="set" ${B(k, p)} data-val="${v}" data-same="0" aria-label="${v} of 5 stars" aria-pressed="${v <= n}">${Art.starIcon(size, v <= n ? fill : "none", stroke)}</button>`).join("")}</div>`;
  const foot = (t) => `<p class="foot">${esc(t)}</p>`;

  // ---------- routing ----------
  function route() {
    const parts = (location.hash || "#/").slice(2).split("/").filter(Boolean);
    const t = today();
    const resolveDay = (s) => (!s || s === "today" ? t : parse(s));
    switch (parts[0]) {
      case "day": return { name: "day", d: resolveDay(parts[1]), tab: "day" };
      case "journal": return { name: "journal", d: resolveDay(parts[1]), tab: "journal" };
      case "week": { const mon = mondayOf(!parts[1] || parts[1] === "this" ? t : parse(parts[1])); const sub = parts[2] || "plan"; return { name: "week", mon, sub, tab: sub === "jobs" ? "jobs" : "week" }; }
      case "month": { const d = !parts[1] || parts[1] === "this" ? t : parse(parts[1] + "-01"); return { name: "month", d: new Date(d.getFullYear(), d.getMonth(), 1), sub: parts[2] || "cal", tab: "month" }; }
      case "gratitude": return { name: "gratitude", d: resolveDay(parts[1]), tab: "gratitude" };
      case "manifest": return { name: "manifest", d: resolveDay(parts[1]), tab: "manifest" };
      case "growth": return { name: "growth", d: resolveDay(parts[1]), tab: "growth" };
      case "year": return { name: "year", tab: "month" };
      case "vision": return { name: "vision", n: +(parts[1] || 1), tab: "vision" };
      case "reading": return { name: "reading", tab: "reading" };
      case "past": return { name: "past", tab: "past" };
      case "more": return { name: "more", tab: "more" };
      case "reset": return { name: "reset", tab: "more" };
      default: return { name: "home", tab: "home" };
    }
  }
  const TABS = [["home", "Home", "#/"], ["day", "Today", "#/day/today"], ["journal", "Journal", "#/journal/today"], ["gratitude", "Gratitude", "#/gratitude/today"], ["manifest", "Manifest", "#/manifest/today"], ["growth", "Growth", "#/growth/today"], ["week", "Week", "#/week/this/plan"], ["jobs", "Jobs", "#/week/this/jobs"], ["month", "Month", "#/month/this"], ["vision", "Vision", "#/vision/1"], ["reading", "Reading", "#/reading"], ["past", "Past", "#/past"], ["more", "More", "#/more"]];

  // ---------- ui state that isn't saved ----------
  const UI = { pastFilter: "all", pastQuery: "", sel: null, newStars: 0, newColor: 0, armed: null };
  const timer = { mode: "focus", end: 0, left: 25 * 60, running: false, iv: null };

  // ================= PAGES =================
  function pageHome() {
    const t = today(), s = Store.doc("settings", DEF.settings);
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const th = themeOf(t);
    let streak = 0, d = t;
    if (!Store.has("day:" + ymd(d)) && !Store.has("jour:" + ymd(d))) d = add(d, -1);
    while (Store.has("day:" + ymd(d)) || Store.has("jour:" + ymd(d))) { streak++; d = add(d, -1); }
    const S = stats(new Date(t.getFullYear(), t.getMonth(), 1), t);
    const tiles = [
      ["Today's plan", "Mood, water, to-dos and schedule", "#/day/today"], ["Morning journal", "Two prompts and your Pencil page", "#/journal/today"],
      ["Gratitude", S.joys + " joys in this month's jar", "#/gratitude/today"], ["Manifest", "3·6·9, scripting and signs", "#/manifest/today"],
      ["Growth", "A word, an idea and 3 small moves", "#/growth/today"], ["This week", "Plan and a review that fills itself", "#/week/this/plan"],
      ["Job search", S.apps + " applications this month", "#/week/this/jobs"], ["This month", th.theme + " · numbers and achievements", "#/month/this/review"],
      ["Vision board", "Dream it, plan it, build it", "#/vision/1"], ["Reading nook", "Bookshelf, bingo, to-read", "#/reading"], ["Brain dump", "Clear your mind", "#/week/this/dump"], ["Past entries", "Every page you've written", "#/past"],
    ];
    const ring = "PLAN · DREAM · READ · BLOOM · GROW · ";
    return `<div class="stack">
      <div class="hero">
        <div class="arch-wrap"><div class="arch-line"></div><div class="arch">${Art.scene("sunrise", seasonOf(t), "Sunrise over green hills")}</div>
          <svg class="stamp" viewBox="0 0 150 150" aria-hidden="true"><defs><path id="ringPath" d="M75,75 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0"/></defs><circle cx="75" cy="75" r="72" fill="#3F5B3A"/><circle cx="75" cy="75" r="66" fill="none" stroke="#F6DCC4" stroke-width="1" stroke-dasharray="2 4"/><text font-size="12.5" font-weight="700" letter-spacing="3" fill="#FBF3E6" font-family="DM Sans, sans-serif"><textPath href="#ringPath">${ring}</textPath></text><circle cx="75" cy="75" r="14" fill="#DE8644"/></svg></div>
        <div class="hero-text"><p class="eyebrow">${th.theme} · ${fmtLong(t)}</p>
          <span class="hand" style="font-size:30px">the</span><h1 class="becoming">Becoming</h1><div class="planner-line"><i></i>PLANNER<i></i></div>
          <p class="tagline">slow mornings · soft plans · big dreams · good books</p>
          <p class="greet">${greet}, <span class="hand" style="font-size:30px">${esc(s.name || "friend")}</span></p>
          <div class="row" style="margin-top:12px;justify-content:center"><span class="tag">${streak} day streak</span><span class="tag j">${S.days} days planned this month</span><span class="tag w">${S.growth} growth moves</span></div></div>
      </div>
      ${ritualCard()}
      <div class="g3">${tiles.map(([b, s2, h2]) => `<a class="tile-link" href="${h2}"><b>${b}</b><span>${esc(s2)}</span></a>`).join("")}</div>
      ${foot("She believed she could, so she planned it.")}
      <p class="muted" style="text-align:center;font-size:12px;margin:0">version ${VERSION}</p>
    </div>`;
  }

  function dateBar(base, d) {
    const iso = ymd(d);
    return `<div class="datebar" style="margin-top:14px">
      <a class="circle-btn" href="#/${base}/${ymd(add(d, -1))}" aria-label="Previous day">${arrow(-1)}</a>
      <a class="pill ${iso === ymd(today()) ? "on" : ""}" href="#/${base}/today">Today</a>
      <a class="circle-btn" href="#/${base}/${ymd(add(d, 1))}" aria-label="Next day">${arrow(1)}</a>
      <label class="sr" for="jump">Go to date</label><input id="jump" type="date" value="${iso}" data-go="${base}"></div>`;
  }

  function pageDay(d) {
    const ds = ymd(d), k = "day:" + ds, D = doc(k), i = dayIdx(d);
    const th = themeOf(d), aff = affOf(d);
    const moods = [["great", "Amazing", "#F2B888"], ["happy", "Happy", "#F6DCC4"], ["okay", "Okay", "#DCE4CF"], ["sad", "Sad", "#C9D3C0"], ["tired", "Tired", "#EADFC9"]];
    const C = 2 * Math.PI * 50;
    const [p1, p2] = pick(CT.evening, i);
    const done = D.todos.filter((t) => t.d).length;
    const hours = []; for (let h = 6; h <= 22; h++) hours.push(h);
    const ENERGY = ["Running on empty", "Low", "Steady", "Good", "Unstoppable"];
    return `<div class="stack">
      ${head(`Daily page · ${th.theme}`, fmtLong(d), `${d.getFullYear()} · week ${isoWeek(d)}${ds === ymd(today()) ? " · today" : ""}`, Art.scene(motifOf(aff, th.motif), seasonOf(d), "Picture for today's affirmation"), dateBar("day", d))}
      ${pills([["Journal", "#/journal/" + ds], ["Gratitude", "#/gratitude/" + ds], ["Manifest", "#/manifest/" + ds], ["Growth", "#/growth/" + ds], ["Week plan", `#/week/${ymd(mondayOf(d))}/plan`], ["Job search", `#/week/${ymd(mondayOf(d))}/jobs`], ["Month", `#/month/${ym(d)}`]])}
      ${banner("Today's affirmation", aff)}
      <div class="g2">
        <section class="card"><div class="between"><h2 class="h">How am I feeling?</h2><span class="muted">tap one</span></div>
          <div class="moods">${moods.map(([m, l, c]) => `<button type="button" class="mood" data-act="set" ${B(k, "mood")} data-val='"${m}"' data-same="null" aria-pressed="${D.mood === m}"><span class="ring">${Art.face(m, c)}</span>${l}</button>`).join("")}</div></section>
        <section class="card"><div class="between"><h2 class="h">Water</h2><span class="muted">${D.water} of 8 glasses · ${(D.water * 0.25).toFixed(2)} L</span></div>
          <div class="glasses">${rows(8, (_, j) => `<button type="button" class="glass" data-act="set" ${B(k, "water")} data-val="${j + 1}" data-same="${j}" aria-label="Glass ${j + 1}" aria-pressed="${j < D.water}">${Art.glass(j < D.water)}</button>`).join("")}</div>
          <div class="bar"><i style="width:${(D.water / 8) * 100}%"></i></div><p class="muted" style="margin:8px 0 0">${D.water >= 8 ? "Fully hydrated. Your body thanks you." : 8 - D.water + " more to go."}</p></section>
      </div>
      <div class="g2">
        <section class="card"><div class="row" style="align-items:center;gap:18px;flex-wrap:nowrap">
          <div class="ringwrap"><svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg)"><circle cx="60" cy="60" r="50" fill="none" stroke="#EADFC9" stroke-width="11"/><circle cx="60" cy="60" r="50" fill="none" stroke="#DE8644" stroke-width="11" stroke-linecap="round" stroke-dasharray="${((Math.min(D.move, 30) / 30) * C).toFixed(1)} ${C.toFixed(1)}"/></svg><div class="mid"><b>${D.move}</b><span class="muted">of 30 min</span></div></div>
          <div style="min-width:0;flex:1"><h2 class="h">Movement</h2>
            <div class="row" style="margin-top:8px"><button class="btn ghost" data-act="inc" ${B(k, "move")} data-step="-10" data-min="0">− 10</button><button class="btn" data-act="inc" ${B(k, "move")} data-step="10" data-max="300">+ 10 min</button></div>
            <div class="row" style="margin-top:8px;gap:6px">${["Walk", "Yoga", "Gym", "Run", "Dance", "Stretch"].map((t) => `<button type="button" class="chip" data-act="toggle" ${B(k, "types." + t)} aria-pressed="${!!D.types[t]}">${t}</button>`).join("")}</div></div></div></section>
        <section class="card"><div class="between"><h2 class="h">Sleep</h2>
            <div class="stepper"><button class="circle-btn" data-act="inc" ${B(k, "hrs")} data-step="-0.5" data-min="0" aria-label="Less sleep">−</button><span class="v">${D.hrs} h</span><button class="circle-btn" data-act="inc" ${B(k, "hrs")} data-step="0.5" data-max="16" aria-label="More sleep">+</button></div></div>
          <div class="row" style="margin-top:6px"><label class="muted">Bed ${inp(k, "bed", "", "boxinput", "time", "Bedtime")}</label><label class="muted">Wake ${inp(k, "wake", "", "boxinput", "time", "Wake time")}</label></div>
          <div class="between" style="margin-top:12px"><h2 class="h">Energy</h2><span class="muted">${D.energy ? ENERGY[D.energy - 1] : "tap to rate"}</span></div>
          <div class="bolts">${ENERGY.map((l, j) => `<button type="button" class="bolt" data-act="set" ${B(k, "energy")} data-val="${j + 1}" data-same="0" aria-label="Energy: ${l}" aria-pressed="${j < D.energy}">${Art.bolt(j < D.energy)}</button>`).join("")}</div></section>
      </div>
      <div class="g-wide">
        <div class="stack">
          <section class="card green"><h2 class="h">Top 3 for today</h2>${rows(3, (_, j) => item(k, `top3.${j}`, ["The one thing that matters most", "Second priority", "If there is time"][j])).join("")}</section>
          <section class="card"><div class="between"><h2 class="h">To-do list</h2><span class="muted">${done} of ${D.todos.length} done</span></div>
            <div class="bar orange"><i style="width:${D.todos.length ? (done / D.todos.length) * 100 : 0}%"></i></div>
            ${D.todos.map((t, j) => `<div class="item ${t.d ? "done" : ""}">${chk(k, `todos.${j}.d`, "Done: " + t.t)}${inp(k, `todos.${j}.t`, "", "lineinput", "text", "Task")}<button class="x" data-act="del" ${B(k, "todos")} data-i="${j}" aria-label="Remove task">×</button></div>`).join("")}
            <div class="addrow"><input id="newTodo" class="boxinput" placeholder="Add a task" aria-label="New task" data-enter="addTodo"><button id="addTodo" class="btn" data-act="push" ${B(k, "todos")} data-from="newTodo">Add</button></div></section>
        </div>
        <section class="card sched"><h2 class="h">Schedule</h2>${hours.map((h) => `<div class="item"><span class="t">${h % 12 || 12} ${h < 12 ? "AM" : "PM"}</span>${inp(k, "sched." + h, "", "lineinput", "text", "Plan for " + h + ":00")}</div>`).join("")}</section>
      </div>
      <section class="card green"><div class="between"><div><div class="label">Evening reflection</div><h2 class="h" style="font-style:italic;font-weight:400;font-size:26px;margin-top:4px">Look how far you came today</h2></div>
          <div class="row"><span style="color:#DCE4CF;font-size:14px">Rate my day</span>${starRow(k, "stars", D.stars)}</div></div>
        <div class="g2" style="margin-top:6px"><div><p class="prompt" style="color:#FBF8F1">${Art.starIcon(14, "#F2B888")} ${esc(p1)}</p>${ta(k, "e1", "Every task counts, even the small ones…", 3, p1)}</div>
          <div><p class="prompt" style="color:#FBF8F1">${Art.starIcon(14, "#DE8644")} ${esc(p2)}</p>${ta(k, "e2", "I am proud that I…", 3, p2)}</div></div></section>
      ${foot(pick(ALL_AFFS, i * 7 + 3))}
    </div>`;
  }

  function pageJournal(d) {
    const ds = ymd(d), k = "jour:" + ds, D = doc(k), i = dayIdx(d);
    const th = themeOf(d), aff = affOf(d);
    let jm = pick(ALT, i * 5 + 3); if (jm === motifOf(aff, th.motif)) jm = pick(ALT, i * 5 + 4);
    const q1 = pick(CT.morning, i * 2), q2 = pick(CT.morning, i * 2 + 37);
    const routine = ["Water first", "Made bed", "Stretched", "Sunlight", "No phone 30 min", "Read 10 pages"];
    const g = Store.peek("grat:" + ds), m = Store.peek("mani:" + ds), gr = Store.peek("grow:" + ds);
    const joys = g && g.items ? g.items.length : 0, dots = m && m.dots ? Object.values(m.dots).filter(Boolean).length : 0, moves = gr && gr.done ? Object.values(gr.done).filter(Boolean).length : 0;
    return `<div class="stack">
      ${head("Daily journal · " + fmtLong(d), "Morning pages", null, Art.scene(jm, seasonOf(d), "Journal picture"), `<p class="hand" style="margin:8px 0 0">Today's intention: ${esc(pick(CT.intentions, i))}</p>` + dateBar("journal", d))}
      ${banner("Today's affirmation", aff)}
      <section class="card"><div class="between"><div class="label">Morning journal</div><label class="muted">Woke up at ${inp(k, "wake", "", "boxinput", "time", "Wake-up time")}</label></div>
        <p class="prompt">${esc(q1)}</p>${ta(k, "a1", "", 3, q1)}
        <p class="prompt">${esc(q2)}</p>${ta(k, "a2", "", 3, q2)}
        <div class="row" style="margin-top:12px;gap:6px">${routine.map((r) => `<button type="button" class="chip" data-act="toggle" ${B(k, "routine." + r)} aria-pressed="${!!D.routine[r]}">${r}</button>`).join("")}</div></section>
      <div class="g3">
        <a class="tile-link" href="#/gratitude/${ds}" style="background:var(--peach);border-color:var(--peach)"><b>Gratitude</b><span>${joys ? joys + " joys added today" : "Add a joy to your jar"}</span></a>
        <a class="tile-link" href="#/manifest/${ds}" style="background:var(--sagel);border-color:var(--sagel)"><b>Manifest</b><span>${dots} of 18 affirmations written</span></a>
        <a class="tile-link" href="#/growth/${ds}" style="background:var(--sand);border-color:var(--sand)"><b>Growth</b><span>${moves} of 3 growth moves done</span></a>
      </div>
      <section class="card"><div class="between"><h2 class="h">Write by hand</h2><span class="muted">Apple Pencil page for today</span></div>
        <div data-pad="j-${ds}" data-height="420" data-paper="lines" data-hint="write, sketch or doodle anything"></div></section>
      ${foot(pick(CT.intentions, i + 5))}
    </div>`;
  }

  function pageWeek(mon, sub) {
    const ws = ymd(mon), k = "week:" + ws, D = doc(k), wi = Math.floor((dayIdx(mon) + 6) / 7);
    const sun = add(mon, 6), rng = `${fmtShort(mon)} – ${fmtShort(sun)}`;
    const season = seasonOf(add(mon, 3));
    const TABSW = [["Plan", "plan"], ["Review", "review"], ["Job search", "jobs"], ["Brain dump", "dump"]];
    const top = (eyebrow, title, art) => head(eyebrow, title, `${rng}, ${sun.getFullYear()} · week ${isoWeek(mon)}`, art,
      `<div class="datebar" style="margin-top:14px"><a class="circle-btn" href="#/week/${ymd(add(mon, -7))}/${sub}" aria-label="Previous week">${arrow(-1)}</a><a class="pill ${ws === ymd(mondayOf(today())) ? "on" : ""}" href="#/week/this/${sub}">This week</a><a class="circle-btn" href="#/week/${ymd(add(mon, 7))}/${sub}" aria-label="Next week">${arrow(1)}</a></div>`) +
      pills(TABSW.map(([l, s]) => [l, `#/week/${ws}/${s}`]).concat([["Month", `#/month/${ym(add(mon, 3))}`]]), `#/week/${ws}/${sub}`);
    if (sub === "review") {
      const refl = pick(CT.weeklyRefl, wi);
      const NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const wkS = stats(mon, add(mon, 6));
      const autoGold = (j) => !!(wkS.perDay[j].day || wkS.perDay[j].jour);
      const goldOn = (j) => (D.gold[j] === undefined ? autoGold(j) : !!D.gold[j]);
      const summary = weekSummary(mon, D);
      return `<div class="stack">${top("Weekly review", "Celebrate your week", Art.scene("star", season, "Stars"))}
        ${summary}
        <section class="card"><h2 class="h">Weekly habits</h2><div class="grid-track"><table class="track" style="margin-top:8px"><thead><tr><th></th>${"MTWTFSS".split("").map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>
          ${D.hab.names.map((n, h) => `<tr><td class="lab"><input ${B(k, `hab.names.${h}`)} value="${esc(n)}" aria-label="Habit ${h + 1}"></td>${rows(7, (_, j) => `<td><button class="cell ${h % 2 ? "o" : ""}" style="width:36px;height:36px" data-act="toggle" ${B(k, `hab.c.${h}-${j}`)} aria-pressed="${!!D.hab.c[h + "-" + j]}" aria-label="${esc(n)} day ${j + 1}"></button></td>`).join("")}</tr>`).join("")}
        </tbody></table></div></section>
        <section class="card peach"><div class="between"><h2 class="h">Gold stars</h2><span class="muted" style="color:var(--terra2)">filled in for every day you wrote · tap to change</span></div>
          <div class="row" style="justify-content:space-between;margin-top:10px">${NAMES.map((x, j) => `<button class="starbtn" style="flex-direction:column;height:auto;width:auto;gap:2px" data-act="gold" ${B(k, "gold." + j)} data-auto="${autoGold(j)}" aria-pressed="${goldOn(j)}" aria-label="Gold star ${x}">${Art.starIcon(38, goldOn(j) ? "#DE8644" : "#FBF3E6", "#A4511A")}<span style="font-size:11px;font-weight:700;color:var(--terra2)">${x}</span></button>`).join("")}</div></section>
        <section class="card green"><div class="label">Weekly reflection</div><h2 class="h" style="font-style:italic;font-weight:400;font-size:26px;margin-top:4px">Celebrate what you did this week</h2>
          <div class="g3" style="margin-top:6px">${refl.map((q, j) => `<div><p class="prompt" style="color:#FBF8F1">${Art.starIcon(14, ["#F2B888", "#DE8644", "#C3CEAC"][j])} ${esc(q)}</p>${ta(k, "refl." + j, "", 4, q)}</div>`).join("")}</div></section>
        <section class="card sage"><h2 class="h">A note to next-week me</h2>${ta(k, "next", "Next week, remember…", 3)}</section>
        ${foot(pick(CT.weeklyAffs, wi))}</div>`;
    }
    if (sub === "jobs") {
      const sent = D.jobs.filter((j) => (j.co || j.role).trim()).length;
      let total = 0; Store.keys("week:").forEach((wk) => { const w = Store.peek(wk); if (w && w.jobs) total += w.jobs.filter((j) => (j.co || j.role || "").trim()).length; });
      const ST = [["A", "Applied"], ["I", "Interview"], ["O", "Offer"], ["R", "Rejected"]];
      return `<div class="stack">${top("Job search · weekly", "Dream job, loading", Art.scene(pick(["mountain", "star", "bird", "sunrise"], wi), season, "Career picture"))}
        ${banner("Career affirmation", pick(CT.jobAffs, wi))}
        <section class="card"><div class="between"><h2 class="h">Applications this week</h2><span class="muted">${total} sent since you started</span></div>
          <div class="row" style="margin-top:10px;gap:6px">${rows(10, (_, j) => `<span style="width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid ${j < 5 ? "#DE8644" : "#9DB08A"};background:${j < sent ? (j < 5 ? "#DE8644" : "#9DB08A") : "transparent"};color:${j < sent ? "#fff" : "#626656"}">${j + 1}</span>`).join("")}</div>
          <p class="hand" style="margin:10px 0 0">${sent >= 10 ? "Ten sent. That's real dedication." : sent >= 5 ? "Goal reached. Anything more is a bonus." : esc(pick(CT.jobTips, wi))}</p></section>
        <section class="card"><h2 class="h">Applications</h2><div class="grid-track"><table class="jobs" style="margin-top:8px"><thead><tr><th>#</th><th>Company</th><th>Role</th><th>Applied</th><th>Source</th><th>Status</th><th>Follow up</th></tr></thead><tbody>
          ${D.jobs.map((j, r) => `<tr><td style="font-weight:700;color:var(--terra);text-align:center">${r + 1}</td><td>${inp(k, `jobs.${r}.co`, "", "", "text", "Company " + (r + 1))}</td><td>${inp(k, `jobs.${r}.role`, "", "", "text", "Role " + (r + 1))}</td><td style="width:92px">${inp(k, `jobs.${r}.date`, "dd/mm", "", "text", "Date applied")}</td><td style="width:96px">${inp(k, `jobs.${r}.src`, "LinkedIn…", "", "text", "Source")}</td>
            <td><div class="st">${ST.map(([v, l]) => `<button type="button" data-v="${v}" data-act="set" ${B(k, `jobs.${r}.st`)} data-val='"${v}"' data-same='""' aria-pressed="${j.st === v}" aria-label="${l}">${v}</button>`).join("")}</div></td><td style="width:100px">${inp(k, `jobs.${r}.fu`, "date", "", "text", "Follow-up date")}</td></tr>`).join("")}
          </tbody></table></div><p class="muted" style="margin:10px 0 0">A applied · I interview · O offer · R rejected. Every no brings you closer to yes.</p></section>
        <div class="g2">
          <section class="card sage"><div class="between"><h2 class="h">Follow-ups</h2><span class="muted">who · by when · done</span></div>
            ${D.fups.map((f, r) => `<div class="item ${f.d ? "done" : ""}">${inp(k, `fups.${r}.t`, "Who / where", "lineinput", "text", "Follow-up " + (r + 1))}<input class="lineinput" style="width:96px;flex:none" ${B(k, `fups.${r}.by`)} value="${esc(f.by)}" placeholder="by…" aria-label="Follow up by">${chk(k, `fups.${r}.d`, "Followed up")}</div>`).join("")}</section>
          <section class="card peach"><div class="between"><h2 class="h">Reminders</h2><span class="muted" style="color:var(--terra2)">interviews · deadlines · prep</span></div>
            ${D.rem.map((_, r) => item(k, `rem.${r}`, "Reminder")).join("")}</section>
        </div>
        <section class="card green"><div class="g2"><div><h2 class="h">This week's win</h2>${inp(k, "win", "Something I'm proud of in my search", "lineinput")}</div><div><h2 class="h">People I'll reach out to</h2>${inp(k, "reach", "Names, companies, alumni…", "lineinput")}</div></div></section>
        ${foot("I am qualified, capable and ready.")}</div>`;
    }
    if (sub === "dump") {
      const P = rows(4, (_, j) => pick(CT.brainDump, wi * 4 + j));
      const buckets = [["now", "Do now", "small, urgent, under 10 minutes", "peach"], ["later", "Later", "give it a day on the calendar", "sage"], ["go", "Let it go", "not mine to carry", "sand"]];
      const total = timer.mode === "focus" ? 25 * 60 : 5 * 60, left = timerLeft();
      const C = 2 * Math.PI * 60;
      return `<div class="stack">${top("Brain dump", "Clear mind, full focus", Art.scene(pick(["wave", "leaf", "moon", "sprout"], wi), season, "Calm picture"))}
        <section class="card green"><div class="label">Prompts to get you started</div>${P.map((q) => `<p style="margin:10px 0 0;display:flex;gap:8px;align-items:baseline">${Art.starIcon(13, "#F2B888")}<span>${esc(q)}</span></p>`).join("")}</section>
        <section class="card"><div data-pad="bd-${ws}" data-height="480" data-hint="write it all out — nothing is too small"></div></section>
        <section class="card"><div class="between"><h2 class="h">Now sort it</h2><span class="muted">type each thought, then choose where it goes</span></div>
          <div class="addrow"><input id="newDump" class="boxinput" placeholder="Call the bank, finish the CV…" aria-label="Thought to sort" data-enter="addDump"><button id="addDump" class="btn" data-act="push" ${B(k, "dump")} data-from="newDump" data-extra='{"b":"now"}'>Add</button></div>
          <div class="g3" style="margin-top:14px">${buckets.map(([b, t, hint, cls]) => `<div class="card ${cls}" style="padding:14px"><div class="between"><h3 style="margin:0;font-family:var(--display);font-style:italic;font-weight:400;font-size:22px;color:var(--forest)">${t}</h3><b>${D.dump.filter((x) => x.b === b).length}</b></div><div class="muted">${hint}</div>
            ${D.dump.map((x, j) => (x.b !== b ? "" : `<div style="background:var(--card);border-radius:12px;padding:10px;margin-top:8px"><div style="${b === "go" ? "text-decoration:line-through;color:var(--muted)" : ""}">${esc(x.t)}</div><div class="row" style="gap:4px;margin-top:6px">${buckets.filter((o) => o[0] !== b).map((o) => `<button class="chip" style="min-height:34px;font-size:12px" data-act="set" ${B(k, `dump.${j}.b`)} data-val='"${o[0]}"'>→ ${o[1]}</button>`).join("")}<button class="chip" style="min-height:34px;font-size:12px" data-act="del" ${B(k, "dump")} data-i="${j}">remove</button></div></div>`)).join("")}</div>`).join("")}</div></section>
        <div class="g-wide">
          <section class="card"><h2 class="h">The one thing I'll focus on next</h2>${inp(k, "focusNext", "Just one. The rest can wait.", "big-input")}
            <p class="hand" style="margin:14px 0 0">${esc(pick(CT.weeklyAffs, wi + 7))}</p></section>
          <section class="card peach" style="text-align:center"><h2 class="h">Focus timer</h2>
            <div class="ringwrap" style="width:150px;height:150px;margin:10px auto 0"><svg width="150" height="150" viewBox="0 0 150 150" style="transform:rotate(-90deg)"><circle cx="75" cy="75" r="60" fill="none" stroke="#E9BE98" stroke-width="10"/><circle id="tRing" cx="75" cy="75" r="60" fill="none" stroke="#3F5B3A" stroke-width="10" stroke-linecap="round" stroke-dasharray="${((1 - left / total) * C).toFixed(1)} ${C.toFixed(1)}"/></svg>
              <div class="mid" role="timer"><b id="tLabel">${fmtTime(left)}</b><span class="muted" style="color:var(--terra2);font-weight:700">${timer.mode === "focus" ? "DEEP FOCUS" : "BREATHE"}</span></div></div>
            <div class="row" style="justify-content:center;margin-top:10px"><button class="btn dark" data-act="timerGo">${timer.running ? "Pause" : "Start"}</button><button class="btn ghost" data-act="timerReset">Reset</button></div>
            <div class="row" style="justify-content:center;margin-top:8px"><button class="chip" data-act="timerMode" data-m="focus" aria-pressed="${timer.mode === "focus"}">Focus 25</button><button class="chip" data-act="timerMode" data-m="break" aria-pressed="${timer.mode === "break"}">Break 5</button></div></section>
        </div></div>`;
    }
    // plan
    return `<div class="stack">${top("Weekly plan", "Week of " + rng, Art.scene(motifOf(pick(CT.weeklyAffs, wi), pick(ALT, wi)), season, "Weekly picture"))}
      ${banner("This week's affirmation", pick(CT.weeklyAffs, wi))}
      <div class="g3">
        <section class="card green"><h2 class="h">Big 3 this week</h2>${rows(3, (_, j) => item(k, `big3.${j}`, "Priority " + (j + 1))).join("")}</section>
        <section class="card"><h2 class="h">Focus word</h2>${inp(k, "focus", "e.g. Consistent", "big-input")}<p class="hand" style="margin:12px 0 0;font-size:20px">Discipline is choosing what I want most over what I want now.</p></section>
        <section class="card peach"><h2 class="h">Looking forward to</h2>${ta(k, "forward", "", 3)}</section>
      </div>
      <div class="g2">${rows(7, (_, j) => { const dd = add(mon, j), isT = ymd(dd) === ymd(today()); return `<section class="card" style="${isT ? "border:1.5px solid var(--orange)" : ""}"><div class="between"><a href="#/day/${ymd(dd)}" style="text-decoration:none"><h2 class="h" style="font-style:italic;font-weight:400;font-size:22px">${dd.toLocaleDateString("en-US", { weekday: "long" })}</h2></a><span class="label" style="color:${isT ? "var(--terra)" : "var(--muted)"}">${fmtShort(dd)}</span></div>${rows(5, (_, r) => item(k, `days.${j}.${r}`, "")).join("")}</section>`; }).join("")}
        <section class="card sage"><h2 class="h" style="font-style:italic;font-weight:400;font-size:22px">Notes</h2>${ta(k, "notes", "", 5)}</section></div>
      ${foot("Plan with intention, rest without guilt.")}</div>`;
  }

  function hasDay(d) { return Store.has("day:" + ymd(d)); }
  function hasJour(d) { return Store.has("jour:" + ymd(d)); }

  function pageMonth(m1, sub) {
    const key = ym(m1), k = "month:" + key, D = doc(k), th = themeOf(m1), s = Store.doc("settings", DEF.settings);
    const dim = new Date(m1.getFullYear(), m1.getMonth() + 1, 0).getDate();
    const nav = `<div class="datebar" style="margin-top:14px"><a class="circle-btn" href="#/month/${ym(new Date(m1.getFullYear(), m1.getMonth() - 1, 1))}/${sub}" aria-label="Previous month">${arrow(-1)}</a><a class="pill ${key === ym(today()) ? "on" : ""}" href="#/month/this/${sub}">This month</a><a class="circle-btn" href="#/month/${ym(new Date(m1.getFullYear(), m1.getMonth() + 1, 1))}/${sub}" aria-label="Next month">${arrow(1)}</a></div>`;
    const top = (eyebrow) => head(eyebrow, `${monthName(m1)} <span style="font-style:normal;font-size:.5em;color:var(--terra)">${m1.getFullYear()}</span>`, null, Art.scene(th.motif === "arch" ? "sunrise" : th.motif, seasonOf(m1), th.theme), `<p class="hand" style="margin:8px 0 0">${esc(th.intent)}</p>` + nav) +
      pills([["Calendar", `#/month/${key}/cal`], ["Habits & moods", `#/month/${key}/tracker`], ["Month review", `#/month/${key}/review`], ["Year", "#/year"]], `#/month/${key}/${sub}`);
    if (sub === "tracker") {
      const MOOD = [["Amazing", "#DE8644"], ["Happy", "#F2B888"], ["Okay", "#C3CEAC"], ["Low", "#6F8A62"], ["Tired", "#B7AE99"]];
      let checks = 0;
      const body = s.habits.map((n, h) => `<tr><td class="lab"><input data-doc="settings" data-path="habits.${h}" value="${esc(n)}" aria-label="Habit ${h + 1}"></td>${rows(dim, (_, j) => { const on = !!(D.hab[h] || {})[j + 1]; if (on) checks++; return `<td><button class="cell ${h % 2 ? "o" : ""}" data-act="toggle" ${B(k, `hab.${h}.${j + 1}`)} aria-pressed="${on}" aria-label="${esc(n)}, day ${j + 1}"></button></td>`; }).join("")}</tr>`).join("");
      return `<div class="stack">${top("Habit & mood tracker · " + th.theme)}
        <section class="card"><div class="between"><h2 class="h">Habits</h2><span class="muted">${checks} check-ins · tap a habit name to rename it</span></div>
          <div class="grid-track"><table class="track" style="margin-top:8px"><thead><tr><th></th>${rows(dim, (_, j) => `<th>${j + 1}</th>`).join("")}</tr></thead><tbody>${body}
          <tr><td class="lab" style="font-weight:700;color:var(--terra);font-size:13px;padding-top:10px">Mood pixels</td>${rows(dim, (_, j) => { const v = D.moods[j + 1] || 0; return `<td style="padding-top:10px"><button class="cell" style="background:${v ? MOOD[v - 1][1] : "var(--card)"}" data-act="cycle" ${B(k, `moods.${j + 1}`)} data-n="6" aria-label="Mood day ${j + 1}: ${v ? MOOD[v - 1][0] : "not set"}"></button></td>`; }).join("")}</tr></tbody></table></div>
          <div class="row" style="margin-top:12px;font-size:13px;color:var(--muted)">Tap a pixel to cycle: ${MOOD.map(([l, c]) => `<span class="row" style="gap:6px"><i style="width:12px;height:12px;border-radius:3px;background:${c};display:inline-block"></i>${l}</span>`).join("")}</div></section>
        ${(() => { const S = stats(m1, new Date(m1.getFullYear(), m1.getMonth() + 1, 0)); return `<div class="g4">${stat(S.books, "books", "finished this month", "peach")}${stat(S.days, "days", "planned", "sage")}${stat(S.water.filter((w) => w >= 8).length, "days", "hit the water goal", "sand")}${stat(S.apps, "sent", "job applications", "peach")}</div>`; })()}
        ${banner("This month's intention", th.intent)}</div>`;
    }
    if (sub === "review") {
      return `<div class="stack">${top("Month in review · " + th.theme)}
        ${monthNumbers(m1)}
        <section class="card peach"><div class="between"><h2 class="h">Rate this month</h2>${starRow(k, "rating", D.rating, 34, "#DE8644", "#A4511A")}<div style="min-width:180px">${inp(k, "oneWord", "One word for it", "lineinput")}</div></div></section>
        <div class="g2">${[["wins", "My proudest moment", ""], ["learned", "A lesson I'm keeping", "sage"], ["grateful", "Who I'm grateful for", "sage"], ["next", "Next month I will…", ""]].map(([p, l, c]) => `<section class="card ${c}"><h2 class="h">${l}</h2>${ta(k, p, "", 3, l)}</section>`).join("")}</div>
        ${banner("Carry this forward", "I am proud of this month and ready for the next one.")}</div>`;
    }
    const first = (m1.getDay() + 6) % 7;
    const cells = [];
    for (let j = 0; j < first; j++) cells.push(`<div class="blank"></div>`);
    for (let dd = 1; dd <= dim; dd++) {
      const dt = new Date(m1.getFullYear(), m1.getMonth(), dd);
      cells.push(`<a class="c ${ymd(dt) === ymd(today()) ? "today" : ""}" href="#/day/${ymd(dt)}" aria-label="${fmtLong(dt)}">${dd}<span class="marks">${hasDay(dt) ? "<i></i>" : ""}${hasJour(dt) ? '<i class="j"></i>' : ""}</span></a>`);
    }
    return `<div class="stack">${top("Monthly · theme: " + th.theme)}
      <section class="card"><div class="cal">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => `<div class="wd">${w.toUpperCase()}</div>`).join("")}${cells.join("")}</div>
        <p class="muted" style="margin:12px 0 0">Tap a date to open that day. <span style="color:var(--sage2)">●</span> planner written <span style="color:var(--orange)">●</span> journal written</p></section>
      <div class="g3">
        <section class="card"><h2 class="h">Monthly goals</h2>${D.goals.map((_, j) => item(k, `goals.${j}`, "Goal " + (j + 1))).join("")}</section>
        <section class="card green"><h2 class="h">My word this month</h2>${inp(k, "word", "e.g. Discipline", "big-input")}<p style="margin:14px 0 0;color:#DCE4CF;font-size:14px">This month I will feel…</p>${ta(k, "feel", "", 3)}</section>
        <section class="card peach"><h2 class="h">Don't forget</h2>${D.remember.map((_, j) => `<div class="item"><input class="lineinput" style="width:64px;flex:none;font-weight:700;color:var(--terra2)" ${B(k, `remember.${j}.d`)} value="${esc(D.remember[j].d)}" placeholder="date" aria-label="Reminder date">${inp(k, `remember.${j}.t`, "", "lineinput", "text", "Reminder")}</div>`).join("")}</section>
      </div></div>`;
  }

  function pageYear() {
    const t = today();
    const months = []; let m = new Date(2026, 9, 1);
    const last = new Date(Math.max(new Date(2027, 9, 1), new Date(t.getFullYear(), t.getMonth(), 1)));
    while (m <= last) { months.push(m); m = new Date(m.getFullYear(), m.getMonth() + 1, 1); }
    return `<div class="stack">${head("Year at a glance", "Your year of becoming", "Tap any date to open it. Green dates have entries.", Art.scene("star", seasonOf(t), "Stars"))}
      <div class="g4">${months.map((mm) => {
        const dim = new Date(mm.getFullYear(), mm.getMonth() + 1, 0).getDate(), first = (mm.getDay() + 6) % 7;
        let c = rows(first, () => "<span></span>").join("");
        for (let dd = 1; dd <= dim; dd++) { const dt = new Date(mm.getFullYear(), mm.getMonth(), dd); c += `<a href="#/day/${ymd(dt)}" class="${hasDay(dt) || hasJour(dt) ? "has" : ""} ${ymd(dt) === ymd(t) ? "today" : ""}" aria-label="${fmtLong(dt)}">${dd}</a>`; }
        return `<section class="card" style="padding:14px"><a href="#/month/${ym(mm)}" style="text-decoration:none"><div class="between"><h2 class="h" style="font-size:16px">${monthName(mm)}</h2><span class="label">${mm.getFullYear()}</span></div><div class="muted" style="font-size:12px;font-style:italic">${themeOf(mm).theme}</div></a>
          <div class="mini" style="margin-top:8px">${"MTWTFSS".split("").map((x) => `<span style="font-weight:700;color:var(--muted);font-size:10px">${x}</span>`).join("")}${c}</div></section>`;
      }).join("")}</div></div>`;
  }

  function pageVision(n) {
    const k = "vision", D = doc(k);
    const nav = pills([["I · Dream it", "#/vision/1"], ["II · Plan it", "#/vision/2"], ["III · Build your board", "#/vision/3"]], "#/vision/" + n);
    if (n === 2) {
      const FEEL = ["Free", "Calm", "Proud", "Abundant", "Loved", "Confident", "Joyful", "Grounded", "Inspired", "Strong", "Safe", "Radiant"];
      const PREP = ["I chose my top 3–4 life areas", "I know how I want to feel", "I collected photos with that feeling", "I picked 3–5 power words", "I know where I'll see it every day"];
      const mths = []; for (let i = 0; i < 12; i++) mths.push(new Date(2026, 9 + i, 1));
      return `<div class="stack">${head("Vision board · part two", "A dream with a plan", "Four big dreams. A reason, three first steps and a date for each.", Art.scene("sprout", "spring", "Sprout"))}${nav}
        <div class="g2">${D.dreams.map((dr, j) => `<section class="card" style="border-top:6px solid ${["#DE8644", "#6F8A62", "#F2B888", "#9DB08A"][j]}"><p class="hand" style="margin:0;font-size:26px">Dream ${j + 1}</p>
          ${inp(k, `dreams.${j}.want`, "I want to…", "lineinput")}${inp(k, `dreams.${j}.why`, "Because…", "lineinput")}<div class="label" style="margin-top:12px;color:var(--muted)">First steps</div>
          ${rows(3, (_, s2) => item(k, `dreams.${j}.steps.${s2}`, "Step " + (s2 + 1))).join("")}<div class="row" style="margin-top:8px"><span class="label">By when</span>${inp(k, `dreams.${j}.by`, "", "boxinput", "date", "Target date")}</div></section>`).join("")}</div>
        <section class="card green"><h2 class="h">How will I feel when it's real?</h2><div class="row" style="margin-top:10px;gap:8px">${FEEL.map((f) => `<button class="chip" data-act="toggle" ${B(k, "feel." + f)} aria-pressed="${!!D.feel[f]}">${f}</button>`).join("")}</div></section>
        <div class="g2"><section class="card peach"><h2 class="h">Before you build your board</h2>${PREP.map((p, j) => `<div class="item ${D.prep[j] ? "done" : ""}">${chk(k, "prep." + j, p, true)}<span class="txt">${p}</span></div>`).join("")}</section>
          <section class="card"><h2 class="h">Monthly vision check-in</h2><p class="muted">Did I look at my board and take one step?</p><div class="g4" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:6px">${mths.map((mm) => `<button class="chip" style="border-radius:12px;min-height:46px" data-act="toggle" ${B(k, "checks." + ym(mm))} aria-pressed="${!!D.checks[ym(mm)]}">${mm.toLocaleDateString("en-US", { month: "short" })}</button>`).join("")}</div></section></div></div>`;
    }
    if (n === 3) {
      const AREAS = [["Dream home", 2, "peach"], ["Career", 1, "sage"], ["Travel", 1, "sand"], ["Health", 1, "sage"], ["Love", 2, "peach"], ["Money", 1, "sand"], ["Growth", 1, "peach"], ["Joy", 1, "sage"], ["Me, glowing", 2, "sand"]];
      const SUG = ["Abundant", "Disciplined", "Healthy", "Brave", "Peaceful", "Successful", "Loved", "Free", "Radiant", "Unstoppable"];
      const FONTS = ["font-family:var(--display);font-style:italic;font-size:32px;color:#F2B888", "font-family:var(--hand);font-size:36px", "font-size:19px;color:#C3CEAC;font-weight:700;letter-spacing:.1em", "font-family:var(--display);font-size:25px"];
      return `<div class="stack">${head("Vision board · part three", `My ${today().getFullYear() + 1} vision`, "Tap a frame to add a photo from your iPad, give it a caption, then doodle below.", Art.scene("star", "summer", "Stars"))}${nav}
        <div class="collage">${AREAS.map(([a, span, c], j) => { const t = D.tiles[j], src = t.img ? Store.peek("img:" + t.img) : null; return `<div class="tile card ${c}" style="padding:0;grid-row:span ${span}">
          <label>${src ? `<img src="${src}" alt="${esc(a)} vision photo">` : `<span><span style="display:block;font-family:var(--display);font-style:italic;font-size:19px;color:var(--forest)">${a}</span><span class="muted">tap to add a photo</span></span>`}<input type="file" accept="image/*" class="sr" data-photo="${j}" aria-label="Add a photo for ${esc(a)}"></label>
          <input type="text" ${B(k, `tiles.${j}.cap`)} value="${esc(t.cap)}" placeholder="caption…" aria-label="${esc(a)} caption">
          ${src ? `<button class="x" data-act="delPhoto" data-i="${j}" aria-label="Remove photo">×</button>` : ""}</div>`; }).join("")}</div>
        <section class="card green"><div class="between"><h2 class="h">Power words</h2><span style="color:#DCE4CF;font-size:13px">tap a word to remove it</span></div>
          <div class="words">${D.words.length ? D.words.map((w, j) => `<button style="${FONTS[j % 4]}" data-act="del" ${B(k, "words")} data-i="${j}" aria-label="Remove ${esc(w)}">${esc(w)}</button>`).join("") : `<span class="hand" style="color:var(--sage)">your words will bloom here</span>`}</div>
          <div class="addrow"><input id="newWord" class="boxinput" placeholder="Your own word" aria-label="Power word" data-enter="addWord"><button id="addWord" class="btn" data-act="pushStr" ${B(k, "words")} data-from="newWord">Add</button></div>
          <div class="row" style="margin-top:10px;gap:6px">${SUG.filter((w) => !D.words.includes(w)).map((w) => `<button class="chip" data-act="addStr" ${B(k, "words")} data-v="${w}">+ ${w}</button>`).join("")}</div></section>
        <section class="card"><h2 class="h">Doodle &amp; handwrite</h2><div data-pad="vision" data-height="420" data-hint="sign your board, sketch your dream house, write your why"></div></section>
        ${foot("I see it. I feel it. I am becoming it.")}</div>`;
    }
    return `<div class="stack">${head("Vision board · part one", "Dream without limits", "Answer from the heart, not from what seems possible.", Art.scene("mountain", "spring", "Mountains"))}${nav}
      <div class="g-wide"><section class="card green"><div class="label">My word for this year</div>${inp(k, "word", "Bloom", "big-input")}</section>
        <section class="card peach"><h2 class="h">One year from now, my perfect ordinary day looks like…</h2>${ta(k, "perfect", "", 3)}</section></div>
      <div class="g2">${CT.visionAreas.map(([t, a, b2], j) => `<section class="card"><h2 class="h">${t}</h2><ul class="muted" style="margin:8px 0 0;padding-left:18px"><li>${a}</li><li>${b2}</li></ul>${ta(k, `areas.${j}`, "", 3, t)}</section>`).join("")}</div>
      ${foot("I am allowed to want big, beautiful things.")}</div>`;
  }

  const SPINES = [["#3F5B3A", "#FBF8F1"], ["#DE8644", "#2E1A0A"], ["#9DB08A", "#2E3A2A"], ["#F2B888", "#2E1A0A"], ["#A4511A", "#FBF8F1"]];
  function pageReading() {
    const k = "reading", D = doc(k), n = D.books.length;
    const sel = D.books.find((b) => b.id === UI.sel);
    const H = [118, 104, 126, 110, 122, 100, 128, 112, 120, 106];
    const shelves = rows(Math.max(3, Math.ceil((n + 1) / 10)), (_, r) => `<div class="shelf">${rows(10, (_, c) => { const idx = r * 10 + c, b = D.books[idx]; return b ? `<button class="spine" style="height:${H[idx % 10]}px;background:${SPINES[b.color][0]};color:${SPINES[b.color][1]};${UI.sel === b.id ? "outline:3px solid #2E3A2A" : ""}" data-act="selBook" data-id="${b.id}" aria-label="${esc(b.title)}"><span>${esc(b.title)}</span></button>` : `<button class="spine empty" data-act="focusAdd" aria-label="Empty space. Add a book"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg></button>`; }).join("")}</div><div class="shelfboard"></div>`).join("");
    const si = sel ? D.books.indexOf(sel) : -1;
    return `<div class="stack">${head("Reading nook", "One more chapter", "Every book you finish fills a space on your shelf.", Art.scene("book", seasonOf(today()), "Open book"))}
      <div class="g2">
        <section class="card green"><div class="between"><h2 class="h">My reading goal</h2><div class="stepper"><button class="circle-btn" style="background:transparent;color:#fff" data-act="inc" ${B(k, "goal")} data-step="-1" data-min="1" aria-label="Lower goal">−</button><span style="color:#fff">${D.goal} books</span><button class="circle-btn" style="background:transparent;color:#fff" data-act="inc" ${B(k, "goal")} data-step="1" data-max="300" aria-label="Raise goal">+</button></div></div>
          <p style="margin:12px 0 0"><b style="font-family:var(--display);font-size:56px;color:var(--apricot)">${n}</b> <span style="color:#DCE4CF">of ${D.goal} read</span></p>
          <div class="bar" style="background:var(--forest2)"><i style="width:${Math.min(100, (n / D.goal) * 100)}%;background:var(--apricot)"></i></div>
          <p class="hand" style="color:var(--peach);margin:10px 0 0">${n >= D.goal ? "Goal reached, you incredible reader!" : D.goal - n + " books to go. One page at a time."}</p></section>
        <section class="card"><h2 class="h">Currently reading</h2>${inp(k, "cur.title", "Book title", "big-input")}${inp(k, "cur.author", "Author", "lineinput")}
          <div class="row" style="margin-top:10px"><button class="btn ghost" data-act="inc" ${B(k, "cur.page")} data-step="-10" data-min="0">−10</button><b style="font-size:20px;color:var(--forest)">${D.cur.page}</b><span class="muted">of</span>${inp(k, "cur.total", "", "boxinput", "number", "Total pages")}<button class="btn" data-act="inc" ${B(k, "cur.page")} data-step="10" data-max="5000">+10</button></div>
          <div class="bar orange"><i style="width:${Math.min(100, (D.cur.page / Math.max(1, +D.cur.total || 1)) * 100)}%"></i></div></section>
      </div>
      <section class="card"><div class="between"><h2 class="h">My bookshelf</h2><span class="muted">${n ? n + " books on the shelf" : "Every empty book is waiting for your next read"}</span></div><div style="margin-top:14px">${shelves}</div>
        ${sel ? `<div class="card peach" style="margin-top:6px"><div class="between"><div><b style="font-family:var(--display);font-style:italic;font-size:22px;color:var(--forest)">${esc(sel.title)}</b><div class="muted">${esc(sel.author || "Unknown author")} · finished ${esc(sel.date || "")}</div></div>
          <div class="row">${starRow(k, `books.${si}.stars`, sel.stars, 26, "#DE8644", "#A4511A")}<button class="btn ghost" data-act="delBook" data-id="${sel.id}">${UI.armed === "book" + sel.id ? "Tap again to remove" : "Remove"}</button><button class="btn dark" data-act="selBook" data-id="${sel.id}">Close</button></div></div>
          <p class="prompt">${esc(pick(CT.bookPrompts, sel.id))}</p>${ta(k, `books.${si}.review`, "", 3)}
          <p class="prompt">Lines worth keeping</p>${ta(k, `books.${si}.lines`, "", 2)}</div>` : ""}
        <div class="card sand" style="margin-top:6px"><div class="label">I finished a book!</div>
          <div class="g2" style="margin-top:8px"><input id="bkTitle" class="boxinput" placeholder="Title" aria-label="Book title" data-enter="addBook"><input id="bkAuthor" class="boxinput" placeholder="Author" aria-label="Author" data-enter="addBook"></div>
          <div class="row" style="margin-top:10px;justify-content:space-between"><div class="row"><span class="muted">Rating</span><div class="stars">${[1, 2, 3, 4, 5].map((v) => `<button class="starbtn" data-act="newStars" data-v="${v}" aria-label="${v} stars" aria-pressed="${v <= UI.newStars}">${Art.starIcon(26, v <= UI.newStars ? "#DE8644" : "none", "#A4511A")}</button>`).join("")}</div>
            <span class="muted">Spine</span>${SPINES.map((s2, j) => `<button class="starbtn" data-act="newColor" data-v="${j}" aria-pressed="${UI.newColor === j}" aria-label="Spine colour ${j + 1}"><i style="width:18px;height:30px;border-radius:3px;background:${s2[0]};display:block;box-shadow:0 0 0 2px var(--sand),0 0 0 4px ${UI.newColor === j ? "#2E3A2A" : "transparent"}"></i></button>`).join("")}</div>
            <button id="addBook" class="btn dark" data-act="addBook">Put it on my shelf</button></div></div></section>
      <section class="card"><div class="between"><h2 class="h">Reading bingo</h2><span class="muted">${Object.values(D.bingo).filter(Boolean).length} of 16</span></div><div class="bingo" style="margin-top:12px">${CT.bingo.map((q, j) => `<button data-act="toggle" ${B(k, "bingo." + j)} aria-pressed="${!!D.bingo[j]}">${q}</button>`).join("")}</div></section>
      <section class="card"><h2 class="h">Want to read</h2>${D.tbr.map((t, j) => `<div class="item ${t.d ? "done" : ""}">${chk(k, `tbr.${j}.d`, "Read: " + t.t)}<span class="txt">${esc(t.t)}</span><button class="x" data-act="del" ${B(k, "tbr")} data-i="${j}" aria-label="Remove">×</button></div>`).join("")}
        <div class="addrow"><input id="newTbr" class="boxinput" placeholder="Add a book to your list" aria-label="Book to read" data-enter="addTbr"><button id="addTbr" class="btn" data-act="push" ${B(k, "tbr")} data-from="newTbr">Add</button></div></section>
      ${foot("Readers become leaders. Twenty pages a day changes everything.")}</div>`;
  }

  function snippet(o) {
    const out = [];
    (function walk(v) { if (out.join(" ").length > 90) return; if (typeof v === "string" && v.trim() && !/^\d{1,2}:\d{2}$/.test(v)) out.push(v.trim()); else if (v && typeof v === "object") Object.keys(v).forEach((kk) => kk !== "_u" && walk(v[kk])); })(o);
    return out.join(" · ").slice(0, 110);
  }
  function pagePast() {
    const items = [];
    const add2 = (type, tag, cls, date, title, href, o) => items.push({ type, tag, cls, date, title, href, text: snippet(o), all: JSON.stringify(o || {}).toLowerCase() });
    Store.keys("day:").forEach((key) => { const d = parse(key.slice(4)); add2("planner", "Planner", "", d, fmtLong(d) + ", " + d.getFullYear(), "#/day/" + key.slice(4), Store.peek(key)); });
    Store.keys("jour:").forEach((key) => { const d = parse(key.slice(5)); add2("journal", "Journal", "j", d, fmtLong(d) + ", " + d.getFullYear(), "#/journal/" + key.slice(5), Store.peek(key)); });
    Store.keys("pad:j-").forEach((key) => { const ds = key.slice(6), d = parse(ds), p = Store.peek(key); if (p && p.strokes && p.strokes.length && !Store.has("jour:" + ds)) add2("journal", "Handwritten", "j", d, fmtLong(d) + ", " + d.getFullYear(), "#/journal/" + ds, {}); });
    Store.keys("week:").forEach((key) => {
      const ws = key.slice(5), d = parse(ws), w = Store.peek(key) || {}, rng = `Week of ${fmtShort(d)}, ${d.getFullYear()}`;
      add2("week", "Week", "w", d, rng, `#/week/${ws}/plan`, { a: w.big3, b: w.days, c: w.notes, d: w.refl });
      if (w.jobs && w.jobs.some((j) => j.co || j.role)) add2("jobs", "Job search", "w", d, rng + " · " + w.jobs.filter((j) => j.co || j.role).length + " applications", `#/week/${ws}/jobs`, w.jobs);
      if ((w.dump && w.dump.length) || Store.has("pad:bd-" + ws)) add2("dump", "Brain dump", "w", d, rng, `#/week/${ws}/dump`, w.dump);
    });
    Store.keys("grat:").forEach((key) => { const d = parse(key.slice(5)), g = Store.peek(key); if (g && g.items && g.items.length) add2("gratitude", "Gratitude", "j", d, fmtLong(d) + ", " + d.getFullYear() + " · " + g.items.length + " joys", "#/gratitude/" + key.slice(5), g.items); });
    Store.keys("mani:").forEach((key) => { const d = parse(key.slice(5)); add2("manifest", "Manifest", "", d, fmtLong(d) + ", " + d.getFullYear(), "#/manifest/" + key.slice(5), Store.peek(key)); });
    Store.keys("grow:").forEach((key) => { const d = parse(key.slice(5)); add2("growth", "Growth", "w", d, fmtLong(d) + ", " + d.getFullYear(), "#/growth/" + key.slice(5), Store.peek(key)); });
    Store.keys("month:").forEach((key) => { const d = parse(key.slice(6) + "-01"); add2("month", "Month", "w", d, monthName(d) + " " + d.getFullYear(), "#/month/" + key.slice(6), Store.peek(key)); });
    const F = [["all", "Everything"], ["planner", "Planner"], ["journal", "Journal"], ["gratitude", "Gratitude"], ["manifest", "Manifest"], ["growth", "Growth"], ["week", "Weeks"], ["jobs", "Job search"], ["dump", "Brain dumps"], ["month", "Months"]];
    const q = UI.pastQuery.trim().toLowerCase();
    const shown = items.filter((x) => (UI.pastFilter === "all" || x.type === UI.pastFilter) && (!q || x.all.includes(q) || x.title.toLowerCase().includes(q))).sort((a, b) => b.date - a.date);
    let lastM = "", list = "";
    shown.forEach((x) => {
      const mlabel = x.date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (mlabel !== lastM) { list += `<h3 class="label" style="margin:22px 0 4px">${mlabel}</h3>`; lastM = mlabel; }
      list += `<a class="entry" href="${x.href}"><div style="min-width:0"><b>${esc(x.title)}</b><small>${esc(x.text || "Checklists and trackers updated")}</small></div><span class="tag ${x.cls}">${x.tag}</span></a>`;
    });
    return `<div class="stack">${head("Past entries", "Every page you've written", `${items.length} saved pages on this device. Nothing is ever overwritten by a new day.`, Art.scene("book", seasonOf(today()), "Book"))}
      <section class="card"><label class="sr" for="pastQ">Search your entries</label><input id="pastQ" class="boxinput" style="width:100%" placeholder="Search everything you've written…" value="${esc(UI.pastQuery)}" data-ui="pastQuery">
        <div class="row" style="margin-top:12px;gap:6px">${F.map(([v, l]) => `<button class="chip" data-act="pastFilter" data-v="${v}" aria-pressed="${UI.pastFilter === v}">${l}</button>`).join("")}</div>
        <div class="list">${list || `<p class="muted" style="margin-top:18px">${items.length ? "No pages match that search." : "Your saved pages will appear here. Start with today's plan or journal."}</p>`}</div></section></div>`;
  }

  function pageReset() {
    return `<div class="stack">${head("Start fresh", "Erase everything and begin again", "This deletes every saved page, photo, drawing and setting on this device. It can't be undone.", Art.scene("sunrise", seasonOf(today()), "Sunrise"))}
      <section class="card peach"><h2 class="h">Before you erase</h2><p style="margin:8px 0 14px">If there's anything you want to keep, go to More and download a backup first.</p>
        <div class="row"><button class="btn" data-act="wipe">${UI.armed === "wipe" ? "Tap again to erase everything" : "Erase all entries"}</button><a class="pill" href="#/more">Cancel</a></div></section></div>`;
  }

  function pageMore() {
    const s = Store.doc("settings", DEF.settings);
    return `<div class="stack">${head("Settings & backup", "Keep your planner safe", "Everything is saved on this iPad automatically. Download a backup now and then to keep a copy.", Art.scene("leaf", seasonOf(today()), "Leaves"))}
      <section class="card"><h2 class="h">Your name</h2>${inp("settings", "name", "Your name", "big-input")}</section>
      <div class="g2">
        <section class="card green"><h2 class="h">Back up</h2><p style="color:#DCE4CF;margin:8px 0 14px">Saves one file with every page, photo and drawing. On iPad, choose “Save to Files”.</p><button class="btn" data-act="backup">Download backup</button></section>
        <section class="card peach"><h2 class="h">Restore</h2><p class="muted" style="color:var(--terra2);margin:8px 0 14px">Open a backup file to bring your pages to this device (from your MacBook to your iPad, for example).</p><label class="btn dark" style="display:inline-flex;align-items:center">Choose backup file<input type="file" accept="application/json,.json" class="sr" data-restore></label></section>
      </div>
      <section class="card sage"><h2 class="h">Apple Pencil</h2><p class="muted" style="margin:8px 0 12px">With “Pencil only” on, your finger scrolls the page and only the Pencil writes on drawing pads. It turns on by itself the first time you use the Pencil.</p>
        <button class="chip" data-act="toggle" data-doc="settings" data-path="pencilOnly" aria-pressed="${!!s.pencilOnly}">Pencil only</button></section>
      <section class="card"><h2 class="h">Storage</h2><p class="muted" id="storageLine">Checking storage…</p></section>
      <section class="card"><div class="between"><div><h2 class="h">Start fresh</h2><p class="muted" style="margin:6px 0 0">Erase all past entries on this device and begin a clean planner.</p></div><a class="btn ghost" style="display:inline-flex;align-items:center;text-decoration:none" href="#/reset">Start fresh</a></div></section>
      <p class="muted" style="text-align:center">Becoming Planner · version ${VERSION}</p>
      ${foot("Made with love for Harmanbir's year of becoming.")}</div>`;
  }

  // ================= AUTO STATS =================
  function stats(from, to) {
    const S = { total: 0, days: 0, journal: 0, water: [], move: 0, sleep: [], todo: 0, todoAll: 0, top3: 0, moods: {}, stars: [], best: null, wins: [], joys: 0, dots: 0, growth: 0, learned: [], apps: 0, books: 0, perDay: [] };
    for (let d = new Date(from); d <= to; d = add(d, 1)) {
      const ds = ymd(d); S.total++;
      const day = Store.has("day:" + ds) ? Store.peek("day:" + ds) : null;
      const g = Store.peek("grat:" + ds), m = Store.peek("mani:" + ds), gr = Store.peek("grow:" + ds);
      const pd = { d: new Date(d), ds, day, jour: Store.has("jour:" + ds), joys: g && g.items ? g.items.length : 0, dots: m && m.dots ? Object.values(m.dots).filter(Boolean).length : 0, moves: gr && gr.done ? Object.values(gr.done).filter(Boolean).length : 0 };
      S.perDay.push(pd);
      if (day) {
        S.days++; S.water.push(+day.water || 0); S.move += +day.move || 0;
        if (day.bed || day.wake) S.sleep.push(+day.hrs || 0);
        (day.todos || []).forEach((t) => { if ((t.t || "").trim()) { S.todoAll++; if (t.d) S.todo++; } });
        (day.top3 || []).forEach((t) => { if (t.d) S.top3++; });
        if (day.mood) S.moods[day.mood] = (S.moods[day.mood] || 0) + 1;
        if (day.stars) { S.stars.push(day.stars); if (!S.best || day.stars > S.best.stars) S.best = { d: new Date(d), stars: day.stars }; }
        const w = [day.e1, day.e2].filter((s) => (s || "").trim());
        if (w.length) S.wins.push({ d: new Date(d), t: w.join(" · ") });
      }
      if (pd.jour) S.journal++;
      S.joys += pd.joys; S.dots += pd.dots; S.growth += pd.moves;
      if (gr && (gr.learned || "").trim()) S.learned.push({ d: new Date(d), t: gr.learned });
    }
    for (let mo = mondayOf(from); mo <= to; mo = add(mo, 7)) {
      if (mo < from) continue;
      const w = Store.peek("week:" + ymd(mo));
      if (w && w.jobs) S.apps += w.jobs.filter((j) => (j.co || j.role || "").trim()).length;
    }
    const r = Store.peek("reading");
    if (r && r.books) S.books = r.books.filter((b) => b.iso && b.iso >= ymd(from) && b.iso <= ymd(to)).length;
    return S;
  }
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const MOODC = { great: "#F2B888", happy: "#F6DCC4", okay: "#DCE4CF", sad: "#C9D3C0", tired: "#EADFC9" };
  const MOODN = { great: "Amazing", happy: "Happy", okay: "Okay", sad: "Sad", tired: "Tired" };
  const stat = (big, unit, label, cls) => `<div class="card ${cls || ""} stat"><div class="n">${big}<span> ${unit}</span></div><div class="muted">${label}</div></div>`;

  function weekSummary(mon, D) {
    const S = stats(mon, add(mon, 6));
    const NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return `<section class="card">
      <div class="between"><div><div class="label">Your week at a glance</div><h2 class="h" style="margin-top:4px">Filled in from your daily pages</h2></div><span class="tag">${S.days} of 7 days planned · ${S.journal} journaled</span></div>
      <div class="weekstrip">${S.perDay.map((x, j) => `<a href="#/day/${x.ds}" class="${x.day ? "on" : ""}"><span class="label" style="color:var(--muted)">${NAMES[j]}</span>
          ${x.day && x.day.mood ? Art.face(x.day.mood, MOODC[x.day.mood]).replace('width="46" height="46"', 'width="38" height="38"') : `<i class="ghost"></i>`}
          <span style="display:flex;gap:1px">${[1, 2, 3, 4, 5].map((v) => Art.starIcon(9, x.day && v <= (x.day.stars || 0) ? "#DE8644" : "none", x.day ? "#DE8644" : "#D8CCB3")).join("")}</span>
          <small>${x.day ? (x.day.water || 0) + " glasses" : "—"}</small>${x.joys ? `<small style="color:var(--terra)">${x.joys} joys</small>` : ""}</a>`).join("")}</div>
      <div class="g4" style="margin-top:14px">
        ${stat(avg(S.water).toFixed(1), "glasses", "water a day on average", "sage")}
        ${stat(S.move, "min", "movement this week", "peach")}
        ${stat(S.sleep.length ? avg(S.sleep).toFixed(1) : "–", "h", "sleep a night on average", "sand")}
        ${stat(S.todo + "/" + S.todoAll, "", `to-dos done · ${S.top3} Top 3 wins`, "sage")}
        ${stat(S.joys, "joys", "added to your gratitude jar", "peach")}
        ${stat(S.dots, "/ 126", "3·6·9 affirmations written", "sage")}
        ${stat(S.growth, "moves", "growth moves completed", "sand")}
        ${stat(S.apps, "sent", "job applications", "peach")}
      </div>
      <div style="margin-top:16px"><div class="label">What I achieved, day by day</div>
        ${S.wins.length ? S.wins.map((x) => `<p class="winline"><b>${NAMES[(x.d.getDay() + 6) % 7].toUpperCase()}</b><span>${esc(x.t)}</span></p>`).join("") : `<p class="muted" style="margin:8px 0 0">Your evening reflections from each day will collect here.</p>`}
      </div></section>`;
  }

  function monthNumbers(m1) {
    const end = new Date(m1.getFullYear(), m1.getMonth() + 1, 0);
    const S = stats(m1, end);
    const moodTotal = Object.values(S.moods).reduce((a, b) => a + b, 0);
    const BADGES = [
      ["Consistent", "Planned 20+ days", S.days >= 20], ["Morning person", "Journaled 15+ mornings", S.journal >= 15],
      ["Hydration hero", "7+ glasses a day on average", S.days >= 7 && avg(S.water) >= 7], ["Mover", "10+ hours of movement", S.move >= 600],
      ["Grateful heart", "30+ joys in the jar", S.joys >= 30], ["Manifestor", "150+ 3·6·9 affirmations", S.dots >= 150],
      ["Lifelong learner", "40+ growth moves", S.growth >= 40], ["Bookworm", "Finished 2+ books", S.books >= 2], ["Job hunter", "Sent 20+ applications", S.apps >= 20],
    ];
    const earned = BADGES.filter((b) => b[2]).length;
    return `<section class="card">
      <div class="between"><div><div class="label">Month in numbers</div><h2 class="h" style="margin-top:4px">Counted from your days</h2></div><span class="tag">${S.days} of ${S.total} days planned</span></div>
      <div class="g4" style="margin-top:14px">
        ${stat(S.journal, "mornings", "journaled", "peach")}${stat(S.joys, "joys", "in your gratitude jar", "sage")}
        ${stat(S.growth, "moves", "growth moves done", "sand")}${stat(S.apps, "sent", "job applications", "peach")}
        ${stat(S.books, "books", "finished this month", "sage")}${stat((S.move / 60).toFixed(1), "h", "of movement", "sand")}
        ${stat(avg(S.water).toFixed(1), "glasses", "water a day on average", "sage")}${stat(S.todo, "to-dos", `done · ${S.top3} Top 3 wins`, "peach")}
      </div>
      ${moodTotal ? `<div style="margin-top:16px"><div class="label">Mood this month</div><div class="moodbar">${Object.keys(MOODC).filter((k) => S.moods[k]).map((k) => `<i style="flex:${S.moods[k]};background:${MOODC[k]}" title="${MOODN[k]}"></i>`).join("")}</div>
        <div class="row" style="margin-top:8px;font-size:13px;color:var(--muted)">${Object.keys(MOODC).filter((k) => S.moods[k]).map((k) => `<span class="row" style="gap:6px"><i style="width:12px;height:12px;border-radius:3px;background:${MOODC[k]};display:inline-block"></i>${MOODN[k]} ${S.moods[k]}</span>`).join("")}</div></div>` : ""}
      ${S.best ? `<p class="hand" style="margin:14px 0 0">Best day: ${fmtLong(S.best.d)} · ${S.best.stars} stars</p>` : ""}
    </section>
    <section class="card green"><div class="between"><div><div class="label">Achievements</div><h2 class="h" style="margin-top:4px">${earned} of ${BADGES.length} earned this month</h2></div></div>
      <div class="badges">${BADGES.map(([n, c, on]) => `<div class="badge ${on ? "on" : ""}">${Art.starIcon(30, on ? "#F2B888" : "none", on ? "#F2B888" : "#7E9A76")}<b>${n}</b><small>${c}</small></div>`).join("")}</div></section>
    <div class="g2">
      <section class="card"><div class="label">What I achieved this month</div>${S.wins.length ? S.wins.slice(-10).reverse().map((x) => `<p class="winline"><b>${fmtShort(x.d).toUpperCase()}</b><span>${esc(x.t)}</span></p>`).join("") : `<p class="muted">Your evening reflections will collect here.</p>`}</section>
      <section class="card sage"><div class="label" style="color:var(--forest)">What I learned this month</div>${S.learned.length ? S.learned.slice(-10).reverse().map((x) => `<p class="winline"><b>${fmtShort(x.d).toUpperCase()}</b><span>${esc(x.t)}</span></p>`).join("") : `<p class="muted">Lines from your Growth learning log will collect here.</p>`}</section>
    </div>`;
  }

  // ================= GRATITUDE =================
  function pageGratitude(d) {
    const ds = ymd(d), k = "grat:" + ds, D = doc(k), i = dayIdx(d);
    let joys = []; const first = new Date(d.getFullYear(), d.getMonth(), 1);
    for (let x = first; x.getMonth() === d.getMonth(); x = add(x, 1)) { const g = Store.peek("grat:" + ymd(x)); if (g && g.items) joys = joys.concat(g.items); }
    const COLS = ["#6F8A62", "#DE8644", "#F2B888", "#9DB08A", "#A4511A", "#C3CEAC"];
    const n = Math.min(joys.length, 63);
    const pebbles = rows(n, (_, j) => { const row = Math.floor(j / 7), col = j % 7, jit = ((j * 37) % 9) - 4; return `<i class="${UI.drop && j === n - 1 ? "drop" : ""}" style="left:${10 + col * 25 + (row % 2) * 11 + jit}px;bottom:${8 + row * 21 + ((j * 13) % 5)}px;background:${COLS[j % COLS.length]}"></i>`; }).join("");
    UI.drop = false;
    const STARTERS = ["A person…", "A small moment…", "My body…", "Something I learned…", "A place…", "A comfort…"];
    const today_p = pick(CT.gratitude, i * 3);
    return `<div class="stack">
      ${head("Gratitude journal · " + fmtLong(d), "Thank you, life", "What I appreciate, appreciates.", Art.scene("leaf", seasonOf(d), "Autumn leaves"), dateBar("gratitude", d))}
      <div class="g-wide" style="grid-template-columns:minmax(0,1fr) minmax(0,1.35fr)">
        <section class="card sage jarcard"><h2 class="h">My joy jar</h2>
          <div class="lid"></div><div class="neck"></div>
          <div class="jar big" role="img" aria-label="Joy jar with ${joys.length} entries this month">${pebbles}<span class="jarlabel">little joys</span></div>
          <p class="jarcount">${joys.length === 1 ? "1 little joy" : joys.length + " little joys"} in ${monthName(d)}</p>
          <p class="muted" style="margin:2px 0 0">Every entry drops a pebble in the jar.</p></section>
        <section class="card"><h2 class="h">Today I'm grateful for…</h2>
          <div class="row" style="gap:6px;margin-top:12px">${STARTERS.map((s) => `<button class="chip" data-act="fill" data-target="newGrat" data-v="${s.replace("…", ": ")}">${s}</button>`).join("")}</div>
          <p class="muted" style="margin:12px 0 0">Today's prompt: <a href="#" data-act="fill" data-target="newGrat" data-v="${esc(today_p.replace(/:$/, ": "))}">${esc(today_p)}</a></p>
          <div class="addrow"><input id="newGrat" class="boxinput" placeholder="The way the light came through the window…" aria-label="Something I'm grateful for" data-enter="addGrat"><button id="addGrat" class="btn" data-act="push" ${B(k, "items")} data-from="newGrat" data-drop="1">Add</button></div>
          <div style="margin-top:6px">${D.items.length ? D.items.map((t, j) => `<div class="item"><i class="dot" style="background:${COLS[j % COLS.length]}"></i><span class="txt">${esc(t.t)}</span><button class="x" data-act="del" ${B(k, "items")} data-i="${j}" aria-label="Remove">×</button></div>`).join("") : `<p class="hand" style="color:#B7AE99;text-align:center;margin:22px 0">your first little joy goes here</p>`}</div></section>
      </div>
      ${foot("I have so much, and more is on its way.")}</div>`;
  }

  // ================= MANIFEST =================
  function pageManifest(d) {
    const ds = ymd(d), k = "mani:" + ds, D = doc(k), G = doc("manifest"), i = dayIdx(d);
    const ROWS = [["m", "Morning", 3, "o"], ["a", "Afternoon", 6, "s"], ["n", "Night", 9, "f"]];
    const done = Object.values(D.dots).filter(Boolean).length;
    const sp = pick(CT.manifest, i * 7);
    return `<div class="stack">
      ${head("Manifestation journal · " + fmtLong(d), "Speak it into being", "Write it. Believe it. Act as if it's already yours.", `<svg viewBox="0 0 300 180" class="sunspin" aria-hidden="true"><rect width="300" height="180" fill="#FBF8F1"/><g stroke="#6F8A62" stroke-width="5" stroke-linecap="round"><path d="M150 30v18M150 132v18M80 90h18M202 90h18M100 40l12 12M188 128l12 12M200 40l-12 12M112 128l-12 12"/></g><circle cx="150" cy="90" r="30" fill="#DE8644"/></svg>`, dateBar("manifest", d))}
      <section class="card green"><div class="label">I am manifesting</div>
        ${inp("manifest", "main", "My dream, written as if it's already true…", "big-input")}
        <div class="g2" style="margin-top:10px"><label style="color:#DCE4CF;font-size:14px">By when<br>${inp("manifest", "by", "", "boxinput", "date", "By when")}</label><label style="color:#DCE4CF;font-size:14px">Why it matters to me${inp("manifest", "why", "", "lineinput", "text", "Why it matters")}</label></div></section>
      <section class="card"><div class="between"><h2 class="h">The 3 · 6 · 9 method</h2><span class="muted">${done} of 18 written</span></div>
        <p class="muted" style="margin:6px 0 0">Write your affirmation 3 times in the morning, 6 in the afternoon and 9 at night. Tap a circle each time.</p>
        ${inp(k, "aff", "I am so happy and grateful now that…", "boxinput aff369", "text", "My affirmation")}
        ${D.aff ? "" : `<button class="chip" style="margin-top:8px" data-act="setText" ${B(k, "aff")} data-v="${esc(affOf(d))}">Use today's: “${esc(affOf(d))}”</button>`}
        ${ROWS.map(([id, l, nn, c]) => `<div class="row369"><span class="l ${c}">${l} · ${nn}</span><div class="dots-row">${rows(nn, (_, j) => `<button class="dot369 ${c}" data-act="toggle" ${B(k, `dots.${id}${j}`)} aria-pressed="${!!D.dots[id + j]}" aria-label="${l} ${j + 1}"><span></span></button>`).join("")}</div></div>`).join("")}
        ${done >= 18 ? `<p class="hand" style="margin:10px 0 0">All 18 written. It's on its way to you.</p>` : ""}</section>
      <section class="card peach"><h2 class="h">Scripting · write it as if it already happened</h2><p class="muted" style="color:var(--terra2);margin:6px 0 0">${esc(sp)}</p>${ta(k, "script", "Dear Universe, thank you for…", 5)}</section>
      <div class="g-wide">
        <section class="card"><h2 class="h">Rewrite the old story</h2>
          <div class="belief head2"><span>Old belief</span><span></span><span style="color:var(--forest)">New belief</span></div>
          ${G.beliefs.map((b, j) => `<div class="belief"><input class="lineinput old" ${B("manifest", `beliefs.${j}.o`)} value="${esc(b.o)}" placeholder="${["I never finish what I start", "I am not good enough yet", "Money is hard to come by"][j]}" aria-label="Old belief ${j + 1}"><span class="arrow">→</span><input class="lineinput new" ${B("manifest", `beliefs.${j}.n`)} value="${esc(b.n)}" placeholder="${["I follow through, one step at a time", "I am enough, and I keep growing", "Opportunities find me easily"][j]}" aria-label="New belief ${j + 1}"></div>`).join("")}</section>
        <section class="card sage"><h2 class="h">Signs I'm on my way</h2>
          <div class="addrow"><input id="newSign" class="boxinput" placeholder="111 on the clock, a kind email…" aria-label="A sign I noticed" data-enter="addSign"><button id="addSign" class="btn dark" data-act="push" data-doc="manifest" data-path="signs" data-from="newSign" data-extra='{"date":"${fmtShort(d)}"}'>Add</button></div>
          ${G.signs.slice().reverse().slice(0, 12).map((s) => { const j = G.signs.indexOf(s); return `<div class="item">${Art.starIcon(14, "#DE8644")}<span class="txt" style="padding-left:8px">${esc(s.t)} <small class="muted">· ${esc(s.date || "")}</small></span><button class="x" data-act="del" data-doc="manifest" data-path="signs" data-i="${j}" aria-label="Remove">×</button></div>`; }).join("")}</section>
      </div>
      <a class="tile-link" href="#/vision/1" style="border-color:var(--orange);flex-direction:row;justify-content:space-between;align-items:center;min-height:0"><span><b>Ready to see it? Build your vision board</b><br><span>Dream it, plan it, then create your board with photos and your Pencil.</span></span>${arrow(1)}</a>
      ${foot("What is meant for me is already finding its way to me.")}</div>`;
  }

  // ================= GROWTH =================
  function pageGrowth(d) {
    const ds = ymd(d), k = "grow:" + ds, D = doc(k), i = dayIdx(d), G = window.GROWTH;
    const areas = Object.keys(G.areas);
    const picks = [0, 1, 2].map((j) => { const a = areas[mod(i * 3 + j, areas.length)]; return [a, pick(G.areas[a], Math.floor((i * 3 + j) / areas.length) + j)]; });
    const [word, meaning, example] = pick(G.words, i);
    const [idea, ideaText] = pick(G.ideas, i);
    const doneN = picks.filter((_, j) => D.done[j]).length;
    const m1 = new Date(d.getFullYear(), d.getMonth(), 1), S = stats(m1, new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const recent = []; for (let x = add(d, -1); recent.length < 6 && x > add(d, -60); x = add(x, -1)) { const g = Store.peek("grow:" + ymd(x)); if (g && (g.learned || "").trim()) recent.push({ d: x, t: g.learned }); }
    return `<div class="stack">
      ${head("Growth · " + fmtLong(d), "A little more every day", "Three small moves a day adds up to about a thousand a year.", Art.scene("sprout", seasonOf(d), "Sprout"), dateBar("growth", d))}
      <div class="banner"><div class="label">Today's big idea · ${esc(idea)}</div><p>${esc(ideaText)}</p>${Art.sparkle}</div>
      <div class="g-wide">
        <section class="card"><div class="between"><h2 class="h">Today's 3 growth moves</h2><span class="tag">${doneN} of 3</span></div>
          ${picks.map(([a, t], j) => `<div class="item ${D.done[j] ? "done" : ""}">${chk(k, "done." + j, t, true)}<span class="txt"><small class="label" style="display:block;color:var(--sage2)">${a}</small>${esc(t)}</span></div>`).join("")}
          <p class="hand" style="margin:12px 0 0">${doneN === 3 ? "All three done. That's how she becomes her." : S.growth + " growth moves so far in " + monthName(d)}</p></section>
        <section class="card peach"><div class="label" style="color:var(--terra2)">Word of the day</div>
          <p style="margin:8px 0 0;font-family:var(--display);font-style:italic;font-size:34px;color:var(--forest)">${esc(word)}</p>
          <p style="margin:4px 0 0">${esc(meaning)}</p><p class="muted" style="margin:6px 0 0;color:var(--terra2)">“${esc(example)}”</p>
          <button class="chip" style="margin-top:12px" data-act="toggle" ${B(k, "usedWord")} aria-pressed="${!!D.usedWord}">I used it today</button></section>
      </div>
      <section class="card sage"><h2 class="h">Learning log</h2><p class="muted" style="margin:6px 0 0">One line about something you learned today. It turns information into knowledge.</p>
        ${inp(k, "learned", "Today I learned…", "lineinput", "text", "Today I learned")}
        ${recent.length ? `<div style="margin-top:10px">${recent.map((x) => `<p class="winline"><b>${fmtShort(x.d).toUpperCase()}</b><span>${esc(x.t)}</span></p>`).join("")}</div>` : ""}</section>
      <section class="card"><h2 class="h">Habits of well-read, successful people</h2><p class="muted" style="margin:6px 0 0">Pick one to build this month. Add it to your habit tracker.</p>
        <div class="g2" style="margin-top:10px">${G.habits.map(([h, why]) => `<div class="habit"><b>${esc(h)}</b><span>${esc(why)}</span></div>`).join("")}</div></section>
      ${foot("I invest in my mind because it pays the best interest.")}</div>`;
  }

  // ================= DAILY RITUAL (habit loop) =================
  function ritualOf(ds) {
    const day = Store.peek("day:" + ds), g = Store.peek("grat:" + ds), m = Store.peek("mani:" + ds), gr = Store.peek("grow:" + ds);
    return {
      mood: !!(day && day.mood),
      said: !!(m && m.dots && m.dots.m0 && m.dots.m1 && m.dots.m2),
      joy: !!(g && g.items && g.items.length),
      word: !!(gr && gr.usedWord),
      move: !!(gr && gr.done && Object.values(gr.done).some(Boolean)),
    };
  }
  const ritualN = (ds) => Object.values(ritualOf(ds)).filter(Boolean).length;
  const LEVELS = ["Seed", "Sprout", "Seedling", "Bud", "Bloom", "Blossom", "Garden", "Grove", "Meadow", "Forest", "Evergreen"];
  function level() {
    let pts = 0;
    for (let d = new Date(Math.min(START, today())); d <= today(); d = add(d, 1)) pts += ritualN(ymd(d));
    const per = 30, lv = Math.min(Math.floor(pts / per), LEVELS.length - 1);
    return { pts, name: LEVELS[lv], next: LEVELS[Math.min(lv + 1, LEVELS.length - 1)], into: pts - lv * per, per, lv };
  }
  function flower(n, label) {
    const petals = n >= 5 ? "#DE8644" : n >= 3 ? "#F2B888" : null;
    let g = `<path d="M4 40h32" stroke="#C7B796" stroke-width="3" stroke-linecap="round"/>`;
    if (n >= 1) g += `<path d="M20 40V${n >= 3 ? 18 : 28}" stroke="#6F8A62" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${n >= 3 ? 14 : 15}" cy="${n >= 3 ? 28 : 32}" rx="5" ry="2.6" fill="#9DB08A" transform="rotate(-30 15 31)"/>`;
    if (n >= 2) g += `<ellipse cx="26" cy="${n >= 3 ? 25 : 30}" rx="5" ry="2.6" fill="#6F8A62" transform="rotate(30 26 28)"/>`;
    if (petals) { for (let i = 0; i < (n >= 5 ? 6 : 3); i++) { const a = (i * Math.PI * 2) / (n >= 5 ? 6 : 3) - Math.PI / 2; g += `<circle cx="${20 + Math.cos(a) * 6}" cy="${14 + Math.sin(a) * 6}" r="${n >= 5 ? 4.6 : 3.6}" fill="${petals}"/>`; } g += `<circle cx="20" cy="14" r="3.2" fill="#FBF8F1"/>`; }
    return `<svg width="34" height="40" viewBox="0 0 40 44" role="img" aria-label="${label}">${g}</svg>`;
  }
  function gardenRow(d) {
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `<div class="garden">${rows(dim, (_, j) => { const x = new Date(d.getFullYear(), d.getMonth(), j + 1), n = x <= today() ? ritualN(ymd(x)) : 0; return `<span class="${ymd(x) === ymd(today()) ? "today" : ""}">${flower(n, `${fmtShort(x)}: ${n} of 5 rituals`)}<small>${j + 1}</small></span>`; }).join("")}</div>`;
  }
  const QUICKJOYS = ["My family", "My health", "A good meal", "My home", "Sunshine", "A friend", "Learning something new", "Music", "A quiet moment", "My progress"];
  function ritualCard() {
    const t = today(), ds = ymd(t), R = ritualOf(ds), n = Object.values(R).filter(Boolean).length;
    const m = doc("mani:" + ds), day = doc("day:" + ds), gr = doc("grow:" + ds), g = doc("grat:" + ds);
    const saidN = ["m0", "m1", "m2"].filter((x) => m.dots[x]).length;
    const G = window.GROWTH, i = dayIdx(t), [word, meaning] = pick(G.words, i);
    const areas = Object.keys(G.areas), a0 = areas[mod(i * 3, areas.length)], move0 = pick(G.areas[a0], Math.floor((i * 3) / areas.length));
    const C = 2 * Math.PI * 34, L = level();
    const step = (done, title, body) => `<div class="step ${done ? "done" : ""}"><span class="tick">${done ? Art.check : ""}</span><div style="min-width:0;flex:1"><b>${title}</b>${body}</div></div>`;
    return `<section class="card ritual">
      <div class="between" style="align-items:center"><div><div class="label">Today's 5-minute ritual</div><h2 class="h" style="font-size:24px;font-style:italic;font-weight:400;margin-top:4px">${n === 5 ? "You glowed today." : n ? "Keep going, you're glowing" : "Tiny steps, big glow"}</h2>
          <p class="muted" style="margin:4px 0 0">No long writing. Just five small taps for future you.</p></div>
        <div class="glow" aria-label="${n} of 5 done"><svg width="84" height="84" viewBox="0 0 84 84" style="transform:rotate(-90deg)"><circle cx="42" cy="42" r="34" fill="none" stroke="#EADFC9" stroke-width="9"/><circle cx="42" cy="42" r="34" fill="none" stroke="${n === 5 ? "#DE8644" : "#6F8A62"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${((n / 5) * C).toFixed(1)} ${C.toFixed(1)}"/></svg><b>${n}/5</b></div></div>
      <div class="steps">
        ${step(R.mood, "How do I feel?", `<div class="row" style="gap:2px;margin-top:4px">${["great", "happy", "okay", "sad", "tired"].map((k2) => `<button class="mood mini" data-act="set" ${B("day:" + ds, "mood")} data-val='"${k2}"' data-same="null" aria-pressed="${day.mood === k2}" aria-label="${MOODN[k2]}"><span class="ring">${Art.face(k2, MOODC[k2]).replace('width="46" height="46"', 'width="34" height="34"')}</span></button>`).join("")}</div>`)}
        ${step(R.said, "Say it out loud, 3 times", `<p class="affline">“${esc(affOf(t))}”</p><div class="row" style="gap:8px"><button class="btn ${R.said ? "dark" : ""}" data-act="sayAff">${R.said ? "Said 3 times" : "I said it · " + saidN + "/3"}</button></div>`)}
        ${step(R.joy, "Drop one joy in your jar", `<div class="row" style="gap:6px;margin-top:6px">${QUICKJOYS.map((q) => `<button class="chip" data-act="quickJoy" data-v="${q}">${q}</button>`).join("")}<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none" href="#/gratitude/today">Write my own →</a></div>${g.items.length ? `<p class="muted" style="margin:6px 0 0">In the jar today: ${g.items.map((x) => esc(x.t)).join(", ")}</p>` : ""}`)}
        ${step(R.word, "Learn today's word", R.word ? `<p style="margin:4px 0 0"><span class="wordbig">${esc(word)}</span> · ${esc(meaning)}</p>` : `<div style="margin-top:6px"><button class="btn ghost" data-act="toggle" ${B("grow:" + ds, "usedWord")}>Reveal & learn it</button></div>`)}
        ${step(R.move, "One growth move", `<p style="margin:4px 0 6px"><small class="label" style="color:var(--sage2)">${a0}</small><br>${esc(move0)}</p><button class="btn ${R.move ? "dark" : "ghost"}" data-act="toggle" ${B("grow:" + ds, "done.0")}>${R.move ? "Done!" : "I did it"}</button> <a href="#/growth/today" class="muted" style="margin-left:8px">more ideas</a>`)}
      </div>
      <div class="between" style="margin-top:16px"><div class="label">My ${monthName(t)} garden</div><span class="muted">a flower grows for every day you show up</span></div>
      ${gardenRow(t)}
      <div class="levelbar"><div class="between"><b>Level ${L.lv + 1} · ${L.name}</b><span class="muted">${L.lv < LEVELS.length - 1 ? `${L.per - L.into} taps to ${L.next}` : "Highest level. Legend."}</span></div><div class="bar orange"><i style="width:${(L.into / L.per) * 100}%"></i></div></div>
    </section>`;
  }
  const CHEERS = ["Yes! That's one more step.", "Look at you showing up.", "Tiny step, real progress.", "Future you says thank you.", "That's how habits are made.", "One more flower is growing.", "Consistency looks good on you."];
  function confetti() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
    const dpr = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext("2d"), cols = ["#DE8644", "#F2B888", "#6F8A62", "#9DB08A", "#A4511A", "#F6DCC4"];
    const P = rows(140, () => ({ x: c.width / 2 + (Math.random() - 0.5) * c.width * 0.3, y: c.height * 0.35, vx: (Math.random() - 0.5) * 18 * dpr, vy: (-Math.random() * 16 - 6) * dpr, r: (4 + Math.random() * 5) * dpr, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, s: Math.random() < 0.4 }));
    const t0 = performance.now();
    (function f(t) {
      const k = (t - t0) / 2000; ctx.clearRect(0, 0, c.width, c.height);
      P.forEach((p) => { p.vy += 0.5 * dpr; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.a += 0.15; ctx.globalAlpha = Math.max(0, 1 - k); ctx.fillStyle = p.c;
        if (p.s) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.7, 0, 7); ctx.fill(); } else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.r, -p.r / 3, p.r * 2, p.r / 1.5); ctx.restore(); } });
      if (k < 1) requestAnimationFrame(f); else c.remove();
    })(t0);
  }

  // ---------- render ----------
  let lastHash = null;
  function render() {
    const r = route();
    let html;
    try {
      switch (r.name) {
        case "day": html = pageDay(r.d); break;
        case "journal": html = pageJournal(r.d); break;
        case "week": html = pageWeek(r.mon, r.sub); break;
        case "month": html = pageMonth(r.d, r.sub); break;
        case "year": html = pageYear(); break;
        case "vision": html = pageVision(r.n); break;
        case "reading": html = pageReading(); break;
        case "past": html = pagePast(); break;
        case "more": html = pageMore(); break;
        case "reset": html = pageReset(); break;
        case "gratitude": html = pageGratitude(r.d); break;
        case "manifest": html = pageManifest(r.d); break;
        case "growth": html = pageGrowth(r.d); break;
        default: html = pageHome();
      }
    } catch (e) { console.error(e); html = `<div class="card"><h2 class="h">Something went wrong on this page</h2><p class="muted">${esc(e.message)}</p><a class="pill" href="#/">Go home</a></div>`; }
    const active = document.activeElement && document.activeElement.id;
    $app.innerHTML = html;
    $rail.innerHTML = TABS.map(([id, l, h]) => `<a href="${h}" class="${r.tab === id ? "on" : ""}" ${r.tab === id ? 'aria-current="page"' : ""}>${l}</a>`).join("");
    Pad.mountAll($app);
    if (active) { const el = document.getElementById(active); if (el && el.tagName === "INPUT" && el.dataset.ui) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
    if (location.hash !== lastHash) { window.scrollTo(0, 0); lastHash = location.hash; }
    if (r.name === "more") storageLine();
    document.title = "Becoming Planner";
  }

  async function storageLine() {
    const el = document.getElementById("storageLine"); if (!el) return;
    try { const e = await navigator.storage.estimate(); el.textContent = `${(e.usage / 1048576).toFixed(1)} MB used on this device. ${Store.keys().length} saved pages and items.`; }
    catch (err) { el.textContent = `${Store.keys().length} saved pages and items.`; }
  }

  function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3200); }

  // ---------- timer ----------
  function timerLeft() { return timer.running ? Math.max(0, Math.round((timer.end - Date.now()) / 1000)) : timer.left; }
  function fmtTime(s) { return Math.floor(s / 60) + ":" + p2(s % 60); }
  function tick() {
    const left = timerLeft(), total = timer.mode === "focus" ? 1500 : 300;
    const l = document.getElementById("tLabel"), ring = document.getElementById("tRing");
    if (l) l.textContent = fmtTime(left);
    if (ring) { const C = 2 * Math.PI * 60; ring.setAttribute("stroke-dasharray", `${((1 - left / total) * C).toFixed(1)} ${C.toFixed(1)}`); }
    if (timer.running && left <= 0) {
      timer.running = false; clearInterval(timer.iv);
      timer.mode = timer.mode === "focus" ? "break" : "focus"; timer.left = timer.mode === "focus" ? 1500 : 300;
      toast(timer.mode === "break" ? "Focus session done. Take a 5 minute breather." : "Break over. Ready for another focus session?");
      if (route().name === "week") render();
    }
  }

  // ---------- actions ----------
  const ACT = {
    toggle(el) { const o = doc(el.dataset.doc); setP(o, el.dataset.path, !getP(o, el.dataset.path)); },
    set(el) {
      const o = doc(el.dataset.doc); let v = JSON.parse(el.dataset.val);
      if (el.dataset.same !== undefined && getP(o, el.dataset.path) === v) v = JSON.parse(el.dataset.same);
      setP(o, el.dataset.path, v);
    },
    inc(el) {
      const o = doc(el.dataset.doc); let v = (+getP(o, el.dataset.path) || 0) + +el.dataset.step;
      if (el.dataset.min !== undefined) v = Math.max(+el.dataset.min, v);
      if (el.dataset.max !== undefined) v = Math.min(+el.dataset.max, v);
      setP(o, el.dataset.path, Math.round(v * 10) / 10);
    },
    async wipe() {
      if (UI.armed !== "wipe") { UI.armed = "wipe"; setTimeout(() => { if (UI.armed === "wipe") { UI.armed = null; render(); } }, 4000); return "ui"; }
      UI.armed = null; await Store.wipe(); toast("All clear. A fresh start begins now.");
      setTimeout(() => { location.hash = "#/"; location.reload(); }, 900); return false;
    },
    sayAff() {
      const ds = ymd(today()), o = doc("mani:" + ds);
      const nx = ["m0", "m1", "m2"].find((x) => !o.dots[x]);
      if (!nx) { toast("Already said three times today. Beautiful."); return false; }
      o.dots[nx] = true; if (!o.aff) o.aff = affOf(today()); Store.touch("mani:" + ds);
      return "ui";
    },
    quickJoy(el) { const ds = ymd(today()), o = doc("grat:" + ds); o.items.push({ t: el.dataset.v, d: false }); Store.touch("grat:" + ds); UI.drop = true; return "ui"; },
    fill(el) { const t = document.getElementById(el.dataset.target); if (t) { t.value = el.dataset.v; t.focus(); t.setSelectionRange(t.value.length, t.value.length); } return false; },
    setText(el) { const o = doc(el.dataset.doc); setP(o, el.dataset.path, el.dataset.v); },
    gold(el) { const o = doc(el.dataset.doc); const cur = getP(o, el.dataset.path); const on = cur === undefined ? el.dataset.auto === "true" : !!cur; setP(o, el.dataset.path, !on); },
    cycle(el) { const o = doc(el.dataset.doc); setP(o, el.dataset.path, ((+getP(o, el.dataset.path) || 0) + 1) % +el.dataset.n); },
    push(el) {
      const src = document.getElementById(el.dataset.from); const t = (src.value || "").trim(); if (!t) return false;
      const o = doc(el.dataset.doc); const arr = getP(o, el.dataset.path) || []; arr.push(Object.assign({ t, d: false }, el.dataset.extra ? JSON.parse(el.dataset.extra) : {})); setP(o, el.dataset.path, arr);
      if (el.dataset.drop) UI.drop = true;
      src.value = ""; setTimeout(() => { const n = document.getElementById(el.dataset.from); n && n.focus(); }, 0);
    },
    pushStr(el) { const src = document.getElementById(el.dataset.from); const t = (src.value || "").trim(); if (!t) return false; ACT.addStr(el, t); },
    addStr(el, val) { const o = doc(el.dataset.doc); const arr = getP(o, el.dataset.path) || []; const v = val || el.dataset.v; if (!arr.includes(v)) arr.push(v); setP(o, el.dataset.path, arr); },
    del(el) { const o = doc(el.dataset.doc); getP(o, el.dataset.path).splice(+el.dataset.i, 1); },
    pastFilter(el) { UI.pastFilter = el.dataset.v; return "ui"; },
    newStars(el) { UI.newStars = UI.newStars === +el.dataset.v ? 0 : +el.dataset.v; return "ui"; },
    newColor(el) { UI.newColor = +el.dataset.v; return "ui"; },
    selBook(el) { UI.sel = UI.sel === +el.dataset.id ? null : +el.dataset.id; return "ui"; },
    focusAdd() { const t = document.getElementById("bkTitle"); t && t.focus(); return false; },
    addBook() {
      const t = document.getElementById("bkTitle").value.trim(); if (!t) { toast("Add the book's title first."); return false; }
      const o = doc("reading");
      o.books.push({ id: o.nextId++, title: t, author: document.getElementById("bkAuthor").value.trim(), stars: UI.newStars, color: UI.newColor, date: fmtShort(today()) + " " + today().getFullYear(), iso: ymd(today()), review: "", lines: "" });
      UI.newStars = 0; UI.newColor = (UI.newColor + 1) % 5;
      Store.touch("reading"); toast("Added to your shelf. " + o.books.length + " books read!");
      return "ui";
    },
    delBook(el) {
      const id = +el.dataset.id;
      if (UI.armed !== "book" + id) { UI.armed = "book" + id; setTimeout(() => { if (UI.armed === "book" + id) { UI.armed = null; render(); } }, 3000); return "ui"; }
      const o = doc("reading"); o.books = o.books.filter((b) => b.id !== id); UI.sel = null; UI.armed = null; Store.touch("reading"); return "ui";
    },
    delPhoto(el) { const o = doc("vision"); const t = o.tiles[+el.dataset.i]; if (t.img) Store.remove("img:" + t.img); t.img = null; Store.touch("vision"); return "ui"; },
    timerGo() {
      if (timer.running) { timer.left = timerLeft(); timer.running = false; clearInterval(timer.iv); }
      else { timer.end = Date.now() + timer.left * 1000; timer.running = true; clearInterval(timer.iv); timer.iv = setInterval(tick, 1000); }
      return "ui";
    },
    timerReset() { timer.running = false; clearInterval(timer.iv); timer.left = timer.mode === "focus" ? 1500 : 300; return "ui"; },
    timerMode(el) { timer.mode = el.dataset.m; return ACT.timerReset(); },
    async backup() {
      const data = JSON.stringify(Store.exportAll());
      const name = `becoming-planner-backup-${ymd(today())}.json`;
      const file = new File([data], name, { type: "application/json" });
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Becoming Planner backup" }); return false; } } catch (e) { if (e && e.name === "AbortError") return false; }
      const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast("Backup downloaded.");
      return false;
    },
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]"); if (!el || !ACT[el.dataset.act]) return;
    e.preventDefault();
    const tds = ymd(today()), before = ritualN(tds);
    Promise.resolve(ACT[el.dataset.act](el)).then((res) => {
      if (res === false) return;
      if (res !== "ui" && el.dataset.doc) Store.touch(el.dataset.doc);
      render();
      const after = ritualN(tds);
      if (after > before) {
        if (after === 5) { confetti(); toast("Ritual complete! A new flower bloomed in your garden."); }
        else toast(pick(CHEERS, Date.now() % 997) + " " + after + " of 5 today.");
      }
    });
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.ui) { UI[el.dataset.ui] = el.value; clearTimeout(render.t); render.t = setTimeout(render, 220); return; }
    if (!el.dataset.doc || !el.dataset.path || el.type === "file") return;
    const o = doc(el.dataset.doc);
    setP(o, el.dataset.path, el.type === "number" ? +el.value : el.value);
    Store.touch(el.dataset.doc);
  });
  document.addEventListener("keydown", (e) => {
    const el = e.target;
    if (e.key === "Enter" && el.dataset && el.dataset.enter) { e.preventDefault(); const b = document.getElementById(el.dataset.enter); b && b.click(); }
  });
  document.addEventListener("change", async (e) => {
    const el = e.target;
    if (el.dataset.go && el.value) { location.hash = `#/${el.dataset.go}/${el.value}`; return; }
    if (el.dataset.photo !== undefined && el.files && el.files[0]) {
      try {
        const url = await resizeImage(el.files[0], 1400);
        const id = "p" + Date.now().toString(36);
        const o = doc("vision"), t = o.tiles[+el.dataset.photo];
        if (t.img) Store.remove("img:" + t.img);
        Store.put("img:" + id, url); t.img = id; Store.touch("vision"); render();
      } catch (err) { toast("That photo couldn't be opened. Try a JPEG or PNG."); }
      return;
    }
    if (el.dataset.restore !== undefined && el.files && el.files[0]) {
      try { const n = Store.importAll(JSON.parse(await el.files[0].text())); toast(`Restored ${n} pages and items.`); render(); }
      catch (err) { toast(err.message || "That file couldn't be restored."); }
    }
  });
  function resizeImage(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject; img.src = url;
    });
  }

  // A new day starts a fresh page automatically when the app comes back.
  let dayStamp = ymd(today());
  function checkNewDay() { const now = ymd(today()); if (now !== dayStamp) { dayStamp = now; render(); } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkNewDay(); });
  setInterval(checkNewDay, 60000);

  window.addEventListener("hashchange", render);
  window.App = { toast, render };
  Store.load().then(render);
})();
