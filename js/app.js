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

resultBox.innerHTML = "<div class='post'>AI処理中...</div>";

try{

console.log("GROQ KEY:", window.GROQ_API_KEY);
console.log("INPUT TEXT:", text);

const response = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + window.GROQ_API_KEY
},
body:JSON.stringify({
model:"llama3-8b-8192",
messages:[
{
role:"system",
content:"あなたは行政向けAIです。市民意見を①タイトル②200文字要約③論点の3点で簡潔に整理してください。"
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
"<div class='post'>APIエラー: " + (data.error?.message || "不明なエラー") + "</div>";
return;
}

if(!data.choices || !data.choices[0]){
resultBox.innerHTML =
"<div class='post'>応答形式エラー</div>";
return;
}

const output = data.choices[0].message.content;

resultBox.innerHTML =
"<div class='post'>" + output + "</div>";

}catch(e){

console.error(e);

resultBox.innerHTML =
"<div class='post'>通信エラーが発生しました</div>";

}

}