const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

// ---------- palette (brand-informed: forest/moss green + cream, from prototype CSS) ----------
const C = {
  forest: "2E3D16",   // deep olive (dark slides)
  forest2: "3D5122",
  green: "91AD4B",    // brand primary
  greenDk: "58742E",
  greenSoft: "EFF5E1",
  cream: "FBF8F1",
  card: "FFFFFF",
  line: "E4DFD4",
  ink: "26251F",
  muted: "8B887F",
  peach: "F7E3C5",
  coral: "E08A3C",    // warm accent for stats
  white: "FFFFFF",
};
const HEAD = "Noto Sans KR";
const BODY = "Noto Sans KR";

// ---------- icon rasterizer ----------
async function icon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
const ICONS = {};
async function loadIcons() {
  const map = {
    paw: Fa.FaPaw, camera: Fa.FaCamera, magic: Fa.FaMagic, users: Fa.FaUsers,
    map: Fa.FaMapMarkerAlt, chart: Fa.FaChartLine, coins: Fa.FaCoins, shield: Fa.FaShieldAlt,
    mobile: Fa.FaMobileAlt, heart: Fa.FaHeart, bone: Fa.FaBone, crown: Fa.FaCrown,
    layer: Fa.FaLayerGroup, lock: Fa.FaLock, home: Fa.FaHome, pen: Fa.FaPenFancy,
    bell: Fa.FaBell, brain: Fa.FaBrain, store: Fa.FaStore, gift: Fa.FaGift,
    handshake: Fa.FaHandshake, microchip: Fa.FaMicrochip, check: Fa.FaCheckCircle,
    bolt: Fa.FaBolt, dog: Fa.FaDog, robot: Fa.FaRobot, fire: Fa.FaFire,
    seedling: Fa.FaSeedling, flask: Fa.FaFlask, eye: Fa.FaEye, ban: Fa.FaBan,
  };
  for (const [k, v] of Object.entries(map)) {
    ICONS[k] = { green: await icon(v, "#" + C.greenDk), white: await icon(v, "#FFFFFF"),
                 coral: await icon(v, "#" + C.coral), forest: await icon(v, "#" + C.forest) };
  }
}

const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.333, height: 7.5 });
pres.layout = "W";
pres.author = "강아지의 시선 TF";
pres.title = "강아지의 시선 — Pitch Deck";
const W = 13.333, H = 7.5, M = 0.7;

const sh = () => ({ type: "outer", color: "8A7B55", blur: 9, offset: 3, angle: 90, opacity: 0.16 });

// prototype screenshots
const path = require("path");
const SHOTS = path.resolve(__dirname, "shots");
const shot = (n) => path.join(SHOTS, n + ".png");
const PHONE_RATIO = 860 / 1760; // w/h
// draw a framed phone mockup; returns its width
function phone(slide, name, x, y, h, label, labelColor) {
  const w = h * PHONE_RATIO, pad = 0.11;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - pad, y: y - pad, w: w + 2 * pad, h: h + 2 * pad,
    fill: { color: C.white }, line: { color: C.line, width: 1 }, rectRadius: 0.12, shadow: sh() });
  slide.addImage({ path: shot(name), x, y, w, h });
  if (label) slide.addText(label, { x: x - 0.5, y: y + h + 0.2, w: w + 1.0, h: 0.3, fontFace: HEAD,
    fontSize: 11.5, bold: true, color: labelColor || C.greenDk, align: "center", margin: 0 });
  return w;
}

// helpers
function bg(slide, color) { slide.background = { color }; }
function pawWatermark(slide, color, opa) {
  slide.addImage({ data: ICONS.paw[color], x: W - 2.4, y: H - 2.5, w: 2.6, h: 2.6, transparency: opa });
}
function eyebrow(slide, text, x, y, color = C.green) {
  slide.addText(text.toUpperCase(), { x, y, w: 6, h: 0.3, fontFace: HEAD, fontSize: 11,
    bold: true, color, charSpacing: 3, margin: 0 });
}
function title(slide, text, x, y, color = C.ink, size = 30) {
  slide.addText(text, { x, y, w: W - 2 * M, h: 0.8, fontFace: HEAD, fontSize: size, bold: true, color, margin: 0 });
}
// card with icon badge, heading, body
function iconCard(slide, o) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
  const cx = o.x + 0.33;
  slide.addShape(pres.shapes.OVAL, { x: cx, y: o.y + 0.32, w: 0.66, h: 0.66, fill: { color: o.badge || C.greenSoft } });
  slide.addImage({ data: ICONS[o.icon][o.iconColor || "green"], x: cx + 0.16, y: o.y + 0.48, w: 0.34, h: 0.34 });
  slide.addText(o.head, { x: o.x + 0.33, y: o.y + 1.05, w: o.w - 0.66, h: 0.45, fontFace: HEAD,
    fontSize: o.headSize || 15, bold: true, color: o.headColor || C.ink, margin: 0 });
  slide.addText(o.body, { x: o.x + 0.33, y: o.y + 1.5, w: o.w - 0.6, h: o.h - 1.6, fontFace: BODY,
    fontSize: o.bodySize || 11.5, color: o.bodyColor || C.muted, lineSpacingMultiple: 1.12, margin: 0, valign: "top" });
}

