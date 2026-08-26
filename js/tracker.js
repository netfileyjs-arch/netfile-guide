// ── 서버측 방문/클릭 추적 (교차 사용자·실시간) ──
// 링크는 avpoombun.o-r.kr/gonf 로 직접 연결(서버에서 PC/모바일 자동 분기).
// 클릭 수는 sendBeacon으로 https://sport.p-e.kr/nfg/click 에 집계만 남긴다.
//   방문:  https://sport.p-e.kr/nfg/pv    관리자: https://sport.p-e.kr/nfg/admin
(function () {
  var GONF = 'https://avpoombun.o-r.kr/gonf';
  var API  = 'https://sport.p-e.kr/nfg';

  window.NETFILE_URL = GONF;
  try { new Image().src = API + '/pv?t=' + Date.now(); } catch (e) {}

  function hit() {
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(API + '/click');
      else new Image().src = API + '/click?t=' + Date.now();
    } catch (e) {}
  }
  function wire() {
    document.querySelectorAll('.netfile-link').forEach(function (el) {
      el.setAttribute('href', GONF);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener nofollow sponsored');
      el.addEventListener('click', hit);
    });
  }
  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();

// ── 스크롤 깊이 측정 (세션당 마일스톤 1회) ──
(function(){
  var sent={};
  function onScroll(){
    var pct=(window.scrollY+window.innerHeight)/document.body.scrollHeight*100;
    [25,50,75,100].forEach(function(m){
      if(pct>=m && !sent[m] && !sessionStorage.getItem('nf_s'+m)){
        sent[m]=1; sessionStorage.setItem('nf_s'+m,'1');
        try{ new Image().src='https://sport.p-e.kr/nfg/scroll?p='+m+'&t='+Date.now(); }catch(e){}
      }
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
})();
