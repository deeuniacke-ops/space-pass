/* SPACE Pass
 * Everything a parent types is kept in this browser's local storage on their own phone.
 * The page's Content Security Policy (index.html) blocks every network connection, so the
 * app cannot send data anywhere. Backups are files the parent saves and keeps themselves.
 */
"use strict";

const STORE_KEY = "spacepass:v1";
const TYPES = [["gp", "GP / doctor"], ["dentist", "Dentist"], ["bloods", "Blood test"], ["hospital", "Hospital"]];
const LETTERS = [
  ["S", "Sensory", "Sensory"],
  ["P", "Predict", "Predictability"],
  ["A", "Accept", "Acceptance"],
  ["C", "Comms", "Communication"],
  ["E", "Empathy", "Empathy"]
];
const DEFAULT_PHRASES = [
  "Yes", "No", "I need a break", "It's too loud", "What happens next?", "Please stop",
  "It hurts", "I need my parent", "I need a snack", "I don't know", "Can you write it down?", "I'm OK"
];
const DEFAULT_HELPS = [
  "Stop all questions and requests.",
  "Lower your voice, or stay quiet.",
  "Give time and space. Don't move them until they're calmer."
];

/* Ideas offered as tap-to-add suggestions. Written in the child's voice. */
const IDEAS = {
  identity: ["I'm autistic.", "I'm ADHD.", "I'm autistic and ADHD.", "I'm neurodivergent.", "I'm a PDAer."],
  key: [
    "I understand what you say, even when I'm not talking.",
    "I understand you, but I need extra time to answer.",
    "I communicate with my AAC device. Please wait for me to finish."
  ],
  answer: [
    "I might go quiet. That doesn't mean I haven't understood.",
    "I might answer with scripts or lines from things I love.",
    "I might use my own words or sounds. That is my answer for now.",
    "I won't always tell you if something hurts. Please check in gently.",
    "I might say yes just to make the question stop. Please check another way.",
    "Written yes/no choices are easier for me than talking.",
    "I use AAC or typing to communicate. Please give me time.",
    "My face might not show how I feel."
  ],
  phrases: [
    "Yes", "No", "I need a break", "It's too loud", "Too bright", "What happens next?", "Please stop",
    "It hurts", "I need my parent", "I need a snack", "I need to move", "I don't know",
    "Can you write it down?", "Please don't touch me yet", "I'm OK", "Thank you"
  ],
  dos: {
    gp: [
      "Tell me what you're going to do before you do it, then give me a moment.",
      "Ask yes/no questions or give me two written choices.",
      "Talk to me directly, not only to my parent.",
      "Let me keep my headphones on.",
      "Let me move around. I'm still listening.",
      "Warn me before you touch me."
    ],
    dentist: [
      "Show me each tool and tell me what it does before it goes near my mouth.",
      "Agree a stop signal with me, and stop when I use it.",
      "Tell me how many steps are left.",
      "Warn me before the chair moves.",
      "Let me wear sunglasses for the bright light.",
      "Let me keep my headphones on."
    ],
    bloods: [
      "Tell me exactly what will happen, step by step, before you start.",
      "Count down out loud so I know when it's over.",
      "If I'm not ready, pause. Pushing on makes it harder.",
      "Let me choose which arm.",
      "Ask me if I want to watch or look away.",
      "Let me hold something I like."
    ],
    hospital: [
      "Keep waiting short, or let me wait somewhere quieter.",
      "Warn me before anything changes, like moving rooms.",
      "Tell me who each new person is.",
      "Keep the same person with me if you can.",
      "Let me have snacks and water if I'm allowed.",
      "Write choices down for me."
    ]
  },
  donts: [
    "Don't raise your voice or speak sharply, even to someone else.",
    "Don't put me on the spot with open questions.",
    "Don't stop me moving or stimming. It helps me regulate.",
    "Don't block the door or hold me still.",
    "Don't ask me to make eye contact.",
    "Don't touch me without warning.",
    "Don't talk about me as if I'm not here."
  ],
  signs: ["Going quiet", "Pacing", "Covering my ears", "Hiding", "Looking angry", "Running off", "Crying", "Repeating words", "Freezing", "Banging or hitting", "Rocking"],
  helps: [
    "Stop all questions and requests.",
    "Stay calm and quiet.",
    "Let me use my headphones.",
    "Don't move me until I'm calmer.",
    "Give me space and time.",
    "Turn the lights down.",
    "Let my parent help me.",
    "When I'm calmer, talk about my favourite things."
  ],
  space: {
    S: [
      "Noisy places can overwhelm me.",
      "Bright lights are hard for me.",
      "I need to move to stay regulated.",
      "I need regular snacks and water.",
      "I wear headphones to stay calm.",
      "Some textures and touch are hard for me.",
      "I need quiet time on my own."
    ],
    P: [
      "I like to know what will happen and when.",
      "Changes are OK if you warn me first.",
      "Transitions are hard for me.",
      "Waiting is hard when I don't know how long it will be.",
      "Pictures or a written list of the steps help me."
    ],
    A: [
      "Stimming helps me regulate. Please let me.",
      "Sometimes it's “I can't”, not “I won't”.",
      "I might need more breaks than other people.",
      "Please accept the way I communicate."
    ],
    C: [
      "I might go non-speaking when I'm stressed.",
      "I won't always ask for help.",
      "Written choices are easier than talking.",
      "I need extra time to process what you say.",
      "Please say exactly what you mean."
    ],
    E: [
      "If I seem angry, I'm probably overwhelmed.",
      "I show my feelings in my own way.",
      "Please help me calm down where I am.",
      "Being shouted at is very hard for me."
    ]
  }
};

