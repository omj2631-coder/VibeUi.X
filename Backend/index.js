import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
let openAiBillingUnavailable = false;
let geminiApiKeyInvalid = false;

app.use(cors());
app.use(express.json());

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeGeneratedHtml(rawHtml = "") {
  let text = String(rawHtml || "").trim();
  text = text.replace(/^```(?:html|xml|markup)?\s*/i, "");
  text = text.replace(/\s*```\s*$/i, "");

  const startIndex = text.search(/<html[\s>]/i);
  const endIndex = text.search(/<\/html>\s*$/i);

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return text.slice(startIndex, endIndex + "</html>".length);
  }

  return text;
}

function buildFallbackHtml(prompt, theme = "light", sections = {}, brandStyle = "minimal", audience = "general audience", ctaLabel = "Get Started") {
  const selectedSections = {
    hero: sections.hero !== false,
    features: sections.features !== false,
    pricing: sections.pricing !== false,
  };
  const safePrompt = escapeHtml(prompt || "Your AI-powered idea");
  const normalizedPrompt = String(prompt || "Your AI-powered idea")
    .replace(/\b(create|build|design|make|launch|modern|beautiful|responsive|professional|landing|page|website|site|for)\b/gi, "")
    .replace(/\b(a|an|the)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const subject = normalizedPrompt ? normalizedPrompt.split(/\s+/).slice(0, 5).join(" ") : "new idea";
  const heroTitle = `Meet your new favorite ${subject}`;
  const palette = {
    minimal: { primary: "#193b36", accent: "#d8f27a", soft: "#edf3e5", ink: "#193b36" },
    luxury: { primary: "#4c3328", accent: "#d8b574", soft: "#f3eadb", ink: "#704d32" },
    startup: { primary: "#2458e8", accent: "#c9f36a", soft: "#eaf0ff", ink: "#2448b5" },
    wellness: { primary: "#23634e", accent: "#cce5a4", soft: "#e8f1e2", ink: "#23634e" },
  }[brandStyle] || { primary: "#193b36", accent: "#d8f27a", soft: "#edf3e5", ink: "#193b36" };
  const colors = theme === "dark"
    ? { page: "#111916", text: "#f5f5ed", muted: "#aab7ad", card: "#1b2520", border: "#344239" }
    : { page: "#f7f7f0", text: "#1b2823", muted: "#64716a", card: "#fffefa", border: "#dfe5d9" };
  const safeCta = escapeHtml(ctaLabel || "Get Started");
  const safeAudience = escapeHtml(audience || "general audience");
  const heroImage = /coffee|cafe|café|restaurant|bakery|food/i.test(prompt)
    ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85"
    : /travel|hotel|trip|destination/i.test(prompt)
      ? "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85"
      : /fitness|wellness|yoga|health/i.test(prompt)
        ? "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85"
        : /fashion|beauty|clothing|style/i.test(prompt)
          ? "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
          : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)} | Landing Page</title>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: ${colors.page}; color: ${colors.text}; font-family: "Trebuchet MS", Arial, sans-serif; }
    nav { border-bottom: 1px solid ${colors.border}; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; width: min(1160px, calc(100% - 48px)); min-height: 76px; margin: auto; }
    .brand { color: ${colors.text}; font-size: 23px; font-weight: 800; letter-spacing: 0; }
    .nav-links { display: flex; align-items: center; gap: 28px; color: ${colors.muted}; font-size: 13px; }
    .nav-links a { color: inherit; text-decoration: none; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border: 0; border-radius: 7px; padding: 0 21px; background: ${palette.primary}; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; transition: transform .18s ease, background .18s ease; }
    .button:hover { transform: translateY(-2px); background: ${palette.ink}; }
    .container { width: min(1160px, calc(100% - 48px)); margin: auto; }
    .hero { display: grid; grid-template-columns: minmax(0, .95fr) minmax(340px, 1.05fr); align-items: center; gap: clamp(36px, 7vw, 92px); padding-top: 66px; padding-bottom: 76px; }
    .eyebrow { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 24px; color: ${palette.ink}; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    .eyebrow::before { width: 22px; height: 2px; background: ${palette.primary}; content: ""; }
    h1 { max-width: 610px; margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(44px, 6vw, 76px); font-weight: 500; letter-spacing: 0; line-height: .99; }
    .hero-copy { max-width: 470px; margin: 23px 0 0; color: ${colors.muted}; font-size: 16px; line-height: 1.75; }
    .hero-actions { display: flex; align-items: center; gap: 19px; margin-top: 28px; }
    .text-link { color: ${colors.text}; font-size: 13px; font-weight: 700; text-decoration: none; }
    .hero-image-wrap { position: relative; min-width: 0; }
    .hero-image { display: block; width: 100%; aspect-ratio: 1.12; border-radius: 7px; object-fit: cover; }
    .image-caption { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; color: ${colors.muted}; font-size: 11px; }
    .image-caption strong { color: ${colors.text}; font-size: 12px; }
    .ticker { border-top: 1px solid ${colors.border}; border-bottom: 1px solid ${colors.border}; padding: 18px 0; color: ${colors.muted}; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-align: center; text-transform: uppercase; }
    section.content-section { padding: 72px 0; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 30px; }
    .section-kicker { display: block; margin-bottom: 10px; color: ${palette.ink}; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    .section-title { max-width: 580px; margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(32px, 4vw, 48px); font-weight: 500; letter-spacing: 0; line-height: 1.08; }
    .section-intro { max-width: 320px; margin: 0 0 3px; color: ${colors.muted}; font-size: 13px; line-height: 1.7; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid ${colors.border}; }
    .feature { min-height: 190px; padding: 24px 22px 18px 0; }
    .feature + .feature { border-left: 1px solid ${colors.border}; padding-left: 22px; }
    .feature-number { display: block; margin-bottom: 28px; color: ${palette.ink}; font-family: Georgia, "Times New Roman", serif; font-size: 18px; }
    .feature h3 { margin: 0 0 10px; font-size: 17px; }
    .feature p { max-width: 290px; margin: 0; color: ${colors.muted}; font-size: 13px; line-height: 1.7; }
    .pricing-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .price-card { border: 1px solid ${colors.border}; border-radius: 7px; padding: 24px; background: ${colors.card}; }
    .price-card.featured { border-color: ${palette.primary}; box-shadow: inset 0 3px ${palette.primary}; }
    .price-card h3 { margin: 0; font-size: 15px; }
    .price { margin: 20px 0 12px; font-family: Georgia, "Times New Roman", serif; font-size: 40px; }
    .price-card p { min-height: 42px; margin: 0; color: ${colors.muted}; font-size: 12px; line-height: 1.65; }
    .price-card .button { width: 100%; margin-top: 20px; }
    footer { border-top: 1px solid ${colors.border}; padding: 25px 0; color: ${colors.muted}; font-size: 11px; }
    .footer-inner { display: flex; justify-content: space-between; gap: 20px; }
    @media (max-width: 760px) { .nav-links { display: none; } .hero { grid-template-columns: 1fr; gap: 35px; padding-top: 46px; } .hero-image { aspect-ratio: 1.25; } .section-heading { align-items: start; flex-direction: column; } .feature-grid, .pricing-grid { grid-template-columns: 1fr; } .feature { min-height: auto; padding: 21px 0; } .feature + .feature { border-top: 1px solid ${colors.border}; border-left: 0; padding-left: 0; } .feature-number { margin-bottom: 14px; } }
    @media (max-width: 440px) { .container, .nav-inner { width: calc(100% - 32px); } .hero-actions { align-items: start; flex-direction: column; } .image-caption { align-items: start; flex-direction: column; } .footer-inner { flex-direction: column; } }
  </style>
</head>
<body>
  <nav><div class="nav-inner"><a class="brand" href="#top" style="text-decoration:none">VibeUI</a><div class="nav-links"><a href="#features">Why it works</a><a href="#pricing">Plans</a></div><a class="button" href="#features">${safeCta}</a></div></nav>

  ${selectedSections.hero ? `<section class="hero container" id="top">
    <div class="hero-content">
      <div class="eyebrow">Made for ${safeAudience}</div>
      <h1>${escapeHtml(heroTitle)}</h1>
      <p class="hero-copy">A thoughtful new take on ${escapeHtml(subject)}. ${safePrompt}</p>
      <div class="hero-actions"><a class="button" href="#features">${safeCta}</a><a class="text-link" href="#features">Explore what is inside</a></div>
    </div>
    <div class="hero-image-wrap">
      <img class="hero-image" src="${heroImage}" alt="A welcoming scene for ${escapeHtml(subject)}" />
      <div class="image-caption"><strong>${escapeHtml(subject)}</strong><span>Designed around you</span></div>
    </div>
  </section>` : ""}

  ${selectedSections.hero ? `<div class="ticker">A fresh perspective &nbsp; / &nbsp; Made for ${safeAudience} &nbsp; / &nbsp; Ready when you are</div>` : ""}

  ${selectedSections.features ? `<section class="content-section container" id="features">
    <div class="section-heading"><div><span class="section-kicker">A better experience</span><h2 class="section-title">The little details make all the difference.</h2></div><p class="section-intro">Everything is shaped around ${escapeHtml(subject)}, with less noise and more room for what matters.</p></div>
    <div class="feature-grid">
      <div class="feature">
        <span class="feature-number">01</span><h3>Easy to get into</h3>
        <p>A clear first step, a calm flow, and a welcoming place to begin.</p>
      </div>
      <div class="feature">
        <span class="feature-number">02</span><h3>Made for your people</h3>
        <p>Useful details and thoughtful choices for ${safeAudience}.</p>
      </div>
      <div class="feature">
        <span class="feature-number">03</span><h3>Room to grow</h3>
        <p>A flexible foundation that feels just as good as your idea grows.</p>
      </div>
    </div>
  </section>` : ""}

  ${selectedSections.pricing ? `<section class="content-section container" id="pricing">
    <div class="section-heading"><div><span class="section-kicker">Clear from day one</span><h2 class="section-title">Choose a plan that fits.</h2></div><p class="section-intro">Start simple and move up when you are ready. No surprises.</p></div>
    <div class="pricing-grid">
      <div class="price-card">
        <h3>Starter</h3>
        <div class="price">INR 0</div>
        <p>Everything you need to get started.</p><a class="button" href="#top">Choose Starter</a>
      </div>
      <div class="price-card featured">
        <h3>Pro</h3>
        <div class="price">INR 499</div>
        <p>More room for your next big step.</p><a class="button" href="#top">Choose Pro</a>
      </div>
      <div class="price-card">
        <h3>Business</h3>
        <div class="price">INR 999</div>
        <p>Bring your team and ideas together.</p><a class="button" href="#top">Choose Business</a>
      </div>
    </div>
  </section>` : ""}

  <footer><div class="footer-inner container"><span>VibeUI</span><span>A little more thoughtful, by design.</span></div></footer>
</body>
</html>`;
}

async function generateWithGemini(prompt, theme, sections, brandStyle = "minimal", audience = "general audience", ctaLabel = "Get Started") {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey || geminiApiKeyInvalid) return null;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + geminiKey,
      {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create a polished, concise responsive landing page for: ${prompt}. Style: ${brandStyle}; audience: ${audience}; theme: ${theme}. Write specific benefit-led copy, an editorial hero, three useful features, and only these sections: ${["hero", "features", "pricing"].filter((section) => sections[section] !== false).join(", ") || "none"}. Include one relevant images.unsplash.com photo with alt text and CTA "${ctaLabel}". Use compact embedded CSS (no more than 50 rules), no comments, frameworks, scripts, CDNs, or external stylesheets. Keep HTML concise and always return a complete document including </body></html>.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 3000,
            candidateCount: 1,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini request failed");
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    const sanitizedText = sanitizeGeneratedHtml(text);

    if (!sanitizedText) {
      throw new Error("Gemini returned empty content");
    }

    if (!/<html[\s>]/i.test(sanitizedText) || !/<body[\s>]/i.test(sanitizedText) || !/<\/html>/i.test(sanitizedText)) {
      throw new Error("Gemini returned incomplete HTML");
    }

    return sanitizedText;
  } catch (error) {
    if (/api key not valid|invalid api key/i.test(error.message)) {
      geminiApiKeyInvalid = true;
    }
    console.warn("Gemini failed, falling back:", error.message);
    return null;
  }
}

async function generateWithOpenAI(prompt, theme, sections, brandStyle = "minimal", audience = "general audience", ctaLabel = "Get Started") {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey || openAiBillingUnavailable || process.env.ENABLE_PAID_AI !== "true") return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You generate complete, responsive standalone HTML websites. Use embedded CSS only; do not use external stylesheets, scripts, CDNs, or Tailwind classes. Return only valid HTML, without Markdown fences.",
          },
          {
            role: "user",
            content: `Create a polished, production-quality standalone landing page based on this brief: ${prompt}\nUse a ${brandStyle} visual style for ${audience} and a ${theme} color theme. Write specific benefit-led copy, avoid generic template language, and use a strong editorial hierarchy with a distinctive hero composition, generous whitespace, a restrained multi-color palette, and one relevant images.unsplash.com photo with meaningful alt text. Make the page responsive and give links and buttons sensible actions. Primary CTA: ${ctaLabel}. Include only these sections: ${["hero", "features", "pricing"].filter((section) => sections[section] !== false).join(", ") || "none"}. Avoid repeated cards, excessive gradients, emoji, and placeholder content.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenAI request failed");
    }

    const html = data?.choices?.[0]?.message?.content;
    const sanitizedHtml = sanitizeGeneratedHtml(html);

    if (!sanitizedHtml) {
      throw new Error("OpenAI returned empty HTML");
    }

    return sanitizedHtml;
  } catch (error) {
    if (/no credits|insufficient_quota|billing|quota/i.test(error.message)) {
      openAiBillingUnavailable = true;
    }
    console.warn("OpenAI failed, falling back:", error.message);
    return null;
  }
}
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "VibeUI backend",
  });
});
app.post("/api/generate", async (req, res) => {
  const {
    prompt,
    theme = "light",
    sections = {},
    brandStyle = "minimal",
    audience = "general audience",
    ctaLabel = "Get Started",
  } = req.body;

  if (!prompt?.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const selectedTheme = theme === "dark" ? "dark" : "light";
  const selectedSections = sections && typeof sections === "object" ? sections : {};
  const selectedStyle = ["minimal", "luxury", "startup", "wellness"].includes(brandStyle)
    ? brandStyle
    : "minimal";
  const selectedAudience = String(audience || "general audience").trim() || "general audience";
  const selectedCta = String(ctaLabel || "Get Started").trim() || "Get Started";

  const hasFreeAiKey =
    Boolean(process.env.GEMINI_API_KEY) ||
    Boolean(process.env.GOOGLE_API_KEY);

  try {
    const htmlFromGemini = await generateWithGemini(
      prompt,
      selectedTheme,
      selectedSections,
      selectedStyle,
      selectedAudience,
      selectedCta
    );
    if (htmlFromGemini) {
      return res.json({ html: htmlFromGemini, prompt, provider: "gemini" });
    }

    const htmlFromOpenAI = await generateWithOpenAI(
      prompt,
      selectedTheme,
      selectedSections,
      selectedStyle,
      selectedAudience,
      selectedCta
    );
    if (htmlFromOpenAI) {
      return res.json({ html: htmlFromOpenAI, prompt, provider: "openai" });
    }

    const fallbackHtml = buildFallbackHtml(
      prompt,
      selectedTheme,
      selectedSections,
      selectedStyle,
      selectedAudience,
      selectedCta
    );
    const fallbackNote = openAiBillingUnavailable
      ? "OpenAI credits are unavailable, so the local fallback generator is being used."
      : geminiApiKeyInvalid
        ? "Gemini API key is invalid. Replace GEMINI_API_KEY in .env; using the local fallback generator."
        : hasFreeAiKey
          ? "Gemini is unavailable, so the local fallback generator is being used."
        : "No Gemini API key is configured; using the local fallback generator.";

    return res.json({
      html: fallbackHtml,
      prompt,
      provider: "fallback",
      note: fallbackNote,
    });
  } catch (error) {
    console.error("Generation failed:", error);
    const fallbackHtml = buildFallbackHtml(
      prompt,
      selectedTheme,
      selectedSections,
      selectedStyle,
      selectedAudience,
      selectedCta
    );
    return res.status(200).json({
      html: fallbackHtml,
      prompt,
      provider: "fallback",
      note: openAiBillingUnavailable
        ? "OpenAI credits are unavailable, so the local fallback generator is being used."
        : geminiApiKeyInvalid
          ? "Gemini API key is invalid. Replace GEMINI_API_KEY in .env; using the local fallback generator."
          : hasFreeAiKey
            ? "Gemini is unavailable, so the local fallback generator is being used."
            : "No Gemini API key is configured; using the local fallback generator.",
    });
  }
});

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

