// ページ切り替え（SPA風）
const navButtons = document.querySelectorAll(".main-nav .nav-link");
const pages = document.querySelectorAll(".page");

function showPage(id) {
  pages.forEach((p) => p.classList.remove("visible"));
  const target = document.getElementById(id);
  if (target) target.classList.add("visible");

  navButtons.forEach((b) => {
    b.classList.toggle("active", b.dataset.target === id);
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showPage(btn.dataset.target);
  });
});

// 「この内容で意見を投稿する」→ AI壁打ちへ
const toAiButtons = document.querySelectorAll(".to-ai");
const aiCategorySelect = document.getElementById("ai-category");

toAiButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;
    if (cat && aiCategorySelect) {
      aiCategorySelect.value = cat;
    }
    showPage("page-ai-wall");
  });
});

// 「ロジックツリーを見る」ボタン（1ページ目）
document.querySelectorAll('[data-target="page-logic-tree"]').forEach((btn) => {
  btn.addEventListener("click", () => showPage("page-logic-tree"));
});

// ロジックツリーの開閉
const logicTitles = document.querySelectorAll(".logic-title");
logicTitles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const nodeId = "node-" + btn.dataset.node;
    const content = document.getElementById(nodeId);
    if (!content) return;
    content.classList.toggle("visible");
  });
});

// AI壁打ち：文字数カウント
const aiInput = document.getElementById("ai-input-text");
const aiCharCount = document.getElementById("ai-char-count");
if (aiInput && aiCharCount) {
  aiInput.addEventListener("input", () => {
    aiCharCount.textContent = `${aiInput.value.length} / 2000 文字`;
  });
}

// AI壁打ち：ダミー処理（後でGAS + GROQに差し替え）
const aiSendBtn = document.getElementById("ai-send");
const aiResponse = document.getElementById("ai-response");
const aiSummaryStep = document.getElementById("ai-summary-step");
const aiAdditionalStep = document.getElementById("ai-additional-step");
const aiSummaryBlock = document.getElementById("ai-summary-block");
const aiSummaryYes = document.getElementById("ai-summary-yes");
const aiSummaryNo = document.getElementById("ai-summary-no");
const aiAdditionalText = document.getElementById("ai-additional-text");
const aiAdditionalSend = document.getElementById("ai-additional-send");
const aiSummaryText = document.getElementById("ai-summary-text");
const aiTitleText = document.getElementById("ai-title-text");
const aiSubmitBtn = document.getElementById("ai-submit");

let lastFullText = "";

function fakeAiProcess(text) {
  // 本番ではGAS→GROQ API呼び出しに置き換え
  const trimmed = text.trim();
  const max = 500;
  return trimmed.length > max ? trimmed.slice(0, max) + "（以下略）" : trimmed;
}

function fakeSummary(text) {
  const trimmed = text.trim();
  const max = 200;
  return trimmed.length > max ? trimmed.slice(0, max) + "…" : trimmed;
}

function fakeTitle(text) {
  // 簡易タイトル生成（先頭20文字）
  const trimmed = text.trim().replace(/\s+/g, " ");
  const base = trimmed.slice(0, 20);
  return base || "市民提案";
}

if (aiSendBtn) {
  aiSendBtn.addEventListener("click", () => {
    const category = aiCategorySelect.value;
    const text = aiInput.value.trim();

    if (!category) {
      alert("カテゴリーを選択してください。");
      return;
    }
    if (!text) {
      alert("意見を入力してください。");
      return;
    }

    lastFullText = text;

    const processed = fakeAiProcess(text);
    aiResponse.innerHTML = `<p>${processed}</p>`;
    aiSummaryStep.classList.remove("hidden");
    aiAdditionalStep.classList.add("hidden");
    aiSummaryBlock.classList.add("hidden");
  });
}