// ============================================================ SLIDE 1 — TITLE
function slideTitle() {
  const s = pres.addSlide(); bg(s, C.forest);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.green } });
  // big paw motif
  s.addImage({ data: ICONS.paw.white, x: W - 3.7, y: 1.0, w: 3.4, h: 3.4, transparency: 86 });
  s.addImage({ data: ICONS.paw.white, x: W - 5.0, y: 4.1, w: 1.5, h: 1.5, transparency: 90 });

  s.addShape(pres.shapes.OVAL, { x: M, y: 1.35, w: 0.95, h: 0.95, fill: { color: C.green } });
  s.addImage({ data: ICONS.paw.white, x: M + 0.24, y: 1.59, w: 0.47, h: 0.47 });

  s.addText("DOG'S POV DIARY", { x: M, y: 2.55, w: 8, h: 0.4, fontFace: HEAD, fontSize: 13,
    bold: true, color: C.green, charSpacing: 4, margin: 0 });
  s.addText([
    { text: "강아지의 ", options: { color: C.white } },
    { text: "시선", options: { color: C.green } },
  ], { x: M, y: 2.95, w: 11, h: 1.5, fontFace: HEAD, fontSize: 66, bold: true, margin: 0 });
  s.addText("\"우리 강아지가 직접 쓰는 1인칭 일기장 + 가족이 함께 보는 반려 다이어리\"",
    { x: M, y: 4.5, w: 11, h: 0.6, fontFace: BODY, fontSize: 19, color: "DDE7C4", margin: 0 });
  s.addText("사진 한 장과 오늘의 기분만 고르면, AI가 우리 아이 말투로 일기를 써주는 감성 반려 플랫폼",
    { x: M, y: 5.15, w: 11, h: 0.5, fontFace: BODY, fontSize: 13.5, color: "A9B68A", margin: 0 });

  s.addShape(pres.shapes.LINE, { x: M, y: 6.35, w: 4.2, h: 0, line: { color: "55663A", width: 1 } });
  s.addText("Pitch Deck v1.0  ·  2026.05  ·  견정사 — 강아지의 시선 TF",
    { x: M, y: 6.5, w: 9, h: 0.4, fontFace: BODY, fontSize: 12, color: "8FA06E", margin: 0 });
}

// ============================================================ SLIDE 2 — PROBLEM
function slideProblem() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Problem", M, M);
  title(s, "기존 펫 앱은 '감성적 교류'를 채우지 못한다", M, M + 0.32);
  const cards = [
    { icon: "store", head: "감성 교류의 부재", body: "펫프렌즈·핏펫 등 기존 앱은 커머스·등록·헬스케어 중심. 보호자의 감성적 교류 욕구를 채우지 못한다." },
    { icon: "pen", head: "기록의 지속 실패", body: "긴 글 기반 SNS는 작성 부담이 커서 반려 일상 기록이 며칠 못 가 멈춘다. '쓰기 귀찮음'이 핵심 장벽." },
    { icon: "users", head: "가족 공유 도구 부재", body: "591만 가구가 한 마리를 함께 키우지만, 엄마·아빠가 상태를 실시간 공유할 자연스러운 도구가 없다." },
  ];
  const cw = (W - 2 * M - 0.7) / 3, ch = 2.9, y = 2.25;
  cards.forEach((c, i) => iconCard(s, { ...c, x: M + i * (cw + 0.35), y, w: cw, h: ch, bodySize: 12.5, headSize: 17 }));
  // bottom strip
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.55, w: W - 2 * M, h: 1.05, fill: { color: C.forest }, rectRadius: 0.08 });
  s.addImage({ data: ICONS.bolt.white, x: M + 0.4, y: 5.9, w: 0.4, h: 0.4 });
  s.addText([
    { text: "결과: ", options: { bold: true, color: C.green } },
    { text: "보호자는 '우리 아이의 하루'를 기록하고 가족과 나누고 싶지만, 마땅한 도구가 없어 카톡·갤러리에 흩어진다.", options: { color: "EAF0DA" } },
  ], { x: M + 1.0, y: 5.62, w: W - 2 * M - 1.4, h: 0.9, fontFace: BODY, fontSize: 14, valign: "middle", margin: 0 });
}

