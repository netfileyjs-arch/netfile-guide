// ── 방문자 트래킹 스크립트 ──
(function() {
  const KEY = 'wh_stats';

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getStats() {
    try { return JSON.parse(localStorage.getItem(KEY)) || newStats(); }
    catch(e) { return newStats(); }
  }

  function newStats() {
    return {
      days: {}, totalVisits: 0, totalUsers: 0, totalClicks: 0,
      pages: { '/': 0, '/pages/compare.html': 0, '/pages/guide.html': 0, '/pages/trouble.html': 0, '/pages/coin.html': 0 },
      countries: { KR: 0, US: 0, JP: 0, 기타: 0 },
      log: []
    };
  }

  function saveStats(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e) {}
  }

  function getVisitorId() {
    let id = localStorage.getItem('wh_vid');
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('wh_vid', id); }
    return id;
  }

  function getCountry() {
    // 언어/타임존 기반 간이 추정
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    if (tz.includes('Seoul') || tz.includes('Asia/Seoul') || lang.startsWith('ko')) return 'KR';
    if (tz.includes('Tokyo') || lang.startsWith('ja')) return 'JP';
    if (lang.startsWith('en')) return 'US';
    return '기타';
  }

  function getPageKey() {
    const p = location.pathname;
    if (p.includes('compare')) return '/pages/compare.html';
    if (p.includes('guide'))   return '/pages/guide.html';
    if (p.includes('trouble')) return '/pages/trouble.html';
    if (p.includes('coin'))    return '/pages/coin.html';
    return '/';
  }

  function track() {
    const s   = getStats();
    const vid = getVisitorId();
    const today = todayStr();

    // 오늘 날짜 초기화
    if (!s.days[today]) s.days[today] = { visits: 0, users: 0, clicks: 0, vids: [] };
    const td = s.days[today];

    // 방문 카운트
    td.visits++;
    s.totalVisits++;

    // 고유 사용자
    const isNew = !td.vids.includes(vid);
    if (isNew) {
      td.vids.push(vid);
      td.users++;
      s.totalUsers++;
    }

    // 국가
    const country = getCountry();
    if (!s.countries[country]) s.countries[country] = 0;
    s.countries[country]++;

    // 페이지
    const pageKey = getPageKey();
    if (!s.pages[pageKey]) s.pages[pageKey] = 0;
    s.pages[pageKey]++;

    // 로그 (최대 500개)
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    s.log.push({
      time: today + ' ' + timeStr,
      ip: '***.***.***',
      country: country,
      page: pageKey,
      ref: document.referrer ? new URL(document.referrer).hostname : 'direct',
      isNew: isNew,
      clicked: false
    });
    if (s.log.length > 500) s.log = s.log.slice(-500);

    saveStats(s);
  }

  // 배너 클릭 트래킹
  window.trackBannerClick = function() {
    const s = getStats();
    const today = todayStr();
    if (!s.days[today]) s.days[today] = { visits: 0, users: 0, clicks: 0, vids: [] };
    s.days[today].clicks++;
    s.totalClicks++;

    // 마지막 로그에 클릭 표시
    if (s.log.length > 0) {
      s.log[s.log.length - 1].clicked = true;
    }
    saveStats(s);
  };

  // 실행
  track();

  // 넷파일 버튼 클릭 감지
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.netfile-link, .btn-cta, .btn-header-cta').forEach(function(el) {
      el.addEventListener('click', function() {
        window.trackBannerClick();
      });
    });
  });
})();
