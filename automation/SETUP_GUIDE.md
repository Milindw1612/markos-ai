# MarkOS AI — Daily Morning Brief: Setup Guide

This is a **real, importable n8n workflow** — not a mockup. It models Module 11 (Reporting & Dashboard Engine)'s "Daily Morning Brief" from the MarkOS AI spec: pull marketing data across 4 products, 4 channels, and 8 campaigns → compute metrics → write an executive summary → email a CEO-style, multi-chart HTML infographic, every morning at 7 AM.

**This version is free to run.** The executive summary is written by Google's **Gemini API free tier** (no payment method required). If that call ever fails or gets rate-limited, the workflow automatically falls back to a rule-based summary, so the email always goes out either way. All 4 charts are rendered by **QuickChart.io's free image API** (no key, no signup).

> **Status: not yet test-run end-to-end in a live n8n instance** — but the metrics/HTML-generation logic has been executed directly from the shipped JSON file (not a separate copy) against the actual mock data outside of n8n, so the logic itself is verified. Still confirm it end-to-end in your own environment before relying on it — the steps below cover import, credentials, and a test run.

## The data model

The mock data spans 4 products across 4 different industries (matching the verticals the MarkOS AI spec itself targets), each running 2 campaigns across 4 real ad channels:

| Product | Industry | Channels | Campaigns |
|---|---|---|---|
| Vantage CRM | B2B SaaS | Google Ads, Facebook, Instagram, LinkedIn | Campaign 1, Campaign 2 |
| Lumiere Skincare | Cosmetics & Beauty | Google Ads, Facebook, Instagram, LinkedIn | Campaign 1, Campaign 2 |
| Solara Fitband | Consumer Electronics | Google Ads, Facebook, Instagram, LinkedIn | Campaign 1, Campaign 2 |
| Aurelia Jewellery | Luxury & Jewellery | Google Ads, Facebook, Instagram, LinkedIn | Campaign 1, Campaign 2 |

4 products × 2 campaigns × 4 channels × 16 days = **512 rows** in [`mock-marketing-data-template.csv`](mock-marketing-data-template.csv) (columns: `date, product, campaign, channel, spend, revenue, leads, roas`). Each product's channel mix and baseline ROAS is weighted realistically (e.g. Vantage CRM skews toward Google Ads/LinkedIn as a B2B product; Lumiere Skincare and Aurelia Jewellery skew toward Instagram/Facebook as D2C brands). One deliberate anomaly is built in: **Aurelia Jewellery — Campaign 2** decays across all its channels over the last 4 days, so the anomaly banner and recommended actions have something real to demonstrate when you test-run it.

## What the email looks like

A dark header bar with the date and a one-line scale summary ("4 product lines · 4 channels · 8 active campaigns"), 4 KPI cards (Revenue, Spend, Blended ROAS, Leads) each with a colored ▲/▼ delta vs. yesterday, a budget-pacing line, then **4 charts**: an 8-day spend-vs-revenue trend line, a spend-by-channel donut, a revenue-by-product donut, and a campaign ROAS leaderboard (horizontal bar, color-coded green/amber/red by performance threshold) — followed by an anomaly banner, an executive summary paragraph, and exactly 3 numbered recommended actions.

## Why Gemini and not Anthropic (Claude)?

The Anthropic API (`console.anthropic.com`) is billed separately from a Claude.ai Pro/Max or Claude Code subscription — it needs its own account with a payment method, and has no ongoing free tier. Gemini's does. The KPI numbers, all 4 charts, anomaly detection, and recommended actions are all deterministic (computed from the data directly) — only the executive summary paragraph's wording depends on the AI call, and it has a solid fallback if that call isn't available.

## What it does (node by node)