// ============================================================ SLIDE 3 — SOLUTION
function slideSolution() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Solution", M, M);
  title(s, "강아지의 시선으로 소통하는 몰입형 감성 다이어리", M, M + 0.32, C.ink, 27);

  const LW = 8.55; // left content width
  // statement band (left)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.9, w: LW, h: 1.25, fill: { color: C.greenSoft }, line: { color: C.green, width: 1 }, rectRadius: 0.1 });
  s.addImage({ data: ICONS.dog.green, x: M + 0.4, y: 2.28, w: 0.5, h: 0.5 });
  s.addText("\"사진 1장 + 감정 이모지\"만 고르면\n→ 우리 강아지가 1인칭으로 쓴 짧은 일기가 완성된다",
    { x: M + 1.15, y: 1.9, w: LW - 1.45, h: 1.25, fontFace: HEAD, fontSize: 15, bold: true, color: C.greenDk, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });

  s.addText("3대 차별화 포인트", { x: M, y: 3.4, w: 6, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  const cards = [
    { icon: "dog", head: "강아지 빙의 UI/UX", body: "긴 글 작성을 버리고 [사진+이모지] 중심의 강아지 1인칭 독백. 앱을 켜면 '보리의 머릿속'이 먼저 말을 건넨다." },
    { icon: "lock", head: "사생활 보호 토글", body: "동선 노출 부담을 없애고, 산책할 때만 켜는 '안심 ON/OFF'. 규제 리스크는 단계적으로 분리한다." },
    { icon: "users", head: "가족 공동육아 동기화", body: "엄마·아빠·누나가 하나의 강아지 프로필을 실시간 공동 관리. 한 명이 가입하면 가족을 초대." },
  ];
  const cw = (LW - 0.6) / 3, ch = 2.75, y = 3.85;
  cards.forEach((c, i) => iconCard(s, { ...c, x: M + i * (cw + 0.3), y, w: cw, h: ch, bodySize: 10.8, headSize: 14 }));

  // home phone (right)
  phone(s, "home", M + LW + 0.95, 2.15, 3.85, "보리의 머릿속");
}

// ============================================================ SLIDE 4 — PRODUCT (prototype)
function slideProduct() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Product", M, M);
  title(s, "이미 작동하는 프로토타입 — 5개 핵심 화면", M, M + 0.32);
  s.addText("tinklewhale.github.io/puppyrecord_gyeonjungsa", { x: W - 5.2, y: M + 0.05, w: 4.5, h: 0.35,
    fontFace: BODY, fontSize: 11, italic: true, color: C.muted, align: "right", margin: 0 });

  const items = [
    { name: "home", label: "홈 · 보리의 머릿속" },
    { name: "diary_result", label: "AI 1인칭 일기" },
    { name: "walk", label: "산책 기록" },
    { name: "family", label: "가족 공동육아" },
    { name: "profile", label: "프로필 · 성장" },
  ];
  // 5 real phone mockups in a row
  const ph = 3.35, pw = ph * PHONE_RATIO, y = 1.95;
  const totalW = 5 * pw, gap = (W - 2 * M - totalW) / 4;
  items.forEach((it, i) => {
    const x = M + i * (pw + gap);
    phone(s, it.name, x, y, ph, it.label);
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.95, w: W - 2 * M, h: 0.95, fill: { color: C.peach }, rectRadius: 0.08 });
  s.addText([
    { text: "설계가 UI에 박혀 있다  ", options: { bold: true, color: C.greenDk } },
    { text: "— 산책 화면은 '나의 기록(Phase 1)'과 '동네 친구 지도(Phase 2·잠금)'를 탭으로 분리하고, 위치 토글은 '산책 중에만·근사위치·상호동의'를 카피로 명시한다.", options: { color: C.ink } },
  ], { x: M + 0.4, y: 5.95, w: W - 2 * M - 0.8, h: 0.95, fontFace: BODY, fontSize: 13, valign: "middle", margin: 0 });
}

// ============================================================ SLIDE 5 — AI ENGINE
function slideAI() {
  const s = pres.addSlide(); bg(s, C.forest);
  eyebrow(s, "Core Technology", M, M, C.green);
  title(s, "핵심 엔진 — '우리 아이 고유의 말투'를 학습하는 AI 일기", M, M + 0.32, C.white, 26);

  // pipeline 5 steps
  const steps = [
    { icon: "camera", t: "입력", d: "사진+감정\n+키워드" },
    { icon: "brain", t: "성격 프로필", d: "강아지 MBTI\n+과거 일기" },
    { icon: "robot", t: "AI 생성", d: "1인칭\n강아지 말투" },
    { icon: "shield", t: "안전 필터", d: "3계층\n금칙어 방어" },
    { icon: "check", t: "AI 표시", d: "🐾 AI가\n작성했어요" },
  ];
  const n = steps.length, gap = 0.55, bw = (W - 2 * M - (n - 1) * gap) / n, y = 2.15, bh = 1.7;
  steps.forEach((st, i) => {
    const x = M + i * (bw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: bh, fill: { color: C.forest2 }, line: { color: "5C7138", width: 1 }, rectRadius: 0.1 });
    s.addShape(pres.shapes.OVAL, { x: x + bw / 2 - 0.32, y: y + 0.2, w: 0.64, h: 0.64, fill: { color: C.green } });
    s.addImage({ data: ICONS[st.icon].forest, x: x + bw / 2 - 0.17, y: y + 0.35, w: 0.34, h: 0.34 });
    s.addText(st.t, { x, y: y + 0.92, w: bw, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(st.d, { x, y: y + 1.18, w: bw, h: 0.5, fontFace: BODY, fontSize: 10, color: "B9C79A", align: "center", lineSpacingMultiple: 0.95, margin: 0 });
    if (i < n - 1) s.addText("›", { x: x + bw + 0.08, y: y + 0.45, w: gap - 0.16, h: 0.6, fontFace: HEAD, fontSize: 26, bold: true, color: C.green, align: "center", margin: 0 });
  });

  // two explainer cards (stacked, left column) + diary phone (right)
  const LW = 8.3, cy = 4.3, cw = LW, ch = 1.18;
  const box = (yy, ic, h, b) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: yy, w: cw, h: ch, fill: { color: "FFFFFF" }, rectRadius: 0.1, shadow: sh() });
    s.addShape(pres.shapes.OVAL, { x: M + 0.28, y: yy + 0.29, w: 0.6, h: 0.6, fill: { color: C.greenSoft } });
    s.addImage({ data: ICONS[ic].green, x: M + 0.43, y: yy + 0.44, w: 0.3, h: 0.3 });
    s.addText(h, { x: M + 1.05, y: yy + 0.16, w: cw - 1.3, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(b, { x: M + 1.05, y: yy + 0.56, w: cw - 1.3, h: 0.55, fontFace: BODY, fontSize: 10.8, color: C.muted, lineSpacingMultiple: 1.05, margin: 0, valign: "top" });
  };
  box(cy, "brain", "강아지 MBTI로 성격 설정", "에너지·애정·호기심·식탐·사회성 5축 설문으로 초기 페르소나 생성. \"보리는 활발한 탐험가 애교쟁이!\" 결과 카드로 완료율↑·공유 바이럴↑.");
  box(cy + ch + 0.22, "pen", "편집이 곧 학습 (파인튜닝 X)", "견주가 고쳐 쓴 문장 = 가장 강력한 정답 데이터. 다음 생성에 few-shot 주입 → 점점 '우리 아이 말투'로 수렴. 비용·동의 부담 회피.");

  s.addText("MVP는 파인튜닝·RAG 없이 '구조화 프롬프트 + 최근 일기 주입'으로 충분 → RAG는 Phase 1 과제",
    { x: M, y: cy + 2 * ch + 0.55, w: LW, h: 0.4, fontFace: BODY, fontSize: 11, italic: true, color: "9FB07C", margin: 0 });

  // diary result phone (right)
  const rx = M + LW + 0.55, raw = W - M - rx;
  const pH = 2.95, pW = pH * PHONE_RATIO;
  phone(s, "diary_result", rx + (raw - pW) / 2, 3.95, pH, "AI가 써준 1인칭 일기", C.green);
}

