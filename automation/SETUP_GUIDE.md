# MarkOS AI — Daily Morning Brief: Setup Guide

This is a **real, importable n8n workflow** — not a mockup. It models Module 11 (Reporting & Dashboard Engine)'s "Daily Morning Brief" from the MarkOS AI spec: pull marketing data → compute metrics → have an AI write the narrative → email it, every morning at 7 AM.

> **Status: not yet test-run end-to-end in a live n8n instance.** Verify it works in your own environment before relying on it — the steps below cover import, credentials, and a test run.

## What it does

1. **Daily 7AM Trigger** — a schedule/cron node.
2. **Read Mock Marketing Data** — reads a Google Sheet seeded from [`mock-marketing-data-template.csv`](mock-marketing-data-template.csv) (date, channel, spend, revenue, leads, roas).
3. **Compute Metrics** — a Code node that totals the latest day, compares to the prior day, flags any channel below a 2.2x ROAS floor, and estimates budget pacing.
4. **Generate AI Narrative (Claude)** — an HTTP Request node calling the Claude API with the computed metrics, asking for a short brief with 3 numbered recommended actions.
5. **AI Call Succeeded?** — an IF node checking the API actually returned text.
6. **Send Morning Brief Email** (success path) / **Send Fallback Email** (failure path) — both Gmail nodes.

## Prerequisites

- A working n8n instance (cloud or self-hosted).
- A Google account, to hold the mock data sheet.
- An [Anthropic API key](https://console.anthropic.com/) (Claude).
- A Gmail account n8n can send from.

## Import steps

1. In n8n: **Workflows → Import from File** → select `daily-morning-brief.json`.
2. **Create the data sheet**: open Google Sheets, create a new sheet, and paste in the contents of `mock-marketing-data-template.csv` (File → Import → Upload, or copy/paste the columns directly). Note the Sheet's document ID from its URL.
3. In the **Read Mock Marketing Data** node, replace `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` with your sheet's ID, and connect your Google Sheets OAuth credential.
4. In the **Generate AI Narrative (Claude)** node, create an **HTTP Header Auth** credential named `Anthropic API` with:
   - Header name: `x-api-key`
   - Header value: your Anthropic API key
   Attach this credential to the node.
5. In both Gmail nodes, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with the address you want the brief sent to, and connect your Gmail OAuth credential.

## Test run

1. Click **Execute Workflow** in n8n (this bypasses the schedule and runs it once immediately).
2. Check each node's output — confirm the Google Sheet read returns rows, the Code node's `Compute Metrics` output looks sane, and the Claude call returns a `content` array with text.
3. Confirm the email arrives. If the AI step fails, confirm the fallback email arrives instead — this is the expected failure-mode behavior, not a bug.
4. Once confirmed, toggle the workflow **Active** to let the 7 AM schedule take over.

## Customizing

- **Real data instead of mock data**: swap the Google Sheets node for a Supermetrics, Google Ads, or Meta Ads node once you have paid access — the rest of the workflow (metrics, AI narrative, delivery) doesn't need to change.
- **Slack or WhatsApp instead of email**: replace the two Gmail nodes with a Slack node or a WhatsApp Business API HTTP Request node; keep the same two branches (success/fallback).
- **Different AI model**: change the `model` field in the Generate AI Narrative node's JSON body.
- **Anomaly threshold / monthly budget**: both are hardcoded in the Compute Metrics Code node (`2.2` ROAS floor, `monthlyBudget = 1500000`) — edit directly for your own numbers.

## Note on the data

`mock-marketing-data-template.csv` is illustrative sample data, not a real business's figures. Replace it with your own data (mock or real) before using this beyond a demo.
