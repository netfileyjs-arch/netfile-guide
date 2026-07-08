// ── 서버측 방문/클릭 추적 (교차 사용자·실시간) ──
// 기존 localStorage 방식(본인 브라우저만 카운트)을 대체.
// 집계는 Oracle 서버(https://sport.p-e.kr)에 기록되고, 관리자 페이지에서 실시간 확인.
//   방문:  https://sport.p-e.kr/nfg/pv   (1x1 비콘)
//   클릭:  https://sport.p-e.kr/nfg       (302 → 넷파일 제휴, 모바일 자동 분기)
//   관리자: https://sport.p-e.kr/nfg/admin (admin / worldodds2026!)
(function () {
  var NFG = 'https://sport.p-e.kr/nfg';

  // goNetfile(인라인 스크립트)이 window.NETFILE_URL을 열므로 추적 URL로 지정
  window.NETFILE_URL = NFG;

  // 방문 집계 비콘 (HTTPS라 혼합콘텐츠 없음)
  try { new Image().src = NFG + '/pv?t=' + Date.now(); } catch (e) {}

  // 모든 넷파일 링크를 추적 리다이렉트로 연결 (JS 없이도 동작하도록 href 지정)
  function wire() {
    document.querySelectorAll('.netfile-link').forEach(function (el) {
      el.setAttribute('href', NFG);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }
  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();
