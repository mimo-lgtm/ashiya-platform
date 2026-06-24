// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbymx19ORq63wrfnsScaM_Ma380eSNrTjRc1maCCtwDQdeOSKXESuh8iRcAKFm1D78LBpQ/exec";
const OTHER_LABEL = "その他";

// =====================================================================
// MAIN_CATEGORIES
// ★ ⑤「都市の強靭性とガバナンス」から「DAO型住民自治投票」を削除
// =====================================================================
const MAIN_CATEGORIES = [
  {
    key: "①", icon: "🏫",
    label: "芦屋市の価値向上（ブランド・移住促進）", keyword: "価値向上",
    subs: [{ label: "次世代教育ブランドの確立" }, { label: "街の魅力化・景観美化" }, { label: "市民協働" }]
  },
  {
    key: "②", icon: "❤️",
    label: "市民へのベネフィット（ウェルビーイング）", keyword: "ベネフィット",
    subs: [{ label: "多世代交流・サードプレイス" }, { label: "知的探究・スキルアップ" }]
  },
  {
    key: "③", icon: "💰",
    label: "財政的持続可能性", keyword: "財政的",
    subs: [{ label: "施設の収益化" }, { label: "寄付・ふるさと納税" }]
  },
  {
    key: "④", icon: "🏛",
    label: "施設の戦略性", keyword: "戦略性",
    subs: [{ label: "知のゲートウェイ化" }, { label: "イノベーション・起業支援" }]
  },
  {
    key: "⑤", icon: "🛡",
    label: "都市の強靭性とガバナンス", keyword: "強靭性",
    subs: [{ label: "デュアルユース" }]   // ← 「DAO型住民自治投票」削除済み
  }
];

function findMain(text) {
  if (!text) return MAIN_CATEGORIES[0];
  for (const m of MAIN_CATEGORIES) {
    if (text.includes(m.keyword) || text.includes(m.label)) return m;
  }
  for (const m of MAIN_CATEGORIES) {
    if (text.includes(m.key)) return m;
  }
  return MAIN_CATEGORIES[0];
}

// =====================================================================
// 状態管理
// =====================================================================
let currentIdeaText   = "";
let currentAIResult   = "";
let currentSummary200 = "";
let currentTitle      = "";
let currentMain       = "";
let currentSub        = "";
let cachedRows        = [];

// ★ 投稿追跡用
let lastPostedTitle = "";
let lastPostedMain  = "";
let lastPostedSub   = "";

// ★ Civic Vision 履歴キャッシュ
let cachedVisionHistory = [];

// =====================================================================
// ページ切り替え
// =====================================================================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "pullrequest") loadPRList();
  if (pageId === "tree")        { initTreeBoards(); loadTreeData(); }
  if (pageId === "analysis")    loadAnalysisData();
  if (pageId === "vision")      loadVisionPage();
  // merge（統合）ページは静的コンテンツのため追加ロード不要
}

