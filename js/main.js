// ── FAQ 아코디언 ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // 같은 목록 내 다른 항목 닫기
    btn.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── 스크롤 진입 페이드인 ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.point-card, .guide-card, .step-item, .info-box, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── 통합 네비 드롭다운(모바일 탭 대응) ──
document.querySelectorAll('.navtop').forEach(function (b) {
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var g = b.closest('.navgrp'), was = g.classList.contains('open');
    document.querySelectorAll('.navgrp').forEach(function (x) { x.classList.remove('open'); });
    if (!was) g.classList.add('open');
  });
});
document.addEventListener('click', function () {
  document.querySelectorAll('.navgrp').forEach(function (x) { x.classList.remove('open'); });
});

// ── 라이트/다크 모드 토글 ──
(function () {
  var b = document.getElementById('themeBtn');
  if (!b) return;
  function icon() { b.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'; }
  icon();
  b.addEventListener('click', function () {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    if (light) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem('nf_theme', light ? 'dark' : 'light'); } catch (e) {}
    icon();
  });
})();

// ── 경쟁 웹하드 혜택 자동 최신화 (서버가 주 1회 수집) ──
(function () {
  var grid = document.querySelector('.rk-grid');
  if (!grid) return;
  var OK = /포인트|코인|쿠폰|무제한|무료|가입|출석|정액|\d+\s*원/;
  fetch('https://sport.p-e.kr/nfg/webhards')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var map = {};
      (d.sites || []).forEach(function (s) { map[s.name] = s; });
      grid.querySelectorAll('.rk-card:not(.rk-top)').forEach(function (card) {
        var name = (card.querySelector('h3') || {}).textContent;
        var s = name && map[name.trim()];
        if (!s) return;
        var good = (s.benefits || []).filter(function (b) { return OK.test(b) && b.length <= 46; });
        if (!good.length) return;             // 품질 미달이면 큐레이션 문구 유지
        var lis = card.querySelectorAll('.rk-spec li:not(.rk-meta)');
        good.slice(0, lis.length).forEach(function (txt, i) {
          var b = lis[i].querySelector('b'), sp = lis[i].querySelector('span');
          if (b) b.textContent = txt;
          if (sp) sp.textContent = '사이트 안내 문구 · ' + (d.checked_kst || '자동 수집');
        });
        card.setAttribute('data-auto', '1');
      });
      var note = document.querySelector('.ranking .table-note');
      if (note && d.checked_kst) note.innerHTML =
        '※ 각 서비스 혜택은 해당 사이트에 공개된 안내 문구를 <b>주 1회 자동 수집</b>해 반영합니다(최근 갱신 ' +
        d.checked_kst + '). 정책은 수시로 변경될 수 있으며, 로고는 각 사의 상표로 비교 목적에만 사용했습니다.';
    })
    .catch(function () {});
})();
