window.switchView = function(v) {

  document.getElementById("treeView").classList.add("hidden");
  document.getElementById("postsView").classList.add("hidden");
  document.getElementById("prView").classList.add("hidden");
  document.getElementById("analysisView").classList.add("hidden");
  document.getElementById("mergeView").classList.add("hidden");

  document.getElementById(v + "View").classList.remove("hidden");
};

/* ロジックツリー */
const treeText = `
市民政策ロジックツリー（Vision）

コストセンターからプロフィットセンターへ：
市民のウェルビーイングと知財の集積による投資型都市経営の実現

1. 芦屋市の価値向上
・教育ブランド
・景観改善

2. 市民ベネフィット
・交流
・カフェ
・学習

3. 財政持続性
・収益化
・寄付

4. 施設戦略
・拠点化
・起業支援

5. 都市ガバナンス
・防災
・自治
`;

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("treeBox").innerText = treeText;

  const btn = document.getElementById("btn");
  const input = document.getElementById("input");
  const posts = document.getElementById("posts");

  if (btn) {
    btn.onclick = () => {

      const text = input.value.trim();
      if (!text) return;

      const div = document.createElement("div");
      div.innerText = text;

      posts.prepend(div);

      input.value = "";
    };
  }
});

/* 初期表示 */
switchView("tree");