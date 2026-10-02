/* Art: small hand-drawn style scenes that match each affirmation. */
window.Art = (function () {
  const SEASON = {
    autumn: { sky: "#F7E1CB", r1: "#F4CFAA", r2: "#F0B987", sun: "#DE8644", h1: "#C3CEAC", h2: "#9DB08A", h3: "#6F8A62" },
    winter: { sky: "#EEF0E8", r1: "#E3E7DC", r2: "#D6DDCB", sun: "#F2B888", h1: "#DCE4CF", h2: "#B9C6A3", h3: "#8FA27A" },
    spring: { sky: "#F8E6DA", r1: "#F6D5C4", r2: "#F2C2A8", sun: "#E9A06A", h1: "#CFDDB8", h2: "#A9C28E", h3: "#7F9A6F" },
    summer: { sky: "#F9E7C6", r1: "#F6D59A", r2: "#F2C072", sun: "#E07B2E", h1: "#B8C99A", h2: "#8FA878", h3: "#5E7A55" },
  };
  function season(m) { return [12, 1, 2].includes(m) ? "winter" : [3, 4, 5].includes(m) ? "spring" : [6, 7, 8].includes(m) ? "summer" : "autumn"; }
  function star(cx, cy, r, fill) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return `<path d="${d}Z" fill="${fill}"/>`;
  }
  function heart(cx, cy, s, fill) {
    return `<path d="M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy + s * 0.1} ${cx - s * 0.9} ${cy - s} ${cx} ${cy - s * 0.35} C${cx + s * 0.9} ${cy - s} ${cx + s * 1.4} ${cy + s * 0.1} ${cx} ${cy + s * 0.9}Z" fill="${fill}"/>`;
  }
  function leaf(cx, cy, s, rot, fill) {
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="${s}" ry="${s * 0.42}" fill="${fill}"/><path d="M${-s * 0.8} 0H${s * 0.8}" stroke="#FBF8F1" stroke-width="${Math.max(0.8, s * 0.07)}"/></g>`;
  }
  function birds(x, y, k) {
    let o = "";
    [[0, 0, 1], [18, -8, 0.8], [34, 4, 0.7]].forEach(([dx, dy, s]) => {
      const bx = x + dx * k, by = y + dy * k, w = 7 * s * k;
      o += `<path d="M${bx} ${by}q${w * 0.5} ${-w * 0.6} ${w} 0q${w * 0.5} ${-w * 0.6} ${w} 0" fill="none" stroke="#3F5B3A" stroke-width="${1.6 * k}" stroke-linecap="round"/>`;
    });
    return o;
  }
  const hills = (p) =>
    `<path d="M0 112C90 92 180 128 300 104V180H0Z" fill="${p.h1}"/><path d="M0 134C100 120 200 146 300 128V180H0Z" fill="${p.h2}"/><path d="M0 156C120 146 220 166 300 150V180H0Z" fill="${p.h3}"/>`;

  function scene(motif, s, label) {
    const p = SEASON[s || "autumn"];
    let sky = p.sky, g = "";
    switch (motif) {
      case "arch":
      case "sunrise":
        g = `<circle cx="190" cy="120" r="82" fill="${p.r1}"/><circle cx="190" cy="120" r="60" fill="${p.r2}"/><circle cx="190" cy="120" r="42" fill="${p.sun}"/>` + birds(50, 46, 1.4) + hills(p); break;
      case "sun": {
        let rays = "";
        for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; rays += `<path d="M${150 + Math.cos(a) * 48} ${76 + Math.sin(a) * 48}L${150 + Math.cos(a) * 60} ${76 + Math.sin(a) * 60}" stroke="${p.sun}" stroke-width="4" stroke-linecap="round"/>`; }
        g = `<circle cx="150" cy="76" r="36" fill="${p.sun}"/>${rays}<path d="M0 148C100 136 200 160 300 142V180H0Z" fill="${p.h2}"/><path d="M0 166C120 158 220 172 300 162V180H0Z" fill="${p.h3}"/>`; break;
      }
      case "moon":
        sky = "#2F4630";
        g = [[40, 34, 4], [88, 78, 3], [246, 30, 5], [210, 70, 3], [270, 96, 3.5], [60, 110, 3]].map(([x, y, r]) => star(x, y, r, "#F2B888")).join("") +
          `<circle cx="150" cy="74" r="36" fill="#FBF8F1"/><circle cx="168" cy="62" r="32" fill="${sky}"/><path d="M0 140C100 126 200 150 300 132V180H0Z" fill="#3F5B3A"/><path d="M0 160C120 150 220 170 300 156V180H0Z" fill="#5A7554"/>`; break;
      case "mountain":
        g = `<circle cx="226" cy="52" r="22" fill="${p.sun}"/><path d="M0 172L90 60L180 172Z" fill="${p.h2}"/><path d="M90 60L76 82L104 82Z" fill="#FBF8F1"/><path d="M110 172L200 82L300 172Z" fill="${p.h3}"/><path d="M200 82L188 98L212 98Z" fill="#FBF8F1"/><path d="M0 168C120 160 220 174 300 164V180H0Z" fill="${p.h3}"/>`; break;
      case "heart":
        g = hills(p) + heart(150, 72, 26, "#DE8644") + heart(92, 52, 10, "#F2B888") + heart(212, 44, 12, p.r2); break;
      case "leaf":
        g = hills(p) + leaf(110, 78, 34, 35, "#DE8644") + leaf(180, 66, 28, -30, "#A4511A") + leaf(236, 100, 22, 60, "#6F8A62"); break;
      case "sprout":
        g = `<circle cx="236" cy="44" r="18" fill="${p.sun}"/><path d="M0 146C100 130 200 150 300 136V180H0Z" fill="${p.h2}"/><path d="M150 146V76" stroke="#6F8A62" stroke-width="5" stroke-linecap="round"/>` + leaf(126, 84, 24, 30, "#6F8A62") + leaf(174, 72, 24, -30, "#9DB08A"); break;
      case "bird":
        g = `<circle cx="216" cy="64" r="28" fill="${p.sun}"/>` + birds(48, 52, 2.4) + birds(120, 86, 1.6) + hills(p); break;
      case "flowers": {
        g = `<path d="M0 146C100 130 200 150 300 136V180H0Z" fill="${p.h2}"/>`;
        [[80, 80, "#DE8644"], [150, 62, "#F2B888"], [220, 88, "#A4511A"]].forEach(([x, y, c]) => {
          g += `<path d="M${x} ${y}V170" stroke="#6F8A62" stroke-width="3"/>`;
          for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; g += `<circle cx="${x + Math.cos(a) * 11}" cy="${y + Math.sin(a) * 11}" r="9" fill="${c}"/>`; }
          g += `<circle cx="${x}" cy="${y}" r="6.5" fill="#FBF8F1"/>`;
        });
        break;
      }
      case "wave":
        g = `<circle cx="210" cy="54" r="24" fill="${p.sun}"/>` + [p.h1, p.h2, p.h3].map((c, i) => {
          const y = 100 + i * 25;
          return `<path d="M0 ${y}c18 -12 56 -12 75 0s56 12 75 0s56 -12 75 0s56 12 75 0V180H0Z" fill="${c}"/>`;
        }).join(""); break;
      case "star":
        g = hills(p) + star(150, 68, 34, "#DE8644") + star(86, 42, 12, "#F2B888") + star(218, 92, 10, p.r2) + star(206, 32, 7, "#FBF8F1"); break;
      case "book":
        g = `<circle cx="80" cy="46" r="16" fill="${p.sun}"/><path d="M0 160C120 150 220 170 300 156V180H0Z" fill="${p.h2}"/>` +
          `<path d="M150 136V74C130 64 110 64 96 70V132C110 126 130 126 150 136Z" fill="#FBF8F1" stroke="#3F5B3A" stroke-width="2"/><path d="M150 136V74C170 64 190 64 204 70V132C190 126 170 126 150 136Z" fill="#FBF8F1" stroke="#3F5B3A" stroke-width="2"/>` +
          [86, 98, 110].map((y) => `<path d="M106 ${y}H142M158 ${y}H194" stroke="#D8CCB3" stroke-width="2"/>`).join("") + leaf(228, 90, 18, -40, "#6F8A62"); break;
      default: g = hills(p);
    }
    return `<svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label || "Illustration"}"><rect width="300" height="180" fill="${sky}"/>${g}</svg>`;
  }

  function face(kind, fill) {
    const eyes = { great: "M14 21q4-5 8 0M26 21q4-5 8 0", tired: "M14 21h7M27 21h7" }[kind] || "M18 20h.1M30 20h.1";
    const mouth = { great: "M14 28q10 12 20 0", happy: "M16 29q8 7 16 0", okay: "M17 31h14", sad: "M16 34q8-7 16 0", tired: "M19 32q5-3 10 0" }[kind];
    return `<svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="${fill}" stroke="#3F5B3A" stroke-width="1.2"/><path d="${eyes}" fill="none" stroke="#2E3A2A" stroke-width="2.6" stroke-linecap="round"/><path d="${mouth}" fill="none" stroke="#2E3A2A" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
  const STAR_PATH = "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z";
  function starIcon(size, fill, stroke) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  }
  const sparkle = `<svg class="sparkle" width="56" height="44" viewBox="0 0 56 44" aria-hidden="true">${star(30, 16, 10, "#F2B888")}${star(48, 32, 5, "#DE8644")}${star(12, 34, 4, "#DCE4CF")}</svg>`;
  const check = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>`;
  function glass(on) {
    return `<svg width="32" height="46" viewBox="0 0 34 48" aria-hidden="true"><path d="M4 6H30L27 44H7Z" fill="${on ? "#9DB08A" : "#FBF8F1"}" stroke="#3F5B3A" stroke-width="2" stroke-linejoin="round"/><path d="M8 16q4-3 9 0t9 0" fill="none" stroke="${on ? "#FBF8F1" : "#D8CCB3"}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  const bolt = (on) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${on ? "#A4511A" : "#B7AE99"}" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>`;
  return { scene, season, face, starIcon, sparkle, check, glass, bolt, star };
})();