// =====================================================================
// 分析ページ — データ読み込み
// =====================================================================
async function loadAnalysisData() {
  const totalEl   = document.getElementById("analysisTotalCount");
  const mergedEl  = document.getElementById("analysisMergedCount");
  const topEl     = document.getElementById("analysisTopTheme");
  const barsArea  = document.getElementById("analysisBarsArea");
  const alignArea = document.getElementById("alignmentBarsArea");

  try {
    if (cachedRows.length === 0) {
      const res  = await fetch(GAS_URL + "?mode=list");
      const data = await res.json();
      if (Array.isArray(data)) cachedRows = data;
    }
    const rows   = cachedRows;
    const total  = rows.length;
    const merged = rows.filter(r => r.status === "統合" || r.status === "新分類統合").length;

    // 大分類別カウント
    const counts = {};
    MAIN_CATEGORIES.forEach(m => counts[m.label] = 0);
    rows.forEach(r => {
      const m = findMain(r.main || r.category);
      counts[m.label] = (counts[m.label] || 0) + 1;
    });
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    if (totalEl)  totalEl.innerHTML  = total  + '<span style="font-size:14px;font-weight:400;color:#64748b;">件</span>';
    if (mergedEl) mergedEl.innerHTML = merged + '<span style="font-size:14px;font-weight:400;color:#64748b;">件</span>';
    if (topEl)    topEl.textContent  = topEntry ? topEntry[0].split("（")[0] : "―";

    // 大分類別バー
    if (barsArea) {
      if (total === 0) {
        barsArea.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">まだ投稿がありません</p>';
      } else {
        barsArea.innerHTML = '<h3 style="margin-bottom:12px;font-size:15px;">大分類別の投稿割合</h3>';
        MAIN_CATEGORIES.forEach(m => {
          const cnt = counts[m.label] || 0;
          const pct = Math.round(cnt / total * 100);
          barsArea.innerHTML +=
            '<div class="analysis-bar-row">' +
            '<div class="analysis-bar-label">' + m.icon + ' ' + m.label.split("（")[0] + '</div>' +
            '<div class="analysis-bar-bg"><div class="analysis-bar-fill" style="width:' + pct + '%;"></div></div>' +
            '<div class="analysis-bar-pct">' + pct + '%（' + cnt + '件）</div>' +
            '</div>';
        });
      }
    }

    // 整合性バー（設計ウェイト × 投稿比率で算出）
    // Vision想定の理想配分（%）— 5分類の設計意図ウェイト
    const visionIdeal = [20, 25, 20, 20, 15];
    if (alignArea) {
      alignArea.innerHTML = "";
      MAIN_CATEGORIES.forEach((m, i) => {
        const actual   = total > 0 ? Math.round((counts[m.label] || 0) / total * 100) : 0;
        const ideal    = visionIdeal[i];
        const alignPct = ideal > 0 ? Math.min(100, Math.round(actual / ideal * 100)) : 0;
        const barColor = alignPct >= 80 ? "#10b981" : alignPct >= 50 ? "#f59e0b" : "#ef4444";
        alignArea.innerHTML +=
          '<div class="alignment-bar-row">' +
          '<div class="alignment-bar-label">' + m.icon + ' ' + m.label.split("（")[0] + '</div>' +
          '<div class="analysis-bar-bg"><div class="analysis-bar-fill" style="width:' + alignPct + '%;background:' + barColor + ';"></div></div>' +
          '<div class="alignment-pct">' + alignPct + '%</div>' +
          '</div>';
      });
    }
  } catch (e) {
    console.error("分析データ読み込み失敗", e);
    if (barsArea)  barsArea.innerHTML  = '<p style="color:#dc2626;padding:16px;">データ取得に失敗しました</p>';
    if (alignArea) alignArea.innerHTML = '<p style="color:#dc2626;padding:16px;">データ取得に失敗しました</p>';
  }
}

// =====================================================================
// Civic Vision ページ — 月次更新履歴の可視化
// =====================================================================
async function loadVisionPage() {
  // ライブテキスト（現在の市民総意）も同時ロード
  loadLiveCivicVision();
  // 変化の可視化タイムライン
  loadVisionHistory();
}

// ── 市民総意テキスト（投稿数多数決ではなく設計ウェイト×AI質的判断の結果を表示） ──
async function loadLiveCivicVision() {
  const liveText   = document.getElementById("visionLiveText");
  const liveIllust = document.getElementById("visionLiveIllust");
  if (!liveText) return;
  liveText.textContent = "市民の投稿を分析中…";

  try {
    if (cachedRows.length === 0) {
      const res  = await fetch(GAS_URL + "?mode=list");
      const data = await res.json();
      if (Array.isArray(data)) cachedRows = data;
    }
    const rows  = cachedRows;
    const total = rows.length;

    if (total === 0) {
      liveText.textContent = "まだ投稿がありません。最初の一歩を投稿してください！";
      if (liveIllust) liveIllust.innerHTML = "🌱";
      return;
    }

    // 大分類別カウント
    const counts = {};
    MAIN_CATEGORIES.forEach(m => counts[m.label] = 0);
    rows.forEach(r => {
      const m = findMain(r.main || r.category);
      counts[m.label] = (counts[m.label] || 0) + 1;
    });

    // ★ 設計ウェイト（Civic Compassの意図）× 投稿比率 の調整スコア
    // 投稿数の多数決を避け、設計意図を50%反映
    const DESIGN_WEIGHTS = { "①": 0.20, "②": 0.25, "③": 0.20, "④": 0.20, "⑤": 0.15 };
    const keyMap = {
      "芦屋市の価値向上（ブランド・移住促進）":  "①",
      "市民へのベネフィット（ウェルビーイング）": "②",
      "財政的持続可能性":                          "③",
      "施設の戦略性":                              "④",
      "都市の強靭性とガバナンス":                  "⑤"
    };
    const adjustedScores = {};
    MAIN_CATEGORIES.forEach(m => {
      const k      = keyMap[m.label] || "①";
      const ratio  = total > 0 ? (counts[m.label] || 0) / total : 0;
      const weight = DESIGN_WEIGHTS[k] || 0.2;
      adjustedScores[m.label] = Math.round((weight * 0.5 + ratio * 0.5) * 100);
    });

    // 調整スコア上位2分類を表示
    const sorted = Object.entries(adjustedScores).sort((a, b) => b[1] - a[1]);
    const top1   = sorted[0] ? sorted[0][0].split("（")[0] : "";
    const top2   = sorted[1] ? sorted[1][0].split("（")[0] : "";

    liveText.innerHTML =
      '<p style="font-size:12px;color:#64748b;margin-bottom:8px;">※ 投稿数の多数決ではなく、設計ウェイト50%＋投稿比率50%で算出した調整スコアによる評価です</p>' +
      '市民の声（計' + total + '件）と設計意図を合わせた分析では、' +
      '「' + top1 + '」と「' + top2 + '」への期待が特に大きく、' +
      '駅前公共施設を学び・挑戦・交流の拠点として育てていきたいという市民の願いが浮かび上がっています。' +
      '詳細な分析結果は月末にCivic Visionへ反映されます。';

    if (liveIllust) {
      const topMobj = MAIN_CATEGORIES.find(m => m.label.includes(top1.substring(0, 4)));
      liveIllust.innerHTML = topMobj ? topMobj.icon : "🌳";
    }
  } catch (e) {
    if (liveText) liveText.textContent = "データの読み込みに失敗しました。しばらくしてから再試行してください。";
  }
}

