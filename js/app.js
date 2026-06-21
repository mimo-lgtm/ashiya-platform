// ======================= 設定 =======================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxFFYUURkfaCdlNOML3xnFU5kIdUTmJxZ8amJ0a1ExRrYw8cQyvktBnRGjAPWtpyp2ZLA/exec";

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
  console.log("🚀 runAI関数が呼ばれました");

  const textarea = document.getElementById("userInput");
  const aiResult = document.getElementById("aiResult");

  if (!textarea) {
    alert("入力欄が見つかりません");
    return;
  }

  const text = textarea.value.trim();
  if (!text) {
    alert("意見を入力してください。");
    return;
  }

  currentIdeaText = text;
  if (aiResult) aiResult.textContent = "AIが整理しています…";

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

    const responseText = await res.text();
    console.log("📦 AI分析 生レスポンス:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("GASからの返事がJSON形式ではありません");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.content) {
      throw new Error("AIからの応答がありません");
    }

    // 安全に解析
    let content;
    try {
      content = typeof data.content === "string" 
        ? JSON.parse(data.content) 
        : data.content;
    } catch (e) {
      content = { analysis: data.content || "分析結果を取得できませんでした" };
    }

    currentAIResult = content.analysis || content || "分析結果が空です";
    currentCategory = content.category || currentCategory;
    currentMain = content.main || "";
    currentSub = content.sub || "";
    currentItem = content.item || "";

    if (aiResult) {
      aiResult.textContent = currentAIResult;
    }

    console.log("✅ AI分析完了");

  } catch (e) {
    console.error("❌ AI壁打ちエラー:", e);
    if (aiResult) {
      aiResult.textContent = "エラーが発生しました:\n" + e.message;
    }
  }
}
// ======================= 200字要約 =======================
async function confirmSummary() {
  const summaryBox = document.getElementById("summaryBox");
  const titleBox = document.getElementById("titleBox");
  const summaryBlock = document.getElementById("summaryBlock");

  if (summaryBox) summaryBox.textContent = "200字要約を生成しています…";
  if (titleBox) titleBox.textContent = "タイトルを生成しています…";

  try {
    console.log("📡 要約生成リクエスト送信中...");

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

    const responseText = await res.text();
    console.log("📦 要約 生レスポンス:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("GASからの返事がJSONではありません");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.content) {
      throw new Error("contentがありません");
    }

    const content = typeof data.content === "string" 
      ? JSON.parse(data.content) 
      : data.content;

    currentSummary200 = content.summary200 || "要約生成に失敗しました";
    currentTitle = content.title || "タイトル生成に失敗しました";

    if (summaryBox) summaryBox.textContent = currentSummary200;
    if (titleBox) titleBox.textContent = currentTitle;

    if (summaryBlock) summaryBlock.style.display = "block";

    console.log("✅ 要約生成完了");

  } catch (e) {
    console.error("❌ 要約生成エラー:", e);
    if (summaryBox) summaryBox.textContent = "要約生成でエラーが発生しました。\n" + e.message;
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

// ======================= PR一覧（大分類→中分類アコーディオン形式） =======================
async function loadPRList() {
  const container = document.getElementById("prList");
  if (!container) return;

  container.innerHTML = "<p>読み込み中...</p>";

  try {
    const res = await fetch(`${GAS_URL}?mode=list`);
    if (!res.ok) throw new Error("HTTP error");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>まだ投稿がありません。</p>";
      return;
    }

    // 大分類ごとにグループ化
    const grouped = {};
    data.forEach(item => {
      const main = item.category || "その他";
      if (!grouped[main]) grouped[main] = [];
      grouped[main].push(item);
    });

    let html = '<div class="pr-tree">';

    Object.keys(grouped).forEach(mainCat => {
      html += `
        <div class="pr-main-category">
          <div class="pr-main-header" onclick="toggleAccordion(this)">
            <strong>${mainCat}</strong> (${grouped[mainCat].length}件)
          </div>
          <div class="pr-main-body" style="display:none;">`;

      grouped[mainCat].forEach(item => {
        html += `
          <div class="pr-item" style="margin:8px 0; padding:12px; border-left:4px solid #2563eb;">
            <h4>${item.title || '無題'}</h4>
            <p>${item.summary200 || ''}</p>
            <small>投稿日: ${item.timestamp ? new Date(item.timestamp).toLocaleDateString('ja-JP') : ''}</small>
          </div>`;
      });

      html += `</div></div>`;
    });

    html += '</div>';
    container.innerHTML = html;

  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>読み込みに失敗しました。</p>";
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

  const container = document.getElementById("prList");
  if (!container) return;

  const detailHTML = `
    <div style="padding: 20px; background: white; border-radius: 8px;">
      <button onclick="loadPRList(); showPage('pullrequest')" style="padding: 8px 16px; margin-bottom: 20px;">← 一覧に戻る</button>
      
      <div style="color: #2563eb; font-weight: bold; margin-bottom: 10px;">${item.category || ''}</div>
      <h2 style="margin-top: 0;">${item.title || '無題'}</h2>
      
      <p style="line-height: 1.6; font-size: 15px;">${item.summary200 || ''}</p>
      
      <small style="color: #666;">投稿日: ${item.timestamp ? new Date(item.timestamp).toLocaleString('ja-JP') : ''}</small>
    </div>
  `;

  container.innerHTML = detailHTML;
}
