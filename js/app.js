/* =========================================================
   ページ切替
========================================================= */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

/* =========================================================
   大分類
========================================================= */
const MAIN_CATEGORIES = [
  "① 芦屋市の価値向上",
  "② 市民ベネフィット",
  "③ 財政持続可能性",
  "④ 施設の戦略性",
  "⑤ 都市の強靭性とガバナンス",
  "その他"
];

/* =========================================================
   CATEGORY_TREE（中分類・小分類）
========================================================= */
let CATEGORY_TREE = {
  "① 芦屋市の価値向上": { "その他": ["その他"] },
  "② 市民ベネフィット": { "その他": ["その他"] },
  "③ 財政持続可能性": { "その他": ["その他"] },
  "④ 施設の戦略性": { "その他": ["その他"] },
  "⑤ 都市の強靭性とガバナンス": { "その他": ["その他"] },
  "その他": { "その他": ["その他"] }
};

/* =========================================================
   PRデータ保存
========================================================= */
let PR_DATA = [];

/* =========================================================
   ロジックツリー：大分類ノード描画
========================================================= */
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

/* =========================================================
   大分類クリック → 中分類・小分類アコーディオン生成
========================================================= */
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

/* =========================================================
   小分類リスト生成
========================================================= */
function renderSmallList(mainCat, mid){
  const smalls = CATEGORY_TREE[mainCat][mid];

  let html = `<ul class="logic-subcategory-items">`;

  smalls.forEach(small => {
    html += `
      <li onclick="openSmallDetail('${mainCat}','${mid}','${small}')">
        ${small}
      </li>
    `;
  });

  html += `</ul>`;
  return html;
}

/* =========================================================
   アコーディオン開閉
========================================================= */
function toggleAccordion(header){
  const body = header.nextElementSibling;
  body.style.display = (body.style.display === "block") ? "none" : "block";
}


/* =========================================================
   小分類クリック → 詳細ページ
========================================================= */
function openSmallDetail(mainCat, mid, small){
  const box = document.getElementById("detailBox");

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

/* =========================================================
   AI壁打ち（500字分析）
========================================================= */
function runAI(){
  const text = document.getElementById("userInput").value.trim();
  const result = document.getElementById("aiResult");

  if(!text){
    alert("意見を入力してください。");
    return;
  }

  result.innerHTML = "AIが分析中です…";

  setTimeout(() => {
    result.innerHTML = generateAnalysis(text);
  }, 600);
}

/* ダミー分析生成 */
function generateAnalysis(text){
  return `
    <b>【AI整理結果】</b><br><br>
    あなたの意見：「${text}」をもとに、以下の観点が重要だと整理されました。<br>
    ・市民価値の向上<br>
    ・市民ベネフィット<br>
    ・財政持続可能性<br>
    ・施設の戦略性<br><br>
    これらを踏まえ、駅前公共施設を「投資型施設」として再定義する方向性が示唆されます。
  `;
}

/* =========================================================
   PR投稿（200字要約＋タイトル）
========================================================= */
function sendToPR(){
  const text = document.getElementById("userInput").value.trim();
  if(!text){
    alert("意見がありません。");
    return;
  }

  const active = document.querySelector(".cat-btn.active");
  const mainCat = active ? active.dataset.cat : "その他";

  const summary = text.slice(0, 200);
  const title = text.slice(0, 20);

  PR_DATA.push({
    main: mainCat,
    mid: "その他",
    small: "その他",
    summary: summary,
    title: title,
    merged: false
  });

  renderPRList(mainCat);
  showPage("pullrequest");
}

/* =========================================================
   PR一覧表示
========================================================= */
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


/* =========================================================
   PR詳細表示（統合ボタン付き）
========================================================= */
function openPRDetail(index){
  const item = PR_DATA[index];

  const box = document.getElementById("prDetail");
  box.style.display = "block";

  box.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.summary}</p>

    <button class="big-button" onclick="mergePR(${index})">
      この提案を統合する（小分類に追加）
    </button>
  `;
}

/* =========================================================
   統合処理（小分類単位）
========================================================= */
function mergePR(index){
  const item = PR_DATA[index];

  PR_DATA[index].merged = true;

  ensureCategoryExists(item.main, item.mid, item.small);

  alert("この提案を統合しました。ロジックツリーに反映されます。");

  showPage("tree");
  renderMainNodes();
}

/* =========================================================
   CATEGORY_TREE に存在しない場合は自動追加
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
   初期化
========================================================= */
function init(){
  renderMainNodes();
  showPage("intro");
}

window.onload = init;






