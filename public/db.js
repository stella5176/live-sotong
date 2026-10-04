/* 데이터 계층: Firebase Realtime Database 또는 데모(localStorage) 모드 */
(function () {
  const cfg = window.PULSE_CONFIG || {};
  const fb = cfg.firebase || {};
  const isDemo = !(fb.apiKey && fb.databaseURL);

  const parts = (p) => String(p).split("/").filter(Boolean);
  const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

  function getAt(tree, path) {
    let n = tree;
    for (const p of parts(path)) {
      if (n == null || typeof n !== "object") return null;
      n = n[p];
    }
    return n === undefined ? null : n;
  }
  function setAt(tree, path, val) {
    const ps = parts(path);
    let n = tree;
    for (let i = 0; i < ps.length - 1; i++) {
      if (typeof n[ps[i]] !== "object" || n[ps[i]] === null) n[ps[i]] = {};
      n = n[ps[i]];
    }
    const last = ps[ps.length - 1];
    if (val === null || val === undefined) delete n[last];
    else n[last] = clone(val);
  }
  function genKey() {
    return Date.now().toString(36).padStart(9, "0") + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- 데모 모드 ---------- */
  function createLocal() {
    const KEY = "pulse-demo-db";
    const load = () => {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    };
    let tree = load();
    const listeners = new Set();
    const emit = () => listeners.forEach((l) => l.cb(clone(getAt(tree, l.path))));
    const commit = (fn) => {
      tree = load();
      fn(tree);
      try { localStorage.setItem(KEY, JSON.stringify(tree)); } catch (e) {}
      emit();
      return Promise.resolve();
    };
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) { tree = load(); emit(); }
    });
    return {
      mode: "demo",
      set: (p, v) => commit((t) => setAt(t, p, v)),
      update: (p, obj) => commit((t) => Object.keys(obj).forEach((k) => setAt(t, p + "/" + k, obj[k]))),
      push(p, v) { const k = genKey(); return this.set(p + "/" + k, v).then(() => k); },
      remove(p) { return this.set(p, null); },
      get: (p) => Promise.resolve(clone(getAt(load(), p))),
      listen(p, cb) {
        const l = { path: p, cb };
        listeners.add(l);
        cb(clone(getAt(tree, p)));
        return () => listeners.delete(l);
      },
      presence(p, v) {
        this.set(p, v);
        window.addEventListener("pagehide", () => this.remove(p));
      }
    };
  }

  /* ---------- Firebase 모드 ---------- */
  async function createFirebase() {
    const V = "10.12.2";
    const appMod = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    const d = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
    const app = appMod.initializeApp(fb);
    const db = d.getDatabase(app);
    const r = (p) => d.ref(db, p);
    return {
      mode: "firebase",
      set: (p, v) => d.set(r(p), v),
      update: (p, o) => d.update(r(p), o),
      push: (p, v) => { const nr = d.push(r(p)); return d.set(nr, v).then(() => nr.key); },
      remove: (p) => d.remove(r(p)),
      get: (p) => d.get(r(p)).then((s) => s.val()),
      listen: (p, cb) => d.onValue(r(p), (s) => cb(s.val())),
      presence(p, v) {
        const pr = r(p);
        d.onValue(r(".info/connected"), (s) => {
          if (s.val() === true) d.onDisconnect(pr).remove().then(() => d.set(pr, v));
        });
      }
    };
  }

  window.PulseDB = {
    isDemo,
    ready: isDemo ? Promise.resolve(createLocal()) : createFirebase()
  };
})();
