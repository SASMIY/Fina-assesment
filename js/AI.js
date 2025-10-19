
//      ENDPOINTS & KEYS
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
const GEMINI_KEY = "AIzaSyDrKpKQtkWTmaGMb5V-yGx4DTIXHvQQSmE";

//      Exposing an API key in client JS is unsafe in production.
// Best practice: call your own server endpoint, keep the key on the server,
// and forward requests there. Client → Your API → Gemini.


//      DOM HOOKS & SMALL UTILITIES
const $in = document.getElementById("input");
const $ask = document.getElementById("ask");
const $clear = document.getElementById("clear");
const $log = document.getElementById("log");
const $status = document.getElementById("status");

const setStatus = t => $status.textContent = t || "";
const addMsg = (cls, who, text) => {
  // Simple message renderer; keeps UX focused on learning flow
  const d = document.createElement("div");
  d.className = `msg ${cls}`;
  d.textContent = `${who}: ${text}`;
  $log.appendChild(d);
  $log.scrollTop = $log.scrollHeight;
};


//     NORMALISATION FOR NERDAMER
//        - Converts human math to CAS-friendly form
//        - Fixes implicit multiplication (2x → 2*x)
const toNerdamer = (s) => String(s).trim()
  .replace(/π/g, "pi")
  .replace(/(\d)([a-z\(])/gi, "$1*$2")
  .replace(/([a-z\)])(\d)/gi, "$1*$2")
  .replace(/([a-z\)])\(/gi, "$1*(");


//     INTENT DETECTION
//        - Minimal command routing: solve/differentiate/integrate/factor/simplify/plain
const intent = (q) => {
  const t = q.trim().toLowerCase();
  if (t.includes("=")) return "solve";
  if (t.startsWith("differentiate")) return "differentiate";
  if (t.startsWith("integrate")) return "integrate";
  if (t.startsWith("factor")) return "factor";
  if (t.startsWith("simplify")) return "simplify";
  return "plain";
};

//       Local exact compute (Nerdamer)
function computeLocal(raw) {
  if (typeof nerdamer === "undefined") {
    return "Local error: Nerdamer failed to load.";
  }

  const what = intent(raw);
  try {
    if (what === "solve") {

      // Strip optional 'solve ' prefix, split L=R as L-R = 0
      const text = raw.replace(/^solve\s*/i, "");
      const [L, R] = text.split("=");
      const eq = R !== undefined ? `(${L})-(${R})` : text;
      const sol = nerdamer.solve(toNerdamer(eq), "x");
      return `Solution: x = ${sol.toString()}`;
    }
    if (what === "differentiate") {
      const fx = raw.replace(/^differentiate\s*/i, "");
      return `Derivative: ${nerdamer.diff(toNerdamer(fx), "x").toString()}`;
    }
    if (what === "integrate") {
      const fx = raw.replace(/^integrate\s*/i, "");
      return `Integral: ${nerdamer.integrate(toNerdamer(fx), "x").toString()} + C`;
    }
    if (what === "factor") {
      const fx = raw.replace(/^factor\s*/i, "");
      return `Factored: ${nerdamer.factor(toNerdamer(fx)).toString()}`;
    }
    if (what === "simplify") {
      const fx = raw.replace(/^simplify\s*/i, "");
      return `Simplified: ${nerdamer(toNerdamer(fx)).simplify().toString()}`;
    }
    return `Result: ${nerdamer(toNerdamer(raw)).evaluate().toString()}`;
  } catch (e) {
    return `Local error: ${e}`;
  }
}

/*  Gemini explain */
//      Prompt includes the local result to keep AI aligned (no hallucinations)
async function askGemini(question, localResult) {
  const body = {
    contents: [{
      role: "user",
      parts: [{
        text:
          `Question: ${question}\nLocal result: ${localResult}\n` +
          `Explain step-by-step. Keep the final answer consistent with the local result.`
      }]
    }]
  };

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) return `Gemini API error ${res.status}: ${await res.text()}`;

  const data = await res.json();
  //       Defensive access: return first available text or a placeholder
  return (
    data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "(no text)"
  );
}

/*  UI wiring  */
//     - Quick buttons auto-fill and submit
//        - Enter-to-send shortcut (shift+enter for newline)
//        - Optional THINK TIME can be added before showing local result

document.querySelectorAll(".quick button").forEach(b =>
  b.addEventListener("click", () => { $in.value = b.dataset.q; $ask.click(); })
);

$in.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $ask.click(); }
});

$ask.addEventListener("click", async () => {
  const q = $in.value.trim();
  if (!q) return;

  addMsg("you", "You", q);
  setStatus("Computing…");
  const local = computeLocal(q);
  addMsg("local", "Local", local);

  //       If you want a deliberate “think time” delay before
  //       // revealing the answer, insert:
  //       // await new Promise(r => setTimeout(r, 2500))

  setStatus("Asking AI…");
  try {
    addMsg("ai", "AI", await askGemini(q, local));
  } catch {
    addMsg("ai", "AI", "Network or API error.");
  } finally {
    setStatus("");
    $in.value = "";
  }
});

$clear.addEventListener("click", () => { $log.innerHTML = ""; setStatus(""); });


//     Friendly greeting primes user with valid example prompts
addMsg("ai", "AI",
  "Hi! I compute exact answers locally, then explain them using Gemini.\n" +
  "Try: solve 2x-1=5, solve x^2-5x+6=0, differentiate sin(x)*x^2, integrate e^x, factor x^2-5x+6."
);

document.getElementById('btn-ai').onclick = () => {
  window.location.href = 'AI.html';
};

