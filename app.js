const GROQ_API_KEY = window.GROQ_API_KEY;

/* ================= DOM ================= */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");
const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ================= イントロ ================= */
if (startBtn && intro) {
  startBtn.onclick = () => {
    intro.style.display = "none";
  };
}

/* ================= 投稿 ================= */
function addPost(text, ai) {
  if (!posts) return;

  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${ai.category || "未分類"} / ${ai.impact || ""}</small>
  `;
  posts.prepend(div);
}

/* ================= AI呼び出し ================= */
async function callLLM(text) {

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",

      messages: [
        {
          role: "system",
          content: `
あなたは行政政策AIです。

必ず次のJSONだけ返してください：

{
  "category": "市民ベネフィット | 芦屋市の価値向上 | 財政持続性 | 施設戦略 | 都市ガバナンス",
  "summary": "短く要約",
  "impact": "low|mid|high",
  "policy_suggestion": "必ず具体的な政策案を書く"
}

・説明禁止
・JSON以外禁止
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

  /* ===== レスポンス処理（安全版） ===== */
  const data = await res.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("No content:", data);
    throw new Error("AI response empty");
  }

  console.log("RAW AI:", content);

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("JSON parse failed:", content);

    return {
      category: "市民ベネフィット",
      summary: text.slice(0, 30),
      impact: "mid",
      policy_suggestion: "（AI応答解析に失敗しました）"
    };
  }
}

/* ================= 表示 ================= */
function renderPolicy(ai) {
  if (!policyPanel) return;

  policyPanel.innerHTML = `
    <div style="white-space:pre-line">
【政策ドラフト】

■分類: ${ai.category || ""}
■要約: ${ai.summary || ""}

■提案:
${ai.policy_suggestion || ""}
    </div>
  `;
}

/* ================= 実行 ================= */
if (btn) {
  btn.onclick = async () => {

    const text = input?.value?.trim();
    if (!text) return;

    aiPanel.innerHTML = "分析中...";

    try {
      const ai = await callLLM(text);

      addPost(text, ai);

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