// ======================= 設定 =======================
// ★修正点: URLの途中で改行が入っていたため構文エラーになっていました（1行に修正）
const GAS_URL = "https://script.google.com/macros/s/AKfycbxG6l3mlYY5txIL9OhsRBsIwrbYKG1AEBmnEiwTT4loQyBn8QrHAdOvdNLc1U-bwQ79/exec";

// ======================= 分類タクソノミー（固定） =======================
// 大分類は固定。中分類・小分類は一致しないものを「その他」に振り分けます。
const MAIN_CATEGORIES = [
  {
    key: "①",
    label: "芦屋市の価値向上（ブランド・移住促進）",
    keyword: "価値向上",
    subs: [
      { label: "次世代教育ブランドの確立", keyword: "教育ブランド", items: ["世界一の絵本図書館", "EdTech企業連携"] },
      { label: "街の魅力化・景観美化", keyword: "魅力化", items: ["公園芝生化"] },
      { label: "市民協働", keyword: "市民協働", items: [] }
    ]
  },
  {
    key: "②",
    label: "市民へのベネフィット（ウェルビーイング）",
    keyword: "ベネフィット",
    subs: [
      { label: "多世代交流・サードプレイス", keyword: "サードプレイス", items: ["カフェ", "コミュニティ運営"] },
      { label: "知的探究・スキルアップ", keyword: "スキルアップ", items: ["リスキリング", "共同研究", "コワーキング"] }
    ]
  },
  {
    key: "③",
    label: "財政的持続可能性",
    keyword: "財政的",
    subs: [
      { label: "施設の収益化", keyword: "収益化", items: ["SHARE LOUNGE", "チャレンジショップ"] },
      { label: "寄付・ふるさと納税", keyword: "ふるさと納税", items: ["クラファン連動", "成果連動型事業"] }
    ]
  },
  {
    key: "④",
    label: "施設の戦略性",
    keyword: "戦略性",
    subs: [
      { label: "知のゲートウェイ化", keyword: "ゲートウェイ", items: ["デジタルライブラリ", "ITサポート"] },
      { label: "イノベーション・起業支援", keyword: "起業支援", items: ["ピッチアリーナ", "サンドボックス"] }
    ]
  },
  {
    key: "⑤",
    label: "都市の強靭性とガバナンス",
    keyword: "強靭性",
    subs: [
      { label: "デュアルユース", keyword: "デュアルユース", items: ["災害シミュレーション", "都市指令室"] },
      { label: "DAO型住民自治投票", keyword: "DAO", items: ["トークン設計"] }
    ]
  }
];

const OTHER_LABEL = "その他";
const MERGE_THRESHOLD = 10; // 将来の自動統合機能用のしきい値

function findMainCategory(text) {
  if (text) {
    for (const m of MAIN_CATEGORIES) {
      if (text.includes(m.keyword) || text.includes(m.key)) return m;
    }
  }
  return MAIN_CATEGORIES[0]; // フォールバック（AIは必ず5択から選ぶ前提）
}

function findSubCategory(mainEntry, text) {
  if (text) {
    for (const s of mainEntry.subs) {
      if (text.includes(s.keyword)) return s.label;
    }
  }
  return OTHER_LABEL;
}

// ======================= 状態管理 =======================
let currentCategory = "① 芦屋市の価値向上（ブランド・移住促進）";
let currentIdeaText = "";
let currentAIResult = "";
let currentSummary200 = "";
let currentTitle = "";
let currentMain = "";
let currentSub = "";
let currentItem = "";

// ======================= ページ切り替え =======================
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  if (pageId === "pullrequest") {
    loadPRList();
  }
  if (pageId === "tree") {
    initLogicTree();
  }
}

// ======================= カテゴリーバー（壁打ち入力側の大分類選択） =======================
function initCategoryButtons() {
  const bar = document.getElementById("categoryBar");
  if (!bar) return;
  bar.innerHTML = "";

  MAIN_CATEGORIES.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (currentCategory.includes(m.keyword) ? " active" : "");
    btn.textContent = m.key + " " + m.label;
    btn.onclick = () => {
      currentCategory = m.key + " " + m.label;
      bar.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    bar.appendChild(btn);
  });
}

// ======================= ロジックツリー描画 =======================
function initLogicTree() {
  const mainArea = document.getElementById("logicMainNodes");
  const detailArea = document.getElementById("logicDetailArea");
  if (!mainArea) return;

  mainArea.innerHTML = "";
  MAIN_CATEGORIES.forEach((m, idx) => {
    const node = document.createElement("div");
    node.className = "logic-main-node";
    node.innerHTML =
      '<div class="logic-main-node-title">' + m.key + " " + m.label + "</div>" +
      '<button type="button">詳しく見る</button>';
    node.querySelector("button").onclick = () => showDetailFromTree(idx);
    mainArea.appendChild(node);
  });

  if (detailArea && !detailArea.dataset.initialized) {
    detailArea.dataset.initialized = "true";
  }
}

