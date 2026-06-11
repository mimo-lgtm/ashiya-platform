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
  startBtn.onclick = () => {
    intro.style.display = "none";
  };
}

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

/* ===== ツリー ===== */
const treeState = {
  "芦屋市の価値向上": 0,
  "市民ベネフィット": 0,
  "財政持続性": 0,
  "施設戦略": 0,
  "都市ガバナンス": 0
};

function normalize(cat) {
  if (!cat) return "市民ベネフィット";
  if (cat.includes("価値")) return "芦屋市の価値向上";
  if (cat.includes("ベネ")) return "市民ベネフィット";
  if (cat.includes("財政")) return "財政持続性";
  if (cat.includes("施設")) return "施設戦略";
  if (cat.includes("ガバナンス")) return "都市ガバナンス";
  return "市民ベネフィット";
}

function updateTree(category) {
  const key = normalize(category);
  if (treeState[key] !== undefined) treeState[key]++;
}

/* ===== AI（完全安定版） ===== */
async function callLLM(text) {

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",

      // 🔥 JSON強制
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: `
あなたは行政政策AIです。

必ず以下のJSONだけを返してください：

{
  "category": "芦屋市の価値向上 | 市民ベネフィット | 財政持続性 | 施設戦略 | 都市ガバナンス",
  "summary": "短い要約",
  "impact": "low|mid|high",
  "policy_suggestion": "具体的政策提案"
}

余計な文章は禁止
`
        },
        {
          role: "user",
          content: (text || "").slice(0, 800)
        }
      ],
      temperature: 0.2
    })
  });

  const data = await res.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No AI response");
  }

  return JSON.parse(content);
}

/* ===== 政策表示 ===== */
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

    try {
      const ai = await callLLM(text);

      addPost(text, ai);
      updateTree(ai.category);

      aiPanel.innerHTML = `
        <div><b>分類:</b> ${ai.category}</div>
        <div><b>要約:</b> ${ai.summary}</div>
        <div><b>影響:</b> ${ai.impact}</div>
      `;

      renderPolicy(ai);

    } catch (e) {
      console.error(e);
      aiPanel.innerHTML = "解析エラー（AI応答失敗）";
    }

    input.value = "";
  };
}