/* ---------- Data ---------- */

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function blankProfile() {
  return {
    id: uid(), example: false, name: "", age: "",
    identity: "I'm autistic.",
    key: "I understand what you say, even when I'm not talking.",
    sub: "Please talk to me, not only my parent. Speak calmly and give me time to answer.",
    answer: [], topics: [], phrases: DEFAULT_PHRASES.slice(),
    dos: { gp: [], dentist: [], bloods: [], hospital: [] },
    donts: [], signs: [], helps: [],
    space: { S: { ask: "", items: [] }, P: { ask: "", items: [] }, A: { ask: "", items: [] }, C: { ask: "", items: [] }, E: { ask: "", items: [] } },
    myspace: "", updated: Date.now()
  };
}

function exampleProfile() {
  const p = blankProfile();
  Object.assign(p, {
    example: true, name: "Sam", age: "9",
    answer: [
      "I might go quiet. That doesn't mean I haven't understood.",
      "I might answer with lines from my favourite shows.",
      "I won't always tell you if something hurts. Please check in gently."
    ],
    topics: ["Trains", "Minecraft", "Space"],
    dos: {
      gp: ["Tell me what you're going to do before you do it, then give me a moment.", "Ask yes/no questions or give me two written choices.", "Let me keep my ear defenders on."],
      dentist: ["Show me each tool and tell me what it does before it goes near my mouth.", "Agree a stop signal with me, and stop when I use it.", "Tell me how many steps are left."],
      bloods: ["Tell me exactly what will happen, step by step, before you start.", "Count down out loud so I know when it's over.", "If I'm not ready, pause. Pushing on makes it harder."],
      hospital: ["Keep waiting short, or let me wait somewhere quieter.", "Warn me before anything changes, like moving rooms.", "Tell me who each new person is."]
    },
    donts: ["Don't raise your voice or speak sharply.", "Don't stop me moving or flapping. It helps me regulate.", "Don't touch me without warning."],
    signs: ["Going quiet", "Covering my ears", "Rocking", "Hiding"],
    helps: ["Stop all questions and requests.", "Turn the lights down and keep the room quiet.", "Give me time. Don't move me until I'm calmer."],
    space: {
      S: { ask: "Loud, bright places are hard for me. Movement helps.", items: ["Noisy places can overwhelm me.", "I wear ear defenders to stay calm.", "I need to move to stay regulated.", "I need regular snacks and water."] },
      P: { ask: "Tell me what will happen before it happens.", items: ["I like to know what will happen and when.", "Changes are OK if you warn me first.", "Waiting is hard when I don't know how long it will be."] },
      A: { ask: "Flapping and rocking are how I stay calm.", items: ["Stimming helps me regulate. Please let me.", "Sometimes it's “I can't”, not “I won't”."] },
      C: { ask: "Quiet doesn't mean I don't understand.", items: ["I might go non-speaking when I'm stressed.", "Written choices are easier than talking.", "I need extra time to process what you say."] },
      E: { ask: "If I'm upset, help me calm down where I am.", items: ["If I seem angry, I'm probably overwhelmed.", "Please help me calm down where I am."] }
    },
    myspace: "I like a quiet room where nobody puts me on the spot."
  });
  return p;
}

const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const strs = (v) => (Array.isArray(v) ? v.map(str).filter((s) => s.trim()) : []);

function normalize(raw) {
  const p = blankProfile();
  if (!raw || typeof raw !== "object") return p;
  p.id = str(raw.id) || uid();
  p.example = raw.example === true;
  ["name", "age", "identity", "key", "sub", "myspace"].forEach((k) => { if (k in raw) p[k] = str(raw[k]); });
  ["answer", "topics", "donts", "signs", "helps"].forEach((k) => { p[k] = strs(raw[k]); });
  if (Array.isArray(raw.phrases)) p.phrases = strs(raw.phrases);
  TYPES.forEach(([t]) => { p.dos[t] = strs(raw.dos && raw.dos[t]); });
  LETTERS.forEach(([k]) => {
    const s = raw.space && raw.space[k];
    p.space[k] = { ask: str(s && s.ask), items: strs(s && s.items) };
  });
  p.updated = Number(raw.updated) || Date.now();
  return p;
}

function loadDB() {
  const fresh = { v: 1, children: [], current: null, childMode: false, type: "gp" };
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!raw || !Array.isArray(raw.children)) return fresh;
    return {
      v: 1,
      children: raw.children.map(normalize),
      current: str(raw.current) || null,
      childMode: raw.childMode === true,
      type: TYPES.some(([t]) => t === raw.type) ? raw.type : "gp"
    };
  } catch (e) { return fresh; }
}

let db = loadDB();
let saveTimer = null;
let storageOK = true;
let askedPersist = false;

