/* =========================================================
   市民政策AIプラットフォーム app.js（最終系）
   前半：初期設定・ページ切替・CATEGORY_TREE
========================================================= */

/* -----------------------------
   ページ切替
----------------------------- */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

/* -----------------------------
   大分類（ユーザー選択で固定）
----------------------------- */
const MAIN_CATEGORIES = [
  "① 芦屋市の価値向上",
  "② 市民ベネフィット",
  "③ 財政持続性",
  "④ 戦略性",
  "⑤ 都市強靭性"
];

/* -----------------------------
   CATEGORY_TREE（中分類・小分類）
   ※ 統合は小分類単位
   ※ 中分類は分類の箱
   ※ 小分類は統合の単位
----------------------------- */
let CATEGORY_TREE = {
  "① 芦屋市の価値向上": {
    "その他": ["その他"]
  },
  "② 市民ベネフィット": {
    "その他": ["その他"]
  },
  "③ 財政持続性": {
    "その他": ["その他"]
  },
  "④ 戦略性": {
    "その他": ["その他"]
  },
  "⑤ 都市強靭性": {
    "その他": ["その他"]
  }
};

/* -----------------------------
   PRデータ保存領域
   ※ ここに 200字要約・タイトル・分類 が保存される
   ※ merged=false → PR一覧のみ
   ※ merged=true → ロジックツリーに表示
----------------------------- */
let PR_DATA = [];

/* -----------------------------
   大分類ノードの描画（ロジックツリー上部）
----------------------------- */
function renderMainNodes(){
  const area = document.getElementById("logicMainNodes");
  area.innerHTML = "";

  MAIN_CATEGORIES.forEach(cat => {
    const div = document.createElement("div");
    div.className = "logic-main-node";

    div.innerHTML = `
      <div class="logic-main-node-title">${cat}</div>
      <button onclick="openCategoryDetail('${cat}')">詳しく見る</button>
    `;

    area.appendChild(div);
  });
}

/* -----------------------------
   大分類クリック → 中分類・小分類アコーディオン生成
----------------------------- */
function openCategoryDetail(mainCat){
  const detailArea = document.getElementById("logicDetailArea");
  detailArea.innerHTML = "";

  const mids = CATEGORY_TREE[mainCat];

  Object.keys(mids).forEach(mid => {
    const block = document.createElement("div");
    block.className = "logic-accordion-block";

    block.innerHTML = `
      <div class="logic-accordion-header" onclick="toggleAccordion(this)">
        <h3>${mid}</h3>
        <span>▼</span>
      </div>
      <div class="logic-accordion-body">
        ${renderSmallList(mainCat, mid)}
      </div>
    `;

    detailArea.appendChild(block);
  });

  showPage("tree");
}

/* -----------------------------
   小分類リスト生成
----------------------------- */
function renderSmallList(mainCat, mid){
  const smalls = CATEGORY_TREE[mainCat][mid];

  let html = `<ul class="logic-subcategory-items">`;

  smalls.forEach(small => {
    html += `
      <li onclick="openDetail('${mainCat}','${mid}','${small}')">
        ${small}
      </li>
    `;
  });

  html += `</ul>`;
  return html;
}

/* -----------------------------
   アコーディオン開閉
----------------------------- */
function toggleAccordion(header){
  const body = header.nextElementSibling;
  body.style.display = (body.style.display === "block") ? "none" : "block";
}

/* -----------------------------
   詳細ページ表示
----------------------------- */
function openDetail(mainCat, mid, small){
  const box = document.getElementById("detailBox");

  // merged=true の PR を抽出
  const mergedList = PR_DATA.filter(p =>
    p.main === mainCat &&
    p.mid === mid &&
    p.small === small &&
    p.merged === true
  );

  let html = `
    <h2>${mainCat} ＞ ${mid} ＞ ${small}</h2>
    <p>この小分類に統合された提案（200字要約）</p>
  `;

  if(mergedList.length === 0){
    html += `<p>まだ統合された提案はありません。</p>`;
  } else {
    mergedList.forEach(item => {
      html += `
        <div class="placeholder-card">
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </div>
      `;
    });
  }

  box.innerHTML = html;
  showPage("detail");
}

