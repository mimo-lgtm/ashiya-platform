let currentTheme = null;

function switchView(v) {

  document.getElementById("treeView").classList.add("hidden");
  document.getElementById("postsView").classList.add("hidden");
  document.getElementById("prView").classList.add("hidden");
  document.getElementById("analysisView").classList.add("hidden");
  document.getElementById("mergeView").classList.add("hidden");

  document.getElementById(v + "View").classList.remove("hidden");
}

/* ツリー */
const treeData = `
市民政策ロジックツリー（Vision）

1. 価値向上
・教育ブランド
・景観改善

2. 市民ベネフィット
・交流
・カフェ
・学習

3. 財政
・収益化
・寄付

4. 施設
・拠点化

5. ガバナンス
・防災
・自治
`;

document.getElementById("treeBox").innerText = treeData;

/* テーマ選択 */
function selectTheme(t) {
  currentTheme = t;
}

/* 投稿 */
document.getElementById("btn").onclick = () => {

  const text = document.getElementById("input").value.trim();
  if (!text) return;

  const div = document.createElement("div");
  div.innerText = `[${currentTheme || "未分類"}] ${text}`;

  document.getElementById("posts").prepend(div);

  document.getElementById("input").value = "";
};

/* 初期表示 */
switchView("tree");