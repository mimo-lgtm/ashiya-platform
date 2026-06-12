let tree = {};

/* =========================
   ページ切り替え
========================= */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

/* =========================
   ロジックツリー生成
========================= */
function initTree(){

tree = {
"① 芦屋市の価値向上（ブランド・移住促進）":{
"次世代教育ブランドの確立":[
"世界一の絵本図書館",
"EdTech企業連携"
],
"街の魅力化・景観美化":[
"公園芝生化",
"市民協働"
]
},

"② 市民へのベネフィット（ウェルビーイング）":{
"多世代交流・サードプレイス":[
"カフェ",
"コミュニティ運営"
],
"知的探究・スキルアップ":[
"リスキリング",
"共同研究"
]
},

"③ 財政的持続可能性":{
"施設の収益化":[
"SHARE LOUNGE",
"チャレンジショップ"
],
"資金調達":[
"ふるさと納税",
"クラファン"
]
},

"④ 施設の戦略性":{
"知のゲートウェイ化":[
"デジタルライブラリ",
"ITサポート"
],
"起業支援":[
"ピッチアリーナ",
"サンドボックス"
]
},

"⑤ 都市の強靭性とガバナンス":{
"デュアルユース":[
"災害シミュレーション",
"都市指令室"
],
"DAO型市民自治":[
"投票",
"トークン設計"
]
}

};

renderTree();
}

/* =========================
   ツリー描画
========================= */
function renderTree(){

const box = document.getElementById("treeBox");
if(!box) return;

let html = "";

Object.entries(tree).forEach(([main, sub])=>{

html += `<div class="card">`;
html += `<h3 onclick="showPage('post')" style="cursor:pointer">${main}</h3>`;

Object.entries(sub).forEach(([mid, low])=>{

html += `<div class="node"><b>${mid}</b></div>`;

low.forEach(l=>{
html += `<div class="node" style="margin-left:20px" onclick="showPage('post')">${l}</div>`;
});

});

html += `</div>`;
});

box.innerHTML = html;
}

/* =========================
   Groq AI（安定版）
========================= */
async function runAI(){

const text = document.getElementById("input").value.trim();
const resultBox = document.getElementById("result");

if(!text){
resultBox.innerHTML = "<div class='post'>文章を入力してください</div>";
return;
}

if(!window.GROQ_API_KEY){
resultBox.innerHTML = "<div class='post'>APIキーが読み込まれていません</div>";
return;
}

resultBox.innerHTML = "<div class='post'>処理中...</div>";

try{

const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + window.GROQ_API_KEY
},
body:JSON.stringify({
model:"llama-3.1-8b-instant",
messages:[
{
role:"system",
content:"あなたは行政向けAIです。市民意見を①要約②タイトル③論点に整理してください。必ず短く返してください。"
},
{
role:"user",
content:text
}
],
temperature:0.5
})
});

const data = await res.json();

console.log("GROQ RESPONSE:", data);

if(!data.choices || !data.choices[0]){
resultBox.innerHTML =
"<div class='post'>AI応答エラー（APIキー or 制限）</div>";
return;
}

const output = data.choices[0].message.content;

resultBox.innerHTML =
"<div class='post'>" + output + "</div>";

}catch(e){

console.error(e);

resultBox.innerHTML =
"<div class='post'>通信エラー（ネットワーク or API）</div>";

}

}

/* =========================
   初期化
========================= */
initTree();