// ============================================================ SLIDE 6 — MARKET
function slideMarket() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Market", M, M);
  title(s, "크고, 빠르게 자라는 시장", M, M + 0.32);

  // 4 stat callouts (left), chart (right)
  const stats = [
    { num: "21조원", lab: "2032년 국내 반려동물\n연관산업 전망 (삼정KPMG)" },
    { num: "1,546만", lab: "반려인 (총인구 29.9%)\n591만 가구 (KB금융 2025)" },
    { num: "19.4만원", lab: "가구 월평균 양육비\n안정적 지출 카테고리" },
    { num: "90%", lab: "펫 앱 사용자 20~40대 집중\n(여성 72%) — 타깃과 일치" },
  ];
  const gw = 3.0, gh = 1.75, gx = M, gy = 2.2, gap = 0.35;
  stats.forEach((st, i) => {
    const x = gx + (i % 2) * (gw + gap), y = gy + Math.floor(i / 2) * (gh + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: gw, h: gh, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.3, w: 0.1, h: gh - 0.6, fill: { color: C.coral } });
    s.addText(st.num, { x: x + 0.35, y: y + 0.28, w: gw - 0.5, h: 0.7, fontFace: HEAD, fontSize: 33, bold: true, color: C.greenDk, margin: 0 });
    s.addText(st.lab, { x: x + 0.37, y: y + 1.0, w: gw - 0.6, h: 0.65, fontFace: BODY, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.05, margin: 0 });
  });

  // chart on right
  const chx = gx + 2 * (gw + gap) + 0.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: chx, y: gy, w: W - M - chx, h: 2 * gh + gap, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
  s.addText("연관산업 시장 규모 (조원)", { x: chx + 0.3, y: gy + 0.22, w: 4, h: 0.35, fontFace: HEAD, fontSize: 13, bold: true, color: C.ink, margin: 0 });
  s.addChart(pres.charts.BAR, [{ name: "시장규모", labels: ["2022년", "2025 추정", "2032 전망"], values: [8.5, 6.2, 21] }], {
    x: chx + 0.15, y: gy + 0.6, w: W - M - chx - 0.3, h: 2 * gh + gap - 0.85, barDir: "col",
    chartColors: [C.green], showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.greenDk,
    dataLabelFontFace: HEAD, dataLabelFontSize: 12, dataLabelFontBold: true,
    catAxisLabelColor: C.muted, catAxisLabelFontSize: 10, catAxisLabelFontFace: BODY,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, barGapWidthPct: 60,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 6.2, w: W - 2 * M, h: 0.85, fill: { color: C.forest }, rectRadius: 0.08 });
  s.addText([
    { text: "단, 커뮤니티 단독 수익화는 한계 ", options: { color: C.green, bold: true } },
    { text: "— 검증된 국내 경쟁사는 모두 커머스·등록·헬스케어 엔진 보유. 우리도 꾸미기·구독 하이브리드로 초기부터 설계한다.", options: { color: "EAF0DA" } },
  ], { x: M + 0.4, y: 6.2, w: W - 2 * M - 0.8, h: 0.85, fontFace: BODY, fontSize: 12.5, valign: "middle", margin: 0 });
}

