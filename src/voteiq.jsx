import { useState, useEffect, useRef, useCallback } from "react";

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
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(11,11,15,0.9); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 60px;
  }
  .nav-logo { font-family: var(--display); font-size: 1.35rem; font-weight: 600; color: var(--text); letter-spacing: 0.02em; display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-logo-gem { width: 22px; height: 22px; background: linear-gradient(135deg, var(--gold), var(--gold2)); clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
  .nav-tabs { display: flex; gap: 0; }
  .nav-tab { padding: 0 16px; height: 60px; border: none; background: none; font-family: var(--sans); font-size: 0.8rem; font-weight: 400; color: var(--text3); cursor: pointer; letter-spacing: 0.05em; border-bottom: 2px solid transparent; transition: all 0.2s; text-transform: uppercase; }
  .nav-tab:hover { color: var(--text2); }
  .nav-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .nav-ask { background: var(--gold); color: #0b0b0f; border: none; border-radius: 6px; padding: 8px 18px; font-size: 0.78rem; font-weight: 600; font-family: var(--sans); cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.2s; }
  .nav-ask:hover { background: var(--gold2); transform: translateY(-1px); }

  .page { display: none; padding-top: 60px; min-height: 100vh; }
  .page.active { display: block; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 0 2rem; }

  .hero-wrap { position: relative; overflow: hidden; padding: 6rem 2rem 4rem; max-width: 960px; margin: 0 auto; }
  .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center; }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.72rem; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; font-weight: 500; margin-bottom: 1.5rem; padding: 5px 12px; border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; background: var(--gold-dim); }
  .hero-eyebrow-dot { width: 5px; height: 5px; background: var(--gold); border-radius: 50%; }
  .hero-title { font-family: var(--display); font-size: clamp(3rem, 6vw, 4.8rem); font-weight: 700; line-height: 0.95; letter-spacing: -0.02em; color: var(--text); margin-bottom: 1.5rem; }
  .hero-title-em { font-style: italic; color: var(--gold); }
  .hero-sub { font-size: 1rem; color: var(--text2); line-height: 1.75; margin-bottom: 2.5rem; font-weight: 300; max-width: 440px; }
  .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-gold { background: var(--gold); color: #0b0b0f; border: none; border-radius: 8px; padding: 13px 26px; font-size: 0.88rem; font-weight: 600; font-family: var(--sans); cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
  .btn-gold:hover { background: var(--gold2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.25); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); border-radius: 8px; padding: 13px 26px; font-size: 0.88rem; font-weight: 400; font-family: var(--sans); cursor: pointer; transition: all 0.2s; }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

  .hero-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.5rem; position: relative; overflow: hidden; }
  .hero-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 1rem 1.1rem; transition: all 0.2s; }
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
  .feature-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.4rem 1.2rem; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .feature-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
  .feature-card:hover::after { transform: scaleX(1); }
  .feature-card:hover { border-color: var(--border2); transform: translateY(-3px); }
  .feature-card.cta { background: var(--gold-dim); border-color: rgba(201,168,76,0.3); }
  .feature-card.cta:hover { background: rgba(201,168,76,0.2); }
  .feature-icon { font-size: 1.3rem; margin-bottom: 10px; }
  .feature-name { font-size: 0.9rem; font-weight: 500; color: var(--text); margin-bottom: 5px; }
  .feature-card.cta .feature-name { color: var(--gold); }
  .feature-desc { font-size: 0.75rem; color: var(--text3); line-height: 1.5; }

  .section-wrap { max-width: 960px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .section-hdr { margin-bottom: 3rem; }
  .section-eye { font-size: 0.7rem; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; font-weight: 500; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px; }
  .section-eye::before { content: ''; width: 20px; height: 1px; background: var(--gold); }
  .section-title { font-family: var(--display); font-size: 2.8rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); line-height: 1; margin-bottom: 0.8rem; }
  .section-desc { font-size: 0.9rem; color: var(--text2); line-height: 1.7; font-weight: 300; max-width: 560px; }

  /* ── JOURNEY MAP ── */
  .jmap-outer {
    position: relative;
    border-radius: 16px;
    border: 1px solid var(--border);
    background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 28px 28px;
    overflow: hidden;
    padding: 24px;
  }
  .jmap-inner {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  .jmap-node {
    position: absolute;
    border-radius: 12px;
    padding: 16px 18px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: rgba(11,11,15,0.92);
    border: 1px solid rgba(255,255,255,0.09);
    user-select: none;
  }
  .jmap-node:hover { border-color: rgba(201,168,76,0.4); }
  .jmap-node.sel { border-color: var(--gold); background: rgba(201,168,76,0.06); }
  .jmap-node-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .jmap-num { font-family: var(--display); font-size: 0.75rem; color: var(--text3); letter-spacing: 0.1em; }
  .jmap-name { font-size: 0.9rem; font-weight: 500; color: var(--text); line-height: 1.3; }
  .jmap-phase { font-size: 0.68rem; color: var(--text3); margin-top: 5px; }
  .jmap-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }

  .jmap-detail {
    margin-top: 1.5rem;
    background: var(--bg2);
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: 14px;
    padding: 1.8rem 2rem;
    position: relative;
    overflow: hidden;
    animation: jmFadeIn 0.25s ease;
  }
  @keyframes jmFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .jmap-detail::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .jmap-detail-bg { font-family: var(--display); font-size: 7rem; font-weight: 700; color: rgba(255,255,255,0.03); position: absolute; bottom: -1rem; right: 1.5rem; line-height: 1; pointer-events: none; }
  .jmap-detail-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.4rem; }
  .jmap-detail-title { font-family: var(--display); font-size: 1.5rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .jmap-detail-phase { font-size: 0.7rem; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; }
  .jmap-detail-body { font-size: 0.875rem; color: var(--text2); line-height: 1.85; font-weight: 300; margin-bottom: 0.8rem; }
  .jmap-close { background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text3); font-family: var(--sans); font-size: 0.72rem; padding: 5px 12px; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
  .jmap-close:hover { border-color: var(--border2); color: var(--text2); }
  .fact-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .chip { font-size: 0.7rem; padding: 4px 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); }
  .j-ask-btn { font-size: 0.78rem; color: var(--gold); background: none; border: none; cursor: pointer; font-family: var(--sans); padding: 0; display: flex; align-items: center; gap: 6px; margin-top: 14px; transition: opacity 0.2s; }
  .j-ask-btn:hover { opacity: 0.7; }

  /* ── TIMELINE MATRIX ── */
  .tm-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--bg2);
  }
  .tm-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 680px;
  }
  .tm-head-row th {
    padding: 12px 16px;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .tm-head-phase { color: var(--text3); width: 140px; }
  .tm-head-c1 { color: #7ab0de; border-left: 1px solid var(--border); }
  .tm-head-c2 { color: #6fcc9b; border-left: 1px solid var(--border); }
  .tm-head-c3 { color: #e8c97a; border-left: 1px solid var(--border); }
  .tm-head-c4 { color: var(--text3); border-left: 1px solid var(--border); }

  .tm-phase-cell {
    padding: 16px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
    width: 140px;
  }
  .tm-phase-label {
    font-family: var(--display);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text2);
    line-height: 1.4;
  }
  .tm-phase-sub {
    font-size: 0.62rem;
    color: var(--text3);
    margin-top: 3px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tm-cell {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    border-left: 1px solid var(--border);
    vertical-align: top;
  }
  .tm-row:last-child .tm-phase-cell,
  .tm-row:last-child .tm-cell { border-bottom: none; }

  .tm-event {
    padding: 8px 10px;
    border-radius: 8px;
    margin-bottom: 6px;
    border-left: 2px solid;
    background: var(--bg3);
  }
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
  .gloss-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.2rem; cursor: pointer; transition: all 0.2s; }
  .gloss-card:hover { border-color: var(--border2); }
  .gloss-card.open { border-color: var(--gold); background: rgba(201,168,76,0.04); }
  .gloss-cat { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; }
  .gloss-term { font-size: 0.95rem; font-weight: 500; color: var(--text); margin-bottom: 6px; }
  .gloss-toggle { font-size: 0.72rem; color: var(--gold); transition: opacity 0.2s; }
  .gloss-def { font-size: 0.8rem; color: var(--text2); line-height: 1.7; display: none; font-weight: 300; margin-top: 10px; }
  .gloss-card.open .gloss-def { display: block; }

  /* ── QUIZ ── */
  .quiz-wrap { max-width: 640px; }
  .quiz-progress { display: flex; gap: 5px; margin-bottom: 2.5rem; }
  .quiz-pip { height: 3px; flex: 1; border-radius: 2px; background: var(--bg3); transition: background 0.3s; }
  .quiz-pip.done { background: var(--green); }
  .quiz-pip.active { background: var(--gold); }
  .quiz-qnum { font-size: 0.72rem; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
  .quiz-question { font-family: var(--display); font-size: 1.6rem; font-weight: 600; line-height: 1.25; color: var(--text); margin-bottom: 2rem; }
  .quiz-opts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
  .quiz-opt { padding: 13px 16px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg2); text-align: left; cursor: pointer; font-family: var(--sans); font-size: 0.88rem; color: var(--text); transition: all 0.15s; display: flex; align-items: center; gap: 12px; }
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
  .cmp-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r2); padding: 1.5rem; transition: all 0.25s; position: relative; overflow: hidden; }
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
  .topic-btn { width: 100%; text-align: left; padding: 9px 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; font-family: var(--sans); font-size: 0.8rem; color: var(--text2); cursor: pointer; margin-bottom: 6px; transition: all 0.15s; line-height: 1.45; }
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
  .typing-bubble { display: flex; gap: 4px; align-items: center; padding: 14px 16px; }
  .typing-dot { width: 5px; height: 5px; background: var(--text3); border-radius: 50%; animation: blink 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
  @keyframes fadeSlide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; } }
  .chat-input-wrap { padding: 1rem 1.2rem; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .chat-input { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg3); font-family: var(--sans); font-size: 0.85rem; color: var(--text); outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--gold); }
  .chat-input::placeholder { color: var(--text3); }
  .chat-send { background: var(--gold); color: #0b0b0f; border: none; border-radius: 8px; padding: 10px 18px; font-family: var(--sans); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .chat-send:hover { background: var(--gold2); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .chat-err { font-size: 0.78rem; color: var(--red); padding: 4px 1.2rem; }

  .tag { font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; display: inline-block; }
  .tag-done { background: rgba(76,175,125,0.12); color: #6fcc9b; border: 1px solid rgba(76,175,125,0.2); }
  .tag-now { background: rgba(214,79,58,0.12); color: #e87c6a; border: 1px solid rgba(214,79,58,0.2); }
  .tag-info { background: rgba(74,143,212,0.12); color: #7ab0de; border: 1px solid rgba(74,143,212,0.2); }
  .tag-muted { background: var(--bg3); color: var(--text3); border: 1px solid var(--border); }
  .gold-divider { width: 40px; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); margin: 1rem 0 3rem; }

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
`;

/* ─── DATA ───────────────────────────────────────── */
const JOURNEY_STEPS = [
    {
        num: "01", phase: "Months 18–12 before", name: "Voter Registration",
        tag: "Foundational", tagType: "done", dotColor: "#4caf7d",
        paras: [
            "Before anyone can vote, they must register. This is the government confirming who you are and that you're eligible — typically a citizen, 18+, and a resident of the district. Registration deadlines vary widely: some places close rolls 30 days before; others allow same-day registration.",
            "Many countries are moving to automatic registration when citizens receive national IDs. In the US, registration is managed state-by-state. In the UK, it's done through individual electoral registration online."
        ],
        facts: ["Must be 18+ in most countries", "Citizenship required", "Deadlines vary by jurisdiction", "Online registration now common"],
        askQ: "How do I register to vote and what are the requirements?"
    },
    {
        num: "02", phase: "Months 12–6 before", name: "Candidate Nomination",
        tag: "Selection", tagType: "done", dotColor: "#4caf7d",
        paras: [
            "Parties must choose who will represent them before the general election. In primary elections, registered voters vote for their preferred candidate. Caucuses are community meetings where voters openly declare their preference and debate before deciding.",
            "Independent candidates bypass the party process by collecting petition signatures to qualify for ballot access. This threshold exists to prevent the ballot from becoming unmanageably crowded."
        ],
        facts: ["Open vs closed primaries", "Caucuses (community meetings)", "Petition signatures for independents", "Convention delegates allocated"],
        askQ: "What is the difference between a primary election and a caucus?"
    },
    {
        num: "03", phase: "Months 6–1 before", name: "Campaign Period",
        tag: "Active Now", tagType: "now", dotColor: "#d64f3a",
        paras: [
            "Nominees compete directly for voter support. This includes public debates, rallies, door-knocking, social media campaigns, television advertising, and press appearances. Campaign finance laws regulate how money is raised and spent.",
            "Media coverage, endorsements from influential figures, and polling data all shape public opinion. Campaigns focus heavily on swing states or marginal constituencies where the race is genuinely competitive."
        ],
        facts: ["Public debates", "Campaign finance rules", "Swing state targeting", "Media & endorsements"],
        askQ: "How does campaign finance work and who funds elections?"
    },
    {
        num: "04", phase: "Election day", name: "Casting Ballots",
        tag: "Upcoming", tagType: "info", dotColor: "#4a8fd4",
        paras: [
            "Registered voters go to their assigned polling station (or mail in / vote early). They verify identity, receive a ballot, mark their choice privately, and submit it. Poll workers manage the process; official party observers can monitor but not interfere.",
            "Early voting and absentee (mail-in) voting has expanded significantly. Some countries use electronic voting machines; others rely entirely on hand-marked paper ballots, which are generally considered more secure and auditable."
        ],
        facts: ["Polling stations assigned by address", "ID requirements vary", "Early & absentee voting", "Paper vs electronic ballots"],
        askQ: "What happens on election day at the polling station?"
    },
    {
        num: "05", phase: "Days to weeks after", name: "Counting & Auditing",
        tag: "Post-Election", tagType: "muted", dotColor: "#5a5855",
        paras: [
            "After polls close, ballots are tallied by election officials — often with representatives from each party watching. Results are preliminary until they go through a canvassing process, where officials verify totals and confirm all valid ballots were counted.",
            "Audits verify machine accuracy. In close races, full recounts may be triggered automatically or requested by a candidate. Final results are then certified — officially declared accurate and binding."
        ],
        facts: ["Canvassing process", "Risk-limiting audits", "Recount thresholds", "Official certification"],
        askQ: "How are ballots counted and results certified after an election?"
    },
    {
        num: "06", phase: "Weeks to months after", name: "Transition of Power",
        tag: "Final Stage", tagType: "muted", dotColor: "#5a5855",
        paras: [
            "The losing candidate traditionally concedes, signaling acceptance of the democratic outcome. A transition period follows — the outgoing government briefs the incoming one, transferring files, security information, and institutional knowledge.",
            "Inauguration is the formal swearing-in ceremony where the winner takes the oath of office. The peaceful transfer of power between opposing parties is considered one of democracy's most fundamental features."
        ],
        facts: ["Concession speech tradition", "Legal transition period", "Sworn oath of office", "Peaceful power transfer"],
        askQ: "What happens during the presidential transition of power after an election?"
    }
];

// S-curve layout: 01(col0,r0) → 02(col1,r0) ↓ 03(col1,r1) → 04(col0,r1) ↓ 05(col0,r2) → 06(col1,r2)
// But step ordering is 0-5, and grid positions are:
const STEP_POS = [
    [0, 0], // step 0 (01) → col 0, row 0
    [1, 0], // step 1 (02) → col 1, row 0
    [1, 1], // step 2 (03) → col 1, row 1
    [0, 1], // step 3 (04) → col 0, row 1
    [0, 2], // step 4 (05) → col 0, row 2
    [1, 2], // step 5 (06) → col 1, row 2
];

// Timeline matrix data: [phase][column] → events
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
    // Phase 0: 18-12 months
    {
        Campaign: [{ name: "Exploratory committees", detail: "Potential candidates quietly test the waters with donors", type: "done" }, { name: "Campaign announcements", detail: "Candidates formally declare and begin fundraising", type: "done" }],
        Nomination: [],
        "Voter Action": [{ name: "Registration drives begin", detail: "Parties and nonprofits begin organizing voter registration", type: "done" }],
        Administration: [],
    },
    // Phase 1: 12-6 months
    {
        Campaign: [],
        Nomination: [{ name: "Primary debates", detail: "Multiple candidates debate publicly in each party", type: "done" }, { name: "Primary elections & caucuses", detail: "State-by-state voting narrows field to frontrunners", type: "done" }],
        "Voter Action": [],
        Administration: [],
    },
    // Phase 2: 6 months
    {
        Campaign: [{ name: "General campaign begins", detail: "Major nominees compete directly; ad spending surges", type: "done" }],
        Nomination: [{ name: "Party conventions", detail: "Delegates formally nominate candidates; platforms adopted", type: "done" }],
        "Voter Action": [],
        Administration: [],
    },
    // Phase 3: 2 months – Day
    {
        Campaign: [{ name: "Presidential debates", detail: "High-stakes live debates between nominees", type: "now" }],
        Nomination: [],
        "Voter Action": [{ name: "Early & absentee voting", detail: "Mail-in ballots and in-person early voting opens", type: "soon" }, { name: "Registration closes", detail: "Most states close voter rolls 30 days before election", type: "soon" }],
        Administration: [],
    },
    // Phase 4: Election Day
    {
        Campaign: [],
        Nomination: [],
        "Voter Action": [{ name: "Polls open — national vote", detail: "Registered voters cast ballots; results called by media as polls close", type: "soon" }],
        Administration: [],
    },
    // Phase 5: Post-election
    {
        Campaign: [],
        Nomination: [],
        "Voter Action": [],
        Administration: [{ name: "Vote canvassing", detail: "All mail and provisional ballots verified and counted", type: "future" }, { name: "Results certified", detail: "Authorities formally certify results; legal challenges resolved", type: "future" }, { name: "Swearing-in ceremony", detail: "Winner takes oath of office; transition complete", type: "future" }],
    },
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
    { term: "Incumbent", cat: "Candidate Status", def: "The current holder of an elected position who is running for re-election. Incumbents typically have significant advantages: name recognition, fundraising networks, and the ability to point to their record." }
];

const QUIZ_QUESTIONS = [
    { q: "What must citizens do before they can vote in most elections?", opts: ["Attend a political rally", "Register with election authorities", "Pay a voting fee", "Join a political party"], ans: 1, exp: "Voter registration confirms your identity and eligibility — you must do it before casting a ballot in most democracies." },
    { q: "What is a \"primary election\"?", opts: ["The most important national election", "An election to choose a party's candidate", "A local school board election", "The first day of early voting"], ans: 1, exp: "A primary election lets party members vote on which candidate will represent their party in the general election." },
    { q: "In a first-past-the-post system, who wins?", opts: ["The candidate with over 50% of votes", "The candidate endorsed by most newspapers", "The candidate with the most votes, even without a majority", "The candidate who campaigned longest"], ans: 2, exp: "FPTP simply means the candidate with the most votes wins — even if that's only 35% in a crowded field." },
    { q: "What is gerrymandering?", opts: ["A type of ballot paper", "Drawing district boundaries to favor one party", "A fundraising technique", "A form of voter fraud"], ans: 1, exp: "Gerrymandering is the practice of manipulating district boundaries to give one party an electoral advantage." },
    { q: "After votes are cast, what is the \"canvassing\" process?", opts: ["Door-to-door campaigning", "Designing the ballot layout", "Officially verifying and certifying vote totals", "Broadcasting results on TV"], ans: 2, exp: "Canvassing (in election administration) means the official review and verification of vote totals before certification." },
    { q: "Which voting system eliminates the last-place candidate and redistributes their votes?", opts: ["First past the post", "Two-round runoff", "Electoral College", "Ranked-choice voting"], ans: 3, exp: "In ranked-choice voting, if no one has a majority, the lowest-ranked candidate is eliminated and votes transfer to voters' next preferences." },
    { q: "The \"peaceful transfer of power\" refers to...", opts: ["Moving ballot boxes between counties", "An outgoing leader handing power to the election winner", "Military oversight of elections", "The media calling a winner on election night"], ans: 1, exp: "The peaceful transfer of power is a cornerstone of democracy — the outgoing leader formally transfers authority to the winner." }
];

const VOTING_SYSTEMS = [
    { icon: "🎯", name: "First Past the Post (FPTP)", desc: "Each voter picks one candidate. The candidate with the most votes wins — even without a majority. Used in the US, UK, Canada, India.", pros: ["Simple and fast to count", "Clear single-winner outcomes"], cons: ["Winners often lack majority support", "Third parties rarely win", "Vulnerable to spoiler candidates"] },
    { icon: "📊", name: "Proportional Representation", desc: "Seats are allocated proportionally to vote share. Common in Europe: Germany, Netherlands, Sweden, Spain.", pros: ["Accurately reflects voter preferences", "Smaller parties get representation"], cons: ["Often produces coalition governments", "Coalition negotiations can take months", "Less direct constituency representation"] },
    { icon: "🔢", name: "Ranked-Choice Voting (RCV)", desc: "Voters rank candidates 1, 2, 3… Elimination rounds redistribute votes until someone hits 50%+. Used in Australia, Ireland, New Zealand.", pros: ["Winner has broad majority support", "Eliminates spoiler effect", "Encourages positive campaigning"], cons: ["More complex to count", "Results take longer"] },
    { icon: "🔄", name: "Two-Round System", desc: "If no candidate wins a majority in round 1, the top two face off in a runoff. Used in France, Brazil, most presidential elections globally.", pros: ["Guarantees a majority winner", "Easy to understand"], cons: ["Two elections means higher cost", "Voter fatigue between rounds"] },
    { icon: "⚖️", name: "Mixed-Member Proportional", desc: "Combines FPTP local seats with PR top-up seats to balance local representation with overall proportionality. Used in Germany, New Zealand, Scotland.", pros: ["Local AND proportional representation", "Best of both systems"], cons: ["Complex ballot design", "Two classes of representatives"] },
];

/* ─── COMPONENTS ─────────────────────────────────── */

function JourneyMap({ onAsk }) {
    const [selected, setSelected] = useState(null);
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(800);

    useEffect(() => {
        const obs = new ResizeObserver(entries => {
            for (const e of entries) setContainerWidth(e.contentRect.width);
        });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    // Layout constants
    const CARD_W = Math.min(360, (containerWidth - 80) / 2);
    const CARD_H = 106;
    const H_GAP = Math.max(40, containerWidth - CARD_W * 2 - 40); // gap between cols
    const V_GAP = 60;
    const COL_X = [20, CARD_W + H_GAP + 20];
    const ROW_Y = [20, 20 + CARD_H + V_GAP, 20 + (CARD_H + V_GAP) * 2];
    const SVG_W = containerWidth;
    const SVG_H = ROW_Y[2] + CARD_H + 24;

    const nodeCx = (i) => COL_X[STEP_POS[i][0]] + CARD_W / 2;
    const nodeCy = (i) => ROW_Y[STEP_POS[i][1]] + CARD_H / 2;

    // Connectors: step i → step i+1
    const connectors = [
        // 0→1: right (row 0, col0 → col1)
        { x1: COL_X[0] + CARD_W, y1: nodeCy(0), x2: COL_X[1], y2: nodeCy(1) },
        // 1→2: down (col1, row0 → row1)
        { x1: nodeCx(1), y1: ROW_Y[0] + CARD_H, x2: nodeCx(2), y2: ROW_Y[1] },
        // 2→3: left (row1, col1 → col0)
        { x1: COL_X[1], y1: nodeCy(2), x2: COL_X[0] + CARD_W, y2: nodeCy(3) },
        // 3→4: down (col0, row1 → row2)
        { x1: nodeCx(3), y1: ROW_Y[1] + CARD_H, x2: nodeCx(4), y2: ROW_Y[2] },
        // 4→5: right (row2, col0 → col1)
        { x1: COL_X[0] + CARD_W, y1: nodeCy(4), x2: COL_X[1], y2: nodeCy(5) },
    ];

    const selectedStep = selected !== null ? JOURNEY_STEPS[selected] : null;

    return (
        <div>
            {/* Map Canvas */}
            <div className="jmap-outer" ref={containerRef}>
                <div className="jmap-inner">
                    <div className="jmap-canvas" style={{ position: 'relative', width: '100%', height: SVG_H }}>
                        {/* SVG connector lines */}
                        <svg
                            width={SVG_W} height={SVG_H}
                            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
                        >
                            <defs>
                                <marker id="jm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(201,168,76,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </marker>
                            </defs>
                            {connectors.map((c, i) => (
                                <line key={i}
                                    x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                                    stroke="rgba(201,168,76,0.3)"
                                    strokeWidth="1.5"
                                    strokeDasharray="7 5"
                                    markerEnd="url(#jm-arr)"
                                />
                            ))}
                            {/* Sequence labels on connectors */}
                            {connectors.map((c, i) => {
                                const mx = (c.x1 + c.x2) / 2;
                                const my = (c.y1 + c.y2) / 2 - 6;
                                return (
                                    <text key={i} x={mx} y={my}
                                        textAnchor="middle" fontSize="9"
                                        fill="rgba(201,168,76,0.45)"
                                        fontFamily="var(--sans)"
                                    >
                                        ▶
                                    </text>
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {JOURNEY_STEPS.map((step, i) => {
                            const isSel = selected === i;
                            return (
                                <div key={i}
                                    className={`jmap-node${isSel ? ' sel' : ''}`}
                                    onClick={() => setSelected(isSel ? null : i)}
                                    style={{
                                        left: COL_X[STEP_POS[i][0]],
                                        top: ROW_Y[STEP_POS[i][1]],
                                        width: CARD_W,
                                        height: CARD_H,
                                    }}
                                >
                                    <div className="jmap-node-head">
                                        <div style={{ flex: 1 }}>
                                            <div className="jmap-num">NODE {step.num}</div>
                                            <div className="jmap-name">{step.name}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                            <span className={`tag tag-${step.tagType}`} style={{ fontSize: '0.6rem', padding: '3px 8px' }}>{step.tag}</span>
                                            <div className="jmap-dot" style={{ background: step.dotColor }} />
                                        </div>
                                    </div>
                                    <div className="jmap-phase">{step.phase}</div>
                                    {isSel && (
                                        <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>▼ VIEWING DETAILS BELOW</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile fallback list */}
                    <div className="jmap-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
                        {JOURNEY_STEPS.map((step, i) => (
                            <div key={i}
                                className={`jmap-node${selected === i ? ' sel' : ''}`}
                                style={{ position: 'static', width: '100%', height: 'auto', cursor: 'pointer' }}
                                onClick={() => setSelected(selected === i ? null : i)}
                            >
                                <div className="jmap-node-head">
                                    <div style={{ flex: 1 }}>
                                        <div className="jmap-num">NODE {step.num}</div>
                                        <div className="jmap-name">{step.name}</div>
                                    </div>
                                    <div className="jmap-dot" style={{ background: step.dotColor }} />
                                </div>
                                <div className="jmap-phase">{step.phase}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail panel */}
            {selectedStep && (
                <div className="jmap-detail">
                    <div className="jmap-detail-bg">{selectedStep.num}</div>
                    <div className="jmap-detail-hdr">
                        <div>
                            <div className="jmap-detail-phase">{selectedStep.phase}</div>
                            <div className="jmap-detail-title">{selectedStep.name}</div>
                        </div>
                        <button className="jmap-close" onClick={() => setSelected(null)}>Close ✕</button>
                    </div>
                    {selectedStep.paras.map((p, i) => (
                        <p key={i} className="jmap-detail-body">{p}</p>
                    ))}
                    <div className="fact-chips">
                        {selectedStep.facts.map(f => <span key={f} className="chip">{f}</span>)}
                    </div>
                    <button className="j-ask-btn" onClick={() => onAsk(selectedStep.askQ)}>
                        ✦ Ask AI more about this stage →
                    </button>
                </div>
            )}
        </div>
    );
}

function TimelineMatrix() {
    return (
        <div className="tm-wrap">
            <table className="tm-table">
                <thead>
                    <tr className="tm-head-row">
                        <th className="tm-head-phase">Phase</th>
                        <th className="tm-head-c1">Campaign</th>
                        <th className="tm-head-c2">Nomination</th>
                        <th className="tm-head-c3">Voter Action</th>
                        <th className="tm-head-c4">Administration</th>
                    </tr>
                </thead>
                <tbody>
                    {TM_PHASES.map((phase, pi) => {
                        const cells = TM_CELLS[pi];
                        return (
                            <tr key={pi} className="tm-row">
                                <td className="tm-phase-cell">
                                    <div className="tm-phase-label">{phase.label}</div>
                                    {phase.sub && <div className="tm-phase-sub">{phase.sub}</div>}
                                </td>
                                {TM_COLS.map((col) => {
                                    const events = cells[col] || [];
                                    return (
                                        <td key={col} className="tm-cell">
                                            {events.length === 0
                                                ? <div className="tm-empty">—</div>
                                                : events.map((ev, ei) => (
                                                    <div key={ei} className={`tm-event ${ev.type}`}>
                                                        <div className="tm-event-name">{ev.name}</div>
                                                        <div className="tm-event-detail">{ev.detail}</div>
                                                    </div>
                                                ))
                                            }
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function GlossCard({ term, cat, def }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`gloss-card${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
            <div className="gloss-cat">{cat}</div>
            <div className="gloss-term">{term}</div>
            <div className="gloss-toggle">{open ? "Collapse ↑" : "Expand ↓"}</div>
            <div className="gloss-def">{def}</div>
        </div>
    );
}

function Quiz() {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(null);
    const [done, setDone] = useState(false);
    const restart = () => { setIdx(0); setScore(0); setAnswered(null); setDone(false); };
    const answer = (i) => {
        if (answered !== null) return;
        if (i === QUIZ_QUESTIONS[idx].ans) setScore(s => s + 1);
        setAnswered(i);
        setTimeout(() => {
            if (idx + 1 >= QUIZ_QUESTIONS.length) setDone(true);
            else { setIdx(i => i + 1); setAnswered(null); }
        }, 2000);
    };
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const letters = ["A", "B", "C", "D"];
    return (
        <div className="quiz-wrap">
            <div className="quiz-progress">
                {QUIZ_QUESTIONS.map((_, i) => (
                    <div key={i} className={`quiz-pip${i < idx || done ? " done" : i === idx && !done ? " active" : ""}`} />
                ))}
            </div>
            {done ? (
                <div className="quiz-result">
                    <div className="quiz-score">{score}/{QUIZ_QUESTIONS.length}</div>
                    <div className="quiz-result-msg">
                        {pct === 100 ? "Perfect score — you're election-ready!" : pct >= 70 ? "Great job! You know your elections." : pct >= 50 ? "Good start. Review the glossary and try again." : "Keep exploring — you'll get there!"}
                    </div>
                    <button className="btn-gold" onClick={restart}>Retake quiz</button>
                </div>
            ) : (
                <>
                    <div className="quiz-qnum">Question {idx + 1} of {QUIZ_QUESTIONS.length}</div>
                    <div className="quiz-question">{QUIZ_QUESTIONS[idx].q}</div>
                    <div className="quiz-opts">
                        {QUIZ_QUESTIONS[idx].opts.map((opt, i) => (
                            <button key={i}
                                className={`quiz-opt${answered !== null ? (i === QUIZ_QUESTIONS[idx].ans ? " correct" : answered === i ? " wrong" : "") : ""}`}
                                onClick={() => answer(i)} disabled={answered !== null}
                            >
                                <span className="opt-letter">{letters[i]}</span>{opt}
                            </button>
                        ))}
                    </div>
                    {answered !== null && (
                        <div className={`quiz-fb show ${answered === QUIZ_QUESTIONS[idx].ans ? "ok" : "no"}`}>
                            {answered === QUIZ_QUESTIONS[idx].ans ? "✓ Correct — " : "✗ "}{QUIZ_QUESTIONS[idx].exp}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function AIChat({ initialMsg }) {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your election education assistant. Ask me anything about how elections work — from voter registration and campaign finance to counting ballots and the transition of power. I aim to be factual and non-partisan." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const sentRef = useRef(false);

    useEffect(() => {
        if (initialMsg && !sentRef.current) { sentRef.current = true; handleSend(initialMsg); }
    }, [initialMsg]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

    const handleSend = async (preset) => {
        const text = preset || input.trim();
        if (!text || loading) return;
        setInput(""); setError("");
        const newHistory = [...history, { role: "user", content: text }];
        setHistory(newHistory);
        setMessages(m => [...m, { role: "user", content: text }]);
        setLoading(true);
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    max_tokens: 1000,
                    messages: newHistory
                })
            });
            const data = await res.json();
            setLoading(false);
            if (data.choices?.[0]?.message?.content) {
                const reply = data.choices[0].message.content;
                setHistory(h => [...h, { role: "assistant", content: reply }]);
                setMessages(m => [...m, { role: "assistant", content: reply }]);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch {
            setLoading(false);
            setError("Could not reach the AI. Check your connection and try again.");
        }
    };

    const TOPICS = [
        "How does the Electoral College work and why was it created?",
        "What is the difference between a senate and house of representatives?",
        "How do I register to vote and what are the deadlines?",
        "What is gerrymandering and how does it affect elections?",
        "How does ranked-choice voting work with an example?",
        "What happens if an election result is disputed or contested?",
        "How is election security maintained to prevent fraud?",
        "What are the biggest differences between US and UK elections?",
        "Can you explain voter suppression with historical examples?"
    ];

    return (
        <div className="ai-layout">
            <div className="ai-sidebar">
                <div className="ai-sb-label">Suggested topics</div>
                {TOPICS.map(t => <button key={t} className="topic-btn" onClick={() => handleSend(t)}>{t}</button>)}
            </div>
            <div className="chat-wrap">
                <div className="chat-header">
                    <div className="chat-avatar">V</div>
                    <div>
                        <div className="chat-name">VoteIQ Assistant</div>
                        <div className="chat-status"><span className="status-dot" />Powered by Claude · Non-partisan</div>
                    </div>
                </div>
                <div className="chat-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`msg ${m.role}`}>
                            <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.content.replace(/\n\n/g, "<br><br>").replace(/\n/g, " ") }} />
                        </div>
                    ))}
                    {loading && <div className="msg assistant"><div className="msg-bubble typing-bubble"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div></div>}
                    {error && <div className="chat-err">{error}</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-wrap">
                    <input className="chat-input" placeholder="Ask anything about elections..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
                    <button className="chat-send" onClick={() => handleSend()} disabled={loading || !input.trim()}>Send</button>
                </div>
            </div>
        </div>
    );
}

/* ─── MAIN APP ───────────────────────────────────── */
export default function VoteIQ() {
    const [page, setPage] = useState("home");
    const [glossFilter, setGlossFilter] = useState("");
    const [aiMsg, setAiMsg] = useState(null);

    const goTo = useCallback((p, msg = null) => { setPage(p); if (msg) setAiMsg(msg); window.scrollTo(0, 0); }, []);
    const askAbout = useCallback((q) => { setAiMsg(q); setPage("ask"); window.scrollTo(0, 0); }, []);

    const filteredGloss = glossFilter
        ? GLOSSARY.filter(g => g.term.toLowerCase().includes(glossFilter.toLowerCase()) || g.def.toLowerCase().includes(glossFilter.toLowerCase()))
        : GLOSSARY;

    const PAGES = ["home", "journey", "timeline", "glossary", "compare", "quiz"];
    const PAGE_LABELS = ["Home", "How It Works", "Timeline", "Glossary", "Voting Systems", "Quiz"];

    return (
        <>
            <style>{css}</style>

            <nav className="nav">
                <div className="nav-logo" onClick={() => goTo("home")}><div className="nav-logo-gem" />VoteIQ</div>
                <div className="nav-tabs">
                    {PAGES.map((p, i) => (
                        <button key={p} className={`nav-tab${page === p ? " active" : ""}`} onClick={() => goTo(p)}>{PAGE_LABELS[i]}</button>
                    ))}
                </div>
                <button className="nav-ask" onClick={() => goTo("ask")}>Ask AI ↗</button>
            </nav>

            {/* HOME */}
            <div className={`page${page === "home" ? " active" : ""}`}>
                <div className="hero-wrap">
                    <div className="hero-grid">
                        <div>
                            <div className="hero-eyebrow"><div className="hero-eyebrow-dot" />Election education platform</div>
                            <h1 className="hero-title">Democracy<br />starts with<br /><em className="hero-title-em">knowing.</em></h1>
                            <p className="hero-sub">Understand how elections work — from registering to vote to counting the final ballot. Clear, honest, and non-partisan.</p>
                            <div className="hero-ctas">
                                <button className="btn-gold" onClick={() => goTo("journey")}>Explore the process →</button>
                                <button className="btn-ghost" onClick={() => goTo("ask")}>Ask AI anything</button>
                            </div>
                        </div>
                        <div className="hero-panel">
                            <div className="stat-grid">
                                <div className="stat-card"><div className="stat-num">6</div><div className="stat-label">stages of an election</div></div>
                                <div className="stat-card gold"><div className="stat-num">18+</div><div className="stat-label">voting age in most nations</div></div>
                                <div className="stat-card"><div className="stat-num">195</div><div className="stat-label">countries hold elections</div></div>
                                <div className="stat-card"><div className="stat-num">4+</div><div className="stat-label">major voting systems</div></div>
                            </div>
                            <div className="did-you-know">
                                <div className="dyk-icon">🗳️</div>
                                <div><div className="dyk-label">Did you know?</div><div className="dyk-text">Australia has compulsory voting — citizens can be fined for not voting.</div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wrap" style={{ paddingBottom: "4rem" }}>
                    <div className="gold-divider" />
                    <div className="feature-grid">
                        {[
                            { icon: "🗺️", name: "How It Works", desc: "6 stages on an interactive map", page: "journey" },
                            { icon: "📅", name: "Timeline", desc: "Phase-by-category matrix view", page: "timeline" },
                            { icon: "📖", name: "Glossary", desc: "Key terms decoded clearly", page: "glossary" },
                            { icon: "⚖️", name: "Voting Systems", desc: "Compare how different systems work", page: "compare" },
                            { icon: "🧠", name: "Test Yourself", desc: "7-question knowledge quiz", page: "quiz" },
                            { icon: "✦", name: "Ask AI", desc: "Get answers to any question", page: "ask", cta: true }
                        ].map(f => (
                            <div key={f.page} className={`feature-card${f.cta ? " cta" : ""}`} onClick={() => goTo(f.page)}>
                                <div className="feature-icon">{f.icon}</div>
                                <div className="feature-name">{f.name}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS — node map */}
            <div className={`page${page === "journey" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">The process</div>
                        <h2 className="section-title">How an election works</h2>
                        <p className="section-desc">Six stages mapped in sequence. Select any node to read the full breakdown.</p>
                    </div>
                    <JourneyMap onAsk={askAbout} />
                </div>
            </div>

            {/* TIMELINE — matrix grid */}
            <div className={`page${page === "timeline" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">Calendar</div>
                        <h2 className="section-title">Election timeline matrix</h2>
                        <p className="section-desc">An 18-month cycle mapped across four activity streams. Read across rows to see what's happening simultaneously; read down columns to follow a single thread.</p>
                    </div>
                    <TimelineMatrix />
                </div>
            </div>

            {/* GLOSSARY */}
            <div className={`page${page === "glossary" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">Reference</div>
                        <h2 className="section-title">Election glossary</h2>
                        <p className="section-desc">Essential terms every voter should understand. Tap any card to expand the definition.</p>
                    </div>
                    <div className="gloss-search-wrap">
                        <span className="gloss-search-icon">⌕</span>
                        <input className="gloss-search" type="text" placeholder="Search terms..." value={glossFilter} onChange={e => setGlossFilter(e.target.value)} />
                    </div>
                    <div className="gloss-grid">{filteredGloss.map(g => <GlossCard key={g.term} {...g} />)}</div>
                </div>
            </div>

            {/* VOTING SYSTEMS */}
            <div className={`page${page === "compare" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">Systems</div>
                        <h2 className="section-title">How different voting systems work</h2>
                        <p className="section-desc">Not all democracies vote the same way. Each system has different trade-offs between simplicity, fairness, and representation.</p>
                    </div>
                    <div className="compare-grid">
                        {VOTING_SYSTEMS.map(s => (
                            <div key={s.name} className="cmp-card">
                                <div className="cmp-icon">{s.icon}</div>
                                <div className="cmp-name">{s.name}</div>
                                <div className="cmp-desc">{s.desc}</div>
                                {s.pros.map(p => <div key={p} className="cmp-pro"><span>+</span><span>{p}</span></div>)}
                                {s.cons.map(c => <div key={c} className="cmp-con"><span>−</span><span>{c}</span></div>)}
                            </div>
                        ))}
                        <div className="cmp-card cmp-ai-card">
                            <div className="cmp-ai-label">✦ Ask the AI</div>
                            <div className="cmp-name" style={{ color: "var(--gold)" }}>Curious about a system?</div>
                            <div className="cmp-desc">Ask our assistant to compare any two systems or explain how a specific country's elections work.</div>
                            <button className="btn-gold" style={{ fontSize: "0.8rem", padding: "10px 18px" }} onClick={() => askAbout("Compare proportional representation and ranked-choice voting — which is fairer?")}>Compare with AI →</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUIZ */}
            <div className={`page${page === "quiz" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">Test yourself</div>
                        <h2 className="section-title">Election knowledge quiz</h2>
                        <p className="section-desc">7 questions covering the full election process. See how much you've learned.</p>
                    </div>
                    <Quiz />
                </div>
            </div>

            {/* ASK AI */}
            <div className={`page${page === "ask" ? " active" : ""}`}>
                <div className="section-wrap">
                    <div className="section-hdr">
                        <div className="section-eye">AI assistant</div>
                        <h2 className="section-title">Ask anything about elections</h2>
                        <p className="section-desc">Powered by Claude. Non-partisan, factual answers to any election question.</p>
                    </div>
                    <AIChat key={aiMsg} initialMsg={aiMsg} />
                </div>
            </div>
        </>
    );
}