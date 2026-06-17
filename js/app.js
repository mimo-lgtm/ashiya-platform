/* =========================================
   設定
========================================= */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzopgSpPPozJ3Q6J2fDSrI8zE0iIlgK-VLqTixe4VL9dPtzvpOZ9UOyPjK8yPQSA6n7vg/exec";

let POSTS = [];
let CURRENT_CATEGORY = "① 芦屋市の価値向上";

let LAST_AI_TEXT = "";
let LAST_SUMMARY = "";
let LAST_TITLE = "";

/* =========================================
   初期ロード
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadData();

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

/* =========================================
   ページ切り替え
========================================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) =>
    p.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");

  if (id === "pullrequest") {
    loadPR();
  }
}
window.showPage = showPage;

/* =========================================
   データロード（PR用）
========================================= */
async function loadData() {
  try {
    const res = await fetch(GAS_URL);
    POSTS = await res.json();
    renderPR();
  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}

/* =========================================
   AI壁打ち（analysis → GAS）
========================================= */
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
      headers: {
        "Content-Type": "application/json", // ★必須
      },
      body: JSON.stringify({
        mode: "analysis",
        category,
        content: text,
      }),
    });

    const data = await res.json();

    // GAS が返す形式: { result, summary, title }
    const result = (data.result || "").slice(0, 500);
    const summary = data.summary || (data.result || "").slice(0, 200);
    const title = data.title || "市民提案";

    LAST_AI_TEXT = result;
    LAST_SUMMARY = summary;
    LAST_TITLE = title;

    document.getElementById("aiBox").innerHTML = `<p>${result}</p>`;
    document.getElementById("decisionBox").style.display = "block";
    document.getElementById("summaryBlock").style.display = "none";
  } catch (e) {
    console.log("AI ERROR", e);
    alert("AI分析でエラーが発生しました（GASに届いていない可能性があります）。");
  }
}
window.runAI = runAI;

/* =========================================
   要約とタイトルを表示
========================================= */
function confirmSummary() {
  document.getElementById("summaryBox").innerText = LAST_SUMMARY;
  document.getElementById("titleBox").innerText = LAST_TITLE;
  document.getElementById("summaryBlock").style.display = "block";
}
window.confirmSummary = confirmSummary;

/* =========================================
   書き直し
========================================= */
function backToAI() {
  document.getElementById("decisionBox").style.display = "none";
  document.getElementById("summaryBlock").style.display = "none";
}
window.backToAI = backToAI;

/* =========================================
   PULL REQUESTへ投稿（post → GAS）
========================================= */
async function sendToPR() {
  const content = document.getElementById("ideaInput")?.value || "";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ★必須
      },
      body: JSON.stringify({
        mode: "post",
        category: CURRENT_CATEGORY,
        title: LAST_TITLE,
        summary: LAST_SUMMARY,
        content: content,
        merged: false,
      }),
    });

    const json = await res.json();

    if (json.status === "saved") {
      alert("PULL REQUESTに投稿しました。");
      loadData();
      showPage("pullrequest");
    } else {
      alert("投稿時にエラーが発生しました（GASの返答が不正）。");
    }
  } catch (e) {
    console.log("POST ERROR", e);
    alert("投稿時にエラーが発生しました（GASに届いていません）。");
  }
}
window.sendToPR = sendToPR;

/* =========================================
   PULL REQUEST 表示
========================================= */
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

/* =========================================
   ロジックツリー → 詳細ページ
========================================= */
function openDetail(theme) {
  const box = document.getElementById("detailBox");

  const dummy = {
    次世代教育ブランド:
      "次世代教育ブランドに関する統合済み提案の要約をここに表示します。",
    EdTech連携: "EdTech連携に関する統合済み提案の要約をここに表示します。",
    景観美化: "景観美化に関する統合済み提案の要約をここに表示します。",
    公園芝生化: "公園芝生化に関する統合済み提案の要約をここに表示します。",
    多世代交流: "多世代交流に関する統合済み提案の要約をここに表示します。",
    サードプレイス:
      "サードプレイスに関する統合済み提案の要約をここに表示します。",
    施設収益化:
      "施設収益化に関する統合済み提案の要約をここに表示します。",
    起業支援: "起業支援に関する統合済み提案の要約をここに表示します。",
    防災システム:
      "防災システムに関する統合済み提案の要約をここに表示します。",
  };

  const text = dummy[theme] || "このテーマに関する統合済み提案はまだありません。";

  box.innerHTML = `
    <h2>${theme}</h2>
    <p>${text}</p>

    <button class="big-button" onclick="goToAssistantWithTheme('${theme}')">
      この分野であなたの意見を聞かせてください（AI壁打ちへ）
    </button>
  `;

  showPage("detail");
}
window.openDetail = openDetail;

/* =========================================
   詳細 → AI壁打ちへ
========================================= */
function goToAssistantWithTheme(theme) {
  showPage("assistant");
  const input = document.getElementById("ideaInput");
  if (input) {
    input.value = `【テーマ】${theme}\n\nあなたの考えを自由に書いてください。`;
  }
}
window.goToAssistantWithTheme = goToAssistantWithTheme;
