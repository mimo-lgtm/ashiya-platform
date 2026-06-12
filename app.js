let pr = [];
let tree = {};

/* ===== PAGE SWITCH ===== */
function show(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");

if(id==="tree") renderTree();
if(id==="pr") renderPR();
if(id==="analysis") renderAnalysis();
}

/* ===== TREE CLICK → POST ===== */
function goPost(text){
document.getElementById("input").value = text;
show("post");
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
content:"必ずJSONで返す：title(10字以内),summary(200〜300字),category"
},
{role:"user",content:text}
]
})
});

const d = await res.json();
let c = d.choices?.[0]?.message?.content || "";

try{
return JSON.parse(c);
}catch(e){
return {
title:"要約生成",
summary:c,
category:"未分類"
};
}

}catch(e){
return {
title:"エラー要約",
summary:text,
category:"未分類"
};
}
}

/* ===== AI FLOW ===== */
async function runAI(){

let text = document.getElementById("input").value;
if(!text) return;

let ai = await callGroq(text);

document.getElementById("result").innerHTML = `
<div class="card">
<div class="tag">${ai.category}</div>
<h3>${ai.title}</h3>
<p>${ai.summary}</p>

<button class="btn"
onclick="commit('${ai.title}','${ai.summary}','${ai.category}')">
確定して投稿
</button>
</div>
`;
}

/* ===== COMMIT ===== */
function commit(title,summary,category){

let obj={title,summary,category};

pr.unshift(obj);

/* TREE反映 */
if(!tree[category]) tree[category]=[];
tree[category].push(obj);

alert("投稿・統合・分析に反映されました");

show("pr");
renderAll();
}

/* ===== TREE ===== */
function renderTree(){

let html="";

for(let k in tree){

html += `<div class="card"><h3>${k}</h3>`;

tree[k].forEach(t=>{
html += `<div class="node">${t.title}</div>`;
});

html += `</div>`;
}

document.getElementById("treeBox").innerHTML =
html || "まだデータなし";
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

/* ===== GLOBAL ===== */
function renderAll(){
renderPR();
renderAnalysis();
}