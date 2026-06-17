
/* =========================
   CONFIG
========================= */
const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let CURRENT_CATEGORY = "";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init(){
  loadPosts();
  renderTree();
  renderPR();
  renderVision();
}

/* =========================
   PAGE CONTROL
========================= */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(id);
  if(target) target.classList.add("active");
}

/* =========================
   DATA LOAD (GAS)
========================= */
async function loadPosts(){

  try{
    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderPR();

  }catch(e){
    console.log("LOAD ERROR", e);
  }
}

/* =========================
   TREE RENDER
========================= */
function renderTree(){

  const el = document.getElementById("treeBox");
  if(!el) return;

  el.innerHTML = `
    <h2>① 芦屋市の価値向上</h2>

    <div class="tree-item" onclick="goAI('次世代教育ブランド')">次世代教育ブランド</div>
    <div class="tree-item" onclick="goAI('EdTech連携')">EdTech連携</div>
    <div class="tree-item" onclick="goAI('景観美化')">景観美化</div>
    <div class="tree-item" onclick="goAI('公園芝生化')">公園芝生化</div>

    <h2>② 市民ベネフィット</h2>
    <div class="tree-item" onclick="goAI('多世代交流')">多世代交流</div>
    <div class="tree-item" onclick="goAI('サードプレイス')">サードプレイス</div>

    <h2>③ 財政持続性</h2>
    <div class="tree-item" onclick="goAI('施設収益化')">施設収益化</div>

    <h2>④ 戦略性</h2>
    <div class="tree-item" onclick="goAI('起業支援')">起業支援</div>

    <h2>⑤ 都市強靭性</h2>
    <div class="tree-item" onclick="goAI('防災システム')">防災システム</div>
  `;
}

/* =========================
   AI WALL
========================= */
async function aiRun(){

  const input = document.getElementById("aiInput")?.value || "";
  const category = document.getElementById("aiCategory")?.value || "未分類";

  if(!input){
    alert("入力してください");
    return;
  }

  try{

    const res = await fetch(GAS_URL,{
      method:"POST",
      body: JSON.stringify({
        category,
        content: input
      })
    });

    const json = await res.json();

    const aiText = json.result || "";
    const summary = json.summary || "";
    const title = json.title || "";

    document.getElementById("aiResult").innerHTML = `
      <h3>AI分析（最大500字）</h3>
      <p>${aiText}</p>

      <h3>200字要約</h3>
      <p>${summary}</p>

      <h3>タイトル</h3>
      <p>${title}</p>

      <button onclick="sendToPR('${category}','${title}','${summary}')">
        A：PRへ送信
      </button>

      <button onclick="resetAI()">
        B：修正する
      </button>
    `;

  }catch(e){
    console.log("AI ERROR", e);
  }
}

function resetAI(){
  document.getElementById("aiResult").innerHTML = "";
}

/* =========================
   GO FROM TREE → AI
========================= */
function goAI(text){

  showPage("ai");

  document.getElementById("aiInput").value = text;
}

/* =========================
   SEND TO PR
========================= */
async function sendToPR(category,title,summary){

  try{

    await fetch(GAS_URL,{
      method:"POST",
      body: JSON.stringify({
        category,
        title,
        summary,
        merged:false
      })
    });

    alert("PRに追加しました");

    loadPosts();

  }catch(e){
    console.log("PR ERROR", e);
  }
}

/* =========================
   PR RENDER
========================= */
function renderPR(){

  const el = document.getElementById("prBox");
  if(!el) return;

  const cats = {
    "価値向上": [],
    "ベネフィット": [],
    "財政": [],
    "戦略": [],
    "強靭性": []
  };

  POSTS.forEach(p=>{
    if(cats[p.category]){
      cats[p.category].push(p);
    }
  });

  let html = "";

  Object.keys(cats).forEach(cat=>{
    
    html += `<h2>${cat}</h2>`;

    if(cats[cat].length === 0){
      html += `<div class="card">データなし</div>`;
      return;
    }

    cats[cat].forEach(p=>{
      html += `
        <div class="card">
          <b>${p.title || "無題"}</b><br>
          <small>${p.summary || ""}</small><br>
          <span style="color:${p.merged ? "green":"red"}">
            ${p.merged ? "🟢統合済":"🔴未統合"}
          </span>
        </div>
      `;
    });

  });

  el.innerHTML = html;
}

/* =========================
   VISION
========================= */
function renderVision(){

  const el = document.getElementById("visionBox");
  if(!el) return;

  el.innerHTML = `
    <div class="card">
      <h3>初期ビジョン</h3>
      <p>コストセンター → プロフィットセンター</p>
    </div>

    <div class="card">
      <h3>進化方向</h3>
      <p>市民データ駆動型都市・AI共同意思決定</p>
    </div>
  `;
}

/* =========================
   CATEGORY FILTER (optional hook)
========================= */
function filterPR(cat){
  const items = document.querySelectorAll(".card");
  items.forEach(i=>{
    i.style.display = "block";
  });
}