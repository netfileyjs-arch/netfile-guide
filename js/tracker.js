// ── 방문자 트래킹 스크립트 ──
(function() {
  const KEY        = 'wh_stats';
  const ADMIN_IP   = '123.98.190.115';  // 관리자 IP — 카운트 제외

  // 관리자 IP 여부 확인 (비동기, localStorage 캐시)
  async function isAdmin() {
    // 캐시된 IP 먼저 확인 (1시간 유효)
    const cached = localStorage.getItem('wh_my_ip');
    const cachedAt = parseInt(localStorage.getItem('wh_my_ip_at') || '0');
    if (cached && Date.now() - cachedAt < 3600000) {
      return cached === ADMIN_IP;
    }
    try {
      const res  = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      localStorage.setItem('wh_my_ip', data.ip);
      localStorage.setItem('wh_my_ip_at', Date.now().toString());
      return data.ip === ADMIN_IP;
    } catch(e) {
      return false; // IP 확인 실패 시 일반 방문자로 처리
    }
  }

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
    const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    if (tz.includes('Seoul') || lang.startsWith('ko')) return 'KR';
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

  async function track() {
    const admin = await isAdmin();
    if (admin) return; // ★ 관리자 IP는 카운트 제외

    const s     = getStats();
    const vid   = getVisitorId();
    const today = todayStr();

    if (!s.days[today]) s.days[today] = { visits: 0, users: 0, clicks: 0, vids: [] };
    const td = s.days[today];

    td.visits++;
    s.totalVisits++;

    const isNew = !td.vids.includes(vid);
    if (isNew) {
      td.vids.push(vid);
      td.users++;
      s.totalUsers++;
    }

    const country = getCountry();
    if (!s.countries[country]) s.countries[country] = 0;
    s.countries[country]++;

    const pageKey = getPageKey();
    if (!s.pages[pageKey]) s.pages[pageKey] = 0;
    s.pages[pageKey]++;

    const now     = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    s.log.push({
      time: today + ' ' + timeStr,
      country, page: pageKey,
      ref: document.referrer ? new URL(document.referrer).hostname : 'direct',
      isNew, clicked: false
    });
    if (s.log.length > 500) s.log = s.log.slice(-500);

    saveStats(s);
  }

  // 배너 클릭 트래킹 (관리자 제외)
  window.trackBannerClick = async function() {
    const admin = await isAdmin();
    if (admin) return;

    const s     = getStats();
    const today = todayStr();
    if (!s.days[today]) s.days[today] = { visits: 0, users: 0, clicks: 0, vids: [] };
    s.days[today].clicks++;
    s.totalClicks++;
    if (s.log.length > 0) s.log[s.log.length - 1].clicked = true;
    saveStats(s);
  };

  track();

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.netfile-link, .btn-cta, .btn-header-cta').forEach(function(el) {
      el.addEventListener('click', function() { window.trackBannerClick(); });
    });
  });
})();