1. **Daily 7AM Trigger** — a schedule/cron node.
2. **Read Mock Marketing Data** — reads a Google Sheet seeded from `mock-marketing-data-template.csv` (512 rows).
3. **Compute Metrics** — a Code node that totals today vs. yesterday, computes per-KPI % deltas, breaks revenue down by product and spend down by channel, computes ROAS per (product, campaign) pair, flags any campaign below a 2.2x ROAS floor, identifies the best/worst campaign, builds an 8-day trend series, and computes true month-to-date budget pacing.
4. **Build Fallback Narrative** — a Code node that always builds a usable executive summary (naming the best campaign and any anomalies by name) and exactly 3 recommended actions — no external API. Runs before Gemini is even called.
5. **Ask Gemini for AI Narrative** — an HTTP Request node calling the free Gemini API with the richer metrics (including best/worst campaign by name) for a short CEO-style executive summary. The 3 actions stay deterministic either way.
6. **Gemini Call Succeeded?** — an IF node checking the response actually contains text.
7. **Use AI Summary** / **Use Fallback Summary** — normalizes whichever branch fired into the same shape.
8. **Build Email HTML** — a Code node that renders the full infographic: KPI cards, all 4 QuickChart-embedded charts, the anomaly banner, the summary, and the actions list, as table-based HTML for email-client compatibility.
9. **Send Morning Brief Email** — a single Gmail node, Email Type set to HTML.

## Prerequisites

- A working n8n instance (cloud or self-hosted).
- A Google account (for both the data sheet and the free Gemini API key).
- A Gmail account n8n can send from.

No credit card, no paid API account.

## Import steps

1. In n8n: **Workflows → Import from File** → select `daily-morning-brief.json`.
2. **Create the data sheet**: open Google Sheets, create a new sheet, and import `mock-marketing-data-template.csv` (File → Import → Upload — it's 512 rows, so use "Replace current sheet"). Note the Sheet's document ID from its URL.
3. In the **Read Mock Marketing Data** node, replace `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` with your sheet's ID, and connect your Google Sheets OAuth credential.
4. **Get a free Gemini API key**: go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with your Google account, and click "Create API key" — no billing setup required for the free tier.
5. In the **Ask Gemini for AI Narrative** node, create an **HTTP Query Auth** credential named `Gemini API` with:
   - Name: `key`
   - Value: your Gemini API key
   Attach this credential to the node.
6. In the **Send Morning Brief Email** node, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with your address, connect your Gmail OAuth credential, and **confirm the Email Type field shows "HTML"** — set it manually if the import doesn't carry it over cleanly.

## Test run

1. Click **Execute Workflow** in n8n (bypasses the schedule, runs once immediately).
2. Check the **Compute Metrics** node's output — confirm `anomalies`, `campaignPerformance`, `revenueByProduct`, `spendByChannel`, and `trend` all look sensible against the sheet data.
3. Check the **Ask Gemini for AI Narrative** node's output — confirm it returns `candidates[0].content.parts[0].text`.
4. Confirm the email arrives, renders as a formatted infographic with all 4 charts loading (not raw HTML tags as text — that would mean the Email Type wasn't set to HTML). If the Gemini call fails, confirm the email still arrives with the "(auto-generated)" summary label instead of "(AI-written)".
5. Once confirmed, toggle the workflow **Active** to let the 7 AM schedule take over.

## Customizing

- **Real data instead of mock data**: swap the Google Sheets node for a Supermetrics, Google Ads, or Meta Ads node — keep the same `product, campaign, channel, spend, revenue, leads, roas` shape and the rest of the workflow doesn't need to change.
- **Different products/channels**: edit the CSV (or your real data source) — `Compute Metrics` groups dynamically by whatever `product`/`channel`/`campaign` values appear, nothing is hardcoded to the current 4 products.
- **Chart colors**: `CHANNEL_COLORS` and `PRODUCT_COLORS` are defined at the top of the Build Email HTML node — add an entry for any new product/channel name, or they'll fall back to grey.
- **Monthly budget**: hardcoded as `monthlyBudget = 10000000` (₹1Cr) in Compute Metrics, sized to this mock data's ~₹3.2L/day spend rate. Replace with your real number — the pacing math (true month-to-date spend ÷ expected-by-this-day fraction) is accurate, not an approximation.
- **Anomaly threshold**: the `2.2` ROAS floor is hardcoded in Compute Metrics — edit directly.
- **Fallback-only action rules**: edit the `candidates` list in Build Fallback Narrative to add or reorder rules — it always keeps the top 3.

## Note on the charts

All 4 chart images are generated on the fly by `quickchart.io` each time the email is opened — no signup or key needed for this volume of use, but opening the email does make 4 requests to a third-party service. If that's a concern for real (non-demo) use, generate and attach the charts yourself instead.

## Note on the data

`mock-marketing-data-template.csv` is illustrative sample data (with one intentional anomaly, described above), not a real business's figures.
