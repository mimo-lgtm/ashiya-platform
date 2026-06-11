alert("JS IS LOADED");
console.log("APP LOADED");

let posts = [];

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn");

  if (!btn) {
    alert("ボタンが見つからない");
    return;
  }

  btn.addEventListener("click", addPost);
});

async function addPost() {
  const input = document.getElementById("input");
  const text = input.value.trim();

  if (!text) return;

  input.value = "";

  posts.unshift({
    text,
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
}