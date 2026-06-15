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
    console.log("load error", e);
  }
}

/* ================= PR（一覧） ================= */

function renderPR(){

  const box = document.getElementById("data");
  if(!box) return;

  box.innerHTML = POSTS.map(x=>`
    <div class="placeholder-card">
      <b>${x["タイトル"] || ""}</b><br>
      <small>${x["カテゴリ"] || "未分類"}</small><br><br>
      ${x["内容"] || ""}
    </div>
  `).join("");
}

/* ================= TREE（統合済みのみ） ================= */

function renderTree(){

  const tree = document.getElementById("treeData");
  if(!tree) return;

  const merged = POSTS.filter(x => x.merged === true);

  tree.innerHTML = merged.map(x=>`
    <div class="placeholder-card">
      <b>${x["タイトル"] || ""}</b><br>
      ${x["内容"] || ""}
    </div>
  `).join("");
}

/* ================= PR（カテゴリ別・未統合/統合） ================= */

function renderPRList(filter=""){

  const box = document.getElementById("prList");
  if(!box) return;

  const filtered = filter
    ? POSTS.filter(p => p.category === filter)
    : POSTS;

  box.innerHTML = filtered.map(p=>`
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

/* フィルター */
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

    <button onclick="submitIdea()" class="big-button">
      A. 200字要約してPRへ
    </button>

    <button onclick="backToAI()" class="big-button">
      B. 意見を修正する
    </button>
  `;
}

/* ================= AI → PR送信 ================= */

async function submitIdea(){

  const data = {
    title: document.getElementById("title").value || "AI生成案",
    category: selectedCategory || "未分類",
    content: document.getElementById("input").value || "",
    summary: document.getElementById("input").value || "",
    merged: false
  };

  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  await res.json();

  document.getElementById("aiBox").innerHTML = `
    <div style="padding:20px;background:#dcfce7;border-radius:12px;">
      <h3>PR送信完了</h3>
    </div>
  `;

  loadData();
}

/* ================= AI戻る ================= */

function backToAI(){
  document.getElementById("aiBox").innerHTML = "入力を修正してください";
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", loadData);