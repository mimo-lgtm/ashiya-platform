let posts = [];

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btn");

  if (!btn) {
    alert("ボタンが見つからない");
    return;
  }

  btn.addEventListener("click", addPost);

});

async function askAI(text) {

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
        ]
      })
    }
  );

  const data = await response.json();

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

    post.ai = "AI接続エラー";

    render();
  }
}

function render() {

  const postsDiv = document.getElementById("posts");

  let html = "";

  for (let i = 0; i < posts.length; i++) {

    html += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px 0;background:#fff;">
        <div><strong>市民意見</strong></div>
        <div>${posts[i].text}</div>

        <hr>

        <div><strong>AI分析</strong></div>
        <div style="white-space:pre-wrap;">${posts[i].ai}</div>
      </div>
    `;
  }

  postsDiv.innerHTML = html;
}