if (aiSummaryYes) {
  aiSummaryYes.addEventListener("click", () => {
    const summary = fakeSummary(lastFullText);
    const title = fakeTitle(lastFullText);
    aiSummaryText.textContent = summary;
    aiTitleText.textContent = title;
    aiSummaryBlock.classList.remove("hidden");
    aiSummaryStep.classList.add("hidden");
  });
}

if (aiSummaryNo) {
  aiSummaryNo.addEventListener("click", () => {
    aiAdditionalStep.classList.remove("hidden");
  });
}

if (aiAdditionalSend) {
  aiAdditionalSend.addEventListener("click", () => {
    const add = aiAdditionalText.value.trim();
    if (!add) {
      alert("追記内容を入力してください。");
      return;
    }
    lastFullText = lastFullText + "\n" + add;
    const processed = fakeAiProcess(lastFullText);
    aiResponse.innerHTML = `<p>${processed}</p>`;
    aiAdditionalStep.classList.add("hidden");
    aiSummaryStep.classList.remove("hidden");
  });
}

if (aiSubmitBtn) {
  aiSubmitBtn.addEventListener("click", () => {
    const category = aiCategorySelect.value;
    const summary = aiSummaryText.textContent;
    const title = aiTitleText.textContent;

    if (!summary || !title) {
      alert("要約とタイトルがありません。");
      return;
    }

    // ★ここをGASのWeb API呼び出しに差し替え（スプレッドシート保存）
    // fetch("GAS_WEB_APP_URL", { method: "POST", body: JSON.stringify({ category, fullText: lastFullText, summary, title }) })

    alert("投稿を受け付けました。PULL REQUEST画面に反映されます。（現在はデモ動作）");

    aiInput.value = "";
    aiAdditionalText.value = "";
    aiCharCount.textContent = "0 / 2000 文字";
    aiResponse.innerHTML = `<p class="muted">ここにAIによる整理・フィードバック（最大500字）が表示されます。</p>`;
    aiSummaryBlock.classList.add("hidden");
    aiSummaryStep.classList.add("hidden");
    aiAdditionalStep.classList.add("hidden");
  });
}

// PULL REQUEST：デモ用ダミーデータ
const dummyPullRequests = [
  {
    category: "① 芦屋市の価値向上",
    title: "絵本図書館とEdTech連携による次世代教育拠点",
    summary: "駅前公共施設を世界一の絵本図書館とEdTech企業の実証拠点として位置づけ、子どもの探究心と創造性を育む場とする提案です。市民ボランティアや大学との連携により、運営コストを抑えつつ高い教育価値を実現します。",
    status: "red",
  },
  {
    category: "② 市民へのベネフィット",
    title: "多世代が集うカフェ併設サードプレイス",
    summary: "カフェとコミュニティスペースを組み合わせ、多世代が自然に交流できるサードプレイスとして駅前施設を活用する提案です。イベントや講座を通じて、市民同士のゆるやかなつながりを育みます。",
    status: "green",
  },
];

const prCategoryButtons = document.querySelectorAll(".category-btn");
const prTitlesContainer = document.getElementById("pr-titles");
const prSummaryBlock = document.getElementById("pr-summary");
const prSummaryText = document.getElementById("pr-summary-text");

prCategoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.prCategory;

    prCategoryButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const list = dummyPullRequests.filter((p) => p.category === cat);

    if (!list.length) {
      prTitlesContainer.innerHTML =
        '<p class="muted">まだこのカテゴリーには投稿がありません。</p>';
      prSummaryBlock.classList.add("hidden");
      return;
    }

    prTitlesContainer.innerHTML = "";
    list.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "pr-title-item";
      div.innerHTML = `
        <span>${item.title}</span>
        <span class="pr-status ${item.status === "red" ? "red" : "green"}">
          ${item.status === "red" ? "未統合" : "統合済"}
        </span>
      `;
      div.addEventListener("click", () => {
        prSummaryText.textContent = item.summary;
        prSummaryBlock.classList.remove("hidden");
      });
      prTitlesContainer.appendChild(div);
    });

    prSummaryBlock.classList.add("hidden");
  });
});
