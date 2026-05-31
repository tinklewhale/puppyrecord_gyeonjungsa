# 🐾 강아지의 시선 — 유저 플로우 & 정보구조(IA)

> 와이어프레임은 [강아지의시선_UX설계.html](강아지의시선_UX설계.html)(브라우저로 열기)에서 확인. 본 문서는 Notion/GitHub에서 바로 렌더되는 다이어그램 버전.

---

## 1. 유저 플로우 (User Flow)

핵심 가설 검증 경로(온보딩 → 홈 → AI 일기)를 중심으로, Phase 1~2(산책·위치)와 수익화(꾸미기) 분기를 포함.

```mermaid
flowchart TD
  Start([앱 실행]) --> Splash[스플래시 · 온보딩<br/>가치 소개 3컷]
  Splash --> Auth{로그인 여부}
  Auth -->|기존| Home
  Auth -->|신규| Signup[회원가입<br/>소셜/이메일 · 생년 14세 분기]
  Signup --> DogReg[강아지 등록<br/>이름·견종·나이·성별]
  DogReg --> MBTI[강아지 MBTI 설문<br/>5축 · 선택/건너뛰기]
  MBTI --> Home[🏠 홈: 보리의 머릿속]
  DogReg -. 건너뛰기 .-> Home

  %% 핵심: AI 일기
  Home --> Diary[＋ 일기 작성]
  Diary --> DInput[감정 + 사진 + 키워드 입력]
  DInput --> AIGen[[AI 1인칭 일기 생성<br/>성격프로필 + 최근일기 주입]]
  AIGen --> Safety{3계층 안전필터}
  Safety -->|위반| AIGen
  Safety -->|통과| Result[일기 결과<br/>🐾 AI가 작성했어요]
  Result --> Edit[편집 · 저장]
  Edit --> Signal[(edit_signals 저장<br/>= 학습 신호)]
  Signal -. few-shot 주입 .-> AIGen
  Result -->|좋아요/저장| Feed[피드 노출]

  %% 소셜
  Feed --> Report[신고 · 차단 · 필터<br/>Apple 1.2 의무]

  %% 가족
  Home --> Family[👨‍👩‍👧 가족 공동육아]
  Family --> Invite[가족 초대 링크]
  Family --> TL[활동 타임라인 실시간 동기화]

  %% 산책/위치 (Phase 1~2)
  Home --> Walk[🌿 산책 · Phase 1]
  Walk --> WRec[나의 산책 기록<br/>위치 = 가족 한정, 외부 미노출]
  WRec --> Toggle{안심 위치공유}
  Toggle -->|OFF · 기본| WRec
  Toggle -->|ON · Phase 2| Map[동네 친구 지도<br/>근사위치·상호동의·14세미만차단]

  %% 성장/수익화
  Home --> Profile[👑 프로필: 레벨·배지]
  Profile --> Shop[꾸미기 상점]
  Shop --> Earn{포인트 획득}
  Earn -->|리워드 광고| Wallet[(포인트 적립)]
  Earn -->|현금 충전| Wallet
  Wallet --> Buy[아이템 구매 · 아바타 적용]

  classDef must fill:#eff5e1,stroke:#91ad4b,color:#26251f;
  classDef p1 fill:#fdf0d8,stroke:#e0a13c,color:#5b4a1e;
  classDef p2 fill:#fbe3df,stroke:#cf6a55,color:#5b231c;
  class Home,Diary,DInput,AIGen,Result,Edit,Family,Invite,TL,Feed,Report,Profile must;
  class Walk,WRec,Toggle,Shop,Earn,Wallet,Buy p1;
  class Map p2;
```

**범례:** 🟩 MVP(Must) · 🟨 Phase 1 · 🟥 Phase 2
**핵심 루프:** `홈 → 일기 입력 → AI 생성 → 편집/저장 → (학습신호) → 다음 생성 품질↑` — D7 리텐션을 만드는 선순환.

