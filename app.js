const startBtn = document.getElementById("startBtn");
const introScreen = document.getElementById("introScreen");
const mainScreen = document.getElementById("mainScreen");

const btn = document.getElementById("btn");
const input = document.getElementById("input");
const posts = document.getElementById("posts");
const treePanel = document.querySelector(".tree");

/* ================= ロジックツリー ================= */
let tree = {
  "芦屋市の価値向上": [],
  "市民ベネフィット": [],
  "財政持続性": [],
  "施設戦略": [],
  "都市ガバナンス": []
};

/* ================= 画面遷移 ================= */
startBtn.onclick = () => {
  introScreen.style.display = "none";
  mainScreen.style.display = "block";
  renderTree();
};

/* ================= ルール分類（AIなし） ================= */
function classify(text) {

  if (text.includes("教育") || text.includes("図書館")) {
    return "芦屋市の価値向上";
  }

  if (text.includes("交流") || text.includes("カフェ")) {
    return "市民ベネフィット";
  }

  if (text.includes("収益") || text.includes("寄付")) {
    return "財政持続性";
  }

  if (text.includes("施設")) {
    return "施設戦略";
  }

  if (text.includes("防災") || text.includes("自治")) {
    return "都市ガバナンス";
  }

  return "市民ベネフィット";
}

/* ================= 投稿 ================= */
function addPost(text, category) {

  const div = document.createElement("div");
  div.innerHTML = `
    <b>${text}</b><br>
    <small>${category}</small>
  `;

  posts.prepend(div);
}

/* ================= ツリー描画 ================= */
function renderTree() {

  let html = `
市民政策ロジックツリー（Vision）

コストセンターからプロフィットセンターへ
`;

  for (const key in tree) {
    html += `\n${key}\n`;
    tree[key].forEach(item => {
      html += `・${item}\n`;
    });
  }

  treePanel.innerText = html;
}

/* ================= 統合 ================= */
function integrate(text, category) {

  if (!tree[category]) tree[category] = [];

  tree[category].push(text);

  renderTree();
}

/* ================= 実行 ================= */
btn.onclick = () => {

  const text = input.value.trim();
  if (!text) return;

  const category = classify(text);

  addPost(text, category);
  integrate(text, category);

  input.value = "";
};

/* ================= 初期表示 ================= */
renderTree();