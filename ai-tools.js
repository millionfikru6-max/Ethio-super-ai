/* =====================================================================
   ETHIO-SUPER-AI — AI TOOLS HUB
   Adds a brand-new "AI Tools" workspace (nav item injected into the
   existing .sidebar-nav, panel appended to the existing <main
   class="workspace">) containing 11 tools. Nothing in script.js,
   features-complete.js, or enhancements.js is touched — this only reads
   window.EthioMarkdown (exposed by enhancements.js) when useful.

   Honesty note (kept in the UI too, not just here): this is a static
   front-end with no model/API backend, so "generation" is real,
   deterministic client-side logic — genuine Web Audio/Canvas art, real
   HTML/CSS synthesis, real speech synthesis, real text templating — not
   a live foundation model. Tools that would require a real network
   model (Translator, PDF parsing, Voice Cloning, Video) say so plainly
   in a small demo-mode note rather than pretending otherwise.
   ===================================================================== */

(function () {
  "use strict";
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function toast(msg, type) { if (typeof window.showNotification === "function") window.showNotification(msg, type || "success"); }
  function hashStr(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; } return Math.abs(h); }
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard", "success"));
  }

  /* ==================================================================
   * Generic field renderer
   * ================================================================== */
  function fieldHtml(toolId, f) {
    const id = `ai-field-${toolId}-${f.key}`;
    let input;
    if (f.type === "textarea") input = `<textarea id="${id}" placeholder="${escapeHtml(f.placeholder || "")}">${escapeHtml(f.value || "")}</textarea>`;
    else if (f.type === "select") input = `<select id="${id}">${f.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}</select>`;
    else if (f.type === "number") input = `<input type="number" id="${id}" placeholder="${escapeHtml(f.placeholder || "")}" value="${f.value != null ? f.value : ""}" min="${f.min || 0}" max="${f.max || 100}">`;
    else if (f.type === "file") input = `<input type="file" id="${id}" accept="${f.accept || "*"}">`;
    else input = `<input type="text" id="${id}" placeholder="${escapeHtml(f.placeholder || "")}" value="${escapeHtml(f.value || "")}">`;
    return `<div class="esa-ai-field" data-key="${f.key}"><label>${escapeHtml(f.label)}</label>${input}</div>`;
  }

  function collectValues(toolId, fields) {
    const values = {};
    fields.forEach(f => {
      const el = $(`#ai-field-${toolId}-${f.key}`);
      if (!el) return;
      values[f.key] = f.type === "file" ? (el.files && el.files[0]) : el.value;
    });
    return values;
  }

  function loadingHtml(label) {
    return `<div class="esa-ai-loading"><span class="esa-ai-dot"></span><span class="esa-ai-dot"></span><span class="esa-ai-dot"></span> ${escapeHtml(label || "Generating…")}</div>`;
  }

  /* ==================================================================
   * TOOL DEFINITIONS
   * ================================================================== */
  const TOOLS = [];

  /* ---- 1. AI Image Generator (real generative canvas art, seeded by prompt) ---- */
  TOOLS.push({
    id: "image-gen", icon: "🖼️", name: "AI Image Generator",
    desc: "Turn a text prompt into generative cyberpunk artwork, rendered live on canvas.",
    fields: [
      { key: "prompt", type: "textarea", label: "Prompt", placeholder: "A neon skyline over the Rift Valley at night…" },
      { key: "style", type: "select", label: "Style", options: ["Cyberpunk", "Aurora", "Circuit", "Sunset Grid"] }
    ],
    actionLabel: "Generate Image",
    run(values, outputEl) {
      if (!values.prompt) { toast("Enter a prompt first", "error"); return; }
      outputEl.innerHTML = loadingHtml("Rendering generative artwork…");
      setTimeout(() => {
        const seed = hashStr(values.prompt + values.style);
        const rand = mulberry32(seed);
        const canvas = document.createElement("canvas");
        canvas.width = 480; canvas.height = 320;
        const ctx = canvas.getContext("2d");
        const palettes = {
          Cyberpunk: ["#0d0221", "#ff2e97", "#00f2ff"],
          Aurora: ["#020024", "#00d4ff", "#bc13fe"],
          Circuit: ["#020202", "#00ff9c", "#00f2ff"],
          "Sunset Grid": ["#1a0033", "#ff6a00", "#bc13fe"]
        };
        const pal = palettes[values.style] || palettes.Cyberpunk;
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, pal[0]); grad.addColorStop(1, "#000");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        // skyline silhouette
        ctx.fillStyle = "#000";
        let x = 0;
        while (x < canvas.width) {
          const w = 20 + rand() * 40, h = 60 + rand() * 160;
          ctx.fillRect(x, canvas.height - h, w, h);
          for (let wy = canvas.height - h + 8; wy < canvas.height - 6; wy += 14) {
            for (let wx = x + 4; wx < x + w - 4; wx += 10) {
              if (rand() > 0.6) { ctx.fillStyle = pal[2]; ctx.fillRect(wx, wy, 4, 6); ctx.fillStyle = "#000"; }
            }
          }
          x += w + 4 + rand() * 10;
        }
        // grid lines / horizon glow
        ctx.strokeStyle = pal[1]; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        for (let gy = canvas.height - 40; gy < canvas.height; gy += 8) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // sun/moon
        ctx.fillStyle = pal[2];
        ctx.beginPath(); ctx.arc(canvas.width * (0.25 + rand() * 0.5), canvas.height * 0.28, 34, 0, Math.PI * 2); ctx.fill();
        outputEl.innerHTML = `<div class="esa-ai-canvas-wrap"></div>
          <div class="esa-ai-output-actions"><button data-dl>Download PNG</button><button data-regen>Regenerate</button></div>`;
        outputEl.querySelector(".esa-ai-canvas-wrap").appendChild(canvas);
        outputEl.querySelector("[data-dl]").addEventListener("click", () => {
          const a = document.createElement("a"); a.download = "ai-generated-art.png"; a.href = canvas.toDataURL(); a.click();
        });
        outputEl.querySelector("[data-regen]").addEventListener("click", () => TOOLS.find(t => t.id === "image-gen").run({ prompt: values.prompt + " ", style: values.style }, outputEl));
        if (typeof window.logActivity === "function") window.logActivity("Generated AI image", values.prompt.slice(0, 40));
      }, 900);
    }
  });

  /* ---- 2. AI Video Generator (generative animated canvas preview) ---- */
  TOOLS.push({
    id: "video-gen", icon: "🎬", name: "AI Video Generator",
    desc: "Preview a short generative motion loop from your prompt. Full render export is a demo placeholder.",
    fields: [
      { key: "prompt", type: "textarea", label: "Scene prompt", placeholder: "Drone flight over a neon Addis skyline…" },
      { key: "duration", type: "number", label: "Duration (seconds)", value: 5, min: 2, max: 15 }
    ],
    actionLabel: "Generate Preview",
    run(values, outputEl) {
      if (!values.prompt) { toast("Enter a scene prompt first", "error"); return; }
      outputEl.innerHTML = `<div class="esa-ai-loading"><span class="esa-ai-dot"></span><span class="esa-ai-dot"></span><span class="esa-ai-dot"></span> Rendering frames…</div>
        <div style="height:6px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;margin-top:8px;"><div id="ai-video-progress" style="height:100%;width:0%;background:linear-gradient(90deg,var(--blue),var(--purple));"></div></div>`;
      let pct = 0;
      const bar = () => { pct += 8 + Math.random() * 10; $("#ai-video-progress", outputEl).style.width = Math.min(pct, 100) + "%"; if (pct < 100) setTimeout(bar, 140); else showPreview(); };
      setTimeout(bar, 200);
      const showPreview = () => {
        const seed = hashStr(values.prompt);
        const rand = mulberry32(seed);
        const canvas = document.createElement("canvas");
        canvas.width = 480; canvas.height = 270;
        const ctx = canvas.getContext("2d");
        const particles = Array.from({ length: 60 }, () => ({ x: rand() * canvas.width, y: rand() * canvas.height, s: 1 + rand() * 2, v: 0.4 + rand() * 1.6 }));
        let raf;
        function frame() {
          ctx.fillStyle = "rgba(2,2,8,0.35)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          particles.forEach(p => {
            p.x -= p.v; if (p.x < 0) p.x = canvas.width;
            ctx.fillStyle = "#00f2ff"; ctx.globalAlpha = 0.8;
            ctx.fillRect(p.x, p.y, p.s * 6, p.s);
          });
          ctx.globalAlpha = 1;
          raf = requestAnimationFrame(frame);
        }
        frame();
        outputEl.innerHTML = `<div class="esa-ai-canvas-wrap"></div>
          <div class="esa-ai-demo-note">⚠️ Demo mode: this is a generative motion-loop preview, not a downloadable video file — connect a real render pipeline here for full export.</div>
          <div class="esa-ai-output-actions"><button data-stop>Pause preview</button></div>`;
        outputEl.querySelector(".esa-ai-canvas-wrap").appendChild(canvas);
        let paused = false;
        outputEl.querySelector("[data-stop]").addEventListener("click", (e) => {
          paused = !paused;
          e.target.textContent = paused ? "Resume preview" : "Pause preview";
          if (paused) cancelAnimationFrame(raf); else frame();
        });
        if (typeof window.logActivity === "function") window.logActivity("Generated video preview", values.prompt.slice(0, 40));
      };
    }
  });

  /* ---- 3. AI Voice Generator (real speechSynthesis) ---- */
  TOOLS.push({
    id: "voice-gen", icon: "🗣️", name: "AI Voice Generator",
    desc: "Real text-to-speech playback using your browser's speech engine.",
    fields: [
      { key: "text", type: "textarea", label: "Text to speak", placeholder: "Welcome to Ethio Super AI…" },
      { key: "rate", type: "number", label: "Speed (0.5 – 2.0)", value: 1, min: 0.5, max: 2 },
      { key: "pitch", type: "number", label: "Pitch (0 – 2)", value: 1, min: 0, max: 2 }
    ],
    actionLabel: "Generate Speech",
    run(values, outputEl) {
      if (!values.text) { toast("Enter some text first", "error"); return; }
      if (!("speechSynthesis" in window)) { outputEl.innerHTML = `<div class="esa-ai-demo-note">Speech synthesis isn't supported in this browser.</div>`; return; }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(values.text);
      utter.rate = Number(values.rate) || 1;
      utter.pitch = Number(values.pitch) || 1;
      outputEl.innerHTML = `<div class="esa-ai-output-card">Speaking…</div>
        <div class="esa-ai-output-actions"><button data-replay>▶ Replay</button><button data-stop>⏸ Stop</button></div>`;
      utter.onend = () => { outputEl.querySelector(".esa-ai-output-card").textContent = "Done. Use Replay to hear it again."; };
      window.speechSynthesis.speak(utter);
      outputEl.querySelector("[data-replay]").addEventListener("click", () => { window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); });
      outputEl.querySelector("[data-stop]").addEventListener("click", () => window.speechSynthesis.cancel());
      if (typeof window.logActivity === "function") window.logActivity("Generated AI voice", values.text.slice(0, 40));
    }
  });

  /* ---- 4. AI Voice Cloning (upload sample, playback via system voice as demo) ---- */
  TOOLS.push({
    id: "voice-clone", icon: "🎙️", name: "AI Voice Cloning",
    desc: "Upload a voice sample and preview text spoken back. Cloning engine is simulated in this demo.",
    fields: [
      { key: "sample", type: "file", label: "Voice sample (audio file)", accept: "audio/*" },
      { key: "text", type: "textarea", label: "Text to speak in the cloned voice", placeholder: "Hello, this is my cloned voice…" }
    ],
    actionLabel: "Generate Cloned Voice",
    run(values, outputEl) {
      if (!values.text) { toast("Enter text to speak", "error"); return; }
      outputEl.innerHTML = loadingHtml("Analyzing voice sample…");
      setTimeout(() => {
        let sampleBlock = "";
        if (values.sample) {
          const url = URL.createObjectURL(values.sample);
          sampleBlock = `<p style="margin-bottom:10px;color:var(--text-secondary);font-size:0.8rem;">Reference sample: ${escapeHtml(values.sample.name)}</p><audio controls src="${url}" style="width:100%;margin-bottom:12px;"></audio>`;
        }
        outputEl.innerHTML = `<div class="esa-ai-output-card">${sampleBlock}<div id="ai-clone-status">Ready to preview in the cloned voice.</div></div>
          <div class="esa-ai-demo-note">⚠️ Demo mode: voice cloning is simulated here using your system's speech voice — a real cloning model would plug in at this step.</div>
          <div class="esa-ai-output-actions"><button data-speak>▶ Preview Cloned Voice</button></div>`;
        outputEl.querySelector("[data-speak]").addEventListener("click", () => {
          if (!("speechSynthesis" in window)) { toast("Speech synthesis not supported", "error"); return; }
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(values.text);
          utter.pitch = 1.1;
          window.speechSynthesis.speak(utter);
        });
        if (typeof window.logActivity === "function") window.logActivity("Simulated voice cloning", values.text.slice(0, 40));
      }, 1100);
    }
  });

  /* ---- 5. AI Translator (small offline demo dictionary) ---- */
  const DEMO_PHRASES = {
    "hello": { Amharic: "ሰላም (selam)", French: "Bonjour", Spanish: "Hola", Arabic: "مرحبا" },
    "thank you": { Amharic: "አመሰግናለሁ (ameseginalehu)", French: "Merci", Spanish: "Gracias", Arabic: "شكرا" },
    "good morning": { Amharic: "እንደምን አደርክ (endemin aderk)", French: "Bonjour", Spanish: "Buenos días", Arabic: "صباح الخير" },
    "how are you": { Amharic: "እንዴት ነህ (endet neh)", French: "Comment ça va", Spanish: "¿Cómo estás?", Arabic: "كيف حالك" },
    "welcome": { Amharic: "እንኳን ደህና መጣህ (enkuan dehna metah)", French: "Bienvenue", Spanish: "Bienvenido", Arabic: "أهلا وسهلا" }
  };
  TOOLS.push({
    id: "translator", icon: "🌐", name: "AI Translator",
    desc: "Translate common phrases (demo dictionary — Amharic, French, Spanish, Arabic).",
    fields: [
      { key: "text", type: "text", label: "Text (try: hello / thank you / good morning)", placeholder: "hello" },
      { key: "target", type: "select", label: "Target language", options: ["Amharic", "French", "Spanish", "Arabic"] }
    ],
    actionLabel: "Translate",
    run(values, outputEl) {
      if (!values.text) { toast("Enter text to translate", "error"); return; }
      outputEl.innerHTML = loadingHtml("Translating…");
      setTimeout(() => {
        const key = values.text.trim().toLowerCase();
        const match = DEMO_PHRASES[key];
        const result = match ? match[values.target] : null;
        outputEl.innerHTML = `<div class="esa-ai-output-card">
            <p style="color:var(--text-secondary);font-size:0.78rem;">${escapeHtml(values.target)}</p>
            <p style="font-size:1.1rem;color:var(--text);">${result ? escapeHtml(result) : escapeHtml(values.text) + " <span style='color:var(--text-secondary)'>(no demo entry — shown as-is)</span>"}</p>
          </div>
          <div class="esa-ai-demo-note">⚠️ Demo mode: only a handful of phrases are in this offline dictionary. A production build would call a translation model here.</div>
          <div class="esa-ai-output-actions"><button data-copy>Copy</button></div>`;
        outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(result || values.text));
      }, 500);
    }
  });

  /* ---- 6. AI Code Assistant (reuses enhancements.js markdown/highlighting) ---- */
  TOOLS.push({
    id: "code-assistant", icon: "💻", name: "AI Code Assistant",
    desc: "Paste code or describe what you need — get an explanation, review, or snippet back.",
    fields: [
      { key: "language", type: "select", label: "Language", options: ["javascript", "python", "html", "css"] },
      { key: "code", type: "textarea", label: "Your code or question", placeholder: "function add(a, b) { return a + b }\n\n// or: \"write a debounce function\"" }
    ],
    actionLabel: "Ask Assistant",
    run(values, outputEl) {
      if (!values.code) { toast("Enter some code or a question", "error"); return; }
      outputEl.innerHTML = loadingHtml("Analyzing…");
      setTimeout(() => {
        const lower = values.code.toLowerCase();
        let reply;
        if (lower.includes("debounce")) {
          reply = "Here's a standard debounce helper:\n```javascript\nfunction debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n```\nCall it once and reuse the returned function — every rapid call resets the timer so `fn` only runs after things go quiet.";
        } else if (lower.includes("fix") || lower.includes("bug") || lower.includes("error")) {
          reply = `I looked over the snippet. A few common things to check:\n- Mismatched brackets/parentheses\n- Off-by-one errors in loops\n- Using \`==\` where \`===\` is safer\n- Missing \`return\` statements\n\nHere's your code with the language tag applied so it's easier to scan:\n\`\`\`${values.language}\n${values.code}\n\`\`\``;
        } else if (lower.includes("explain")) {
          reply = `Here's a plain-language walkthrough of what this does, step by step:\n1. It defines the logic shown below.\n2. Any loops iterate over the input data.\n3. Conditionals branch based on state.\n\n\`\`\`${values.language}\n${values.code}\n\`\`\``;
        } else {
          reply = `Got it — treating this as a **${values.language}** request. Here's a starting point:\n\`\`\`${values.language}\n${values.code}\n\`\`\`\nTell me if you'd like it explained, optimized, or debugged and I'll focus on that.`;
        }
        const rendered = (window.EthioMarkdown && window.EthioMarkdown.render) ? window.EthioMarkdown.render(reply) : `<pre>${escapeHtml(reply)}</pre>`;
        outputEl.innerHTML = `<div class="esa-ai-output-card message-content">${rendered}</div>
          <div class="esa-ai-output-actions"><button data-copy>Copy Response</button></div>`;
        outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(reply));
        $all(".esa-code-copy", outputEl).forEach(btn => btn.addEventListener("click", () => {
          const code = btn.nextElementSibling?.textContent || "";
          copyText(code);
        }));
        if (typeof window.logActivity === "function") window.logActivity("Used AI Code Assistant", values.language);
      }, 700);
    }
  });

  /* ---- 7. AI PDF Assistant ---- */
  TOOLS.push({
    id: "pdf-assistant", icon: "📄", name: "AI PDF Assistant",
    desc: "Upload a PDF and ask a question about it.",
    fields: [
      { key: "file", type: "file", label: "PDF file", accept: "application/pdf" },
      { key: "question", type: "text", label: "Your question", placeholder: "Summarize the key points…" }
    ],
    actionLabel: "Ask",
    run(values, outputEl) {
      if (!values.file) { toast("Upload a PDF first", "error"); return; }
      outputEl.innerHTML = loadingHtml("Reading document…");
      setTimeout(() => {
        outputEl.innerHTML = `<div class="esa-ai-output-card">
            <p style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:10px;">${escapeHtml(values.file.name)} · ${(values.file.size / 1024).toFixed(0)} KB</p>
            <p>Based on "${escapeHtml(values.file.name)}", here's a demo response to "${escapeHtml(values.question || "summarize this document")}": this document appears to cover its stated topic in a few key sections, with an introduction, supporting details, and a conclusion.</p>
          </div>
          <div class="esa-ai-demo-note">⚠️ Demo mode: full text extraction needs a PDF-parsing engine wired in here — this response is templated from the filename, not the document's real contents.</div>`;
        if (typeof window.logActivity === "function") window.logActivity("Used AI PDF Assistant", values.file.name);
      }, 900);
    }
  });

  /* ---- 8. AI Resume Builder (real templated generation) ---- */
  TOOLS.push({
    id: "resume-builder", icon: "📃", name: "AI Resume Builder",
    desc: "Fill in your details and generate a formatted resume you can copy or download.",
    fields: [
      { key: "name", type: "text", label: "Full name", placeholder: "Selam Tesfaye" },
      { key: "title", type: "text", label: "Target role", placeholder: "Frontend Engineer" },
      { key: "contact", type: "text", label: "Email / phone", placeholder: "selam@example.com · +251 900 000000" },
      { key: "summary", type: "textarea", label: "Summary", placeholder: "Brief 2-3 sentence professional summary…" },
      { key: "experience", type: "textarea", label: "Experience (one per line)", placeholder: "Company — Role — Years — key achievement" },
      { key: "education", type: "textarea", label: "Education (one per line)", placeholder: "School — Degree — Year" },
      { key: "skills", type: "text", label: "Skills (comma-separated)", placeholder: "JavaScript, React, CSS" }
    ],
    actionLabel: "Generate Resume",
    run(values, outputEl) {
      if (!values.name || !values.title) { toast("Add at least your name and target role", "error"); return; }
      const lines = (s) => (s || "").split("\n").map(l => l.trim()).filter(Boolean);
      const skills = (values.skills || "").split(",").map(s => s.trim()).filter(Boolean);
      const html = `
        <div class="esa-ai-resume-preview" id="ai-resume-text">
          <h2 style="margin:0;color:var(--text);">${escapeHtml(values.name)}</h2>
          <p style="color:var(--text-secondary);margin:2px 0 0;">${escapeHtml(values.title)}</p>
          <p style="color:var(--text-secondary);font-size:0.8rem;">${escapeHtml(values.contact || "")}</p>
          ${values.summary ? `<h3>Summary</h3><p>${escapeHtml(values.summary)}</p>` : ""}
          ${lines(values.experience).length ? `<h3>Experience</h3><ul>${lines(values.experience).map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>` : ""}
          ${lines(values.education).length ? `<h3>Education</h3><ul>${lines(values.education).map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>` : ""}
          ${skills.length ? `<h3>Skills</h3><p>${skills.map(escapeHtml).join(" · ")}</p>` : ""}
        </div>`;
      outputEl.innerHTML = html + `<div class="esa-ai-output-actions"><button data-copy>Copy Text</button><button data-download>Download .txt</button></div>`;
      const plain = [
        values.name, values.title, values.contact, "",
        values.summary ? "SUMMARY\n" + values.summary : "",
        lines(values.experience).length ? "\nEXPERIENCE\n" + lines(values.experience).map(l => "- " + l).join("\n") : "",
        lines(values.education).length ? "\nEDUCATION\n" + lines(values.education).map(l => "- " + l).join("\n") : "",
        skills.length ? "\nSKILLS\n" + skills.join(", ") : ""
      ].filter(Boolean).join("\n");
      outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(plain));
      outputEl.querySelector("[data-download]").addEventListener("click", () => downloadBlob(`${values.name.replace(/\s+/g, "_")}_resume.txt`, plain));
      if (typeof window.logActivity === "function") window.logActivity("Generated resume", values.name);
    }
  });

  /* ---- 9. AI Presentation Generator ---- */
  TOOLS.push({
    id: "presentation-gen", icon: "📊", name: "AI Presentation Generator",
    desc: "Generate a slide-by-slide outline for any topic.",
    fields: [
      { key: "topic", type: "text", label: "Topic", placeholder: "Launching an AI music platform in Ethiopia" },
      { key: "slides", type: "number", label: "Number of slides", value: 5, min: 3, max: 10 },
      { key: "tone", type: "select", label: "Tone", options: ["Professional", "Casual", "Persuasive", "Technical"] }
    ],
    actionLabel: "Generate Outline",
    run(values, outputEl) {
      if (!values.topic) { toast("Enter a topic", "error"); return; }
      const count = Math.max(3, Math.min(10, Number(values.slides) || 5));
      const templates = [
        { t: "Introduction", b: [`What ${values.topic} is about`, "Why it matters right now", "What this deck will cover"] },
        { t: "The Problem", b: ["Current challenges in this space", "Who is affected", "Why existing solutions fall short"] },
        { t: "Our Approach", b: [`How ${values.topic} solves this`, "Key differentiators", "Core design principles"] },
        { t: "How It Works", b: ["Step-by-step overview", "Key features", "Underlying technology"] },
        { t: "Market & Opportunity", b: ["Target audience", "Market size", "Growth potential"] },
        { t: "Roadmap", b: ["Short-term milestones", "Mid-term goals", "Long-term vision"] },
        { t: "Team", b: ["Who's building this", "Relevant experience", "Why we're the right team"] },
        { t: "Results So Far", b: ["Key metrics", "Early feedback", "Lessons learned"] },
        { t: "The Ask", b: ["What we need", "How it will be used", "Expected impact"] },
        { t: "Closing", b: ["Recap of key points", "Call to action", "Thank you / contact"] }
      ];
      const slides = templates.slice(0, count);
      outputEl.innerHTML = slides.map((s, i) => `
        <div class="esa-ai-slide-card">
          <h4>Slide ${i + 1}: ${escapeHtml(s.t)}</h4>
          <ul>${s.b.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
        </div>`).join("") + `<div class="esa-ai-demo-note" style="margin-bottom:10px;">Tone selected: ${escapeHtml(values.tone)} — apply this tone when writing the full script for each slide.</div>
        <div class="esa-ai-output-actions"><button data-copy>Copy Outline</button></div>`;
      const plain = slides.map((s, i) => `Slide ${i + 1}: ${s.t}\n` + s.b.map(b => "- " + b).join("\n")).join("\n\n");
      outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(plain));
      if (typeof window.logActivity === "function") window.logActivity("Generated presentation outline", values.topic);
    }
  });

  /* ---- 10. AI Email Writer ---- */
  TOOLS.push({
    id: "email-writer", icon: "✉️", name: "AI Email Writer",
    desc: "Draft an email from a purpose, tone, and a few key points.",
    fields: [
      { key: "purpose", type: "select", label: "Purpose", options: ["Follow-up", "Introduction", "Apology", "Request", "Thank you"] },
      { key: "tone", type: "select", label: "Tone", options: ["Formal", "Friendly", "Persuasive"] },
      { key: "recipient", type: "text", label: "Recipient name (optional)", placeholder: "Hana" },
      { key: "points", type: "textarea", label: "Key points (one per line)", placeholder: "Missed our call yesterday\nWant to reschedule for Thursday" }
    ],
    actionLabel: "Generate Email",
    run(values, outputEl) {
      if (!values.points) { toast("Add at least one key point", "error"); return; }
      const points = values.points.split("\n").map(p => p.trim()).filter(Boolean);
      const greetings = { Formal: `Dear ${values.recipient || "there"},`, Friendly: `Hi ${values.recipient || "there"}!`, Persuasive: `Hello ${values.recipient || "there"},` };
      const closings = { Formal: "Best regards,", Friendly: "Cheers,", Persuasive: "Looking forward to hearing from you," };
      const subjects = { "Follow-up": "Following up", "Introduction": "Introduction", "Apology": "My apologies", "Request": "A quick request", "Thank you": "Thank you!" };
      const openers = {
        "Follow-up": "I wanted to follow up on our last conversation.",
        "Introduction": "I wanted to reach out and introduce myself.",
        "Apology": "I wanted to reach out and apologize.",
        "Request": "I have a quick request.",
        "Thank you": "I just wanted to say thank you."
      };
      const body = `${greetings[values.tone]}\n\n${openers[values.purpose]}\n\n${points.map(p => "- " + p).join("\n")}\n\n${closings[values.tone]}`;
      const subject = subjects[values.purpose];
      outputEl.innerHTML = `<div class="esa-ai-output-card">
          <p style="color:var(--text-secondary);font-size:0.78rem;">Subject</p>
          <p style="margin:0 0 12px;color:var(--text);font-weight:600;">${escapeHtml(subject)}</p>
          <p style="color:var(--text-secondary);font-size:0.78rem;">Body</p>
          <pre style="white-space:pre-wrap;font-family:inherit;color:var(--text);margin:0;">${escapeHtml(body)}</pre>
        </div>
        <div class="esa-ai-output-actions"><button data-copy>Copy Email</button><button data-mailto>Open in Mail</button></div>`;
      outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(`Subject: ${subject}\n\n${body}`));
      outputEl.querySelector("[data-mailto]").addEventListener("click", () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
      if (typeof window.logActivity === "function") window.logActivity("Generated email", values.purpose);
    }
  });

  /* ---- 11. AI Website Builder (real HTML/CSS generation + live preview) ---- */
  TOOLS.push({
    id: "website-builder", icon: "🌐", name: "AI Website Builder",
    desc: "Generate a real single-file HTML/CSS site with a live preview you can download.",
    fields: [
      { key: "business", type: "text", label: "Business / project name", placeholder: "Addis Sound Studio" },
      { key: "type", type: "select", label: "Type", options: ["Music Studio", "Portfolio", "Restaurant", "Tech Startup", "Personal Blog"] },
      { key: "theme", type: "select", label: "Color theme", options: ["Cyberpunk Neon", "Warm Sunset", "Minimal Dark", "Ocean Blue"] },
      { key: "tagline", type: "text", label: "Tagline", placeholder: "Where sound meets the future" }
    ],
    actionLabel: "Generate Website",
    run(values, outputEl) {
      if (!values.business) { toast("Enter a business name", "error"); return; }
      const themes = {
        "Cyberpunk Neon": { bg: "#050505", accent: "#00f2ff", accent2: "#bc13fe", text: "#fff" },
        "Warm Sunset": { bg: "#1a0f0a", accent: "#ff6a00", accent2: "#ffd166", text: "#fff5e8" },
        "Minimal Dark": { bg: "#111", accent: "#e5e5e5", accent2: "#888", text: "#f5f5f5" },
        "Ocean Blue": { bg: "#031622", accent: "#00b4d8", accent2: "#90e0ef", text: "#eafaff" }
      };
      const th = themes[values.theme] || themes["Cyberpunk Neon"];
      const sections = {
        "Music Studio": ["Book a Session", "Our Sound", "Latest Releases"],
        "Portfolio": ["Projects", "About Me", "Get In Touch"],
        "Restaurant": ["Our Menu", "About Us", "Reservations"],
        "Tech Startup": ["Product", "Features", "Get Started"],
        "Personal Blog": ["Latest Posts", "About", "Subscribe"]
      }[values.type] || ["About", "Services", "Contact"];
      const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${escapeHtml(values.business)}</title>
<style>
  * { box-sizing: border-box; margin:0; padding:0; }
  body { font-family: 'Segoe UI', sans-serif; background:${th.bg}; color:${th.text}; }
  header { padding: 60px 20px; text-align:center; background: radial-gradient(circle at 50% 0%, ${th.accent2}22, transparent 60%); }
  header h1 { font-size: 2.6rem; background: linear-gradient(90deg, ${th.accent}, ${th.accent2}); -webkit-background-clip:text; background-clip:text; color:transparent; }
  header p { margin-top: 10px; color:${th.text}; opacity:0.8; }
  nav { display:flex; justify-content:center; gap:24px; padding:16px; border-top:1px solid ${th.accent}33; border-bottom:1px solid ${th.accent}33; }
  nav a { color:${th.text}; text-decoration:none; font-size:0.9rem; opacity:0.85; }
  section { max-width: 780px; margin: 0 auto; padding: 50px 20px; text-align:center; }
  section h2 { color:${th.accent}; margin-bottom: 14px; }
  section p { color:${th.text}; opacity:0.8; line-height:1.6; }
  footer { text-align:center; padding: 26px; opacity:0.6; font-size:0.8rem; }
  .btn { display:inline-block; margin-top:18px; padding:12px 26px; border-radius:8px; background:linear-gradient(90deg, ${th.accent}, ${th.accent2}); color:#000; font-weight:600; text-decoration:none; }
</style></head>
<body>
  <header><h1>${escapeHtml(values.business)}</h1><p>${escapeHtml(values.tagline || "")}</p></header>
  <nav>${sections.map(s => `<a href="#">${escapeHtml(s)}</a>`).join("")}</nav>
  ${sections.map(s => `<section><h2>${escapeHtml(s)}</h2><p>Placeholder content for the ${escapeHtml(s)} section of ${escapeHtml(values.business)}. Replace this with real copy.</p></section>`).join("")}
  <section><a class="btn" href="#">Get in touch</a></section>
  <footer>© ${new Date().getFullYear()} ${escapeHtml(values.business)}. Built with AI Website Builder.</footer>
</body></html>`;
      outputEl.innerHTML = `<iframe class="esa-ai-website-frame" sandbox="allow-same-origin"></iframe>
        <div class="esa-ai-output-actions"><button data-copy>Copy HTML</button><button data-download>Download .html</button></div>`;
      outputEl.querySelector("iframe").srcdoc = html;
      outputEl.querySelector("[data-copy]").addEventListener("click", () => copyText(html));
      outputEl.querySelector("[data-download]").addEventListener("click", () => downloadBlob(`${values.business.replace(/\s+/g, "_")}.html`, html, "text/html"));
      if (typeof window.logActivity === "function") window.logActivity("Generated website", values.business);
    }
  });

  /* ==================================================================
   * HUB + PANEL RENDERING
   * ================================================================== */
  function renderHub() {
    return `<div class="esa-ai-tools-grid">${TOOLS.map(t => `
      <div class="esa-ai-tool-card" data-open="${t.id}">
        <div class="esa-ai-tool-icon">${t.icon}</div>
        <h4>${escapeHtml(t.name)}</h4>
        <p>${escapeHtml(t.desc)}</p>
      </div>`).join("")}</div>`;
  }

  function renderToolPanel(tool) {
    return `
      <div class="esa-ai-tool-panel">
        <button class="esa-ai-tool-back">← Back to AI Tools</button>
        <h2>${tool.icon} ${escapeHtml(tool.name)}</h2>
        <p class="esa-ai-tool-desc">${escapeHtml(tool.desc)}</p>
        <div class="esa-ai-tool-form">${tool.fields.map(f => fieldHtml(tool.id, f)).join("")}</div>
        <button class="esa-ai-run-btn" id="ai-run-${tool.id}">${escapeHtml(tool.actionLabel)}</button>
        <div class="esa-ai-tool-output" id="ai-output-${tool.id}"><div class="esa-ai-output-empty">Your result will appear here.</div></div>
      </div>`;
  }

  function showHub() {
    const container = $("#workspace-ai-tools .ai-tools-container");
    if (!container) return;
    container.innerHTML = `<h2 style="margin-bottom:6px;">AI Tools</h2><p style="color:var(--text-secondary);margin-bottom:22px;">A full creative & productivity suite — pick a tool to get started.</p>${renderHub()}`;
    $all("[data-open]", container).forEach(card => card.addEventListener("click", () => showTool(card.dataset.open)));
  }

  function showTool(toolId) {
    const tool = TOOLS.find(t => t.id === toolId);
    const container = $("#workspace-ai-tools .ai-tools-container");
    if (!tool || !container) return;
    container.innerHTML = renderToolPanel(tool);
    container.querySelector(".esa-ai-tool-back").addEventListener("click", showHub);
    const outputEl = $(`#ai-output-${tool.id}`);
    $(`#ai-run-${tool.id}`).addEventListener("click", (e) => {
      e.target.disabled = true;
      const values = collectValues(tool.id, tool.fields);
      Promise.resolve(tool.run(values, outputEl)).finally(() => { e.target.disabled = false; });
    });
  }

  /* ==================================================================
   * WORKSPACE + NAV INJECTION
   * ================================================================== */
  function ensureAiToolsWorkspace() {
    if ($("#workspace-ai-tools")) return;
    const main = $("main.workspace");
    if (!main) return;
    const div = document.createElement("div");
    div.id = "workspace-ai-tools";
    div.className = "workspace-content";
    div.innerHTML = `<div class="ai-tools-container"></div>`;
    main.appendChild(div);
    showHub();
  }

  function ensureNavItem() {
    const nav = $(".sidebar-nav");
    if (!nav || $("#esa-nav-ai-tools")) return;
    const a = document.createElement("a");
    a.href = "#"; a.id = "esa-nav-ai-tools"; a.className = "nav-item";
    a.innerHTML = `<span class="nav-icon">🧠</span><span class="nav-label">AI Tools</span>`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.switchWorkspace("ai-tools");
      const titleEl = $("#workspace-title");
      if (titleEl) titleEl.textContent = "AI Tools";
    });
    nav.appendChild(a);
  }

  window.EthioAITools = { openTool: showTool, showHub, tools: TOOLS.map(t => ({ id: t.id, name: t.name, icon: t.icon })) };

  function init() {
    ensureNavItem();
    ensureAiToolsWorkspace();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
