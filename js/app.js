async function runAI(){

const inputEl = document.getElementById("input");
const resultBox = document.getElementById("result");

if(!inputEl){
console.log("input要素が見つかりません");
return;
}

const text = inputEl.value.trim();

if(!text){
resultBox.innerHTML = "文章を入力してください";
return;
}

if(!window.GROQ_API_KEY){
resultBox.innerHTML = "APIキーが読み込まれていません";
return;
}

resultBox.innerHTML = "AI処理中...";

try{

const response = await fetch("https://api.groq.com/openai/v1/chat/completions",{
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
content:"あなたは行政AIです。市民意見を①タイトル②要約（200文字以内）③論点に整理してください。"
},
{
role:"user",
content:text
}
],
temperature:0.3
})
});

const data = await response.json();

console.log("GROQ RESPONSE:", data);

if(!response.ok){
resultBox.innerHTML =
"APIエラー：" + (data.error?.message || "不明なエラー");
return;
}

const output = data.choices?.[0]?.message?.content;

if(!output){
resultBox.innerHTML = "応答が空です（モデル or 制限）";
return;
}

resultBox.innerHTML = output;

}catch(e){
console.error(e);
resultBox.innerHTML = "通信エラーが発生しました";
}

}