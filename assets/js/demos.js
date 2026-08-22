// MarkOS AI — demo panel logic. All data below is illustrative/fictional sample data.

document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initDashboard();
  initRoi();
  initRecommendations();
  initCompetitive();
});

/* ---------- shared: toast + tabs ---------- */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2400);
}

function initTabs() {
  var tabs = document.querySelectorAll('.demo-tab');
  var views = document.querySelectorAll('.demo-view');

  function activate(target) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.target === target); });
    views.forEach(function (v) { v.classList.toggle('active', v.id === target); });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activate(tab.dataset.target);
      history.replaceState(null, '', '#' + tab.dataset.target);
    });
  });

  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);
}

/* ---------- (a) Dashboard ---------- */
function initDashboard() {
  var kpis = [
    { label: 'Revenue (MTD)', value: '₹1.84Cr', delta: '+6% vs. target', status: 'good' },
    { label: 'Blended ROAS', value: '3.8x', delta: '-0.2x vs. target 4.0x', status: 'warn' },
    { label: 'Total Spend', value: '₹48.2L', delta: 'On pace', status: 'good' },
    { label: 'MQLs (MTD)', value: '312', delta: '+12% vs. target', status: 'good' },
    { label: 'Pipeline Value', value: '₹6.2Cr', delta: '3.4x coverage', status: 'good' },
    { label: 'CAC', value: '₹4,850', delta: '+8% vs. target', status: 'warn' },
    { label: 'LTV', value: '₹58,000', delta: '12.0x LTV:CAC', status: 'good' },
    { label: 'Budget Remaining', value: '34%', delta: '9 days left in month', status: 'good' }
  ];
  var grid = document.getElementById('kpi-grid');
  grid.innerHTML = kpis.map(function (k) {
    return '<div class="kpi-tile status-' + k.status + '"><div class="label">' + k.label + '</div>' +
      '<div class="value">' + k.value + '</div>' +
      '<div class="delta ' + k.status + '">' + k.delta + '</div></div>';
  }).join('');

  var days = Array.from({ length: 30 }, function (_, i) { return 'Day ' + (i + 1); });
  var spend = days.map(function () { return Math.round(140000 + Math.random() * 60000); });
  var revenue = spend.map(function (s) { return Math.round(s * (3.2 + Math.random() * 1.4)); });

  new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label: 'Spend (₹)', data: spend, borderColor: '#D5493F', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0 },
        { label: 'Revenue (₹)', data: revenue, borderColor: '#2F6FED', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { ticks: { maxTicksLimit: 6, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { font: { size: 10 } } }
      }
    }
  });

  var answers = [
    '<strong>ROAS by channel — July (sample):</strong><br>Search 4.6x · Meta 3.9x · LinkedIn 2.8x · YouTube 3.3x · Influencer 2.1x.<br><br>Search remains the most efficient channel this month; Influencer is below the 2.5x floor and flagged for review in the Recommendation Engine.',
    '<strong>MQL volume — Q2 vs Q1 (sample):</strong><br>SaaS product line: 428 → 511 MQLs (+19%).<br>Luxury/Jewellery line: 190 → 174 MQLs (-8%), driven by a Q2 pause on Meta prospecting.',
    '<strong>Best true ROI this month (sample):</strong><br>"Diwali Collection Push" — 5.2x ROAS, 3.1x true ROI after agency and content costs. Highest profit contribution of any active campaign this month.'
  ];
  var select = document.getElementById('askSelect');
  var answerBox = document.getElementById('askAnswer');
  function renderAnswer() { answerBox.innerHTML = answers[select.value]; }
  select.addEventListener('change', renderAnswer);
  document.getElementById('regenAsk').addEventListener('click', function () {
    select.value = (parseInt(select.value, 10) + 1) % answers.length;
    renderAnswer();
  });
  renderAnswer();

  document.getElementById('scheduleBtn').addEventListener('click', function () {
    showToast('This report would now be scheduled — illustrative action, nothing was actually sent.');
  });
}

