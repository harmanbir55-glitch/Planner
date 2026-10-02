/* Pad: an Apple Pencil writing surface. Strokes are saved as vectors
   (normalised 0–1 coordinates) so they stay sharp on rotation and resize. */
window.Pad = (function () {
  const live = new Map();
  const COLORS = [["#2E3A2A", "Ink"], ["#3F5B3A", "Forest"], ["#6F8A62", "Sage"], ["#DE8644", "Orange"], ["#A4511A", "Terracotta"]];
  const SIZES = [[1.6, "Fine", 4], [2.6, "Medium", 7], [4.4, "Bold", 11]];
  const ICON = {
    pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
    marker: "M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4",
    eraser: "M20 20H7L3 16a2 2 0 0 1 0-2.8L13.2 3a2 2 0 0 1 2.8 0L21 8a2 2 0 0 1 0 2.8L11 20",
    undo: "M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  };
  const svg = (d) => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  function settings() { return Store.doc("settings", {}); }

  function create(key, height, hint, paper) {
    const el = document.createElement("div");
    el.className = "pad";
    el.innerHTML = `
      <div class="tools">
        <div class="grp">
          ${["pen", "marker", "eraser"].map((t) => `<button type="button" class="tb" data-tool="${t}" aria-label="${t === "marker" ? "Highlighter" : t[0].toUpperCase() + t.slice(1)}">${svg(ICON[t])}</button>`).join("")}
          ${COLORS.map(([c, n]) => `<button type="button" class="sw" data-color="${c}" aria-label="${n} ink"><i style="background:${c}"></i></button>`).join("")}
          ${SIZES.map(([s, n, px]) => `<button type="button" class="sw" data-size="${s}" aria-label="${n} line"><i style="width:${px}px;height:${px}px;background:#2E3A2A"></i></button>`).join("")}
        </div>
        <div class="grp">
          <button type="button" class="chip" data-pencil aria-pressed="false">Pencil only</button>
          <button type="button" class="tb" data-undo aria-label="Undo">${svg(ICON.undo)}</button>
          <button type="button" class="chip" data-clear>Clear</button>
        </div>
      </div>
      <div class="surface ${paper || ""}"><canvas style="height:${height}px" aria-label="Writing pad. Write or draw with Apple Pencil or your finger."></canvas><div class="hint">${hint || "write it here"}</div></div>`;
    const cv = el.querySelector("canvas");
    const hintEl = el.querySelector(".hint");
    const data = Store.doc("pad:" + key, { strokes: [] });
    const st = { tool: "pen", color: "#2E3A2A", size: 2.6, cur: null, w: 0, h: 0, dpr: 1 };
    const ctx = cv.getContext("2d");

    function sync() {
      el.querySelectorAll("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === st.tool)));
      el.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === st.color && st.tool !== "eraser")));
      el.querySelectorAll("[data-size]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.size === st.size)));
      const po = !!settings().pencilOnly;
      el.querySelector("[data-pencil]").setAttribute("aria-pressed", String(po));
      el.classList.toggle("pencil", po);
      hintEl.style.display = data.strokes.length ? "none" : "";
    }

    function fit() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (w === st.w && h === st.h && dpr === st.dpr) return;
      st.w = w; st.h = h; st.dpr = dpr;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      redraw();
    }

    function widthOf(s, p) {
      const base = s.size * (st.w / 700 + 0.3);
      if (s.tool === "eraser") return base * 7;
      if (s.tool === "marker") return base * 5;
      return base * (0.45 + p);
    }
    function seg(s, i) {
      const a = s.pts[Math.max(0, i - 1)], b = s.pts[i];
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
      ctx.globalAlpha = s.tool === "marker" ? 0.32 : 1;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = widthOf(s, b[2]) * st.dpr;
      ctx.beginPath();
      ctx.moveTo(a[0] * cv.width, a[1] * cv.height);
      ctx.lineTo(b[0] * cv.width + 0.01, b[1] * cv.height + 0.01);
      ctx.stroke();
    }
    function whole(s) {
      if (s.tool !== "marker") { for (let i = 0; i < s.pts.length; i++) seg(s, i); return; }
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 0.32; ctx.strokeStyle = s.color;
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = widthOf(s, 0.5) * st.dpr;
      ctx.beginPath();
      s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * cv.width, p[1] * cv.height) : ctx.moveTo(p[0] * cv.width, p[1] * cv.height)));
      ctx.stroke();
    }
    function redraw() {
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, cv.width, cv.height);
      data.strokes.forEach(whole);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    function pt(e) {
      const r = cv.getBoundingClientRect();
      const p = e.pointerType === "pen" ? e.pressure || 0.5 : e.pressure > 0 && e.pressure !== 0.5 ? e.pressure : 0.5;
      return [+((e.clientX - r.left) / r.width).toFixed(4), +((e.clientY - r.top) / r.height).toFixed(4), +p.toFixed(2)];
    }

    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen" && !settings().pencilSeen) {
        const s = settings(); s.pencilSeen = true; s.pencilOnly = true; Store.touch("settings");
        live.forEach((p) => p.sync());
        window.App && App.toast("Apple Pencil found. Your finger now scrolls and the Pencil writes.");
      }
      if (settings().pencilOnly && e.pointerType === "touch") return;
      if (e.button > 0) return;
      e.preventDefault();
      fit();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      st.cur = { tool: st.tool, color: st.color, size: st.size, pts: [pt(e)] };
      data.strokes.push(st.cur);
      hintEl.style.display = "none";
      seg(st.cur, 0);
    });
    cv.addEventListener("pointermove", (e) => {
      if (!st.cur) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (evs.length ? evs : [e]).forEach((ev) => {
        const p = pt(ev), last = st.cur.pts[st.cur.pts.length - 1];
        if (Math.abs(p[0] - last[0]) * st.w + Math.abs(p[1] - last[1]) * st.h < 0.8) return;
        st.cur.pts.push(p); seg(st.cur, st.cur.pts.length - 1);
      });
    });
    const end = () => {
      if (!st.cur) return;
      const wasMarker = st.cur.tool === "marker";
      st.cur = null;
      if (wasMarker) redraw();
      Store.touch("pad:" + key);
    };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    // Keep the Pencil from scrolling the page while fingers still can.
    const stylusGuard = (e) => {
      const t = e.touches && e.touches[0];
      if (!settings().pencilOnly || (t && t.touchType === "stylus")) e.preventDefault();
    };
    cv.addEventListener("touchstart", stylusGuard, { passive: false });
    cv.addEventListener("touchmove", stylusGuard, { passive: false });

    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.tool) st.tool = b.dataset.tool;
      else if (b.dataset.color) { st.color = b.dataset.color; if (st.tool === "eraser") st.tool = "pen"; }
      else if (b.dataset.size) st.size = +b.dataset.size;
      else if ("pencil" in b.dataset) { const s = settings(); s.pencilOnly = !s.pencilOnly; Store.touch("settings"); live.forEach((p) => p.sync()); }
      else if ("undo" in b.dataset) { data.strokes.pop(); redraw(); Store.touch("pad:" + key); }
      else if ("clear" in b.dataset) {
        if (b.dataset.armed) { data.strokes.length = 0; redraw(); Store.touch("pad:" + key); b.textContent = "Clear"; delete b.dataset.armed; }
        else { b.dataset.armed = "1"; b.textContent = "Tap again to clear"; setTimeout(() => { b.textContent = "Clear"; delete b.dataset.armed; }, 2500); }
      }
      sync();
    });
    sync();
    return { el, fit, sync };
  }

  function mountAll(root) {
    root.querySelectorAll("[data-pad]").forEach((ph) => {
      const key = ph.dataset.pad;
      let inst = live.get(key);
      if (!inst) { inst = create(key, +ph.dataset.height || 420, ph.dataset.hint, ph.dataset.paper); live.set(key, inst); }
      ph.replaceWith(inst.el);
      inst.sync(); requestAnimationFrame(inst.fit);
    });
  }
  window.addEventListener("resize", () => live.forEach((p) => p.fit()));
  return { mountAll };
})();
