const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let selectedCategory = "";

/* ================= PAGE ================= */

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  const el = document.getElementById(id);

  if(el){
    el.classList.add("active");
  }
}

/* ================= LOAD ================= */

async function loadData(){

  try{

    const res = await fetch(GAS_URL);
    POSTS = await res.json();

function renderPR(){

  const box = document.getElementById("prList");
  if(!box) return;

  // ★固定の大分類（この順番が絶対）
  const categoryOrder = [
    "① 芦屋市の価値向上",
    "② 市民ベネフィット",
    "③ 財政持続性",
    "④ 戦略性",
    "⑤ 都市強靭性"
  ];

  // カテゴリごとに整理
  const grouped = {};

  POSTS.forEach(p => {

    const cat = p.category || "未分類";

    if(!grouped[cat]) grouped[cat] = [];

    grouped[cat].push(p);

  });

  let html = "";

  // ★カテゴリ順で必ず表示（ランダム禁止）
  categoryOrder.forEach(cat => {

    const list = grouped[cat];

    if(!list || list.length === 0) return;

    html += `
      <div style="margin-top:30px;">
        <h2 style="
          border-left:6px solid #333;
          padding-left:10px;
          font-size:18px;
        ">
          ${cat}
        </h2>
      </div>
    `;

    list.forEach(p => {

      const isMerged = p.merged === true;

      const statusColor = isMerged ? "#2ecc71" : "#e74c3c";
      const statusText = isMerged ? "MERGED" : "OPEN";

      html += `
        <div class="pr-card"
             style="
               border:1px solid #e5e5e5;
               border-radius:12px;
               padding:14px;
               margin:10px 0;
               background:#fff;
               box-shadow:0 2px 6px rgba(0,0,0,0.06);
               transition:0.2s;
             ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">

            <div style="font-weight:bold;">
              ${p.title || ""}
            </div>

            <div style="
              font-size:11px;
              padding:4px 10px;
              border-radius:20px;
              background:${statusColor};
              color:#fff;
              font-weight:bold;
            ">
              ${statusText}
            </div>

          </div>

        </div>
      `;

    });

  });

  box.innerHTML = html;
}

}

/* ================= TREE ================= */

function renderTree(){

  const box = document.getElementById("treeData");
  if(!box) return;

  const categoryMap = {};

  POSTS.forEach(p => {

    const cat = p.category || "未分類";

    if(!categoryMap[cat]) categoryMap[cat] = 0;

    categoryMap[cat]++;

  });

  let html = "";

  Object.keys(categoryMap).forEach(cat => {

    html += `
      <div class="placeholder-card">
        <b>${cat}</b><br>
        統合提案数：${categoryMap[cat]}件
      </div>
    `;

  });

  box.innerHTML = html;
}

/* ================= DETAIL ================= */

function openDetail(id){

  const box = document.getElementById("detailBox");

  if(!box) return;

  if(id === "ehon"){

    box.innerHTML = `
      <div class="placeholder-card">
        <h2>📚 絵本図書館（AI知育拠点）</h2>

        <p>
          AI・絵本・知育・親子学習を融合した
          次世代教育拠点の構想です。
        </p>

      </div>
    `;

  }

  showPage("detail");

}

/* ================= PR ================= */

function renderPR(){

  const box = document.getElementById("prList");

  if(!box) return;

  const grouped = {};

  POSTS.forEach(p => {
    const cat = p.category || "未分類";
    if(!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  let html = "";

  Object.keys(grouped).forEach(cat => {

    html += `<h2>${cat}</h2>`;

    grouped[cat].forEach(p => {

      html += `
        <div class="placeholder-card">
          <b>${p.title || ""}</b>
          <span style="color:${p.merged ? "green" : "red"}">
            ${p.merged ? "🟢統合済" : "🔴未統合"}
          </span>
        </div>
      `;

    });

  });

  box.innerHTML = html;
}

function filterPR(cat){

  const box = document.getElementById("prList");

  if(!box) return;

  box.innerHTML = POSTS
    .filter(p => p.category === cat)
    .map(p => `
      <div class="placeholder-card">

        <b>${p.title || ""}</b><br>

        <span style="color:${p.merged ? "green" : "red"}">
          ${p.merged ? "統合済" : "未統合"}
        </span>

        <br><br>

        ${p.summary || p.content || ""}

      </div>
    `).join("");

}

/* ================= AI ================= */

function setCategory(c){
  selectedCategory = c;
}

async function runAI(){

 selectedCategory =
  document.getElementById("categorySelect").value; 

const text =
    document.getElementById("ideaInput").value;

  const response = await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify({
      category:selectedCategory || "未分類",
      content:text
    })
  });

  const result = await response.json();

  const aiText = result.result || "";

document.getElementById("resultBox").innerHTML = `
  <h3>要約</h3>
  <p>${aiText.slice(0,200)}</p>

  <h3>メリット</h3>
  <p>地域活性化・教育効果・経済波及</p>

  <h3>懸念点</h3>
  <p>財源・運用コスト・合意形成</p>

  <h3>行政視点</h3>
  <p>中長期の都市戦略に寄与</p>

  <h3>市民視点</h3>
  <p>参加型政策として評価</p>
`;
console.log(aiText);

  document.getElementById("resultBox").innerText =
  aiText;

const lines = aiText.split("\n");

let title = "";
let summary = "";

for(let i=0;i<lines.length;i++){

  if(lines[i].includes("推奨タイトル")){
    title = lines[i+1] || "";
  }

  if(lines[i].includes("200字要約")){
    summary = lines.slice(i+1).join("\n");
  }

}

document.getElementById("titleBox").innerText =
  title;

document.getElementById("summaryBox").innerText =
  summary;

  document.getElementById("decisionBox").style.display =
    "block";
}

async function sendToPR(){

  const input = document.getElementById("ideaInput");
  const result = document.getElementById("resultBox");

  const data = {

    title: "AI生成",

    category: selectedCategory || "未分類",

    content: input ? input.value : "",

    summary: result ? result.innerText : ""

  };

  try{

    await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify(data)
    });

    loadData();

  }catch(e){

    console.log("POST ERROR",e);

  }

}

function backToAI(){


  const box = document.getElementById("decisionBox");

  if(box){
    box.style.display = "none";
  }

}

/* ================= START ================= */

document.addEventListener("DOMContentLoaded",()=>{
  loadData();
  renderTree();
renderTimeline();
});

function renderTimeline(){

  const box = document.getElementById("timeline");
  if(!box) return;

  const timeline = [
    "2026/05 市民参加型構想スタート",
    "2026/06 AI分析導入",
    "2026/07 政策統合フェーズ"
  ];

  box.innerHTML = timeline.map(t => `
    <div class="placeholder-card">
      ${t}
    </div>
  `).join("");

}