/* -----------------------------
   詳細 → AI壁打ちへ戻る
----------------------------- */
function backToAI(){
  showPage("assistant");
}


/* =========================================================
   app.js（最終系）中盤：AI壁打ち → PR投稿 → 分類提案
========================================================= */

/* -----------------------------
   大分類ボタン選択
----------------------------- */
document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.getElementById("categorySelect").value = btn.dataset.cat;
  });
});

/* -----------------------------
   AI壁打ち（500字分析）
----------------------------- */
function runAI(){
  const text = document.getElementById("ideaInput").value.trim();
  if(!text){
    alert("意見を入力してください。");
    return;
  }

  const aiBox = document.getElementById("aiBox");
  aiBox.innerHTML = "AIが分析中です…";

  // ★ 本番では API を呼ぶ。ここではダミー生成。
  setTimeout(() => {
    const analysis = generateAnalysis(text);
    aiBox.innerHTML = analysis;

    document.getElementById("decisionBox").style.display = "block";
  }, 600);
}

/* -----------------------------
   ダミー：500字分析生成
----------------------------- */
function generateAnalysis(text){
  return `
    <b>【AI分析（500字）】</b><br><br>
    ${text} に関する論点を整理すると、以下の観点が重要になります。<br>
    ・市民価値の向上<br>
    ・財政持続性<br>
    ・交流・ベネフィット<br>
    ・運営効率と戦略性<br><br>
    これらを踏まえ、政策的な方向性を検討する必要があります。
  `;
}

/* -----------------------------
   200字要約とタイトル生成
----------------------------- */
function confirmSummary(){
  const aiBox = document.getElementById("aiBox").innerText;

  const summary = generateSummary(aiBox);
  const title = generateTitle(aiBox);

  document.getElementById("summaryBox").innerText = summary;
  document.getElementById("titleBox").innerText = title;

  document.getElementById("summaryBlock").style.display = "block";
}

/* -----------------------------
   ダミー：200字要約生成
----------------------------- */
function generateSummary(text){
  return "この提案は、市民価値向上・財政持続性・交流促進など複数の観点から重要性を持つと整理されます。公共施設の役割を再定義し、より多様な市民ニーズに応えるための改善が求められています。";
}

/* -----------------------------
   ダミー：タイトル生成
----------------------------- */
function generateTitle(text){
  return "公共施設の価値向上と市民ニーズへの対応";
}

/* =========================================================
   AI分類提案（中分類・小分類）
   ※ 追加は人間承認が必要
========================================================= */

let proposedMid = null;
let proposedSmall = null;

/* -----------------------------
   PR投稿前に AI が分類を提案
----------------------------- */
function sendToPR(){
  const mainCat = document.getElementById("categorySelect").value;
  const summary = document.getElementById("summaryBox").innerText;
  const title = document.getElementById("titleBox").innerText;

  if(!mainCat){
    alert("大分類が選択されていません。");
    return;
  }

  // ★ AIが中分類・小分類を提案（ダミー）
  const proposal = aiProposeCategory(summary);

  proposedMid = proposal.mid;
  proposedSmall = proposal.small;

  // UI表示
  showCategoryProposalUI(proposal.mid, proposal.small);
}

/* -----------------------------
   ダミー：AI分類提案ロジック
----------------------------- */
function aiProposeCategory(summary){
  // 本番では LLM が分類を返す
  return {
    mid: "AI提案中分類",
    small: "AI提案小分類"
  };
}

/* -----------------------------
   分類提案 UI を表示
----------------------------- */
function showCategoryProposalUI(mid, small){
  const prList = document.getElementById("prList");
  prList.innerHTML = `
    <div class="placeholder-card">
      <h3>AIが分類を提案しています</h3>
      <p>中分類：${mid}</p>
      <p>小分類：${small}</p>

      <button class="big-button" onclick="approveCategory()">承認して追加する</button>
      <button class="big-button" style="background:#e5e7eb;color:#111;" onclick="rejectCategory()">今回は追加しない</button>
    </div>
  `;

  showPage("pullrequest");
}