// ============================================================ SLIDE 7 — COMPETITION
function slideCompetition() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Competition", M, M);
  title(s, "경쟁자가 비워둔 단 하나의 칸 — '감성 콘텐츠'", M, M + 0.32);

  // 2x2 positioning idea: list competitors left, empty space right
  const lx = M, lw = 6.4, ly = 2.15, lh = 4.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: ly, w: lw, h: lh, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
  s.addText("기존 플레이어는 모두 '수익 엔진'이 본업", { x: lx + 0.35, y: ly + 0.25, w: lw - 0.6, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  const rows = [
    ["펫프렌즈", "종합 커머스 · 점유율 37.6%"],
    ["포동(Podo)", "60만 보호자 정보 커뮤니티"],
    ["펫피(Petp)", "산책 리워드 + 소셜 · 30만 DL"],
    ["페오펫", "모바일 동물등록 1위"],
    ["핏펫", "헬스케어 · 검진 키트"],
    ["해외 (Dogo·BarkHappy·Tractive)", "훈련/위치/GPS — 결합 모델 부재"],
  ];
  rows.forEach((r, i) => {
    const y = ly + 0.8 + i * 0.52;
    s.addShape(pres.shapes.OVAL, { x: lx + 0.4, y: y + 0.06, w: 0.16, h: 0.16, fill: { color: C.green } });
    s.addText([
      { text: r[0] + "  ", options: { bold: true, color: C.ink } },
      { text: r[1], options: { color: C.muted } },
    ], { x: lx + 0.7, y, w: lw - 1.0, h: 0.4, fontFace: BODY, fontSize: 12, valign: "middle", margin: 0 });
  });

  // right: empty-space highlight
  const rx = lx + lw + 0.5, rw = W - M - rx;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: ly, w: rw, h: lh, fill: { color: C.greenSoft }, line: { color: C.green, width: 1.5 }, rectRadius: 0.1, shadow: sh() });
  s.addShape(pres.shapes.OVAL, { x: rx + rw / 2 - 0.55, y: ly + 0.45, w: 1.1, h: 1.1, fill: { color: C.green } });
  s.addImage({ data: ICONS.heart.white, x: rx + rw / 2 - 0.3, y: ly + 0.72, w: 0.6, h: 0.56 });
  s.addText("빈 시장", { x: rx, y: ly + 1.7, w: rw, h: 0.5, fontFace: HEAD, fontSize: 24, bold: true, color: C.greenDk, align: "center", margin: 0 });
  s.addText("감성 콘텐츠\n(강아지 빙의 + AI 1인칭 일기)", { x: rx + 0.3, y: ly + 2.25, w: rw - 0.6, h: 0.8, fontFace: HEAD, fontSize: 15, bold: true, color: C.ink, align: "center", lineSpacingMultiple: 1.1, margin: 0 });
  s.addText("국내외 직접 경쟁자 없음.\n정면충돌을 피해 단독 점유한다.", { x: rx + 0.3, y: ly + 3.1, w: rw - 0.6, h: 0.7, fontFace: BODY, fontSize: 12, color: C.greenDk, align: "center", lineSpacingMultiple: 1.1, margin: 0 });
}

