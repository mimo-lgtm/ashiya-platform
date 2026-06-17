const GAS_URL = "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

/* ================= NAV ================= */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

/* ================= LOAD ================= */
async function loadData(){
  try{
    const res = await fetch(GAS_URL);
    POSTS = await res.json();

    renderPR();

  }catch(e){
    console.log("LOAD ERROR", e);
  }
}

/* ================= PR ================= */
function renderPR(){

  const box = document.getElementById("prList");
  if(!box) return;

  const cats = {
    value: "① 芦屋市の価値向上",
    benefit: "② 市民ベネフィット",
    finance: "③ 財政持続性",
    strategy: "④ 戦略性",
    resilience: "⑤ 都市強靭性"
  };

  let html = "";

  Object.keys(cats).forEach(key => {

    const list = POSTS.filter(p => p.category === key);

    html += `<h2>${cats[key]}</h2>`;

    list.forEach(p => {
      html += `
        <div class="placeholder-card">
          <b>${p.title || "無題"}</b><br>
          ${p.content || ""}
        </div>
      `;
    });

  });

  box.innerHTML = html;
}

/* ================= AI ================= */
async function aiRun(){

  const text = document.getElementById("aiInput").value;
  const cat = document.getElementById("aiCategory").value;

  const res = await fetch(GAS_URL, {
    method:"POST",
    body: JSON.stringify({
      category: cat,
      content: text
    })
  });

  const json = await res.json();

  document.getElementById("aiResult").innerHTML = `
    <h3>AI結果</h3>
    <p>${json.result || text}</p>

    <h3>要約</h3>
    <p>${(json.result || text).slice(0,200)}</p>

    <h3>タイトル</h3>
    <p>AI生成タイトル</p>
  `;
}

/* ================= TREE CLICK ================= */
function goAI(text){
  showPage("ai");
  document.getElementById("aiInput").value = text;
}