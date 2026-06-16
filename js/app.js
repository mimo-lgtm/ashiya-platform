const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let selectedCategory = "";

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

/* ================= PAGE ================= */
function showPage(id){

  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  const target = document.getElementById(id);
  if(target) target.classList.add("active");
}

/* ================= LOAD ================= */
async function loadData(){

  try{

    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderTree();
    renderPR();
    renderTimeline();

  }catch(e){
    console.log("LOAD ERROR", e);
  }
}

/* ================= TREE ================= */
function renderTree(){

  const box = document.getElementById("treeData");
  if(!box) return;

  const categoryMap = {};

  POSTS.forEach(p=>{
    const cat = p.category || "未分類";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  let html = "";

  Object.keys(categoryMap).forEach(cat=>{
    html += `
      <div class="placeholder-card">
        <b>${cat}</b><br>
        統合提案数：${categoryMap[cat]}件
      </div>
    `;
  });

  box.innerHTML = html;
}

/* ================= PR ================= */
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

    const list = grouped[cat];
    if(!list) return;

    html += `<h2 style="margin-top:20px;">${cat}</h2>`;

    list.forEach(p=>{
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

/* ================= TIMELINE ================= */
function renderTimeline(){

  const box = document.getElementById("timeline");
  if(!box) return;

  const timeline = [
    "2026/05 市民参加型構想スタート",
    "2026/06 AI分析導入",
    "2026/07 政策統合フェーズ"
  ];

  box.innerHTML = timeline.map(t=>
    `<div class="placeholder-card">${t}</div>`
  ).join("");
}

/* ================= AI ================= */
async function runAI(){

  const category =
    document.getElementById("categorySelect")?.value || "未分類";

  const text =
    document.getElementById("ideaInput")?.value || "";

  try{

    const res = await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify({
        category,
        content:text
      })
    });

    const result = await res.json();
    const aiText = result.result || "";

    const resultBox = document.getElementById("resultBox");
    const titleBox = document.getElementById("titleBox");
    const summaryBox = document.getElementById("summaryBox");

    if(resultBox){
      resultBox.innerHTML = `
        <h3>AI分析結果</h3>
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
    }

    if(titleBox) titleBox.innerText = "AI生成タイトル";
    if(summaryBox) summaryBox.innerText = aiText.slice(0,120);

    const decisionBox = document.getElementById("decisionBox");
    if(decisionBox) decisionBox.style.display = "block";

  }catch(e){
    console.log("AI ERROR", e);
  }
}

/* ================= SEND ================= */
async function sendToPR(){

  const input = document.getElementById("ideaInput")?.value || "";

  try{

    await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify({
        title:"AI生成",
        category:selectedCategory,
        content:input
      })
    });

    loadData();

  }catch(e){
    console.log("POST ERROR", e);
  }
}

/* ================= BACK ================= */
function backToAI(){

  const box = document.getElementById("decisionBox");
  if(box) box.style.display = "none";
}