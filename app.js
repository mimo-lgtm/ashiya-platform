function switchView(v) {

  document.getElementById("treeView").classList.add("hidden");
  document.getElementById("postsView").classList.add("hidden");
  document.getElementById("prView").classList.add("hidden");
  document.getElementById("analysisView").classList.add("hidden");
  document.getElementById("mergeView").classList.add("hidden");

  document.getElementById(v + "View").classList.remove("hidden");
}

/* 投稿 */
const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");

btn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  const div = document.createElement("div");
  div.innerText = text;

  posts.prepend(div);

  input.value = "";
};

/* 初期表示 */
switchView("tree");