function save(now) {
  clearTimeout(saveTimer);
  const write = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); storageOK = true; }
    catch (e) { storageOK = false; toast("This browser won't save. Try turning off private browsing."); }
    if (!askedPersist && navigator.storage && navigator.storage.persist) {
      askedPersist = true;
      navigator.storage.persist().catch(() => {});
    }
  };
  if (now) write(); else saveTimer = setTimeout(write, 250);
}
window.addEventListener("pagehide", () => save(true));

function current() {
  return db.children.find((c) => c.id === db.current) || db.children[0] || null;
}
function touch(p) { p.updated = Date.now(); save(); }

/* ---------- UI state ---------- */

const ui = {
  view: db.children.length ? "pass" : "home",
  tab: "card", sec: 0, step: 0, editType: "gp", editSec: 0,
  overlay: null, sayText: "", confirm: null
};

/* ---------- DOM helpers ---------- */

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "value") el.value = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

/* Bold the first sentence so staff can scan. */
function rich(s) {
  const m = s.match(/^(.*?[.!?])\s+(.+)$/s);
  return m ? [h("b", null, m[1]), " " + m[2]] : [h("b", null, s)];
}

const $bar = () => document.getElementById("bar");
const $main = () => document.getElementById("main");
const $dock = () => document.getElementById("dock");
const $layer = () => document.getElementById("layer");

function render(keepScroll) {
  const y = window.scrollY;
  renderBar(); renderMain(); renderDock(); renderLayer();
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  wake();
}

let toastTimer = null;
function toast(msg) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const t = h("div", { class: "toast", role: "status", text: msg });
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}

function go(view, opts) {
  ui.view = view; ui.confirm = null; ui.overlay = null;
  Object.assign(ui, opts || {});
  render();
}

/* ---------- Top bar ---------- */

function renderBar() {
  const p = current();
  let inner;
  if (ui.view === "pass" && p) {
    inner = [
      h("button", { class: "who", id: "who-btn", "aria-label": "Switch child", onclick: () => { ui.overlay = "switch"; renderLayer(); } },
        h("span", { class: "nm", text: (p.name || "Unnamed") + (p.example ? " (example)" : "") }),
        h("span", { class: "caret", "aria-hidden": "true", text: "▾" })),
      db.childMode ? lockButton() : [
        h("button", { class: "btn", id: "edit-btn", onclick: () => go("edit", { step: 0 }) }, "Edit"),
        h("button", { class: "iconbtn", id: "settings-btn", "aria-label": "Settings", onclick: () => go("settings") }, "⚙")
      ]
    ];
  } else if (ui.view === "edit" && p) {
    inner = [
      h("div", { class: "who" }, h("span", { class: "nm", text: p.name ? "Editing " + p.name : "New plan" })),
      h("button", { class: "btn primary", id: "done-btn", onclick: finishEdit }, "Done")
    ];
  } else if (ui.view === "settings") {
    inner = [
      h("div", { class: "who" }, h("span", { class: "nm", text: "Settings" })),
      h("button", { class: "btn", id: "back-btn", onclick: () => go(db.children.length ? "pass" : "home") }, "Back")
    ];
  } else {
    inner = [
      h("div", { class: "who" }, h("span", { class: "nm", text: "SPACE Pass" })),
      db.children.length ? h("button", { class: "btn", id: "open-btn", onclick: () => go("pass") }, "Open pass") : null
    ];
  }
  $bar().replaceChildren(h("div", { class: "gutter" }, h("div", { class: "col" }, h("div", { class: "bar-in" }, inner))));
}

function lockButton() {
  let timer = null;
  const btn = h("button", { class: "lockbtn", id: "unlock-btn", "aria-label": "Press and hold to unlock editing" },
    h("span", { class: "fill", "aria-hidden": "true" }), "🔒 Hold to unlock");
  const start = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.type === "keydown" && e.repeat) return;
    e.preventDefault();
    btn.classList.add("holding");
    timer = setTimeout(() => { db.childMode = false; save(); toast("Editing unlocked"); render(true); }, 1500);
  };
  const stop = () => { clearTimeout(timer); btn.classList.remove("holding"); };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("keydown", start);
  ["pointerup", "pointerleave", "pointercancel", "keyup", "blur"].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  return btn;
}

/* ---------- Main ---------- */

function renderMain() {
  let body;
  if (ui.view === "pass" && current()) body = viewPass(current());
  else if (ui.view === "edit" && current()) body = viewEdit(current());
  else if (ui.view === "settings") body = viewSettings();
  else body = viewHome();
  $main().replaceChildren(h("div", { class: "gutter" }, h("div", { class: "col" }, body)));
}

function fileInput(id) {
  const input = h("input", { type: "file", id, accept: "application/json,.json", hidden: true });
  input.addEventListener("change", () => {
    const f = input.files && input.files[0];
    if (f) importBackup(f);
    input.value = "";
  });
  return input;
}