// ── Civic Vision 月次更新履歴タイムライン ──
async function loadVisionHistory() {
  const timelineArea = document.getElementById("visionTimelineArea");
  if (!timelineArea) return;
  timelineArea.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:20px;">読み込み中…</div>';

  try {
    // GAS側に visionHistory モードを追加した場合はそちらから取得
    // まだ未実装の場合はフォールバック表示
    let history = [];
    try {
      const res  = await fetch(GAS_URL + "?mode=visionHistory");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        history = data;
        cachedVisionHistory = data;
      }
    } catch (e) {
      // GAS側が未対応の場合は初期Visionのみ表示
      history = [{
        version:    "v0",
        timestamp:  "2025/06/01",
        visionText: "駅前公共施設を、単なる利用の場ではなく、市民の学び・挑戦・交流が自然に芽生え、広がり、街の魅力を育てていく"成長する拠点"へと転換する。ここでは、子どもから大人まで、多様な人が自分の興味や得意を持ち寄り、新しい活動やつながりが生まれる。小さなアイデアが形になり、誰かの挑戦が次の挑戦を呼び、街全体の活力へとつながっていく。行政が一方的に提供する施設ではなく、市民とともに育て、市民の力が循環し、芦屋の価値が静かに、しかし確実に積み上がっていく"まちの育ち場"として再構築する。",
        reason:     "初期設定のCivic Vision（プラットフォーム開設時）",
        scoreJson:  JSON.stringify({ adjustedScores: { "①": 20, "②": 25, "③": 20, "④": 20, "⑤": 15 } }),
        totalPosts: 0
      }];
    }

    renderVisionTimeline(history, timelineArea);
  } catch (e) {
    timelineArea.innerHTML = '<p style="color:#dc2626;">履歴の読み込みに失敗しました</p>';
  }
}