// ============================================================ SLIDE 8 — BUSINESS MODEL
function slideBM() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Business Model", M, M);
  title(s, "무료 감성 콘텐츠로 리텐션 → 꾸미기·구독으로 수익화", M, M + 0.32, C.ink, 26);

  // core BM hero card
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 2.1, w: 4.5, h: 4.55, fill: { color: C.forest }, rectRadius: 0.12, shadow: sh() });
  s.addShape(pres.shapes.OVAL, { x: M + 0.4, y: 2.45, w: 0.8, h: 0.8, fill: { color: C.green } });
  s.addImage({ data: ICONS.coins.forest, x: M + 0.6, y: 2.65, w: 0.4, h: 0.4 });
  s.addText("CORE", { x: M + 1.4, y: 2.5, w: 3, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: C.green, charSpacing: 2, margin: 0 });
  s.addText("포인트 기반\n캐릭터 꾸미기", { x: M + 1.4, y: 2.78, w: 3, h: 0.7, fontFace: HEAD, fontSize: 17, bold: true, color: C.white, lineSpacingMultiple: 1.0, margin: 0 });
  s.addText([
    { text: "강아지 아바타를 의상·배경·테마로 꾸미고, 결과를 홈·AI 일기 썸네일에 반영 → 꾸미고 싶은 동기 극대화.\n\n", options: { color: "D7E2BE" } },
    { text: "포인트 획득 2경로\n", options: { color: C.green, bold: true } },
    { text: "① 현금 충전 (인앱결제)\n② 리워드 광고 시청 (일 5회 상한)", options: { color: "EAF0DA" } },
  ], { x: M + 0.4, y: 3.7, w: 3.7, h: 2.8, fontFace: BODY, fontSize: 12, lineSpacingMultiple: 1.12, margin: 0, valign: "top" });

  // 5 supporting BMs grid (right)
  const gx = M + 4.5 + 0.4, gw = (W - M - gx - 0.3) / 2, gh = 1.42, gap = 0.25;
  const sub = [
    { icon: "crown", h: "프리미엄 구독", b: "AI 일기 무제한·광고 제거·월간 앨범. AI 원가 전가." },
    { icon: "store", h: "커머스 · 제휴", b: "견종·생애주기 맞춤 추천. 일기 맥락 기반 어필리에이트." },
    { icon: "gift", h: "AI 굿즈 · 포토북", b: "쌓인 일기·사진 → 포토북·굿즈. 주문형, 재고 0." },
    { icon: "handshake", h: "B2B 제휴 · 광고", b: "동물병원·펫샵·보험 입점. Phase 2 지역 쿠폰." },
    { icon: "microchip", h: "하드웨어 · 헬스케어", b: "스마트 칩 + 생체데이터 구독 (Phase 3)." },
  ];
  sub.forEach((c, i) => {
    const x = gx + (i % 2) * (gw + gap), y = 2.1 + Math.floor(i / 2) * (gh + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: gw, h: gh, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.08, shadow: sh() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.27, w: 0.55, h: 0.55, fill: { color: C.greenSoft } });
    s.addImage({ data: ICONS[c.icon].green, x: x + 0.39, y: y + 0.41, w: 0.27, h: 0.27 });
    s.addText(c.h, { x: x + 0.95, y: y + 0.2, w: gw - 1.1, h: 0.4, fontFace: HEAD, fontSize: 13, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(c.b, { x: x + 0.95, y: y + 0.6, w: gw - 1.15, h: 0.75, fontFace: BODY, fontSize: 10.3, color: C.muted, lineSpacingMultiple: 1.05, margin: 0, valign: "top" });
  });
  // 6th cell: principle
  const x6 = gx + 1 * (gw + gap), y6 = 2.1 + 2 * (gh + gap);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x6, y: y6, w: gw, h: gh, fill: { color: C.peach }, rectRadius: 0.08 });
  s.addText("⚠ 확률형(랜덤박스) 미적용\n핵심 감성 경험은 항상 무료 유지", { x: x6 + 0.3, y: y6, w: gw - 0.5, h: gh, fontFace: BODY, fontSize: 11.5, bold: true, color: C.greenDk, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
}

// ============================================================ SLIDE 9 — ROADMAP
function slideRoadmap() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Roadmap", M, M);
  title(s, "리스크를 분리한 4단계 빌드업", M, M + 0.32);

  const phases = [
    { p: "Phase 0", t: "MVP", when: "지금~약 3개월", icon: "seedling",
      body: "위치 없이 감성 3종 + 가족 동기화. AI 표시 의무만 준수. 노코드로 핵심 가설 검증.", reg: "신고 불필요", hi: true },
    { p: "Phase 1", t: "산책 기록 · 수익화", when: "PMF 신호 후", icon: "chart",
      body: "본인·가족 한정 산책 기록. 포인트·구독 수익화 검증. RAG 메모리 도입.", reg: "위치신고 착수" },
    { p: "Phase 2", t: "동네 친구 지도", when: "신고·안전설계 후", icon: "map",
      body: "근사위치·상호동의·기본OFF·14세미만차단·즉시숨김. 100m 조우 푸시.", reg: "위치신고 필수" },
    { p: "Phase 3", t: "웨어러블 융합", when: "최종", icon: "microchip",
      body: "스마트 목걸이 칩 + 심박·체온·활동량을 강아지가 1인칭으로 말하는 테크-감성 융합.", reg: "—" },
  ];
  const n = 4, gap = 0.4, cw = (W - 2 * M - (n - 1) * gap) / n, y = 2.3, ch = 4.0;
  // connecting line
  s.addShape(pres.shapes.LINE, { x: M + cw / 2, y: y - 0.25, w: (n - 1) * (cw + gap), h: 0, line: { color: C.green, width: 2, dashType: "dash" } });
  phases.forEach((ph, i) => {
    const x = M + i * (cw + gap);
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.14, y: y - 0.39, w: 0.28, h: 0.28, fill: { color: ph.hi ? C.coral : C.green } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: ph.hi ? C.forest : C.card }, line: { color: ph.hi ? C.forest : C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
    const ink = ph.hi ? C.white : C.ink, mut = ph.hi ? "C7D3AC" : C.muted;
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.32, w: 0.7, h: 0.7, fill: { color: ph.hi ? C.green : C.greenSoft } });
    s.addImage({ data: ICONS[ph.icon][ph.hi ? "forest" : "green"], x: x + 0.48, y: y + 0.5, w: 0.34, h: 0.34 });
    s.addText(ph.p, { x: x + 0.3, y: y + 1.15, w: cw - 0.5, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: ph.hi ? C.green : C.green, margin: 0 });
    s.addText(ph.t, { x: x + 0.3, y: y + 1.42, w: cw - 0.5, h: 0.55, fontFace: HEAD, fontSize: 16, bold: true, color: ink, margin: 0, lineSpacingMultiple: 0.95 });
    s.addText(ph.when, { x: x + 0.3, y: y + 2.0, w: cw - 0.5, h: 0.3, fontFace: BODY, fontSize: 10.5, italic: true, color: mut, margin: 0 });
    s.addText(ph.body, { x: x + 0.3, y: y + 2.35, w: cw - 0.55, h: 1.1, fontFace: BODY, fontSize: 10.8, color: mut, lineSpacingMultiple: 1.1, margin: 0, valign: "top" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: y + ch - 0.5, w: cw - 0.6, h: 0.34, fill: { color: ph.hi ? C.green : C.greenSoft }, rectRadius: 0.05 });
    s.addText(ph.reg, { x: x + 0.3, y: y + ch - 0.5, w: cw - 0.6, h: 0.34, fontFace: HEAD, fontSize: 10, bold: true, color: ph.hi ? C.forest : C.greenDk, align: "center", valign: "middle", margin: 0 });
  });
  s.addText("Phase 0 검증 질문: \"강아지 1인칭 일기를 매일 쓰게 되는가?\" → 일기 생성률 · D7 리텐션으로 판정",
    { x: M, y: 6.65, w: W - 2 * M, h: 0.4, fontFace: BODY, fontSize: 12, italic: true, color: C.greenDk, align: "center", margin: 0 });
}