function viewHome() {
  const restore = fileInput("restore-file-home");
  return [
    h("section", { class: "hero" },
      h("div", { class: "dots", "aria-hidden": "true" }, LETTERS.map(([k]) => h("i", { class: "t-" + k }))),
      h("h1", null, "A pass for appointments, in your child's words."),
      h("p", { class: "lede" }, "Make a card your child can show to a doctor, dentist or nurse. Staff can read it in 10 seconds and know how to help."),
      h("p", { class: "muted" }, "It's built on the SPACE framework: Sensory, Predictability, Acceptance, Communication and Empathy.")
    ),
    h("div", { class: "promise" },
      h("h2", null, "Your plan stays on this phone"),
      h("p", null, "There are no accounts and no servers. The app is blocked from connecting to the internet, so nothing you type can be sent anywhere. Nobody else can see it.")
    ),
    h("div", { class: "stack" },
      h("button", { class: "btn primary big", id: "start-btn", onclick: newChild }, "Make a plan"),
      h("button", { class: "btn big", id: "example-btn", onclick: addExample }, "See an example first"),
      h("button", { class: "btn big", id: "restore-btn", onclick: () => restore.click() }, "Restore from a backup"),
      restore
    ),
    installTip()
  ];
}

function isStandalone() {
  return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
}

function installTip() {
  if (isStandalone()) return null;
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) {
    return h("div", { class: "panel plain" },
      h("h2", null, "On iPhone, add it to your Home Screen first"),
      h("p", null, "Tap the Share button, then Add to Home Screen. Open SPACE Pass from your Home Screen and make your plan there."),
      h("p", { class: "small muted" }, "iPhone keeps Home Screen apps separate from Safari, so a plan made in Safari won't appear in the Home Screen app. It then opens like an app and works with no signal."));
  }
  return h("p", { class: "small muted" }, "Tip: add SPACE Pass to your Home Screen from your browser menu. It then opens like an app and works with no signal.");
}

function newChild() {
  const p = blankProfile();
  db.children.push(p); db.current = p.id; save(true);
  go("edit", { step: 0, editType: "gp", editSec: 0 });
}
function addExample() {
  let ex = db.children.find((c) => c.example);
  if (!ex) { ex = exampleProfile(); db.children.push(ex); }
  db.current = ex.id; save(true);
  go("pass", { tab: "card" });
}

/* ---------- Pass ---------- */

function viewPass(p) {
  const tabs = [["card", "For staff"], ["space", "SPACE plan"], ["talk", "Tap to say"]];
  return [
    h("div", { class: "views", role: "tablist", "aria-label": "Views" },
      tabs.map(([k, label]) => h("button", { role: "tab", id: "tab-" + k, "aria-selected": String(ui.tab === k), onclick: () => { ui.tab = k; render(); } }, label))),
    p.example ? h("p", { class: "small muted" }, "This is a made-up example. Tap ▾ next to the name to make your own.") : null,
    ui.tab === "space" ? passSpace(p) : ui.tab === "talk" ? passTalk(p) : passCard(p)
  ];
}

function passCard(p) {
  const name = p.name.trim() || "there";
  const ageId = [p.age.trim() ? "I'm " + p.age.trim() + "." : "", p.identity.trim()].filter(Boolean).join(" ");
  const withDos = TYPES.filter(([t]) => p.dos[t].length);
  if (!withDos.some(([t]) => t === db.type) && withDos.length) db.type = withDos[0][0];
  const dos = p.dos[db.type] || [];
  const nothing = !withDos.length && !p.donts.length && !p.answer.length && !p.signs.length && !p.helps.length;

  return h("div", { class: "stack" },
    h("div", { class: "hello" },
      h("span", { class: "eyebrow" }, "Please read before we start"),
      h("h1", null, "Hi, I'm " + name + "."),
      ageId ? h("p", { class: "muted" }, h("b", null, ageId)) : null,
      p.key.trim() ? h("p", { class: "key", text: p.key }) : null,
      p.sub.trim() ? h("p", { class: "muted", text: p.sub }) : null
    ),
    nothing ? h("div", { class: "panel plain" }, h("p", { class: "empty" }, "Nothing else on this card yet. Tap Edit to add what helps at appointments.")) : null,
    withDos.length ? h("div", { class: "stack" },
      withDos.length > 1 ? h("div", { class: "chips", role: "group", "aria-label": "Appointment type" },
        withDos.map(([t, label]) => h("button", { class: "chip", id: "type-" + t, "aria-pressed": String(db.type === t), onclick: () => { db.type = t; save(); render(true); } }, label))) : null,
      h("div", { class: "panel do" },
        h("h2", null, "✓ Please do" + (withDos.length > 1 ? "" : " · " + withDos[0][1])),
        h("ul", { class: "marked" }, dos.map((s) => h("li", null, h("span", { class: "mk", "aria-hidden": "true" }, "✓"), h("span", null, rich(s))))))
    ) : null,
    p.donts.length ? h("div", { class: "panel dont" },
      h("h2", null, "✕ Please don't"),
      h("ul", { class: "marked" }, p.donts.map((s) => h("li", null, h("span", { class: "mk", "aria-hidden": "true" }, "✕"), h("span", null, rich(s)))))) : null,
    p.answer.length ? h("div", { class: "panel plain" },
      h("h2", null, "How I might answer you"),
      h("ul", null, p.answer.map((s) => h("li", { text: s })))) : null,
    (p.signs.length || p.helps.length) ? h("div", { class: "panel overwhelm" },
      h("h2", null, "If I get overwhelmed"),
      p.signs.length ? [h("h3", null, "What it looks like"), h("div", { class: "tags" }, p.signs.map((s) => h("span", { text: s })))] : null,
      p.helps.length ? [h("h3", null, "What helps"),
        h("ul", { class: "marked" }, p.helps.map((s, i) => h("li", null, h("span", { class: "mk" }, String(i + 1)), h("span", { text: s }))))] : null
    ) : null,
    p.topics.length ? h("div", { class: "panel plain" },
      h("h2", null, "Good things to chat about"),
      h("div", { class: "tags topics" }, p.topics.map((s) => h("span", { text: s })))) : null,
    h("p", { class: "foot" }, "Made with SPACE Pass, based on the SPACE framework (Sensory, Predictability, Acceptance, Communication, Empathy).")
  );
}

