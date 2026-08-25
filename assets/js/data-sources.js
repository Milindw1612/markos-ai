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

function platformHeaderHtml(cfg) {
  return (
    '<div class="platform-head">' +
    '<div class="platform-badge" style="background:' + cfg.color + ';">' + cfg.initials + '</div>' +
    '<div><div class="platform-title">' + cfg.label + '</div>' +
    '<div class="platform-tool-line">Extracted by <strong>' + cfg.tool + '</strong></div></div>' +
    '<span class="sim-pill" style="margin-left:auto;">Simulated / Illustrative</span>' +
    '</div>'
  );
}

function renderChannelTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg);
  html += '<div class="kpi-grid" style="margin-top:16px;">';
  html += kpiTile('Spend', fmtInr(t.spend));
  html += kpiTile('Impressions', fmtNum(t.impressions));
  html += kpiTile('Clicks', fmtNum(t.clicks));
  html += kpiTile('CTR', t.ctr + '%');
  html += kpiTile('Leads', fmtNum(t.leads));
  html += kpiTile('CAC', fmtInr(t.cac));
  html += kpiTile('Revenue', fmtInr(t.revenue));
  html += kpiTile('ROAS', t.roas + 'x');
  html += '</div>';

  html += '<div style="margin-top:24px;"><canvas id="chart-' + cfg.key.replace(/\s/g, '') + '" height="80"></canvas></div>';

  html += '<div style="margin-top:22px;font-size:13px;font-weight:600;">By product</div>';
  html += '<table class="src-table"><thead><tr><th>Product</th><th>Spend</th><th>Leads</th><th>Revenue</th><th>ROAS</th></tr></thead><tbody>';
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + p + '</td><td>' + fmtInr(bp.spend) + '</td><td>' + fmtNum(bp.leads) + '</td><td>' + fmtInr(bp.revenue) + '</td><td>' + bp.roas + 'x</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderGaTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg);
  html += '<div class="kpi-grid" style="margin-top:16px;">';
  html += kpiTile('Website Visits', fmtNum(t.visits));
  html += kpiTile('Leads Generated', fmtNum(t.leads));
  html += kpiTile('Site-wide Conv. Rate', (t.leads / t.visits * 100).toFixed(2) + '%');
  html += kpiTile('Attributed Revenue', fmtInr(t.revenue));
  html += '</div>';

  html += '<div style="margin-top:24px;"><canvas id="chart-googleAnalytics" height="80"></canvas></div>';

  html += '<div style="margin-top:22px;font-size:13px;font-weight:600;">Sessions by product website</div>';
  html += '<table class="src-table"><thead><tr><th>Website</th><th>Visits</th><th>Leads</th><th>Conv. Rate</th><th>Revenue</th></tr></thead><tbody>';
  var sites = { 'Vantage CRM': 'vantagecrm.example.com', 'Lumiere Skincare': 'lumiereskincare.example.com',
    'Solara Fitband': 'solarafitband.example.com', 'Aurelia Jewellery': 'aureliajewellery.example.com' };
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + (sites[p] || p) + '</td><td>' + fmtNum(bp.visits) + '</td><td>' + fmtNum(bp.leads) + '</td><td>' + bp.convRate + '%</td><td>' + fmtInr(bp.revenue) + '</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderYoutubeTab(cfg, block) {
  var t = block.totals;
  var html = '<div class="demo-panel">' + platformHeaderHtml(cfg);
  html += '<p style="font-size:12.5px;color:var(--text-3);margin:8px 0 4px;">' + block.note + '</p>';
  html += '<div class="kpi-grid" style="margin-top:12px;">';
  html += kpiTile('Total Views', fmtNum(t.views));
  html += kpiTile('Likes', fmtNum(t.likes));
  html += kpiTile('Comments', fmtNum(t.comments));
  html += kpiTile('Shares', fmtNum(t.shares));
  html += '</div>';

  html += '<div style="margin-top:22px;font-size:13px;font-weight:600;">By product video creative</div>';
  html += '<table class="src-table"><thead><tr><th>Product</th><th>Views</th><th>Avg. Watch %</th><th>Likes</th><th>Comments</th><th>Shares</th></tr></thead><tbody>';
  Object.keys(block.byProduct).forEach(function (p) {
    var bp = block.byProduct[p];
    html += '<tr><td>' + p + '</td><td>' + fmtNum(bp.views) + '</td><td>' + bp.avgWatchPercent + '%</td><td>' + fmtNum(bp.likes) + '</td><td>' + fmtNum(bp.comments) + '</td><td>' + fmtNum(bp.shares) + '</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function drawChannelChart(cfg, block) {
  var canvas = document.getElementById('chart-' + cfg.key.replace(/\s/g, ''));
  if (!canvas) return;
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: block.daily.map(function (d) { return d.date.slice(5); }),
      datasets: [
        { label: 'Spend', data: block.daily.map(function (d) { return d.spend; }), borderColor: '#D5493F', backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 },
        { label: 'Revenue', data: block.daily.map(function (d) { return d.revenue; }), borderColor: cfg.color, backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 }
      ]
    },
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
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: block.daily.map(function (d) { return d.date.slice(5); }),
      datasets: [{ label: 'Website Visits', data: block.daily.map(function (d) { return d.visits; }), backgroundColor: '#F9AB00' }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
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