function showDetailFromTree(mainIndex) {
  const detailArea = document.getElementById("logicDetailArea");
  if (!detailArea) return;
  const m = MAIN_CATEGORIES[mainIndex];

  detailArea.innerHTML = "";
  m.subs.forEach((s, sIdx) => {
    const block = document.createElement("div");
    block.className = "logic-accordion-block";

    const header = document.createElement("div");
    header.className = "logic-accordion-header";
    header.innerHTML = "<h3>" + s.label + "</h3><span>▼</span>";

    const body = document.createElement("div");
    body.className = "logic-accordion-body";
    const ul = document.createElement("ul");
    ul.className = "logic-subcategory-items";
    (s.items.length ? s.items : [OTHER_LABEL]).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    body.appendChild(ul);

    header.onclick = () => openLogicAccordion(body, header);

    block.appendChild(header);
    block.appendChild(body);
    detailArea.appendChild(block);
  });
}

function openLogicAccordion(body, header) {
  const isOpen = body.style.display === "block";
  body.style.display = isOpen ? "none" : "block";
  header.querySelector("span").textContent = isOpen ? "▼" : "▲";
}

// ======================= AI壁打ち =======================
async function runAI() {
  const textarea = document.getElementById("userInput");
  const aiResult = document.getElementById("aiResult");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const summaryArea = document.getElementById("summaryArea");

  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }

  currentIdeaText = text;
  aiResult.textContent = "AIが整理しています…";
  if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
  if (summaryArea) summaryArea.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode: "analyze", text: text, category: currentCategory })
    });

    if (!res.ok) throw new Error("HTTP error " + res.status);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentAIResult = content.analysis || "";
    currentCategory = content.category || content.main || currentCategory;
    currentMain = content.main || currentCategory;
    currentSub = content.sub || "";
    currentItem = content.item || "";

    aiResult.textContent = currentAIResult;
    if (summarizeBtnBox) summarizeBtnBox.style.display = "block";

  } catch (e) {
    console.error(e);
    aiResult.textContent = "AIとの通信でエラーが発生しました（" + e.message + "）。時間をおいて再度お試しください。";
  }
}

// ======================= 200字要約 =======================
async function confirmSummary() {
  const summaryBox = document.getElementById("summaryBox");
  const titleBox = document.getElementById("titleBox");
  const categoryResult = document.getElementById("categoryResult");
  const summaryArea = document.getElementById("summaryArea");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const postDecision = document.getElementById("postDecision");

  summaryArea.style.display = "block";
  summaryBox.textContent = "200字要約を生成しています…";
  titleBox.textContent = "タイトルを生成しています…";
  if (categoryResult) categoryResult.textContent = "";
  if (postDecision) postDecision.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mode: "summarize",
        text: currentIdeaText,
        analysis: currentAIResult,
        category: currentCategory
      })
    });

    if (!res.ok) throw new Error("HTTP error " + res.status);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentSummary200 = content.summary200 || "";
    currentTitle = content.title || "";

    summaryBox.textContent = currentSummary200;
    titleBox.textContent = currentTitle;
    if (categoryResult) {
      categoryResult.innerHTML =
        "大分類：" + (currentMain || currentCategory) + "<br>" +
        "中分類：" + (currentSub || OTHER_LABEL) + "<br>" +
        "小分類：" + (currentItem || OTHER_LABEL);
    }

    if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
    if (postDecision) postDecision.style.display = "block";

  } catch (e) {
    console.error(e);
    summaryBox.textContent = "要約生成でエラーが発生しました（" + e.message + "）。";
    titleBox.textContent = "";
  }
}

// ======================= PR投稿 / 続けて意見する =======================
async function postToPR() {
  const postDecision = document.getElementById("postDecision");
  if (postDecision) postDecision.querySelector(".big-button.success").disabled = true;

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mode: "save",
        category: currentMain || currentCategory,
        main: currentMain || currentCategory,
        sub: currentSub,
        item: currentItem,
        title: currentTitle,
        summary200: currentSummary200,
        fullText: currentIdeaText
      })
    });

    if (!res.ok) throw new Error("HTTP error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    alert("PRページに投稿しました。ご意見ありがとうございました！");
    resetAssistantForm();
    showPage("pullrequest");

  } catch (e) {
    console.error(e);
    alert("投稿に失敗しました（" + e.message + "）。もう一度お試しください。");
  } finally {
    if (postDecision) postDecision.querySelector(".big-button.success").disabled = false;
  }
}

function continueEditing() {
  resetAssistantForm();
}

function resetAssistantForm() {
  const textarea = document.getElementById("userInput");
  const aiResult = document.getElementById("aiResult");
  const summarizeBtnBox = document.getElementById("summarizeBtnBox");
  const summaryArea = document.getElementById("summaryArea");
  const postDecision = document.getElementById("postDecision");

  if (textarea) textarea.value = "";
  if (aiResult) aiResult.textContent = "結果はここに表示されます。";
  if (summarizeBtnBox) summarizeBtnBox.style.display = "none";
  if (summaryArea) summaryArea.style.display = "none";
  if (postDecision) postDecision.style.display = "none";

  currentIdeaText = "";
  currentAIResult = "";
  currentSummary200 = "";
  currentTitle = "";
  currentMain = "";
  currentSub = "";
  currentItem = "";

  if (textarea) textarea.focus();
}

