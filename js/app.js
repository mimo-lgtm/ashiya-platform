const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ================= CATEGORY ================= */
let currentCategory = null;

function setCat(cat){
  currentCategory = cat;
}

/* ================= AI ================= */
function runAI(){

  const input = document.getElementById("input").value;
  const box = document.getElementById("aiBox");

  if(!input){
    box.innerHTML = "入力してください";
    return;
  }

  box.innerHTML = `
    <h3>AI結果</h3>
    <p>${input}</p>

    <button onclick="submitIdea()" class="big-button">
      A：PRへ送信
    </button>

    <button onclick="resetAI()" class="big-button">
      B：戻る
    </button>
  `;
}

function resetAI(){
  document.getElementById("aiBox").innerHTML = "結果表示エリア";
}

/* ================= GAS ================= */
async function submitIdea(){

  const data = {
    title: "AI提案",
    category: currentCategory || "未分類",
    content: document.getElementById("input").value,
    merged: false
  };

  await fetch(GAS_URL,{
    method:"POST",
    body:JSON.stringify(data)
  });

  load();
}

/* ================= LOAD ================= */
async function load(){

  const res = await fetch(GAS_URL);
  const data = await res.json();

  document.getElementById("data").innerHTML =
    data.map(d=>{

      const cls = d.merged ? "pr-merged" : "pr-unmerged";

      return `
        <div class="placeholder-card ${cls}">
          <b>${d.title || ""}</b><br>
          ${d.category || ""}<br>
          ${d.content || ""}<br>
          ${d.merged ? "統合済" : "未統合"}
        </div>
      `;
    }).join("");
}

load();