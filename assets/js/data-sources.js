// MarkOS AI — simulated platform source-data page.
// All figures are fetched from automation/platform-data.json, which is
// exported directly from the same data that built markos-ai-campaign-data.xlsx
// -- nothing on this page is hand-typed or independently invented.

var PLATFORM_CONFIG = [
  { key: 'LinkedIn', label: 'LinkedIn', color: '#0A66C2', initials: 'in', type: 'channel',
    tool: 'Supermetrics / Funnel.io, via LinkedIn Marketing API' },
  { key: 'Facebook', label: 'Facebook', color: '#1877F2', initials: 'f', type: 'channel',
    tool: 'Supermetrics / Funnel.io, via Meta Marketing API' },
  { key: 'Instagram', label: 'Instagram', color: '#C2185B', initials: 'IG', type: 'channel',
    tool: 'Supermetrics / Funnel.io, via Meta Marketing API' },
  { key: 'Pinterest', label: 'Pinterest', color: '#E60023', initials: 'P', type: 'channel',
    tool: 'Supermetrics / Funnel.io, via Pinterest Ads API' },
  { key: 'Google Ads', label: 'Google Ads', color: '#4285F4', initials: 'G', type: 'channel',
    tool: 'Supermetrics / Funnel.io, via Google Ads API' },
  { key: 'googleAnalytics', label: 'Google Analytics', color: '#F9AB00', initials: 'GA', type: 'ga',
    tool: 'GA4 + AI Insights' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000', initials: 'YT', type: 'youtube',
    tool: 'YouTube Data API (organic)' },
];

function fmtNum(n) { return Number(n).toLocaleString('en-IN'); }
function fmtInr(n) {
  n = Number(n);
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
  return '₹' + fmtNum(Math.round(n));
}

function kpiTile(label, value, sub) {
  return '<div class="kpi-tile"><div class="label">' + label + '</div><div class="value">' + value + '</div>' +
    (sub ? '<div class="delta good">' + sub + '</div>' : '') + '</div>';
}

function platformHeaderHtml(cfg, tool) {
  return (
    '<div class="platform-head">' +
    '<div class="platform-badge" style="background:' + cfg.color + ';">' + cfg.initials + '</div>' +
    '<div><div class="platform-title">' + cfg.label + '</div>' +
    '<div class="platform-tool-line">Extracted by <strong>' + (tool || cfg.tool) + '</strong></div></div>' +
    '<span class="sim-pill" style="margin-left:auto;">Simulated / Illustrative</span>' +
    '</div>'
  );
}

var CAMPAIGN_COLORS = ['#2F6FED', '#D5493F', '#1E9E6B', '#7C5CFF'];

// A platform can carry more than one campaign at once (e.g. Facebook runs
// both Lumiere Skincare's and Solara Fitband's campaigns simultaneously).
// This makes that explicit right under the platform header, instead of
// leaving it to be inferred from a table further down the page.
function campaignsLineHtml(campaigns) {
  if (!campaigns || !campaigns.length) return '';
  var multi = campaigns.length > 1;
  var html = '<div style="margin:10px 0 4px;padding:10px 14px;background:var(--surface-2);border:1px solid var(--rule);border-radius:8px;">';
  html += '<div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px;">' +
    (multi ? campaigns.length + ' campaigns running on this platform right now' : 'Campaign') + '</div>';
  campaigns.forEach(function (c, i) {
    html += '<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-1);font-weight:600;margin-bottom:3px;">' +
      '<span style="width:9px;height:9px;border-radius:50%;background:' + CAMPAIGN_COLORS[i % 4] + ';flex-shrink:0;"></span>' + c + '</div>';
  });
  if (multi) {
    html += '<div style="font-size:11.5px;color:var(--text-3);margin-top:6px;">The totals below are combined across all ' + campaigns.length + ' — see "By Product / Campaign" for each one\'s individual numbers, and the chart below for each one\'s own trend.</div>';
  }
  html += '</div>';
  return html;
}

