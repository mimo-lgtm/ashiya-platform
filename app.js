console.log("APP LOADED");

let posts = [];

async function addPost() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  // 先に仮表示（即UI改善）
  const post = {
    text: text,
    ai: "分析中..."
  };

  posts.unshift(post);
  render();

  try {
    const result = await askGroq(text);
    post.ai = result;
    render();
  } catch (e) {
    post.ai = "AI接続エラー（ローカル表示）";
    render();
  }
}

async function askGroq(text) {

  const prompt = `
あなたは公共施設計画アドバイザーです。

以下の市民意見について
1. 要約
2. AIからの問いかけ
3. 追加視点
4. 分類タグ

市民意見:
${text}

出力形式:
要約:
質問:
視点:
分類:
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CONFIG.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

function render() {
  document.getElementById("posts").innerHTML =
    posts.map(p => `
      <div class="card">
        <div class="user-post">${p.text}</div>
        <div class="ai-box" style="white-space:pre-wrap">${p.ai}</div>
      </div>
    `).join("");
}