---

## 2. 정보구조 (Information Architecture)

5탭 하단 네비게이션 기준 사이트맵. 괄호는 단계(Phase) 표기.

```mermaid
flowchart LR
  App(["🐾 강아지의 시선"]):::root

  App --> H["🏠 홈"]:::tab
  App --> W["🌿 산책"]:::tab
  App --> D["＋ 일기"]:::tab
  App --> F["👨‍👩‍👧 가족"]:::tab
  App --> P["👑 프로필"]:::tab
  App --> ONB["온보딩/가입"]:::tab

  ONB --> O1[스플래시·가치소개]
  ONB --> O2[로그인/회원가입]
  ONB --> O3[강아지 등록]
  ONB --> O4[강아지 MBTI 설문]

  H --> H1[보리의 머릿속 · 대화형 인사]
  H --> H2[오늘 기록하기 CTA]
  H --> H3[퀵메뉴: 산책·간식·가족]
  H --> H4[오늘의 일기 카드]

  D --> D1[감정 선택]
  D --> D2[사진 업로드 · 최대 5장]
  D --> D3[키워드 칩]
  D --> D4[AI 일기 결과 · AI 표시]
  D --> D5[편집 / 저장]

  F --> F1[보호자 목록]
  F --> F2[가족 초대 링크]
  F --> F3[활동 타임라인]

  W --> W1["나의 산책 기록 (P1)"]:::p1
  W --> W2[안심 위치공유 토글]:::p1
  W --> W3[산책 요약: 거리·시간·영역]:::p1
  W --> W4["동네 친구 지도 (P2)"]:::p2

  P --> P1[강아지 프로필·MBTI 편집]
  P --> P2[레벨 · EXP]
  P --> P3[성장 배지]
  P --> P4["꾸미기 상점 · 포인트 (P1)"]:::p1
  P --> P5[피드 / 내 일기]
  P --> P6[설정 · 신고차단 · 약관]

  classDef root fill:#58742e,stroke:#58742e,color:#fff;
  classDef tab fill:#eff5e1,stroke:#91ad4b,color:#26251f;
  classDef p1 fill:#fdf0d8,stroke:#e0a13c,color:#5b4a1e;
  classDef p2 fill:#fbe3df,stroke:#cf6a55,color:#5b231c;
```

---

## 3. 화면 목록 (Wireframe Index)

| # | 화면 | 그룹 | Phase |
|---|---|---|---|
| 1 | 스플래시 · 온보딩 | 온보딩/가입 | MVP |
| 2 | 로그인 · 회원가입 | 온보딩/가입 | MVP |
| 3 | 강아지 등록 | 온보딩/가입 | MVP |
| 4 | 강아지 MBTI 설문 | 온보딩/가입 | MVP |
| 5 | 홈 · 보리의 머릿속 | 홈/일기 | MVP |
| 6 | 일기 작성 · 입력 | 홈/일기 | MVP |
| 7 | 일기 결과 · AI 생성 | 홈/일기 | MVP |
| 8 | 일기 편집 (학습 신호) | 홈/일기 | MVP |
| 9 | 피드 · 좋아요/팔로우 | 소셜/가족 | MVP |
| 10 | 신고 · 차단 (Apple 1.2) | 소셜/가족 | MVP |
| 11 | 가족 · 공동육아 | 소셜/가족 | MVP |
| 12 | 가족 초대 | 소셜/가족 | MVP |
| 13 | 산책 · 나의 기록 | 산책/위치 | Phase 1 |
| 14 | 산책 · 안심 위치공유 ON | 산책/위치 | Phase 1 |
| 15 | 동네 친구 지도 | 산책/위치 | Phase 2 |
| 16 | 프로필 · 레벨/배지 | 성장/수익화 | MVP |
| 17 | 꾸미기 상점 · 포인트 | 성장/수익화 | Phase 1 |
