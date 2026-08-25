# MarkOS AI

A specification and working prototype for **MarkOS AI** — a 14-module design for an AI-native digital marketing operating system, covering campaign management, budget/ROI intelligence, content production, competitive tracking, sales-funnel analytics, and reporting for a Digital Marketing Director.

**Live site:** https://milindw1612.github.io/markos-ai/

## What this actually is

This is **not** a commercial product launch. It's a portfolio artifact built to demonstrate two things at once:

1. **Strategy depth** — a full specification of what a modern, AI-native marketing operating system needs to do, written from the point of view of a Digital Marketing Director running a real portfolio.
2. **Build capability** — a partial working prototype: four interactive demo modules (illustrative sample data only, no real company figures), one genuinely functioning n8n automation, and a real, public [LangGraph agent](https://github.com/Milindw1612/markos-ai-agent) implementing the Measure & Optimise cluster's reasoning loop.

Nothing on this site represents real company data, and the platform as a whole has not been built — see [`modules.html`](modules.html) for what's specified vs. [`demos.html`](demos.html) for what's actually running.

## Structure

```
index.html                Landing page — positioning, module grid, roadmap
modules.html              Full spec for all 14 modules
tools.html                The 46-tool stack, audited and categorised
helicopter.html           Module-cluster architecture + org/CXO reporting cascade
data-flow.html            Tool-level data-in/data-out diagrams, one per cluster
campaign-analytics.html   Simulated native-platform analytics + AI recommendations per campaign
demos.html                4 interactive demo panels, plus a real captured Agent Execution replay
automation/               A real, importable n8n workflow, the verified campaign workbook, and platform-data.json
assets/                   Shared CSS/JS, no build step, no framework
```

## Running locally

This is a static site — no build step. Open `index.html` directly, or serve it:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## The automation

`automation/daily-morning-brief.json` is a real n8n workflow — see [`automation/SETUP_GUIDE.md`](automation/SETUP_GUIDE.md) for import and setup instructions.

---

*Designed and built by Milind W. — [portfolio](https://milindw1612.github.io/)*