// ============================================================ SLIDE 10 — RISK / COMPLIANCE
function slideRisk() {
  const s = pres.addSlide(); bg(s, C.forest);
  eyebrow(s, "Risk & Compliance", M, M, C.green);
  title(s, "리스크를 설계로 통제한다 — 특히 '위치'", M, M + 0.32, C.white, 27);
  s.addText("강아지의 실시간 위치 = 사실상 사람의 실시간 위치. 모든 최대 리스크가 '위치'에 집중 → MVP에서 분리한다.",
    { x: M, y: 1.55, w: W - 2 * M, h: 0.4, fontFace: BODY, fontSize: 13, color: "C7D3AC", margin: 0 });

  const cards = [
    { icon: "map", h: "위치정보법", b: "개인위치정보 수집 시 방통위 신고 의무(미신고 3년↓/3천만원↓). MVP는 위치 미수집 → 신고 불필요, Phase 1부터 착수." },
    { icon: "robot", h: "AI 기본법 (2026.1.22)", b: "생성형 AI 결과물에 'AI 생성' 표시 의무. → '🐾 AI가 작성했어요' 라벨 + 메타데이터 + 약관 고지로 대응." },
    { icon: "shield", h: "Apple 1.2 (UGC)", b: "필터링·신고·차단·연락처 4대 의무. → 3계층 모더레이션 + 신고/차단 기능을 MVP에 내장." },
    { icon: "lock", h: "동네 친구 지도", b: "스토킹·역추적·아동·심사 4중 리스크. → 근사위치·상호동의·기본OFF·14세미만차단 갖춘 Phase 2에만 개방." },
  ];
  const cw = (W - 2 * M - 3 * 0.4) / 4, y = 2.3, ch = 3.4;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 0.4);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: "FFFFFF" }, rectRadius: 0.1, shadow: sh() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.35, w: 0.72, h: 0.72, fill: { color: C.greenSoft } });
    s.addImage({ data: ICONS[c.icon].green, x: x + 0.49, y: y + 0.54, w: 0.34, h: 0.34 });
    s.addText(c.h, { x: x + 0.3, y: y + 1.25, w: cw - 0.55, h: 0.65, fontFace: HEAD, fontSize: 14.5, bold: true, color: C.ink, margin: 0, lineSpacingMultiple: 0.95, valign: "top" });
    s.addText(c.b, { x: x + 0.3, y: y + 1.9, w: cw - 0.55, h: ch - 2.0, fontFace: BODY, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.12, margin: 0, valign: "top" });
  });
  s.addText("원칙: \"위치를 쓴다\"가 리스크가 아니라 \"실시간 위치를 + 모르는 사람에게 + 정확히\" 노출하는 것이 리스크. 하나만 끊어도 급감한다.",
    { x: M, y: 6.15, w: W - 2 * M, h: 0.6, fontFace: BODY, fontSize: 12.5, italic: true, color: C.green, align: "center", margin: 0 });
}

// ============================================================ SLIDE 11 — TECH STACK
function slideTech() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Tech Stack", M, M);
  title(s, "빠르게 검증하고, 막히지 않게 짓는다", M, M + 0.32);

  const layers = [
    { icon: "mobile", h: "앱 (Frontend)", items: "Flutter (iOS·Android 단일 코드)\nRiverpod · FlutterFlow 호환 이관", c: C.green },
    { icon: "layer", h: "백엔드 (BaaS)", items: "Firebase — Auth · Firestore(실시간\n가족 동기화) · Storage · FCM · Functions", c: C.greenDk },
    { icon: "brain", h: "AI 레이어", items: "LLM API(일기 생성) + 모더레이션\nCloud Functions 게이트웨이로 키 보호", c: C.green },
    { icon: "chart", h: "분석 · 운영", items: "GA4 · Mixpanel(KPI 퍼널)\nCrashlytics · Sentry · Remote Config", c: C.greenDk },
  ];
  const cw = (W - 2 * M - 3 * 0.35) / 4, y = 2.25, ch = 2.5;
  layers.forEach((l, i) => {
    const x = M + i * (cw + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.12, fill: { color: l.c } });
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.4, y: y + 0.4, w: 0.8, h: 0.8, fill: { color: C.greenSoft } });
    s.addImage({ data: ICONS[l.icon].green, x: x + cw / 2 - 0.21, y: y + 0.59, w: 0.42, h: 0.42 });
    s.addText(l.h, { x, y: y + 1.35, w: cw, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.ink, align: "center", margin: 0 });
    s.addText(l.items, { x: x + 0.2, y: y + 1.78, w: cw - 0.4, h: 0.65, fontFace: BODY, fontSize: 10.3, color: C.muted, align: "center", lineSpacingMultiple: 1.08, margin: 0 });
  });

  // decision band
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.05, w: W - 2 * M, h: 1.6, fill: { color: C.forest }, rectRadius: 0.1 });
  s.addImage({ data: ICONS.bolt.white, x: M + 0.45, y: 5.35, w: 0.42, h: 0.42 });
  s.addText("노코드 vs 코드 — 결정", { x: M + 1.05, y: 5.3, w: 5, h: 0.5, fontFace: HEAD, fontSize: 16, bold: true, color: C.green, margin: 0 });
  s.addText([
    { text: "Phase 0는 FlutterFlow로 빠르게 가설 검증·팬덤 확보. ", options: { color: "EAF0DA" } },
    { text: "단, 인앱결제·LLM 호출 등 심사 민감/복잡 로직은 Custom Code·Cloud Functions로 분리", options: { color: C.green, bold: true } },
    { text: "한다. PMF 신호 후 Flutter 네이티브로 이관. (FlutterFlow는 iOS 리젝 빈번 → 출시 전 심사 체크리스트 필수)", options: { color: "EAF0DA" } },
  ], { x: M + 0.45, y: 5.85, w: W - 2 * M - 0.9, h: 0.7, fontFace: BODY, fontSize: 12.5, lineSpacingMultiple: 1.12, margin: 0, valign: "top" });
}

