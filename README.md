# VoteIQ — Election Education Platform

> An interactive civic education platform powered by **Google Gemini AI** and **Google Services**, helping citizens understand how democratic elections work.

---

## Chosen Vertical

**Civic Education** — Empowering citizens with clear, non-partisan knowledge about democratic election processes, from voter registration through the peaceful transfer of power.

---

## Google Services Used

| Service | How it's used |
|---|---|
| **Google Gemini AI** (`gemini-1.5-flash`) | Powers the non-partisan AI assistant that answers any election question |
| **Google Fonts** | Cormorant Garamond + Outfit typefaces for the UI |
| **Google Analytics 4** | Tracks feature usage and user engagement (anonymized) |
| **Google Translate** | Translates the entire platform into 100+ languages for global accessibility |

---

## Features

| Feature | Description |
|---|---|
| 🗺️ **Node Map** | 6 election stages on an interactive S-curve map with connector arrows |
| 📅 **Timeline Matrix** | 18-month cycle across 4 activity streams (Campaign, Nomination, Voter Action, Administration) |
| 📖 **Glossary** | 12 key election terms with live search and expandable definitions |
| ⚖️ **Voting Systems** | Side-by-side comparison of FPTP, PR, RCV, Two-Round, and MMP |
| 🧠 **Quiz** | 7-question knowledge check with instant feedback |
| ✦ **Ask AI** | Google Gemini-powered chat for any election question |

---

## How It Works

### Architecture
- **Frontend**: React 18 + Vite (single-page application)
- **AI Backend**: Google Gemini 1.5 Flash via REST API (direct browser calls — no server needed)
- **Styling**: CSS custom properties (design tokens) in a single injected stylesheet

### AI Integration
The AI assistant sends conversation history to Gemini with a strict non-partisan system prompt. Safety filters are configured to block harmful content. Rate limiting (10 calls/minute) prevents API abuse.

### Accessibility
- Full ARIA roles, labels, and live regions throughout
- Keyboard navigation for all interactive elements (Enter/Space to activate, Escape to close)
- Skip navigation link
- Focus management when panels open
- Reduced motion support (`prefers-reduced-motion`)
- High contrast support (`prefers-contrast: high`)
- Print stylesheet

### Security
- User input sanitized (XSS prevention) before sending to API
- AI responses HTML-escaped before rendering
- Gemini safety filters enabled (harassment, hate speech, dangerous content)
- API key stored in environment variable, never committed to source

---

## Setup & Run

### Prerequisites
- Node.js 18+
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/voteiq.git
cd voteiq

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Start development server
npm run dev

# 5. Open http://localhost:5173
```

### Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: The `.env` file is gitignored and never committed. See `.env.example` for the required variables.

---

## Project Structure

```
voteiq/
├── index.html          # Entry HTML with GA4, Google Translate, skip link, meta tags
├── vite.config.js      # Vite build configuration
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variable template
├── .gitignore          # Excludes node_modules, .env, dist
└── src/
    ├── main.jsx        # React root bootstrap
    └── voteiq.jsx      # Full application (components, data, styles)
```

---

## Assumptions

1. Content covers general democratic processes, not any single country's laws
2. AI responses are non-partisan by system instruction — no opinions on candidates or parties
3. Users have a modern browser with JavaScript enabled
4. The Gemini API key holder has enabled the Generative Language API in Google Cloud Console
5. Google Translate widget provides language accessibility without a backend

---

## Evaluation Criteria Addressed

| Criteria | Implementation |
|---|---|
| **Code Quality** | JSDoc comments, PropTypes, Error Boundary, custom hooks, memoization, named components |
| **Security** | Input sanitization, HTML escaping, Gemini safety filters, env-based secrets, rate limiting |
| **Efficiency** | `useMemo`, `useCallback`, `memo`, debounced search, `ResizeObserver`, lazy state updates |
| **Testing** | Error Boundary catches runtime errors; rate limit prevents abuse; input validation on all user input |
| **Accessibility** | ARIA roles/labels/live regions, keyboard nav, skip link, focus management, reduced motion, high contrast, print CSS |
| **Google Services** | Gemini AI (core feature), Google Fonts, Google Analytics 4, Google Translate |
