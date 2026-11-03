# V-Lab 작업 인수인계 (Claude 세션용)

이 파일은 새 Claude 세션이 시작될 때 자동으로 읽힙니다. 사람이 읽는 안내는 `README.md`, 디자인 규칙은 `docs/DESIGN.md`.

## 프로젝트

- 학교 가상 실험실 정적 사이트. 빌드 없음, GitHub Pages로 배포 (푸시하면 1~2분 뒤 반영, 브라우저 캐시는 Ctrl+F5).
- 저장소 `08hwichemi/v-lab`, 작업 브랜치 `claude/awesome-johnson-vp7823`, 사이트 `https://08hwichemi.github.io/v-lab/`.
- 운영자 휘쌤(화학 교사). 다른 선생님들이 만든 실험 HTML을 받아서 올리는 일이 주 업무.
- 모든 사용자 응답과 커밋 메시지는 **한국어**로 쓴다.

## 현재 등록된 실험 (data/labs.js, 13개)

| 과목 | id | 제목 | 제작 |
|---|---|---|---|
| 화학 | chem-smart-lab | 화학 스마트 실험실 (7가지, `experiments[]`) | 휘쌤 |
| 화학 | organic-structure | 구조식 그리기 (OpenChemLib 편집기) | 휘쌤 |
| 화학 | coin-entropy | 동전 던지기로 보는 엔트로피 | 홍채린 |
| 화학 | lewis-dot | 루이스 전자점식 연습실 | (미정 · 성함 확인 필요) |
| 화학 | vsepr-lab | VSEPR 분자 모형 공방 | (미정 · 성함 확인 필요) |
| 화학 | metal-ionization | 금속의 이온화 경향 실험실 | 홍채린 |
| 화학 | chemical-cell | 화학 전지 실험실 | 홍채린 |
| 지구 | constellation | 별자리 탐험 | 홍채린 |
| 지구 | plate-tectonics / elnino / foehn / planet-motion / star-evolution | 판구조론 · 엘니뇨 · 푄 · 행성의 겉보기 운동 · 별의 진화 | 장미나 |

물리·생명과학은 아직 비어 있음.

## 외부 선생님 실험을 올리는 절차 (지금까지의 방식)

1. 파일을 `labs/<과목>/영문-이름.html` 로 복사한다 (원본은 그대로 두고 복사본만 고친다).
2. **테마 적용** — `lab-theme.css` 전체를 링크하지 **않는다** (`.note .seg .btn .panel .row` 같은 공용 클래스가 선생님 파일의 클래스와 겹쳐 레이아웃이 깨진 적 있음). 대신:
   - `<style>` 앞에 글꼴·색 토큰만 담은 블록을 넣는다 (`labs/earth/constellation.html` 머리 부분의 `/* V-Lab 공용 글꼴·색 토큰만 가져옴 */` 블록을 그대로 복사).
   - 파일의 `</style>` 바로 앞에 `/* ===== V-Lab 공용 테마에 맞춘 덮어쓰기 ===== */` 블록을 붙인다. 기준: 흰 바탕, 글꼴 `var(--font)`, 본문 #111, 보조 #6B7280, 선 #E6E8EC, 강조 #3182F6, 모서리 8/12px, 그림자 없음, 선택 버튼은 검정(#111) 바탕. 캔버스(밤하늘·바다 단면·H-R도)는 원래 색을 유지.
   - `<body>` 바로 뒤에 `<script>if(/embed/.test(location.hash))document.body.classList.add("vlab-embed");</script>` 를 넣고, CSS에 `body.vlab-embed header{display:none}` (파일 자체 제목 숨김)을 둔다.
   - `<title>` 은 `제목 · V-Lab`.
   - 자체 테마로 만든 실험(coin-entropy, chem-smart-lab, organic-structure)만 `lab-theme.css` 를 그대로 쓴다.
3. **검토** — 백그라운드 에이전트에게 파일별로 (A) 코드/런타임 오류 (B) 교과 내용 오류 (C) UX 함정을 찾아 줄 번호와 구체적 수정안을 받게 한 뒤, 직접 패치하고 Playwright로 재현·검증한다. 수정 내용은 커밋 메시지와 사용자 보고에 파일별로 정리한다.
4. **등록** — `data/labs.js` 에 항목 추가 (`author` 에 선생님 성함, `unit` 은 교과·단원, `added` 날짜).
5. **썸네일** — `assets/img/thumbs/<id>/0.png` (944×522, 뷰포트 1180 폭에서 `#embed` 로 열어 상단을 잘라 캡처). `scripts/thumbs.js` 참고.
6. **확인** — 1830 폭 전체 화면, 1180 폭, 뷰어(`lab.html?id=...`)를 캡처해 눈으로 확인한 뒤 커밋·푸시.

## 검증 환경

- 클라우드 세션에는 Playwright·Chromium이 설치되어 있다. `require('playwright')` 가 어느 디렉터리에서나 된다.
- 로컬 서버: 저장소 루트에서 `python3 -m http.server 8765` (끊기면 다시 띄운다).
- 페이지 오류 확인 패턴: `page.on('pageerror')` + `console.error` 수집, 시작 모달을 닫고 주요 버튼을 눌러 본다.
- 인라인 스크립트 문법 검사: `new Function(scriptText)` 로 각 `<script>` 를 파싱해 본다.

## 사이트 구조 요점

- `index.html` 해시 라우팅, `lab.html` 뷰어는 iframe 으로 `file#exp=N&embed` 를 연다. 뷰어 탭 줄에는 같은 과목의 모든 실험이 번호 없이 한 줄로 나오고, 파일이 다른 실험을 누르면 그 파일로 이동한다.
- `assets/js/tools.js` 도구 패널: 환산 · 공학용 키패드 계산기(키보드 연동) · 과목별 부록(접이식, 색 점) 순서는 물리·화학·생명·지구.
- `assets/js/site.js` 의 `VL.items(subject)` 가 등록부를 카드 단위로 펼친다.
- 화학 스마트 실험실의 가열·냉각은 실제 경과 시간 기준(가열 0.25 °C/s, 냉각 0.3 → 정체 8 s → 고체 0.45 °C/s). 사용자가 속도에 민감하니 바꾸기 전에 묻는다.
- 구조식 그리기: OpenChemLib 편집기는 CSS `zoom` 1.8배 + 포인터 좌표 보정 + `devicePixelRatio` 재정의(라이브러리 로드 **전**에 설정)로 크게 그린다. 자세한 사연은 파일 안 주석.

## 사용자 선호 (반복해서 요구한 것)

- 결과는 꼭 스크린샷으로 확인하고 나서 올린다. "올라갔다"고 하기 전에 푸시까지 끝낸다.
- 글자는 크고 읽기 쉽게, 레이아웃은 열 높이를 맞추고, 흰색 미니멀 테마를 일관되게.
- 중간 보고도 한국어로. 영어로 쓰면 지적받는다.
- 선생님 성함은 `author` 에 반드시 넣는다. 모르면 사용자에게 묻는다.

## 미해결

- `lewis-dot`, `vsepr-lab` 의 제작자 성함이 비어 있음.
