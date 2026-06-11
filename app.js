const GROQ_API_KEY = window.GROQ_API_KEY;

/* ================= DOM ================= */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const policyPanel = document.getElementById("policyPanel");
const intro = document.getElementById("introScreen");
const startBtn = document.getElementById("startBtn");

/* ================= 追加①（ここ！最初に入れる） ================= */
console.log("GROQ KEY:", GROQ_API_KEY);

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
    <small>${ai.category || "未分類"}</small>
  `;
  posts.prepend(div);
}

/* ================= AI ================= */
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
あなたは行政AIです。

必ずJSONだけ返してください：

{
  "category": "市民ベネフィット",
  "summary": "短く要約",
  "impact": "low|mid|high",
  "policy_suggestion": "具体的な政策案"
}

余計な文章禁止
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

  /* ================= 追加②（ここ！レスポンス確認） ================= */
  const rawText = await res.text();
  console.log("RAW RESPONSE:", rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error("JSON parse failed");
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No AI content");
  }

  return JSON.parse(content);
}

/* ================= 政策表示 ================= */
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
      aiPanel.innerHTML = "解析エラー（原因ログ確認）";
    }

    input.value = "";
  };
}