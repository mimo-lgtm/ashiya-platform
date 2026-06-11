alert("JS LOADED");

let posts = [];

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btn");

  if (!btn) {
    alert("ボタンが見つからない");
    return;
  }

  alert("BUTTON CONNECTED");

  btn.addEventListener("click", addPost);

});

async function addPost() {

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

  input.value = "";

  posts.unshift({
    text: text,
    ai: "表示テスト成功"
  });

  render();
}

function render() {

  const el = document.getElementById("posts");

  if (!el) {
    alert("postsがない");
    return;
  }

  el.innerHTML = posts.map(p => `
    <div class="card">
      <div class="user-post">${p.text}</div>
      <div class="ai-box">${p.ai}</div>
    </div>
  `).join("");

  alert("RENDER OK");
}

alert("APP END");