function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
let PR = [];

function goAI(topic){
  showPage('ai');
  document.getElementById("aiInput").value = topic;
}

function aiRun(){

  const text = document.getElementById("aiInput").value;
  const cat = document.getElementById("aiCategory").value;

  const summary = text.slice(0,200);
  const title = text.split("\n")[0];

  document.getElementById("aiResult").innerHTML = `
    <h3>AI結果</h3>
    <p>${text}</p>

    <h4>200字要約</h4>
    <p>${summary}</p>

    <h4>推奨タイトル</h4>
    <p>${title}</p>

    <button onclick="addPR('${cat}','${summary}','${title}')">A：PR追加</button>
    <button onclick="showPage('ai')">B：修正</button>
  `;
}

function addPR(cat, summary, title){

  PR.push({
    cat,
    summary,
    title,
    status:"red"
  });

  renderPR();
  showPage("pr");
}

function renderPR(list=PR){

  document.getElementById("prList").innerHTML =
    list.map(p=>`
      <div class="pr-item">
        <div class="${p.status=='red'?'badge-red':'badge-green'}">
          ${p.status=='red'?'🔴 未統合':'🟢 統合済'}
        </div>

        <b>${p.title}</b>
        <p>${p.summary}</p>
        <small>${p.cat}</small>
      </div>
    `).join("");
}

function filterPR(cat){
  renderPR(PR.filter(p=>p.cat===cat));
}
/* =========================
   ロジックツリー
========================= */

function openCategory(type){

  const map = {
    value: [
      "次世代教育ブランド",
      "EdTech連携",
      "景観美化",
      "公園芝生化"
    ],
    benefit: [
      "多世代交流",
      "サードプレイス"
    ],
    finance: [
      "施設収益化",
      "クラウドファンディング"
    ],
    strategy: [
      "起業支援",
      "コワーキング"
    ],
    resilience: [
      "防災システム",
      "都市指令室"
    ]
  };

  const list = map[type] || [];

  document.getElementById("treeDetail").innerHTML = `
    <div class="card">
      <h2>詳細</h2>
      ${list.map(x=>`
        <div class="item" onclick="openIdea('${x}')">
          ${x}
        </div>
      `).join("")}
    </div>
  `;
}

/* 選択されたテーマ */
function openIdea(text){

  document.getElementById("treeDetail").innerHTML = `
    <div class="card">
      <h3>${text}</h3>
      <p>このテーマについて意見を投稿できます</p>

      <button class="big" onclick="goAI('${text}')">
        AI壁打ちへ
      </button>
    </div>
  `;
}

function goAI(text){
  showPage("ai");
  document.getElementById("input").value =
    `テーマ：${text}\n\nあなたの考えを教えてください`;
}

/* =========================
   AI壁打ち
========================= */

function aiProcess(){

  const text = document.getElementById("input").value;
  const category = document.getElementById("category").value;

  // 擬似AI（後でGROQ差し替え）
  const summary = text.slice(0,200);
  const title = text.split("\n")[0].slice(0,20) || "市民提案";

  document.getElementById("aiResult").innerHTML = `
    <div class="card">
      <h3>AI分析結果（500字想定）</h3>
      <p>${text}</p>

      <hr>

      <h4>200字要約</h4>
      <p>${summary}</p>

      <h4>推奨タイトル</h4>
      <p>${title}</p>

      <button class="big" onclick="choiceA()">
        A：このまま投稿
      </button>

      <button class="big" onclick="choiceB()">
        B：修正する
      </button>
    </div>
  `;
}

/* A：PRへ */
function choiceA(){

  const text = document.getElementById("input").value;
  const category = document.getElementById("category").value;

  const box = document.getElementById("prList");

  box.innerHTML += `
    <div class="pr-box">
      <div class="status red">🔴 未統合</div>
      <h3>${category}</h3>
      <p>${text.slice(0,200)}</p>
    </div>
  `;

  showPage("pr");
}

/* B：戻る */
function choiceB(){
  showPage("ai");
}