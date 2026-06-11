const GROQ_API_KEY = window.GROQ_API_KEY;

/* ================= DOM ================= */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const aiPanel = document.getElementById("aiPanel");
const treePanel = document.querySelector(".tree");

/* ================= ロジックツリー（初期状態） ================= */
let logicTree = {
  "芦屋市の価値向上": [],
  "市民ベネフィット": [],
  "財政持続性": [],
  "施設戦略": [],
  "都市ガバナンス": []
};

/* ================= 投稿表示 ================= */
function addPost(text) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${text}</b>`;
  posts.prepend(div);
}

/* ================= ツリー描画 ================= */
function renderTree() {
  if (!treePanel) return;

  let html = `市民政策ロジックツリー（Vision）

コストセンターからプロフィットセンターへ

`;

  Object.keys(logicTree).forEach(key => {
    html += `\n${key}\n`;
    logicTree[key].forEach(item => {
      html += `・${item}\n`;
    });
  });

  treePanel.innerText = html;
}

/* ================= 分類ロジック（簡易AI） ================= */
function classify(text) {

  if (text.includes("教育") || text.includes("図書館")) return "芦屋市の価値向上";
  if (text.includes("交流") || text.includes("カフェ")) return "市民ベネフィット";
  if (text.includes("収益") || text.includes("ふるさと")) return "財政持続性";
  if (text.includes("施設")) return "施設戦略";
  if (text.includes("防災") || text.includes("自治")) return "都市ガバナンス";

  return "市民ベネフィット";
}

/* ================= 投稿→ツリー統合 ================= */
function integrateToTree(text) {

  const category = classify(text);

  if (!logicTree[category]) {
    logicTree[category] = [];
  }

  logicTree[category].push(text);

  renderTree();
}

/* ================= AI（失敗しても動く設計） ================= */
async function callLLM(text) {

  try {
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
あなたは行政AI。
JSONで返す：
{
 "category": "...",
 "summary": "...",
 "policy": "..."
}
`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2
      })
    });

    if (!res.ok) throw new Error("API ERROR");

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) throw new Error("NO CONTENT");

    return JSON.parse(content);

  } catch (e) {
    console.log("AI fallback mode");

    return {
      category: classify(text),
      summary: text,
      policy: "自動生成（簡易）"
    };
  }
}

/* ================= UI更新 ================= */
function renderAI(ai) {

  aiPanel.innerHTML = `
    <div>
      <div><b>分類:</b> ${ai.category}</div>
      <div><b>要約:</b> ${ai.summary}</div>
      <div><b>政策:</b> ${ai.policy}</div>
    </div>
  `;
}

/* ================= 実行 ================= */
btn.onclick = async () => {

  const text = input.value.trim();
  if (!text) return;

  addPost(text);

  const ai = await callLLM(text);

  renderAI(ai);

  integrateToTree(text);

  input.value = "";
};

/* ================= 初期描画 ================= */
renderTree();