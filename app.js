alert("JS LOADED");

let posts = [];

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btn");

  if (!btn) {
    alert("ボタンが見つからない");
    return;
  }

  btn.addEventListener("click", addPost);

  alert("BUTTON CONNECTED");
});

function addPost() {

  alert("ADDPOST START");

  const input = document.getElementById("input");

  if (!input) {
    alert("inputが見つからない");
    return;
  }

  const text = input.value.trim();

  if (!text) {
    alert("入力なし");
    return;
  }

  posts.unshift({
    text: text,
    ai: "表示テスト成功"
  });

  input.value = "";

  render();
}

function render() {

  const postsDiv = document.getElementById("posts");

  if (!postsDiv) {
    alert("postsが見つからない");
    return;
  }

  let html = "";

  for (let i = 0; i < posts.length; i++) {

    html += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px 0;">
        <div><strong>市民意見</strong></div>
        <div>${posts[i].text}</div>

        <hr>

        <div><strong>AI分析</strong></div>
        <div>${posts[i].ai}</div>
      </div>
    `;
  }

  postsDiv.innerHTML = html;

  alert("RENDER OK");
}

alert("APP END");