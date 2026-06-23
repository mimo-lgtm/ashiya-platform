// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbzhfNpYe6FEysPfdZPsy9cZFRgaCeB5PmkVBMGAr3OBNl7nOmD0XzbYKNm0MuiiYh4pTw/exec";

// ======================= タクソノミー =======================
const OTHER_LABEL = "その他";

const MAIN_CATEGORIES = [
  { key:"①", icon:"🏫", label:"芦屋市の価値向上（ブランド・移住促進）",   keyword:"価値向上",
    subs:[ {label:"次世代教育ブランドの確立"}, {label:"街の魅力化・景観美化"}, {label:"市民協働"} ] },
  { key:"②", icon:"❤️", label:"市民へのベネフィット（ウェルビーイング）",  keyword:"ベネフィット",
    subs:[ {label:"多世代交流・サードプレイス"}, {label:"知的探究・スキルアップ"} ] },
  { key:"③", icon:"💰", label:"財政的持続可能性",                          keyword:"財政的",
    subs:[ {label:"施設の収益化"}, {label:"寄付・ふるさと納税"} ] },
  { key:"④", icon:"🏛", label:"施設の戦略性",                              keyword:"戦略性",
    subs:[ {label:"知のゲートウェイ化"}, {label:"イノベーション・起業支援"} ] },
  { key:"⑤", icon:"🛡", label:"都市の強靭性とガバナンス",                  keyword:"強靭性",
    subs:[ {label:"デュアルユース"}, {label:"DAO型住民自治投票"} ] }
];

function findMain(text) {
  if (!text) return MAIN_CATEGORIES[0];
  for (const m of MAIN_CATEGORIES) {
    if (text.includes(m.keyword) || text.includes(m.label)) return m;
  }
  // キーで検索
  for (const m of MAIN_CATEGORIES) {
    if (text.includes(m.key)) return m;
  }
  return MAIN_CATEGORIES[0];
}

// ======================= 状態管理 =======================
let currentCategory = "①";
let currentIdeaText = "";
let currentAIResult = "";
let currentSummary200 = "";
let currentTitle = "";
let currentMain = "";
let currentSub = "";
let cachedRows = [];

// ======================= ページ切り替え =======================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");
  if (pageId === "pullrequest") loadPRList();
  if (pageId === "tree") { initTreeBoards(); loadTreeData(); }
  if (pageId === "rules") loadRulesSummary();
}

