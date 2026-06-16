const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let selectedCategory = "";

/* ================= PAGE ================= */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el=document.getElementById(id);
  if(el) el.classList.add("active");
}

/* ================= LOAD ================= */
async function loadData(){
  try{
    const res=await fetch(GAS_URL);
    POSTS=await res.json();

    renderTree();
    renderPR();
    renderTimeline();

  }catch(e){
    console.log("LOAD ERROR",e);
  }
}

/* ================= TREE（5日間構造維持） ================= */
function renderTree(){

  const box=document.getElementById("treeData");
  if(!box) return;

  const categoryMap={};

  POSTS.forEach(p=>{
    const cat=p.category||"未分類";
    categoryMap[cat]=(categoryMap[cat]||0)+1;
  });

  let html="";

  Object.keys(categoryMap).forEach(cat=>{
    html+=`
      <div class="card">
        <b>${cat}</b><br>
        統合提案数：${categoryMap[cat]}件
      </div>
    `;
  });

  box.innerHTML=html;
}

/* ================= PR（完全フル・GitHub風維持） ================= */
function renderPR(){

  const box=document.getElementById("prList");
  if(!box) return;

  const categoryOrder=[
    "① 芦屋市の価値向上",
    "② 市民ベネフィット",
    "③ 財政持続性",
    "④ 戦略性",
    "⑤ 都市強靭性"
  ];

  const grouped={};

  POSTS.forEach(p=>{
    const cat=p.category||"未分類";
    if(!grouped[cat]) grouped[cat]=[];
    grouped[cat].push(p);
  });

  let html="";

  categoryOrder.forEach(cat=>{

    const list=grouped[cat];
    if(!list) return;

    html+=`<div class="card"><h2>${cat}</h2></div>`;

    list.forEach(p=>{

      html+=`
        <div class="pr-card">
          <div style="display:flex;justify-content:space-between;">
            <b>${p.title||""}</b>
            <span style="
              padding:2px 8px;
              border-radius:12px;
              font-size:12px;
              background:${p.merged?"#2ecc71":"#e74c3c"};
              color:white;
            ">
              ${p.merged?"🟢統合済":"🔴未統合"}
            </span>
          </div>
        </div>
      `;
    });

  });

  box.innerHTML=html;
}

/* ================= DETAIL（維持） ================= */
function openDetail(id){

  const box=document.getElementById("detailBox");
  if(!box) return;

  const details={
    ehon:"AIと絵本を融合した教育拠点構想",
  };

  box.innerHTML=`
    <div class="card">
      <h2>${details[id]||""}</h2>
      <p>AI分析・拡張予定</p>
    </div>
  `;

  showPage("detail");
}

/* ================= AI（完全維持＋構造化） ================= */
async function runAI(){

  selectedCategory=document.getElementById("categorySelect").value;
  const text=document.getElementById("ideaInput").value;

  const res=await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify({
      category:selectedCategory,
      content:text
    })
  });

  const result=await res.json();
  const aiText=result.result||"";

  document.getElementById("resultBox").innerHTML=`
    <h3>AI分析</h3>
    <p>${aiText.slice(0,200)}</p>

    <h3>メリット</h3>
    <p>地域活性・教育効果</p>

    <h3>懸念</h3>
    <p>財源・合意形成</p>

    <h3>行政視点</h3>
    <p>政策整合性</p>

    <h3>市民視点</h3>
    <p>参加型価値</p>
  `;

  document.getElementById("titleBox").innerText="AI生成タイトル";
  document.getElementById("summaryBox").innerText="AI生成要約";
}

/* ================= TIMELINE（復元） ================= */
function renderTimeline(){

  const box=document.getElementById("timeline");
  if(!box) return;

  const timeline=[
    "2026/05 市民参加型構想スタート",
    "2026/06 AI分析導入",
    "2026/07 政策統合フェーズ"
  ];

  box.innerHTML=timeline.map(t=>`
    <div class="card">${t}</div>
  `).join("");
}

/* ================= START ================= */
document.addEventListener("DOMContentLoaded",()=>{
  loadData();
});