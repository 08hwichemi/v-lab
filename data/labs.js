/* =====================================================================
 *  V-Lab 실험 등록부 (Registry)
 *  ---------------------------------------------------------------
 *  새 실험을 추가할 때 고치는 파일은 이것 하나뿐입니다.
 *   1) HTML 파일을 labs/<과목>/ 폴더에 넣는다  (파일명: 영문 소문자-하이픈.html)
 *   2) 아래 labs 배열에 항목을 하나 추가한다   (manage.html 에서 자동 생성 가능)
 *   3) 커밋·푸시하면 끝. 빌드 과정 없음.
 *
 *  fetch 가 아니라 <script> 로 읽기 때문에 파일을 더블클릭해 열어도 동작합니다.
 * ===================================================================== */

window.VLAB = {
  site: {
    name: "V-Lab",
    fullName: "V-Lab 가상 실험실",
    tagline: "물리·화학·생명·지구과학·환경 가상 실험을 설치 없이 브라우저에서.",
    school: "",            // 예: "○○고등학교" (비우면 '가상 실험실'로 표시)
    manager: "휘쌤",       // 운영자
    contact: ""            // 예: 이메일 (비우면 표시 안 함)
  },

  /* 과목 -------------------------------------------------------------
   * id 는 labs[].subject 와 폴더명(labs/<id>/)에 쓰입니다.
   * color 는 assets/css/site.css 의 --phys/--chem/--bio/--earth/--env 와 맞춰 둡니다.
   */
  subjects: [
    { id: "physics",   name: "물리학",   short: "물리", color: "#2F6BFF", desc: "힘과 운동, 파동, 전자기, 에너지." },
    { id: "chemistry", name: "화학",     short: "화학", color: "#F0640A", desc: "물질의 구조와 변화, 용액, 평형, 산·염기 반응." },
    { id: "biology",   name: "생명과학", short: "생명", color: "#12A66B", desc: "세포와 유전, 물질대사, 생태계." },
    { id: "earth",     name: "지구과학", short: "지구", color: "#7A5AF8", desc: "지구 내부, 대기와 해양, 천체의 운동." },
    { id: "environment", name: "환경",   short: "환경", color: "#0E9AA7", desc: "기후변화와 탄소중립, 자원 순환, 생태와 환경." }
  ],

  /* 실험 -------------------------------------------------------------
   * id          고유 식별자 (주소에 쓰임, 영문 소문자-하이픈)
   * subject     과목 id
   * title       제목
   * summary     한두 문장 소개 (뷰어 정보 패널에 표시)
   * file        HTML 경로 (저장소 루트 기준)
   * author      제작자
   * grade       대상 학년 배열            예) ["고2", "고3"]  (2022 개정: 일반 선택 → 고2, 진로 선택 → 고2·고3. experiments 항목에도 둘 수 있음)
   * unit        교과 · 단원               예) "물질과 에너지 · 용액의 성질" (2022 개정 교육과정 과목·단원명)
   * tags        검색 키워드 배열
   * thumbnail   (선택) 썸네일 이미지 경로. 없으면 회색 자리표시
   * experiments (선택) 한 파일 안에 실험이 여럿일 때. 각 실험이 카드 하나로 표시됨
   *               { title, hash, thumb?, unit?, tags?, summary? }
   *               hash 는 파일이 주소 해시로 읽는 값 (예: "exp=0" → file.html#exp=0)
   * added       등록일 YYYY-MM-DD (최신순 정렬 기준)
   * featured    (선택) true 면 '추천순' 정렬에서 앞에 옴
   */
  labs: [
    {
      id: "mechanics-energy",
      subject: "physics",
      title: "역학과 에너지 가상 실험실",
      summary: "포물선 운동, 단진자, 케플러 법칙, 인공위성 궤도, 도플러 효과, 일반 상대성 이론 6가지를 학생이 직접 조건을 바꾸고 측정·기록하는 실험실입니다. 측정 기록표와 그래프(발사각–거리, T²–L, T²–a³)가 들어 있고 기록은 표로 복사할 수 있습니다.",
      file: "labs/physics/mechanics-energy.html",
      author: "하영우",
      grade: ["고2", "고3"],
      unit: "역학과 에너지 · 시공간과 운동 · 탄성파와 소리",
      tags: ["포물선 운동", "단진자", "케플러 법칙", "인공위성", "도플러 효과", "일반 상대성 이론", "중력 시간 지연"],
      experiments: [
        { title: "포물선 운동",     hash: "exp=0", thumb: "assets/img/thumbs/mechanics-energy/0.png", unit: "역학과 에너지 · 시공간과 운동", tags: ["발사각", "수평 도달 거리", "속도 벡터"] },
        { title: "단진자",         hash: "exp=1", thumb: "assets/img/thumbs/mechanics-energy/1.png", unit: "역학과 에너지 · 탄성파와 소리", tags: ["주기", "T²–L 그래프", "역학적 에너지"] },
        { title: "케플러 법칙",     hash: "exp=2", thumb: "assets/img/thumbs/mechanics-energy/2.png", unit: "역학과 에너지 · 시공간과 운동", tags: ["타원 궤도", "면적 속도", "T²–a³"] },
        { title: "인공위성 궤도",   hash: "exp=3", thumb: "assets/img/thumbs/mechanics-energy/3.png", unit: "역학과 에너지 · 시공간과 운동", tags: ["뉴턴의 사고 실험", "원 궤도 속력", "탈출 속력"] },
        { title: "도플러 효과",     hash: "exp=4", thumb: "assets/img/thumbs/mechanics-energy/4.png", unit: "역학과 에너지 · 탄성파와 소리", tags: ["파면", "진동수", "충격파"] },
        { title: "일반 상대성 이론", hash: "exp=5", thumb: "assets/img/thumbs/mechanics-energy/5.png", unit: "역학과 에너지 · 시공간과 운동", tags: ["시공간의 휘어짐", "중력 시간 지연", "블랙홀"] }
      ],
      added: "2026-11-03",
      featured: true
    },
    {
      id: "pendulum-labnote",
      subject: "physics",
      title: "단진자 디지털 랩노트",
      summary: "실제 단진자 실험을 위한 디지털 실험 노트입니다. 이론(단진자, 주기 공식, 등시성, 변인 통제) → 준비물 점검 → 실 길이·추의 질량·진폭을 바꾼 측정 기록(사진 첨부) → T–L, T²–L 그래프와 중력 가속도 계산 → 고찰 → A4 결과보고서 인쇄·PDF 저장까지 한 화면에서 진행합니다. 기록은 브라우저에 자동 저장되고 JSON으로 백업할 수 있습니다.",
      file: "labs/physics/pendulum-labnote.html",
      author: "송다혜",
      grade: ["고2", "고3"],
      unit: "역학과 에너지 · 탄성파와 소리",
      tags: ["단진자", "주기", "랩노트", "실험 보고서", "T²–L 그래프", "중력 가속도", "변인 통제"],
      thumbnail: "assets/img/thumbs/pendulum-labnote/0.png",
      added: "2026-11-04"
    },
    {
      id: "wave-reflection",
      subject: "physics",
      title: "고정단 반사와 자유단 반사",
      summary: "속력이 다른 두 줄을 이어 붙이고 마루(또는 골) 펄스를 보내, 경계면에서 생기는 반사파와 투과파의 모양을 관찰합니다. 빠른 줄→느린 줄(고정단 반사, 위상 180° 변함)과 느린 줄→빠른 줄(자유단 반사)을 나란히 비교하고, 두 줄의 속력을 직접 바꾸며 반사파가 뒤집히는 조건을 찾습니다. 일시정지·한 칸씩 보기·시간 슬라이더, 지나간 모습 남기기, 매질의 한 점(리본) 표시 기능이 있습니다.",
      file: "labs/physics/wave-reflection.html",
      author: "하영우",
      grade: ["고2", "고3"],
      unit: "역학과 에너지 · 탄성파와 소리",
      tags: ["파동의 반사", "고정단 반사", "자유단 반사", "투과파", "위상 변화", "경계면", "펄스"],
      thumbnail: "assets/img/thumbs/wave-reflection/0.png",
      added: "2026-11-09"
    },
    {
      id: "chem-smart-lab",
      subject: "chemistry",
      title: "화학 스마트 실험실",
      summary: "묽은 용액의 총괄성(증기압 내림·끓는점 오름·어는점 내림·삼투압)부터 중화 적정, 르샤틀리에 원리, 고체 결정 구조 3D까지 7가지 시뮬레이션을 한 파일에 담았습니다.",
      file: "labs/chemistry/chem-smart-lab.html",
      author: "휘쌤",
      grade: ["고2", "고3"],
      unit: "물질과 에너지 · 화학",
      tags: ["총괄성", "묽은 용액", "화학 평형", "르샤틀리에", "결정 구조", "적정"],
      experiments: [
        { title: "고체 결정 구조 3D", hash: "exp=0", thumb: "assets/img/thumbs/chem-smart-lab/0.png", unit: "물질과 에너지 · 물질의 세 가지 상태", tags: ["단순 입방", "체심 입방", "면심 입방", "배위수"] },
        { title: "증기압력 내림",     hash: "exp=1", thumb: "assets/img/thumbs/chem-smart-lab/1.png", unit: "물질과 에너지 · 용액의 성질", tags: ["라울 법칙", "몰분율"] },
        { title: "끓는점 오름",       hash: "exp=2", thumb: "assets/img/thumbs/chem-smart-lab/2.png", unit: "물질과 에너지 · 용액의 성질", tags: ["증기압 곡선", "외부 압력"] },
        { title: "어는점 내림",       hash: "exp=3", thumb: "assets/img/thumbs/chem-smart-lab/3.png", unit: "물질과 에너지 · 용액의 성질", tags: ["결빙", "육각 격자"] },
        { title: "삼투압과 동적 평형", hash: "exp=4", thumb: "assets/img/thumbs/chem-smart-lab/4.png", unit: "물질과 에너지 · 용액의 성질", tags: ["반트호프", "역삼투"] },
        { title: "중화 적정",         hash: "exp=5", thumb: "assets/img/thumbs/chem-smart-lab/5.png", unit: "화학 · 역동적인 화학 반응", grade: ["고2"], tags: ["뷰렛", "지시약", "적정 곡선"] },
        { title: "르샤틀리에 원리",   hash: "exp=6", thumb: "assets/img/thumbs/chem-smart-lab/6.png", unit: "화학 · 화학 평형", grade: ["고2"], tags: ["평형 이동", "NO₂", "암모니아 합성"] }
      ],
      added: "2026-10-27",
      featured: true
    },
    {
      id: "organic-structure",
      subject: "chemistry",
      title: "구조식 그리기",
      summary: "분자 편집기로 탄소 화합물의 구조식을 직접 그리고, 펼친 구조식(모든 원자)·축약 구조식·골격 구조식으로 바꿔 가며 비교합니다. 분자식·분자량·불포화도·작용기가 실시간으로 나오고, 이성질체를 모두 찾는 과제에서 같은 물질인지 이성질체인지 바로 판정해 줍니다.",
      file: "labs/chemistry/organic-structure.html",
      author: "휘쌤",
      grade: ["고2", "고3"],
      unit: "화학 반응의 세계 · 탄소 화합물과 반응",
      tags: ["구조식", "펼친 구조식", "축약 구조식", "이성질체", "작용기", "분자 편집기"],
      thumbnail: "assets/img/thumbs/organic-structure/0.png",
      added: "2026-10-27",
      featured: true
    }
,
    {
      id: "coin-entropy",
      subject: "chemistry",
      title: "동전 던지기로 보는 엔트로피",
      summary: "동전을 던지거나 하나씩 뒤집으며 앞면 비율이 왜 반반으로 모이는지 봅니다. 배열의 가짓수 W 와 S = k ln W, 이항 분포 그래프로 엔트로피·자발성·동적 평형을 연결합니다.",
      file: "labs/chemistry/coin-entropy.html",
      author: "홍채린",
      grade: ["고2", "고3"],
      unit: "물질과 에너지 · 화학 변화의 자발성",
      tags: ["엔트로피", "자발적 반응", "동적 평형", "확률", "이항 분포"],
      thumbnail: "assets/img/thumbs/coin-entropy/0.png",
      added: "2026-10-28"
    }
,
    {
      id: "lewis-dot",
      subject: "chemistry",
      title: "루이스 전자점식 연습실",
      summary: "원자를 놓고 공유·비공유 전자쌍을 채워 옥텟을 완성하는 루이스 전자점식 연습. 단계별 미션(단일·다중 결합, 다원자 이온, 형식 전하, 옥텟의 예외)과 자유 그리기, 3분 도전 모드가 있고 형식 전하·쌍극자 모멘트·옥텟 상태를 표시할 수 있습니다.",
      file: "labs/chemistry/lewis-dot.html",
      author: "",
      grade: ["고2"],
      unit: "화학 · 물질의 구조와 성질",
      tags: ["루이스 전자점식", "옥텟 규칙", "공유 결합", "형식 전하", "미션"],
      thumbnail: "assets/img/thumbs/lewis-dot/0.png",
      added: "2026-10-29"
    },
    {
      id: "vsepr-lab",
      subject: "chemistry",
      title: "VSEPR 분자 모형 공방",
      summary: "2D 구조식을 그리고 3D로 변환해 전자쌍 반발 이론에 따른 분자 모양과 결합각을 확인합니다. 비공유 전자쌍·결합각·쌍극자 모멘트 표시, 극성 분석, 미션과 퀴즈가 들어 있습니다.",
      file: "labs/chemistry/vsepr-lab.html",
      author: "",
      grade: ["고2"],
      unit: "화학 · 물질의 구조와 성질",
      tags: ["VSEPR", "전자쌍 반발", "분자 모양", "결합각", "극성", "3D"],
      thumbnail: "assets/img/thumbs/vsepr-lab/0.png",
      added: "2026-10-29"
    },
    {
      id: "metal-ionization",
      subject: "chemistry",
      title: "금속의 이온화 경향 실험실",
      summary: "여러 금속을 여러 수용액·묽은 염산에 넣어 반응 여부(금속 석출, 기포, 용액 색 변화)를 관찰하고, 전자저울로 질량 변화를 재고, 결과표와 순서 정하기로 금속의 이온화 경향 순서를 스스로 찾아냅니다. 원자·이온 수준 돋보기, 이온 수 그래프, 반응식 해석, 미션이 들어 있습니다.",
      file: "labs/chemistry/metal-ionization.html",
      author: "홍채린",
      grade: ["고2", "고3"],
      unit: "화학 반응의 세계 · 산화 환원 반응",
      tags: ["이온화 경향", "산화 환원", "금속의 반응성", "석출", "실험 노트"],
      thumbnail: "assets/img/thumbs/metal-ionization/0.png",
      added: "2026-11-02"
    },
    {
      id: "chemical-cell",
      subject: "chemistry",
      title: "화학 전지 실험실",
      summary: "볼타 전지와 다니엘 전지를 직접 조립합니다. 전극 금속·전해질·농도·염다리·저항을 고르고 전압계·전류계를 읽으며, 금속판 표면 확대 화면과 전압·전류 그래프로 산화 전극과 환원 전극에서 일어나는 일을 확인합니다. 미션·확인 문제와 전기화학 개념 정리가 들어 있습니다.",
      file: "labs/chemistry/chemical-cell.html",
      author: "홍채린",
      grade: ["고2", "고3"],
      unit: "화학 반응의 세계 · 산화 환원 반응",
      tags: ["화학 전지", "볼타 전지", "다니엘 전지", "염다리", "표준 환원 전위", "분극"],
      thumbnail: "assets/img/thumbs/chemical-cell/0.png",
      added: "2026-11-02"
    },
    {
      id: "molarity-lab",
      subject: "chemistry",
      title: "몰농도 실험실",
      summary: "보호 장비를 갖추고 들어가 부피 플라스크로 정해진 몰농도의 용액을 직접 만듭니다. 필요한 질량 계산 → 부피 플라스크 고르기 → 저울로 달기·녹이기·옮기기·표선 맞추기·섞기 → 시약병에 옮겨 라벨 붙이기 순서로 진행하고, 만든 용액을 피펫으로 덜어 희석(M₁V₁ = M₂V₂)하는 실험과 시약장, 몰·몰농도·부피 플라스크·희석 개념 정리가 들어 있습니다. 순서를 틀리면 멈추고 안내받는 방식과, 멈추지 않고 실수가 농도 오차로 나타나는 방식을 고를 수 있습니다.",
      file: "labs/chemistry/molarity-lab.html",
      author: "홍채린",
      grade: ["고2"],
      unit: "화학 · 화학의 언어",
      tags: ["몰농도", "몰", "부피 플라스크", "표선", "피펫", "희석", "용액 만들기"],
      thumbnail: "assets/img/thumbs/molarity-lab/0.png",
      added: "2026-11-24"
    },
    {
      id: "buffer-solution-lab",
      subject: "chemistry",
      title: "완충 용액 실험실",
      summary: "증류수와 완충 용액에 같은 양의 산·염기를 넣어 pH 변화를 비교하고, 입자 모형으로 H₃O⁺와 OH⁻가 남는지 사라지는지 봅니다. 완충 용량(농도·성분비), 적정 곡선의 완충 구간과 중화점, 혈액의 탄산 완충계(운동·과호흡·호흡 저하)를 다루고, 12가지 시약을 눈금실린더로 재어 섞어 완충 용액을 직접 만드는 미션 6개가 있습니다. 공통 이온 효과·짝산 짝염기·Ka와 Kb 설명과 용어 풀이가 들어 있습니다.",
      file: "labs/chemistry/buffer-solution-lab.html",
      author: "홍채린",
      grade: ["고2", "고3"],
      unit: "화학 반응의 세계 · 산 염기 평형",
      tags: ["완충 용액", "짝산 짝염기", "이온화 상수", "공통 이온 효과", "완충 용량", "적정 곡선", "혈액의 완충 작용"],
      thumbnail: "assets/img/thumbs/buffer-solution-lab/0.png",
      added: "2026-11-24"
    },
    {
      id: "monster-designer",
      subject: "biology",
      title: "몬스터 디자이너",
      summary: "환경이 바뀐 곳에서 생물이 자연선택을 거쳐 어떻게 달라질지 직접 설계하는 활동입니다. 1단계는 주어진 생물과 무작위 환경 카드로 외형·신체 구조·생리 특징을 고르고 그 이유를 서술하고, 2단계는 생물과 환경을 직접 정해 자유롭게 탐구합니다. 서술한 이유를 자동으로 점검해 점수와 피드백을 주고, 결과지를 PDF로 저장할 수 있습니다.",
      file: "labs/biology/monster-designer.html",
      author: "송다혜",
      grade: ["고2"],
      unit: "생명과학 · 생명의 연속성과 다양성",
      tags: ["자연선택", "변이", "선택압", "적응", "진화", "환경 변화"],
      thumbnail: "assets/img/thumbs/monster-designer/0.png",
      added: "2026-11-04"
    },
    {
      id: "speciation-lab",
      subject: "biology",
      title: "종분화 실험실",
      summary: "한 종의 작은 무리(개체 10마리)에서 시작해 돌연변이, 자연선택, 지리적 격리, 생식적 격리를 거치며 여러 종으로 갈라지는 과정을 지켜보는 시뮬레이션입니다. 지리적 분포 지도와 계통수가 함께 그려지고, 각 단계의 예측과 서술형 답변을 모아 관찰 보고서를 PDF로 저장할 수 있습니다.",
      file: "labs/biology/speciation-lab.html",
      author: "송다혜",
      grade: ["고2"],
      unit: "생명과학 · 생명의 연속성과 다양성",
      tags: ["종분화", "돌연변이", "자연선택", "지리적 격리", "생식적 격리", "계통수"],
      thumbnail: "assets/img/thumbs/speciation-lab/0.png",
      added: "2026-11-04"
    },
    {
      id: "cell-respiration-overview",
      subject: "biology",
      title: "세포호흡 한눈에 보기",
      summary: "세포질과 마이토콘드리아를 한 장면에 그려 세포호흡 네 단계(해당 과정 → 피루브산의 산화 → TCA 회로 → 산화적 인산화)가 어디서 일어나고 무엇이 오가는지 봅니다. 단계를 누르면 그 부분만 밝아지며 '쉽게 말하면'·교과서 설명·들어가는 것/나오는 것이 나오고, ATP 32개 막대와 네 단계 비교표, 지방·단백질이 어디로 들어가는지도 확인합니다.",
      file: "labs/biology/cell-respiration-overview.html",
      author: "송다혜",
      grade: ["고2", "고3"],
      unit: "세포와 물질대사 · 세포호흡과 광합성",
      tags: ["세포호흡", "해당 과정", "TCA 회로", "산화적 인산화", "ATP", "마이토콘드리아"],
      thumbnail: "assets/img/thumbs/cell-respiration-overview/0.png",
      added: "2026-11-05"
    },
    {
      id: "cell-respiration-steps",
      subject: "biology",
      title: "세포호흡 단계별 탐험",
      summary: "해당 과정부터 산화적 인산화까지 세부 단계를 하나씩 넘기며 분자가 변하는 과정을 애니메이션으로 따라갑니다. 지금까지 모은 ATP·NADH·FADH₂·CO₂가 포도당 1분자 기준으로 쌓이고, 탈수소효소의 작용과 기질수준인산화는 확대 화면으로, 산소가 없을 때 어떻게 되는지도 눌러 봅니다.",
      file: "labs/biology/cell-respiration-steps.html",
      author: "송다혜",
      grade: ["고2", "고3"],
      unit: "세포와 물질대사 · 세포호흡과 광합성",
      tags: ["세포호흡", "해당 과정", "TCA 회로", "전자전달계", "화학삼투", "기질수준인산화", "ATP"],
      thumbnail: "assets/img/thumbs/cell-respiration-steps/0.png",
      added: "2026-11-05"
    },
    {
      id: "photosynthesis-overview",
      subject: "biology",
      title: "광합성 한눈에 보기",
      summary: "엽록체 한 장면 그림에서 ① 광계 → ② 명반응(타이라코이드 막) → ③ 탄소 고정 반응(스트로마, 캘빈회로)으로 이어지는 광합성 전체 흐름을 봅니다. 단계 탭을 누르면 해당 부분만 밝아지고, 물·CO₂가 들어오고 O₂·포도당이 나가는 흐름과 ATP·NADPH가 명반응과 캘빈회로 사이를 오가는 모습이 움직임으로 표시됩니다. 포도당 1분자당 에너지 흐름 띠, 세 단계 비교표, 세포호흡과의 비교표가 들어 있습니다.",
      file: "labs/biology/photosynthesis-overview.html",
      author: "송다혜",
      grade: ["고2", "고3"],
      unit: "세포와 물질대사 · 세포호흡과 광합성",
      tags: ["광합성", "광계", "명반응", "탄소 고정 반응", "캘빈회로", "엽록체", "NADPH"],
      thumbnail: "assets/img/thumbs/photosynthesis-overview/0.png",
      added: "2026-11-18"
    },
    {
      id: "photosynthesis-steps",
      subject: "biology",
      title: "광합성 단계별 탐험",
      summary: "광계 → 명반응 → 탄소 고정 반응의 세부 단계를 하나씩 넘기며 분자가 움직이는 과정을 애니메이션으로 따라갑니다. 빛 흡수와 고에너지 전자 방출, 물의 광분해, 전자전달계와 H⁺ 이동, 광인산화, 캘빈회로의 탄소 고정·환원·RuBP 재생을 그림으로 보고, 각 단계마다 '쉽게 말하면'과 교과서 설명을 함께 읽습니다. 키보드 ← → 로도 넘길 수 있습니다.",
      file: "labs/biology/photosynthesis-steps.html",
      author: "송다혜",
      grade: ["고2", "고3"],
      unit: "세포와 물질대사 · 세포호흡과 광합성",
      tags: ["광합성", "명반응", "물의 광분해", "전자전달계", "광인산화", "캘빈회로", "루비스코"],
      thumbnail: "assets/img/thumbs/photosynthesis-steps/0.png",
      added: "2026-11-18"
    },
    {
      id: "constellation",
      subject: "earth",
      title: "별자리 탐험",
      summary: "실제 별 목록으로 그린 밤하늘 위에 별자리 틀을 옮기고 돌려 제자리를 찾습니다. 계절별·북쪽·남반구 하늘과 황도 13궁, 대표 별·별무리·은하·성단·행성 정보, 내 위치와 날짜·시간의 진짜 하늘을 보여 주는 '오늘 밤' 모드, 별자리 이야기와 미션이 들어 있습니다.",
      file: "labs/earth/constellation.html",
      author: "홍채린",
      grade: ["고2", "고3"],
      unit: "행성우주과학 · 태양과 별의 관측",
      tags: ["별자리", "계절별 별자리", "황도 12궁", "천구", "밤하늘 관측"],
      thumbnail: "assets/img/thumbs/constellation/0.png",
      added: "2026-11-02"
    },
    {
      id: "plate-tectonics",
      subject: "earth",
      title: "판구조론 가상 실험실",
      summary: "발산형·수렴형·보존형 경계 6가지의 단면도에서 판의 이동, 지진(천발·중발·심발), 마그마 활동을 관찰합니다. 해양저 확장 실험에서는 고지자기 줄무늬가 만들어지는 과정을 보고, 해저를 시추해 거리와 나이로 확장 속도를 직접 구합니다. 확인 문제 8문항.",
      file: "labs/earth/plate-tectonics.html",
      author: "장미나",
      grade: ["고2", "고3"],
      unit: "지구시스템과학 · 지구 탄생과 생동하는 지구",
      tags: ["판 구조론", "판의 경계", "해양저 확장", "고지자기", "변환 단층"],
      thumbnail: "assets/img/thumbs/plate-tectonics/0.png",
      added: "2026-11-03"
    },
    {
      id: "elnino",
      subject: "earth",
      title: "엘니뇨 · 라니냐 가상 실험실",
      summary: "적도 태평양의 무역풍 세기를 조절하며 서·동태평양 수온, 수온약층 기울기, 용승, 워커 순환, 강수 지역이 어떻게 바뀌는지 봅니다. 바다를 클릭해 수온 측정기를 놓고, Niño 3.4 수온 편차 그래프와 데이터 기록표로 엘니뇨·라니냐를 판정합니다.",
      file: "labs/earth/elnino.html",
      author: "장미나",
      grade: ["고2"],
      unit: "지구과학 · 대기와 해양의 상호작용",
      tags: ["엘니뇨", "라니냐", "무역풍", "용승", "워커 순환", "수온약층"],
      thumbnail: "assets/img/thumbs/elnino/0.png",
      added: "2026-11-03"
    },
    {
      id: "foehn",
      subject: "earth",
      title: "푄 현상 가상 실험실",
      summary: "출발 기온·이슬점·산의 높이를 정하고 공기 덩어리가 산을 넘는 과정을 따라갑니다. 건조 단열 감률과 습윤 단열 감률, 상승 응결 고도에 따라 기온·이슬점·상대 습도가 어떻게 변하는지 고도–기온 그래프와 결과표로 확인하고, 높새바람을 설명합니다.",
      file: "labs/earth/foehn.html",
      author: "장미나",
      grade: ["고2", "고3"],
      unit: "지구시스템과학 · 강수 과정과 대기의 운동",
      tags: ["푄 현상", "높새바람", "단열 변화", "건조 단열 감률", "습윤 단열 감률", "응결 고도"],
      thumbnail: "assets/img/thumbs/foehn/0.png",
      added: "2026-11-03"
    },
    {
      id: "planet-motion",
      subject: "earth",
      title: "행성의 겉보기 운동 가상 실험실",
      summary: "수성·금성·화성·목성·토성을 골라 태양계를 위에서 본 모습과 지구에서 본 하늘을 나란히 보며 순행·역행·유, 이각, 합·충·구·최대 이각을 관찰합니다. 주요 현상이 자동으로 기록되어 역행 기간과 회합 주기를 재고, 최대 이각으로 궤도 반지름을 구하는 탐구 활동이 들어 있습니다.",
      file: "labs/earth/planet-motion.html",
      author: "장미나",
      grade: ["고2"],
      unit: "지구과학 · 태양계 천체와 별과 우주의 진화",
      tags: ["겉보기 운동", "순행", "역행", "이각", "회합 주기", "내행성", "외행성"],
      thumbnail: "assets/img/thumbs/planet-motion/0.png",
      added: "2026-11-03"
    },
    {
      id: "star-evolution",
      subject: "earth",
      title: "별의 진화 가상 실험실",
      summary: "별의 초기 질량(0.1~50 M☉)을 정하고 성운에서 원시별, 주계열성, 거성, 최후(백색 왜성·중성자별·블랙홀)까지의 진화를 재생합니다. 별 관측 창과 H-R도 위의 이동 경로, 단계별 온도·광도·반지름·핵융합 반응을 보며 질량에 따른 수명과 최종 단계를 표로 비교합니다.",
      file: "labs/earth/star-evolution.html",
      author: "장미나",
      grade: ["고2"],
      unit: "지구과학 · 태양계 천체와 별과 우주의 진화",
      tags: ["별의 진화", "H-R도", "주계열성", "적색 거성", "백색 왜성", "초신성", "중성자별", "블랙홀"],
      thumbnail: "assets/img/thumbs/star-evolution/0.png",
      added: "2026-11-03"
    },
    {
      id: "green-lunch-challenge",
      subject: "environment",
      title: "녹색 급식 챌린지",
      summary: "급식실 앞 현장 참여용 화면입니다. 미니게임 3개 — 식판 위의 탄소(음식별 탄소 배출 비교 퀴즈와 저탄소 식판 짜기), 잔반의 일생(밥알이의 운명을 고르는 이야기, 엔딩 3개), 이건 어디에 버릴까?(헷갈리는 쓰레기 12개 분리배출) — 를 하고 스탬프를 모읍니다. 2개 이상 완료하면 학번·이름을 적고 참여 완료 화면을 감독 학생에게 보여 추첨권을 받습니다. 기록은 어디에도 저장되지 않고, '다음 사람'을 누르면 처음부터 시작합니다.",
      file: "labs/environment/green-lunch-challenge.html",
      author: "송다혜",
      grade: ["고1", "고2", "고3"],
      unit: "기후변화와 환경생태 · 기후위기에 대응하는 우리의 활동",
      tags: ["탄소중립", "저탄소 식단", "음식물 쓰레기", "잔반", "분리배출", "자원 순환", "녹색생활실천학교"],
      thumbnail: "assets/img/thumbs/green-lunch-challenge/0.png",
      added: "2026-11-23"
    },
    {
      id: "earth-rescue-corps",
      subject: "environment",
      title: "지구구조단",
      summary: "신입 연구원이 되어 여섯 섬(숲·강과 바다·도시·극지·생물다양성·지구 전체)에서 온 구조 요청 18건을 미니게임으로 해결하는 환경 탐사 게임입니다. 로드킬·산성비·빛공해·해양 플라스틱·녹조·산호 백화·미세먼지·도시 열섬·분리배출·탄소 포집·영구동토층 메탄·해수면 상승·외래종·종자 보전·멸종위기종·대멸종을 다루고, 임무마다 개인·사회·국제적 노력을 정리해 줍니다. 난이도(쉬움·보통·어려움)를 고를 수 있고, 저장 칸이 4개라 공용 PC에서도 학생마다 이어서 할 수 있습니다. 전체를 끝내는 데 두 차시쯤 걸립니다.",
      file: "labs/environment/earth-rescue-corps.html",
      author: "송다혜",
      grade: ["고1", "고2", "고3"],
      unit: "기후변화와 환경생태 · 기후위기에 대응하는 우리의 활동",
      tags: ["기후 변화", "생물다양성", "탄소중립", "해양 오염", "미세먼지", "분리배출", "멸종위기종", "대멸종", "게임"],
      thumbnail: "assets/img/thumbs/earth-rescue-corps/0.png",
      added: "2026-11-24"
    }
  ]
};
