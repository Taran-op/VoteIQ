/**
 * @fileoverview VoteIQ — Election Education Platform
 * @description An interactive civic education platform powered by Google Gemini AI.
 * Helps citizens understand democratic election processes through maps, timelines,
 * glossaries, quizzes, and an AI-powered assistant.
 * @version 2.0.0
 */

import {
  useState, useEffect, useRef,
  useCallback, useMemo, memo, Component
} from "react";
import PropTypes from "prop-types";

/* ─── GOOGLE ANALYTICS ───────────────────────────── */
/**
 * Track a Google Analytics 4 event
 * @param {string} action - Event action name
 * @param {string} category - Event category
 * @param {string} [label] - Optional event label
 */
const trackEvent = (action, category, label = "") => {
  if (typeof window.gtag === "function") {
    window.gtag("event", action, { event_category: category, event_label: label });
  }
};

/* ─── SECURITY UTILITIES ─────────────────────────── */
/**
 * Sanitize user input to prevent XSS injection
 * @param {string} text - Raw user input
 * @returns {string} Sanitized string
 */
const sanitizeInput = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[<>"'`]/g, "").trim().slice(0, 1000);
};

/**
 * Safely escape HTML special characters in AI response text
 * @param {string} text - AI response text
 * @returns {string} HTML-safe string
 */
const escapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* ─── CUSTOM HOOKS ───────────────────────────────── */
/**
 * Rate limiting hook — prevents API abuse
 * @param {number} maxCalls - Max calls allowed per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} canCall — returns true if call is allowed
 */
const useRateLimit = (maxCalls = 10, windowMs = 60000) => {
  const calls = useRef([]);
  return useCallback(() => {
    const now = Date.now();
    calls.current = calls.current.filter((t) => now - t < windowMs);
    if (calls.current.length >= maxCalls) return false;
    calls.current.push(now);
    return true;
  }, [maxCalls, windowMs]);
};