/* ---------- (b) ROI / ROAS / MMM ---------- */
function initRoi() {
  var channels = [
    { key: 'search', label: 'Search', k: 9.2, color: '#2F6FED' },
    { key: 'social', label: 'Social', k: 7.4, color: '#7C5CFF' },
    { key: 'video', label: 'Video', k: 5.6, color: '#1E9E6B' },
    { key: 'influencer', label: 'Influencer', k: 4.3, color: '#C68A1E' }
  ];
  var pct = { search: 35, social: 30, video: 20, influencer: 15 };
  var totalBudgetLakh = 50;
  var avgDealSizeRupees = 15000;

  var container = document.getElementById('sliders');
  container.innerHTML = channels.map(function (c) {
    return '<div class="slider-row">' +
      '<label>' + c.label + '</label>' +
      '<input type="range" min="0" max="100" value="' + pct[c.key] + '" data-key="' + c.key + '">' +
      '<div class="pct" id="pct-' + c.key + '">' + pct[c.key] + '%</div>' +
      '</div>';
  }).join('');

  function recompute() {
    var totalRevenue = 0;
    channels.forEach(function (c) {
      var budget = totalBudgetLakh * (pct[c.key] / 100);
      var revenue = budget > 0 ? c.k * Math.pow(budget, 0.72) : 0;
      totalRevenue += revenue;
    });
    var roas = totalRevenue / totalBudgetLakh;
    var customers = (totalRevenue * 100000) / avgDealSizeRupees;
    var cac = customers > 0 ? (totalBudgetLakh * 100000) / customers : 0;

    document.getElementById('roiRevenue').textContent = '₹' + totalRevenue.toFixed(1) + 'L';
    document.getElementById('roiRoas').textContent = roas.toFixed(2) + 'x';
    document.getElementById('roiCac').textContent = '₹' + Math.round(cac).toLocaleString('en-IN');
  }

  container.querySelectorAll('input[type=range]').forEach(function (slider) {
    slider.addEventListener('input', function () {
      var key = slider.dataset.key;
      var newVal = parseInt(slider.value, 10);
      var others = channels.map(function (c) { return c.key; }).filter(function (k) { return k !== key; });
      var remaining = 100 - newVal;
      var othersSum = others.reduce(function (s, k) { return s + pct[k]; }, 0);

      pct[key] = newVal;
      if (othersSum === 0) {
        var even = remaining / others.length;
        others.forEach(function (k) { pct[k] = even; });
      } else {
        others.forEach(function (k) { pct[k] = remaining * (pct[k] / othersSum); });
      }

      channels.forEach(function (c) {
        var el = document.getElementById('pct-' + c.key);
        if (el) el.textContent = Math.round(pct[c.key]) + '%';
        var input = container.querySelector('input[data-key="' + c.key + '"]');
        if (input && c.key !== key) input.value = pct[c.key];
      });
      recompute();
    });
  });

  recompute();

  var satLabels = Array.from({ length: 11 }, function (_, i) { return (i * 5) + 'L'; });
  new Chart(document.getElementById('saturationChart'), {
    type: 'line',
    data: {
      labels: satLabels,
      datasets: channels.map(function (c) {
        return {
          label: c.label,
          data: satLabels.map(function (_, i) { return +(c.k * Math.pow(i * 5, 0.72)).toFixed(1); }),
          borderColor: c.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0
        };
      })
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { title: { display: true, text: 'Spend (₹L)', font: { size: 10 } }, ticks: { font: { size: 10 } }, grid: { display: false } },
        y: { title: { display: true, text: 'Revenue (₹L)', font: { size: 10 } }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

/* ---------- (c) Recommendations ---------- */
function initRecommendations() {
  var recs = [
    { tag: 'SCALE', title: 'Scale Meta Advantage+ — Diwali Collection', desc: 'ROAS trending 5.1x over the last 7 days, well above target. Increasing daily budget captures more of a converting audience before saturation.', confidence: '88%', impact: 'Est. +₹4.2L incremental revenue / month' },
    { tag: 'PAUSE', title: 'Pause Google Display — Retarget Tier 3', desc: 'ROAS has held at 0.9x for 12 days with no recovery signal. Spend is better redeployed to Search.', confidence: '74%', impact: 'Frees ₹1.1L / month at negative contribution' },
    { tag: 'SHIFT', title: 'Shift 15% of budget: Search → YouTube', desc: 'YouTube saturation is at 41% vs. Search at 78%. Marginal return on the next rupee is currently higher on YouTube.', confidence: '81%', impact: 'Est. +0.3x blended ROAS' },
    { tag: 'BID', title: 'Raise Target ROAS bid — Luxury Jewellery Search', desc: 'Impression share lost to budget is 22%. Current bid strategy is leaving qualified volume on the table.', confidence: '69%', impact: 'Est. +18% conversion volume' },
    { tag: 'ALERT', title: 'Competitor launched a 40%-off campaign on Meta', desc: 'Detected via ad-library monitoring 6 hours ago. A counter-brief has been drafted and is ready for review.', confidence: '—', impact: 'Recommended counter-strategy attached' }
  ];

  var feed = document.getElementById('recFeed');
  feed.innerHTML = recs.map(function (r, i) {
    return '<div class="rec-card" id="rec-' + i + '">' +
      '<span class="rec-tag ' + r.tag + '">' + r.tag + '</span>' +
      '<div class="rec-body">' +
        '<div class="rec-title">' + r.title + '</div>' +
        '<div class="rec-desc">' + r.desc + '</div>' +
        '<div class="rec-meta">Confidence: ' + r.confidence + ' &middot; Impact: ' + r.impact + '</div>' +
        '<div class="rec-actions">' +
          '<button class="approve" data-action="Approved" data-idx="' + i + '">Approve</button>' +
          '<button data-action="Snoozed" data-idx="' + i + '">Snooze</button>' +
          '<button data-action="Dismissed" data-idx="' + i + '">Dismiss</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  var auditList = document.getElementById('auditList');
  var actedCount = 0;

  feed.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = document.getElementById('rec-' + btn.dataset.idx);
      if (card.classList.contains('actioned')) return;
      card.classList.add('actioned');
      card.querySelectorAll('button').forEach(function (b) { b.disabled = true; });

      var now = new Date();
      var stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (actedCount === 0) auditList.innerHTML = '';
      var li = document.createElement('li');
      li.textContent = '[' + stamp + '] ' + btn.dataset.action + ' — ' + recs[btn.dataset.idx].title;
      auditList.prepend(li);
      actedCount++;

      document.getElementById('recCount').textContent = (recs.length - actedCount) + ' active';
    });
  });
}

/* ---------- (d) Competitive Intelligence ---------- */
function initCompetitive() {
  var sov = [
    { label: 'MarkOS Brand', value: 28, color: '#2F6FED' },
    { label: 'Competitor A', value: 26, color: '#D5493F' },
    { label: 'Competitor B', value: 19, color: '#C68A1E' },
    { label: 'Competitor C', value: 14, color: '#7C5CFF' },
    { label: 'Others', value: 13, color: '#90959D' }
  ];

  new Chart(document.getElementById('sovChart'), {
    type: 'doughnut',
    data: {
      labels: sov.map(function (s) { return s.label; }),
      datasets: [{ data: sov.map(function (s) { return s.value; }), backgroundColor: sov.map(function (s) { return s.color; }), borderWidth: 0 }]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });

  var ads = [
    { name: 'Competitor A', platform: 'Meta', spend: '₹8–11L / mo (est.)', note: 'New carousel ad pushing a 40% festive discount, launched 6 days ago.' },
    { name: 'Competitor B', platform: 'Google', spend: '₹4–6L / mo (est.)', note: 'Aggressive bidding on your branded search terms since last week.' },
    { name: 'Competitor C', platform: 'LinkedIn', spend: '₹2–3L / mo (est.)', note: 'New thought-leadership content series targeting the same ICP.' },
    { name: 'Competitor A', platform: 'YouTube', spend: '₹5–7L / mo (est.)', note: 'Brand film featuring a celebrity endorsement, high frequency.' }
  ];
  document.getElementById('competitorAds').innerHTML = ads.map(function (a) {
    return '<div class="tool-card"><div class="tool-cat">' + a.platform + ' &middot; ' + a.spend + '</div>' +
      '<div class="tool-name">' + a.name + '</div>' +
      '<div class="tool-desc">' + a.note + '</div></div>';
  }).join('');

  var briefs = [
    'This week, Competitor A leaned hard into a 40%-off festive push on Meta — likely a margin-driven inventory clear rather than a sustained pricing shift. Recommended response: a value-anchored counter-message (bundle or loyalty offer) rather than a direct price match, to protect blended ROAS.',
    'Competitor B is now bidding on your branded search terms for the first time in 90 days. Impression share on brand terms has dipped 6 points. Recommended response: raise brand-term bids modestly and reinforce with a branded retargeting layer on Meta.',
    'Competitor C shifted spend toward thought-leadership content on LinkedIn rather than direct-response ads — a signal they may be playing a longer sales cycle. Worth monitoring MQL quality from LinkedIn over the next two weeks before reacting.'
  ];
  var idx = 0;
  var briefBox = document.getElementById('briefText');
  function renderBrief() { briefBox.textContent = briefs[idx]; }
  renderBrief();
  document.getElementById('regenBrief').addEventListener('click', function () {
    idx = (idx + 1) % briefs.length;
    renderBrief();
  });
}
