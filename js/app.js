// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbzo6_4RHTO4IqhiAwghkBR6746Qidz4-wll7Efoe1FTXfoycQa9Y_mAhsaAdYfIsuF5Og/exec";

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
  const summaryArea = document.getElementById("summaryArea");
  const buttonArea = document.getElementById("buttonArea");

  if (!textarea) return;

  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }

  currentIdeaText = text;
  aiResult.innerHTML = "<p>AIが分析しています…</p>";
  summaryArea.style.display = "none";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode: "analyze", text: text, category: currentCategory })
    });

    const data = await res.json();
    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentAIResult = content.analysis || "";
    currentSub = content.sub || "その他";
    currentItem = content.item || "その他";

    // 右側に分析結果 + 分類を表示
    aiResult.innerHTML = `
      <strong>【AI分析結果】</strong><br>
      ${currentAIResult}<br><br>
      <strong>分類結果</strong><br>
      大分類：${currentCategory}<br>
      中分類：${currentSub}<br>
      小分類：${currentItem}
    `;

    // 200字要約ボタンを表示
    buttonArea.innerHTML = `
      <button class="big-button success" onclick="confirmSummary()">📝 200字要約を作成する</button>
    `;

  } catch (e) {
    console.error(e);
    aiResult.innerHTML = "<p>エラーが発生しました。</p>";
  }
}

// ======================= 200字要約 =======================
async function confirmSummary() {
  const summaryArea = document.getElementById("summaryArea");
  const summaryBox = document.getElementById("summaryBox");
  const titleBox = document.getElementById("titleBox");
  const categoryResult = document.getElementById("categoryResult");
  const buttonArea = document.getElementById("buttonArea");

  summaryArea.style.display = "block";

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

    const data = await res.json();
    const content = typeof data.content === "string" ? JSON.parse(data.content) : data.content;

    currentSummary200 = content.summary200 || "";
    currentTitle = content.title || "";

    summaryBox.textContent = currentSummary200;
    titleBox.textContent = currentTitle;

    // 分類結果も再表示
    if (categoryResult) {
      categoryResult.innerHTML = `
        大分類：${currentCategory}<br>
        中分類：${currentSub}<br>
        小分類：${currentItem}
      `;
    }

    buttonArea.innerHTML = `
      <button class="big-button accent" onclick="sendToPR()">🚀 この内容でPRに登録する</button>
      <button class="big-button" onclick="resetToInput()" style="background:#6b7280;">✍️ 再度意見を追加する</button>
    `;

  } catch (e) {
    console.error(e);
    alert("要約生成でエラーが発生しました。");
  }
}
// ======================= リセット（再度意見追加） =======================
function resetToInput() {
  document.getElementById("userInput").value = currentIdeaText; // 前の入力内容を残す
  document.getElementById("aiResult").innerHTML = "";
  document.getElementById("summaryArea").style.display = "none";
  
  document.getElementById("buttonArea").innerHTML = `
    <button class="big-button primary" onclick="runAI()">🤖 AI壁打ちを実行する</button>
  `;
}

// ======================= PR投稿 =======================
async function sendToPR() {
  if (!currentSummary200 || !currentTitle) {
    alert("要約まで完了させてください。");
    return;
  }

  const ok = confirm("この内容でPRに投稿しますか？");
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
        item: currentItem || "",
        sub: currentSub || ""
      })
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("✅ PRに投稿しました！");
      resetToInput(); // 入力画面に戻る
      showPage("pullrequest"); // PRページへ移動
    }
  } catch (e) {
    console.error(e);
    alert("投稿に失敗しました。");
  }
}

// ======================= PR一覧読み込み（改善版） =======================
async function loadPRList() {
  const container = document.getElementById("prList");
  if (!container) return;

  container.innerHTML = "<p>読み込み中...</p>";

  try {
    const res = await fetch(`${GAS_URL}?mode=list`, {
      method: "GET",
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });

    if (!res.ok) throw new Error("HTTP error " + res.status);

    const data = await res.json();

    // データが配列でない場合の対策
    if (!Array.isArray(data)) {
      container.innerHTML = "<p>まだ投稿がありません。</p>";
      return;
    }

    let html = `<div class="pr-list">`;

    data.forEach((item, index) => {
      const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleDateString('ja-JP') : '';
      
      html += `
        <div class="pr-item" onclick="showPRDetail(${index})" style="cursor:pointer;">
          <div class="pr-category">${item.category || '未分類'}</div>
          <h3>${item.title || '無題'}</h3>
          <p class="pr-summary">${item.summary200 || ''}</p>
          <small>${timestamp}</small>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html || "<p>まだ投稿がありません。</p>";

  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>一覧の読み込みに失敗しました。</p>";
  }
}

// アコーディオン開閉用関数
function toggleAccordion(el) {
  const body = el.nextElementSibling;
  body.style.display = body.style.display === "block" ? "none" : "block";
}

function toggleSummary(el) {
  const summary = el.nextElementSibling;
  summary.style.display = summary.style.display === "block" ? "none" : "block";
}
// ======================= 初期化 =======================
window.onload = function() {
  initLogicTree();
  initCategoryButtons();

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("intro").classList.add("active");
};

// ======================= PR詳細表示 =======================
let prDataCache = [];

function showPRDetail(index) {
  const item = prDataCache[index];
  if (!item) return;

  const detailHTML = `
    <div style="padding:20px; background:white;">
      <button onclick="loadPRList(); showPage('pullrequest')" style="margin-bottom:15px;">← 一覧に戻る</button>
      <h2>${item.title || '無題'}</h2>
      <p><strong>カテゴリ:</strong> ${item.category || ''}</p>
      <p><strong>要約:</strong><br>${item.summary200 || ''}</p>
      <p><strong>投稿日:</strong> ${item.timestamp ? new Date(item.timestamp).toLocaleString('ja-JP') : ''}</p>
    </div>
  `;

  const container = document.getElementById("prList");
  if (container) container.innerHTML = detailHTML;
}
