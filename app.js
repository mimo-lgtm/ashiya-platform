let selectedTheme = null;

/* ================= 初期表示 ================= */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("treeBox").innerText = treeText();

  document.getElementById("btn").onclick = () => {

    const text = document.getElementById("input").value.trim();
    if (!text) return;

    const div = document.createElement("div");
    div.innerText = `[${selectedTheme || "未分類"}] ${text}`;

    document.getElementById("posts").prepend(div);

    document.getElementById("input").value = "";
  };

  enableTreeClick();
});

/* ================= イントロ → メイン ================= */
window.goMain = function() {
  document.getElementById("introScreen").classList.add("hidden");
  document.getElementById("topbar").classList.remove("hidden");
  document.getElementById("app").classList.remove("hidden");

  switchView("tree");
};

/* ================= 画面切替 ================= */
window.switchView = function(v) {

  document.getElementById("treeView").classList.add("hidden");
  document.getElementById("postsView").classList.add("hidden");
  document.getElementById("prView").classList.add("hidden");
  document.getElementById("analysisView").classList.add("hidden");
  document.getElementById("mergeView").classList.add("hidden");

  document.getElementById(v + "View").classList.remove("hidden");
};

/* ================= ロジックツリー ================= */
function treeText() {

return `
Version History
v0.1 ロジックツリー型UI
v0.2 思考カードUI（現在）

市民政策ロジックツリー（Vision）

コストセンターからプロフィットセンターへ：
市民のウェルビーイングと知財の集積による投資型都市経営の実現

1. 芦屋市の価値向上（ブランド・移住促進）
次世代教育ブランドの確立
世界一の絵本図書館、EdTech企業連携
街の魅力化・景観美化
公園芝生化、市民協働

2. 市民へのベネフィット（ウェルビーイング）
多世代交流・サードプレイス
カフェ、コミュニティ運営
知的探究・スキルアップ
リスキリング、共同研究、コワーキング

3. 財政的持続可能性
施設の収益化
SHARE LOUNGE、チャレンジショップ
寄付・ふるさと納税
クラファン連動

4. 施設の戦略性
知のゲートウェイ化
デジタルライブラリ、ITサポート
イノベーション・起業支援

5. 都市の強靭性とガバナンス
デュアルユース
災害シミュレーション、都市指令室
DAO型住民自治
投票、トークン設計
`;
}

/* ================= ツリークリック → 投稿テーマ ================= */
function enableTreeClick() {

  document.getElementById("treeBox").onclick = (e) => {

    const text = window.getSelection().toString().trim();
    if (!text) return;

    selectedTheme = text;

    const box = document.getElementById("selectedTheme");
    box.innerText = "選択中テーマ：" + selectedTheme;

    switchView("posts");
  };
}