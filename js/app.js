let tree = {};

/* =========================
   ページ切り替え（重要：グローバル公開）
========================= */
window.showPage = function(id){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active");
});

const target = document.getElementById(id);
if(target){
target.classList.add("active");
}

console.log("showPage:", id);

};

/* =========================
   ロジックツリー（固定構造）
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

"② 市民へのベネフィット":{
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
html += `<h3>${main}</h3>`;

Object.entries(sub).forEach(([mid, low])=>{

html += `<div class="node"><b>${mid}</b></div>`;

low.forEach(l=>{
html += `<div class="node" style="margin-left:20px">${l}</div>`;
});

});

html += `</div>`;
});

box.innerHTML = html;
}

/* =========================
   AI（Groq連携）
========================= */
async function runAI(){

const input = document.getElementById("input");
const result = document.getElementById("result");

if(!input) return;

const text = input.value.trim();

if(!text){
result.innerHTML = "文章を入力してください";
return;
}

if(!window.GROQ_API_KEY){
result.innerHTML = "APIキーがありません";
return;
}

result.innerHTML = "処理中...";

try{

const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + window.GROQ_API_KEY
},
body:JSON.stringify({
model:"llama-3.1-70b-versatile",
messages:[
{
role:"system",
content:"市民意見を①要約②論点③政策カテゴリに整理してください（簡潔）"
},
{
role:"user",
content:text
}
],
temperature:0.3
})
});

const data = await res.json();

console.log("GROQ:", data);

if(!res.ok){
result.innerHTML = "APIエラー: " + (data.error?.message || "unknown");
return;
}

const output = data.choices?.[0]?.message?.content;

if(!output){
result.innerHTML = "応答が空です";
return;
}

result.innerHTML = output;

}catch(e){
console.error(e);
result.innerHTML = "通信エラー";
}

}

/* =========================
   初期化
========================= */
initTree();