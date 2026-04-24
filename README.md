# VoteIQ

VoteIQ is an interactive civic education platform designed to help people understand how democratic elections work through visual learning, AI-assisted guidance, and structured educational tools.

Built for the Google Antigravity Hackathon.

---

# Chosen Vertical

Civic Education / Public Awareness

VoteIQ focuses on simplifying election systems, voting processes, governance structures, and democratic workflows in a more engaging and interactive format.

---

# Problem Statement

Most people find elections and political systems confusing because information is often:

* too text-heavy
* difficult to visualize
* overwhelming for first-time learners
* not interactive enough

VoteIQ aims to solve this problem by transforming civic education into a modern visual experience.

---

# Solution Overview

VoteIQ combines:

* Interactive node-map interfaces
* Timeline matrices
* Educational comparison systems
* AI-assisted explanations
* Visual learning components

The platform is designed to make understanding elections simpler, faster, and more engaging.

---

# Features

## Interactive Election Journey

A visual node-map representing the full election lifecycle:

* Campaigning
* Nomination
* Voting
* Ballot counting
* Certification
* Governance transition

Users can interact with each stage to explore detailed explanations.

---

## Timeline Matrix System

A structured matrix interface displaying parallel election activities across:

* Campaign
* Nomination
* Administration
* Voter participation

This creates a clearer understanding of how election systems operate simultaneously.

---

## AI Assistant

An integrated AI assistant helps users ask questions related to:

* voting systems
* election terminology
* governance structures
* democratic processes

The assistant is designed to remain:

* educational
* factual
* non-partisan

---

## Election Glossary

Searchable explanations for common election and governance terminology.

---

## Voting Systems Comparison

Interactive comparison between:

* First Past the Post (FPTP)
* Ranked Choice Voting (RCV)
* Proportional Representation (PR)
* Mixed-Member Proportional (MMP)
* Two-Round Systems

---

## Quiz System

A lightweight quiz system to reinforce learning and improve user understanding.

---

# Tech Stack

* React
* Vite
* JavaScript
* CSS
* Groq API
* Llama 3.1
* Google Fonts

---

# How It Works

1. Users explore election concepts through interactive visual systems.
2. Timeline matrices organize complex processes into understandable structures.
3. The AI assistant answers civic and election-related questions.
4. Educational tools and quizzes reinforce learning.

---

# Google Services Used

* Google Fonts

  * Cormorant Garamond
  * Outfit

These are used to improve readability, typography, and overall accessibility of the platform.

---

# Security

API keys are stored using environment variables and excluded using `.gitignore`.

Sensitive credentials are never committed to the repository.

---

# Setup Instructions

## Clone Repository

```bash
git clone <repository-url>
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_api_key_here
```

## Run Development Server

```bash
npm run dev
```

---

# Assumptions

* Users have internet access for AI functionality
* Users are using a modern browser
* The platform is intended for educational and informational purposes only

---

# Future Improvements

* Multi-language support
* Real-time election datasets
* Accessibility enhancements
* Personalized learning paths
* Mobile-first interaction improvements
* AI-powered election simulations

---

# Author

Built by Taranjeet Singh for the Google Antigravity Hackathon.