function passSpace(p) {
  const i = Math.min(Math.max(ui.sec, 0), 4);
  const [k, , full] = LETTERS[i];
  const s = p.space[k];
  return h("div", { class: "stack" },
    h("div", { class: "letters", role: "tablist", "aria-label": "SPACE sections" },
      LETTERS.map(([L, W], j) => h("button", { class: "t-" + L, role: "tab", id: "sec-" + L, "aria-selected": String(i === j), onclick: () => { ui.sec = j; render(true); } },
        h("span", { class: "L" }, L), h("span", { class: "W" }, W)))),
    h("article", { class: "sec t-" + k },
      h("h2", null, full),
      s.ask.trim() ? h("p", { class: "ask", text: s.ask }) : null,
      s.items.length ? h("ul", null, s.items.map((t) => h("li", { text: t }))) : (!s.ask.trim() ? h("p", { class: "empty" }, "Nothing added here yet.") : null)
    ),
    p.myspace.trim() ? h("div", { class: "card" },
      h("h2", null, "My physical, processing and emotional space"),
      p.myspace.split(/\n{2,}/).map((para) => h("p", { text: para.trim() }))) : null,
    h("p", { class: "small muted" }, "The SPACE framework is by Doherty, McCowan & Shaw (2023), Autistic Doctors International.")
  );
}

function passTalk(p) {
  const nm = p.name.trim();
  return h("div", { class: "stack" },
    h("p", { class: "muted" }, (nm ? nm + ", tap" : "Tap") + " a button to show it big on the screen. Then turn the phone around."),
    p.phrases.length
      ? h("div", { class: "phrases" }, p.phrases.map((t, i) => {
          const low = t.trim().toLowerCase();
          return h("button", { class: "phrase" + (low === "yes" ? " yes" : low === "no" ? " no" : ""), id: "phrase-" + i,
            onclick: () => { ui.overlay = "say"; ui.sayText = t; renderLayer(); } }, t);
        }))
      : h("p", { class: "empty" }, "No phrases yet. Tap Edit to add some.")
  );
}

/* ---------- Dock and overlays ---------- */

function renderDock() {
  const p = current();
  if (ui.view !== "pass" || !p) { $dock().replaceChildren(); return; }
  $dock().replaceChildren(h("div", { class: "dock-in" },
    h("button", { class: "calmbtn", id: "overwhelm-btn", onclick: () => { ui.overlay = "overwhelm"; renderLayer(); } }, "I'm overwhelmed. Please pause.")));
}

function closeOverlay() { ui.overlay = null; renderLayer(); }

function renderLayer() {
  const p = current();
  const layer = $layer();
  if (!ui.overlay || !p) { layer.replaceChildren(); return; }
  let el;
  const nm = p.name.trim() || "This person";
  if (ui.overlay === "overwhelm") {
    const steps = p.helps.length ? p.helps : DEFAULT_HELPS;
    el = h("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "ov-title" },
      h("div", { class: "in" },
        h("button", { class: "close", id: "ov-close", onclick: closeOverlay }, "← Back"),
        h("h2", { id: "ov-title" }, nm + " is overwhelmed."),
        h("p", { class: "big" }, "Please pause everything for now. " + nm + " can still hear and understand you."),
        h("ol", null, steps.map((s) => h("li", { text: s }))),
        p.topics.length ? h("p", null, "When things are calmer, try talking about: " + p.topics.join(", ") + ".") : null
      ));
  } else if (ui.overlay === "say") {
    el = h("div", { class: "overlay say", role: "dialog", "aria-modal": "true", "aria-labelledby": "say-words" },
      h("div", { class: "in" },
        h("span", { class: "eyebrow" }, nm + " is telling you"),
        h("p", { class: "words", id: "say-words", text: ui.sayText }),
        h("button", { class: "close", id: "say-close", onclick: closeOverlay }, "Done")));
  } else if (ui.overlay === "switch") {
    el = h("div", { class: "overlay sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "sw-title", onclick: (e) => { if (e.target === el) closeOverlay(); } },
      h("div", { class: "in" },
        h("h2", { id: "sw-title" }, "Whose pass?"),
        db.children.map((c) => h("button", { class: "pick", "aria-current": String(c.id === p.id),
          onclick: () => { db.current = c.id; save(); ui.overlay = null; ui.tab = "card"; render(); } },
          h("span", { text: (c.name || "Unnamed") + (c.example ? " (example)" : "") }),
          c.id === p.id ? h("span", { class: "muted small" }, "Showing") : null)),
        db.childMode ? null : h("button", { class: "btn big", id: "add-child-btn", onclick: newChild }, "+ Make a new plan"),
        h("button", { class: "btn big", id: "sw-close", onclick: closeOverlay }, "Close")));
  }
  layer.replaceChildren(el || "");
  const f = layer.querySelector(".close, .pick, button");
  if (f) f.focus();
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ui.overlay) closeOverlay(); });

