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
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "pullrequest") loadPR();
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
    alert("あなたの考
