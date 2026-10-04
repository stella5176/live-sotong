/* 결과 시각화 (강사 대시보드 · 대형화면 공용) */
const PulseRender = (() => {
  const { WEATHER, PALETTE, esc, hash, timeAgo } = Pulse;

  function reset(el) { el.dataset.view = ""; el.innerHTML = ""; }

  /* ---------- 날씨 ---------- */
  function weather(el, list) {
    if (el.dataset.view !== "weather") {
      el.dataset.view = "weather";
      el.innerHTML = `
        <div class="wx-summary"></div>
        <div class="wx">
          ${WEATHER.map((w) => `
            <div class="wx-col" data-id="${w.id}">
              <div class="wx-count">0</div>
              <div class="wx-track"><div class="wx-bar" style="background:${w.color}"></div></div>
              <div class="wx-emoji">${w.emoji}</div>
              <div class="wx-label">${w.label}</div>
              <div class="wx-pct">0%</div>
            </div>`).join("")}
        </div>`;
    }
    const counts = Object.fromEntries(WEATHER.map((w) => [w.id, 0]));
    list.forEach((r) => { if (counts[r.value] !== undefined) counts[r.value]++; });
    const total = list.length;
    const max = Math.max(0, ...Object.values(counts));
    WEATHER.forEach((w) => {
      const col = el.querySelector(`.wx-col[data-id="${w.id}"]`);
      const c = counts[w.id];
      col.querySelector(".wx-bar").style.height = (max ? (c / max) * 100 : 0) + "%";
      col.querySelector(".wx-count").textContent = c;
      col.querySelector(".wx-pct").textContent = total ? Math.round((c / total) * 100) + "%" : "0%";
      col.classList.toggle("lead", max > 0 && c === max);
    });
    const leaders = WEATHER.filter((w) => max > 0 && counts[w.id] === max);
    el.querySelector(".wx-summary").innerHTML = total
      ? `오늘 우리의 날씨는 <b>${leaders.map((w) => w.emoji + " " + w.label).join(" · ")}</b> <span class="muted">(총 ${total}명)</span>`
      : `<span class="muted">아직 응답이 없어요. 학습자의 참여를 기다리는 중…</span>`;
  }

  /* ---------- 한 줄 소감 ---------- */
  function comments(el, list, opts = {}) {
    if (el.dataset.view !== "comment") {
      el.dataset.view = "comment";
      el.innerHTML = `<div class="cm-empty muted">아직 소감이 없어요. 학습자의 참여를 기다리는 중…</div><div class="cm-wall"></div>`;
    }
    const wall = el.querySelector(".cm-wall");
    el.querySelector(".cm-empty").style.display = list.length ? "none" : "";
    const sorted = [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const keep = new Set(sorted.map((r) => r.key));
    [...wall.children].forEach((n) => { if (!keep.has(n.dataset.key)) n.remove(); });
    sorted.forEach((r) => {
      let n = wall.querySelector(`[data-key="${CSS.escape(r.key)}"]`);
      if (!n) {
        n = document.createElement("div");
        n.className = "cm-card enter";
        n.dataset.key = r.key;
        n.style.setProperty("--accent", PALETTE[hash(r.key) % PALETTE.length]);
        n.innerHTML = `<div class="cm-text">${esc(r.value)}</div><div class="cm-meta"><span class="cm-time"></span>${
          opts.onDelete ? '<button class="cm-del" title="삭제">삭제</button>' : ""}</div>`;
        if (opts.onDelete) n.querySelector(".cm-del").onclick = () => opts.onDelete(r.key, r.value);
        setTimeout(() => n.classList.remove("enter"), 700);
      }
      n.querySelector(".cm-time").textContent = timeAgo(r.ts || Date.now());
      wall.appendChild(n);
    });
  }

  /* ---------- 워드 클라우드 ---------- */
  function cloud(el, list, opts = {}) {
    if (el.dataset.view !== "cloud") {
      el.dataset.view = "cloud";
      el.innerHTML = `<div class="cl-empty muted">아직 단어가 없어요. 학습자의 참여를 기다리는 중…</div><div class="cloud"></div>`;
      el._seen = new Set();
    }
    const box = el.querySelector(".cloud");
    el.querySelector(".cl-empty").style.display = list.length ? "none" : "";
    const map = new Map();
    list.forEach((r) => {
      const word = String(r.value || "").trim().replace(/\s+/g, " ");
      if (!word) return;
      const k = word.toLowerCase();
      if (!map.has(k)) map.set(k, { k, word, count: 0, keys: [] });
      const e = map.get(k); e.count++; e.keys.push(r.key);
    });
    const sorted = [...map.values()].sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)).slice(0, 80);
    if (!sorted.length) { box.innerHTML = ""; return; }
    const max = sorted[0].count, min = sorted[sorted.length - 1].count;
    const maxF = opts.big ? 132 : 60, minF = opts.big ? 28 : 15;
    // 큰 단어가 가운데 오도록 좌우 교차 배치
    const arranged = [];
    sorted.forEach((w, i) => (i % 2 ? arranged.push(w) : arranged.unshift(w)));
    box.innerHTML = arranged.map((w) => {
      const t = max === min ? 1 : Math.sqrt((w.count - min) / (max - min));
      const size = Math.round(minF + (maxF - minF) * (sorted.length === 1 ? 1 : t));
      const isNew = !el._seen.has(w.k);
      return `<span class="cl-word${isNew ? " pop" : ""}${opts.onDelete ? " deletable" : ""}" data-k="${esc(w.k)}"
        title="${esc(w.word)} · ${w.count}회" style="font-size:${size}px;color:${PALETTE[hash(w.k) % PALETTE.length]};font-weight:${t > 0.55 ? 800 : t > 0.25 ? 700 : 600}">${esc(w.word)}${
        opts.showCount ? `<sup>${w.count}</sup>` : ""}</span>`;
    }).join("");
    sorted.forEach((w) => el._seen.add(w.k));
    if (opts.onDelete) {
      box.querySelectorAll(".cl-word").forEach((s) => {
        s.onclick = () => { const w = map.get(s.dataset.k); opts.onDelete(w.keys, w.word); };
      });
    }
  }

  function render(el, activity, list, opts) {
    if (activity === "weather") weather(el, list);
    else if (activity === "comment") comments(el, list, opts);
    else if (activity === "wordcloud") cloud(el, list, opts);
  }

  return { reset, render, weather, comments, cloud };
})();
