const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ===== DOM安全取得 ===== */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");

const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ===== イントロ ===== */
if (startBtn) {
  startBtn.addEventListener("click", () => {
    if (intro) intro.style.display = "none";
  });
}

/* ===== ツリー状態 ===== */
const treeState = {
  "芦屋市の価値向上": 0,
  "市民ベネフィット": 0,
  "財政持続性": 0,
  "施設戦略": 0,
  "都市ガバナンス": 0
};

/* ===== 投稿表示 ===== */
function addPost(text, ai) {
  if (!posts) return;

  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${ai.category} / ${ai.impact}</small>
  `;
  posts.prepend(div);
}

/* ===== カテゴリ正規化 ===== */
function normalizeCategory(cat) {
  if (!cat) return "市民ベネフィット";
  if (cat.includes("価値")) return "芦屋市の価値向上";
  if (cat.includes("ベネ")) return "市民ベネフィット";
  if (cat.includes("財政")) return "財政持続性";
  if (cat.includes("施設")) return "施設戦略";
  if (cat.includes("ガバナンス")) return "都市ガバナンス";
  return "市民ベネフィット";
}

/* ===== ツリー更新 ===== */
function updateTree(category) {
  const key = normalizeCategory(category);
  if (treeState[key] !== undefined) treeState[key]++;
}

/* ===== AI呼び出し（完全耐性版） ===== */
async function callLLM(text) {
  const safeText = (text || "").slice(0, 800);

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
必ずJSONのみ返す：

{
  "category": "価値向上|市民ベネフィット|財政持続性|施設戦略|都市ガバナンス",
  "intent": "",
  "summary": "",
  "impact": "low|mid|high",
  "policy_suggestion": ""
}
`
        },
        { role: "user", content: safeText }
      ],
      temperature: 0.2
    })
  });

  const data = await res.json();

  let raw = data?.choices?.[0]?.message?.content || "";

  raw = raw.replace(/```json|```/g, "").trim();

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Invalid AI response");
  }

  return JSON.parse(match[0]);
}

/* ===== 政策生成 ===== */
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
      aiPanel.innerHTML = "解析エラー（AI応答異常）";
    }

    input.value = "";
  });
}