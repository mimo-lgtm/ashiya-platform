let tree = {};

function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

/* =========================
   ロジックツリー（完全固定）
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
   ツリー描画（重要）
========================= */
function renderTree(){

let box=document.getElementById("treeBox");
if(!box) return;

let html="";

Object.entries(tree).forEach(([main,sub])=>{

html+=`<div class="card"><h3>${main}</h3>`;

Object.entries(sub).forEach(([mid,low])=>{

html+=`<div class="node"><b>${mid}</b></div>`;

low.forEach(l=>{
html+=`<div class="node" style="margin-left:20px">${l}</div>`;
});

});

html+=`</div>`;
});

box.innerHTML=html;
}

/* =========================
   Groq（安全版）
========================= */
async function runAI(){

const text=document.getElementById("input").value;
if(!text) return;

let res="";
try{
res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+window.GROQ_API_KEY
},
body:JSON.stringify({
model:"llama-3.1-70b-versatile",
messages:[
{
role:"system",
content:"必ずJSONで返す。{title,summary,category}"
},
{role:"user",content:text}
]
})
});

res = await res.json();
res = res.choices?.[0]?.message?.content || "";

}catch(e){
res = JSON.stringify({
title:"AI要約",
summary:text.slice(0,200),
category:"fallback"
});
}

document.getElementById("result").innerHTML =
"<pre>"+res+"</pre>";
}

/* =========================
   初期化
========================= */
initTree();