/**
 * Debounce hook — delays value updates for performance
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in ms
 * @returns {*} Debounced value
 */
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/* ─── ERROR BOUNDARY ─────────────────────────────── */
/**
 * React Error Boundary — catches runtime errors in the component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("VoteIQ Error Boundary caught:", error, info.componentStack);
    trackEvent("error", "ErrorBoundary", error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" aria-live="assertive" style={{ padding: "3rem", textAlign: "center", color: "#e8e6e0" }}>
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong</h2>
          <p style={{ color: "#9a9890", marginBottom: "1.5rem" }}>An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ background: "#c9a84c", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}
            aria-label="Retry loading the application"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

/* ─── DESIGN TOKENS / CSS ────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0b0b0f;
    --bg2: #111118;
    --bg3: #16161f;
    --bg4: #1e1e28;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.13);
    --gold: #c9a84c;
    --gold2: #e8c97a;
    --gold-dim: rgba(201,168,76,0.15);
    --red: #d64f3a;
    --blue: #4a8fd4;
    --green: #4caf7d;
    --text: #e8e6e0;
    --text2: #9a9890;
    --text3: #5a5855;
    --display: 'Cormorant Garamond', Georgia, serif;
    --sans: 'Outfit', system-ui, sans-serif;
    --r: 10px;
    --r2: 16px;
    --focus-ring: 0 0 0 3px rgba(201,168,76,0.6);
  }

  /* ── RESET & BASE ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  /* ── ACCESSIBILITY ── */
  .skip-link {
    position: absolute; top: -48px; left: 1rem; z-index: 9999;
    background: var(--gold); color: #0b0b0f;
    padding: 10px 18px; border-radius: 0 0 8px 8px;
    font-family: var(--sans); font-weight: 600; font-size: 0.88rem;
    text-decoration: none; transition: top 0.2s;
  }
  .skip-link:focus { top: 0; }

  :focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    border-radius: 4px;
  }

  /* ── REDUCED MOTION ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }

  /* ── HIGH CONTRAST ── */
  @media (prefers-contrast: high) {
    :root {
      --border: rgba(255,255,255,0.4);
      --border2: rgba(255,255,255,0.6);
      --text2: #d0cec8;
      --text3: #888;
    }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(11,11,15,0.9); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 60px;
  }
  .nav-logo { font-family: var(--display); font-size: 1.35rem; font-weight: 600; color: var(--text); letter-spacing: 0.02em; display: flex; align-items: center; gap: 10px; cursor: pointer; background: none; border: none; }
  .nav-logo-gem { width: 22px; height: 22px; background: linear-gradient(135deg, var(--gold), var(--gold2)); clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); flex-shrink: 0; }
  .nav-tabs { display: flex; gap: 0; }
  .nav-tab { padding: 0 16px; height: 60px; border: none; background: none; font-family: var(--sans); font-size: 0.8rem; font-weight: 400; color: var(--text3); cursor: pointer; letter-spacing: 0.05em; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; text-transform: uppercase; }
  .nav-tab:hover { color: var(--text2); }
  .nav-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .nav-ask { background: var(--gold); color: #0b0b0f; border: none; border-radius: 6px; padding: 8px 18px; font-size: 0.78rem; font-weight: 600; font-family: var(--sans); cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase; transition: background 0.2s, transform 0.2s; }
  .nav-ask:hover { background: var(--gold2); transform: translateY(-1px); }

  /* ── PAGES ── */
  .page { display: none; padding-top: 60px; min-height: 100vh; }
  .page.active { display: block; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 2rem; }

  /* ── HERO ── */
  .hero-wrap { position: relative; overflow: hidden; padding: 6rem 2rem 4rem; max-width: 960px; margin: 0 auto; }
  .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center; }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.72rem; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; font-weight: 500; margin-bottom: 1.5rem; padding: 5px 12px; border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; background: var(--gold-dim); }
  .hero-eyebrow-dot { width: 5px; height: 5px; background: var(--gold); border-radius: 50%; aria-hidden: true; }
  .hero-title { font-family: var(--display); font-size: clamp(3rem, 6vw, 4.8rem); font-weight: 700; line-height: 0.95; letter-spacing: -0.02em; color: var(--text); margin-bottom: 1.5rem; }
  .hero-title-em { font-style: italic; color: var(--gold); }
  .hero-sub { font-size: 1rem; color: var(--text2); line-height: 1.75; margin-bottom: 2.5rem; font-weight: 300; max-width: 440px; }
  .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-gold { background: var(--gold); color: #0b0b0f; border: none; border-radius: 8px; padding: 13px 26px; font-size: 0.88rem; font-weight: 600; font-family: var(--sans); cursor: pointer; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; letter-spacing: 0.02em; }
  .btn-gold:hover { background: var(--gold2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.25); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); border-radius: 8px; padding: 13px 26px; font-size: 0.88rem; font-weight: 400; font-family: var(--sans); cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

  .hero-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.5rem; position: relative; overflow: hidden; }
  .hero-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 1rem 1.1rem; transition: border-color 0.2s; }
  .stat-card:hover { border-color: var(--border2); }
  .stat-card.gold { background: var(--gold-dim); border-color: rgba(201,168,76,0.25); }
  .stat-num { font-family: var(--display); font-size: 2rem; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 5px; }
  .stat-card.gold .stat-num { color: var(--gold); }
  .stat-label { font-size: 0.7rem; color: var(--text3); letter-spacing: 0.04em; }
  .did-you-know { margin-top: 12px; padding: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); display: flex; gap: 12px; align-items: flex-start; }
  .dyk-icon { width: 32px; height: 32px; flex-shrink: 0; background: var(--gold-dim); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .dyk-label { font-size: 0.72rem; font-weight: 600; color: var(--gold); margin-bottom: 3px; letter-spacing: 0.06em; text-transform: uppercase; }
  .dyk-text { font-size: 0.78rem; color: var(--text2); line-height: 1.5; }

  .feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-top: 0.5rem; }
  .feature-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.4rem 1.2rem; cursor: pointer; transition: border-color 0.25s, transform 0.25s; position: relative; overflow: hidden; }
  .feature-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
  .feature-card:hover::after { transform: scaleX(1); }
  .feature-card:hover { border-color: var(--border2); transform: translateY(-3px); }
  .feature-card.cta { background: var(--gold-dim); border-color: rgba(201,168,76,0.3); }
  .feature-card.cta:hover { background: rgba(201,168,76,0.2); }
  .feature-icon { font-size: 1.3rem; margin-bottom: 10px; }
  .feature-name { font-size: 0.9rem; font-weight: 500; color: var(--text); margin-bottom: 5px; }
  .feature-card.cta .feature-name { color: var(--gold); }
  .feature-desc { font-size: 0.75rem; color: var(--text3); line-height: 1.5; }

  /* ── SECTION ── */
  .section-wrap { max-width: 960px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .section-hdr { margin-bottom: 3rem; }
  .section-eye { font-size: 0.7rem; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; font-weight: 500; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px; }
  .section-eye::before { content: ''; width: 20px; height: 1px; background: var(--gold); }
  .section-title { font-family: var(--display); font-size: 2.8rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); line-height: 1; margin-bottom: 0.8rem; }
  .section-desc { font-size: 0.9rem; color: var(--text2); line-height: 1.7; font-weight: 300; max-width: 560px; }

  /* ── JOURNEY MAP ── */
  .jmap-outer { position: relative; border-radius: 16px; border: 1px solid var(--border); background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 28px 28px; overflow: hidden; padding: 24px; }
  .jmap-inner { position: relative; width: 100%; max-width: 800px; margin: 0 auto; }
  .jmap-node { position: absolute; border-radius: 12px; padding: 16px 18px; cursor: pointer; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; background: rgba(11,11,15,0.92); border: 1px solid rgba(255,255,255,0.09); user-select: none; }
  .jmap-node:hover { border-color: rgba(201,168,76,0.4); }
  .jmap-node.sel { border-color: var(--gold); background: rgba(201,168,76,0.06); }
  .jmap-node:focus-visible { box-shadow: var(--focus-ring); }
  .jmap-node-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .jmap-num { font-family: var(--display); font-size: 0.75rem; color: var(--text3); letter-spacing: 0.1em; }
  .jmap-name { font-size: 0.9rem; font-weight: 500; color: var(--text); line-height: 1.3; }
  .jmap-phase { font-size: 0.68rem; color: var(--text3); margin-top: 5px; }
  .jmap-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .jmap-detail { margin-top: 1.5rem; background: var(--bg2); border: 1px solid rgba(201,168,76,0.3); border-radius: 14px; padding: 1.8rem 2rem; position: relative; overflow: hidden; animation: jmFadeIn 0.25s ease; }
  @keyframes jmFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .jmap-detail::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .jmap-detail-bg { font-family: var(--display); font-size: 7rem; font-weight: 700; color: rgba(255,255,255,0.03); position: absolute; bottom: -1rem; right: 1.5rem; line-height: 1; pointer-events: none; aria-hidden: true; }
  .jmap-detail-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.4rem; }
  .jmap-detail-title { font-family: var(--display); font-size: 1.5rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .jmap-detail-phase { font-size: 0.7rem; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; }
  .jmap-detail-body { font-size: 0.875rem; color: var(--text2); line-height: 1.85; font-weight: 300; margin-bottom: 0.8rem; }
  .jmap-close { background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text3); font-family: var(--sans); font-size: 0.72rem; padding: 5px 12px; cursor: pointer; transition: border-color 0.15s, color 0.15s; flex-shrink: 0; }
  .jmap-close:hover { border-color: var(--border2); color: var(--text2); }
  .fact-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .chip { font-size: 0.7rem; padding: 4px 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); }
  .j-ask-btn { font-size: 0.78rem; color: var(--gold); background: none; border: none; cursor: pointer; font-family: var(--sans); padding: 4px 0; display: flex; align-items: center; gap: 6px; margin-top: 14px; transition: opacity 0.2s; }
  .j-ask-btn:hover { opacity: 0.7; }

  /* ── TIMELINE MATRIX ── */
  .tm-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--bg2); }
  .tm-table { width: 100%; border-collapse: collapse; min-width: 680px; }
  .tm-head-row th { padding: 12px 16px; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; border-bottom: 1px solid var(--border); text-align: left; }
  .tm-head-phase { color: var(--text3); width: 140px; }
  .tm-head-c1 { color: #7ab0de; border-left: 1px solid var(--border); }
  .tm-head-c2 { color: #6fcc9b; border-left: 1px solid var(--border); }
  .tm-head-c3 { color: #e8c97a; border-left: 1px solid var(--border); }
  .tm-head-c4 { color: var(--text3); border-left: 1px solid var(--border); }
  .tm-phase-cell { padding: 16px 14px; border-bottom: 1px solid var(--border); vertical-align: top; width: 140px; }
  .tm-phase-label { font-family: var(--display); font-size: 0.82rem; font-weight: 600; color: var(--text2); line-height: 1.4; }
  .tm-phase-sub { font-size: 0.62rem; color: var(--text3); margin-top: 3px; letter-spacing: 0.04em; text-transform: uppercase; }
  .tm-cell { padding: 12px 14px; border-bottom: 1px solid var(--border); border-left: 1px solid var(--border); vertical-align: top; }
  .tm-row:last-child .tm-phase-cell, .tm-row:last-child .tm-cell { border-bottom: none; }
  .tm-event { padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; border-left: 2px solid; background: var(--bg3); }
  .tm-event:last-child { margin-bottom: 0; }
  .tm-event-name { font-size: 0.78rem; font-weight: 500; color: var(--text); margin-bottom: 3px; }
  .tm-event-detail { font-size: 0.7rem; color: var(--text3); line-height: 1.5; }
  .tm-event.done { border-left-color: #4caf7d; }
  .tm-event.now { border-left-color: #d64f3a; }
  .tm-event.soon { border-left-color: #4a8fd4; }
  .tm-event.future { border-left-color: #3a3a48; }
  .tm-empty { color: var(--text3); font-size: 0.7rem; opacity: 0.4; padding: 4px 2px; }

  /* ── GLOSSARY ── */
  .gloss-search-wrap { position: relative; margin-bottom: 2rem; }
  .gloss-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 0.9rem; pointer-events: none; }
  .gloss-search { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg2); font-family: var(--sans); font-size: 0.88rem; color: var(--text); outline: none; transition: border-color 0.2s; }
  .gloss-search:focus { border-color: var(--gold); }
  .gloss-search::placeholder { color: var(--text3); }
  .gloss-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
  .gloss-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.2rem; cursor: pointer; transition: border-color 0.2s; }
  .gloss-card:hover { border-color: var(--border2); }
  .gloss-card.open { border-color: var(--gold); background: rgba(201,168,76,0.04); }
  .gloss-cat { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
  .gloss-term { font-size: 0.95rem; font-weight: 500; color: var(--text); margin-bottom: 6px; }
  .gloss-toggle { font-size: 0.72rem; color: var(--gold); }
  .gloss-def { font-size: 0.8rem; color: var(--text2); line-height: 1.7; display: none; font-weight: 300; margin-top: 10px; }
  .gloss-card.open .gloss-def { display: block; }
  .gloss-empty { text-align: center; padding: 2rem; color: var(--text3); font-size: 0.9rem; }

  /* ── QUIZ ── */
  .quiz-wrap { max-width: 640px; }
  .quiz-progress { display: flex; gap: 5px; margin-bottom: 2.5rem; }
  .quiz-pip { height: 3px; flex: 1; border-radius: 2px; background: var(--bg3); transition: background 0.3s; }
  .quiz-pip.done { background: var(--green); }
  .quiz-pip.active { background: var(--gold); }
  .quiz-qnum { font-size: 0.72rem; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
  .quiz-question { font-family: var(--display); font-size: 1.6rem; font-weight: 600; line-height: 1.25; color: var(--text); margin-bottom: 2rem; }
  .quiz-opts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
  .quiz-opt { padding: 13px 16px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg2); text-align: left; cursor: pointer; font-family: var(--sans); font-size: 0.88rem; color: var(--text); transition: border-color 0.15s, background 0.15s; display: flex; align-items: center; gap: 12px; }
  .quiz-opt:hover:not(:disabled) { border-color: var(--border2); background: var(--bg3); }
  .quiz-opt:disabled { cursor: default; }
  .quiz-opt.correct { background: rgba(76,175,125,0.1); border-color: var(--green); color: var(--green); }
  .quiz-opt.wrong { background: rgba(214,79,58,0.1); border-color: var(--red); color: var(--red); }
  .opt-letter { width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: var(--text3); }
  .quiz-opt.correct .opt-letter { background: var(--green); color: #0b0b0f; }
  .quiz-opt.wrong .opt-letter { background: var(--red); color: white; }
  .quiz-fb { padding: 12px 16px; border-radius: var(--r); font-size: 0.84rem; line-height: 1.7; font-weight: 300; display: none; }
  .quiz-fb.show { display: block; }
  .quiz-fb.ok { background: rgba(76,175,125,0.08); color: #6fcc9b; border: 1px solid rgba(76,175,125,0.2); }
  .quiz-fb.no { background: rgba(214,79,58,0.08); color: #e87c6a; border: 1px solid rgba(214,79,58,0.2); }
  .quiz-result { text-align: center; padding: 4rem 2rem; border: 1px solid var(--border); border-radius: var(--r2); background: var(--bg2); position: relative; overflow: hidden; }
  .quiz-result::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .quiz-score { font-family: var(--display); font-size: 5rem; font-weight: 700; color: var(--gold); line-height: 1; margin-bottom: 10px; }
  .quiz-result-msg { font-size: 1rem; color: var(--text2); margin-bottom: 2rem; }

  /* ── COMPARE ── */
  .compare-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .cmp-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.5rem; transition: transform 0.25s, border-color 0.25s; position: relative; overflow: hidden; }
  .cmp-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; bottom: 0; background: var(--border); transition: background 0.2s; border-radius: 3px 0 0 3px; }
  .cmp-card:hover { transform: translateY(-3px); border-color: var(--border2); }
  .cmp-card:hover::before { background: var(--gold); }
  .cmp-icon { font-size: 1.4rem; margin-bottom: 1rem; }
  .cmp-name { font-size: 0.98rem; font-weight: 500; color: var(--text); margin-bottom: 8px; }
  .cmp-desc { font-size: 0.8rem; color: var(--text2); line-height: 1.65; font-weight: 300; margin-bottom: 1.2rem; }
  .cmp-pro { display: flex; gap: 8px; margin-bottom: 5px; font-size: 0.78rem; color: #6fcc9b; }
  .cmp-con { display: flex; gap: 8px; margin-bottom: 5px; font-size: 0.78rem; color: #e87c6a; }
  .cmp-ai-card { background: var(--gold-dim); border-color: rgba(201,168,76,0.25); }
  .cmp-ai-card:hover::before { background: var(--gold2); }
  .cmp-ai-label { font-size: 0.68rem; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }

  /* ── AI CHAT ── */
  .ai-layout { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; }
  .ai-sb-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; padding: 0 2px; }
  .topic-btn { width: 100%; text-align: left; padding: 9px 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; font-family: var(--sans); font-size: 0.8rem; color: var(--text2); cursor: pointer; margin-bottom: 6px; transition: border-color 0.15s, color 0.15s, background 0.15s; line-height: 1.45; }
  .topic-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
  .chat-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); display: flex; flex-direction: column; height: 570px; position: relative; overflow: hidden; }
  .chat-wrap::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .chat-header { padding: 1rem 1.4rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .chat-avatar { width: 34px; height: 34px; background: linear-gradient(135deg, var(--gold), var(--gold2)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--display); font-size: 1rem; color: #0b0b0f; font-weight: 700; }
  .chat-name { font-size: 0.9rem; font-weight: 500; color: var(--text); }
  .chat-status { font-size: 0.7rem; color: var(--text3); display: flex; align-items: center; gap: 5px; }
  .status-dot { width: 5px; height: 5px; background: var(--green); border-radius: 50%; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
  .msg { max-width: 86%; animation: fadeSlide 0.3s ease; }
  .msg.user { align-self: flex-end; }
  .msg.assistant { align-self: flex-start; }
  .msg-bubble { padding: 10px 14px; border-radius: 12px; font-size: 0.84rem; line-height: 1.75; font-weight: 300; }
  .msg.user .msg-bubble { background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.25); color: var(--text); border-radius: 12px 12px 2px 12px; }
  .msg.assistant .msg-bubble { background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-radius: 2px 12px 12px 12px; }
  .msg-bubble p { margin-bottom: 0.6rem; }
  .msg-bubble p:last-child { margin-bottom: 0; }
  .typing-bubble { display: flex; gap: 4px; align-items: center; padding: 14px 16px; }
  .typing-dot { width: 5px; height: 5px; background: var(--text3); border-radius: 50%; animation: blink 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
  @keyframes fadeSlide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
  .chat-input-wrap { padding: 1rem 1.2rem; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .chat-input { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg3); font-family: var(--sans); font-size: 0.85rem; color: var(--text); outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--gold); }
  .chat-input::placeholder { color: var(--text3); }
  .chat-send { background: var(--gold); color: #0b0b0f; border: none; border-radius: 8px; padding: 10px 18px; font-family: var(--sans); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .chat-send:hover { background: var(--gold2); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .chat-err { font-size: 0.78rem; color: var(--red); padding: 4px 1.2rem; }
  .chat-rate-limit { font-size: 0.78rem; color: var(--text3); padding: 4px 1.2rem; }

  /* ── TAGS ── */
  .tag { font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; display: inline-block; }
  .tag-done { background: rgba(76,175,125,0.12); color: #6fcc9b; border: 1px solid rgba(76,175,125,0.2); }
  .tag-now { background: rgba(214,79,58,0.12); color: #e87c6a; border: 1px solid rgba(214,79,58,0.2); }
  .tag-info { background: rgba(74,143,212,0.12); color: #7ab0de; border: 1px solid rgba(74,143,212,0.2); }
  .tag-muted { background: var(--bg3); color: var(--text3); border: 1px solid var(--border); }
  .gold-divider { width: 40px; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); margin: 1rem 0 3rem; }

  /* ── RESPONSIVE ── */
  @media (max-width: 720px) {
    .hero-grid { grid-template-columns: 1fr; }
    .hero-panel { display: none; }
    .ai-layout { grid-template-columns: 1fr; }
    .ai-sidebar { display: none; }
    .nav-tabs { display: none; }
    .section-title { font-size: 2rem; }
    .hero-title { font-size: 2.6rem; }
    .jmap-outer { padding: 12px; }
    .jmap-mobile-list { display: flex !important; }
    .jmap-canvas { display: none !important; }
  }

  @media print {
    .nav, .hero-ctas, .chat-input-wrap, .nav-ask { display: none; }
    body { background: white; color: black; }
  }
`;

/* ─── DATA ───────────────────────────────────────── */
const JOURNEY_STEPS = [
  { num: "01", phase: "Months 18–12 before", name: "Voter Registration", tag: "Foundational", tagType: "done", dotColor: "#4caf7d", paras: ["Before anyone can vote, they must register. This is the government confirming who you are and that you're eligible — typically a citizen, 18+, and a resident of the district. Registration deadlines vary widely: some places close rolls 30 days before; others allow same-day registration.", "Many countries are moving to automatic registration when citizens receive national IDs. In the US, registration is managed state-by-state. In the UK, it's done through individual electoral registration online."], facts: ["Must be 18+ in most countries", "Citizenship required", "Deadlines vary by jurisdiction", "Online registration now common"], askQ: "How do I register to vote and what are the requirements?" },
  { num: "02", phase: "Months 12–6 before", name: "Candidate Nomination", tag: "Selection", tagType: "done", dotColor: "#4caf7d", paras: ["Parties must choose who will represent them before the general election. In primary elections, registered voters vote for their preferred candidate. Caucuses are community meetings where voters openly declare their preference and debate before deciding.", "Independent candidates bypass the party process by collecting petition signatures to qualify for ballot access. This threshold exists to prevent the ballot from becoming unmanageably crowded."], facts: ["Open vs closed primaries", "Caucuses (community meetings)", "Petition signatures for independents", "Convention delegates allocated"], askQ: "What is the difference between a primary election and a caucus?" },
  { num: "03", phase: "Months 6–1 before", name: "Campaign Period", tag: "Active Now", tagType: "now", dotColor: "#d64f3a", paras: ["Nominees compete directly for voter support. This includes public debates, rallies, door-knocking, social media campaigns, television advertising, and press appearances. Campaign finance laws regulate how money is raised and spent.", "Media coverage, endorsements from influential figures, and polling data all shape public opinion. Campaigns focus heavily on swing states or marginal constituencies where the race is genuinely competitive."], facts: ["Public debates", "Campaign finance rules", "Swing state targeting", "Media & endorsements"], askQ: "How does campaign finance work and who funds elections?" },
  { num: "04", phase: "Election day", name: "Casting Ballots", tag: "Upcoming", tagType: "info", dotColor: "#4a8fd4", paras: ["Registered voters go to their assigned polling station (or mail in / vote early). They verify identity, receive a ballot, mark their choice privately, and submit it. Poll workers manage the process; official party observers can monitor but not interfere.", "Early voting and absentee (mail-in) voting has expanded significantly. Some countries use electronic voting machines; others rely entirely on hand-marked paper ballots, which are generally considered more secure and auditable."], facts: ["Polling stations assigned by address", "ID requirements vary", "Early & absentee voting", "Paper vs electronic ballots"], askQ: "What happens on election day at the polling station?" },
  { num: "05", phase: "Days to weeks after", name: "Counting & Auditing", tag: "Post-Election", tagType: "muted", dotColor: "#5a5855", paras: ["After polls close, ballots are tallied by election officials — often with representatives from each party watching. Results are preliminary until they go through a canvassing process, where officials verify totals and confirm all valid ballots were counted.", "Audits verify machine accuracy. In close races, full recounts may be triggered automatically or requested by a candidate. Final results are then certified — officially declared accurate and binding."], facts: ["Canvassing process", "Risk-limiting audits", "Recount thresholds", "Official certification"], askQ: "How are ballots counted and results certified after an election?" },
  { num: "06", phase: "Weeks to months after", name: "Transition of Power", tag: "Final Stage", tagType: "muted", dotColor: "#5a5855", paras: ["The losing candidate traditionally concedes, signaling acceptance of the democratic outcome. A transition period follows — the outgoing government briefs the incoming one, transferring files, security information, and institutional knowledge.", "Inauguration is the formal swearing-in ceremony where the winner takes the oath of office. The peaceful transfer of power between opposing parties is considered one of democracy's most fundamental features."], facts: ["Concession speech tradition", "Legal transition period", "Sworn oath of office", "Peaceful power transfer"], askQ: "What happens during the presidential transition of power after an election?" },
];

const STEP_POS = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2]];

const TM_PHASES = [
  { label: "18–12 months", sub: "Before election" },
  { label: "12–6 months", sub: "Primary season" },
  { label: "6 months out", sub: "General campaign" },
  { label: "2 months – Day", sub: "Home stretch" },
  { label: "Election Day", sub: "" },
  { label: "Post-election", sub: "Certification" },
];
const TM_COLS = ["Campaign", "Nomination", "Voter Action", "Administration"];
const TM_CELLS = [
  { Campaign: [{ name: "Exploratory committees", detail: "Potential candidates quietly test the waters with donors", type: "done" }, { name: "Campaign announcements", detail: "Candidates formally declare and begin fundraising", type: "done" }], Nomination: [], "Voter Action": [{ name: "Registration drives begin", detail: "Parties and nonprofits begin organizing voter registration", type: "done" }], Administration: [] },
  { Campaign: [], Nomination: [{ name: "Primary debates", detail: "Multiple candidates debate publicly in each party", type: "done" }, { name: "Primary elections & caucuses", detail: "State-by-state voting narrows field to frontrunners", type: "done" }], "Voter Action": [], Administration: [] },
  { Campaign: [{ name: "General campaign begins", detail: "Major nominees compete directly; ad spending surges", type: "done" }], Nomination: [{ name: "Party conventions", detail: "Delegates formally nominate candidates; platforms adopted", type: "done" }], "Voter Action": [], Administration: [] },
  { Campaign: [{ name: "Presidential debates", detail: "High-stakes live debates between nominees", type: "now" }], Nomination: [], "Voter Action": [{ name: "Early & absentee voting", detail: "Mail-in ballots and in-person early voting opens", type: "soon" }, { name: "Registration closes", detail: "Most states close voter rolls 30 days before election", type: "soon" }], Administration: [] },
  { Campaign: [], Nomination: [], "Voter Action": [{ name: "Polls open — national vote", detail: "Registered voters cast ballots; results called by media as polls close", type: "soon" }], Administration: [] },
  { Campaign: [], Nomination: [], "Voter Action": [], Administration: [{ name: "Vote canvassing", detail: "All mail and provisional ballots verified and counted", type: "future" }, { name: "Results certified", detail: "Authorities formally certify results; legal challenges resolved", type: "future" }, { name: "Swearing-in ceremony", detail: "Winner takes oath of office; transition complete", type: "future" }] },
];

const GLOSSARY = [
  { term: "Electoral College", cat: "US-specific · Presidential", def: "A body of 538 electors who formally elect the US President. Each state gets electors equal to its total congressional delegation. Most states award all electors to the popular vote winner. A candidate needs 270 electoral votes to win." },
  { term: "Gerrymandering", cat: "Districts · Fairness", def: "Manipulating electoral district boundaries to favor one party. Named after Governor Elbridge Gerry, whose 1812 Massachusetts district resembled a salamander. Packing and cracking are the two main tactics." },
  { term: "Ranked-Choice Voting", cat: "Voting Systems", def: "Voters rank candidates in preference order. If no candidate gets a majority, the last-place candidate is eliminated and those votes are redistributed. Continues until someone reaches 50%+1. Reduces spoiler effects." },
  { term: "Proportional Representation", cat: "Voting Systems · International", def: "A party's share of seats roughly equals its share of the popular vote. Used widely in Europe. Tends to produce multi-party governments and coalition building." },
  { term: "Filibuster", cat: "Legislative Procedure", def: "A tactic used in the US Senate to delay or block legislation by extending debate. Under current rules, 60 of 100 senators must vote to end a filibuster (cloture), giving the minority significant power." },
  { term: "Swing State", cat: "Electoral Strategy", def: "A state where neither major party has a reliable majority, making it genuinely competitive. These states receive disproportionate campaign attention because they are most likely to determine the overall outcome." },
  { term: "Voter Suppression", cat: "Voting Rights · Fairness", def: "Efforts to discourage or prevent specific groups from voting. Historical examples include literacy tests and poll taxes. Modern concerns include strict ID requirements, reduced polling locations, and aggressive voter roll purges." },
  { term: "Referendum", cat: "Direct Democracy", def: "A direct vote by the electorate on a specific question rather than choosing between candidates. Often used for constitutional changes or major policy shifts. The 2016 Brexit vote is a notable example." },
  { term: "Canvassing", cat: "Vote Counting", def: "The official post-election process of reviewing and verifying results. Officials check all precincts have reported, provisional and mail-in ballots are adjudicated, and totals are mathematically accurate." },
  { term: "Caucus", cat: "Nomination Process", def: "A community meeting where voters publicly declare their candidate preference, debate, and may move between groups before a final count. More time-consuming and less private than a primary election." },
  { term: "Exit Poll", cat: "Research · Media", def: "Surveys conducted with voters immediately after they leave polling stations. Used by media organizations to project winners before official results are counted. Not official results — they can be wrong in close races." },
  { term: "Incumbent", cat: "Candidate Status", def: "The current holder of an elected position who is running for re-election. Incumbents typically have significant advantages: name recognition, fundraising networks, and the ability to point to their record." },
];

const QUIZ_QUESTIONS = [
  { q: "What must citizens do before they can vote in most elections?", opts: ["Attend a political rally", "Register with election authorities", "Pay a voting fee", "Join a political party"], ans: 1, exp: "Voter registration confirms your identity and eligibility — you must do it before casting a ballot in most democracies." },
  { q: "What is a \"primary election\"?", opts: ["The most important national election", "An election to choose a party's candidate", "A local school board election", "The first day of early voting"], ans: 1, exp: "A primary election lets party members vote on which candidate will represent their party in the general election." },
  { q: "In a first-past-the-post system, who wins?", opts: ["The candidate with over 50% of votes", "The candidate endorsed by most newspapers", "The candidate with the most votes, even without a majority", "The candidate who campaigned longest"], ans: 2, exp: "FPTP simply means the candidate with the most votes wins — even if that's only 35% in a crowded field." },
  { q: "What is gerrymandering?", opts: ["A type of ballot paper", "Drawing district boundaries to favor one party", "A fundraising technique", "A form of voter fraud"], ans: 1, exp: "Gerrymandering is the practice of manipulating district boundaries to give one party an electoral advantage." },
  { q: "After votes are cast, what is the \"canvassing\" process?", opts: ["Door-to-door campaigning", "Designing the ballot layout", "Officially verifying and certifying vote totals", "Broadcasting results on TV"], ans: 2, exp: "Canvassing (in election administration) means the official review and verification of vote totals before certification." },
  { q: "Which voting system eliminates the last-place candidate and redistributes their votes?", opts: ["First past the post", "Two-round runoff", "Electoral College", "Ranked-choice voting"], ans: 3, exp: "In ranked-choice voting, if no one has a majority, the lowest-ranked candidate is eliminated and votes transfer to voters' next preferences." },
  { q: "The \"peaceful transfer of power\" refers to...", opts: ["Moving ballot boxes between counties", "An outgoing leader handing power to the election winner", "Military oversight of elections", "The media calling a winner on election night"], ans: 1, exp: "The peaceful transfer of power is a cornerstone of democracy — the outgoing leader formally transfers authority to the winner." },
];

const VOTING_SYSTEMS = [
  { icon: "🎯", name: "First Past the Post (FPTP)", desc: "Each voter picks one candidate. The candidate with the most votes wins — even without a majority. Used in the US, UK, Canada, India.", pros: ["Simple and fast to count", "Clear single-winner outcomes"], cons: ["Winners often lack majority support", "Third parties rarely win", "Vulnerable to spoiler candidates"] },
  { icon: "📊", name: "Proportional Representation", desc: "Seats are allocated proportionally to vote share. Common in Europe: Germany, Netherlands, Sweden, Spain.", pros: ["Accurately reflects voter preferences", "Smaller parties get representation"], cons: ["Often produces coalition governments", "Coalition negotiations can take months", "Less direct constituency representation"] },
  { icon: "🔢", name: "Ranked-Choice Voting (RCV)", desc: "Voters rank candidates 1, 2, 3… Elimination rounds redistribute votes until someone hits 50%+. Used in Australia, Ireland, New Zealand.", pros: ["Winner has broad majority support", "Eliminates spoiler effect", "Encourages positive campaigning"], cons: ["More complex to count", "Results take longer"] },
  { icon: "🔄", name: "Two-Round System", desc: "If no candidate wins a majority in round 1, the top two face off in a runoff. Used in France, Brazil, most presidential elections globally.", pros: ["Guarantees a majority winner", "Easy to understand"], cons: ["Two elections means higher cost", "Voter fatigue between rounds"] },
  { icon: "⚖️", name: "Mixed-Member Proportional", desc: "Combines FPTP local seats with PR top-up seats to balance local representation with overall proportionality. Used in Germany, New Zealand, Scotland.", pros: ["Local AND proportional representation", "Best of both systems"], cons: ["Complex ballot design", "Two classes of representatives"] },
];

const SYSTEM_PROMPT = `You are VoteIQ, a non-partisan election education assistant powered by Google Gemini AI.
Your role is to help people understand democratic election processes clearly and objectively.
Topics: voter registration, primaries, caucuses, campaign finance, voting systems, ballot counting, certification, transitions of power.
Rules:
- Be factual, balanced, and non-partisan. Never express opinions on candidates, parties, or political positions.
- Use concrete, real-world examples.
- Keep responses concise — 2-4 paragraphs maximum.
- Use accessible language suitable for all reading levels.
- If asked about unrelated topics, gently redirect to elections and democracy.`;

/* ─── GEMINI API HELPER ──────────────────────────── */
/**
 * Call Google Gemini API with conversation history
 * @param {Array} history - Conversation history [{role, content}]
 * @returns {Promise<string>} AI response text
 */
const callGemini = async (history) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY not set in .env file");

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.4, topP: 0.95 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

/* ─── COMPONENTS ─────────────────────────────────── */

/**
 * JourneyMap — interactive S-curve node map of election stages
 */
const JourneyMap = memo(({ onAsk }) => {
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const detailRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (selected !== null && detailRef.current) {
      detailRef.current.focus();
    }
  }, [selected]);

  const CARD_W = Math.min(360, (containerWidth - 80) / 2);
  const CARD_H = 106;
  const H_GAP = Math.max(40, containerWidth - CARD_W * 2 - 40);
  const V_GAP = 60;
  const COL_X = [20, CARD_W + H_GAP + 20];
  const ROW_Y = [20, 20 + CARD_H + V_GAP, 20 + (CARD_H + V_GAP) * 2];
  const SVG_W = containerWidth;
  const SVG_H = ROW_Y[2] + CARD_H + 24;

  const nodeCx = useCallback((i) => COL_X[STEP_POS[i][0]] + CARD_W / 2, [CARD_W, COL_X]);
  const nodeCy = useCallback((i) => ROW_Y[STEP_POS[i][1]] + CARD_H / 2, [ROW_Y]);

  const connectors = useMemo(() => [
    { x1: COL_X[0] + CARD_W, y1: nodeCy(0), x2: COL_X[1], y2: nodeCy(1) },
    { x1: nodeCx(1), y1: ROW_Y[0] + CARD_H, x2: nodeCx(2), y2: ROW_Y[1] },
    { x1: COL_X[1], y1: nodeCy(2), x2: COL_X[0] + CARD_W, y2: nodeCy(3) },
    { x1: nodeCx(3), y1: ROW_Y[1] + CARD_H, x2: nodeCx(4), y2: ROW_Y[2] },
    { x1: COL_X[0] + CARD_W, y1: nodeCy(4), x2: COL_X[1], y2: nodeCy(5) },
  ], [CARD_W, COL_X, ROW_Y, nodeCx, nodeCy]);

  const handleKeyDown = useCallback((e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected((prev) => (prev === i ? null : i));
      trackEvent("select_stage", "JourneyMap", JOURNEY_STEPS[i].name);
    }
    if (e.key === "Escape") setSelected(null);
  }, []);

  const selectedStep = selected !== null ? JOURNEY_STEPS[selected] : null;

  return (
    <section aria-label="Election process node map">
      <div className="jmap-outer" ref={containerRef}>
        <div className="jmap-inner">
          <div className="jmap-canvas" style={{ position: "relative", width: "100%", height: SVG_H }} role="group" aria-label="Interactive election stages">
            <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} aria-hidden="true">
              <defs>
                <marker id="jm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(201,168,76,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {connectors.map((c, i) => (
                <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeDasharray="7 5" markerEnd="url(#jm-arr)" />
              ))}
            </svg>
            {JOURNEY_STEPS.map((step, i) => {
              const isSel = selected === i;
              return (
                <div
                  key={i}
                  className={`jmap-node${isSel ? " sel" : ""}`}
                  onClick={() => { setSelected(isSel ? null : i); trackEvent("select_stage", "JourneyMap", step.name); }}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{ left: COL_X[STEP_POS[i][0]], top: ROW_Y[STEP_POS[i][1]], width: CARD_W, height: CARD_H }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`Stage ${step.num}: ${step.name} — ${step.phase}`}
                  aria-expanded={isSel}
                >
                  <div className="jmap-node-head">
                    <div style={{ flex: 1 }}>
                      <div className="jmap-num" aria-hidden="true">NODE {step.num}</div>
                      <div className="jmap-name">{step.name}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span className={`tag tag-${step.tagType}`} style={{ fontSize: "0.6rem", padding: "3px 8px" }}>{step.tag}</span>
                      <div className="jmap-dot" style={{ background: step.dotColor }} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="jmap-phase">{step.phase}</div>
                  {isSel && <div style={{ marginTop: 8, fontSize: "0.68rem", color: "var(--gold)", letterSpacing: "0.06em" }} aria-hidden="true">▼ VIEWING DETAILS BELOW</div>}
                </div>
              );
            })}
          </div>

          {/* Mobile fallback */}
          <div className="jmap-mobile-list" style={{ display: "none", flexDirection: "column", gap: 10 }} role="list">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={i} className={`jmap-node${selected === i ? " sel" : ""}`} style={{ position: "static", width: "100%", height: "auto" }}
                role="listitem button" tabIndex={0}
                aria-pressed={selected === i}
                aria-label={`Stage ${step.num}: ${step.name}`}
                onClick={() => setSelected(selected === i ? null : i)}
                onKeyDown={(e) => handleKeyDown(e, i)}>
                <div className="jmap-node-head">
                  <div style={{ flex: 1 }}><div className="jmap-num" aria-hidden="true">NODE {step.num}</div><div className="jmap-name">{step.name}</div></div>
                  <div className="jmap-dot" style={{ background: step.dotColor }} aria-hidden="true" />
                </div>
                <div className="jmap-phase">{step.phase}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedStep && (
        <div className="jmap-detail" role="region" aria-label={`Details for ${selectedStep.name}`} aria-live="polite" ref={detailRef} tabIndex={-1}>
          <div className="jmap-detail-bg" aria-hidden="true">{selectedStep.num}</div>
          <div className="jmap-detail-hdr">
            <div>
              <div className="jmap-detail-phase">{selectedStep.phase}</div>
              <h3 className="jmap-detail-title">{selectedStep.name}</h3>
            </div>
            <button className="jmap-close" onClick={() => setSelected(null)} aria-label="Close stage details">Close ✕</button>
          </div>
          {selectedStep.paras.map((p, i) => <p key={i} className="jmap-detail-body">{p}</p>)}
          <div className="fact-chips" role="list" aria-label="Key facts">
            {selectedStep.facts.map((f) => <span key={f} className="chip" role="listitem">{f}</span>)}
          </div>
          <button className="j-ask-btn" onClick={() => { onAsk(selectedStep.askQ); trackEvent("ask_ai", "JourneyMap", selectedStep.name); }} aria-label={`Ask AI about ${selectedStep.name}`}>
            ✦ Ask AI more about this stage →
          </button>
        </div>
      )}
    </section>
  );
});
JourneyMap.displayName = "JourneyMap";
JourneyMap.propTypes = { onAsk: PropTypes.func.isRequired };

/**
 * TimelineMatrix — phase × activity stream grid
 */
const TimelineMatrix = memo(() => (
  <div className="tm-wrap" role="region" aria-label="Election timeline matrix">
    <table className="tm-table" aria-describedby="tm-desc">
      <caption id="tm-desc" style={{ display: "none" }}>
        Election timeline organized by phase (rows) and activity type (columns): Campaign, Nomination, Voter Action, and Administration
      </caption>
      <thead>
        <tr className="tm-head-row">
          <th className="tm-head-phase" scope="col">Phase</th>
          <th className="tm-head-c1" scope="col">Campaign</th>
          <th className="tm-head-c2" scope="col">Nomination</th>
          <th className="tm-head-c3" scope="col">Voter Action</th>
          <th className="tm-head-c4" scope="col">Administration</th>
        </tr>
      </thead>
      <tbody>
        {TM_PHASES.map((phase, pi) => {
          const cells = TM_CELLS[pi];
          return (
            <tr key={pi} className="tm-row">
              <td className="tm-phase-cell" scope="row">
                <div className="tm-phase-label">{phase.label}</div>
                {phase.sub && <div className="tm-phase-sub">{phase.sub}</div>}
              </td>
              {TM_COLS.map((col) => {
                const events = cells[col] || [];
                return (
                  <td key={col} className="tm-cell">
                    {events.length === 0
                      ? <div className="tm-empty" aria-label="No activity">—</div>
                      : events.map((ev, ei) => (
                        <div key={ei} className={`tm-event ${ev.type}`} role="article">
                          <div className="tm-event-name">{ev.name}</div>
                          <div className="tm-event-detail">{ev.detail}</div>
                        </div>
                      ))}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
));
TimelineMatrix.displayName = "TimelineMatrix";

/**
 * GlossCard — expandable glossary term card
 */
const GlossCard = memo(({ term, cat, def }) => {
  const [open, setOpen] = useState(false);
  const id = `gloss-${term.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <article className={`gloss-card${open ? " open" : ""}`}>
      <button
        onClick={() => { setOpen((o) => !o); trackEvent("expand_term", "Glossary", term); }}
        aria-expanded={open}
        aria-controls={id}
        style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", padding: 0, color: "inherit", font: "inherit" }}
      >
        <div className="gloss-cat">{cat}</div>
        <div className="gloss-term">{term}</div>
        <div className="gloss-toggle" aria-hidden="true">{open ? "Collapse ↑" : "Expand ↓"}</div>
      </button>
      <div id={id} className="gloss-def" role="definition" aria-hidden={!open}>{def}</div>
    </article>
  );
});
GlossCard.displayName = "GlossCard";
GlossCard.propTypes = { term: PropTypes.string.isRequired, cat: PropTypes.string.isRequired, def: PropTypes.string.isRequired };

/**
 * Quiz — 7-question knowledge assessment with feedback
 */
const Quiz = memo(() => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [done, setDone] = useState(false);
  const liveRef = useRef(null);

  const restart = useCallback(() => { setIdx(0); setScore(0); setAnswered(null); setDone(false); trackEvent("quiz_restart", "Quiz"); }, []);

  const answer = useCallback((i) => {
    if (answered !== null) return;
    const correct = i === QUIZ_QUESTIONS[idx].ans;
    if (correct) setScore((s) => s + 1);
    setAnswered(i);
    trackEvent(correct ? "quiz_correct" : "quiz_wrong", "Quiz", `Q${idx + 1}`);
    setTimeout(() => {
      if (idx + 1 >= QUIZ_QUESTIONS.length) { setDone(true); trackEvent("quiz_complete", "Quiz", `Score:${score + (correct ? 1 : 0)}`); }
      else { setIdx((i) => i + 1); setAnswered(null); }
    }, 2000);
  }, [answered, idx, score]);

  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const letters = ["A", "B", "C", "D"];
  const q = QUIZ_QUESTIONS[idx];

  return (
    <section className="quiz-wrap" aria-label="Election knowledge quiz">
      <div className="quiz-progress" role="progressbar" aria-valuenow={idx} aria-valuemin={0} aria-valuemax={QUIZ_QUESTIONS.length} aria-label={`Question ${idx + 1} of ${QUIZ_QUESTIONS.length}`}>
        {QUIZ_QUESTIONS.map((_, i) => (
          <div key={i} className={`quiz-pip${i < idx || done ? " done" : i === idx && !done ? " active" : ""}`} aria-hidden="true" />
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true" ref={liveRef} className="sr-only" style={{ position: "absolute", left: "-9999px" }} />
      {done ? (
        <div className="quiz-result" role="region" aria-label="Quiz results">
          <div className="quiz-score" aria-label={`Score: ${score} out of ${QUIZ_QUESTIONS.length}`}>{score}/{QUIZ_QUESTIONS.length}</div>
          <p className="quiz-result-msg">
            {pct === 100 ? "Perfect score — you're election-ready!" : pct >= 70 ? "Great job! You know your elections." : pct >= 50 ? "Good start. Review the glossary and try again." : "Keep exploring — you'll get there!"}
          </p>
          <button className="btn-gold" onClick={restart} aria-label="Retake the quiz">Retake quiz</button>
        </div>
      ) : (
        <>
          <p className="quiz-qnum" aria-hidden="true">Question {idx + 1} of {QUIZ_QUESTIONS.length}</p>
          <h3 className="quiz-question" id="quiz-q">{q.q}</h3>
          <div className="quiz-opts" role="group" aria-labelledby="quiz-q">
            {q.opts.map((opt, i) => (
              <button
                key={i}
                className={`quiz-opt${answered !== null ? (i === q.ans ? " correct" : answered === i ? " wrong" : "") : ""}`}
                onClick={() => answer(i)}
                disabled={answered !== null}
                aria-label={`Option ${letters[i]}: ${opt}${answered !== null ? (i === q.ans ? " — Correct" : answered === i ? " — Incorrect" : "") : ""}`}
              >
                <span className="opt-letter" aria-hidden="true">{letters[i]}</span>{opt}
              </button>
            ))}
          </div>
          {answered !== null && (
            <div role="alert" className={`quiz-fb show ${answered === q.ans ? "ok" : "no"}`}>
              {answered === q.ans ? "✓ Correct — " : "✗ Incorrect — "}{q.exp}
            </div>
          )}
        </>
      )}
    </section>
  );
});
Quiz.displayName = "Quiz";

/**
 * AIChat — Google Gemini-powered election Q&A assistant
 */
const AIChat = memo(({ initialMsg }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your election education assistant, powered by Google Gemini AI. Ask me anything about how elections work — from voter registration and campaign finance to counting ballots and the transition of power. I aim to be factual and non-partisan." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sentRef = useRef(false);
  const canCall = useRateLimit(10, 60000);

  useEffect(() => {
    if (initialMsg && !sentRef.current) { sentRef.current = true; handleSend(initialMsg); }
  }, [initialMsg]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  /**
   * Send a message to Gemini and handle the response
   * @param {string} [preset] - Pre-filled message (from topic buttons)
   */
  const handleSend = useCallback(async (preset) => {
    const raw = preset || input.trim();
    const text = sanitizeInput(raw);
    if (!text || loading) return;

    if (!canCall()) {
      setError("Rate limit reached. Please wait a moment before sending another message.");
      return;
    }

    setInput(""); setError("");
    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    trackEvent("ai_query", "AIChat", text.slice(0, 50));

    try {
      const reply = await callGemini(newHistory);
      setLoading(false);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      trackEvent("ai_response_success", "AIChat");
    } catch (err) {
      setLoading(false);
      console.error("Gemini API error:", err);
      const msg = err.message.includes("API_KEY_INVALID") || err.message.includes("VITE_GEMINI_API_KEY")
        ? "API key missing or invalid. Add VITE_GEMINI_API_KEY to your .env file."
        : err.message.includes("not found") || err.message.includes("404")
          ? "Model not available. Ensure the Generative Language API is enabled in Google Cloud Console."
          : "Could not reach Google Gemini. Check your connection and try again.";
      setError(msg);
      trackEvent("ai_error", "AIChat", err.message.slice(0, 50));
    }
  }, [input, loading, history, canCall]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const TOPICS = [
    "How does the Electoral College work and why was it created?",
    "What is the difference between a senate and house of representatives?",
    "How do I register to vote and what are the deadlines?",
    "What is gerrymandering and how does it affect elections?",
    "How does ranked-choice voting work with an example?",
    "What happens if an election result is disputed or contested?",
    "How is election security maintained to prevent fraud?",
    "What are the biggest differences between US and UK elections?",
    "Can you explain voter suppression with historical examples?",
  ];

  return (
    <div className="ai-layout">
      <nav className="ai-sidebar" aria-label="Suggested topics">
        <div className="ai-sb-label" id="topics-label">Suggested topics</div>
        <ul style={{ listStyle: "none" }} aria-labelledby="topics-label">
          {TOPICS.map((t) => (
            <li key={t}>
              <button className="topic-btn" onClick={() => handleSend(t)} aria-label={`Ask: ${t}`}>{t}</button>
            </li>
          ))}
        </ul>
      </nav>
      <section className="chat-wrap" aria-label="AI election assistant chat">
        <header className="chat-header">
          <div className="chat-avatar" aria-hidden="true">V</div>
          <div>
            <h3 className="chat-name">VoteIQ Assistant</h3>
            <div className="chat-status" aria-label="Status: Online, powered by Google Gemini, non-partisan">
              <span className="status-dot" aria-hidden="true" />Powered by Google Gemini · Non-partisan
            </div>
          </div>
        </header>
        <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation" aria-relevant="additions">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`} role="article" aria-label={m.role === "user" ? "Your message" : "Assistant response"}>
              <div className="msg-bubble">
                {m.content.split("\n\n").map((para, j) => <p key={j}>{escapeHtml(para)}</p>)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg assistant" role="status" aria-label="Assistant is typing">
              <div className="msg-bubble typing-bubble" aria-hidden="true">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          {error && <div role="alert" className="chat-err">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-wrap">
          <label htmlFor="chat-input" style={{ position: "absolute", left: "-9999px" }}>Type your election question</label>
          <input
            id="chat-input"
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything about elections..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            aria-label="Type your election question and press Enter or click Send"
          />
          <button
            className="chat-send"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            aria-busy={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </section>
    </div>
  );
});
AIChat.displayName = "AIChat";
AIChat.propTypes = { initialMsg: PropTypes.string };
AIChat.defaultProps = { initialMsg: null };

/* ─── MAIN APP ───────────────────────────────────── */
const PAGES = ["home", "journey", "timeline", "glossary", "compare", "quiz"];
const PAGE_LABELS = ["Home", "How It Works", "Timeline", "Glossary", "Voting Systems", "Quiz"];

/**
 * VoteIQ — Root application component
 */
export default function VoteIQ() {
  const [page, setPage] = useState("home");
  const [glossFilter, setGlossFilter] = useState("");
  const [aiMsg, setAiMsg] = useState(null);
  const debouncedFilter = useDebounce(glossFilter, 250);
  const mainRef = useRef(null);

  const goTo = useCallback((p, msg = null) => {
    setPage(p);
    if (msg) setAiMsg(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.focus();
    trackEvent("page_view", "Navigation", p);
  }, []);

  const askAbout = useCallback((q) => {
    setAiMsg(q);
    setPage("ask");
    window.scrollTo({ top: 0, behavior: "smooth" });
    trackEvent("ask_ai_navigate", "Navigation", q.slice(0, 50));
  }, []);

  const filteredGloss = useMemo(() =>
    debouncedFilter
      ? GLOSSARY.filter((g) =>
        g.term.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
        g.def.toLowerCase().includes(debouncedFilter.toLowerCase())
      )
      : GLOSSARY,
    [debouncedFilter]
  );

  return (
    <ErrorBoundary>
      <style>{css}</style>

      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Navigation */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <button className="nav-logo" onClick={() => goTo("home")} aria-label="VoteIQ home">
          <div className="nav-logo-gem" aria-hidden="true" />
          VoteIQ
        </button>
        <div className="nav-tabs" role="tablist" aria-label="Site sections">
          {PAGES.map((p, i) => (
            <button
              key={p}
              className={`nav-tab${page === p ? " active" : ""}`}
              onClick={() => goTo(p)}
              role="tab"
              aria-selected={page === p}
              aria-controls={`panel-${p}`}
            >
              {PAGE_LABELS[i]}
            </button>
          ))}
        </div>
        <button className="nav-ask" onClick={() => goTo("ask")} aria-label="Open AI assistant">Ask AI ↗</button>
      </nav>

      <main id="main-content" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>

        {/* HOME */}
        <div id="panel-home" className={`page${page === "home" ? " active" : ""}`} role="tabpanel" aria-label="Home">
          <div className="hero-wrap">
            <div className="hero-grid">
              <div>
                <div className="hero-eyebrow" aria-hidden="true"><div className="hero-eyebrow-dot" />Election education platform</div>
                <h1 className="hero-title">Democracy<br />starts with<br /><em className="hero-title-em">knowing.</em></h1>
                <p className="hero-sub">Understand how elections work — from registering to vote to counting the final ballot. Clear, honest, and non-partisan.</p>
                <div className="hero-ctas">
                  <button className="btn-gold" onClick={() => goTo("journey")} aria-label="Explore the election process">Explore the process →</button>
                  <button className="btn-ghost" onClick={() => goTo("ask")} aria-label="Ask AI a question about elections">Ask AI anything</button>
                </div>
              </div>
              <aside className="hero-panel" aria-label="Election facts">
                <div className="stat-grid">
                  {[{ num: "6", label: "stages of an election" }, { num: "18+", label: "voting age in most nations", gold: true }, { num: "195", label: "countries hold elections" }, { num: "4+", label: "major voting systems" }].map(({ num, label, gold }) => (
                    <div key={label} className={`stat-card${gold ? " gold" : ""}`} aria-label={`${num} — ${label}`}>
                      <div className="stat-num" aria-hidden="true">{num}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="did-you-know" role="note" aria-label="Did you know?">
                  <div className="dyk-icon" aria-hidden="true">🗳️</div>
                  <div><div className="dyk-label">Did you know?</div><div className="dyk-text">Australia has compulsory voting — citizens can be fined for not voting.</div></div>
                </div>
              </aside>
            </div>
          </div>
          <div className="wrap" style={{ paddingBottom: "4rem" }}>
            <div className="gold-divider" aria-hidden="true" />
            <nav aria-label="Feature shortcuts">
              <div className="feature-grid">
                {[
                  { icon: "🗺️", name: "How It Works", desc: "6 stages on an interactive map", page: "journey" },
                  { icon: "📅", name: "Timeline", desc: "Phase-by-category matrix view", page: "timeline" },
                  { icon: "📖", name: "Glossary", desc: "Key terms decoded clearly", page: "glossary" },
                  { icon: "⚖️", name: "Voting Systems", desc: "Compare how different systems work", page: "compare" },
                  { icon: "🧠", name: "Test Yourself", desc: "7-question knowledge quiz", page: "quiz" },
                  { icon: "✦", name: "Ask AI", desc: "Get answers to any question", page: "ask", cta: true },
                ].map((f) => (
                  <button key={f.page} className={`feature-card${f.cta ? " cta" : ""}`} onClick={() => goTo(f.page)} aria-label={`${f.name}: ${f.desc}`} style={{ textAlign: "left" }}>
                    <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                    <div className="feature-name">{f.name}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="panel-journey" className={`page${page === "journey" ? " active" : ""}`} role="tabpanel" aria-label="How elections work">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">The process</div>
              <h2 className="section-title">How an election works</h2>
              <p className="section-desc">Six stages mapped in sequence. Select any node to read the full breakdown.</p>
            </header>
            <JourneyMap onAsk={askAbout} />
          </div>
        </div>

        {/* TIMELINE */}
        <div id="panel-timeline" className={`page${page === "timeline" ? " active" : ""}`} role="tabpanel" aria-label="Election timeline">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">Calendar</div>
              <h2 className="section-title">Election timeline matrix</h2>
              <p className="section-desc">An 18-month cycle mapped across four activity streams. Read across rows to see what's happening simultaneously; read down columns to follow a single thread.</p>
            </header>
            <TimelineMatrix />
          </div>
        </div>

        {/* GLOSSARY */}
        <div id="panel-glossary" className={`page${page === "glossary" ? " active" : ""}`} role="tabpanel" aria-label="Election glossary">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">Reference</div>
              <h2 className="section-title">Election glossary</h2>
              <p className="section-desc">Essential terms every voter should understand. Tap any card to expand the definition.</p>
            </header>
            <div className="gloss-search-wrap">
              <span className="gloss-search-icon" aria-hidden="true">⌕</span>
              <label htmlFor="gloss-search" style={{ position: "absolute", left: "-9999px" }}>Search glossary terms</label>
              <input
                id="gloss-search"
                className="gloss-search"
                type="search"
                placeholder="Search terms..."
                value={glossFilter}
                onChange={(e) => setGlossFilter(e.target.value)}
                aria-label="Search glossary"
                aria-controls="gloss-results"
              />
            </div>
            <div id="gloss-results" className="gloss-grid" role="list" aria-label={`${filteredGloss.length} terms`} aria-live="polite">
              {filteredGloss.length === 0
                ? <p className="gloss-empty" role="status">No terms match your search.</p>
                : filteredGloss.map((g) => <div key={g.term} role="listitem"><GlossCard {...g} /></div>)
              }
            </div>
          </div>
        </div>

        {/* VOTING SYSTEMS */}
        <div id="panel-compare" className={`page${page === "compare" ? " active" : ""}`} role="tabpanel" aria-label="Voting systems comparison">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">Systems</div>
              <h2 className="section-title">How different voting systems work</h2>
              <p className="section-desc">Not all democracies vote the same way. Each system has different trade-offs between simplicity, fairness, and representation.</p>
            </header>
            <div className="compare-grid" role="list">
              {VOTING_SYSTEMS.map((s) => (
                <article key={s.name} className="cmp-card" role="listitem" aria-label={s.name}>
                  <div className="cmp-icon" aria-hidden="true">{s.icon}</div>
                  <h3 className="cmp-name">{s.name}</h3>
                  <p className="cmp-desc">{s.desc}</p>
                  <ul style={{ listStyle: "none" }} aria-label="Advantages">
                    {s.pros.map((p) => <li key={p} className="cmp-pro"><span aria-hidden="true">+</span><span>{p}</span></li>)}
                  </ul>
                  <ul style={{ listStyle: "none" }} aria-label="Disadvantages">
                    {s.cons.map((c) => <li key={c} className="cmp-con"><span aria-hidden="true">−</span><span>{c}</span></li>)}
                  </ul>
                </article>
              ))}
              <div className="cmp-card cmp-ai-card" role="complementary" aria-label="Ask AI to compare systems">
                <div className="cmp-ai-label" aria-hidden="true">✦ Ask the AI</div>
                <h3 className="cmp-name" style={{ color: "var(--gold)" }}>Curious about a system?</h3>
                <p className="cmp-desc">Ask our Google Gemini-powered assistant to compare any two systems or explain how a specific country's elections work.</p>
                <button className="btn-gold" style={{ fontSize: "0.8rem", padding: "10px 18px" }} onClick={() => askAbout("Compare proportional representation and ranked-choice voting — which is fairer?")} aria-label="Ask AI to compare proportional representation and ranked-choice voting">Compare with AI →</button>
              </div>
            </div>
          </div>
        </div>

        {/* QUIZ */}
        <div id="panel-quiz" className={`page${page === "quiz" ? " active" : ""}`} role="tabpanel" aria-label="Election knowledge quiz">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">Test yourself</div>
              <h2 className="section-title">Election knowledge quiz</h2>
              <p className="section-desc">7 questions covering the full election process. See how much you've learned.</p>
            </header>
            <Quiz />
          </div>
        </div>

        {/* ASK AI */}
        <div id="panel-ask" className={`page${page === "ask" ? " active" : ""}`} role="tabpanel" aria-label="AI election assistant">
          <div className="section-wrap">
            <header className="section-hdr">
              <div className="section-eye" aria-hidden="true">AI assistant</div>
              <h2 className="section-title">Ask anything about elections</h2>
              <p className="section-desc">Powered by Google Gemini. Non-partisan, factual answers to any election question.</p>
            </header>
            <AIChat key={aiMsg} initialMsg={aiMsg} />
          </div>
        </div>

      </main>
    </ErrorBoundary>
  );
}