function renderVisionTimeline(history, area) {
  if (!history || history.length === 0) {
    area.innerHTML = '<p style="color:#94a3b8;padding:16px;">履歴がありません</p>';
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "vision-timeline";

  history.forEach((item, idx) => {
    const isLatest = idx === 0;
    const prevItem = history[idx + 1] || null;

    const el = document.createElement("div");
    el.className = "vision-timeline-item" + (isLatest ? " latest" : "");

    // スコアを解析
    let scoreHtml = "";
    try {
      const scoreData = typeof item.scoreJson === "string" ? JSON.parse(item.scoreJson) : item.scoreJson;
      const scores = scoreData.adjustedScores || {};
      const scoreKeys = [
        { k: "①", label: "価値向上" },
        { k: "②", label: "ウェルビーイング" },
        { k: "③", label: "財政" },
        { k: "④", label: "戦略性" },
        { k: "⑤", label: "強靭性" }
      ];
      scoreHtml = '<div class="vision-score-bars">';
      scoreKeys.forEach(s => {
        const pct = scores[s.k] !== undefined ? scores[s.k] : 0;
        scoreHtml +=
          '<div class="vision-score-label">' + s.label + '</div>' +
          '<div class="vision-score-bg"><div class="vision-score-fill" style="width:' + pct + '%;"></div></div>' +
          '<div class="vision-score-pct">' + pct + '%</div>';
      });
      scoreHtml += '</div>';
    } catch (e) { /* スコア表示なし */ }

    // before/after 比較（前バージョンがある場合）
    let compareHtml = "";
    if (!isLatest && prevItem) {
      compareHtml = ""; // 最新版に対して前版を比較する場合（最新が最上部）
    }
    if (isLatest && history.length > 1) {
      const before = history[1];
      compareHtml =
        '<div class="vision-compare" style="margin-top:14px;">' +
        '<div class="vision-compare-box before">' +
        '<div class="vision-compare-label">BEFORE（' + before.version + '）</div>' +
        '<div class="vision-compare-text">' + (before.visionText || "").substring(0, 80) + '…</div>' +
        '</div>' +
        '<div class="vision-compare-box after">' +
        '<div class="vision-compare-label">AFTER（最新：' + item.version + '）</div>' +
        '<div class="vision-compare-text">' + (item.visionText || "").substring(0, 80) + '…</div>' +
        '</div>' +
        '</div>';
    }

    el.innerHTML =
      '<div class="vision-timeline-dot"></div>' +
      '<div class="vision-timeline-card">' +
        '<div class="vision-timeline-meta">' +
          '<span class="vision-version-badge">' + (item.version || "v?") + (isLatest ? " 最新" : "") + '</span>' +
          '<span class="vision-timeline-date">' + (item.timestamp || "") + '</span>' +
          (item.totalPosts ? '<span class="vision-timeline-posts">投稿 ' + item.totalPosts + ' 件時点</span>' : '') +
        '</div>' +
        '<div class="vision-timeline-text">' + (item.visionText || "") + '</div>' +
        (item.reason ? '<div class="vision-timeline-reason">📝 ' + item.reason + '</div>' : '') +
        scoreHtml +
        compareHtml +
      '</div>';

    wrap.appendChild(el);
  });

  area.innerHTML = "";
  area.appendChild(wrap);
}

// ── 手動更新ボタン（管理者用） ──
async function adminUpdateVision() {
  const btn = document.getElementById("btnAdminVisionUpdate");
  if (btn) { btn.disabled = true; btn.textContent = "更新中…"; }

  try {
    const res  = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "updateVision" })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // キャッシュをクリアして再ロード
    cachedVisionHistory = [];
    cachedRows = [];
    await loadVisionPage();
    alert("✅ Civic Vision を更新しました");
  } catch (e) {
    alert("更新エラー: " + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "🔄 今すぐ月次更新を実行（管理者）"; }
  }
}

// =====================================================================
// Policy Logic Tree
// =====================================================================
function initTreeBoards() {
  const area = document.getElementById("treeMainBoards");
  if (!area) return;
  area.innerHTML = "";
  MAIN_CATEGORIES.forEach((m, idx) => {
    const board = document.createElement("div");
    board.className = "tree-board";
    board.id = "treeBoard_" + idx;
    board.innerHTML =
      '<div class="tree-board-icon">' + m.icon + '</div>' +
      '<div class="tree-board-key">' + m.key + '</div>' +
      '<div class="tree-board-label">' + m.label + '</div>' +
      '<span class="tree-board-count" id="treeBoardCount_' + idx + '">0</span>';
    board.onclick = () => showTreeDetail(idx);
    area.appendChild(board);
  });
}

async function loadTreeData() {
  try {
    const res  = await fetch(GAS_URL + "?mode=list");
    const data = await res.json();
    if (Array.isArray(data)) cachedRows = data;
  } catch (e) { console.error("ツリーデータ取得失敗", e); }

  MAIN_CATEGORIES.forEach((m, idx) => {
    const cnt   = cachedRows.filter(r => findMain(r.main || r.category).key === m.key).length;
    const badge = document.getElementById("treeBoardCount_" + idx);
    if (badge) badge.textContent = cnt;
  });
}

