const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

/* ================= STATE ================= */
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

    // 🔥重要：中身リセット
    p.querySelectorAll("*").forEach(el=>{
      if(el.id === "treeData") return;
      if(el.id === "timeline") return;
      if(el.id === "prList") return;
      if(el.id === "resultBox") return;
      if(el.id === "titleBox") return;
      if(el.id === "summaryBox") return;
    });
  });

  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}
  // ★追加：AIページ以外の表示バグ防止
  if(id !== "assistant"){
    const r = document.getElementById("resultBox");
    if(r) r.innerHTML = "";

    const t = document.getElementById("titleBox");
    if(t) t.innerText = "";

    const s = document.getElementById("summaryBox");
    if(s) s.innerText = "";
  }
}

/* ================= LOAD ================= */
async function loadData() {
  try {
    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderTree();
    renderPR();
    renderTimeline();

  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}

/* ================= TREE ================= */
function renderTree() {
  const box = document.getElementById("treeData");
  if (!box) return;

  const categoryMap = {};

  POSTS.forEach(p => {
    const cat = p.category || "未分類";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  let html = "";

  Object.keys(categoryMap).forEach(cat => {
    html += `
      <div class="card">
        <b>${cat}</b><br>
        統合提案数：${categoryMap[cat]}件
      </div>
    `;
  });

  box.innerHTML = html;
}

/* ================= PR ================= */
function renderPR() {
  const box = document.getElementById("prList");
  if (!box) return;

  const order = [
    "① 芦屋市の価値向上",
    "② 市民ベネフィット",
    "③ 財政持続性",
    "④ 戦略性",
    "⑤ 都市強靭性"
  ];

  const grouped = {};

  POSTS.forEach(p => {
    const cat = p.category || "未分類";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  let html = "";

  order.forEach(cat => {
    const list = grouped[cat];
    if (!list) return;

    html += `<div class="card"><h2>${cat}</h2></div>`;

    list.forEach(p => {
      html += `
        <div class="card">
          <div style="display:flex;justify-content:space-between;">
            <b>${p.title || ""}</b>
            <span style="
              padding:3px 10px;
              border-radius:12px;
              font-size:12px;
              background:${p.merged ? "#2ecc71" : "#e74c3c"};
              color:#fff;
            ">
              ${p.merged ? "統合済" : "未統合"}
            </span>
          </div>
        </div>
      `;
    });
  });

  box.innerHTML = html;
}

/* ================= TREE DETAIL ================= */
function openDetail(id) {
  const box = document.getElementById("detailBox");
  if (!box) return;

  const map = {
    ehon: "AIと絵本を融合した教育拠点構想"
  };

  box.innerHTML = `
    <div class="card">
      <h2>${map[id] || ""}</h2>
      <p>詳細分析は今後拡張予定</p>
    </div>
  `;

  showPage("detail");
}

/* ================= AI ================= */
async function runAI(){

  const category =
    document.getElementById("categorySelect")?.value || "未分類";

  const text =
    document.getElementById("ideaInput")?.value || "";

  const resultBox = document.getElementById("resultBox");
  const titleBox = document.getElementById("titleBox");
  const summaryBox = document.getElementById("summaryBox");

  try{

    const res = await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify({
        category,
        content:text
      })
    });

    const data = await res.json();

    const aiText = data?.result || "AI応答なし";

    if(resultBox){
      resultBox.innerHTML = aiText.replace(/\n/g,"<br>");
    }

    if(titleBox) titleBox.innerText = "AI生成タイトル";
    if(summaryBox) summaryBox.innerText = aiText.slice(0,120);

    const box = document.getElementById("decisionBox");
    if(box) box.style.display = "block";

  }catch(e){
    console.log("AI ERROR",e);

    if(resultBox){
      resultBox.innerHTML = "エラー：AI取得失敗";
    }
  }
}
/* ================= SEND ================= */
async function sendToPR() {

  const input = document.getElementById("ideaInput");
  const result = document.getElementById("resultBox");

  try {

    await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        title: "AI生成",
        category: selectedCategory,
        content: input?.value || "",
        summary: result?.innerText || ""
      })
    });

    loadData();

  } catch (e) {
    console.log("POST ERROR", e);
  }
}

/* ================= BACK ================= */
function backToAI() {
  const box = document.getElementById("decisionBox");
  if (box) box.style.display = "none";
}

/* ================= TIMELINE ================= */
function renderTimeline() {
  const box = document.getElementById("timeline");
  if (!box) return;

  const timeline = [
    "2026/05 市民参加型構想スタート",
    "2026/06 AI分析導入",
    "2026/07 政策統合フェーズ"
  ];

  box.innerHTML = timeline
    .map(t => `<div class="card">${t}</div>`)
    .join("");
}