// ======================= 分析ページ サマリー =======================
async function loadRulesSummary() {
  const totalEl  = document.getElementById("summaryTotal");
  const mergedEl = document.getElementById("summaryMerged");
  const topEl    = document.getElementById("summaryTop");
  const barWrap  = document.getElementById("summaryBarWrap");
  if (!totalEl) return;

  try {
    if (cachedRows.length === 0) {
      const res = await fetch(GAS_URL + "?mode=list");
      const data = await res.json();
      if (Array.isArray(data)) cachedRows = data;
    }
    const rows = cachedRows;
    const total  = rows.length;
    const merged = rows.filter(r => r.status === "統合" || r.status === "新分類統合").length;

    // 大分類ごとの件数
    const counts = {};
    MAIN_CATEGORIES.forEach(m => counts[m.label] = 0);
    rows.forEach(r => {
      const m = findMain(r.main || r.category);
      counts[m.label] = (counts[m.label] || 0) + 1;
    });
    const topEntry = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];

    totalEl.textContent  = total + "件";
    mergedEl.textContent = merged + "件";
    topEl.textContent    = topEntry ? topEntry[0].split("（")[0] : "―";

    if (barWrap && total > 0) {
      barWrap.innerHTML = "<h3 style='margin-bottom:12px;'>大分類別の投稿割合</h3>";
      MAIN_CATEGORIES.forEach(m => {
        const cnt = counts[m.label] || 0;
        const pct = Math.round(cnt / total * 100);
        barWrap.innerHTML +=
          '<div class="analysis-bar-row">' +
            '<div class="analysis-bar-label">' + m.icon + " " + m.label.split("（")[0] + '</div>' +
            '<div class="analysis-bar-bg"><div class="analysis-bar-fill" style="width:' + pct + '%;"></div></div>' +
            '<div class="analysis-bar-pct">' + pct + '%（' + cnt + '件）</div>' +
          '</div>';
      });
    }
  } catch(e) {
    console.error("サマリー読み込み失敗", e);
  }
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
//   LOGIC TREE — クリッカブルボード
// =====================================================================
function initTreeBoards() {
  const area = document.getElementById("treeMainBoards");
  if (!area) return;
  area.dataset.built = "";  // 毎回再描画
  area.innerHTML = "";

  MAIN_CATEGORIES.forEach((m, idx) => {
    const board = document.createElement("div");
    board.className = "tree-board";
    board.id = "treeBoard_" + idx;
    board.title = "クリックして詳細を見る";
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
    const res = await fetch(GAS_URL + "?mode=list");
    const data = await res.json();
    if (Array.isArray(data)) cachedRows = data;
  } catch(e) { console.error("ツリーデータ取得失敗", e); }

  MAIN_CATEGORIES.forEach((m, idx) => {
    const count = cachedRows.filter(r => findMain(r.main || r.category).key === m.key).length;
    const badge = document.getElementById("treeBoardCount_" + idx);
    if (badge) badge.textContent = count;
  });
}

function showTreeDetail(mainIndex) {
  document.querySelectorAll(".tree-board").forEach((b, i) => b.classList.toggle("active", i === mainIndex));

  const m = MAIN_CATEGORIES[mainIndex];
  const area = document.getElementById("treeDetailArea");
  if (!area) return;
  area.style.display = "block";

  // このメインに属する投稿
  const mainPosts = cachedRows.filter(r => findMain(r.main || r.category).key === m.key);

  area.innerHTML =
    '<div class="tree-detail-title">' + m.icon + ' ' + m.key + ' ' + m.label +
    ' <span style="font-size:13px; font-weight:400; color:#64748b; margin-left:8px;">計' + mainPosts.length + '件の投稿</span></div>';

  // 中分類ごとにアコーデオン（固定分類 + 動的に追加されたもの）
  const allSubs = new Set([...m.subs.map(s => s.label), OTHER_LABEL]);
  mainPosts.forEach(r => { if (r.sub) allSubs.add(r.sub); });

  allSubs.forEach(subLabel => {
    const subPosts = mainPosts.filter(r => (r.sub || OTHER_LABEL) === subLabel);

    const block = document.createElement("div");
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

    if (subPosts.length === 0) {
      body.innerHTML = '<p style="font-size:13px;color:#94a3b8;padding:8px 0;">まだ投稿がありません</p>';
    } else {
      // 投稿カードを並べる（小分類＝投稿記事）
      subPosts.forEach(r => {
        const chip = document.createElement("div");
        chip.style.cssText = "margin-bottom:8px; padding:10px 14px; background:#fff; border-radius:10px; border-left:4px solid " +
          (r.status === "統合" ? "#2563eb" : r.status === "新分類統合" ? "#8b5cf6" : r.status === "統合済み" ? "#94a3b8" : "#dc2626") +
          "; font-size:13px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.06);";

        const statusColor = r.status === "統合" ? "#1d4ed8" : r.status === "新分類統合" ? "#6d28d9" : r.status === "統合済み" ? "#64748b" : "#dc2626";
        const statusLabel = r.status === "統合" ? "🔵統合済" : r.status === "新分類統合" ? "🟣新分類" : r.status === "統合済み" ? "⚫処理済" : "🔴未統合";

        chip.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<strong>' + (r.title || "(無題)") + '</strong>' +
            '<span style="font-size:11px;font-weight:700;color:' + statusColor + ';">' + statusLabel + '</span>' +
          '</div>';

        const sumDiv = document.createElement("div");
        sumDiv.style.cssText = "display:none; margin-top:8px; padding:8px; background:#f8fafc; border-radius:6px; font-size:13px; color:#475569; line-height:1.6;";
        sumDiv.textContent = r.summary200 || "(要約なし)";
        if (r.mergedInto) {
          sumDiv.innerHTML += '<div style="margin-top:6px;color:#2563eb;font-size:12px;">→ 統合先：' + r.mergedInto + '</div>';
        }

        chip.appendChild(sumDiv);
        chip.onclick = () => { sumDiv.style.display = sumDiv.style.display === "none" ? "block" : "none"; };

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

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =====================================================================
//   PR PAGE — アコーデオン
// =====================================================================
async function loadPRList() {
  const prList = document.getElementById("prList");
  if (!prList) return;
  prList.innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">読み込み中…</div>';

  try {
    const res = await fetch(GAS_URL + "?mode=list");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (rows.error) throw new Error(rows.error);
    cachedRows = Array.isArray(rows) ? rows : [];
    renderPRList(cachedRows);
  } catch(e) {
    prList.innerHTML = '<div style="padding:24px;color:#dc2626;">取得に失敗しました（' + e.message + '）</div>';
  }
}

function renderPRList(rows) {
  const prList = document.getElementById("prList");
  prList.innerHTML = "";

  MAIN_CATEGORIES.forEach((m) => {
    const mainPosts = rows.filter(r => findMain(r.main || r.category).key === m.key);
    const totalCount = mainPosts.length;

    const mainBoard = document.createElement("div");
    mainBoard.className = "pr-main-board";

    const mainHeader = document.createElement("div");
    mainHeader.className = "pr-main-header";
    mainHeader.innerHTML =
      '<span class="pr-main-title">' + m.icon + ' ' + m.key + ' ' + m.label + '</span>' +
      '<span class="pr-main-meta"><span class="count-badge">' + totalCount + '件</span><span class="pr-accordion-arrow">▼</span></span>';

    const subArea = document.createElement("div");
    subArea.className = "pr-sub-area";
    const subGrid = document.createElement("div");
    subGrid.className = "pr-sub-grid";

    // 中分類リスト（固定 + 動的に追加されたもの）
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
      subHint.textContent = subPosts.length ? "クリックして投稿を見る ▼" : "まだ投稿がありません";

      // 投稿エリア（フル幅で開く）
      const postArea = document.createElement("div");
      postArea.className = "pr-post-area-full";
      postArea.style.display = "none";
      renderPostCardsFull(postArea, subPosts);

      subBoard.onclick = () => {
        if (!subPosts.length) return;
        const open = postArea.style.display === "block";
        postArea.style.display = open ? "none" : "block";
        subHint.textContent = open ? "クリックして投稿を見る ▼" : "閉じる ▲";
        subBoard.classList.toggle("active", !open);
      };

      subBoard.appendChild(subInner);
      subBoard.appendChild(subHint);
      subBoard.appendChild(postArea);
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

// ★ フル幅で投稿を表示（200字要約を広いボックスで）
function renderPostCardsFull(container, posts) {
  container.innerHTML = "";
  if (!posts.length) {
    container.innerHTML = '<div style="padding:12px;color:#64748b;font-size:14px;">この分類にはまだ投稿がありません</div>';
    return;
  }

  posts.forEach(row => {
    const isMergedSource = row.status === "統合済み" || row.status === "新分類統合";
    const isMergedResult = row.status === "統合";

    const statusText  = isMergedSource ? "処理済み" : isMergedResult ? "🔵 統合済み" : "🔴 未統合";
    const statusClass = isMergedSource ? "status-merged-source" : isMergedResult ? "status-merged-result" : "status-unmerged";
    const borderColor = isMergedSource ? "#94a3b8" : isMergedResult ? "#2563eb" : "#dc2626";

    const card = document.createElement("div");
    card.className = "pr-post-card-full";
    card.style.borderLeftColor = borderColor;

    const titleRow = document.createElement("div");
    titleRow.className = "pr-post-title-row";
    titleRow.innerHTML =
      '<span class="pr-post-title-text">' + (row.title || "(無題)") + '</span>' +
      '<span class="pr-post-status ' + statusClass + '">' + statusText + '</span>';

    // ★ 200字要約：フル幅ボックス（最初から表示）
    const summaryBox = document.createElement("div");
    summaryBox.className = "pr-summary-fullbox";
    summaryBox.innerHTML = row.summary200
      ? '<p>' + row.summary200 + '</p>'
      : '<p style="color:#94a3b8;font-style:italic;">（要約なし）</p>';

    if (isMergedSource && row.mergedInto) {
      summaryBox.innerHTML += '<div class="pr-merged-note">📎 この投稿は「<strong>' + row.mergedInto + '</strong>」に統合されました</div>';
    }

    card.appendChild(titleRow);
    card.appendChild(summaryBox);
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
  const deepDiveArea = document.getElementById("deepDiveArea");

  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) { alert("意見を入力してください。"); return; }

  currentIdeaText = text;
  aiResult.innerHTML = '<div style="color:#64748b;padding:16px;">🤖 AIが分析しています…少々お待ちください</div>';
  if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
  if (summaryArea) summaryArea.style.display = "none";
  if (deepDiveArea) deepDiveArea.style.display = "none";

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
    currentMain = content.main || "";
    currentSub  = content.sub  || "";

    // ── 深掘り表示 ──
    aiResult.innerHTML = '<div class="ai-result-summary">' + (content.analysis || "") + '</div>';

    if (deepDiveArea) {
      deepDiveArea.style.display = "block";
      deepDiveArea.innerHTML = `
        <div class="deep-item">
          <div class="deep-label">💡 この意見の核心</div>
          <div class="deep-body">${content.core || "―"}</div>
        </div>
        <div class="deep-item">
          <div class="deep-label">🌱 実現したら、どう変わる？</div>
          <div class="deep-body">${content.impact || "―"}</div>
        </div>
        <div class="deep-item">
          <div class="deep-label">🌍 似た成功事例</div>
          <div class="deep-body">${content.example || "―"}</div>
        </div>
        <div class="deep-item">
          <div class="deep-label">⚠️ 懸念点・乗り越え方</div>
          <div class="deep-body">${content.concern || "―"}</div>
        </div>
        <div class="deep-item deep-next">
          <div class="deep-label">🚀 さらに考えてみよう</div>
          <div class="deep-body">${content.nextStep || "―"}</div>
        </div>`;
    }

    if (summarizeBtnBox) summarizeBtnBox.style.display = "block";
  } catch(e) {
    console.error(e);
    aiResult.innerHTML = '<div style="color:#dc2626;padding:12px;">エラーが発生しました（' + e.message + '）</div>';
  }
}

async function confirmSummary() {
  const summaryBox  = document.getElementById("summaryBox");
  const titleBox    = document.getElementById("titleBox");
  const catResult   = document.getElementById("categoryResult");
  const summaryArea = document.getElementById("summaryArea");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const postDecision    = document.getElementById("postDecision");

  summaryArea.style.display = "block";
  summaryBox.textContent = "200字要約を生成しています…";
  titleBox.textContent   = "タイトルを生成しています…";
  if (catResult)    catResult.textContent = "";
  if (postDecision) postDecision.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode:"summarize", text:currentIdeaText, analysis:currentAIResult, category:currentCategory })
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
        "中分類：" + (currentSub  || OTHER_LABEL);
    }
    if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
    if (postDecision) postDecision.style.display = "block";
  } catch(e) {
    summaryBox.textContent = "要約生成でエラーが発生しました（" + e.message + "）。";
    titleBox.textContent   = "";
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
        mode:"save", main:currentMain, category:currentMain,
        sub:currentSub, title:currentTitle,
        summary200:currentSummary200, fullText:currentIdeaText
      })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    cachedRows = [];
    alert("PRページに投稿しました。ご意見ありがとうございました！");
    resetForm();
    showPage("pullrequest");
  } catch(e) {
    alert("投稿に失敗しました（" + e.message + "）。");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function continueEditing() { resetForm(); }

function resetForm() {
  const ta = document.getElementById("userInput");
  const ar = document.getElementById("aiResult");
  if (ta) ta.value = "";
  if (ar) ar.innerHTML = '<p style="color:#94a3b8;">結果はここに表示されます。</p>';
  ["summarizeBtnBox","summaryArea","postDecision","deepDiveArea"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  currentIdeaText = currentAIResult = currentSummary200 = currentTitle = currentMain = currentSub = "";
  if (ta) ta.focus();
}

// ======================= ルールページ タブ切り替え =======================
function switchTab(group, panel) {
  document.getElementById(group + "-easy").classList.toggle("active", panel === "easy");
  document.getElementById(group + "-expert").classList.toggle("active", panel === "expert");
  const panels = document.getElementById(group + "-easy").parentElement;
  const bar = panels.querySelector(".rules-tab-bar");
  if (bar) bar.querySelectorAll(".rules-tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", (i === 0 && panel === "easy") || (i === 1 && panel === "expert"));
  });
}

// ======================= 初期化 =======================
window.onload = function() {
  initCategoryButtons();
  showPage("intro");
};
