# LIVE 소통판 — 실시간 양방향 소통 앱

| 화면 | 파일 | 용도 |
|---|---|---|
| 시작 | `index.html` | 강사 시작 / 학습자 코드 입력 |
| 강사 모드 (PC) | `host.html` | 활동 선택·실시간 대시보드·확인하기 |
| 대형 화면 | `screen.html` | 강사 모드 상단 [대형화면 열기]로 새 창 열림 |
| 학습자 (모바일) | `join.html?room=방코드` | QR로 접속 |

## 1. 바로 미리보기 (데모 모드)
`public/config.js`가 비어 있으면 **데모 모드**로 돌아갑니다.
같은 PC 브라우저의 탭끼리만 동기화되므로, `host.html`을 열고 [대형화면 열기] → 다른 탭에서 `join.html?room=방코드`를 열어 테스트하세요.
(파일 더블클릭보다 VS Code Live Server 등 로컬 서버로 여는 것을 권장)

## 2. Firebase 연결 (휴대폰 실시간 연동)
1. https://console.firebase.google.com → **프로젝트 추가**
2. 왼쪽 메뉴 **빌드 > Realtime Database > 데이터베이스 만들기** (위치: `asia-southeast1 (싱가포르)`, **잠금 모드**로 시작)
3. **규칙** 탭에 `database.rules.json` 내용을 붙여넣고 **게시**
4. **프로젝트 설정(톱니) > 내 앱 > 웹(</>)** 앱 추가 → 표시되는 `firebaseConfig` 값을 `public/config.js`에 붙여넣기
   - `databaseURL` 항목이 반드시 있어야 합니다.

## 3. 배포 (Firebase Hosting, 무료)
```bash
npm install -g firebase-tools
firebase login
cd live-sotong
firebase use --add        # 방금 만든 프로젝트 선택
firebase deploy
```
배포 후 나오는 `https://프로젝트ID.web.app/host.html` 이 강사 주소입니다. QR은 자동으로 이 주소 기준으로 만들어집니다.

## 사용 흐름
1. 강사 PC에서 `host.html` → 상단 **[대형화면 열기]** → 빔프로젝터 쪽으로 창 이동 후 **[전체화면]**
2. 왼쪽 메뉴에서 제목·질문을 수정하고 **[이 활동 시작]** → 학습자 폰과 대형화면이 자동 전환
3. 대형화면에는 QR + 실시간 응답 수가 표시됨, 강사 화면엔 실시간 대시보드
4. **[확인하기]** → 대형화면에 결과가 공개되고, 이후 응답도 실시간 반영 / **[결과 숨기기]**로 되돌림
5. 부적절한 소감·단어는 강사 대시보드에서 클릭하여 삭제 가능

## 옵션 (`config.js`)
- `hostPin`: 강사 화면 비밀번호 (간단 보호용)
- `publicBaseUrl`: QR 주소를 고정하고 싶을 때 (예: 커스텀 도메인)

## 참고
- 데이터 구조: `rooms/{방코드}/state`, `responses/{회차}/…`, `participants/{학습자}`
- 보안 규칙은 수업용 간편 설정(방 코드를 아는 사람이 읽기/쓰기 가능)입니다. 외부 공개 행사라면 Firebase 익명 인증 + 강사 계정 규칙을 추가하는 것을 권장합니다.
