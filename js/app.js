const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let selectedCategory = "";

/* ===== PAGE ===== */
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));

  const target = document.getElementById(id);
  if(target){
    target.classList.add('active');
  }
}

/* ===== LOAD ===== */
async function loadData(){
  try{
    const res = await fetch(GAS_URL);

    const text = await res.text();

    let data = [];

    try {
      data = JSON.parse(text);
    } catch(e){
      console.log("GASがJSONではありません:", text);
      return;
    }

    POSTS = data;

    renderPR();
    renderTree();

  }catch(e){
    console.log("load error", e);
  }
}

/* ===== TREE ===== */
function renderTree(){
  const box = document.getElementById("treeData");
  if(!box) return;

  const merged = POSTS.filter(p => p.merged === true);

  box.innerHTML = merged.map(p => `
    <div class="placeholder-card">
      <b>${p.title || ""}</b><br>
      ${p.summary || p.content || ""}
    </div>
  `).join("");
}

/* ===== PR ===== */
function renderPR(){
  const box = document.getElementById("prList");
  if(!box) return;

  box.innerHTML = POSTS.map(p => `
    <div class="placeholder-card">
      <b>${p.title || ""}</b><br>
      <span style="color:${p.merged ? 'green' : 'red'}">
        ${p.merged ? '統合済' : '未統合'}
      </span><br><br>
      ${p.summary || p.content || ""}
    </div>
  `).join("");
}

function filterPR(cat){
  const box = document.getElementById("prList");
  if(!box) return;

  box.innerHTML = POSTS
    .filter(p => p.category === cat)
    .map(p => `
      <div class="placeholder-card">
        <b>${p.title || ""}</b><br>
        <span style="color:${p.merged ? 'green' : 'red'}">
          ${p.merged ? '統合済' : '未統合'}
        </span><br><br>
        ${p.summary || p.content || ""}
      </div>
    `).join("");
}

/* ===== AI ===== */
function setCategory(c){
  selectedCategory = c;
}

function runAI(){
  const text = document.getElementById("ideaInput")?.value || "";

  document.getElementById("resultBox").innerText = text;
  document.getElementById("decisionBox").style.display = "block";
}

async function sendToPR(){
  const data = {
    title: "AI生成",
    category: selectedCategory || "未分類",
    content: document.getElementById("ideaInput")?.value || "",
    summary: document.getElementById("resultBox")?.innerText || ""
  };

  try{
    await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify(data)
    });

    loadData();

  }catch(e){
    console.log("POST error", e);
  }
}

function backToAI(){
  const box = document.getElementById("decisionBox");
  if(box) box.style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadData);