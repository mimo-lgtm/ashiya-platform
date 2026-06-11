let posts = [];
let filterTag = null;

// ---------------- API ----------------
async function askAI(text){

const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + CONFIG.GROQ_API_KEY
},
body:JSON.stringify({
model:"llama-3.3-70b-versatile",
messages:[{
role:"user",
content:`
あなたは自治体政策AIです。

必ず以下形式：

要約:
質問:
視点:
分類:

分類は必ず：
安全 / 交流 / 教育 / 収益 / 都市

市民意見:
${text}
`
}],
temperature:0.5
})
});

const data = await res.json();

if(!data.choices?.[0]?.message?.content){
throw new Error("AI応答エラー");
}

return data.choices[0].message.content;
}

// ---------------- POST ----------------
async function addPost(){

const text = document.getElementById("input").value.trim();
if(!text) return;

document.getElementById("input").value="";

posts.unshift({
text,
ai:"分析中...",
summary:"",
question:"",
view:"",
tag:"",
open:false
});

render();

try{

const res = await askAI(text);

const get = (k)=> (res.match(new RegExp(k+"[:：]\\s*(.*)"))||[])[1] || "";

posts[0].summary = get("要約");
posts[0].question = get("質問");
posts[0].view = get("視点");
posts[0].tag = get("分類") || "その他";
posts[0].ai = res;

}catch(e){
posts[0].ai = "AIエラー: " + e.message;
posts[0].tag = "未分類";
}

render();
}

// ---------------- UI ----------------
function toggle(i){
posts[i].open = !posts[i].open;
render();
}

function filter(tag){
filterTag = tag;
render();
}

function reset(){
filterTag = null;
render();
}

// ---------------- RENDER ----------------
function render(){

const list = posts.filter(p => !filterTag || p.tag.includes(filterTag));

document.getElementById("posts").innerHTML =
posts.map(p => `
<div class="card">

  <div class="user-post">
    ${p.text}
  </div>

  ${p.open ? `
  <div class="ai-box">
    <pre style="white-space:pre-wrap">${p.ai}</pre>
  </div>
  ` : ""}

</div>
`).join("");
return `
<div class="post" onclick="toggle(${idx})">

<div><b>${p.tag}</b></div>
<div>${p.text}</div>

${p.open ? `
<div class="aiBox">
<pre style="white-space:pre-wrap">${p.ai}</pre>
</div>
` : ``}

</div>
`;
}).join("");

// themes
const freq = {};
posts.forEach(p=>{
freq[p.tag]=(freq[p.tag]||0)+1;
});

document.getElementById("themes").innerHTML =
Object.entries(freq)
.map(([k,v])=>`<div class="theme">${k}（${v}）</div>`)
.join("");
}

render();