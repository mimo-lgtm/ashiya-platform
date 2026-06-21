// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxns9sRxzzbRb--nic5hVXw1lMisrzXJ40ETgVjbrh541R4TQkFvI7Cj_n5eJqw4O6irw/exec
";

// 状態管理
let currentCategory = "① 芦屋市の価値向上";
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
}

// ======================= ロジックツリー =======================
// （ここは変更せず、そのまま残すか前の完全版からコピー）

const logicTreeData = {
  "① 芦屋市の価値向上（ブランド・移住促進）": {
    "次世代教育ブランドの確立": ["世界一の絵本図書館", "EdTech企業連携"],
    "街の魅力化・景観美化": ["街の魅力化・景観美化"],
    "公園芝生化": ["公園芝生化"],
    "市民協働": ["市民協働"]
  },
  // 他のカテゴリも省略せず全部入れてください（前のメッセージからコピー）
  // ...（省略せずに全カテゴリを入れてください）
};

// initLogicTree, openLogicAccordion, showDetailFromTree, initCategoryButtons は前の完全版と同じものを入れてください

// ======================= AI壁打ち =======================
async function runAI() {
  const textarea = document.getElementById("ideaInput");
  const aiBox = document.getElementById("aiBox");
  const decisionBox = document.getElementById("decisionBox");
  const summaryBlock = document.getElementById("summaryBlock");

  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }

  currentIdeaText = text;
  aiBox.textContent = "AIが整理しています…";
  decisionBox.style.display = "none";
  summaryBlock.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode: "analyze", text: text, category: currentCategory })
    });

    if (!res.ok) throw new Error("HTTP error " + res.status);

    const data = await res.json();
    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentAIResult = content.analysis || "";
    currentCategory = content.category || "";
    currentMain = content.main || "";
    currentSub = content.sub || "";
    currentItem = content.item || "";

    aiBox.textContent = currentAIResult;
    decisionBox.style.display = "block";

  } catch (e) {
    console.error(e);
    aiBox.textContent = "AIとの通信でエラーが発生しました。";
  }
}

// ======================= 200字要約 =======================
async function confirmSummary() {
  const summaryBox = document.getElementById("summaryBox");
  const titleBox = document.getElementById("titleBox");
  const summaryBlock = document.getElementById("summaryBlock");
  const decisionBox = document.getElementById("decisionBox");

  summaryBox.textContent = "200字要約を生成しています…";
  titleBox.textContent = "タイトルを生成しています…";

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
    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentSummary200 = content.summary200 || "";
    currentTitle = content.title || "";

    summaryBox.textContent = currentSummary200;
    titleBox.textContent = currentTitle;

    summaryBlock.style.display = "block";
    decisionBox.style.display = "none";

  } catch (e) {
    console.error(e);
    summaryBox.textContent = "要約生成でエラーが発生しました。";
  }
}

// ======================= PR投稿・loadPRList などは省略せず残す =======================

// 初期化
window.onload = function() {
  initLogicTree();
  initCategoryButtons();
  showPage("home");
};
