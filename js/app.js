// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbwQAVSj_yqYLN_djNexwMAkt5vo45anO6RyTPgsJbbZNzJ17wGcfVDP_3XewYgZukbwZw/exec";

// ======================= タクソノミー定義 =======================
const OTHER_LABEL = "その他";
const MERGE_THRESHOLD = 10;
const BOARD_ICONS = ["🏫","❤️","💰","🏛","🛡"];

const MAIN_CATEGORIES = [
  {
    key:"①", icon:"🏫",
    label:"芦屋市の価値向上（ブランド・移住促進）", keyword:"価値向上",
    subs:[
      { label:"次世代教育ブランドの確立", keyword:"教育ブランド", items:["世界一の絵本図書館","EdTech企業連携"] },
      { label:"街の魅力化・景観美化",     keyword:"魅力化",     items:["公園芝生化"] },
      { label:"市民協働",                keyword:"市民協働",    items:[] }
    ]
  },
  {
    key:"②", icon:"❤️",
    label:"市民へのベネフィット（ウェルビーイング）", keyword:"ベネフィット",
    subs:[
      { label:"多世代交流・サードプレイス", keyword:"サードプレイス", items:["カフェ","コミュニティ運営"] },
      { label:"知的探究・スキルアップ",    keyword:"スキルアップ",   items:["リスキリング","共同研究","コワーキング"] }
    ]
  },
  {
    key:"③", icon:"💰",
    label:"財政的持続可能性", keyword:"財政的",
    subs:[
      { label:"施設の収益化",    keyword:"収益化",     items:["SHARE LOUNGE","チャレンジショップ"] },
      { label:"寄付・ふるさと納税", keyword:"ふるさと納税", items:["クラファン連動","成果連動型事業"] }
    ]
  },
  {
    key:"④", icon:"🏛",
    label:"施設の戦略性", keyword:"戦略性",
    subs:[
      { label:"知のゲートウェイ化",    keyword:"ゲートウェイ", items:["デジタルライブラリ","ITサポート"] },
      { label:"イノベーション・起業支援", keyword:"起業支援",    items:["ピッチアリーナ","サンドボックス"] }
    ]
  },
  {
    key:"⑤", icon:"🛡",
    label:"都市の強靭性とガバナンス", keyword:"強靭性",
    subs:[
      { label:"デュアルユース",     keyword:"デュアルユース", items:["災害シミュレーション","都市指令室"] },
      { label:"DAO型住民自治投票", keyword:"DAO",           items:["トークン設計"] }
    ]
  }
];

// ======================= ヘルパー =======================
function findMain(text) {
  if (!text) return MAIN_CATEGORIES[0];
  for (const m of MAIN_CATEGORIES) {
    if (text.includes(m.keyword) || text.includes(m.key) || text.includes(m.label)) return m;
  }
  return MAIN_CATEGORIES[0];
}

function findSub(mainEntry, text) {
  if (!text) return OTHER_LABEL;
  for (const s of mainEntry.subs) {
    if (text.includes(s.keyword) || text.includes(s.label)) return s.label;
  }
  return OTHER_LABEL;
}

function findItem(mainEntry, subLabel, text) {
  if (!text) return OTHER_LABEL;
  const subEntry = mainEntry.subs.find(s => s.label === subLabel);
  if (!subEntry) return OTHER_LABEL;
  for (const it of subEntry.items) {
    if (text.includes(it)) return it;
  }
  return OTHER_LABEL;
}

// ======================= 状態管理 =======================
let currentCategory = "①";
let currentIdeaText = "";
let currentAIResult = "";
let currentSummary200 = "";
let currentTitle = "";
let currentMain = "";
let currentSub = "";
let currentItem = "";

// グローバルの投稿データキャッシュ（ツリーとPR両方で使う）
let cachedRows = [];

// ======================= ページ切り替え =======================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  if (pageId === "pullrequest") loadPRList();
  if (pageId === "tree") { initTreeBoards(); loadTreeData(); }
}

