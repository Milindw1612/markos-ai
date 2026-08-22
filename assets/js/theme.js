(function () {
  var stored = localStorage.getItem('markos-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);

  window.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var current = document.documentElement.getAttribute('data-theme');
    btn.textContent = current === 'dark' ? '☀ Light' : '● Dark';
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        || (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('markos-theme', next);
      btn.textContent = next === 'dark' ? '☀ Light' : '● Dark';
    });
  });
})();
