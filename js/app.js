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

    renderPR();
    renderTree();

  }catch(e){

    console.log("LOAD ERROR",e);

  }

}

/* ================= TREE ================= */

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

  box.innerHTML = POSTS.map(p => `
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

});