// ======================= カテゴリーバー =======================
function initCategoryButtons() {
  const bar = document.getElementById("categoryBar");
  if (!bar) return;
  bar.innerHTML = "";
  MAIN_CATEGORIES.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (currentCategory === m.key ? " active" : "");
    btn.textContent = m.key + " " + m.label;
    btn.onclick = () => {
      currentCategory = m.key;
      bar.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    bar.appendChild(btn);
  });
}

// =====================================================================
//   LOGIC TREE PAGE
// =====================================================================

function initTreeBoards() {
  const area = document.getElementById("treeMainBoards");
  if (!area || area.dataset.built) return;
  area.dataset.built = "1";
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
  if (cachedRows.length === 0) {
    try {
      const res = await fetch(GAS_URL + "?mode=list");
      const data = await res.json();
      if (Array.isArray(data)) cachedRows = data;
    } catch(e) { console.error("ツリーデータ取得失敗", e); }
  }
  // バッジ更新
  MAIN_CATEGORIES.forEach((m, idx) => {
    const count = cachedRows.filter(r => findMain(r.main || r.category).key === m.key).length;
    const badge = document.getElementById("treeBoardCount_" + idx);
    if (badge) badge.textContent = count;
  });
}

function showTreeDetail(mainIndex) {
  // ボードの active 切り替え
  document.querySelectorAll(".tree-board").forEach((b, i) => {
    b.classList.toggle("active", i === mainIndex);
  });

  const m = MAIN_CATEGORIES[mainIndex];
  const area = document.getElementById("treeDetailArea");
  if (!area) return;
  area.style.display = "block";
  area.innerHTML = '<div class="tree-detail-title">' + m.icon + ' ' + m.key + ' ' + m.label + '</div>';

  // 中分類ごとのアコーデオン
  const subsToShow = [...m.subs, { label: OTHER_LABEL, keyword: "", items: [] }];
  subsToShow.forEach(s => {
    const block = document.createElement("div");
    block.className = "tree-sub-block";

    // 中分類に属する投稿
    const subPosts = cachedRows.filter(r => {
      const rm = findMain(r.main || r.category);
      if (rm.key !== m.key) return false;
      const rs = findSub(rm, r.sub);
      return rs === s.label;
    });

    const header = document.createElement("div");
    header.className = "tree-sub-header";
    header.innerHTML =
      '<span>' + s.label + '</span>' +
      '<span>' +
        '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:999px;font-size:12px;margin-right:8px;">' + subPosts.length + '件</span>' +
        '<span>▼</span>' +
      '</span>';

    const body = document.createElement("div");
    body.className = "tree-item-list";

    // 小分類チップ
    const chips = document.createElement("div");
    chips.className = "tree-item-chips";

    // 固定小分類 + その他
    const allItems = s.items.length ? [...s.items, OTHER_LABEL] : [OTHER_LABEL];
    allItems.forEach(it => {
      const itPosts = subPosts.filter(r => {
        const ri = findItem(m, s.label, r.item);
        return ri === it;
      });
      if (s.label === OTHER_LABEL && it === OTHER_LABEL && itPosts.length === 0) return;
      const chip = document.createElement("span");
      chip.className = "tree-item-chip" +
        (it === OTHER_LABEL ? " other" : "") +
        (itPosts.some(r => r.status === "統合") ? " merged" : "");
      chip.textContent = it + (itPosts.length ? "（" + itPosts.length + "件）" : "");
      body.appendChild(chips);
      chips.appendChild(chip);
    });

    // 統合済み投稿のリスト
    const mergedPosts = subPosts.filter(r => r.status === "統合");
    if (mergedPosts.length) {
      const mTitle = document.createElement("div");
      mTitle.style.cssText = "margin-top:12px; font-size:13px; font-weight:700; color:#15803d;";
      mTitle.textContent = "📌 ロジックツリーに記載されている統合記事";
      body.appendChild(mTitle);
      mergedPosts.forEach(r => {
        const d = document.createElement("div");
        d.style.cssText = "padding:8px 12px; margin-top:6px; background:#dcfce7; border-radius:8px; font-size:13px; color:#166534;";
        d.textContent = "🔵 " + r.title;
        body.appendChild(d);
      });
    }

    header.onclick = () => {
      const open = body.style.display === "block";
      body.style.display = open ? "none" : "block";
      header.querySelector("span:last-child span:last-child").textContent = open ? "▼" : "▲";
    };

    block.appendChild(header);
    block.appendChild(body);
    area.appendChild(block);
  });

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =====================================================================
//   PR PAGE — 大分類ボード → 中分類ボード → 小分類 → 投稿
// =====================================================================

async function loadPRList() {
  const prList = document.getElementById("prList");
  if (!prList) return;
  prList.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">読み込み中…</div>';

  try {
    const res = await fetch(GAS_URL + "?mode=list");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (rows.error) throw new Error(rows.error);
    cachedRows = Array.isArray(rows) ? rows : [];
    renderPRList(cachedRows);
  } catch(e) {
    console.error(e);
    prList.innerHTML = '<div style="padding:24px; color:#dc2626;">投稿一覧の取得に失敗しました（' + e.message + '）</div>';
  }
}

function renderPRList(rows) {
  const prList = document.getElementById("prList");
  prList.innerHTML = "";

  // ────── 大分類ごとのボード ──────
  MAIN_CATEGORIES.forEach((m, mIdx) => {
    // この大分類に属する投稿
    const mainPosts = rows.filter(r => findMain(r.main || r.category).key === m.key);
    const totalCount = mainPosts.length;

    // ── 大分類ボード ──
    const mainBoard = document.createElement("div");
    mainBoard.className = "pr-main-board";

    const mainHeader = document.createElement("div");
    mainHeader.className = "pr-main-header";
    mainHeader.innerHTML =
      '<span class="pr-main-title">' + m.icon + ' ' + m.key + ' ' + m.label + '</span>' +
      '<span class="pr-main-meta">' +
        '<span class="count-badge">' + totalCount + '件</span>' +
        '<span class="pr-accordion-arrow">▼</span>' +
      '</span>';

    // ── 中分類エリア ──
    const subArea = document.createElement("div");
    subArea.className = "pr-sub-area";
    const subGrid = document.createElement("div");
    subGrid.className = "pr-sub-grid";

    // 中分類リスト（固定 + その他）
    const subsToShow = [...m.subs, { label: OTHER_LABEL, keyword: "", items: [] }];

    subsToShow.forEach(s => {
      const subPosts = mainPosts.filter(r => {
        const rs = findSub(findMain(r.main || r.category), r.sub || "");
        return rs === s.label;
      });

      const subBoard = document.createElement("div");
      subBoard.className = "pr-sub-board" + (subPosts.length ? " has-posts" : "");

      const subInner = document.createElement("div");
      subInner.className = "pr-sub-header-inner";
      subInner.innerHTML =
        '<span class="pr-sub-name">' + s.label + '</span>' +
        '<span class="count-badge ' + (subPosts.length ? "" : "zero") + '">' + subPosts.length + '</span>';

      const subHint = document.createElement("div");
      subHint.className = "pr-sub-hint";
      subHint.textContent = subPosts.length ? "クリックして投稿を見る ▼" : "まだ投稿がありません";

      // ── 小分類+投稿エリア ──
      const itemArea = document.createElement("div");
      itemArea.className = "pr-item-area";
      buildItemArea(itemArea, m, s, subPosts);

      subBoard.onclick = (ev) => {
        if (!subPosts.length) return;
        const open = itemArea.style.display === "block";
        itemArea.style.display = open ? "none" : "block";
        subHint.textContent = open ? "クリックして投稿を見る ▼" : "閉じる ▲";
        subBoard.classList.toggle("active", !open);
      };

      subBoard.appendChild(subInner);
      subBoard.appendChild(subHint);
      subBoard.appendChild(itemArea);
      subGrid.appendChild(subBoard);
    });

    subArea.appendChild(subGrid);

    mainHeader.onclick = () => {
      const open = subArea.style.display === "block";
      subArea.style.display = open ? "none" : "block";
      const arrow = mainHeader.querySelector(".pr-accordion-arrow");
      if (arrow) arrow.classList.toggle("open", !open);
    };

    mainBoard.appendChild(mainHeader);
    mainBoard.appendChild(subArea);
    prList.appendChild(mainBoard);
  });
}

function buildItemArea(container, mainEntry, subEntry, subPosts) {
  container.innerHTML = "";
  if (!subPosts.length) return;

  // ── 小分類ボード ──
  const allItems = subEntry.items.length
    ? [...subEntry.items, OTHER_LABEL]
    : [OTHER_LABEL];

  const itemGrid = document.createElement("div");
  itemGrid.className = "pr-item-grid";

  const postsArea = document.createElement("div");
  postsArea.className = "pr-posts-area";

  let activeItem = null;

  allItems.forEach(it => {
    const itPosts = subPosts.filter(r => {
      const ri = findItem(mainEntry, subEntry.label, r.item || "");
      return ri === it;
    });

    const chip = document.createElement("div");
    chip.className = "pr-item-board";
    chip.innerHTML =
      '<span class="pr-item-name">' + it + '</span>' +
      '<span class="count-badge ' + (itPosts.length ? "" : "zero") + '">' + itPosts.length + '</span>';

    chip.onclick = (ev) => {
      ev.stopPropagation();
      if (activeItem === it) {
        activeItem = null;
        postsArea.innerHTML = "";
        itemGrid.querySelectorAll(".pr-item-board").forEach(c => c.classList.remove("active"));
        return;
      }
      activeItem = it;
      itemGrid.querySelectorAll(".pr-item-board").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderPostCards(postsArea, itPosts);
    };

    itemGrid.appendChild(chip);
  });

  container.appendChild(itemGrid);
  container.appendChild(postsArea);
}

function renderPostCards(container, posts) {
  container.innerHTML = "";
  if (!posts.length) {
    container.innerHTML = '<div style="padding:12px; color:#64748b; font-size:14px;">この分類にはまだ投稿がありません</div>';
    return;
  }

  posts.forEach(row => {
    const isMergedSource = row.status === "統合済み";
    const isMergedResult = row.status === "統合";

    const card = document.createElement("div");
    card.className = "pr-post-card" +
      (isMergedSource ? " merged-source" : isMergedResult ? " merged-result" : "");

    const statusText = isMergedSource ? "処理済み" : isMergedResult ? "統合済み" : "未統合";
    const statusClass = isMergedSource ? "status-merged-source" : isMergedResult ? "status-merged-result" : "status-unmerged";

    card.innerHTML =
      '<span class="pr-post-title">' + (row.title || "(無題)") + '</span>' +
      '<span class="pr-post-status ' + statusClass + '">' + statusText + '</span>';

    const summary = document.createElement("div");
    summary.className = "pr-post-summary";
    summary.textContent = row.summary200 || "";

    if (isMergedSource && row.mergedInto) {
      const note = document.createElement("div");
      note.className = "merged-note";
      note.innerHTML = 'この投稿は <strong>「' + row.mergedInto + '」</strong> に統合されました。';
      summary.appendChild(note);
    }

    card.appendChild(summary);
    card.onclick = (ev) => {
      ev.stopPropagation();
      const open = summary.style.display === "block";
      // 同じエリア内の他を閉じる
      container.querySelectorAll(".pr-post-summary").forEach(s => s.style.display = "none");
      summary.style.display = open ? "none" : "block";
    };

    container.appendChild(card);
  });
}

// =====================================================================
//   AI壁打ち
// =====================================================================

async function runAI() {
  const textarea = document.getElementById("userInput");
  const aiResult = document.getElementById("aiResult");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const summaryArea = document.getElementById("summaryArea");

  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) { alert("意見を入力してください。"); return; }

  currentIdeaText = text;
  aiResult.textContent = "AIが整理しています…";
  if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
  if (summaryArea) summaryArea.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode: "analyze", text, category: currentCategory })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
    currentAIResult = content.analysis || "";
    currentMain  = content.main || content.category || "";
    currentSub   = content.sub || "";
    currentItem  = content.item || "";

    aiResult.textContent = currentAIResult;
    if (summarizeBtnBox) summarizeBtnBox.style.display = "block";
  } catch(e) {
    console.error(e);
    aiResult.textContent = "AIとの通信でエラーが発生しました（" + e.message + "）。";
  }
}

