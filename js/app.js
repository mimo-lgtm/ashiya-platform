// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxHLO8tNslKuVIfO_TXvTGBykcmZZll0tWSUULEIVuDHhaMx3GtgXnCEf6Ba3xzn8nRSg/exec";

// ======================= 状態管理 =======================
let currentCategory = "① 芦屋市の価値向上（ブランド・移住促進）";
let currentIdeaText = "";
let currentAIResult = "";
let currentSummary200 = "";
let currentTitle = "";
let currentSub = "";
let currentItem = "";

// ======================= ページ切り替え =======================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  if (pageId === "pullrequest") {
    loadPRList();
  }
}

// ======================= ロジックツリーデータ =======================
const logicTreeData = {
  "① 芦屋市の価値向上（ブランド・移住促進）": {
    "次世代教育ブランドの確立": ["世界一の絵本図書館", "EdTech企業連携"],
    "街の魅力化・景観美化": ["街の魅力化・景観美化"],
    "公園芝生化": ["公園芝生化"],
    "市民協働": ["市民協働"]
  },
  "② 市民へのベネフィット（ウェルビーイング）": {
    "多世代交流・サードプレイス": ["カフェ", "コミュニティ運営"],
    "知的探究・スキルアップ": ["リスキリング", "共同研究", "コワーキング"]
  },
  "③ 財政的持続可能性": {
    "施設の収益化": ["SHARE LOUNGE", "チャレンジショップ"],
    "寄付・ふるさと納税": ["寄付・ふるさと納税"],
    "クラファン連動": ["クラファン連動"],
    "成果連動型事業": ["成果連動型事業"]
  },
  "④ 施設の戦略性": {
    "知のゲートウェイ化": ["デジタルライブラリ", "ITサポート"],
    "イノベーション・起業支援": ["ピッチアリーナ", "サンドボックス"]
  },
  "⑤ 都市の強靭性とガバナンス": {
    "デュアルユース": ["デュアルユース"],
    "災害シミュレーション": ["災害シミュレーション"],
    "都市指令室": ["都市指令室"],
    "DAO型住民自治": ["DAO型住民自治"],
    "投票": ["投票"],
    "トークン設計": ["トークン設計"]
  }
};

// ======================= ロジックツリー生成 =======================
function initLogicTree() {
  const mainArea = document.getElementById("logicMainNodes");
  const detailArea = document.getElementById("logicDetailArea");
  if (!mainArea || !detailArea) return;

  mainArea.innerHTML = "";
  detailArea.innerHTML = "";

  Object.keys(logicTreeData).forEach(mainKey => {
    const node = document.createElement("div");
    node.className = "logic-main-node";

    const title = document.createElement("div");
    title.className = "logic-main-node-title";
    title.textContent = mainKey;

    const btn = document.createElement("button");
    btn.textContent = "この分野の詳細を見る";
    btn.addEventListener("click", () => {
      openLogicAccordion(mainKey);
      showPage("tree");
    });

    node.appendChild(title);
    node.appendChild(btn);
    mainArea.appendChild(node);
  });
}

function openLogicAccordion(mainKey) {
  const detailArea = document.getElementById("logicDetailArea");
  detailArea.innerHTML = "";

  const subData = logicTreeData[mainKey];

  Object.keys(subData).forEach(subKey => {
    const block = document.createElement("div");
    block.className = "logic-accordion-block";

    const header = document.createElement("div");
    header.className = "logic-accordion-header";
    header.innerHTML = `<h3>${subKey}</h3><span>▼</span>`;
    header.addEventListener("click", () => {
      body.style.display = body.style.display === "block" ? "none" : "block";
    });

    const body = document.createElement("div");
    body.className = "logic-accordion-body";

    const ul = document.createElement("ul");
    ul.className = "logic-subcategory-items";

    subData[subKey].forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.addEventListener("click", () => {
        showDetailFromTree(mainKey, subKey, item);
      });
      ul.appendChild(li);
    });

    body.appendChild(ul);
    block.appendChild(header);
    block.appendChild(body);
    detailArea.appendChild(block);
  });
}

async function showDetailFromTree(mainKey, subKey, item) {
  const box = document.getElementById("detailBox");
  box.innerHTML = `
    <h2>${item}</h2>
    <p>この小分類に統合された意見がここに表示されます。（今後実装）</p>
  `;
  showPage("detail");
}

// ======================= カテゴリーボタン =======================
function initCategoryButtons() {
  const buttons = document.querySelectorAll(".category-bar .cat-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-cat");
    });
  });
}

// ======================= AI壁打ち =======================
async function runAI() {
  const textarea = document.getElementById("userInput");
  const aiResult = document.getElementById("aiResult");

  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }

  currentIdeaText = text;
  aiResult.textContent = "AIが整理しています…";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mode: "analyze",
        text: text,
        category: currentCategory
      })
    });

    const data = await res.json();
    const content = JSON.parse(data.content);

    currentAIResult = content.analysis;
    currentSub = content.sub;
    currentItem = content.item;

    aiResult.textContent = currentAIResult;

  } catch (e) {
    aiResult.textContent = "エラーが発生しました:\n" + e.message;
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
        category: currentCategory,
        sub: currentSub,
        item: currentItem
      })
    });

    const data = await res.json();
    const content = JSON.parse(data.content);

    currentSummary200 = content.summary200;
    currentTitle = content.title;

    summaryBox.textContent = currentSummary200;
    titleBox.textContent = currentTitle;

    summaryBlock.style.display = "block";
    decisionBox.style.display = "none";

  } catch (e) {
    summaryBox.textContent = "要約生成でエラーが発生しました。";
  }
}

// ======================= PR投稿 =======================
async function sendToPR() {
  if (!currentSummary200 || !currentTitle || !currentIdeaText) {
    alert("AI壁打ちと要約・タイトル生成を完了してください。");
    return;
  }

  const ok = confirm("この内容でPULL REQUESTに投稿します。よろしいですか？");
  if (!ok) return;

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        mode: "save",
        category: currentCategory,
        title: currentTitle,
        summary200: currentSummary200,
        fullText: currentIdeaText,
        item: currentItem,
        sub: currentSub
      })
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("PULL REQUESTに投稿しました。");

      document.getElementById("userInput").value = "";
      document.getElementById("aiResult").textContent = "結果はここに表示されます。（最大500文字）";
      document.getElementById("summaryBlock").style.display = "none";
      document.getElementById("summaryBox").textContent = "";
      document.getElementById("titleBox").textContent = "";

      loadPRList();
      showPage("pullrequest");
    }

  } catch (e) {
    alert("GASとの通信でエラーが発生しました。");
  }
}

// ======================= PR一覧読み込み =======================
async function loadPRList() {
  const container = document.getElementById("prList");
  container.innerHTML = "<p>読み込み中...</p>";

  try {
    const res = await fetch(`${GAS_URL}?mode=list`, {
      method: "GET",
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });

    const data = await res.json();

    let html = "";
    data.forEach(item => {
      html += `
        <div class="pr-item">
          <div class="pr-category">${item.category || ''}</div>
          <h3>${item.title || ''}</h3>
          <p>${item.summary200 || ''}</p>
          <small>${item.timestamp || ''}</small>
        </div>
      `;
    });

    container.innerHTML = html || "<p>まだ投稿がありません。</p>";

  } catch (e) {
    container.innerHTML = "<p>一覧の読み込みに失敗しました。</p>";
  }
}

// ======================= 初期化 =======================
window.onload = function() {
  initLogicTree();
  initCategoryButtons();

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("intro").classList.add("active");
};