function showTreeDetail(mainIndex) {
  document.querySelectorAll(".tree-board").forEach((b, i) =>
    b.classList.toggle("active", i === mainIndex));

  const m    = MAIN_CATEGORIES[mainIndex];
  const area = document.getElementById("treeDetailArea");
  if (!area) return;
  area.style.display = "block";

  const mainPosts = cachedRows.filter(r => findMain(r.main || r.category).key === m.key);

  area.innerHTML =
    '<div class="tree-detail-title">' + m.icon + ' ' + m.key + ' ' + m.label +
    ' <span style="font-size:13px;font-weight:400;color:#64748b;margin-left:8px;">計' + mainPosts.length + '件の投稿</span></div>';

  const allSubs = new Set([...m.subs.map(s => s.label), OTHER_LABEL]);
  mainPosts.forEach(r => { if (r.sub) allSubs.add(r.sub); });

  allSubs.forEach(subLabel => {
    const subPosts = mainPosts.filter(r => (r.sub || OTHER_LABEL) === subLabel);

    const block  = document.createElement("div");
    block.className = "tree-sub-block";

    const header = document.createElement("div");
    header.className = "tree-sub-header";
    header.innerHTML =
      '<span>' + subLabel + '</span>' +
      '<span>' +
        '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:999px;font-size:12px;margin-right:8px;">' + subPosts.length + '件</span>' +
        '<span class="tree-acc-arrow">▼</span>' +
      '</span>';

    const body = document.createElement("div");
    body.className = "tree-item-list";
    body.style.display = "none";

    if (!subPosts.length) {
      body.innerHTML = '<p style="font-size:13px;color:#94a3b8;padding:8px 0;">まだ投稿がありません</p>';
    } else {
      subPosts.forEach(r => {
        const borderColor = r.status === "統合"       ? "#2563eb"
                          : r.status === "新分類統合" ? "#8b5cf6"
                          : r.status === "統合済み"   ? "#94a3b8" : "#dc2626";
        const statusLabel = r.status === "統合"       ? "🔵 統合済み"
                          : r.status === "新分類統合" ? "🟣 新分類"
                          : r.status === "統合済み"   ? "⚫ 処理済み" : "🔴 未統合";

        const chip = document.createElement("div");
        chip.className = "tree-post-chip";
        chip.style.borderLeftColor = borderColor;

        const titleRow = document.createElement("div");
        titleRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;";
        titleRow.innerHTML =
          '<strong>' + (r.title || "(無題)") + '</strong>' +
          '<span style="font-size:11px;font-weight:700;color:' + borderColor + ';">' + statusLabel + '</span>';

        const sumDiv = document.createElement("div");
        sumDiv.className = "tree-post-summary";
        sumDiv.textContent = r.summary200 || "(要約なし)";

        if (r.mergedInto) {
          const note = document.createElement("div");
          note.className = "tree-merged-note";
          note.innerHTML = "📎 この投稿は「<strong>" + r.mergedInto + "</strong>」に統合されました";
          sumDiv.appendChild(note);
        }

        chip.appendChild(titleRow);
        chip.appendChild(sumDiv);

        // ★ 独立開閉（他チップに影響しない）
        let isOpen = false;
        chip.onclick = () => {
          isOpen = !isOpen;
          sumDiv.style.display = isOpen ? "block" : "none";
          chip.classList.toggle("open", isOpen);
        };

        body.appendChild(chip);
      });
    }

    header.onclick = () => {
      const open = body.style.display === "block";
      body.style.display = open ? "none" : "block";
      header.querySelector(".tree-acc-arrow").textContent = open ? "▼" : "▲";
    };

    block.appendChild(header);
    block.appendChild(body);
    area.appendChild(block);
  });

  setTimeout(() => area.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

// =====================================================================
// PR ページ
// =====================================================================
async function loadPRList() {
  const prList = document.getElementById("prList");
  if (!prList) return;
  prList.innerHTML = '<div class="pr-loading">読み込み中…</div>';

  try {
    const res  = await fetch(GAS_URL + "?mode=list");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (rows.error) throw new Error(rows.error);
    cachedRows = Array.isArray(rows) ? rows : [];
    renderPRList(cachedRows);

    // ★ 投稿追跡バナー
    if (lastPostedTitle) showTrackBanner();
  } catch (e) {
    prList.innerHTML = '<div class="pr-error">取得に失敗しました（' + e.message + '）</div>';
  }
}

function showTrackBanner() {
  const banner = document.getElementById("prTrackBanner");
  const text   = document.getElementById("prTrackText");
  if (!banner || !text) return;
  const mainObj = findMain(lastPostedMain);
  text.innerHTML =
    '「<strong>' + lastPostedTitle + '</strong>」を <strong>' +
    mainObj.label.split("（")[0] + '</strong> › <strong>' + lastPostedSub + '</strong> に投稿しました。下のリストでご確認ください。';
  banner.style.display = "flex";
}

function scrollToMyPost() {
  if (!lastPostedTitle) return;
  const mainObj = findMain(lastPostedMain);
  document.querySelectorAll(".pr-main-board").forEach(board => {
    const titleEl = board.querySelector(".pr-main-title");
    if (titleEl && titleEl.textContent.includes(mainObj.label.split("（")[0])) {
      const subArea = board.querySelector(".pr-sub-area");
      if (subArea && subArea.style.display !== "block") {
        subArea.style.display = "block";
        const arrow = board.querySelector(".pr-accordion-arrow");
        if (arrow) arrow.classList.add("open");
      }
      board.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function renderPRList(rows) {
  const prList = document.getElementById("prList");
  prList.innerHTML = "";

  // ★ 保存件数と表示件数の差を表示
  const processed  = rows.filter(r => r.status === "統合済み" || r.status === "新分類統合").length;
  const totalCount = rows.length;
  if (processed > 0) {
    const notice = document.createElement("div");
    notice.className = "pr-count-notice";
    notice.innerHTML =
      '📊 総保存件数：<strong>' + totalCount + '件</strong>' +
      '（うち元投稿として保持 ' + processed + ' 件。' +
      '統合・未統合の代表記事：<strong>' + (totalCount - processed) + '件</strong>）';
    prList.appendChild(notice);
  }

  MAIN_CATEGORIES.forEach(m => {
    const mainPosts = rows.filter(r => findMain(r.main || r.category).key === m.key);

    const mainBoard  = document.createElement("div");
    mainBoard.className = "pr-main-board";

    const mainHeader = document.createElement("div");
    mainHeader.className = "pr-main-header";
    mainHeader.innerHTML =
      '<span class="pr-main-title">' + m.icon + ' ' + m.key + ' ' + m.label + '</span>' +
      '<span class="pr-main-meta">' +
        '<span class="count-badge">' + mainPosts.length + '件</span>' +
        '<span class="pr-accordion-arrow">▼</span>' +
      '</span>';

    const subArea = document.createElement("div");
    subArea.className = "pr-sub-area";

    const subGrid = document.createElement("div");
    subGrid.className = "pr-sub-grid";

    const allSubs = new Set([...m.subs.map(s => s.label), OTHER_LABEL]);
    mainPosts.forEach(r => { if (r.sub) allSubs.add(r.sub); });

    allSubs.forEach(subLabel => {
      const subPosts = mainPosts.filter(r => (r.sub || OTHER_LABEL) === subLabel);

      const subBoard = document.createElement("div");
      subBoard.className = "pr-sub-board" + (subPosts.length ? " has-posts" : "");

      const subInner = document.createElement("div");
      subInner.className = "pr-sub-header-inner";
      subInner.innerHTML =
        '<span class="pr-sub-name">' + subLabel + '</span>' +
        '<span class="count-badge ' + (subPosts.length ? "" : "zero") + '">' + subPosts.length + '</span>';

      const subHint = document.createElement("div");
      subHint.className = "pr-sub-hint";
      subHint.textContent = subPosts.length ? "クリックして投稿一覧を見る ▼" : "まだ投稿がありません";

      const titleListArea = document.createElement("div");
      titleListArea.className = "pr-title-list-area";
      titleListArea.style.display = "none";

      const summaryPanel = document.createElement("div");
      summaryPanel.className = "pr-summary-panel";
      summaryPanel.style.display = "none";

      // ★ 表示順：統合記事 → 未統合 → 元の投稿（処理済み）
      const mergedRows   = subPosts.filter(r => r.status === "統合");
      const unmergedRows = subPosts.filter(r => r.status !== "統合" && r.status !== "統合済み" && r.status !== "新分類統合");
      const sourceRows   = subPosts.filter(r => r.status === "統合済み" || r.status === "新分類統合");
      const displayOrder = [...mergedRows, ...unmergedRows, ...sourceRows];

      displayOrder.forEach(row => {
        const isMergedResult = row.status === "統合";
        const isMergedSource = row.status === "統合済み" || row.status === "新分類統合";
        const borderColor    = isMergedResult ? "#2563eb" : isMergedSource ? "#94a3b8" : "#dc2626";
        const statusLabel    = isMergedResult ? "🔵 統合記事" : isMergedSource ? "⚫ 元の投稿" : "🔴 未統合";

        const titleBtn = document.createElement("div");
        titleBtn.className = "pr-title-btn";
        titleBtn.style.borderLeftColor = borderColor;
        titleBtn.innerHTML =
          '<span class="pr-title-btn-text">' + (row.title || "(無題)") + '</span>' +
          '<span class="pr-title-btn-status" style="color:' + borderColor + ';">' + statusLabel + '</span>';

        titleBtn.onclick = (ev) => {
          ev.stopPropagation();
          const badgeBg = isMergedResult ? "#dbeafe" : isMergedSource ? "#e2e8f0" : "#fee2e2";
          const badgeFg = isMergedResult ? "#1e40af" : isMergedSource ? "#64748b" : "#dc2626";

          let html =
            '<button class="pr-summary-close" onclick="this.closest(\'.pr-summary-panel\').style.display=\'none\'">✕ 閉じる</button>' +
            '<h3 class="pr-summary-title">' + (row.title || "(無題)") + '</h3>' +
            '<div style="margin-bottom:10px;">' +
              '<span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;background:' + badgeBg + ';color:' + badgeFg + ';">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="pr-summary-body">' + (row.summary200 || "（要約なし）") + '</div>';

          // ★ 統合記事：元の投稿と統合の根拠を表示
          if (isMergedResult) {
            const origPosts = subPosts.filter(r2 => r2.mergedInto === row.title);
            const hasRecord = row.fullText && row.fullText.includes("【統合記録】");
            if (origPosts.length > 0 || hasRecord) {
              html += '<div class="pr-merge-detail">' +
                '<div class="pr-merge-detail-header">🔗 この記事は複数の投稿を統合しています</div>' +
                '<div class="pr-merge-detail-body">';
              origPosts.forEach(op => {
                html +=
                  '<div class="pr-merge-row">' +
                  '<span class="pr-merge-label">元の投稿</span>' +
                  '<span class="pr-merge-text">「' + (op.title || "(無題)") + '」</span>' +
                  '</div>';
              });
              if (hasRecord) {
                const record = row.fullText.replace("【統合記録】", "").trim();
                html +=
                  '<div class="pr-merge-row">' +
                  '<span class="pr-merge-label">統合の根拠</span>' +
                  '<span class="pr-merge-text">' + record + '</span>' +
                  '</div>';
              }
              html += '</div></div>';
            }
          }

          // ★ 元の投稿：統合先を表示
          if (isMergedSource && row.mergedInto) {
            html += '<div class="pr-merged-note">📎 この投稿は「<strong>' + row.mergedInto + '</strong>」に統合されました</div>';
          }

          summaryPanel.innerHTML = html;
          summaryPanel.style.display = "block";
          titleListArea.querySelectorAll(".pr-title-btn").forEach(b => b.classList.remove("active"));
          titleBtn.classList.add("active");
          setTimeout(() => summaryPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
        };

        titleListArea.appendChild(titleBtn);
      });

      titleListArea.appendChild(summaryPanel);

      subBoard.onclick = (ev) => {
        if (!subPosts.length) return;
        const open = titleListArea.style.display === "block";
        titleListArea.style.display = open ? "none" : "block";
        if (open) summaryPanel.style.display = "none";
        subHint.textContent = open ? "クリックして投稿一覧を見る ▼" : "閉じる ▲";
        subBoard.classList.toggle("active", !open);
      };

      subBoard.appendChild(subInner);
      subBoard.appendChild(subHint);
      subBoard.appendChild(titleListArea);
      subGrid.appendChild(subBoard);
    });

    subArea.appendChild(subGrid);

    mainHeader.onclick = () => {
      const open  = subArea.style.display === "block";
      subArea.style.display = open ? "none" : "block";
      const arrow = mainHeader.querySelector(".pr-accordion-arrow");
      if (arrow) arrow.classList.toggle("open", !open);
    };

    mainBoard.appendChild(mainHeader);
    mainBoard.appendChild(subArea);
    prList.appendChild(mainBoard);
  });
}

// =====================================================================
// 統合ページ — 「詳しい仕組みはこちら」ボタンの開閉
// =====================================================================
function toggleMergeDetail() {
  const panel = document.getElementById("mergeDetailPanel");
  const btn   = document.getElementById("mergeDetailToggleBtn");
  if (!panel || !btn) return;
  const isOpen = panel.classList.contains("show");
  panel.classList.toggle("show", !isOpen);
  btn.classList.toggle("open", !isOpen);
  btn.querySelector(".toggle-arrow").textContent = isOpen ? "▼" : "▲";
  if (!isOpen) {
    setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }
}

// =====================================================================
// AI壁打ち
// =====================================================================
async function runAI() {
  const textarea     = document.getElementById("userInput");
  const aiResult     = document.getElementById("aiResult");
  const summarizeBtn = document.getElementById("summarizeBtnBox");
  const summaryArea  = document.getElementById("summaryArea");
  const deepDiveArea = document.getElementById("deepDiveArea");

  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) { alert("意見を入力してください"); return; }

  currentIdeaText = text;
  aiResult.innerHTML = '<p style="color:#2563eb;">🤖 AIが分析中…</p>';
  if (summarizeBtn)  summarizeBtn.style.display  = "none";
  if (summaryArea)   summaryArea.style.display   = "none";
  if (deepDiveArea)  deepDiveArea.style.display  = "none";

  try {
    const res  = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "analyze", text })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const parsed    = JSON.parse(data.content);
    currentAIResult = data.content;
    currentMain     = parsed.main || "";
    currentSub      = parsed.sub  || OTHER_LABEL;

    aiResult.innerHTML = '<p class="ai-result-summary">' + (parsed.analysis || "（分析結果なし）") + '</p>';

    if (deepDiveArea) {
      deepDiveArea.style.display = "block";
      deepDiveArea.innerHTML =
        '<div class="deep-item"><div class="deep-label">💡 核心・本当の願い</div><div class="deep-body">'     + (parsed.core     || "") + '</div></div>' +
        '<div class="deep-item"><div class="deep-label">🌱 実現した場合の変化</div><div class="deep-body">'   + (parsed.impact   || "") + '</div></div>' +
        '<div class="deep-item"><div class="deep-label">🌍 国内外の成功事例</div><div class="deep-body">'     + (parsed.example  || "") + '</div></div>' +
        '<div class="deep-item"><div class="deep-label">⚠️ 懸念点と乗り越え方</div><div class="deep-body">'  + (parsed.concern  || "") + '</div></div>' +
        '<div class="deep-item deep-next"><div class="deep-label">🚀 さらに発展させるための問い</div><div class="deep-body">' + (parsed.nextStep || "") + '</div></div>';
    }
    if (summarizeBtn) summarizeBtn.style.display = "block";

  } catch (e) {
    aiResult.innerHTML = '<p style="color:#dc2626;">エラー: ' + e.message + '</p>';
  }
}

async function confirmSummary() {
  const summaryArea    = document.getElementById("summaryArea");
  const summaryBox     = document.getElementById("summaryBox");
  const titleBox       = document.getElementById("titleBox");
  const categoryResult = document.getElementById("categoryResult");
  const postDecision   = document.getElementById("postDecision");

  if (!summaryArea) return;
  summaryArea.style.display = "block";
  if (summaryBox) summaryBox.textContent = "要約中…";

  try {
    const res  = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "summarize", text: currentIdeaText, analysis: currentAIResult })
    });
    const data   = await res.json();
    if (data.error) throw new Error(data.error);
    const parsed = JSON.parse(data.content);
    currentSummary200 = parsed.summary200 || "";
    currentTitle      = parsed.title      || "";

    if (summaryBox)     summaryBox.textContent    = currentSummary200;
    if (titleBox)       titleBox.textContent       = currentTitle;
    if (categoryResult) categoryResult.innerHTML   =
      "大分類：<strong>" + currentMain + "</strong><br>中分類：<strong>" + currentSub + "</strong>";
    if (postDecision)   postDecision.style.display = "block";
  } catch (e) {
    if (summaryBox) summaryBox.textContent = "エラー: " + e.message;
  }
}

async function postToPR() {
  const btn = document.querySelector("#postDecision .big-button.success");
  if (btn) { btn.disabled = true; btn.textContent = "投稿中…"; }

  try {
    const res  = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "save",
        title: currentTitle, summary200: currentSummary200,
        fullText: currentIdeaText, main: currentMain, sub: currentSub
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // ★ 追跡情報を記録してPRページへ
    lastPostedTitle = currentTitle;
    lastPostedMain  = currentMain;
    lastPostedSub   = currentSub;
    cachedRows      = []; // キャッシュクリア
    showPage("pullrequest");

  } catch (e) {
    alert("投稿エラー: " + e.message);
    if (btn) { btn.disabled = false; btn.textContent = "✅ PRページへ投稿する"; }
  }
}

function continueEditing() {
  const summaryArea  = document.getElementById("summaryArea");
  const postDecision = document.getElementById("postDecision");
  if (summaryArea)  summaryArea.style.display  = "none";
  if (postDecision) postDecision.style.display = "none";
}

// =====================================================================
// 初期化
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
  showPage("intro");
});

