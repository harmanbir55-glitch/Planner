/* Store: every page's data lives in IndexedDB on this device (falls back to
   localStorage). Reads come from an in-memory copy; writes are batched. */
window.Store = (function () {
  let db = null;
  const cache = new Map();      // key -> value
  const saved = new Set();      // keys that exist on disk (= real entries)
  const dirty = new Set();
  let timer = null;

  function openDb() {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open("becoming-planner", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("kv");
        req.onsuccess = () => { db = req.result; resolve(); };
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      } catch (e) { resolve(); }
    });
  }

  async function load() {
    await openDb();
    if (db) {
      await new Promise((resolve) => {
        try {
          const rq = db.transaction("kv").objectStore("kv").openCursor();
          rq.onsuccess = () => {
            const c = rq.result;
            if (c) { cache.set(c.key, c.value); saved.add(c.key); c.continue(); } else resolve();
          };
          rq.onerror = () => resolve();
        } catch (e) { resolve(); }
      });
    } else {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("bp:")) { cache.set(k.slice(3), JSON.parse(localStorage.getItem(k))); saved.add(k.slice(3)); }
        }
      } catch (e) {}
    }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  }

  function clone(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }

  /** Get a document; if missing, start from `def` (not saved until changed). */
  function doc(key, def) {
    if (!cache.has(key)) cache.set(key, clone(typeof def === "function" ? def() : def || {}));
    return cache.get(key);
  }
  function peek(key) { return cache.get(key); }
  function has(key) { return saved.has(key); }

  function touch(key) {
    const v = cache.get(key);
    if (v && typeof v === "object" && !Array.isArray(v)) v._u = Date.now();
    dirty.add(key);
    clearTimeout(timer);
    timer = setTimeout(flush, 350);
  }
  function put(key, value) { cache.set(key, value); touch(key); }
  function remove(key) { cache.delete(key); dirty.add(key); clearTimeout(timer); timer = setTimeout(flush, 350); }

  function flush() {
    clearTimeout(timer);
    if (!dirty.size) return;
    const keys = [...dirty]; dirty.clear();
    if (db) {
      try {
        const tx = db.transaction("kv", "readwrite"); const st = tx.objectStore("kv");
        keys.forEach((k) => {
          if (cache.has(k)) { st.put(cache.get(k), k); saved.add(k); } else { st.delete(k); saved.delete(k); }
        });
        tx.onerror = () => window.App && App.toast("Couldn't save just now. Check your iPad storage.");
      } catch (e) { keys.forEach((k) => dirty.add(k)); }
    } else {
      keys.forEach((k) => {
        try {
          if (cache.has(k)) { localStorage.setItem("bp:" + k, JSON.stringify(cache.get(k))); saved.add(k); }
          else { localStorage.removeItem("bp:" + k); saved.delete(k); }
        } catch (e) { window.App && App.toast("Storage is full. Download a backup and remove some photos."); }
      });
    }
  }

  function keys(prefix) { return [...saved].filter((k) => !prefix || k.startsWith(prefix)); }

  function exportAll() {
    flush();
    const out = { app: "becoming-planner", version: 1, exported: new Date().toISOString(), data: {} };
    saved.forEach((k) => { out.data[k] = cache.get(k); });
    return out;
  }
  function importAll(obj) {
    if (!obj || obj.app !== "becoming-planner" || !obj.data) throw new Error("This file isn't a Becoming Planner backup.");
    Object.keys(obj.data).forEach((k) => { cache.set(k, obj.data[k]); dirty.add(k); });
    flush();
    return Object.keys(obj.data).length;
  }

  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);

  async function wipe() {
    clearTimeout(timer); cache.clear(); saved.clear(); dirty.clear();
    if (db) await new Promise((res) => { try { const tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").clear(); tx.oncomplete = res; tx.onerror = res; } catch (e) { res(); } });
    try { Object.keys(localStorage).filter((k) => k.startsWith("bp:")).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    try { if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } } catch (e) {}
  }

  return { wipe, load, doc, peek, has, put, touch, remove, flush, keys, exportAll, importAll };
})();