/* ---------- Editor ---------- */

const STEPS = [
  { title: "About your child", intro: "This is the first thing staff read. Write it the way your child would say it.", draw: stepAbout },
  { title: "How they communicate", intro: "Help staff understand what quiet, scripts or sounds mean, and what your child likes to talk about.", draw: stepComms },
  { title: "What staff should do", intro: "Pick what helps at each kind of appointment. Keep it to 3 or 4 things so staff can read it fast.", draw: stepStaff },
  { title: "If they get overwhelmed", intro: "What it looks like, and what staff should do straight away.", draw: stepOverwhelm },
  { title: "The full SPACE plan", intro: "More detail for anyone with time to read it. Fill in as much or as little as you like.", draw: stepSpace }
];

function viewEdit(p) {
  const i = Math.min(Math.max(ui.step, 0), STEPS.length - 1);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  return [
    h("div", { class: "steps", "aria-hidden": "true" }, STEPS.map((_, j) => h("i", { class: j <= i ? "on" : "" }))),
    h("div", { class: "stack" },
      h("span", { class: "eyebrow" }, "Step " + (i + 1) + " of " + STEPS.length),
      h("h1", null, step.title),
      h("p", { class: "muted" }, step.intro)),
    step.draw(p),
    h("div", { class: "nav" },
      i > 0 ? h("button", { class: "btn", id: "step-back", onclick: () => { ui.step = i - 1; render(); } }, "Back") : null,
      h("button", { class: "btn primary", id: "step-next", onclick: () => { if (last) finishEdit(); else { ui.step = i + 1; render(); } } }, last ? "See the pass" : "Next"))
  ];
}

function finishEdit() {
  const p = current();
  save(true);
  if (p && !p.name.trim()) {
    ui.step = 0; render();
    toast("Add your child's name first.");
    const n = document.getElementById("f-name"); if (n) n.focus();
    return;
  }
  go("pass", { tab: "card" });
}

function autosize(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; }

function field(p, key, o) {
  const id = "f-" + key;
  const ctl = o.multiline
    ? h("textarea", { class: "input", id, rows: 3, placeholder: o.placeholder || "" })
    : h("input", { class: "input" + (o.narrow ? " age" : ""), id, type: "text", placeholder: o.placeholder || "", autocomplete: "off", inputmode: o.inputmode || null });
  ctl.value = o.get ? o.get() : p[key];
  ctl.addEventListener("input", () => { if (o.set) o.set(ctl.value); else p[key] = ctl.value; touch(p); if (o.multiline) autosize(ctl); });
  if (o.multiline) requestAnimationFrame(() => autosize(ctl));
  const choices = o.choices ? h("div", { class: "chips" }, o.choices.map((c) =>
    h("button", { class: "chip", type: "button", onclick: () => { ctl.value = c; ctl.dispatchEvent(new Event("input")); } }, c))) : null;
  return h("div", { class: "field" },
    h("label", { for: id }, o.label),
    o.hint ? h("span", { class: "hint" }, o.hint) : null,
    ctl, choices);
}

/* A list of lines the parent can edit, reorder, remove, and add to from ideas. */
function listEditor(p, o) {
  const items = o.items;
  const box = h("div", { class: "field" });
  const draw = (focusAdder) => {
    const add = h("input", { class: "input", id: o.id + "-add", type: "text", placeholder: o.placeholder || "Write your own…", autocomplete: "off" });
    const push = () => {
      const v = add.value.trim(); if (!v) return;
      items.push(v); touch(p); draw(true);
    };
    add.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); push(); } });
    const unused = (o.ideas || []).filter((s) => !items.includes(s));
    const parts = [
      h("span", { class: "lbl" }, o.label),
      o.hint ? h("span", { class: "hint" }, o.hint) : null,
      items.length ? h("div", { class: "list" }, items.map((s, i) => {
        const t = h("textarea", { class: "input", rows: 1, id: o.id + "-" + i, "aria-label": o.label + " " + (i + 1) });
        t.value = s;
        t.addEventListener("input", () => { items[i] = t.value; touch(p); autosize(t); });
        t.addEventListener("blur", () => { if (!t.value.trim()) { items.splice(i, 1); touch(p); draw(); } });
        requestAnimationFrame(() => autosize(t));
        return h("div", { class: "item" }, t,
          h("button", { type: "button", "aria-label": "Move up", disabled: i === 0, onclick: () => { items.splice(i - 1, 0, items.splice(i, 1)[0]); touch(p); draw(); } }, "↑"),
          h("button", { type: "button", "aria-label": "Remove", onclick: () => { items.splice(i, 1); touch(p); draw(); } }, "✕"));
      })) : h("p", { class: "empty small" }, "Nothing added yet."),
      h("div", { class: "adder" }, add, h("button", { class: "btn", type: "button", onclick: push }, "Add")),
      unused.length ? h("div", { class: "ideas" },
        h("span", { class: "hint" }, "Ideas. Tap to add, then change the words to fit."),
        h("div", { class: "chips" }, unused.map((s) => h("button", { class: "chip", type: "button", onclick: () => { items.push(s); touch(p); draw(); } }, s)))) : null
    ];
    box.replaceChildren(...parts.filter(Boolean));
    if (focusAdder) add.focus();
  };
  draw();
  return box;
}

