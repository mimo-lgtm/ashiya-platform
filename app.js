const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ===== DOM（安全） ===== */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");

/* ===== ツリー（固定） ===== */
const treeView = document.getElementById("treeView");

/* ===== イントロ（存在チェック） ===== */
const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

if (startBtn && intro) {
  startBtn.onclick = () => {
    intro.style.display = "none";
  };
}

/* ===== ロジックツリーは必ず描画（固定なのでJS不要でもOK） ===== */
if (treeView) {
  treeView.innerHTML = treeView.innerHTML || "ロジックツリー表示中";
}

/* ===== 投稿表示 ===== */
function addPost(text, ai) {
  if (!posts) return;

  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${ai?.category || "未分類"}</small>
  `;
  posts.prepend(div);
}

/* ===== カテゴリ安全化 ===== */
function normalize(cat) {
  if (!cat) return "市民ベネフィット";
  if (cat.includes("価値")) return "芦屋市の価値向上";
  if (cat.includes("ベネ")) return "市民ベネフィット";
  if (cat.includes("財政")) return "財政持続性";
  if (cat.includes("施設")) return "施設戦略";
  if (cat.includes("ガバナンス")) return "都市ガバナンス";
  return "市民ベネフィット";
}

/* ===== LLM（完全防御版） ===== */
async function callLLM(text) {
  try {
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
          { role: "user", content: (text || "").slice(0, 800) }
        ],
        temperature: 0.2
      })
    });

    const data = await res.json();

    let raw = data?.choices?.[0]?.message?.content || "";

    // 🔥 JSON抽出（最重要）
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return fallbackAI(text);
    }

    return JSON.parse(match[0]);

  } catch (e) {
    console.log("LLM error:", e);
    return fallbackAI(text);
  }
}

/* ===== フォールバック（絶対に死なない） ===== */
function fallbackAI(text) {
  return {
    category: "市民ベネフィット",
    intent: "自動分類（フォールバック）",
    summary: text.slice(0, 30),
    impact: "mid",
    policy_suggestion: "AI解析に失敗したため簡易分類"
  };
}

/* ===== 政策 ===== */
function renderPolicy(ai) {
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
  btn.onclick = async () => {

    const text = input?.value?.trim();
    if (!text) return;

    aiPanel.innerHTML = "分析中...";

    const ai = await callLLM(text);

    addPost(text, ai);

    aiPanel.innerHTML = `
      <div><b>分類:</b> ${ai.category}</div>
      <div><b>要約:</b> ${ai.summary}</div>
      <div><b>影響:</b> ${ai.impact}</div>
    `;

    renderPolicy(ai);

    input.value = "";
  };
}