// Simple horizontal bar-list for a breakdown object like {label: pct, ...}
function breakdownBars(breakdown, barColor) {
  var html = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">';
  Object.keys(breakdown).forEach(function (label) {
    var pct = breakdown[label];
    html += '<div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-2);margin-bottom:3px;"><span>' + label + '</span><span style="font-weight:600;color:var(--text-1);">' + pct + '%</span></div>' +
      '<div style="background:var(--rule);border-radius:4px;height:7px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + barColor + ';"></div></div>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

function sectionLabel(text) {
  return '<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-3);margin-top:24px;margin-bottom:8px;">' + text + '</div>';
}

function renderChannelTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg, block.tool);
  html += campaignsLineHtml(block.campaigns);
  html += '<div class="kpi-grid" style="margin-top:16px;">';
  html += kpiTile('Spend', fmtInr(t.spend));
  html += kpiTile('Impressions', fmtNum(t.impressions));
  html += kpiTile('Clicks', fmtNum(t.clicks));
  html += kpiTile('CTR', t.ctr + '%');
  html += kpiTile('CPM', fmtInr(t.cpm));
  html += kpiTile('CPC', fmtInr(t.cpc));
  html += kpiTile('Revenue', fmtInr(t.revenue));
  html += kpiTile('ROAS', t.roas + 'x');
  html += '</div>';

  html += sectionLabel('Daily Revenue, By Campaign');
  html += '<div><canvas id="chart-' + cfg.key.replace(/\s/g, '') + '" height="80"></canvas></div>';

  // Platform-specific native insights section
  if (block.meta) {
    html += sectionLabel('Reach & Engagement');
    html += '<div class="kpi-grid">';
    html += kpiTile('Reach', fmtNum(block.meta.reach));
    html += kpiTile('Frequency', block.meta.frequency + 'x');
    html += kpiTile('Reactions', fmtNum(block.meta.reactions));
    html += kpiTile('Comments', fmtNum(block.meta.comments));
    html += kpiTile('Shares', fmtNum(block.meta.shares));
    html += kpiTile('Saves', fmtNum(block.meta.saves));
    html += '</div>';
    html += sectionLabel('Placement Breakdown (% of Impressions)');
    html += breakdownBars(block.meta.placements, cfg.color);
  }
  if (block.linkedin) {
    html += sectionLabel('Social Actions');
    html += '<div class="kpi-grid">';
    html += kpiTile('Likes', fmtNum(block.linkedin.likes));
    html += kpiTile('Comments', fmtNum(block.linkedin.comments));
    html += kpiTile('Reposts', fmtNum(block.linkedin.reposts));
    html += kpiTile('Page Follows', fmtNum(block.linkedin.follows));
    html += '</div>';
    html += sectionLabel('Audience by Seniority');
    html += breakdownBars(block.linkedin.seniorityMix, cfg.color);
  }
  if (block.pinterest) {
    html += sectionLabel('Pin Engagement');
    html += '<div class="kpi-grid">';
    html += kpiTile('Saves', fmtNum(block.pinterest.saves));
    html += kpiTile('Pin Clicks', fmtNum(block.pinterest.pinClicks));
    html += kpiTile('Outbound Clicks', fmtNum(block.pinterest.outboundClicks));
    html += kpiTile('Engagement Rate', block.pinterest.engagementRate + '%');
    html += '</div>';
  }
  if (block.googleAds) {
    html += sectionLabel('Auction & Conversion Insights');
    html += '<div class="kpi-grid">';
    html += kpiTile('Quality Score', block.googleAds.qualityScore + ' / 10');
    html += kpiTile('Search Impr. Share', block.googleAds.impressionShare + '%');
    html += kpiTile('Conversion Rate', block.googleAds.conversionRate + '%');
    html += kpiTile('Cost / Conversion', fmtInr(block.googleAds.costPerConversion));
    html += '</div>';
    html += sectionLabel('Top Search Terms');
    html += '<table class="src-table"><thead><tr><th>Keyword</th><th>Clicks</th><th>Cost</th></tr></thead><tbody>';
    block.googleAds.topKeywords.forEach(function (k) {
      html += '<tr><td>"' + k.keyword + '"</td><td>' + fmtNum(k.clicks) + '</td><td>' + fmtInr(k.cost) + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  html += sectionLabel('By Product / Campaign');
  html += '<table class="src-table"><thead><tr><th>Product</th><th>Campaign</th><th>Spend</th><th>Leads</th><th>Revenue</th><th>ROAS</th></tr></thead><tbody>';
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + p + '</td><td style="font-size:11.5px;color:var(--text-3);">' + bp.campaign + '</td><td>' + fmtInr(bp.spend) + '</td><td>' + fmtNum(bp.leads) + '</td><td>' + fmtInr(bp.revenue) + '</td><td>' + bp.roas + 'x</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderGaTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg, block.tool);
  html += campaignsLineHtml(block.campaigns);
  html += '<div class="kpi-grid" style="margin-top:16px;">';
  html += kpiTile('Sessions', fmtNum(t.sessions));
  html += kpiTile('Users', fmtNum(t.users));
  html += kpiTile('Engagement Rate', t.engagementRate + '%');
  html += kpiTile('Avg. Engagement Time', t.avgEngagementTimeSec + 's');
  html += kpiTile('Leads Generated', fmtNum(t.leads));
  html += kpiTile('Attributed Revenue', fmtInr(t.revenue));
  html += '</div>';

  html += sectionLabel('Daily Website Visits, By Campaign');
  html += '<div><canvas id="chart-googleAnalytics" height="80"></canvas></div>';

  html += sectionLabel('Traffic Source (% of Sessions)');
  html += breakdownBars(t.trafficSource, cfg.color);

  html += sectionLabel('Sessions by Product Website');
  html += '<table class="src-table"><thead><tr><th>Website</th><th>Campaign</th><th>Visits</th><th>Leads</th><th>Conv. Rate</th><th>Revenue</th></tr></thead><tbody>';
  var sites = { 'Vantage CRM': 'vantagecrm.example.com', 'Lumiere Skincare': 'lumiereskincare.example.com',
    'Solara Fitband': 'solarafitband.example.com', 'Aurelia Jewellery': 'aureliajewellery.example.com' };
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + (sites[p] || p) + '</td><td style="font-size:11.5px;color:var(--text-3);">' + bp.campaign + '</td><td>' + fmtNum(bp.visits) + '</td><td>' + fmtNum(bp.leads) + '</td><td>' + bp.convRate + '%</td><td>' + fmtInr(bp.revenue) + '</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderYoutubeTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg, block.tool);
  html += campaignsLineHtml(block.campaigns);
  html += '<p style="font-size:12.5px;color:var(--text-3);margin:8px 0 4px;">' + block.note + '</p>';
  html += '<div class="kpi-grid" style="margin-top:12px;">';
  html += kpiTile('Total Views', fmtNum(t.views));
  html += kpiTile('Watch Time', fmtNum(t.watchTimeHours) + ' hrs');
  html += kpiTile('Subscribers Gained', '+' + fmtNum(t.subscribersGained));
  html += kpiTile('Likes', fmtNum(t.likes));
  html += kpiTile('Comments', fmtNum(t.comments));
  html += kpiTile('Shares', fmtNum(t.shares));
  html += '</div>';

  html += sectionLabel('Traffic Source (% of Views)');
  html += breakdownBars(t.trafficSource, cfg.color);

  html += sectionLabel('By Product Video Creative');
  html += '<table class="src-table"><thead><tr><th>Product</th><th>Campaign</th><th>Views</th><th>Avg. Watch %</th><th>Avg. Duration</th><th>Watch Time</th></tr></thead><tbody>';
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + p + '</td><td style="font-size:11.5px;color:var(--text-3);">' + bp.campaign + '</td><td>' + fmtNum(bp.views) + '</td><td>' + bp.avgWatchPercent + '%</td><td>' + bp.avgViewDurationSec + 's</td><td>' + fmtNum(bp.watchTimeHours) + ' hrs</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

// One line per campaign, labeled by product name -- never a blended line
// nobody can attribute to a specific campaign. Falls back to a single
// Spend/Revenue pair only if a platform somehow has no per-product split.
function drawChannelChart(cfg, block) {
  var canvas = document.getElementById('chart-' + cfg.key.replace(/\s/g, ''));
  if (!canvas) return;
  var byProd = block.dailyByProduct;
  var labels = block.daily.map(function (d) { return d.date.slice(5); });
  var datasets;
  if (byProd && Object.keys(byProd).length) {
    datasets = Object.keys(byProd).map(function (prod, i) {
      return {
        label: prod + ' — Revenue', data: byProd[prod].map(function (d) { return d.revenue; }),
        borderColor: CAMPAIGN_COLORS[i % 4], backgroundColor: 'transparent', tension: 0.3, pointRadius: 0
      };
    });
  } else {
    datasets = [
      { label: 'Spend', data: block.daily.map(function (d) { return d.spend; }), borderColor: '#D5493F', backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 },
      { label: 'Revenue', data: block.daily.map(function (d) { return d.revenue; }), borderColor: cfg.color, backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 }
    ];
  }
  new Chart(canvas, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

function drawGaChart(block) {
  var canvas = document.getElementById('chart-googleAnalytics');
  if (!canvas) return;
  var byProd = block.dailyByProduct;
  var labels = block.daily.map(function (d) { return d.date.slice(5); });
  var datasets = Object.keys(byProd).map(function (prod, i) {
    return {
      label: prod + ' — Visits', data: byProd[prod].map(function (d) { return d.visits; }),
      borderColor: CAMPAIGN_COLORS[i % 4], backgroundColor: 'transparent', tension: 0.3, pointRadius: 0
    };
  });
  new Chart(canvas, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('automation/platform-data.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var tabsEl = document.getElementById('srcTabs');
      var viewsEl = document.getElementById('srcViews');
      var htmlTabs = '';
      var htmlViews = '';

      PLATFORM_CONFIG.forEach(function (cfg, i) {
        var block = cfg.type === 'ga' ? data.googleAnalytics : cfg.type === 'youtube' ? data.youtube : data.channels[cfg.key];
        if (!block) return;
        var id = 'src-' + cfg.key.replace(/\s/g, '');
        htmlTabs += '<button class="demo-tab' + (i === 0 ? ' active' : '') + '" data-target="' + id + '">' + cfg.label + '</button>';
        var body = cfg.type === 'ga' ? renderGaTab(cfg, block) : cfg.type === 'youtube' ? renderYoutubeTab(cfg, block) : renderChannelTab(cfg, block);
        htmlViews += '<div class="demo-view' + (i === 0 ? ' active' : '') + '" id="' + id + '">' + body + '</div>';
      });

      tabsEl.innerHTML = htmlTabs;
      viewsEl.innerHTML = htmlViews;

      // Charts inside a display:none panel get zero size, so Chart.js can't
      // render them -- draw each chart lazily, only once, the first time its
      // tab is actually shown.
      var chartsDrawn = {};
      function drawChartFor(cfg) {
        if (chartsDrawn[cfg.key]) return;
        var block = cfg.type === 'ga' ? data.googleAnalytics : cfg.type === 'youtube' ? data.youtube : data.channels[cfg.key];
        if (!block) return;
        if (cfg.type === 'channel') drawChannelChart(cfg, block);
        if (cfg.type === 'ga') drawGaChart(block);
        chartsDrawn[cfg.key] = true;
      }

      // First (active) tab's chart can be drawn immediately.
      drawChartFor(PLATFORM_CONFIG[0]);

      // Tab switching (same pattern as demos.js), drawing each tab's chart
      // the first time it becomes visible.
      var tabs = tabsEl.querySelectorAll('.demo-tab');
      var views = viewsEl.querySelectorAll('.demo-view');
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
          views.forEach(function (v) { v.classList.toggle('active', v.id === tab.dataset.target); });
          drawChartFor(PLATFORM_CONFIG[i]);
        });
      });
    })
    .catch(function (err) {
      document.getElementById('srcViews').innerHTML = '<p style="color:var(--text-3);">Could not load platform-data.json — ' + err + '</p>';
    });
});
