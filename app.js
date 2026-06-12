let pr = [];
let tree = {};

/* ===== PAGE ===== */
function show(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");

if(id==="tree") renderTree();
if(id==="pr") renderPR();
if(id==="analysis") renderAnalysis();
}

/* ===== INIT TREE ===== */
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

/* ===== TREE RENDER ===== */
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

/* ===== GROQ ===== */
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
content:`必ずJSONのみで返す：
title(10字以内)
summary(200〜300字)
category`
},
{role:"user",content:text}
]
})
});

const data = await res.json();
let raw = data.choices?.[0]?.message?.content || "";

/* JSON安全処理 */
try{
return JSON.parse(raw);
}catch(e){
return {
title:"AI要約",
summary:raw,
category:"未分類"
};
}

}catch(e){
return {
title:"通信エラー",
summary:text,
category:"未分類"
};
}
}

/* ===== AI RUN ===== */
async function runAI(){

let text = document.getElementById("input").value;
if(!text) return;

let ai = await callGroq(text);

document.getElementById("result").innerHTML = `
<div class="card">
<h3>${ai.title}</h3>
<p>${ai.summary}</p>
<div class="tag">${ai.category}</div>

<button class="btn" onclick="commit('${ai.title}','${ai.summary}','${ai.category}')">
確定投稿
</button>
</div>
`;
}

/* ===== COMMIT ===== */
function commit(title,summary,category){

if(!category) category="未分類";

let obj = {title,summary,category};

pr.unshift(obj);

if(!tree[category]){
tree[category]=[];
}

tree[category].push(title);

show("tree");
renderAll();
}

/* ===== PR ===== */
function renderPR(){
document.getElementById("prBox").innerHTML =
pr.map(p=>`
<div class="card">
<div class="tag">${p.category}</div>
<b>${p.title}</b><br>
${p.summary}
</div>
`).join("") || "なし";
}

/* ===== ANALYSIS ===== */
function renderAnalysis(){

let map={};

pr.forEach(p=>{
map[p.category]=(map[p.category]||0)+1;
});

document.getElementById("analysisBox").innerHTML =
Object.entries(map).map(([k,v])=>`
<div class="card">${k}：${v}</div>
`).join("") || "なし";
}

/* ===== INIT ===== */
function renderAll(){
renderPR();
renderAnalysis();
}

/* ★初期化保証 */
window.onload = function(){
initTree();
renderTree();
};