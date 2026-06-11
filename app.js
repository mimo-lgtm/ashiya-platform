const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ===== DOM ===== */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");
const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ===== イントロ ===== */
if (startBtn && intro) {
  startBtn.onclick = () => intro.style.display = "none";
}

/* ===== ロジックツリーは固定なので何もしない ===== */

/* ===== 投稿 ===== */
function addPost(text, ai) {
  if (!posts) return;

  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${ai.category}</small>
  `;
  posts.prepend(div);
}

/* ===== カテゴリ ===== */
function normalize(cat) {
  if (!cat) return "市民ベネフィット";
  if (cat.includes("価値")) return "芦屋市の価値向上";
  if (cat.includes("ベネ")) return "市民ベネフィット";
  if (cat.includes("財政")) return "財政持続性";
  if (cat.includes("施設")) return "施設戦略";
  if (cat.includes("ガバナンス")) return "都市ガバナンス";
  return "市民ベネフィット";
}

/* ===== AI（完全防御版） ===== */
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
必ずJSONだけ返す：
{
  "category": "価値向上|市民ベネフィット|財政持続性|施設戦略|都市ガバナンス",
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

    console.log("RAW AI:", raw); // ← デバッグ重要

    // JSON抽出
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return fallback(text);
    }

    return JSON.parse(match[0]);

  } catch (e) {
    console.log("AI ERROR:", e);
    return fallback(text);
  }
}

/* ===== フォールバック（絶対停止防止） ===== */
function fallback(text) {
  return {
    category: "市民ベネフィット",
    summary: text.slice(0, 30),
    impact: "mid",
    policy_suggestion: "AI解析失敗（自動補完）"
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