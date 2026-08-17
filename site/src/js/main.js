// 移动端菜单切换 + 站内搜索
function toggleMenu() {
  var nav = document.querySelector('.side-nav');
  if (nav) nav.classList.toggle('open');
}

// 侧边栏板块分组折叠/展开（仅当前所在板块默认展开）
window.toggleSideGroup = function (btn) {
  var group = btn.closest('.side-group');
  if (!group) return;
  var open = group.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
};

// 自动定位：将当前页/当前板块滚动到侧栏可视区域
(function () {
  var active = document.querySelector('.side-nav .side-link.active') ||
               document.querySelector('.side-nav .side-group-title.active');
  if (active) {
    try { active.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }
})();

// 站内搜索（基于构建期生成的 search-index.json）
(function () {
  var input = document.getElementById('search-input');
  var box = document.getElementById('search-results');
  if (!input || !box) return;
  var index = null;

  function loadIndex(cb) {
    if (index) return cb();
    fetch('assets/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { index = d; cb(); })
      .catch(function () { box.innerHTML = '<div class="sr-empty">搜索索引加载失败</div>'; box.classList.add('open'); });
  }

  function render(q) {
    q = q.trim().toLowerCase();
    if (!q) { box.classList.remove('open'); return; }
    var hits = index.filter(function (it) {
      return (it.t + ' ' + it.s + ' ' + it.x).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 10);
    if (!hits.length) {
      box.innerHTML = '<div class="sr-empty">未找到与“' + q + '”相关的内容</div>';
      box.classList.add('open');
      return;
    }
    box.innerHTML = hits.map(function (it) {
      var snip = it.x.length > 70 ? it.x.slice(0, 70) + '…' : it.x;
      return '<a href="' + it.u + '"><div class="sr-title">' + it.t + '</div>' +
        '<div class="sr-section">' + it.s + '</div>' +
        '<div class="sr-snippet">' + snip + '</div></a>';
    }).join('');
    box.classList.add('open');
  }

  input.addEventListener('input', function () { loadIndex(function () { render(input.value); }); });
  input.addEventListener('focus', function () { if (input.value) loadIndex(function () { render(input.value); }); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search')) box.classList.remove('open');
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { box.classList.remove('open'); input.blur(); }
  });
})();
