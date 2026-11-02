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
    tagline: "물리·화학·생명·지구과학 가상 실험을 설치 없이 브라우저에서.",
    school: "",            // 예: "○○고등학교" (비우면 '가상 실험실'로 표시)
    manager: "휘쌤",       // 운영자
    contact: ""            // 예: 이메일 (비우면 표시 안 함)
  },

  /* 과목 -------------------------------------------------------------
   * id 는 labs[].subject 와 폴더명(labs/<id>/)에 쓰입니다.
   * color 는 assets/css/site.css 의 --phys/--chem/--bio/--earth 와 맞춰 둡니다.
   */
  subjects: [
    { id: "physics",   name: "물리학",   short: "물리", color: "#2F6BFF", desc: "힘과 운동, 파동, 전자기, 에너지." },
    { id: "chemistry", name: "화학",     short: "화학", color: "#F0640A", desc: "물질의 구조와 변화, 용액, 평형, 산·염기 반응." },
    { id: "biology",   name: "생명과학", short: "생명", color: "#12A66B", desc: "세포와 유전, 물질대사, 생태계." },
    { id: "earth",     name: "지구과학", short: "지구", color: "#7A5AF8", desc: "지구 내부, 대기와 해양, 천체의 운동." }
  ],

  /* 실험 -------------------------------------------------------------
   * id          고유 식별자 (주소에 쓰임, 영문 소문자-하이픈)
   * subject     과목 id
   * title       제목
   * summary     한두 문장 소개 (뷰어 정보 패널에 표시)
   * file        HTML 경로 (저장소 루트 기준)
   * author      제작자
   * grade       대상 학년 배열            예) ["고2", "고3"]
   * unit        교과 · 단원               예) "화학Ⅱ · 용액의 성질"
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
      id: "chem-smart-lab",
      subject: "chemistry",
      title: "화학 스마트 실험실",
      summary: "묽은 용액의 총괄성(증기압 내림·끓는점 오름·어는점 내림·삼투압)부터 중화 적정, 르샤틀리에 원리, 고체 결정 구조 3D까지 7가지 시뮬레이션을 한 파일에 담았습니다.",
      file: "labs/chemistry/chem-smart-lab.html",
      author: "휘쌤",
      grade: ["고2", "고3"],
      unit: "화학Ⅱ · 용액과 평형",
      tags: ["총괄성", "묽은 용액", "화학 평형", "르샤틀리에", "결정 구조", "적정"],
      experiments: [
        { title: "고체 결정 구조 3D", hash: "exp=0", thumb: "assets/img/thumbs/chem-smart-lab/0.png", unit: "화학Ⅱ · 고체의 구조", tags: ["단순 입방", "체심 입방", "면심 입방", "배위수"] },
        { title: "증기압력 내림",     hash: "exp=1", thumb: "assets/img/thumbs/chem-smart-lab/1.png", unit: "화학Ⅱ · 묽은 용액의 성질", tags: ["라울 법칙", "몰분율"] },
        { title: "끓는점 오름",       hash: "exp=2", thumb: "assets/img/thumbs/chem-smart-lab/2.png", unit: "화학Ⅱ · 묽은 용액의 성질", tags: ["증기압 곡선", "외부 압력"] },
        { title: "어는점 내림",       hash: "exp=3", thumb: "assets/img/thumbs/chem-smart-lab/3.png", unit: "화학Ⅱ · 묽은 용액의 성질", tags: ["결빙", "육각 격자"] },
        { title: "삼투압과 동적 평형", hash: "exp=4", thumb: "assets/img/thumbs/chem-smart-lab/4.png", unit: "화학Ⅱ · 묽은 용액의 성질", tags: ["반트호프", "역삼투"] },
        { title: "중화 적정",         hash: "exp=5", thumb: "assets/img/thumbs/chem-smart-lab/5.png", unit: "화학Ⅰ · 산과 염기", tags: ["뷰렛", "지시약", "적정 곡선"] },
        { title: "르샤틀리에 원리",   hash: "exp=6", thumb: "assets/img/thumbs/chem-smart-lab/6.png", unit: "화학Ⅱ · 화학 평형", tags: ["평형 이동", "NO₂", "암모니아 합성"] }
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
      grade: ["고1", "고2"],
      unit: "화학Ⅰ · 탄소 화합물",
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
      unit: "화학Ⅱ · 반응의 자발성",
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
      grade: ["고1", "고2"],
      unit: "화학Ⅰ · 화학 결합",
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
      grade: ["고1", "고2"],
      unit: "화학Ⅰ · 분자의 구조",
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
      grade: ["고1", "고2"],
      unit: "화학Ⅰ · 산화 환원 반응",
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
      grade: ["고1", "고2"],
      unit: "화학Ⅰ · 산화 환원 반응 · 화학 전지",
      tags: ["화학 전지", "볼타 전지", "다니엘 전지", "염다리", "표준 환원 전위", "분극"],
      thumbnail: "assets/img/thumbs/chemical-cell/0.png",
      added: "2026-11-02"
    },
    {
      id: "constellation",
      subject: "earth",
      title: "별자리 탐험",
      summary: "실제 별 목록으로 그린 밤하늘 위에 별자리 틀을 옮기고 돌려 제자리를 찾습니다. 계절별·북쪽·남반구 하늘과 황도 13궁, 대표 별·별무리·은하·성단·행성 정보, 내 위치와 날짜·시간의 진짜 하늘을 보여 주는 '오늘 밤' 모드, 별자리 이야기와 미션이 들어 있습니다.",
      file: "labs/earth/constellation.html",
      author: "홍채린",
      grade: ["고1", "고2"],
      unit: "지구과학Ⅰ · 별과 우주",
      tags: ["별자리", "계절별 별자리", "황도 12궁", "천구", "밤하늘 관측"],
      thumbnail: "assets/img/thumbs/constellation/0.png",
      added: "2026-11-02"
    }
  ]
};
