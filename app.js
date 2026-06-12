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

/* ===== GROQ API ===== */
async function callGroq(text){

if(!window.GROQ_API_KEY){
return {
title:"API未設定",
summary:text,
category:"未分類"
};
}

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
必ずJSONで返す：
title（10字以内）
summary（200〜300字）
category（分類）
`
},
{role:"user",content:text}
]
})
});

const data = await res.json();
let raw = data.choices?.[0]?.message?.content || "";

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
確定して投稿
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
tree[category] = [];
}

tree[category].push(obj);

show("tree");
renderAll();
}

/* ===== TREE ===== */
function renderTree(){

let html = "";

Object.keys(tree).forEach(k=>{
html += `<div class="card"><h3>${k}</h3>`;

tree[k].forEach(t=>{
html += `<div class="node">${t.title}</div>`;
});

html += `</div>`;
});

document.getElementById("treeBox").innerHTML =
html || "まだ投稿なし";
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

let map = {};

pr.forEach(p=>{
map[p.category] = (map[p.category]||0)+1;
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