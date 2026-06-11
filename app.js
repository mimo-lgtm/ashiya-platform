console.log("APP START");

if (!window.CONFIG) {
  alert("CONFIGなし");
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  document.getElementById("btn").onclick = addPost;
});

let posts = [];

async function askAI(text) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.CONFIG.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: text }]
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "error";
}

async function addPost() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  posts.unshift({ text: text, ai: "分析中..." });
  render();

  try {
    const result = await askAI(text);
    posts[0].ai = result;
    render();
  } catch (e) {
    posts[0].ai = "ERROR: " + e.message;
    render();
  }
}

function render() {
  const el = document.getElementById("posts");

  el.innerHTML = posts.map(p => `
    <div class="card">
      <div class="user-post">${p.text}</div>
      <div class="ai-box" style="white-space:pre-wrap">${p.ai}</div>
    </div>
  `).join("");
}