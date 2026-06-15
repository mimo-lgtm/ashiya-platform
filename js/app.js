function showPage(pageId){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.remove('active');
  });

  const target = document.getElementById(pageId);
  if(target){
    target.classList.add('active');
    window.scrollTo({ top:0, behavior:'smooth' });
  }
}

/* ================= GAS ================= */

const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

/* ================= STATE ================= */

let POSTS = [];
let selectedCategory = "";

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", loadData);

/* ================= LOAD ================= */

async function loadData(){
  try{
    const res = await fetch(GAS_URL);
    const data = await res.json();

    POSTS = Array.isArray(data) ? data : [];

    renderPR();
    renderTree();
    renderPRList();

  }catch(e){
    console.log(e);
  }
}

/* ================= PAGE RENDER ================= */

function renderPR(){
  const box = document.getElementById("data");
  if(!box) return;

  box.innerHTML = POSTS.map(p=>`
    <div class="placeholder-card">
      <b>${p.title || p["タイトル"] || ""}</b><br>
      <small>${p.category || p["カテゴリ"] || "未分類"}</small><br><br>
      ${p.content || p["内容"] || ""}
    </div>
  `).join("");
}

function renderTree(){
  const tree = document.getElementById("treeData");
  if(!tree) return;

  const merged = POSTS.filter(p => p.merged === true);

  tree.innerHTML = merged.map(p=>`
    <div class="placeholder-card">
      <b>${p.title || p["タイトル"] || ""}</b><br>
      ${p.content || p["内容"] || ""}
    </div>
  `).join("");
}

/* ================= PR LIST ================= */

function renderPRList(filter=""){
  const box = document.getElementById("prList");
  if(!box) return;

  const list = filter
    ? POSTS.filter(p => p.category === filter)
    : POSTS;

  box.innerHTML = list.map(p=>`
    <div class="placeholder-card">
      <b>${p.title || p["タイトル"] || ""}</b><br>

      <span style="color:${p.merged ? 'green' : 'red'};font-weight:bold;">
        ${p.merged ? "統合済" : "未統合"}
      </span>

      <br><br>
      ${p.summary || p.content || p["内容"] || ""}
    </div>
  `).join("");
}

function filterPR(cat){
  renderPRList(cat);
}

/* ================= AI ================= */

function setCategory(cat){
  selectedCategory = cat;
}

async function aiStep1(){

  const text = document.getElementById("input").value;

  document.getElementById("aiBox").innerHTML = `
    <h3>AI結果</h3>
    <p>${text}</p>

    <button onclick="submitIdea()" class="big-button">A. PRへ</button>
    <button onclick="backToAI()" class="big-button">B. 戻る</button>
  `;
}

async function submitIdea(){

  const data = {
    title: document.getElementById("title").value || "AI生成案",
    category: selectedCategory || "未分類",
    content: document.getElementById("input").value || "",
    summary: document.getElementById("input").value || "",
    merged: false
  };

  await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  loadData();
}

function backToAI(){
  document.getElementById("aiBox").innerHTML = "入力を修正してください";
}