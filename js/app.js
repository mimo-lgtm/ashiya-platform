// app.js（完全版）
// ※フロントエンド側はこのままで動きます。
// ※GAS 側はこのファイルが送るパラメータ仕様に合わせて実装してください。

// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxc5JyQQ0d-f8kAGbpIhy6jXEsxdz68V4ZGvDRMaB-5ny1EINxeIGO049_frsugUgmS_Q/exec";

// 状態管理
let currentCategory = "① 芦屋市の価値向上";
let currentIdeaText = "";
let currentAIResult = "";
let currentSummary200 = "";
let currentTitle = "";

// ======================= ページ切り替え =======================
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  // PRページ表示時に一覧を更新
  if (pageId === "pullrequest") {
    loadPRList();
  }
}

// ======================= ロジックツリーデータ =======================
// あなたが確定した大分類・中分類・小分類
const logicTreeData = {
  "① 芦屋市の価値向上（ブランド・移住促進）": {
    "次世代教育ブランドの確立": [
      "世界一の絵本図書館",
      "EdTech企業連携"
    ],
    "街の魅力化・景観美化": [
      "街の魅力化・景観美化"
    ],
    "公園芝生化": [
      "公園芝生化"
    ],
    "市民協働": [
      "市民協働"
    ]
  },
  "② 市民へのベネフィット（ウェルビーイング）": {
    "多世代交流・サードプレイス": [
      "カフェ",
      "コミュニティ運営"
    ],
    "知的探究・スキルアップ": [
      "リスキリング",
      "共同研究",
      "コワーキング"
    ]
  },
  "③ 財政的持続可能性": {
    "施設の収益化": [
      "SHARE LOUNGE",
      "チャレンジショップ"
    ],
    "寄付・ふるさと納税": [
      "寄付・ふるさと納税"
    ],
    "クラファン連動": [
      "クラファン連動"
    ],
    "成果連動型事業": [
      "成果連動型事業"
    ]
  },
  "④ 施設の戦略性": {
    "知のゲートウェイ化": [
      "デジタルライブラリ",
      "ITサポート"
    ],
    "イノベーション・起業支援": [
      "ピッチアリーナ",
      "サンドボックス"
    ]
  },
  "⑤ 都市の強靭性とガバナンス": {
    "デュアルユース": [
      "デュアルユース"
    ],
    "災害シミュレーション": [
      "災害シミュレーション"
    ],
    "都市指令室": [
      "都市指令室"
    ],
    "DAO型住民自治": [
      "DAO型住民自治"
    ],
    "投票": [
      "投票"
    ],
    "トークン設計": [
      "トークン設計"
    ]
  }
};

