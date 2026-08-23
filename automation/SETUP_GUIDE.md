# MarkOS AI — Daily Morning Brief: Setup Guide

This is a **real, importable n8n workflow** — not a mockup. It models Module 11 (Reporting & Dashboard Engine)'s "Daily Morning Brief" from the MarkOS AI spec: pull marketing data → compute metrics → have an AI write the narrative → email it, every morning at 7 AM.

**This version is free to run.** The narrative is written by Google's **Gemini API free tier** (no payment method required — just a Google account and a free API key from Google AI Studio). If that call ever fails or gets rate-limited, the workflow automatically falls back to a rule-based narrative generated locally, so the email always goes out either way.

> **Status: not yet test-run end-to-end in a live n8n instance.** Verify it works in your own environment before relying on it — the steps below cover import, credentials, and a test run.

## Why Gemini and not Anthropic (Claude)?

The Anthropic API (`console.anthropic.com`) is billed separately from a Claude.ai Pro/Max or Claude Code subscription — it needs its own account with a payment method, and has no ongoing free tier. Google's Gemini API does offer a genuine free tier (rate-limited, but with no cost and no card required), which is why this workflow uses it. See "Want to switch to Claude instead?" below if you'd rather pay for Anthropic's API later.

## What it does

1. **Daily 7AM Trigger** — a schedule/cron node.
2. **Read Mock Marketing Data** — reads a Google Sheet seeded from [`mock-marketing-data-template.csv`](mock-marketing-data-template.csv) (date, channel, spend, revenue, leads, roas).
3. **Compute Metrics** — a Code node that totals the latest day, compares to the prior day, flags any channel below a 2.2x ROAS floor, and estimates budget pacing.
4. **Build Fallback Narrative** — a Code node that always builds a usable rule-based brief from the metrics (no external API). This runs unconditionally, before the AI call, so a working fallback always exists.
5. **Ask Gemini for AI Narrative** — an HTTP Request node calling the free Gemini API with the computed metrics, asking for a short brief with 3 numbered recommended actions.
6. **Gemini Call Succeeded?** — an IF node checking the response actually contains text.
7. **Send Morning Brief Email (AI)** (success path) — sends Gemini's narrative.
   **Send Morning Brief Email (Fallback)** (failure path) — sends the rule-based narrative from step 4 instead.

## Prerequisites

- A working n8n instance (cloud or self-hosted).
- A Google account (for both the data sheet and the free Gemini API key).
- A Gmail account n8n can send from.

No credit card, no paid API account.

## Import steps

1. In n8n: **Workflows → Import from File** → select `daily-morning-brief.json`.
2. **Create the data sheet**: open Google Sheets, create a new sheet, and paste in the contents of `mock-marketing-data-template.csv`. Note the Sheet's document ID from its URL.
3. In the **Read Mock Marketing Data** node, replace `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` with your sheet's ID, and connect your Google Sheets OAuth credential.
4. **Get a free Gemini API key**: go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with your Google account, and click "Create API key" — no billing setup required for the free tier.
5. In the **Ask Gemini for AI Narrative** node, create an **HTTP Query Auth** credential named `Gemini API` with:
   - Name: `key`
   - Value: your Gemini API key
   Attach this credential to the node.
6. In both Gmail nodes, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with the address you want the brief sent to, and connect your Gmail OAuth credential.

## Test run

1. Click **Execute Workflow** in n8n (bypasses the schedule, runs once immediately).
2. Check the **Ask Gemini for AI Narrative** node's output — confirm it returns a `candidates[0].content.parts[0].text` field with real text.
3. Confirm the email arrives with the AI-written narrative. If the Gemini call fails (bad key, rate limit, network), confirm the fallback email arrives instead with the rule-based brief — that's the expected failure-mode behavior, not a bug.
4. Once confirmed, toggle the workflow **Active** to let the 7 AM schedule take over.

## Customizing

- **Real data instead of mock data**: swap the Google Sheets node for a Supermetrics, Google Ads, or Meta Ads node once you have paid access — the rest of the workflow doesn't need to change.
- **Slack or WhatsApp instead of email**: replace both Gmail nodes with a Slack node or a WhatsApp Business API HTTP Request node; keep the same two branches (AI/fallback).
- **Gemini model**: the node calls `gemini-2.5-flash` — Google's free tier also covers other Flash-tier models; swap the model name in the URL if you want to try a different one.
- **Anomaly threshold / monthly budget**: both are hardcoded in the Compute Metrics Code node (`2.2` ROAS floor, `monthlyBudget = 1500000`) — edit directly for your own numbers.
- **Fallback-only rules**: edit the `candidates` list in the Build Fallback Narrative node to add or reorder rules — it always keeps the top 3.

## Want to switch to Claude (Anthropic) instead?

If you later set up paid Anthropic API access, replace the **Ask Gemini for AI Narrative** node with an HTTP Request node to `https://api.anthropic.com/v1/messages` (model `claude-haiku-4-5`, header `x-api-key` via an HTTP Header Auth credential, header `anthropic-version: 2023-06-01`), and update the IF node's check to `$json.content[0].text` instead of `$json.candidates[0].content.parts[0].text`. Everything else in the workflow stays the same.

## Note on rate limits

Gemini's free tier has request-rate and daily-quota limits that can change — check [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing) for current numbers. For one email a day, this workflow uses a negligible fraction of any free-tier allowance; the fallback path exists specifically so an occasional rate-limit hit never breaks the morning brief.

## Note on the data

`mock-marketing-data-template.csv` is illustrative sample data, not a real business's figures. Replace it with your own data (mock or real) before using this beyond a demo.
