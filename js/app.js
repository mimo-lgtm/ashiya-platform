let tree = {};

/* =====================
ページ切替
===================== */
function showPage(id){
document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active");
});
const el = document.getElementById(id);
if(el) el.classList.add("active");
}

/* =====================
ロジックツリー
===================== */
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
"多世代交流":[
"カフェ",
"コミュニティ"
],
"知的探究":[
"リスキリング",
"共同研究"
]
},

"③ 財政的持続可能性":{
"収益化":[
"SHARE LOUNGE",
"チャレンジショップ"
],
"資金調達":[
"ふるさと納税",
"クラファン"
]
},

"④ 施設の戦略性":{
"知のゲートウェイ":[
"デジタルライブラリ",
"ITサポート"
],
"起業支援":[
"ピッチアリーナ",
"サンドボックス"
]
},

"⑤ 都市の強靭性":{
"デュアルユース":[
"災害シミュレーション",
"都市指令室"
],
"DAO自治":[
"投票",
"トークン設計"
]
}
};

renderTree();
}

function renderTree(){

const box = document.getElementById("treeBox");
if(!box) return;

let html="";

Object.entries(tree).forEach(([main,sub])=>{
html += `<div class="card"><h3>${main}</h3>`;

Object.entries(sub).forEach(([mid,low])=>{
html += `<div><b>${mid}</b></div>`;
low.forEach(l=>{
html += `<div style="margin-left:20px;cursor:pointer" onclick="showPage('post')">${l}</div>`;
});
});

html += `</div>`;
});

box.innerHTML = html;
}

/* =====================
Groq AI（安定版）
===================== */
async function runAI(){

const input = document.getElementById("input");
const result = document.getElementById("result");

if(!input || !input.value.trim()){
result.innerHTML = "文章を入力してください";
return;
}

const text = input.value.trim();

if(!window.GROQ_API_KEY){
result.innerHTML = "APIキーがありません";
return;
}

result.innerHTML = "AI処理中...";

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
content:"市民意見を①タイトル②要約③論点に整理してください（200文字以内）"
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

if(!res.ok){
result.innerHTML = "APIエラー：" + (data.error?.message || "不明");
return;
}

result.innerHTML =
data.choices?.[0]?.message?.content || "応答なし";

}catch(e){
result.innerHTML = "通信エラー";
}
}

/* =====================
初期化
===================== */
initTree();