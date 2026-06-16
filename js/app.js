const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let selectedCategory = "";

/* ================= PAGE ================= */

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

/* ================= LOAD ================= */

async function loadData(){
  try{
    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderPR();
    renderTree();
    renderTimeline();

  }catch(e){
    console.log("LOAD ERROR",e);
  }
}

/* ================= TREE（5分類固定順） ================= */

function renderTree(){

  const box = document.getElementById("treeData");
  if(!box) return;

  const categoryOrder = [
    "① 芦屋市の価値向上",
    "② 市民ベネフィット",
    "③ 財政持続性",
    "④ 戦略性",
    "⑤ 都市強靭性"
  ];

  const grouped = {};

  POSTS.forEach(p=>{
    const cat = p.category || "未分類";
    if(!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  let html = "";

  categoryOrder.forEach(cat=>{
    const list = grouped[cat] || [];

    html += `
      <div class="placeholder-card">
        <b>${cat}</b><br>
        統合提案数：${list.length}件
      </div>
    `;
  });

  box.innerHTML = html;
}

/* ================= PR（GitHub風・カテゴリ順固定） ================= */

function renderPR(){

  const box = document.getElementById("prList");
  if(!box) return;

  const categoryOrder = [
    "① 芦屋市の価値向上",
    "② 市民ベネフィット",
    "③ 財政持続性",
    "④ 戦略性",
    "⑤ 都市強靭性"
  ];

  const grouped = {};

  POSTS.forEach(p=>{
    const cat = p.category || "未分類";
    if(!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  let html = "";

  categoryOrder.forEach(cat=>{
    const list = grouped[cat] || [];
    if(list.length === 0) return;

    html += `<h2 style="margin-top:30px;">${cat}</h2>`;

    list.forEach(p=>{

      const isMerged = p.merged === true;

      html += `
        <div style="
          border:1px solid #ddd;
          border-left:6px solid ${isMerged ? "#2ecc71" : "#e74c3c"};
          padding:12px;
          margin:10px 0;
          border-radius:10px;
          background:#fff;
        ">

          <b>${p.title || ""}</b>

          <span style="
            float:right;
            font-size:12px;
            color:${isMerged ? "#2ecc71" : "#e74c3c"};
            font-weight:bold;
          ">
            ${isMerged ? "🟢統合済" : "🔴未統合"}
          </span>

        </div>
      `;
    });
  });

  box.innerHTML = html;
}

/* ================= DETAIL ================= */

function openDetail(id){

  const box = document.getElementById("detailBox");
  if(!box) return;

  const details = {
    ehon: "AIと絵本を融合した教育拠点構想",
  };

  box.innerHTML = `
    <div class="placeholder-card">
      <h2>${details[id] || ""}</h2>
    </div>
  `;

  showPage("detail");
}

/* ================= AI ================= */

async function runAI(){

  selectedCategory =
    document.getElementById("categorySelect").value;

  const text = document.getElementById("ideaInput").value;

  const response = await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify({
      category:selectedCategory,
      content:text
    })
  });

  const result = await response.json();
  const aiText = result.result || "";

  // ★構造表示（これが正解）
  document.getElementById("resultBox").innerHTML = `
    <h3>AI分析</h3>
    <p>${aiText.slice(0,200)}</p>

    <h3>メリット</h3>
    <p>地域活性化・教育効果・経済波及</p>

    <h3>懸念点</h3>
    <p>財源・運用コスト・合意形成</p>

    <h3>行政視点</h3>
    <p>中長期の都市戦略</p>

    <h3>市民視点</h3>
    <p>参加型政策</p>
  `;

  // タイトル・要約は仮（後で精度上げる）
  document.getElementById("titleBox").innerText = "AI生成タイトル";
  document.getElementById("summaryBox").innerText = aiText.slice(0,200);

  document.getElementById("decisionBox").style.display = "block";
}

/* ================= SEND ================= */

async function sendToPR(){

  const input = document.getElementById("ideaInput");
  const result = document.getElementById("summaryBox");

  const data = {
    title: document.getElementById("titleBox").innerText,
    category: selectedCategory,
    content: input.value,
    summary: result.innerText
  };

  await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify(data)
  });

  loadData();
}

/* ================= TIMELINE ================= */

function renderTimeline(){

  const box = document.getElementById("timeline");
  if(!box) return;

  const timeline = [
    "2026/05 市民参加型構想スタート",
    "2026/06 AI分析導入",
    "2026/07 政策統合フェーズ"
  ];

  box.innerHTML = timeline.map(t=>`
    <div class="placeholder-card">${t}</div>
  `).join("");
}

/* ================= START ================= */

document.addEventListener("DOMContentLoaded",()=>{
  loadData();
});