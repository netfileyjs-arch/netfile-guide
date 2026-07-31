// 공용 프로모: 이탈방지 팝업 + 함께 보면 좋은 글 (서브페이지용)
// index.html은 자체 모달을 쓰므로 #exitModal이 없을 때만 주입.
(function () {
  function openNetfile() { window.open(window.NETFILE_URL || 'https://www.netfile.co.kr', '_blank', 'noopener'); }

  // ── 이탈방지 팝업 ──
  if (!document.getElementById('exitModal')) {
    var m = document.createElement('div');
    m.className = 'exit-modal'; m.id = 'exitModal';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-hidden', 'true');
    m.innerHTML =
      '<div class="exit-box"><button class="exit-close" aria-label="닫기">×</button>' +
      '<div class="exit-gift">🎁</div><h3>잠깐! <em>2,000코인</em>은 받고 가세요</h3>' +
      '<p>지금 이 링크로 가입하면 <strong>제휴결제 가능한 2,000코인</strong>을 즉시 드립니다.<br>코인 1개당 20MB — 일반 웹하드의 2배 용량으로 바로 시작하세요.</p>' +
      '<a href="#" class="btn-cta nf-go">🎁 2,000코인 받고 무료가입</a>' +
      '<p class="exit-note">신규 가입 한정 · 가입은 무료입니다</p></div>';
    document.body.appendChild(m);
    var shown = false;
    function open() { if (shown || sessionStorage.getItem('nf_exit')) return; shown = true; sessionStorage.setItem('nf_exit', '1'); m.classList.add('show'); m.setAttribute('aria-hidden', 'false'); }
    function close() { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); }
    m.querySelector('.exit-close').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    m.querySelector('.nf-go').addEventListener('click', function (e) { e.preventDefault(); openNetfile(); });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) open(); });
    window.addEventListener('scroll', function () { if ((window.scrollY + window.innerHeight) / document.body.scrollHeight > 0.7) open(); }, { passive: true });
  }

  // ── 함께 보면 좋은 글 ──
  var ALL = {
    'webhard.html': '웹하드란? 파일공유 완전정리',
    'compare.html': '웹하드 순위 비교',
    'guide.html': '웹하드 사용법',
    'coin.html': '요금제·코인 정리',
    'trouble.html': '오류 해결 모음',
    'faq.html': '자주 묻는 질문',
    'free-download.html': '무료 다운로드, 안전할까?'
  };
  var here = location.pathname.split('/').pop() || '';
  var footer = document.querySelector('.site-footer');
  if (footer && !document.querySelector('.related')) {
    var keys = Object.keys(ALL).filter(function (k) { return k !== here; }).slice(0, 3);
    var cards = keys.map(function (k) { return '<a class="rel-card" href="' + k + '"><span>📄</span>' + ALL[k] + ' <b>→</b></a>'; }).join('');
    var sec = document.createElement('section');
    sec.className = 'related';
    sec.innerHTML = '<div class="inner"><h2 class="section-title">함께 보면 좋은 글</h2><div class="rel-grid">' + cards + '</div></div>';
    footer.parentNode.insertBefore(sec, footer);
  }
})();
