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

/* ================= TREE / PR データ保持 ================= */

let POSTS = [];

/* ================= LOAD DATA ================= */

async function loadData(){

  try{
    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderPR();
    renderTree();

  }catch(e){
    console.log("load error", e);
  }
}

/* ================= PR ================= */

function renderPR(){

  const box = document.getElementById("data");
  if(!box) return;

  box.innerHTML = POSTS.map(x=>`
    <div class="placeholder-card">
      <b>${x["タイトル"] || ""}</b><br>
      <small>${x["カテゴリ"] || ""}</small><br><br>
      ${x["内容"] || ""}
    </div>
  `).join("");
}

/* ================= TREE ================= */

function renderTree(){

  const tree = document.getElementById("treeData");
  if(!tree) return;

  const merged = POSTS.filter(x=>x.merged === true);

  tree.innerHTML = merged.map(x=>`
    <div class="placeholder-card">
      <b>${x["タイトル"] || ""}</b><br>
      ${x["内容"] || ""}
    </div>
  `).join("");
}

/* ================= AI ================= */

async function aiStep1(){

  const text = document.getElementById("input").value;

  document.getElementById("aiBox").innerHTML = `
    <h3>結果</h3>
    <p>${text}</p>

    <button onclick="submitIdea()" class="big-button">
      投稿
    </button>
  `;
}

async function submitIdea(){

  const data = {
    title: document.getElementById("title").value,
    category: "市民提案",
    content: document.getElementById("input").value
  };

  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  const json = await res.json();

  document.getElementById("aiBox").innerHTML = `
    <div style="padding:20px;background:#dcfce7;border-radius:12px;">
      <h3>投稿完了</h3>
      <p>${json.summary || ""}</p>
    </div>
  `;

  loadData();
}

document.addEventListener("DOMContentLoaded", loadData);