/* -----------------------------
   承認 → CATEGORY_TREE に追加
----------------------------- */
function approveCategory(){
  const mainCat = document.getElementById("categorySelect").value;

  if(!CATEGORY_TREE[mainCat][proposedMid]){
    CATEGORY_TREE[mainCat][proposedMid] = [];
  }
  if(!CATEGORY_TREE[mainCat][proposedMid].includes(proposedSmall)){
    CATEGORY_TREE[mainCat][proposedMid].push(proposedSmall);
  }

  savePR(false); // merged=false で保存
  alert("分類を追加し、PRに投稿しました。");
  showPage("pullrequest");
}

/* -----------------------------
   拒否 → その他に入れる
----------------------------- */
function rejectCategory(){
  const mainCat = document.getElementById("categorySelect").value;

  savePR(false); // merged=false
  alert("AI提案は採用せず、その他に分類して投稿しました。");
  showPage("pullrequest");
}

/* -----------------------------
   PR保存（merged=false）
----------------------------- */
function savePR(isMerged){
  const mainCat = document.getElementById("categorySelect").value;
  const summary = document.getElementById("summaryBox").innerText;
  const title = document.getElementById("titleBox").innerText;

  let mid = proposedMid || "その他";
  let small = proposedSmall || "その他";

  PR_DATA.push({
    main: mainCat,
    mid: mid,
    small: small,
    summary: summary,
    title: title,
    merged: isMerged
  });

  renderPRList(mainCat);
}

/* -----------------------------
   PR一覧表示
----------------------------- */
function renderPRList(mainCat){
  const area = document.getElementById("prList");
  area.innerHTML = "";

  const list = PR_DATA.filter(p => p.main === mainCat);

  if(list.length === 0){
    area.innerHTML = "まだ投稿がありません。";
    return;
  }

  list.forEach(item => {
    const row = document.createElement("div");
    row.className = "pr-row";
    row.innerHTML = `
      <div>
        <b>${item.title}</b><br>
        ${item.summary}
      </div>
    `;
    area.appendChild(row);
  });
}

/* =========================================================
   app.js（最終系）後半：統合 → 承認 → ロジックツリー反映
========================================================= */

/* -----------------------------
   PRページ：統合候補を表示
----------------------------- */
function renderPRList(mainCat){
  const area = document.getElementById("prList");
  area.innerHTML = "";

  const list = PR_DATA.filter(p => p.main === mainCat);

  if(list.length === 0){
    area.innerHTML = "まだ投稿がありません。";
    return;
  }

  list.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "pr-row";

    row.innerHTML = `
      <div>
        <b>${item.title}</b><br>
        ${item.summary}
      </div>
      <button onclick="openPRDetail(${index})">詳細</button>
    `;

    area.appendChild(row);
  });
}

/* -----------------------------
   PR詳細表示（統合ボタン付き）
----------------------------- */
function openPRDetail(index){
  const item = PR_DATA[index];

  const box = document.getElementById("prDetail");
  box.style.display = "block";

  document.getElementById("prDetailTitle").innerText = item.title;
  document.getElementById("prDetailSummary").innerText = item.summary;

  box.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.summary}</p>

    <button class="big-button" onclick="mergePR(${index})">
      この提案を統合する（小分類に追加）
    </button>
  `;
}

/* -----------------------------
   統合処理（小分類単位）
   merged=true にしてロジックツリーへ反映
----------------------------- */
function mergePR(index){
  const item = PR_DATA[index];

  // 統合済みに変更
  PR_DATA[index].merged = true;

  alert("この提案を統合しました。ロジックツリーに反映されます。");

  showPage("tree");
  renderMainNodes();
}

/* =========================================================
   その他分類の自動処理
========================================================= */

function ensureCategoryExists(mainCat, mid, small){
  if(!CATEGORY_TREE[mainCat]){
    CATEGORY_TREE[mainCat] = { "その他": ["その他"] };
  }
  if(!CATEGORY_TREE[mainCat][mid]){
    CATEGORY_TREE[mainCat][mid] = [];
  }
  if(!CATEGORY_TREE[mainCat][mid].includes(small)){
    CATEGORY_TREE[mainCat][mid].push(small);
  }
}

/* =========================================================
   初期化処理
========================================================= */

function init(){
  renderMainNodes();
  showPage("intro");
}

window.onload = init