function block(title, ...kids) { return h("section", { class: "block" }, title ? h("h2", null, title) : null, kids); }

function stepAbout(p) {
  return [
    block(null,
      field(p, "name", { label: "Your child's name", placeholder: "First name or nickname" }),
      field(p, "age", { label: "Age (optional)", placeholder: "e.g. 10", narrow: true, inputmode: "numeric" }),
      field(p, "identity", { label: "How they describe themselves", hint: "Use the words your child prefers.", choices: IDEAS.identity })),
    block("The most important thing to know",
      field(p, "key", { label: "Big line at the top", hint: "Staff will read this first.", multiline: true, choices: IDEAS.key }),
      field(p, "sub", { label: "One more line (optional)", multiline: true }))
  ];
}

function stepComms(p) {
  return [
    block(null, listEditor(p, { id: "answer", label: "How I might answer you", items: p.answer, ideas: IDEAS.answer,
      hint: "For example, going quiet, using scripts, or a word they use when they don't want to answer." })),
    block(null, listEditor(p, { id: "topics", label: "Good things to chat about", items: p.topics, placeholder: "e.g. Harry Potter",
      hint: "Favourite interests help your child feel safe. Add one at a time." })),
    block(null, listEditor(p, { id: "phrases", label: "Tap-to-say buttons", items: p.phrases, ideas: IDEAS.phrases,
      hint: "Short phrases your child can tap to show staff. This adds to their usual way of communicating. It doesn't replace it." }))
  ];
}

function stepStaff(p) {
  const t = TYPES.some(([k]) => k === ui.editType) ? ui.editType : "gp";
  const AT = { gp: "At the GP or doctor", dentist: "At the dentist", bloods: "At a blood test", hospital: "At hospital" };
  return [
    block("Please do",
      h("div", { class: "chips", role: "group", "aria-label": "Appointment type" },
        TYPES.map(([k, l]) => h("button", { class: "chip", type: "button", id: "etype-" + k, "aria-pressed": String(k === t),
          onclick: () => { ui.editType = k; render(true); } }, l + (p.dos[k].length ? " · " + p.dos[k].length : "")))),
      listEditor(p, { id: "dos-" + t, label: AT[t], items: p.dos[t], ideas: IDEAS.dos[t],
        hint: "Leave a type empty if you don't need it. It won't show on the pass." })),
    block("Please don't", listEditor(p, { id: "donts", label: "Things that make it harder", items: p.donts, ideas: IDEAS.donts }))
  ];
}

function stepOverwhelm(p) {
  return [
    block(null, listEditor(p, { id: "signs", label: "What it looks like", items: p.signs, ideas: IDEAS.signs, placeholder: "e.g. Pacing",
      hint: "Short words work best here." })),
    block(null, listEditor(p, { id: "helps", label: "What helps, in order", items: p.helps, ideas: IDEAS.helps,
      hint: "These also appear on the full-screen “I'm overwhelmed” page." }))
  ];
}

function stepSpace(p) {
  const i = Math.min(Math.max(ui.editSec, 0), 4);
  const [k, , full] = LETTERS[i];
  const s = p.space[k];
  return [
    block(null,
      h("div", { class: "letters", role: "tablist", "aria-label": "SPACE sections" },
        LETTERS.map(([L, W], j) => h("button", { class: "t-" + L, role: "tab", type: "button", id: "esec-" + L, "aria-selected": String(i === j),
          onclick: () => { ui.editSec = j; render(true); } }, h("span", { class: "L" }, L), h("span", { class: "W" }, W)))),
      h("h2", null, full),
      field(p, "ask-" + k, { label: "In one line", hint: "The main thing to know about " + full.toLowerCase() + ".", multiline: true,
        get: () => s.ask, set: (v) => { s.ask = v; } }),
      listEditor(p, { id: "space-" + k, label: "More detail", items: s.items, ideas: IDEAS.space[k] })),
    block(null, field(p, "myspace", { label: "My physical, processing and emotional space (optional)",
      hint: "The kind of space that helps your child most.", multiline: true }))
  ];
}

/* ---------- Settings ---------- */

