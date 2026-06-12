function showPage(pageId){

document
.querySelectorAll('.page')
.forEach(page=>{
page.classList.remove('active');
});

const target =
document.getElementById(pageId);

if(target){

target.classList.add('active');

window.scrollTo({
top:0,
behavior:'smooth'
});

}

}

document
.addEventListener(
'DOMContentLoaded',
()=>{

const aiButton =
document.querySelector('.primary-btn');

const ideaInput =
document.getElementById('ideaInput');

const resultBox =
document.querySelector('.result-box');

if(aiButton){

aiButton.addEventListener(
'click',
()=>{

const idea =
ideaInput.value.trim();

if(!idea){

resultBox.innerHTML = `
<h3>入力待ち</h3>

<p>
まずはアイデアを入力してください。
</p>
`;

return;
}

resultBox.innerHTML = `

<h3>AI壁打ち結果（デモ）</h3>

<hr><br>

<h4>論点整理</h4>

<p>
市民投稿のテーマに応じて
AIが自動的に論点を抽出します。
</p>

<br>

<h4>客観データ</h4>

<p>
将来的には人口統計、
施設利用実績、
他自治体事例などを参照します。
</p>

<br>

<h4>投稿案</h4>

<p>
${idea}
</p>

<br>

<h4>タイトル案</h4>

<p>
駅前公共施設活用提案
</p>

<br>

<h4>200字要約</h4>

<p>
AIが投稿内容を整理し、
政策提案として要約します。
現在はデモ表示です。
Groq連携後は自動生成されます。
</p>

<br>

<button id="approveBtn">

この内容で投稿する

</button>

`;

const approveBtn =
document.getElementById('approveBtn');

if(approveBtn){

approveBtn.addEventListener(
'click',
()=>{

resultBox.innerHTML = `

<h3>
投稿完了（デモ）
</h3>

<p>

あなたの投稿は

ロジックツリー

Pull Request一覧

へ反映されました。

</p>

`;

});

}

});

}

});