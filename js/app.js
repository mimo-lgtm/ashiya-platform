/* ================================
   設定
================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let CURRENT_CATEGORY = "① 芦屋市の価値向上";

let LAST_AI_TEXT = "";
let LAST_SUMMARY = "";
let LAST_TITLE = "";

/* ================================
   初期ロード
================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  /* カテゴリーボタン（AI壁打ち） */
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      CURRENT_CATEGORY = btn.dataset.cat;
      const sel = document.getElementById("categorySelect");
      if (sel) sel.value = CURRENT_CATEGORY;
    });
  });
});

/* ================================
   ページ切り替え
================================ */
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}
window.showPage = showPage;

/* ================================
   データロード（PR用）
================================ */
async function loadData() {
  try {
    const res = await fetch(GAS_URL);
    POSTS = await res.json();
    renderPR();
  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}

/* ================================
   AI壁打ち（GROQ → GAS）
================================ */
async function runAI() {
  const text = document.getElementById("ideaInput")?.value.trim() || "";
  const category = CURRENT_CATEGORY;

  if (!text) {
    alert("あなたの考えを入力してください。");
    return;
  }

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        mode: "analysis",
        category,
        content: text,
      }),
    });

    const data = await res.json();

    const result = (data.result || "").slice(0, 500);
    const summary = data.summary || (data.result || "").slice(0, 200);
    const title = data.title || "市民提案";

    LAST_AI_TEXT = result;
    LAST_SUMMARY = summary;
    LAST_TITLE = title;

    const aiBox = document.getElementById("aiBox");
    aiBox.innerHTML = `<p>${result}</p>`;

    document.getElementById("decisionBox").style.display = "block";
    document.getElementById("summaryBlock").style.display = "none";
  } catch (e) {
    console.log("AI ERROR", e);
    alert("AI分析でエラーが発生しました。");
  }
}
window.runAI = runAI;

/* ================================
   A. 要約とタイトルを表示
================================ */
function confirmSummary() {
  document.getElementById("summaryBox").innerText = LAST_SUMMARY;
  document.getElementById("titleBox").innerText = LAST_TITLE;
  document.getElementById("summaryBlock").style.display = "block";
}
window.confirmSummary = confirmSummary;

/* ================================
   B. 書き直し
================================ */
function backToAI() {
  document.getElementById("decisionBox").style.display = "none";
  document.getElementById("summaryBlock").style.display = "none";
}
window.backToAI = backToAI;

/* ================================
   PULL REQUESTへ投稿
================================ */
async function sendToPR() {
  const content = document.getElementById("ideaInput")?.value || "";

  try {
    await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        mode: "post",
        category: CURRENT_CATEGORY,
        title: LAST_TITLE,
        summary: LAST_SUMMARY,
        content: content,
        merged: false,
      }),
    });

    alert("PULL REQUESTに投稿しました。");
    loadData();
    showPage("pullrequest");
  } catch (e) {
    console.log("POST ERROR", e);
    alert("投稿時にエラーが発生しました。");
  }
}
window.sendToPR = sendToPR;

/* ================================
   PULL REQUEST 表示
================================ */
function renderPR() {
  const box = document.getElementById("prList");
  const detail = document.getElementById("prDetail");

  if (!box) return;
  if (detail) detail.style.display = "none";

  const grouped = {};
  POSTS.forEach((p) => {
    const cat = p.category || "未分類";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  document.querySelectorAll("[data-pr-cat]").forEach((btn) => {
    btn.onclick = () => {
      const cat = btn.dataset.prCat;
      const list = grouped[cat] || [];

      if (!list.length) {
        box.innerHTML = `<p>このカテゴリーにはまだ投稿がありません。</p>`;
        if (detail) detail.style.display = "none";
        return;
      }

      box.innerHTML = list
        .map(
          (p, idx) => `
        <div class="pr-row" data-pr-index="${idx}" data-pr-cat="${cat}">
          <div>
            <b>${p.title || "無題"}</b><br>
            <span style="font-size:12px;color:#666;">${p.summary || ""}</span>
          </div>
          <div>${p.merged ? "🟢 統合済" : "🔴 未統合"}</div>
        </div>
      `
        )
        .join("");

      box.querySelectorAll(".pr-row").forEach((row) => {
        row.onclick = () => {
          const i = Number(row.dataset.prIndex);
          const c = row.dataset.prCat;
          const item = (grouped[c] || [])[i];

          document.getElementById("prDetailTitle").innerText =
            item.title || "無題";
          document.getElementById("prDetailSummary").innerText =
            item.summary || item.content || "";
          detail.style.display = "block";
        };
      });
    };
  });
}
window.renderPR = renderPR;

/* ================================
   ロジックツリー → 詳細ページ
================================ */
function openDetail(theme) {
  const box = document.getElementById("detailBox");

  const dummy = {
    "次世代教育ブランド":
      "芦屋市を次世代教育のブランド都市として位置づけ、駅前公共施設を学びのハブとする構想です。",
    EdTech連携:
      "EdTech企業との連携により、最新のデジタル教材や学習プラットフォームを市民に開放します。",
    景観美化: "駅前エリアの景観を整備し、市民と来訪者にとって心地よい空間をつくる提案です。",
    公園芝生化: "芝生化により、子どもから大人までくつろげる公共空間を創出します。",
    多世代交流: "世代を超えた交流を促すプログラムや空間設計に関するアイデアです。",
    サードプレイス:
      "家庭でも職場でもない、第三の居場所としての公共施設のあり方を探ります。",
    施設収益化:
      "カフェやシェアラウンジ等を通じて、施設の自立的な収益モデルを検討します。",
    起業支援:
      "スタートアップやスモールビジネスの実験・発表の場として活用する構想です。",
    防災システム:
      "平時は学びと交流、災害時は防災拠点として機能するデュアルユースの提案です。",
  };

  const text = dummy[theme] || "このテーマに関する市民提案を今後追加します。";

  box.innerHTML = `
    <h2>${theme}</h2>
    <p>${text}</p>
    <button class="big-button" onclick="goToAssistantWithTheme('${theme}')">
      このテーマについて意見を投稿する（AI壁打ちへ）
    </button>
  `;

  showPage("detail");
}
window.openDetail = openDetail;

/* ================================
   詳細 → AI壁打ちへ
================================ */
function goToAssistantWithTheme(theme) {
  showPage("assistant");
  const input = document.getElementById("ideaInput");
  if (input) {
    input.value = `【テーマ】${theme}\n\nあなたの考えを自由に書いてください。`;
  }
}
window.goToAssistantWithTheme = goToAssistantWithTheme;