function viewSettings() {
  const restore = fileInput("restore-file");
  const c = ui.confirm;
  return [
    block("Children",
      db.children.length ? db.children.map((ch) => h("div", { class: "stack" },
        h("div", { class: "row" },
          h("span", { class: "pick", text: (ch.name || "Unnamed") + (ch.example ? " (example)" : "") }),
        ),
        c && c.kind === "child" && c.id === ch.id
          ? h("div", { class: "confirm" },
              h("p", null, h("b", null, "Delete " + (ch.name || "this plan") + "?"), " This can't be undone unless you have a backup."),
              h("div", { class: "row" },
                h("button", { class: "btn", onclick: () => { ui.confirm = null; render(true); } }, "Keep it"),
                h("button", { class: "btn danger", onclick: () => deleteChild(ch.id) }, "Delete")))
          : h("div", { class: "row" },
              h("button", { class: "btn", onclick: () => { db.current = ch.id; go("edit", { step: 0 }); } }, "Edit"),
              h("button", { class: "btn danger", onclick: () => { ui.confirm = { kind: "child", id: ch.id }; render(true); } }, "Delete"))
      )) : h("p", { class: "empty" }, "No plans yet."),
      h("button", { class: "btn primary big", id: "settings-new", onclick: newChild }, "+ Make a new plan")),
    block("Backup",
      h("p", null, "Your plans are only on this phone. If the phone is lost or reset, they're gone. Save a backup file now and then, and keep it somewhere safe, like your Files app or email to yourself."),
      h("p", { class: "small muted" }, "The backup is a plain file. Anyone you give it to can read it."),
      h("div", { class: "row" },
        h("button", { class: "btn primary", id: "export-btn", onclick: exportBackup, disabled: !db.children.some((x) => !x.example) }, "Save a backup"),
        h("button", { class: "btn", id: "import-btn", onclick: () => restore.click() }, "Restore a backup")),
      restore),
    block("Child mode",
      h("p", null, "Hides the Edit and Settings buttons so your child can hold the phone and show staff without changing anything."),
      h("p", { class: "small muted" }, "To turn it off, press and hold the lock button for 2 seconds."),
      h("button", { class: "btn big", id: "childmode-btn", onclick: () => { db.childMode = true; save(true); go("pass"); toast("Child mode is on"); } }, "Turn on child mode")),
    block("Privacy",
      h("p", null, "SPACE Pass has no accounts, no servers, no analytics and no tracking. Everything you type is stored in this browser on this phone."),
      h("p", null, "The app includes a security rule that stops it opening any internet connection, so it can't send your plan anywhere. Clearing your browser data deletes your plans."),
      c && c.kind === "all"
        ? h("div", { class: "confirm" },
            h("p", null, h("b", null, "Delete every plan on this phone?"), " This can't be undone unless you have a backup."),
            h("div", { class: "row" },
              h("button", { class: "btn", onclick: () => { ui.confirm = null; render(true); } }, "Keep them"),
              h("button", { class: "btn danger", id: "wipe-confirm", onclick: wipeAll }, "Delete everything")))
        : h("button", { class: "btn danger big", id: "wipe-btn", onclick: () => { ui.confirm = { kind: "all" }; render(true); } }, "Delete everything")),
    block("About SPACE",
      h("p", null, "SPACE stands for Sensory needs, Predictability, Acceptance, Communication and Empathy. The framework is by Mary Doherty, Sue McCowan and Sebastian Shaw (2023), from Autistic Doctors International. SPACE Pass isn't made by or connected to them."),
      h("p", { class: "small muted" }, "SPACE Pass isn't medical advice. It helps you share what you already know about your child."))
  ];
}

function deleteChild(id) {
  db.children = db.children.filter((c) => c.id !== id);
  if (db.current === id) db.current = db.children[0] ? db.children[0].id : null;
  ui.confirm = null; save(true);
  toast("Plan deleted");
  if (!db.children.length) go("home"); else render(true);
}

function wipeAll() {
  db = { v: 1, children: [], current: null, childMode: false, type: "gp" };
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  toast("Everything deleted");
  go("home");
}

/* ---------- Backup ---------- */

function exportBackup() {
  const kids = db.children.filter((c) => !c.example);
  if (!kids.length) return;
  const json = JSON.stringify({ app: "space-pass", v: 1, exported: new Date().toISOString(), children: kids }, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const name = "space-pass-backup-" + date + ".json";
  const file = new File([json], name, { type: "application/json" });
  // On phones, the share sheet is the reliable way to save a file (choose "Save to Files").
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    navigator.share({ files: [file], title: "SPACE Pass backup" }).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(file);
  const a = h("a", { href: url, download: name, hidden: true });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("Backup saved as " + name);
}

function importBackup(fileObj) {
  const r = new FileReader();
  r.onload = () => {
    let data;
    try { data = JSON.parse(String(r.result)); } catch (e) { toast("That file isn't a SPACE Pass backup."); return; }
    if (!data || data.app !== "space-pass" || !Array.isArray(data.children)) { toast("That file isn't a SPACE Pass backup."); return; }
    const incoming = data.children.map(normalize).map((c) => Object.assign(c, { example: false }));
    incoming.forEach((c) => {
      const at = db.children.findIndex((x) => x.id === c.id);
      if (at >= 0) db.children[at] = c; else db.children.push(c);
    });
    if (incoming[0]) db.current = incoming[0].id;
    save(true);
    toast("Restored " + incoming.length + (incoming.length === 1 ? " plan" : " plans"));
    go(incoming.length ? "pass" : ui.view, { tab: "card" });
  };
  r.onerror = () => toast("Couldn't read that file. Try again.");
  r.readAsText(fileObj);
}

/* ---------- Screen wake lock while showing the pass ---------- */

let wakeLock = null;
function wake() {
  const want = ui.view === "pass" && document.visibilityState === "visible";
  if (!want) { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } return; }
  if (wakeLock || !("wakeLock" in navigator)) return;
  navigator.wakeLock.request("screen").then((l) => { wakeLock = l; l.addEventListener("release", () => { wakeLock = null; }); }).catch(() => {});
}
document.addEventListener("visibilitychange", wake);

/* ---------- Start ---------- */

if (db.current && !db.children.some((c) => c.id === db.current)) db.current = db.children[0] ? db.children[0].id : null;
if (!db.current && db.children[0]) db.current = db.children[0].id;
render();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
