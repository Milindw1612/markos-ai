# MarkOS AI — Daily Morning Brief: Setup Guide

This is a **real, importable n8n workflow** — not a mockup. It models Module 11 (Reporting & Dashboard Engine)'s "Daily Morning Brief" from the MarkOS AI spec: pull marketing data → compute metrics → generate a narrative → email it, every morning at 7 AM.

**This version is 100% free to run.** The narrative is generated with rule-based logic inside the workflow itself (a Code node) — no external LLM API, no API key, no signup, no cost. See "Want a real AI-written narrative instead?" below if you'd rather use an LLM once you're ready to pay for API access.

> **Status: not yet test-run end-to-end in a live n8n instance.** Verify it works in your own environment before relying on it — the steps below cover import, credentials, and a test run.

## What it does

1. **Daily 7AM Trigger** — a schedule/cron node.
2. **Read Mock Marketing Data** — reads a Google Sheet seeded from [`mock-marketing-data-template.csv`](mock-marketing-data-template.csv) (date, channel, spend, revenue, leads, roas).
3. **Compute Metrics** — a Code node that totals the latest day, compares to the prior day, flags any channel below a 2.2x ROAS floor, and estimates budget pacing.
4. **Generate Narrative (Template)** — a Code node that builds a short brief from the computed metrics using conditional logic (no external API), always producing exactly 3 prioritized recommended actions.
5. **Send Morning Brief Email** — a Gmail node.

## Prerequisites

- A working n8n instance (cloud or self-hosted).
- A Google account, to hold the mock data sheet.
- A Gmail account n8n can send from.

That's it — no Anthropic/OpenAI account, no API key, no billing setup.

## Import steps

1. In n8n: **Workflows → Import from File** → select `daily-morning-brief.json`.
2. **Create the data sheet**: open Google Sheets, create a new sheet, and paste in the contents of `mock-marketing-data-template.csv` (File → Import → Upload, or copy/paste the columns directly). Note the Sheet's document ID from its URL.
3. In the **Read Mock Marketing Data** node, replace `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` with your sheet's ID, and connect your Google Sheets OAuth credential.
4. In the **Send Morning Brief Email** node, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with the address you want the brief sent to, and connect your Gmail OAuth credential.

## Test run

1. Click **Execute Workflow** in n8n (this bypasses the schedule and runs it once immediately).
2. Check each node's output — confirm the Google Sheet read returns rows, and the **Generate Narrative (Template)** node's `narrative` field reads sensibly.
3. Confirm the email arrives with the narrative and 3 numbered actions.
4. Once confirmed, toggle the workflow **Active** to let the 7 AM schedule take over.

## Customizing

- **Real data instead of mock data**: swap the Google Sheets node for a Supermetrics, Google Ads, or Meta Ads node once you have paid access — the rest of the workflow doesn't need to change.
- **Slack or WhatsApp instead of email**: replace the Gmail node with a Slack node or a WhatsApp Business API HTTP Request node.
- **Anomaly threshold / monthly budget**: both are hardcoded in the Compute Metrics Code node (`2.2` ROAS floor, `monthlyBudget = 1500000`) — edit directly for your own numbers.
- **Recommended-action rules**: edit the `candidates` list in the Generate Narrative (Template) node to add or reorder rules — it always keeps the top 3.

## Want a real AI-written narrative instead?

The template-based version above is genuinely free forever. If you later want more natural, LLM-written phrasing:

1. Add an HTTP Request node between **Compute Metrics** and **Send Morning Brief Email**, calling your LLM provider of choice (Anthropic, OpenAI, or a free-tier option like Google Gemini's or Groq's free API tier — check their current limits before relying on it).
2. Feed it the same computed metrics (`spend`, `revenue`, `roas`, `roas_delta_pct`, `leads`, `anomalies`, `budget_pacing_pct`) and ask for a short brief with 3 numbered actions.
3. Point **Send Morning Brief Email**'s message field at the LLM response instead of `{{ $json.narrative }}`.

Anthropic's API (`console.anthropic.com`) is billed separately from a Claude.ai Pro/Max or Claude Code subscription — it needs its own account with a payment method. For a model this size (a few hundred tokens, once a day), cost is negligible either way — but there's no obligation to use a paid API at all; the template version above works standalone.

## Note on the data

`mock-marketing-data-template.csv` is illustrative sample data, not a real business's figures. Replace it with your own data (mock or real) before using this beyond a demo.
