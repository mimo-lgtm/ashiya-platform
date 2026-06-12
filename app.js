function start() {
  document.getElementById("intro").style.display = "none";
  document.getElementById("main").style.display = "block";
}

/* 画面切替 */
function switchView(v) {

  document.getElementById("treeView").classList.add("hidden");
  document.getElementById("postsView").classList.add("hidden");
  document.getElementById("prView").classList.add("hidden");
  document.getElementById("analysisView").classList.add("hidden");
  document.getElementById("mergeView").classList.add("hidden");

  document.getElementById(v + "View").classList.remove("hidden");
}

/* 投稿（最低限） */
function post() {

  const input = document.getElementById("input");
  const posts = document.getElementById("posts");

  if (!input.value.trim()) return;

  const div = document.createElement("div");
  div.innerText = input.value;

  posts.prepend(div);

  input.value = "";
}

/* 初期 */
switchView("tree");