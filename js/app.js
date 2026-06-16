const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];

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

    renderTree();
    renderPR();
  }catch(e){
    console.log(e);
  }
}

/* ================= TREE ================= */
function renderTree(){

  const box = document.getElementById("treeData");
  if(!box) return;

  const treeItems = [
    "📚 絵本図書館",
    "🎓 教育ブランド",
    "💻 EdTech連携",
    "🌳 景観",
    "🏞 公園",
    "🤝 交流",
    "☕ サードプレイス",
    "💰 収益化",
    "🚀 起業",
    "🛡 防災"
  ];

  box.innerHTML = treeItems.map((t,i)=>`
    <div class="placeholder-card" onclick="openTree(${i})">
      ${t}
    </div>
  `).join("");
}

function openTree(id){

  const details = [
    "AI教育拠点",
    "教育改革",
    "企業連携",
    "都市美化",
    "公園改善",
    "多世代交流",
    "居場所",
    "収益モデル",
    "スタートアップ",
    "防災DX"
  ];

  const box = document.getElementById("detailBox");
  if(!box) return;

  box.innerHTML = `<div class="placeholder-card">${details[id]}</div>`;
  showPage("detail");
}

/* ================= AI ================= */
async function runAI(){

  const text = document.getElementById("ideaInput").value;

  const res = await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify({content:text})
  });

  const data = await res.json();
  const aiText = data.result || "";

  document.getElementById("titleBox").innerText = "AIタイトル";
  document.getElementById("summaryBox").innerText = aiText.slice(0,120);

  document.getElementById("decisionBox").style.display = "block";
}

/* ================= PR ================= */
function renderPR(){

  const box = document.getElementById("prList");
  if(!box) return;

  box.innerHTML = POSTS.map(p=>`
    <div class="placeholder-card ${p.merged ? "pr-merged":"pr-unmerged"}">
      <b>${p.title || ""}</b>
      <p>${p.content || ""}</p>
    </div>
  `).join("");
}

/* ================= ACTION ================= */
async function sendToPR(){

  const text = document.getElementById("ideaInput").value;

  await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify({
      title:"AI投稿",
      content:text
    })
  });

  loadData();
}

function backToAI(){
  document.getElementById("decisionBox").style.display = "none";
}

/* INIT */
document.addEventListener("DOMContentLoaded", loadData);