// ============================================================ SLIDE 12 — KPI
function slideKPI() {
  const s = pres.addSlide(); bg(s, C.cream);
  eyebrow(s, "Validation", M, M);
  title(s, "무엇을 보면 성공인가", M, M + 0.32);

  const big = [
    { num: "주간 일기 수", lab: "핵심 가설 KPI", sub: "가입자당 일기 생성률" },
    { num: "D1·D7·D30", lab: "리텐션", sub: "감성 콘텐츠가 습관이 되는가" },
    { num: "수정율 ↓", lab: "AI 공감도", sub: "수정 없이 저장하는 비율 ↑ = 학습 성공" },
  ];
  const cw = (W - 2 * M - 0.7) / 3, y = 2.2, ch = 2.0;
  big.forEach((b, i) => {
    const x = M + i * (cw + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
    s.addText(b.num, { x: x + 0.35, y: y + 0.3, w: cw - 0.6, h: 0.65, fontFace: HEAD, fontSize: 26, bold: true, color: C.greenDk, margin: 0 });
    s.addText(b.lab, { x: x + 0.37, y: y + 1.0, w: cw - 0.6, h: 0.35, fontFace: HEAD, fontSize: 13, bold: true, color: C.coral, margin: 0 });
    s.addText(b.sub, { x: x + 0.37, y: y + 1.38, w: cw - 0.6, h: 0.5, fontFace: BODY, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.05, margin: 0 });
  });

  // threshold + secondary
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.5, w: (W - 2 * M - 0.4) / 2, h: 1.9, fill: { color: C.greenSoft }, line: { color: C.green, width: 1 }, rectRadius: 0.1 });
  s.addText("기각선 (Go / No-Go)", { x: M + 0.35, y: 4.7, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.greenDk, margin: 0 });
  s.addText([
    { text: "D7 리텐션 < 20% ", options: { bold: true, color: C.ink } },
    { text: "→ 감성 콘텐츠 가설 재검토\n", options: { color: C.muted } },
    { text: "가족 동기화 사용 가구 < 30% ", options: { bold: true, color: C.ink } },
    { text: "→ 공동육아 가치 재평가", options: { color: C.muted } },
  ], { x: M + 0.35, y: 5.2, w: (W - 2 * M - 0.4) / 2 - 0.7, h: 1.0, fontFace: BODY, fontSize: 12.5, lineSpacingMultiple: 1.3, margin: 0, valign: "top" });

  const x2 = M + (W - 2 * M - 0.4) / 2 + 0.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x2, y: 4.5, w: (W - 2 * M - 0.4) / 2, h: 1.9, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.1, shadow: sh() });
  s.addText("보조 지표", { x: x2 + 0.35, y: 4.7, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "· 사진 업로드 → 일기 완성 전환율\n", options: {} },
    { text: "· 가족 초대 수락률 · 팔로우/피드 상호작용\n", options: {} },
    { text: "· (Phase 1+) 포인트 구매율 · 프리미엄 전환율\n", options: {} },
    { text: "· MBTI 완료율 · 금칙어 필터 적발/오차단율", options: {} },
  ], { x: x2 + 0.35, y: 5.2, w: (W - 2 * M - 0.4) / 2 - 0.7, h: 1.0, fontFace: BODY, fontSize: 11.5, color: C.muted, lineSpacingMultiple: 1.3, margin: 0, valign: "top" });
}

// ============================================================ SLIDE 13 — CLOSING
function slideClosing() {
  const s = pres.addSlide(); bg(s, C.forest);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.green } });
  s.addImage({ data: ICONS.paw.white, x: W - 3.6, y: 0.7, w: 3.0, h: 3.0, transparency: 88 });

  s.addShape(pres.shapes.OVAL, { x: M, y: 1.1, w: 0.85, h: 0.85, fill: { color: C.green } });
  s.addImage({ data: ICONS.paw.white, x: M + 0.22, y: 1.32, w: 0.41, h: 0.41 });

  s.addText("NEXT", { x: M, y: 2.3, w: 5, h: 0.4, fontFace: HEAD, fontSize: 13, bold: true, color: C.green, charSpacing: 4, margin: 0 });
  s.addText([
    { text: "딱 한 가지만 검증한다.\n", options: { color: C.white } },
    { text: "\"우리 아이 일기를 매일 쓰게 되는가.\"", options: { color: C.green } },
  ], { x: M, y: 2.65, w: 11, h: 1.7, fontFace: HEAD, fontSize: 38, bold: true, lineSpacingMultiple: 1.05, margin: 0 });

  // 3 next-action chips
  const chips = ["FlutterFlow '보리의 머릿속' 첫 화면", "LLM 프롬프트·강아지 말투 샘플 수집", "감성 3종 MVP 비공개 베타"];
  const cw = (11 - 0.7) / 3;
  chips.forEach((t, i) => {
    const x = M + i * (cw + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.7, w: cw, h: 0.95, fill: { color: C.forest2 }, line: { color: C.green, width: 1 }, rectRadius: 0.1 });
    s.addText(`0${i + 1}`, { x: x + 0.3, y: 4.85, w: 1, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.green, margin: 0 });
    s.addText(t, { x: x + 0.3, y: 5.12, w: cw - 0.55, h: 0.45, fontFace: BODY, fontSize: 11.5, color: "EAF0DA", margin: 0, valign: "top", lineSpacingMultiple: 0.95 });
  });

  s.addShape(pres.shapes.LINE, { x: M, y: 6.4, w: 11, h: 0, line: { color: "55663A", width: 1 } });
  s.addText("강아지의 시선  ·  Dog's POV Diary", { x: M, y: 6.55, w: 8, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: C.green, margin: 0 });
  s.addText("\"인간 중심의 딱딱한 펫 앱은 끝났다.\"", { x: W - 5.7, y: 6.55, w: 5, h: 0.4, fontFace: BODY, fontSize: 12, italic: true, color: "8FA06E", align: "right", margin: 0 });
}

(async () => {
  await loadIcons();
  slideTitle();
  slideProblem();
  slideSolution();
  slideProduct();
  slideAI();
  slideMarket();
  slideCompetition();
  slideBM();
  slideRoadmap();
  slideRisk();
  slideTech();
  slideKPI();
  slideClosing();
  await pres.writeFile({ fileName: "강아지의시선_피치덱.pptx" });
  console.log("WROTE 강아지의시선_피치덱.pptx");
})();