async function confirmSummary() {
  const summaryBox = document.getElementById("summaryBox");
  const titleBox   = document.getElementById("titleBox");
  const catResult  = document.getElementById("categoryResult");
  const summaryArea = document.getElementById("summaryArea");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const postDecision = document.getElementById("postDecision");

  summaryArea.style.display = "block";
  summaryBox.textContent = "200字要約を生成しています…";
  titleBox.textContent = "タイトルを生成しています…";
  if (catResult) catResult.textContent = "";
  if (postDecision) postDecision.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode: "summarize", text: currentIdeaText, analysis: currentAIResult, category: currentCategory })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
    currentSummary200 = content.summary200 || "";
    currentTitle      = content.title || "";

    summaryBox.textContent = currentSummary200;
    titleBox.textContent   = currentTitle;
    if (catResult) {
      catResult.innerHTML =
        "大分類：" + (currentMain || "―") + "<br>" +
        "中分類：" + (currentSub  || OTHER_LABEL) + "<br>" +
        "小分類：" + (currentItem || OTHER_LABEL);
    }
    if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
    if (postDecision) postDecision.style.display = "block";
  } catch(e) {
    console.error(e);
    summaryBox.textContent = "要約生成でエラーが発生しました（" + e.message + "）。";
    titleBox.textContent = "";
  }
}

