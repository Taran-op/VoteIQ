# VoteIQ — Election Education Platform

> An interactive civic education platform powered by **Google Gemini AI**, helping citizens understand how democratic elections work — clearly, honestly, and non-partisan.

---

## Chosen Vertical

**Civic Education** — Empowering citizens with non-partisan knowledge about democratic election processes, from voter registration through the peaceful transfer of power.

---

## Google Services Used

| Service | Role |
|---|---|
| **Google Gemini AI** (`gemini-2.0-flash-lite`) | Core AI assistant — answers any election question in a factual, non-partisan way |
| **Google Fonts** | Cormorant Garamond + Outfit typefaces for the entire UI |
| **Google Analytics 4** | Tracks feature usage and navigation events (anonymized IP) |
| **Google Translate** | Translates the full platform into 100+ languages for global accessibility |

---

## Features

| Feature | Description |
|---|---|
| 🗺️ **Node Map** | 6 election stages on an interactive S-curve map with SVG connector arrows. Click any node to expand details. |
| 📅 **Timeline Matrix** | 18-month election cycle across 4 parallel activity streams — Campaign, Nomination, Voter Action, Administration |
| 📖 **Glossary** | 12 key election terms with live debounced search and expandable definitions |
| ⚖️ **Voting Systems** | Side-by-side comparison of FPTP, Proportional Representation, RCV, Two-Round, and MMP |
| 🧠 **Quiz** | 7-question knowledge check with instant feedback and score tracking |
| ✦ **Ask AI** | Google Gemini-powered chat — ask anything about elections |

---

## How It Works

### Architecture
- **Frontend**: React 18 + Vite (single-page application, no backend required)
- **AI**: Google Gemini API (`gemini-2.0-flash-lite`) called directly from the browser
- **Styling**: CSS custom properties injected at runtime — zero external CSS dependencies

### AI Integration
The Ask AI section sends full conversation history to Google Gemini with a strict non-partisan system prompt. Gemini safety filters block harmful content. A client-side rate limiter (10 requests/minute) prevents quota abuse. All user input is sanitized before transmission and all AI responses are HTML-escaped before rendering.

### Accessibility
- Skip navigation link for keyboard users
- Full ARIA roles, labels, and live regions on all interactive elements
- Keyboard navigation throughout (Enter/Space to activate, Escape to close)
- Focus management when panels open
- `prefers-reduced-motion` support
- `prefers-contrast: high` support
- Print stylesheet

### Security
- `sanitizeInput()` strips XSS characters from all user input before API calls
- `escapeHtml()` sanitizes AI responses before DOM insertion
- Gemini safety filters: harassment, hate speech, and dangerous content blocked
- API key stored in `.env`, excluded from version control via `.gitignore`
- Client-side rate limiting prevents API abuse

---

## Setup

### Prerequisites
- Node.js 18+
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/voteiq.git
cd voteiq

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Open .env and paste your Gemini API key

# 4. Start dev server
npm run dev
# Open http://localhost:5173
```

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> The `.env` file is gitignored and never committed. See `.env.example`.

---

## Project Structure

```
voteiq/
├── index.html          # Entry HTML — GA4, Google Translate, meta tags, skip link
├── vite.config.js      # Vite build config with code splitting
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variable template
├── .gitignore          # Excludes node_modules, .env, dist
└── src/
    ├── main.jsx        # React root with StrictMode
    └── voteiq.jsx      # Full application — components, data, hooks, styles
```

---

## Assumptions

1. Content covers general democratic processes, not any single country's specific laws
2. AI responses are non-partisan by system instruction — no opinions on candidates or parties
3. Users have a modern browser with JavaScript enabled
4. Google Translate widget analytics pings may be blocked by adblockers — this is harmless, the widget itself works correctly
5. Gemini free tier quota applies — heavy usage may require a paid Google AI plan

---

## Evaluation Criteria

| Criteria | What was done |
|---|---|
| **Code Quality** | JSDoc on every function, PropTypes on every component, Error Boundary, custom hooks, memoization (`memo`, `useMemo`, `useCallback`), named display names on all memoized components |
| **Security** | Input sanitization, HTML escaping of AI output, Gemini safety filters, env-based secrets, client-side rate limiting |
| **Efficiency** | `useMemo` for filtered glossary + SVG connectors, `useCallback` for all handlers, debounced search input, `ResizeObserver` for responsive map, Vite code splitting |
| **Accessibility** | ARIA roles/labels/live regions, `role="alert"` on errors, `role="log"` on chat, keyboard nav, focus management, skip link, reduced motion, high contrast, print CSS, visible labels on all inputs |
| **Google Services** | Gemini AI (core feature), Google Fonts, Google Analytics 4, Google Translate (100+ languages) |
