let posts = [];

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btn");

  if (!btn) {
    alert("ボタンが見つかりません");
    return;
  }

  btn.addEventListener("click", addPost);

});

async function askAI(text) {

  if (!window.CONFIG) {
    throw new Error("CONFIGがありません");
  }

  if (!window.CONFIG.GROQ_API_KEY) {
    throw new Error("APIキーがありません");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + window.CONFIG.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `
あなたは公共政策アドバイザーです。

以下の市民意見について

1. 要約
2. AIからの問いかけ
3. 追加視点

を出力してください。

市民意見:
${text}
`
          }
        ],
        temperature: 0.7
      })
    }
  );

  const data = await response.json();

  if (!data.choices) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content;
}

async function addPost() {

  const input = document.getElementById("input");

  const text = input.value.trim();

  if (!text) return;

  input.value = "";

  const post = {
    text: text,
    ai: "分析中..."
  };

  posts.unshift(post);

  render();

  try {

    const result = await askAI(text);

    post.ai = result;

    render();

  } catch (e) {

    alert(e.message);

    post.ai = "AI接続エラー: " + e.message;

    render();
}
}

function render() {

  const postsDiv = document.getElementById("posts");

  let html = "";

  for (let i = 0; i < posts.length; i++) {

    html += `
      <div class="card">

        <div class="user-post">
          <strong>市民意見</strong><br>
          ${posts[i].text}
        </div>

        <div class="ai-box">
          <strong>AI分析</strong><br><br>
          ${posts[i].ai.replace(/\n/g, "<br>")}
        </div>

      </div>
    `;
  }

  postsDiv.innerHTML = html;
}