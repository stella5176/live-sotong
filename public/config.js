/* =========================================================
 *  LIVE 소통판 설정 파일
 *  1) Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)에서 firebaseConfig 값을 복사해 아래에 붙여넣으세요.
 *     ※ databaseURL 이 꼭 들어 있어야 합니다 (Realtime Database 생성 후 표시됨).
 *  2) 값이 비어 있으면 '데모 모드'로 동작합니다.
 *     (데모 모드 = 같은 PC·같은 브라우저의 탭/창끼리만 실시간 동기화, 휴대폰 연동 불가)
 * ========================================================= */
window.PULSE_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAjE3PvPsNiwy24-s9JbK5ddvkak_9uyc4",
    authDomain: "live-sotong.firebaseapp.com",
    databaseURL: "https://live-sotong-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-sotong",
    storageBucket: "live-sotong.firebasestorage.app",
    messagingSenderId: "980226540685",
    appId: "1:980226540685:web:e0f57c59e6aede85c1cec4"
  },

  // QR 코드에 넣을 학습자 접속 주소의 기준 URL (비워두면 현재 접속 주소 기준으로 자동 생성)
  // 예) "https://my-class.web.app/"
  publicBaseUrl: "",

  // 강사 화면 진입 비밀번호 (비워두면 비밀번호 없이 진입)
  hostPin: ""
};
