const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ===== DOM安全取得（重要） ===== */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");
const treeView = document.getElementById("treeView");

const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ===== イントロ安全制御 ===== */
if (startBtn && intro) {
  startBtn.addEventListener("click", () => {
    intro.style.display = "none";
  });
}

/* ===== ツリー ===== */
const treeState = {
  "芦屋市の価値向上": 0,
  "市民ベネフィット": 0,
  "財政持続性": 0,
  "施設戦略": 0,
  "都市ガバナンス": 0
};

function renderTree() {
  if (!treeView) return;

  treeView.innerHTML = Object.entries(treeState)
    .map(([k,v]) => `<div>${k}：${v}</div>`)
    .join("");
}

/* ===== 投稿 ===== */
function addPost(text, ai) {
  if (!posts) return;

  const div = document.createElement("div");
  div.innerHTML = `<b>${text}</b><br><small>${ai.category}</small>`;
  posts.prepend(div);
}

/* ===== 正規化 ===== */
function normalizeCategory(cat) {
  if (!cat) return "市民ベネフィット";
  if (cat.includes("価値")) return "芦屋市の価値向上";
  if (cat.includes("ベネ")) return "市民ベネフィット";
  if (cat.includes("財政")) return "財政持続性";
  if (cat.includes("施設")) return "施設戦略";
  if (cat.includes("ガバナンス")) return "都市ガバナンス";
  return "市民ベネフィット";
}

function updateTree(category) {
  const key = normalizeCategory(category);
  if (treeState[key] !== undefined) treeState[key]++;
  renderTree();
}

/* ===== GROQ（完全防御版） ===== */
async function callLLM(text) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
必ずJSONのみ：

{
  "category": "価値向上|市民ベネフィット|財政持続性|施設戦略|都市ガバナンス",
  "intent": "",
  "summary": "",
  "impact": "low|mid|high",
  "policy_suggestion": ""
}
`
        },
        { role: "user", content: text }
      ],
      temperature: 0.2
    })
  });

  const data = await res.json();

  let raw = data?.choices?.[0]?.message?.content || "";

  // 🔥 防御1
  raw = raw.replace(/```json|```/g, "").trim();

  // 🔥 防御2（最重要）
  const match = raw.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("No JSON returned");
  }

  return JSON.parse(match[0]);
}

/* ===== 政策 ===== */
function generatePolicy(ai) {
  if (!policyPanel) return;

  policyPanel.innerHTML = `
    <div style="white-space:pre-line">
【政策ドラフト】

■分類: ${ai.category}
■要約: ${ai.summary}

■提案:
${ai.policy_suggestion}
    </div>
  `;
}

/* ===== 実行 ===== */
if (btn) {
  btn.addEventListener("click", async () => {

    const text = input?.value?.trim();
    if (!text) return;

    aiPanel.innerHTML = "分析中...";

    try {
      const ai = await callLLM(text);

      addPost(text, ai);
      updateTree(ai.category);

      aiPanel.innerHTML = `
        <div><b>分類:</b> ${ai.category}</div>
        <div><b>要約:</b> ${ai.summary}</div>
        <div><b>影響:</b> ${ai.impact}</div>
      `;

      generatePolicy(ai);

    } catch (e) {
      console.error(e);
      aiPanel.innerHTML = "解析エラー（AI応答不正）";
    }

    input.value = "";
  });
}

/* 初期描画 */
renderTree();