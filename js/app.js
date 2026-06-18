/* =========================================
   設定
========================================= */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let CURRENT_CATEGORY = "① 芦屋市の価値向上";

let LAST_AI_TEXT = "";
let LAST_SUMMARY = "";
let LAST_TITLE = "";

/* =========================================
   カテゴリ構造（ロジックツリー用）
========================================= */
const CATEGORY_TREE = {
  "① 芦屋市の価値向上": {
    "次世代教育ブランドの確立": [
      "世界一の絵本図書館",
      "EdTech企業連携"
    ],
    "街の魅力化・景観美化": [
      "公園芝生化"
    ],
    "市民協働": [
      "市民参加型プロジェクト"
    ]
  },
  "② 市民ベネフィット": {
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
  "③ 財政持続可能性": {
    "施設の収益化": [
      "SHARE LOUNGE",
      "チャレンジショップ"
    ],
    "寄付・ふるさと納税": [
      "クラファン連動",
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
      "災害シミュレーション",
      "都市指令室"
    ],
    "DAO型住民自治": [
      "投票",
      "トークン設計"
    ]
  },
  "その他": {
    "未分類": []
  }
};

/* =========================================
   初期ロード
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupCategoryButtons();
  renderLogicTree();
});

/* カテゴリボタン（AI壁打ち） */
function setupCategoryButtons() {
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      CURRENT_CATEGORY = btn.dataset.cat;
      const sel = document.getElementById("categorySelect");
      if (sel) sel.value = CURRENT_CATEGORY;
    });
  });
}

/* =========================================
   ページ切り替え
========================================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) =>
    p.classList.remove("active")
  );
  const page = document.getElementById(id);
  if (page) page.classList.add("active");

  if (id === "pullrequest") {
    renderPR();
  }
}
window.showPage = showPage;

/* =========================================
   データロード（PR用）
========================================= */
async function loadData() {
  try {
    const res = await fetch(GAS_URL);
    POSTS = await res.json();
    renderPR();
  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}

/* =========================================
   AI壁打ち（analysis → GAS）
========================================= */
async function runAI() {
  const text = document.getElementById("ideaInput")?.value.trim() || "";
  const category = CURRENT_CATEGORY;

  if (!text) {
    alert("あなたの考えを入力してください。");
    return;
  }

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "analysis",
        category,
        content: text,
      }),
    });

    const data = await res.json();

    const result = (data.result || "").slice(0, 500);
    const summary = data.summary || (data.result || "").slice(0, 200);
    const title = data.title || "市民提案";

    LAST_AI_TEXT = result;
    LAST_SUMMARY = summary;
    LAST_TITLE = title;

    document.getElementById("aiBox").innerHTML = `<p>${result}</p>`;
    document.getElementById("decisionBox").style.display = "block";
    document.getElementById("summaryBlock").style.display = "none";
  } catch (e) {
    console.log("AI ERROR", e);
    alert("AI分析でエラーが発生しました。");
  }
}
window.runAI = runAI;

/* =========================================
   要約とタイトルを表示
========================================= */
function confirmSummary() {
  document.getElementById("summaryBox").innerText = LAST_SUMMARY;
  document.getElementById("titleBox").innerText = LAST_TITLE;
  document.getElementById("summaryBlock").style.display = "block";
}
window.confirmSummary = confirmSummary;

/* =========================================
   書き直し
========================================= */
function backToAI() {
  document.getElementById("decisionBox").style.display = "none";
  document.getElementById("summaryBlock").style.display = "none";
}
window.backToAI = backToAI;

/* =========================================
   PULL REQUESTへ投稿（post → GAS）
========================================= */
async function sendToPR() {
  const content = document.getElementById("ideaInput")?.value || "";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "post",
        category: CURRENT_CATEGORY,
        title: LAST_TITLE,
        summary: LAST_SUMMARY,
        content: content,
        merged: false,
      }),
    });

    const json = await res.json();

    if (json.status === "saved") {
      alert("PULL REQUESTに投稿しました。");
      loadData();
      showPage("pullrequest");
    } else {
      alert("投稿時にエラーが発生しました。");
    }
  } catch (e) {
    console.log("POST ERROR", e);
    alert("投稿時にエラーが発生しました。");
  }
}
window.sendToPR = sendToPR;