// ======================= PR一覧（大分類→中分類→投稿） =======================
async function loadPRList() {
  const prList = document.getElementById("prList");
  if (!prList) return;
  prList.innerHTML = "読み込み中…";

  try {
    const res = await fetch(GAS_URL + "?mode=list");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const rows = await res.json();
    if (rows.error) throw new Error(rows.error);

    renderPRList(Array.isArray(rows) ? rows : []);
  } catch (e) {
    console.error(e);
    prList.innerHTML = "投稿一覧の取得に失敗しました（" + e.message + "）。";
  }
}

function renderPRList(rows) {
  const prList = document.getElementById("prList");

  if (!rows.length) {
    prList.innerHTML = "まだ投稿がありません。";
    return;
  }

  // 大分類 → 中分類 にグルーピング
  const tree = {};
  MAIN_CATEGORIES.forEach(m => { tree[m.label] = {}; });

  rows.forEach(row => {
    const mainEntry = findMainCategory(row.main || row.category);
    const subLabel = findSubCategory(mainEntry, row.sub || row.item);
    if (!tree[mainEntry.label][subLabel]) tree[mainEntry.label][subLabel] = [];
    tree[mainEntry.label][subLabel].push(row);
  });

  prList.innerHTML = "";

  MAIN_CATEGORIES.forEach(m => {
    const subTree = tree[m.label];
    const totalCount = Object.values(subTree).reduce((sum, arr) => sum + arr.length, 0);
    if (totalCount === 0) return; // 投稿が無い大分類は表示しない

    const mainBlock = document.createElement("div");
    mainBlock.className = "pr-main-category";

    const mainHeader = document.createElement("div");
    mainHeader.className = "pr-main-header";
    mainHeader.innerHTML =
      "<span>" + m.key + " " + m.label + "</span>" +
      '<span class="count-badge">' + totalCount + "</span>";

    const subWrap = document.createElement("div");
    subWrap.style.display = "none";
    mainHeader.onclick = () => {
      subWrap.style.display = subWrap.style.display === "none" ? "block" : "none";
    };

    Object.keys(subTree).forEach(subLabel => {
      const items = subTree[subLabel];
      if (!items.length) return;

      const subHeader = document.createElement("div");
      subHeader.className = "pr-sub-header";
      subHeader.innerHTML =
        "<span>" + subLabel + "</span>" +
        '<span class="count-badge">' + items.length + "</span>";

      const itemWrap = document.createElement("div");
      itemWrap.style.display = "none";
      subHeader.onclick = (ev) => {
        ev.stopPropagation();
        itemWrap.style.display = itemWrap.style.display === "none" ? "block" : "none";
      };

      items.forEach(row => {
        // status: "未統合"（通常）/ "統合済み"（他の投稿に統合された元投稿）/ "統合"（AIが生成した統合エントリ本体）
        const isMergedSource = row.status === "統合済み";
        const isMergedResult = row.status === "統合";
        const isMerged = isMergedSource || isMergedResult;

        const itemBlock = document.createElement("div");
        itemBlock.className = "pr-item";

        const titleEl = document.createElement("div");
        titleEl.className = "pr-title " + (isMerged ? "pr-title-merged" : "pr-title-unmerged");
        const badge = isMergedSource ? "（統合済み）" : isMergedResult ? "（AIによる統合）" : "（未統合）";
        titleEl.textContent = (row.title || "(無題)") + badge;

        const summaryEl = document.createElement("div");
        summaryEl.className = "pr-summary";
        summaryEl.style.display = "none";
        summaryEl.textContent = row.summary200 || "";
        if (isMergedSource && row.mergedInto) {
          const mergedNote = document.createElement("div");
          mergedNote.style.cssText = "margin-top:6px;font-size:0.85em;color:#2563eb;";
          mergedNote.textContent = "→ 統合先：" + row.mergedInto;
          summaryEl.appendChild(mergedNote);
        }

        titleEl.onclick = (ev) => {
          ev.stopPropagation();
          summaryEl.style.display = summaryEl.style.display === "none" ? "block" : "none";
        };

        itemBlock.appendChild(titleEl);
        itemBlock.appendChild(summaryEl);
        itemWrap.appendChild(itemBlock);
      });

      subWrap.appendChild(subHeader);
      subWrap.appendChild(itemWrap);
    });

    mainBlock.appendChild(mainHeader);
    mainBlock.appendChild(subWrap);
    prList.appendChild(mainBlock);
  });

  if (!prList.children.length) {
    prList.innerHTML = "まだ投稿がありません。";
  }
}

// ======================= 初期化 =======================
window.onload = function () {
  initLogicTree();
  initCategoryButtons();
  showPage("intro");
};
