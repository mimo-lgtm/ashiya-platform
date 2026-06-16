const GAS_URL =
"https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let CURRENT_FILTER = "all";

/* ================= PAGE ================= */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(page=>{
      page.classList.remove("active");
    });

  const target =
    document.getElementById(id);

  if(target){
    target.classList.add("active");
  }

  window.scrollTo(0,0);
}

/* ================= LOAD ================= */

async function loadData(){

  try{

    const res =
      await fetch(GAS_URL);

    POSTS =
      await res.json();

    renderPR();

  }catch(err){

    console.log(err);

  }

}

/* ================= TREE ================= */

function openTheme(theme){

  showPage("assistant");

  const input =
    document.getElementById("ideaInput");

  if(input){

    input.value =
      "【テーマ】" +
      theme +
      "\n\n";

  }

}

/* ================= DETAIL ================= */

function openDetail(name){

  const box =
    document.getElementById("detailBox");

  if(!box) return;

  box.innerHTML = `
    <h2>${name}</h2>

    <p>
    このテーマに関する
    市民提案・AI分析を
    今後表示します。
    </p>
  `;

  showPage("detail");

}

/* ================= AI ================= */

async function runAI(){

  const input =
    document.getElementById("ideaInput");

  if(!input) return;

  const text =
    input.value.trim();

  if(!text){

    alert("意見を入力してください");

    return;
  }

  try{

    const res =
      await fetch(GAS_URL,{

        method:"POST",

        body:JSON.stringify({
          mode:"analysis",
          content:text
        })

      });

    const data =
      await res.json();

    const result =
      data.result || "";

    const title =
      data.title ||
      "市民提案";

    const summary =
      data.summary ||
      result.substring(0,200);

    const titleBox =
      document.getElementById("titleBox");

    const summaryBox =
      document.getElementById("summaryBox");

    const aiBox =
      document.getElementById("aiBox");

    if(titleBox){

      titleBox.innerHTML =
        title;

    }

    if(summaryBox){

      summaryBox.innerHTML =
        summary;

    }

    if(aiBox){

      aiBox.innerHTML =
        result;

    }

    const decision =
      document.getElementById("decisionBox");

    if(decision){

      decision.style.display =
        "block";

    }

  }catch(err){

    console.log(err);

    alert("AI分析エラー");

  }

}

/* ================= AI BACK ================= */

function backToAI(){

  const box =
    document.getElementById("decisionBox");

  if(box){

    box.style.display =
      "none";

  }

}

/* ================= SEND PR ================= */

async function sendToPR(){

  const category =
    document.getElementById("categorySelect")?.value || "";

  const title =
    document.getElementById("titleBox")?.innerText || "市民提案";

  const summary =
    document.getElementById("summaryBox")?.innerText || "";

  const content =
    document.getElementById("ideaInput")?.value || "";

  try{

    await fetch(GAS_URL,{

      method:"POST",

      body:JSON.stringify({

        mode:"post",

        category:category,

        title:title,

        summary:summary,

        content:content,

        merged:false

      })

    });

    alert("投稿しました");

    loadData();

    showPage("pullrequest");

  }catch(err){

    console.log(err);

    alert("投稿エラー");

  }

}

/* ================= FILTER ================= */

function filterPR(category){

  CURRENT_FILTER = category;

  renderPR();

}

/* ================= RENDER PR ================= */

function renderPR(){

  const box =
    document.getElementById("prList");

  if(!box) return;

  let data = POSTS;

  if(
    CURRENT_FILTER !== "all"
  ){

    data = POSTS.filter(item=>{

      return (
        item.category &&
        item.category.includes(
          CURRENT_FILTER
        )
      );

    });

  }

  box.innerHTML =
    data.map((item,index)=>{

      const mergedClass =
        item.merged
        ? "pr-merged"
        : "pr-unmerged";

      return `

      <div
        class="pr-card ${mergedClass}"
      >

        <div
          class="pr-title"
          onclick="togglePR(${index})"
        >

          ${item.title || "無題"}

        </div>

        <div
          class="pr-summary"
          id="pr-${index}"
        >

          ${item.summary || item.content || ""}

        </div>

      </div>

      `;

    }).join("");

}

/* ================= TOGGLE ================= */

function togglePR(index){

  const target =
    document.getElementById(
      `pr-${index}`
    );

  if(!target) return;

  if(
    target.style.display ===
    "block"
  ){

    target.style.display =
      "none";

  }else{

    target.style.display =
      "block";

  }

}

/* ================= START ================= */
window.showPage = showPage;
window.runAI = runAI;
window.sendToPR = sendToPR;
window.backToAI = backToAI;
window.openTree = openTree;

document.addEventListener( "DOMContentLoaded",

  ()=>{

    loadData();

  }

);