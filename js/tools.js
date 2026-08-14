// 영상·파일 도구 계산기 모음 (페이지에 있는 요소만 동작)
(function () {
  // 해상도×코덱 권장 비트레이트(Mbps)
  var BR = {
    '480p':  { h264: 2.5, hevc: 1.5, av1: 1.2 },
    '720p':  { h264: 5,   hevc: 3,   av1: 2.4 },
    '1080p': { h264: 8,   hevc: 5,   av1: 4 },
    '1440p': { h264: 16,  hevc: 10,  av1: 8 },
    '4k':    { h264: 35,  hevc: 20,  av1: 15 },
    '8k':    { h264: 100, hevc: 60,  av1: 45 }
  };
  function $(id) { return document.getElementById(id); }
  function gb(n) { return n >= 1 ? n.toFixed(n < 10 ? 2 : 1) + ' GB' : (n * 1024).toFixed(0) + ' MB'; }
  function hms(sec) {
    if (!isFinite(sec) || sec <= 0) return '-';
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60);
    return (h ? h + '시간 ' : '') + (h || m ? m + '분 ' : '') + s + '초';
  }

  // ① 영상 용량 계산기
  var vMin = $('vMin');
  if (vMin) {
    var calcV = function () {
      var min = parseFloat(vMin.value) || 0;
      var res = $('vRes').value, cod = $('vCod').value;
      var mbps = BR[res][cod];
      var sizeGB = mbps * 60 * min / 8 / 1024;
      $('vOut').textContent = gb(sizeGB);
      $('vBr').textContent = mbps + ' Mbps';
      var h264 = BR[res].h264 * 60 * min / 8 / 1024;
      $('vSave').textContent = cod === 'h264' ? '' : 'H.264 대비 약 ' + Math.round((1 - sizeGB / h264) * 100) + '% 절약';
      var box = $('vBig');
      if (box) box.style.display = sizeGB >= 4 ? 'block' : 'none';
    };
    [vMin, $('vRes'), $('vCod')].forEach(function (el) { el.addEventListener('input', calcV); el.addEventListener('change', calcV); });
    calcV();
  }

  // ② 전송 시간 계산기 (다운로드/업로드)
  var tSize = $('tSize');
  if (tSize) {
    var calcT = function () {
      var size = (parseFloat(tSize.value) || 0) * (parseFloat($('tUnit').value) || 1); // GB
      var mbps = parseFloat($('tSpeed').value) || 0;
      var eff = mbps * 0.8; // 실효 80%
      $('tIdeal').textContent = hms(size * 8 * 1024 / mbps);
      $('tReal').textContent = hms(size * 8 * 1024 / eff);
      $('tMbs').textContent = (mbps / 8).toFixed(1) + ' MB/s';
    };
    [tSize, $('tUnit'), $('tSpeed')].forEach(function (el) { el.addEventListener('input', calcT); el.addEventListener('change', calcT); });
    calcT();
  }

  // ③ 저장공간 계산기 (영상 편수 → 필요 용량)
  var sCnt = $('sCnt');
  if (sCnt) {
    var calcS = function () {
      var cnt = parseFloat(sCnt.value) || 0;
      var min = parseFloat($('sMin').value) || 0;
      var res = $('sRes').value, cod = $('sCod').value;
      var one = BR[res][cod] * 60 * min / 8 / 1024;
      var total = one * cnt;
      $('sOne').textContent = gb(one);
      $('sTotal').textContent = gb(total);
      $('sDisk').textContent = total <= 500 ? '500GB' : total <= 1024 ? '1TB' : total <= 2048 ? '2TB' : total <= 4096 ? '4TB' : Math.ceil(total / 1024) + 'TB';
    };
    [sCnt, $('sMin'), $('sRes'), $('sCod')].forEach(function (el) { el.addEventListener('input', calcS); el.addEventListener('change', calcS); });
    calcS();
  }

  // ④ 압축률 계산기
  var cBefore = $('cBefore');
  if (cBefore) {
    var calcC = function () {
      var a = parseFloat(cBefore.value) || 0, b = parseFloat($('cAfter').value) || 0;
      var rate = a > 0 ? (1 - b / a) * 100 : 0;
      $('cRate').textContent = (rate > 0 ? rate.toFixed(1) : '0') + '%';
      $('cSaved').textContent = gb(Math.max(a - b, 0));
      $('cRatio').textContent = b > 0 ? (a / b).toFixed(2) + ' : 1' : '-';
    };
    [cBefore, $('cAfter')].forEach(function (el) { el.addEventListener('input', calcC); });
    calcC();
  }
})();