// ======================= ロジックツリー生成 =======================
function initLogicTree() {
  const mainArea = document.getElementById("logicMainNodes");
  const detailArea = document.getElementById("logicDetailArea");
  if (!mainArea || !detailArea) return;

  mainArea.innerHTML = "";
  detailArea.innerHTML = "";

  // 大分類ノード
  Object.keys(logicTreeData).forEach((mainKey, index) => {
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

  // アコーディオン（中分類・小分類）
  Object.keys(logicTreeData).forEach(mainKey => {
    const block = document.createElement("div");
    block.className = "logic-accordion-block";

    const header = document.createElement("div");
    header.className = "logic-accordion-header";

    const h3 = document.createElement("h3");
    h3.textContent = mainKey;

    const span = document.createElement("span");
    span.textContent = "クリックして展開";

    header.appendChild(h3);
    header.appendChild(span);

    const body = document.createElement("div");
    body.className = "logic-accordion-body";

    const subData = logicTreeData[mainKey];
    Object.keys(subData).forEach(subKey => {
      const subDiv = document.createElement("div");
      subDiv.className = "logic-subcategory";

      const subTitle = document.createElement("div");
      subTitle.className = "logic-subcategory-title";
      subTitle.textContent = subKey;

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

      subDiv.appendChild(subTitle);
      subDiv.appendChild(ul);
      body.appendChild(subDiv);
    });

    header.addEventListener("click", () => {
      const isOpen = body.style.display === "block";
      body.style.display = isOpen ? "none" : "block";
      span.textContent = isOpen ? "クリックして展開" : "クリックして閉じる";
    });

    block.appendChild(header);
    block.appendChild(body);
    detailArea.appendChild(block);
  });
}

function openLogicAccordion(mainKey) {
  const headers = document.querySelectorAll(".logic-accordion-header");
  headers.forEach(header => {
    const h3 = header.querySelector("h3");
    const body = header.nextElementSibling;
    const span = header.querySelector("span");
    if (!h3 || !body || !span) return;

    if (h3.textContent === mainKey) {
      body.style.display = "block";
      span.textContent = "クリックして閉じる";
    } else {
      body.style.display = "none";
      span.textContent = "クリックして展開";
    }
  });
}

// detail ページ表示（ツリーから）
function showDetailFromTree(mainKey, subKey, item) {
  const box = document.getElementById("detailBox");
  if (!box) return;

  box.innerHTML = `
    <div class="placeholder-card">
      <h2>${item}</h2>
      <p>大分類：${mainKey}</p>
      <p>中分類：${subKey}</p>
      <p>この小分類に紐づく市民提案や統合結果を、今後ここに表示していきます。</p>
    </div>
  `;
  showPage("detail");
}

// ======================= カテゴリーボタン連動 =======================
function initCategoryButtons() {
  const buttons = document.querySelectorAll(".category-bar .cat-btn");
  const select = document.getElementById("categorySelect");
  if (!select) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.getAttribute("data-cat");
      currentCategory = cat || currentCategory;
      select.value = currentCategory;
    });
  });

  select.addEventListener("change", () => {
    currentCategory = select.value;
    buttons.forEach(b => {
      if (b.getAttribute("data-cat") === currentCategory) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  });
}

// ======================= AI壁打ち =======================
async function runAI() {
  const textarea = document.getElementById("ideaInput");
  const aiBox = document.getElementById("aiBox");
  const decisionBox = document.getElementById("decisionBox");
  const summaryBlock = document.getElementById("summaryBlock");

  if (!textarea || !aiBox || !decisionBox || !summaryBlock) return;

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "analyze",
        text: text,
        category: currentCategory
      })
    });
    const data = await res.json();

    // 期待するレスポンス例：
    // { analysis: "整理結果...", suggestedCategory: "② 市民ベネフィット" }
    currentAIResult = data.analysis || "AIからの整理結果を取得できませんでした。";
    aiBox.textContent = currentAIResult;

    if (data.suggestedCategory) {
      currentCategory = data.suggestedCategory;
      const select = document.getElementById("categorySelect");
      if (select) select.value = currentCategory;
      const buttons = document.querySelectorAll(".category-bar .cat-btn");
      buttons.forEach(b => {
        if (b.getAttribute("data-cat") === currentCategory) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
    }

    decisionBox.style.display = "block";
  } catch (e) {
    console.error(e);
    aiBox.textContent = "AIとの通信でエラーが発生しました。";
  }
}

// ======================= 200字要約・タイトル生成 =======================
async function confirmSummary() {
  const summaryBox = document.getElementById("summaryBox");
  const titleBox = document.getElementById("titleBox");
  const summaryBlock = document.getElementById("summaryBlock");
  const decisionBox = document.getElementById("decisionBox");

  if (!summaryBox || !titleBox || !summaryBlock || !decisionBox) return;

  summaryBox.textContent = "200字要約を生成しています…";
  titleBox.textContent = "タイトルを生成しています…";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "summarize",
        text: currentIdeaText,
        analysis: currentAIResult,
        category: currentCategory
      })
    });
    const data = await res.json();

    // 期待するレスポンス例：
    // { summary200: "200字要約...", title: "タイトル案" }
    currentSummary200 = data.summary200 || "";
    currentTitle = data.title || "";

    summaryBox.textContent = currentSummary200 || "要約を取得できませんでした。";
    titleBox.textContent = currentTitle || "タイトルを取得できませんでした。";

    summaryBlock.style.display = "block";
    decisionBox.style.display = "none";
  } catch (e) {
    console.error(e);
    summaryBox.textContent = "要約生成でエラーが発生しました。";
    titleBox.textContent = "";
  }
}

