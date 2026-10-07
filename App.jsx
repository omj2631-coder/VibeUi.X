import { useRef, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addPreviewInteractions(html) {
  const interactionScript = `
<script>
document.addEventListener("click", (event) => {
  const action = event.target.closest("button, a");
  if (!action) return;

  const label = (action.textContent || "").toLowerCase();
  if (!/(start|get started|choose|explore|learn|join|book|contact|buy|download)/.test(label)) return;

  if (!action.dataset.clicked) {
    action.dataset.clicked = "true";
    action.textContent = label.includes("choose") ? "Selected" : "You're in";
    action.style.transform = "translateY(-2px) scale(1.03)";
    action.style.boxShadow = "0 12px 24px rgba(99, 102, 241, 0.28)";
  }

  const nextSection = document.querySelector("section:not(.hero), section");
  if (nextSection) {
    nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
</script>`;

  return html.replace(/<\/body>/i, `${interactionScript}</body>`);
}

function applyPreviewTheme(html, theme) {
  const colors = theme === "dark"
    ? { page: "#111916", text: "#f5f5ed", card: "#1b2520", border: "#344239" }
    : { page: "#f7f7f0", text: "#1b2823", card: "#fffefa", border: "#dfe5d9" };
  const themeStyle = `<style id="vibeui-preview-theme">
    :root { color-scheme: ${theme}; }
    html, body { background-color: ${colors.page} !important; color: ${colors.text} !important; }
    body :is(h1, h2, h3, h4, h5, h6, p, span, li, label, small, strong) { color: ${colors.text} !important; }
    body :is(header, nav, footer, section, article, main, aside, [class*="card"]) { border-color: ${colors.border} !important; }
    body :is(article, [class*="card"]) { background-color: ${colors.card} !important; }
  </style>`;

  return html.replace(/<\/head>/i, `${themeStyle}</head>`);
}

function createWebsite(prompt, theme, sections, brandStyle = "minimal", audience = "startup founders", ctaLabel = "Get Started") {
  const rawPrompt = String(prompt || "Your new idea");
  const safePrompt = escapeHtml(rawPrompt);
  const normalizedPrompt = rawPrompt
    .replace(/\b(create|build|design|make|launch|modern|beautiful|responsive|professional|landing|page|website|site|for)\b/gi, "")
    .replace(/\b(a|an|the)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const subject = normalizedPrompt ? normalizedPrompt.split(/\s+/).slice(0, 5).join(" ") : "new idea";
  const safeSubject = escapeHtml(subject);
  const safeCta = escapeHtml(ctaLabel || "Get Started");
  const safeAudience = escapeHtml(audience || "startup founders");
  const contentDirection = [
    {
      matches: /education|student|course|learn|school|tutor/i,
      headline: `Learn ${safeSubject} on your terms`,
      kicker: "Learning, made personal",
      intro: "Build useful skills with focused lessons, expert guidance, and progress you can see.",
      features: [
        ["Learn at your pace", "Short, focused lessons fit around your day and your goals."],
        ["See your progress", "Keep milestones visible and know exactly what to work on next."],
        ["Put skills to work", "Practice with real projects designed to build lasting confidence."],
      ],
    },
    {
      matches: /coffee|cafe|café|restaurant|bakery|food/i,
      headline: `A little more joy in every ${safeSubject}`,
      kicker: "Good things, made fresh",
      intro: "Find your new favorite order, made with care and served just the way you like it.",
      features: [
        ["Fresh, every day", "Thoughtful ingredients and small-batch favorites, prepared daily."],
        ["Made your way", "Find the right blend, bite, or treat for your kind of day."],
        ["A place to settle in", "Warm service and a welcoming table, whenever you need a pause."],
      ],
    },
    {
      matches: /travel|hotel|trip|destination/i,
      headline: `Find your way to ${safeSubject}`,
      kicker: "Go somewhere memorable",
      intro: "Discover the places, stays, and local moments that make a trip feel like yours.",
      features: [
        ["Places with a point of view", "Explore stays and destinations selected for their character."],
        ["Plan without the fuss", "Bring the key details together and keep your itinerary clear."],
        ["Make room for discovery", "Local recommendations help turn free time into a highlight."],
      ],
    },
    {
      matches: /fitness|wellness|yoga|health|workout/i,
      headline: `Feel more like yourself with ${safeSubject}`,
      kicker: "Wellbeing that fits real life",
      intro: "Build a steadier routine with expert support, achievable goals, and space to reset.",
      features: [
        ["Start where you are", "Approachable sessions adapt to your experience and energy."],
        ["Find your rhythm", "Flexible plans make it easier to keep showing up."],
        ["Notice the progress", "Track small wins and build momentum one day at a time."],
      ],
    },
    {
      matches: /fashion|beauty|clothing|style|skincare|jewelry/i,
      headline: `A new point of view on ${safeSubject}`,
      kicker: "Made to feel like you",
      intro: "Discover considered pieces, thoughtful details, and a style that feels personal.",
      features: [
        ["Chosen with intention", "A focused collection makes finding the right piece simpler."],
        ["Details worth keeping", "Comfort, quality, and craft come together in every choice."],
        ["Style it your way", "Ideas and pairings help make each piece your own."],
      ],
    },
  ].find((direction) => direction.matches.test(rawPrompt)) || {
    headline: `Meet your new favorite ${safeSubject}`,
    kicker: "A better way to get there",
    intro: `Thoughtful tools and clear next steps, built around ${safeSubject} and the people it serves.`,
    features: [
      ["Easy to get into", "A clear first step and a welcoming place to begin."],
      ["Made for your people", `Useful details and thoughtful choices for ${safeAudience}.`],
      ["Room to grow", "A flexible foundation that feels good as your idea evolves."],
    ],
  };
  const palette = {
    minimal: { primary: "#193b36", accent: "#d8f27a", soft: "#edf3e5", ink: "#193b36" },
    luxury: { primary: "#4c3328", accent: "#d8b574", soft: "#f3eadb", ink: "#704d32" },
    startup: { primary: "#2458e8", accent: "#c9f36a", soft: "#eaf0ff", ink: "#2448b5" },
    wellness: { primary: "#23634e", accent: "#cce5a4", soft: "#e8f1e2", ink: "#23634e" },
  }[brandStyle] || { primary: "#193b36", accent: "#d8f27a", soft: "#edf3e5", ink: "#193b36" };
  const colors = theme === "dark"
    ? { page: "#111916", text: "#f5f5ed", muted: "#aab7ad", card: "#1b2520", border: "#344239" }
    : { page: "#f7f7f0", text: "#1b2823", muted: "#64716a", card: "#fffefa", border: "#dfe5d9" };
  const heroImage = /coffee|cafe|café|restaurant|bakery|food/i.test(rawPrompt)
    ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85"
    : /travel|hotel|trip|destination/i.test(rawPrompt)
      ? "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85"
      : /fitness|wellness|yoga|health/i.test(rawPrompt)
        ? "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85"
        : /fashion|beauty|clothing|style/i.test(rawPrompt)
          ? "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
          : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject} | VibeUI</title>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: ${colors.page}; color: ${colors.text}; font-family: "Trebuchet MS", Arial, sans-serif; }
    nav { border-bottom: 1px solid ${colors.border}; }
    .nav-inner, .container { width: min(1160px, calc(100% - 48px)); margin: auto; }
    .nav-inner { display: flex; min-height: 76px; align-items: center; justify-content: space-between; }
    .brand { color: ${colors.text}; font-size: 23px; font-weight: 800; text-decoration: none; }
    .nav-links { display: flex; align-items: center; gap: 28px; color: ${colors.muted}; font-size: 13px; }
    .nav-links a { color: inherit; text-decoration: none; }
    .button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; border: 0; border-radius: 7px; padding: 0 21px; background: ${palette.primary}; color: white; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; transition: transform .18s ease, background .18s ease; }
    .button:hover { transform: translateY(-2px); background: ${palette.ink}; }
    .hero { display: grid; grid-template-columns: minmax(0, .95fr) minmax(340px, 1.05fr); align-items: center; gap: clamp(36px, 7vw, 92px); padding-top: 66px; padding-bottom: 76px; }
    .eyebrow { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 24px; color: ${palette.ink}; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    .eyebrow::before { width: 22px; height: 2px; background: ${palette.primary}; content: ""; }
    h1 { max-width: 610px; margin: 0; font: 500 clamp(44px, 6vw, 76px)/.99 Georgia, "Times New Roman", serif; }
    .hero-copy { max-width: 470px; margin: 23px 0 0; color: ${colors.muted}; font-size: 16px; line-height: 1.75; }
    .hero-actions { display: flex; align-items: center; gap: 19px; margin-top: 28px; }
    .text-link { color: ${colors.text}; font-size: 13px; font-weight: 700; text-decoration: none; }
    .hero-image { display: block; width: 100%; aspect-ratio: 1.12; border-radius: 7px; object-fit: cover; }
    .image-caption { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; color: ${colors.muted}; font-size: 11px; }
    .image-caption strong { color: ${colors.text}; font-size: 12px; }
    .ticker { border-top: 1px solid ${colors.border}; border-bottom: 1px solid ${colors.border}; padding: 18px 12px; color: ${colors.muted}; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-align: center; text-transform: uppercase; }
    .content-section { padding-top: 72px; padding-bottom: 72px; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 30px; }
    .section-kicker { display: block; margin-bottom: 10px; color: ${palette.ink}; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    .section-title { max-width: 580px; margin: 0; font: 500 clamp(32px, 4vw, 48px)/1.08 Georgia, "Times New Roman", serif; }
    .section-intro { max-width: 320px; margin: 0 0 3px; color: ${colors.muted}; font-size: 13px; line-height: 1.7; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid ${colors.border}; }
    .feature { min-height: 190px; padding: 24px 22px 18px 0; }
    .feature + .feature { border-left: 1px solid ${colors.border}; padding-left: 22px; }
    .feature-number { display: block; margin-bottom: 28px; color: ${palette.ink}; font: 18px Georgia, "Times New Roman", serif; }
    .feature h3 { margin: 0 0 10px; font-size: 17px; }
    .feature p { max-width: 290px; margin: 0; color: ${colors.muted}; font-size: 13px; line-height: 1.7; }
    .pricing-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .price-card { border: 1px solid ${colors.border}; border-radius: 7px; padding: 24px; background: ${colors.card}; }
    .price-card.featured { border-color: ${palette.primary}; box-shadow: inset 0 3px ${palette.primary}; }
    .price-card h3 { margin: 0; font-size: 15px; }
    .price { margin: 20px 0 12px; font: 40px Georgia, "Times New Roman", serif; }
    .price-card p { min-height: 42px; margin: 0; color: ${colors.muted}; font-size: 12px; line-height: 1.65; }
    .price-card .button { width: 100%; margin-top: 20px; }
    footer { border-top: 1px solid ${colors.border}; padding: 25px 0; color: ${colors.muted}; font-size: 11px; }
    .footer-inner { display: flex; justify-content: space-between; gap: 20px; }
    @media (max-width: 760px) { .nav-links { display: none; } .hero { grid-template-columns: 1fr; gap: 35px; padding-top: 46px; } .hero-image { aspect-ratio: 1.25; } .section-heading { align-items: start; flex-direction: column; } .feature-grid, .pricing-grid { grid-template-columns: 1fr; } .feature { min-height: auto; padding: 21px 0; } .feature + .feature { border-top: 1px solid ${colors.border}; border-left: 0; padding-left: 0; } .feature-number { margin-bottom: 14px; } }
    @media (max-width: 440px) { .nav-inner, .container { width: calc(100% - 32px); } .hero-actions, .footer-inner, .image-caption { align-items: start; flex-direction: column; } }
  </style>
</head>
<body>
  <nav><div class="nav-inner"><a class="brand" href="#top">VibeUI</a><div class="nav-links"><a href="#features">Why it works</a><a href="#pricing">Plans</a></div><a class="button" href="#features">${safeCta}</a></div></nav>
  ${sections.hero ? `<section class="hero container" id="top"><div><div class="eyebrow">${contentDirection.kicker}</div><h1>${contentDirection.headline}</h1><p class="hero-copy">${contentDirection.intro} ${safePrompt}</p><div class="hero-actions"><a class="button" href="#features">${safeCta}</a><a class="text-link" href="#features">Explore what is inside</a></div></div><div><img class="hero-image" src="${heroImage}" alt="A welcoming scene for ${safeSubject}"><div class="image-caption"><strong>${safeSubject}</strong><span>Designed around you</span></div></div></section><div class="ticker">${contentDirection.kicker} / Made for ${safeAudience} / Ready when you are</div>` : ""}
  ${sections.features ? `<section class="content-section container" id="features"><div class="section-heading"><div><span class="section-kicker">${contentDirection.kicker}</span><h2 class="section-title">${contentDirection.headline}</h2></div><p class="section-intro">${contentDirection.intro}</p></div><div class="feature-grid">${contentDirection.features.map(([title, description], index) => `<article class="feature"><span class="feature-number">0${index + 1}</span><h3>${title}</h3><p>${description}</p></article>`).join("")}</div></section>` : ""}
  ${sections.pricing ? `<section class="content-section container" id="pricing"><div class="section-heading"><div><span class="section-kicker">Clear from day one</span><h2 class="section-title">Choose a plan that fits.</h2></div><p class="section-intro">Start simple and move up when you are ready. No surprises.</p></div><div class="pricing-grid"><article class="price-card"><h3>Starter</h3><div class="price">INR 0</div><p>Everything you need to get started.</p><a class="button" href="#top">Choose Starter</a></article><article class="price-card featured"><h3>Pro</h3><div class="price">INR 499</div><p>More room for your next big step.</p><a class="button" href="#top">Choose Pro</a></article><article class="price-card"><h3>Business</h3><div class="price">INR 999</div><p>Bring your team and ideas together.</p><a class="button" href="#top">Choose Business</a></article></div></section>` : ""}
  <footer><div class="footer-inner container"><span>VibeUI</span><span>A little more thoughtful, by design.</span></div></footer>
</body>
</html>`;
}

export default function App() {
  const [prompt, setPrompt] = useState("Create a modern landing page for an AI education platform");
  const [theme, setTheme] = useState("light");
  const [sections, setSections] = useState({ hero: true, features: true, pricing: true });
  const [brandStyle, setBrandStyle] = useState("minimal");
  const [audience, setAudience] = useState("startup founders");
  const [ctaLabel, setCtaLabel] = useState("Get Started");
  const [generatedCode, setGeneratedCode] = useState(() =>
    createWebsite(
      "Create a modern landing page for an AI education platform",
      "light",
      { hero: true, features: true, pricing: true },
      "minimal",
      "startup founders",
      "Get Started"
    )
  );
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationInfo, setGenerationInfo] = useState({ provider: "", note: "" });
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState("preview");
  const [recentPrompts, setRecentPrompts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vibeui-recent-prompts") || "[]");
    } catch {
      return [];
    }
  });
  const [previewVersion, setPreviewVersion] = useState(0);
  const generationRequestId = useRef(0);

  async function generateWebsite() {
    if (!prompt.trim()) {
      setGenerationError("Enter a prompt before building your preview.");
      return;
    }

    const requestId = generationRequestId.current + 1;
    generationRequestId.current = requestId;
    setGeneratedCode(createWebsite(prompt, theme, sections, brandStyle, audience, ctaLabel));
    setLoading(true);
    setGenerationError("");
    setGenerationInfo({ provider: "LOCAL", note: "Quick preview ready; AI is adding prompt-specific details." });

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, theme, sections, brandStyle, audience, ctaLabel }),
      });

      const rawText = await response.text();
      let data = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error("Server returned an invalid response.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || "Website generation failed.");
      }

      if (!data.html) {
        throw new Error("Server returned an empty website response.");
      }

      if (requestId !== generationRequestId.current) return;

      setGeneratedCode(data.html);
      setGenerationInfo({
        provider: data.provider ? data.provider.toUpperCase() : "LOCAL",
        note: data.note || "Generated successfully.",
      });

      setRecentPrompts((previous) => {
        const next = [prompt.trim(), ...previous.filter((item) => item !== prompt.trim())].slice(0, 3);
        localStorage.setItem("vibeui-recent-prompts", JSON.stringify(next));
        return next;
      });
    } catch (error) {
      if (requestId !== generationRequestId.current) return;

      setGenerationError(
        error instanceof TypeError
          ? "Backend se connect nahi ho pa raha. Terminal mein npm run server chalao."
          : error.message
      );
      setGenerationInfo({ provider: "ERROR", note: "Preview generation failed." });
    } finally {
      if (requestId === generationRequestId.current) {
        setLoading(false);
      }
    }
  }

  function toggleSection(name) {
    setSections((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function changeBrandStyle(nextStyle) {
    setBrandStyle(nextStyle);
    setGeneratedCode(createWebsite(prompt, theme, sections, nextStyle, audience, ctaLabel));
    setGenerationError("");
    setGenerationInfo({
      provider: "LOCAL",
      note: `${nextStyle.charAt(0).toUpperCase() + nextStyle.slice(1)} brand style applied.`,
    });
    setPreviewVersion((version) => version + 1);
  }

  function changeAudience(nextAudience) {
    setAudience(nextAudience);
    setGeneratedCode(createWebsite(prompt, theme, sections, brandStyle, nextAudience, ctaLabel));
    setGenerationError("");
    setGenerationInfo({
      provider: "LOCAL",
      note: `Preview tailored for ${nextAudience}.`,
    });
    setPreviewVersion((version) => version + 1);
  }

  function changeCtaLabel(nextCtaLabel) {
    setCtaLabel(nextCtaLabel);
    setGeneratedCode(createWebsite(prompt, theme, sections, brandStyle, audience, nextCtaLabel));
    setGenerationError("");
    setGenerationInfo({
      provider: "LOCAL",
      note: "Primary action updated in the preview.",
    });
    setPreviewVersion((version) => version + 1);
  }

  function resetWorkspace() {
    generationRequestId.current += 1;
    setPrompt("Create a modern landing page for an AI education platform");
    setTheme("light");
    setSections({ hero: true, features: true, pricing: true });
    setBrandStyle("minimal");
    setAudience("startup founders");
    setCtaLabel("Get Started");
    setGeneratedCode(createWebsite(
      "Create a modern landing page for an AI education platform",
      "light",
      { hero: true, features: true, pricing: true },
      "minimal",
      "startup founders",
      "Get Started"
    ));
    setLoading(false);
    setCopied(false);
    setPreviewTab("preview");
    localStorage.removeItem("vibeui-recent-prompts");
    setRecentPrompts([]);
    setGenerationError("");
    setGenerationInfo({ provider: "", note: "" });
    setPreviewVersion((version) => version + 1);
  }

  async function copyCode() {
    if (!generatedCode) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedCode);
      } else {
        const copyArea = document.createElement("textarea");
        copyArea.value = generatedCode;
        copyArea.style.position = "fixed";
        copyArea.style.opacity = "0";
        document.body.appendChild(copyArea);
        copyArea.focus();
        copyArea.select();
        document.execCommand("copy");
        copyArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setGenerationError("Copy blocked by the browser. Please allow clipboard access and try again.");
    }
  }

  function downloadHtml() {
    if (!generatedCode) return;

    const blob = new Blob([generatedCode], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vibeui-landing-page.html";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className={`app-shell ${theme === "dark" ? "theme-dark" : ""}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup">
            <span className="brand-mark">V</span>
            <span className="brand-name">VibeUI</span>
            <span className="brand-divider" />
            <span className="brand-product">STUDIO</span>
          </div>

          <div className="topbar-status">
            <span className="status-dot" />
            <span>WORKSPACE READY</span>
          </div>

          <button type="button" onClick={copyCode} disabled={!generatedCode} className="button button-copy">
            {copied ? "Copied" : "Copy HTML"}
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="workspace-intro">
          <div>
            <p className="eyebrow"><span /> CREATIVE WORKSPACE / 01</p>
            <h1>Make your next idea <em>real.</em></h1>
          </div>
          <p className="intro-note">Shape a page, tune the details, and see it come together.</p>
        </section>

        <div className="workspace-grid">
          <aside className="control-panel">
            <div className="panel-heading">
              <span className="step-index">01</span>
              <div>
                <h2>Start with an idea</h2>
                <p>Describe the page you want to make.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="site-prompt">YOUR PROMPT</label>
            <textarea id="site-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="A calm, modern landing page for..." />

            <div className="prompt-examples">
              <span className="field-label">TRY A STARTER</span>
              <div className="example-list">
                {["A coffee shop", "A design studio", "An online course"].map((example) => (
                  <button type="button" key={example} className="example-chip" onClick={() => setPrompt(`Create a landing page for ${example.toLowerCase()}`)}>
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {recentPrompts.length > 0 && (
              <div className="recent-prompts">
                <span className="field-label">RECENT BUILDS</span>
                <div className="recent-list">
                  {recentPrompts.map((recentPrompt) => (
                    <button type="button" key={recentPrompt} className="recent-chip" onClick={() => setPrompt(recentPrompt)} title={recentPrompt}>
                      <span aria-hidden="true">&gt;</span>{recentPrompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="button" onClick={generateWebsite} disabled={loading} className="button button-generate">
              <span>{loading ? "Building your preview" : "Build my preview"}</span>
              <span className="button-arrow" aria-hidden="true">&gt;</span>
            </button>

            {generationError && <p className="generation-error" role="alert">{generationError}</p>}
            {(generationInfo.provider || generationInfo.note) && (
              <div className="generation-status" aria-live="polite">
                <span className="generation-badge">{generationInfo.provider || "STATUS"}</span>
                <span className="generation-note">{generationInfo.note || "Preview ready."}</span>
              </div>
            )}

            <div className="panel-rule" />

            <fieldset className="setting-group">
              <legend>MODE</legend>
              <div className="theme-switch" aria-label="Preview color theme">
                <button type="button" aria-pressed={theme === "light"} className={theme === "light" ? "is-selected" : ""} onClick={() => setTheme("light")}>
                  <span className="theme-swatch swatch-light" /> Light
                </button>
                <button type="button" aria-pressed={theme === "dark"} className={theme === "dark" ? "is-selected" : ""} onClick={() => setTheme("dark")}>
                  <span className="theme-swatch swatch-dark" /> Dark
                </button>
              </div>
            </fieldset>

            <fieldset className="setting-group section-settings">
              <legend>INCLUDE SECTIONS</legend>
              <div className="section-list">
                {[["hero", "Hero section", "01"], ["features", "Features", "02"], ["pricing", "Pricing", "03"]].map(([key, label, number]) => (
                  <label className="section-option" key={key}>
                    <span className="section-number">{number}</span>
                    <span className="section-label">{label}</span>
                    <input type="checkbox" checked={sections[key]} onChange={() => toggleSection(key)} />
                    <span className="toggle-track" aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="style-block">
              <span className="field-label">BRAND STYLE</span>
              <div className="style-pills">
                {[
                  { value: "minimal", label: "Minimal" },
                  { value: "luxury", label: "Luxury" },
                  { value: "startup", label: "Startup" },
                  { value: "wellness", label: "Wellness" },
                ].map((style) => (
                  <button key={style.value} type="button" className={brandStyle === style.value ? "style-pill is-selected" : "style-pill"} onClick={() => changeBrandStyle(style.value)}>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-grid">
              <div>
                <label className="field-label" htmlFor="audience-select">AUDIENCE</label>
                <select id="audience-select" value={audience} onChange={(event) => changeAudience(event.target.value)} className="input-select">
                  <option value="startup founders">Startup founders</option>
                  <option value="students">Students</option>
                  <option value="design teams">Design teams</option>
                  <option value="creative brands">Creative brands</option>
                  <option value="local businesses">Local businesses</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="cta-input">PRIMARY CTA</label>
                <input id="cta-input" value={ctaLabel} onChange={(event) => changeCtaLabel(event.target.value)} className="input-select" placeholder="Get Started" />
              </div>
            </div>

            <div className="engine-note">
              <span className="engine-mark" aria-hidden="true">*</span>
              <p><strong>Vibe check</strong><br />Your preview updates as you tune the details.</p>
            </div>

            <div className="action-row">
              <button type="button" className="reset-button" onClick={resetWorkspace}>
                <span aria-hidden="true">↻</span>
                Reset workspace
              </button>
              <button type="button" className="download-button" onClick={downloadHtml}>
                Download HTML
              </button>
            </div>
          </aside>

          <section className="preview-panel" aria-label="Website preview">
            <div className="browser-bar">
              <div className="window-controls" aria-hidden="true"><span /> <span /> <span /></div>
              <div className="address-bar">vibeui.studio / preview</div>
              <span className="browser-live"><span /> LIVE</span>
            </div>

            <div className="preview-heading">
              <div>
                <h2>Live preview</h2>
                <p>Your canvas, refreshed in real time.</p>
              </div>
              <div className="preview-tools">
                <div className="preview-tabs" role="tablist" aria-label="Preview views">
                  <button type="button" role="tab" aria-selected={previewTab === "preview"} className={previewTab === "preview" ? "is-selected" : ""} onClick={() => setPreviewTab("preview")}>Preview</button>
                  <button type="button" role="tab" aria-selected={previewTab === "html"} className={previewTab === "html" ? "is-selected" : ""} onClick={() => setPreviewTab("html")}>HTML Code</button>
                </div>
                <button type="button" className="refresh-preview" onClick={() => setPreviewVersion((version) => version + 1)} title="Refresh preview" aria-label="Refresh preview">↻</button>
                <span className="preview-size">DESKTOP <i /> 100%</span>
              </div>
            </div>

            <div className="preview-canvas">
              {previewTab === "html" ? (
                <div className="html-code-view">
                  <div className="html-code-heading">
                    <div>
                      <span className="backend-kicker">GENERATED SOURCE / HTML</span>
                      <h3>Your prompt rendered as code</h3>
                    </div>
                    <span className="html-code-count">{generatedCode.length.toLocaleString()} chars</span>
                  </div>
                  <div className="html-code-card">
                    <div className="code-card-heading"><span>Generated HTML</span><span>index.html</span></div>
                    <pre><code>{generatedCode || "Build your preview to generate HTML code."}</code></pre>
                  </div>
                </div>
              ) : loading ? (
                <div className="loading-state" role="status">
                  <span className="loading-orbit" />
                  <p>Putting your page together...</p>
                </div>
              ) : (
                <iframe key={previewVersion} title="Generated website preview" srcDoc={addPreviewInteractions(applyPreviewTheme(generatedCode, theme))} sandbox="allow-scripts" className="preview-frame" />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
