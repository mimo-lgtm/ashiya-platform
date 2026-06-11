const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ===== DOM ===== */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");
const treeView = document.getElementById("treeView");

const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ===== イントロ制御 ===== */
startBtn.addEventListener("click", () => {
  intro.style.display = "none";
});

/* ===== ナビスクロール ===== */
function scrollToSection(id) {
  const el =
    document.getElementById(id + "Section") ||
    document.getElementById(id);

  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ===== ツリー ===== */
const treeState = {
  "安全・安心設計": 0,
  "多世代交流空間": 0,
  "教育・知的機能": 0,
  "収益・持続性": 0,
  "都市戦略": 0
};

function renderTree() {
  treeView.innerHTML = Object.entries(treeState)
    .map(([k, v]) => `<div>${k}：${v}</div>`)
    .join("");
}

/* ===== 投稿 ===== */
function addPost(text, ai) {
  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${ai.category} / ${ai.impact}</small>
  `;
  posts.prepend(div);
}

/* ===== ツリー更新 ===== */
function updateTree(category) {
  if (treeState[category] !== undefined) {
    treeState[category]++;
  }
  renderTree();
}

/* ===== LLM（GROQ） ===== */
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
あなたは行政政策AI。
必ずJSONのみ返す：

{
  "category": "安全・安心設計|多世代交流空間|教育・知的機能|収益・持続性|都市戦略",
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

  const raw = data.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}

/* ===== 政策 ===== */
function generatePolicy(ai) {
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
btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  aiPanel.innerHTML = "分析中...";

  try {
    const ai = await callLLM(text);

    addPost(text, ai);
    updateTree(ai.category);

    aiPanel.innerHTML = `
      <div><b>分類:</b> ${ai.category}</div>
      <div><b>意図:</b> ${ai.intent}</div>
      <div><b>要約:</b> ${ai.summary}</div>
      <div><b>影響:</b> ${ai.impact}</div>
    `;

    generatePolicy(ai);

  } catch (e) {
    aiPanel.innerHTML = "解析エラー";
    console.error(e);
  }

  input.value = "";
});

renderTree();