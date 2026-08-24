// MarkOS AI — demo panel logic. All data below is illustrative/fictional sample data.

document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initDashboard();
  initRoi();
  initRecommendations();
  initCompetitive();
  initAgentExecution();
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

/* ---------- (e) Agent Execution replay ----------
   The four tool results below are real: captured directly from the actual
   markos-ai-agent LangGraph tools, run against the real mock dataset
   (see github.com/Milindw1612/markos-ai-agent). Only the final recommendation
   card is not yet real — that step needs a live, billed Anthropic API call
   and is honestly marked as pending rather than faked. */
function initAgentExecution() {
  var steps = [
    {
      node: 'nodeTool1', edge: 'edgeTool1', tool: 'read_spend_data',
      args: 'product="Aurelia Jewellery", campaign="Campaign 2"',
      result: 'Scope: product=Aurelia Jewellery, campaign=Campaign 2, channel=all\nDate range: 2026-07-30 to 2026-08-14 (16 days)\nTotals: spend=417100, revenue=1244385, leads=204, blended ROAS=2.98\nROAS trend: first-half avg=3.31, second-half avg=2.68\nLast 5 days (date, spend, revenue, roas):\n  2026-08-10  spend=27600  revenue=93654  roas=3.39\n  2026-08-11  spend=27500  revenue=76670  roas=2.79\n  2026-08-12  spend=27400  revenue=64943  roas=2.37\n  2026-08-13  spend=26200  revenue=45195  roas=1.72\n  2026-08-14  spend=27200  revenue=32651  roas=1.2'
    },
    {
      node: 'nodeTool2', edge: 'edgeTool2', tool: 'call_mmm_model',
      args: 'channel="Instagram", product="Aurelia Jewellery"',
      result: "Channel: Instagram | Channel ROAS: 3.45 | Blended account ROAS: 3.19\nEstimated incremental lift vs. blended average: +8.0%\nVerdict: Instagram is performing above the account's blended average."
    },
    {
      node: 'nodeTool3', edge: 'edgeTool3', tool: 'run_incrementality_test',
      args: 'product="Aurelia Jewellery", campaign="Campaign 2"',
      result: 'Earlier-window ROAS (2026-07-30 to 2026-08-06): 3.31\nLater-window ROAS (2026-08-07 to 2026-08-14): 2.66\nChange: -19.7%\nVerdict: SUSTAINED DECLINE — consistent across multiple days, not single-day noise'
    },
    {
      node: 'nodeTool4', edge: 'edgeTool4', tool: 'adjust_bid',
      args: 'product="Aurelia Jewellery", campaign="Campaign 2", channel="Google Ads"',
      result: 'Recent 3-day ROAS: 1.54 (target: 3.0)\nProposed action: decrease | Suggested bid multiplier: 0.7x\n(Proposal only — requires human approval before execution.)'
    }
  ];

  var playBtn = document.getElementById('execPlayBtn');
  var resetBtn = document.getElementById('execResetBtn');
  var log = document.getElementById('execLog');
  var recCard = document.getElementById('execRecCard');
  if (!playBtn || !resetBtn || !log || !recCard) return;

  var allNodeIds = ['nodeReasoning', 'nodeTool1', 'nodeTool2', 'nodeTool3', 'nodeTool4', 'nodeApproval'];
  var allEdgeIds = ['edgeTool1', 'edgeTool2', 'edgeTool3', 'edgeTool4', 'edgeApproval'];
  var playing = false;
  var timers = [];

  function setState(id, state) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (state) el.classList.add(state);
  }

  function reset() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
    allNodeIds.forEach(function (id) { setState(id, null); });
    allEdgeIds.forEach(function (id) { setState(id, null); });
    log.innerHTML = '<span class="exec-log-empty">Press Play to replay the captured run — real tool output from the actual dataset.</span>';
    recCard.style.display = 'none';
    playing = false;
  }

  function appendLog(html) {
    if (log.querySelector('.exec-log-empty')) log.innerHTML = '';
    var line = document.createElement('div');
    line.style.marginBottom = '10px';
    line.innerHTML = html;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function schedule(fn, delay) {
    timers.push(setTimeout(fn, delay));
  }

  function play() {
    if (playing) return;
    reset();
    playing = true;

    var delay = 0;
    var STEP_GAP = 1500;

    steps.forEach(function (step, i) {
      schedule(function () {
        setState('nodeReasoning', 'active');
        setState(step.edge, 'active');
      }, delay);
      delay += 500;

      schedule(function () {
        setState(step.node, 'active');
        appendLog('<span class="exec-log-tool">&gt;&gt; ' + step.tool + '(' + step.args + ')</span>');
      }, delay);
      delay += 700;

      schedule(function () {
        appendLog(step.result.replace(/\n/g, '<br>'));
        setState(step.node, 'done');
        setState(step.edge, 'done');
        setState('nodeReasoning', i === steps.length - 1 ? 'active' : null);
      }, delay);
      delay += STEP_GAP;
    });

    schedule(function () {
      setState('nodeReasoning', 'done');
      setState('edgeApproval', 'active');
    }, delay);
    delay += 600;

    schedule(function () {
      setState('nodeApproval', 'active');
      appendLog('<span class="exec-log-tool">&gt;&gt; Reasoning complete — routing to human approval</span>');
      recCard.style.display = 'flex';
      playing = false;
    }, delay);
  }

  playBtn.addEventListener('click', play);
  resetBtn.addEventListener('click', reset);
}