function backToAI() {
  const decisionBox = document.getElementById("decisionBox");
  const summaryBlock = document.getElementById("summaryBlock");
  if (decisionBox) decisionBox.style.display = "none";
  if (summaryBlock) summaryBlock.style.display = "none";
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "save",
        category: currentCategory,
        summary200: currentSummary200,
        title: currentTitle,
        fullText: currentIdeaText
      })
    });
    const data = await res.json();

    // 期待するレスポンス例：
    // { status: "ok" }
    if (data.status === "ok") {
      alert("PULL REQUESTに投稿しました。PRページで確認できます。");
      // 入力リセット
      const textarea = document.getElementById("ideaInput");
      const aiBox = document.getElementById("aiBox");
      const decisionBox = document.getElementById("decisionBox");
      const summaryBlock = document.getElementById("summaryBlock");
      const summaryBox = document.getElementById("summaryBox");
      const titleBox = document.getElementById("titleBox");

      if (textarea) textarea.value = "";
      if (aiBox) aiBox.textContent = "結果はここに表示されます。（最大500文字）";
      if (decisionBox) decisionBox.style.display = "none";
      if (summaryBlock) summaryBlock.style.display = "none";
      if (summaryBox) summaryBox.textContent = "";
      if (titleBox) titleBox.textContent = "";

      // PRページを更新
      loadPRList();
      showPage("pullrequest");
    } else {
      alert("保存に失敗しました。GAS側のログを確認してください。");
    }
  } catch (e) {
    console.error(e);
    alert("GASとの通信でエラーが発生しました。");
  }
}

// ======================= PR一覧読み込み =======================
async function loadPRList() {
  const listBox = document.getElementById("prList");
  const detailBox = document.getElementById("prDetail");
  const detailTitle = document.getElementById("prDetailTitle");
  const detailSummary = document.getElementById("prDetailSummary");

  if (!listBox || !detailBox || !detailTitle || !detailSummary) return;

  listBox.innerHTML = "読み込み中です…";
  detailBox.style.display = "none";

  try {
    const res = await fetch(`${GAS_URL}?mode=list`);
    const data = await res.json();

    // 期待するレスポンス例：
    // [
    //   { timestamp: "...", category: "① 芦屋市の価値向上", summary200: "...", title: "...", fullText: "..." },
    //   ...
    // ]
    if (!Array.isArray(data) || data.length === 0) {
      listBox.innerHTML = "まだPULL REQUESTはありません。";
      return;
    }

    // カテゴリー別にグルーピング
    const grouped = {};
    data.forEach(row => {
      const cat = row.category || "未分類";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(row);
    });

    const container = document.createElement("div");
    container.id = "prListContainer";

    Object.keys(grouped).forEach(cat => {
      const catTitle = document.createElement("h3");
      catTitle.textContent = cat;
      container.appendChild(catTitle);

      grouped[cat].forEach((row, index) => {
        const div = document.createElement("div");
        div.className = "pr-row";
        div.addEventListener("click", () => {
          detailTitle.textContent = row.title || "(タイトルなし)";
          detailSummary.textContent = row.summary200 || "";
          detailBox.style.display = "block";
        });

        const left = document.createElement("div");
        left.innerHTML = `<strong>${row.title || "(タイトルなし)"}</strong><br>${row.summary200 || ""}`;

        const right = document.createElement("div");
        right.style.fontSize = "12px";
        right.style.color = "#6b7280";
        right.textContent = row.timestamp || "";

        div.appendChild(left);
        div.appendChild(right);
        container.appendChild(div);
      });
    });

    listBox.innerHTML = "";
    listBox.appendChild(container);
  } catch (e) {
    console.error(e);
    listBox.innerHTML = "PR一覧の取得でエラーが発生しました。";
  }
}

// ======================= 初期化 =======================
document.addEventListener("DOMContentLoaded", () => {
  initLogicTree();
  initCategoryButtons();
  showPage("intro");
});
