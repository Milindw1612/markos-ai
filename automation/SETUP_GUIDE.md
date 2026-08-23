# MarkOS AI — Daily Morning Brief: Setup Guide

This is a **real, importable n8n workflow** — not a mockup. It models Module 11 (Reporting & Dashboard Engine)'s "Daily Morning Brief" from the MarkOS AI spec: pull marketing data → compute metrics → write an executive summary → email a CEO-style HTML infographic, every morning at 7 AM.

**This version is free to run.** The executive summary is written by Google's **Gemini API free tier** (no payment method required). If that call ever fails or gets rate-limited, the workflow automatically falls back to a rule-based summary, so the email always goes out either way. The trend chart is rendered by **QuickChart.io's free image API** (no key, no signup).

> **Status: not yet test-run end-to-end in a live n8n instance** (though the metrics/HTML-generation logic has been simulated and verified against the actual mock data outside of n8n). Verify it works in your own environment before relying on it — the steps below cover import, credentials, and a test run.

## What the email looks like

A dark header bar with the date, 4 KPI cards (Revenue, Spend, Blended ROAS, Leads) each showing today's value and a colored ▲/▼ delta vs. yesterday, a budget-pacing line, an embedded 8-day spend-vs-revenue trend chart, an anomaly banner (green if clean, amber if any channel is below the ROAS floor), an executive summary paragraph, and exactly 3 numbered recommended actions. See `preview_email.html` if you were sent one, or run the test in Step 3 below to see it live.

## Why Gemini and not Anthropic (Claude)?

The Anthropic API (`console.anthropic.com`) is billed separately from a Claude.ai Pro/Max or Claude Code subscription — it needs its own account with a payment method, and has no ongoing free tier. Gemini's API does, which is why this workflow uses it for the executive-summary text. The KPI numbers, chart, anomaly detection, and recommended actions are all deterministic (computed from the data directly) — only the summary paragraph's wording depends on the AI call, and it has a solid fallback if that call isn't available.

## What it does (node by node)

1. **Daily 7AM Trigger** — a schedule/cron node.
2. **Read Mock Marketing Data** — reads a Google Sheet seeded from [`mock-marketing-data-template.csv`](mock-marketing-data-template.csv) — 104 rows, 26 days × 4 channels (date, channel, spend, revenue, leads, roas).
3. **Compute Metrics** — a Code node that totals the latest day, computes day-over-day % deltas for revenue/spend/leads/ROAS, flags any channel below a 2.2x ROAS floor, builds an 8-day trend series for the chart, and computes true month-to-date budget pacing against a hardcoded monthly budget.
4. **Build Fallback Narrative** — a Code node that always builds a usable executive summary and exactly 3 recommended actions from the metrics (no external API). Runs before Gemini is even called, so a working summary always exists.
5. **Ask Gemini for AI Narrative** — an HTTP Request node calling the free Gemini API for a short (2-3 sentence) CEO-style executive summary. The 3 actions are NOT requested from the AI — they stay deterministic either way.
6. **Gemini Call Succeeded?** — an IF node checking the response actually contains text.
7. **Use AI Summary** / **Use Fallback Summary** — normalizes whichever branch fired into the same shape (metrics + actions + one `summary_text` field), so the next step doesn't need to know which path was taken.
8. **Build Email HTML** — a Code node that renders the full infographic: KPI cards with delta badges, a QuickChart-embedded trend chart, the anomaly banner, the summary, and the actions list, wrapped in table-based HTML for email-client compatibility.
9. **Send Morning Brief Email** — a single Gmail node, Email Type set to HTML.

## Prerequisites

- A working n8n instance (cloud or self-hosted).
- A Google account (for both the data sheet and the free Gemini API key).
- A Gmail account n8n can send from.

No credit card, no paid API account.

## Import steps

1. In n8n: **Workflows → Import from File** → select `daily-morning-brief.json`.
2. **Create the data sheet**: open Google Sheets, create a new sheet, and import `mock-marketing-data-template.csv` (File → Import → Upload — it's 104 rows, so use "Replace current sheet" or paste as values). Note the Sheet's document ID from its URL.
3. In the **Read Mock Marketing Data** node, replace `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` with your sheet's ID, and connect your Google Sheets OAuth credential.
4. **Get a free Gemini API key**: go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with your Google account, and click "Create API key" — no billing setup required for the free tier.
5. In the **Ask Gemini for AI Narrative** node, create an **HTTP Query Auth** credential named `Gemini API` with:
   - Name: `key`
   - Value: your Gemini API key
   Attach this credential to the node.
6. In the **Send Morning Brief Email** node, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with your address, connect your Gmail OAuth credential, and **confirm the Email Type field shows "HTML"** — set it manually if the import doesn't carry it over cleanly.

## Test run

1. Click **Execute Workflow** in n8n (bypasses the schedule, runs once immediately).
2. Check the **Compute Metrics** node's output — confirm `anomalies`, `trend`, and `deltas` look sensible against the sheet data.
3. Check the **Ask Gemini for AI Narrative** node's output — confirm it returns `candidates[0].content.parts[0].text`.
4. Confirm the email arrives, renders as a formatted infographic (not raw HTML tags as text — that would mean the Email Type wasn't set to HTML), and the chart image loads. If the Gemini call fails, confirm the email still arrives with the auto-generated summary label instead of "(AI-written)".
5. Once confirmed, toggle the workflow **Active** to let the 7 AM schedule take over.

## Customizing

- **Real data instead of mock data**: swap the Google Sheets node for a Supermetrics, Google Ads, or Meta Ads node — the rest of the workflow doesn't need to change.
- **Slack or WhatsApp instead of email**: replace the Gmail node with a Slack node or a WhatsApp Business API HTTP Request node; feed it the same `{{ $json.html }}` (Slack/WhatsApp won't render the HTML, so you'd want a plain-text variant — ask for one if needed).
- **Monthly budget**: hardcoded as `monthlyBudget = 6000000` (₹60L) in the Compute Metrics node, sized to match this mock data's ~₹2L/day spend rate. Replace with your real number — the pacing math itself (true month-to-date spend ÷ expected-by-this-day fraction) is accurate, not an approximation.
- **Anomaly threshold**: the `2.2` ROAS floor is hardcoded in Compute Metrics — edit directly.
- **Chart appearance/window**: the trend chart uses the last 8 days and a QuickChart line-chart config inside the Build Email HTML node — edit the `chartConfig` object to change chart type, colors, or window length.
- **Fallback-only action rules**: edit the `candidates` list in Build Fallback Narrative to add or reorder rules — it always keeps the top 3.

## Note on the embedded chart

The chart image is generated on the fly by `quickchart.io` each time the email is opened (the `<img>` tag points at a QuickChart URL, not a static file) — no signup or key needed for this volume of use, but it does mean opening the email makes a request to a third-party service. If that's a concern for real (non-demo) use, swap it for a chart image you generate and attach yourself.

## Note on the data

`mock-marketing-data-template.csv` is illustrative sample data (with one intentional anomaly — Influencer's ROAS decays over the last 4 days — to make the anomaly banner meaningful when you test-run it), not a real business's figures.
