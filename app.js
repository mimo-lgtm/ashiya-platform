let pr = [];
let tree = {};

/* =========================
   ページ切替（UIはそのまま維持）
========================= */
function show(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");

if(id==="tree") renderTree();
if(id==="pr") renderPR();
if(id==="analysis") renderAnalysis();
}

/* =========================
   ロジックツリー初期化（固定）
========================= */
function initTree(){
tree = {
"芦屋市の価値向上":[
"教育ブランド",
"景観・公園"
],
"市民ベネフィット":[
"交流・カフェ",
"学習・リスキリング"
],
"財政持続性":[
"収益施設",
"ふるさと納税"
],
"施設戦略性":[
"起業支援",
"デジタル拠点"
],
"都市ガバナンス":[
"防災",
"市民参加"
]
};
}

/* =========================
   ツリー描画（崩さない）
========================= */
function renderTree(){

if(Object.keys(tree).length===0){
initTree();
}

let html="";

for(let k in tree){
html += `<div class="card"><h3>${k}</h3>`;

tree[k].forEach(t=>{
html += `<div class="node">${t}</div>`;
});

html += `</div>`;
}

document.getElementById("treeBox").innerHTML = html;
}

/* =========================
   ★ GROQ接続（完全修正版）
========================= */
async function callGroq(text){

try{
const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
content:`
必ずJSONのみ返す。
形式:
{
"title":"10字以内",
"summary":"200〜300字",
"category":"分類"
}
説明は禁止。`
},
{role:"user",content:text}
]
})
});

const data = await res.json();
return data.choices?.[0]?.message?.content || "";

}catch(e){
return null;
}
}

/* =========================
   AI壁打ち（ここが本体）
========================= */
async function runAI(){

let text = document.getElementById("input").value;
if(!text) return;

let raw = await callGroq(text);

/* ★ここが重要：壊れても必ず表示 */
let ai;

try{
ai = JSON.parse(raw);
}catch(e){
ai = {
title:"AI要約",
summary: raw || text,
category:"未分類"
};
}

/* UI表示（既存構造維持） */
document.getElementById("result").innerHTML = `
<div class="card">
<h3>${ai.title}</h3>
<p>${ai.summary}</p>
<div class="tag">${ai.category}</div>

<button class="btn" onclick="commit('${ai.title}','${ai.summary}','${ai.category}')">
この内容で登録
</button>
</div>
`;
}

/* =========================
   投稿確定
========================= */
function commit(title,summary,category){

if(!category) category="未分類";

let obj = {title,summary,category};
pr.unshift(obj);

/* ツリーにも反映 */
if(!tree[category]){
tree[category]=[];
}
tree[category].push(title);

renderTree();
renderPR();
renderAnalysis();
}

/* =========================
   PR表示
========================= */
function renderPR(){
document.getElementById("prBox").innerHTML =
pr.map(p=>`
<div class="card">
<div class="tag">${p.category}</div>
<b>${p.title}</b><br><br>
${p.summary}
</div>
`).join("") || "まだ投稿なし";
}

/* =========================
   分析表示
========================= */
function renderAnalysis(){

let map={};

pr.forEach(p=>{
map[p.category]=(map[p.category]||0)+1;
});

document.getElementById("analysisBox").innerHTML =
Object.entries(map).map(([k,v])=>`
<div class="card">${k}：${v}件</div>
`).join("") || "まだデータなし";
}

/* =========================
   初期化（必須）
========================= */
window.onload = function(){
initTree();
renderTree();
};