/* =========================================
   PULL REQUEST 表示
========================================= */
function renderPR() {
  const box = document.getElementById("prList");
  const detail = document.getElementById("prDetail");

  if (!box) return;
  if (detail) detail.style.display = "none";

  const grouped = {};
  POSTS.forEach((p) => {
    const cat = p.category || "その他";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  // 大分類ごとに一覧を表示（シンプル版）
  const cats = Object.keys(CATEGORY_TREE);
  box.innerHTML = cats
    .map((cat) => {
      const list = grouped[cat] || [];
      const count = list.length;
      return `
        <div style="margin-bottom:16px;">
          <h3>${cat} <span style="font-size:12px;color:#64748b;">(${count}件)</span></h3>
          ${
            count
              ? list
                  .map(
                    (p, idx) => `
              <div class="pr-row" data-pr-index="${idx}" data-pr-cat="${cat}">
                <div>
                  <b>${p.title || "無題"}</b><br>
                  <span style="font-size:12px;color:#666;">${p.summary || ""}</span>
                </div>
                <div>${p.merged ? "🟢 統合済" : "🔴 未統合"}</div>
              </div>
            `
                  )
                  .join("")
              : `<p style="font-size:14px;color:#94a3b8;">このカテゴリーにはまだ投稿がありません。</p>`
          }
        </div>
      `;
    })
    .join("");

  box.querySelectorAll(".pr-row").forEach((row) => {
    row.onclick = () => {
      const i = Number(row.dataset.prIndex);
      const c = row.dataset.prCat;
      const list = grouped[c] || [];
      const item = list[i];

      document.getElementById("prDetailTitle").innerText =
        item.title || "無題";
      document.getElementById("prDetailSummary").innerText =
        item.summary || item.content || "";
      detail.style.display = "block";
    };
  });
}
window.renderPR = renderPR;

/* =========================================
   ロジックツリー（大分類＋アコーディオン）
========================================= */
function renderLogicTree() {
  const mainArea = document.getElementById("logicMainNodes");
  const detailArea = document.getElementById("logicDetailArea");
  if (!mainArea || !detailArea) return;

  const mainCats = Object.keys(CATEGORY_TREE);

  // 大分類ノード
  mainArea.innerHTML = mainCats
    .map(
      (cat) => `
    <div class="logic-main-node">
      <div class="logic-main-node-title">${cat}</div>
      <button type="button" onclick="openLogicDetail('${cat}')">
        詳しく見る
      </button>
    </div>
  `
    )
    .join("");

  // 詳細アコーディオン
  detailArea.innerHTML = mainCats
    .map((cat) => {
      const subs = CATEGORY_TREE[cat] || {};
      const subKeys = Object.keys(subs);
      return `
      <div class="logic-accordion-block" data-logic-cat="${cat}">
        <div class="logic-accordion-header" onclick="toggleLogicAccordion('${cat}')">
          <h3>${cat}</h3>
          <span>中分類・小分類を表示</span>
        </div>
        <div class="logic-accordion-body" id="logic-body-${encodeURIComponent(
          cat
        )}">
          ${subKeys
            .map((sub) => {
              const items = subs[sub] || [];
              return `
              <div class="logic-subcategory">
                <div class="logic-subcategory-title">${sub}</div>
                <ul class="logic-subcategory-items">
                  ${items
                    .map(
                      (item) => `
                    <li onclick="openDetail('${item}')">${item}</li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
    })
    .join("");
}
window.renderLogicTree = renderLogicTree;

/* 詳しく見る（スクロール＋開く） */
function openLogicDetail(cat) {
  toggleLogicAccordion(cat);
  const block = document.querySelector(
    `.logic-accordion-block[data-logic-cat="${cat}"]`
  );
  if (block) {
    block.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
window.openLogicDetail = openLogicDetail;

/* アコーディオン開閉 */
function toggleLogicAccordion(cat) {
  const id = `logic-body-${encodeURIComponent(cat)}`;
  const body = document.getElementById(id);
  if (!body) return;
  const isOpen = body.style.display === "block";
  body.style.display = isOpen ? "none" : "block";
}
window.toggleLogicAccordion = toggleLogicAccordion;

/* =========================================
   ロジックツリー → 詳細ページ
========================================= */
function openDetail(theme) {
  const box = document.getElementById("detailBox");

  const dummy = {
    "世界一の絵本図書館":
      "世界一の絵本図書館に関する統合済み提案の要約をここに表示します。",
    "EdTech企業連携":
      "EdTech企業連携に関する統合済み提案の要約をここに表示します。",
    "公園芝生化":
      "公園芝生化に関する統合済み提案の要約をここに表示します。",
    "市民参加型プロジェクト":
      "市民参加型プロジェクトに関する統合済み提案の要約をここに表示します。",
    "カフェ":
      "カフェに関する統合済み提案の要約をここに表示します。",
    "コミュニティ運営":
      "コミュニティ運営に関する統合済み提案の要約をここに表示します。",
    "リスキリング":
      "リスキリングに関する統合済み提案の要約をここに表示します。",
    "共同研究":
      "共同研究に関する統合済み提案の要約をここに表示します。",
    "コワーキング":
      "コワーキングに関する統合済み提案の要約をここに表示します。",
    "SHARE LOUNGE":
      "SHARE LOUNGEに関する統合済み提案の要約をここに表示します。",
    "チャレンジショップ":
      "チャレンジショップに関する統合済み提案の要約をここに表示します。",
    "クラファン連動":
      "クラファン連動に関する統合済み提案の要約をここに表示します。",
    "成果連動型事業":
      "成果連動型事業に関する統合済み提案の要約をここに表示します。",
    "デジタルライブラリ":
      "デジタルライブラリに関する統合済み提案の要約をここに表示します。",
    "ITサポート":
      "ITサポートに関する統合済み提案の要約をここに表示します。",
    "ピッチアリーナ":
      "ピッチアリーナに関する統合済み提案の要約をここに表示します。",
    "サンドボックス":
      "サンドボックスに関する統合済み提案の要約をここに表示します。",
    "災害シミュレーション":
      "災害シミュレーションに関する統合済み提案の要約をここに表示します。",
    "都市指令室":
      "都市指令室に関する統合済み提案の要約をここに表示します。",
    "投票":
      "投票に関する統合済み提案の要約をここに表示します。",
    "トークン設計":
      "トークン設計に関する統合済み提案の要約をここに表示します。",
  };

  const text =
    dummy[theme] || "このテーマに関する統合済み提案はまだありません。";

  box.innerHTML = `
    <h2>${theme}</h2>
    <p>${text}</p>
    <button class="big-button" onclick="goToAssistantWithTheme('${theme}')">
      この分野であなたの意見を聞かせてください（AI壁打ちへ）
    </button>
  `;

  showPage("detail");
}
window.openDetail = openDetail;

/* =========================================
   詳細 → AI壁打ちへ
========================================= */
function goToAssistantWithTheme(theme) {
  showPage("assistant");
  const input = document.getElementById("ideaInput");
  if (input) {
    input.value = `【テーマ】${theme}\n\nあなたの考えを自由に書いてください。`;
  }
}
window.goToAssistantWithTheme = goToAssistantWithTheme;
