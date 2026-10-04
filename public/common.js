/* 공통 상수 · 유틸 · QR 모달 */
const Pulse = (() => {
  const ACTIVITIES = {
    weather: { icon: "🌤️", title: "오늘의 기분 날씨", prompt: "오늘 나의 기분을 날씨로 표현하면?" },
    comment: { icon: "💬", title: "한 줄 소감", prompt: "오늘 교육에서 느낀 점을 한 줄로 남겨주세요" },
    wordcloud: { icon: "☁️", title: "워드 클라우드", prompt: "오늘 교육을 한 단어로 표현한다면?" }
  };

  const WEATHER = [
    { id: "sunny", emoji: "☀️", label: "맑음", desc: "최고예요!", color: "#FFB020" },
    { id: "partly", emoji: "🌤️", label: "구름 조금", desc: "좋아요", color: "#3DC8F0" },
    { id: "cloudy", emoji: "☁️", label: "흐림", desc: "그저 그래요", color: "#9AA6B8" },
    { id: "rainy", emoji: "🌧️", label: "비", desc: "조금 처져요", color: "#4C7DF0" },
    { id: "storm", emoji: "⛈️", label: "천둥번개", desc: "힘들어요", color: "#7B5CE0" }
  ];

  const PALETTE = ["#6C5CE7", "#00B894", "#E84393", "#0984E3", "#F39C12", "#E17055", "#00A8A8", "#8E44AD", "#2D9CDB", "#D35400"];

  const param = (n) => new URLSearchParams(location.search).get(n);
  const genRoom = () => String(Math.floor(100000 + Math.random() * 900000));

  function baseUrl() {
    const c = (window.PULSE_CONFIG || {}).publicBaseUrl;
    if (c) return c.endsWith("/") ? c : c + "/";
    return location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  }
  const joinUrl = (room) => baseUrl() + "join.html?room=" + room;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const hash = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  function uid() {
    // 데모 모드에선 탭마다 다른 학습자로 취급(같은 PC에서 여러 탭으로 테스트 가능)
    const st = window.PulseDB && PulseDB.isDemo ? sessionStorage : localStorage;
    let u = null;
    try { u = st.getItem("pulse-uid"); } catch (e) {}
    if (!u) {
      u = "u" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      try { st.setItem("pulse-uid", u); } catch (e) {}
    }
    return u;
  }

  const toList = (obj) => (obj ? Object.entries(obj).map(([key, v]) => ({ key, ...v })) : []);

  function timeAgo(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return "방금";
    if (s < 3600) return Math.floor(s / 60) + "분 전";
    return Math.floor(s / 3600) + "시간 전";
  }

  function makeQR(el, text, size) {
    el.innerHTML = "";
    if (!window.qrcode) { el.textContent = "QR 라이브러리를 불러오지 못했습니다"; return; }
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = el.querySelector("svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.style.display = "block";
  }

  function qrModal(room) {
    let ov = document.getElementById("qrModal");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "qrModal";
      ov.className = "qr-overlay";
      ov.innerHTML = `
        <div class="qr-dialog" role="dialog" aria-modal="true" aria-label="참여 QR 코드">
          <button class="qr-close" aria-label="닫기">✕</button>
          <div class="qr-head">휴대폰 카메라로 스캔해 참여하세요</div>
          <div class="qr-box"></div>
          <div class="qr-code-label">방 코드 <b></b></div>
          <div class="qr-url"></div>
          ${window.PulseDB && PulseDB.isDemo ? '<div class="qr-warn">데모 모드에서는 휴대폰 접속이 되지 않습니다. config.js에 Firebase 설정 후 배포하세요.</div>' : ""}
        </div>`;
      document.body.appendChild(ov);
      ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".qr-close")) ov.classList.remove("show"); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") ov.classList.remove("show"); });
    }
    const url = joinUrl(room);
    const size = Math.floor(Math.min(window.innerHeight * 0.58, window.innerWidth * 0.7, 640));
    makeQR(ov.querySelector(".qr-box"), url, size);
    ov.querySelector(".qr-code-label b").textContent = room;
    ov.querySelector(".qr-url").textContent = url;
    ov.classList.add("show");
  }

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  return { ACTIVITIES, WEATHER, PALETTE, param, genRoom, joinUrl, esc, hash, store, uid, toList, timeAgo, makeQR, qrModal, toast };
})();