async function postToPR() {
  const btn = document.querySelector("#postDecision .big-button.success");
  if (btn) btn.disabled = true;
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mode: "save",
        main: currentMain, category: currentMain,
        sub: currentSub, item: currentItem,
        title: currentTitle, summary200: currentSummary200, fullText: currentIdeaText
      })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    cachedRows = []; // キャッシュリセット
    alert("PRページに投稿しました。ご意見ありがとうございました！");
    resetForm();
    showPage("pullrequest");
  } catch(e) {
    console.error(e);
    alert("投稿に失敗しました（" + e.message + "）。もう一度お試しください。");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function continueEditing() { resetForm(); }

function resetForm() {
  const els = { userInput:"", aiResult:"結果はここに表示されます。" };
  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
  const ta = document.getElementById("userInput");
  if (ta) { ta.value = ""; ta.focus(); }
  ["summarizeBtnBox","summaryArea","postDecision"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  currentIdeaText = currentAIResult = currentSummary200 = currentTitle = currentMain = currentSub = currentItem = "";
}

// ======================= ルールページ タブ切り替え =======================
function switchTab(group, panel) {
  // パネル切り替え
  document.getElementById(group + "-easy").classList.toggle("active", panel === "easy");
  document.getElementById(group + "-expert").classList.toggle("active", panel === "expert");
  // ボタン active 切り替え
  const bar = document.getElementById(group + "-easy").parentElement
    .querySelector(".rules-tab-bar");
  if (bar) {
    bar.querySelectorAll(".rules-tab-btn").forEach((btn, i) => {
      btn.classList.toggle("active", (i === 0 && panel === "easy") || (i === 1 && panel === "expert"));
    });
  }
}

// ======================= 初期化 =======================
window.onload = function() {
  initCategoryButtons();
  showPage("intro");
};
