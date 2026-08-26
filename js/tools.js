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

// ── 자막 인코딩 변환기 (브라우저 내 처리, 업로드 없음) ──
(function () {
  var fi = document.getElementById('subFile');
  if (!fi) return;
  var info = document.getElementById('subInfo'), opts = document.getElementById('subOpts');
  var out = document.getElementById('subOut'), toSrt = document.getElementById('subToSrt');
  var text = '', name = '', wasSmi = false, enc = '';

  function decode(buf) {
    try { return { t: new TextDecoder('utf-8', { fatal: true }).decode(buf), e: 'UTF-8' }; }
    catch (e) {
      try { return { t: new TextDecoder('euc-kr').decode(buf), e: 'CP949(EUC-KR)' }; }
      catch (e2) { return { t: new TextDecoder('utf-8').decode(buf), e: '알 수 없음' }; }
    }
  }
  function ms2srt(ms) {
    var h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000),
        s = Math.floor(ms % 60000 / 1000), z = Math.floor(ms % 1000);
    function p(n, l) { return String(n).padStart(l || 2, '0'); }
    return p(h) + ':' + p(m) + ':' + p(s) + ',' + p(z, 3);
  }
  function smi2srt(src) {
    var re = /<SYNC\s+Start\s*=\s*"?(\d+)"?[^>]*>([\s\S]*?)(?=<SYNC\s+Start|$)/gi, m, cues = [];
    while ((m = re.exec(src)) !== null) {
      var body = m[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
                     .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim();
      cues.push({ t: parseInt(m[1], 10), x: body });
    }
    var o = [], n = 1;
    for (var i = 0; i < cues.length; i++) {
      if (!cues[i].x) continue;
      var end = i + 1 < cues.length ? cues[i + 1].t : cues[i].t + 3000;
      o.push(n++ + '\n' + ms2srt(cues[i].t) + ' --> ' + ms2srt(end) + '\n' + cues[i].x + '\n');
    }
    return o.join('\n');
  }
  fi.addEventListener('change', function () {
    var f = fi.files && fi.files[0];
    if (!f) return;
    name = f.name;
    var fr = new FileReader();
    fr.onload = function () {
      var d = decode(fr.result);
      text = d.t; enc = d.e;
      wasSmi = /\.smi$|\.sami$/i.test(name) || /<SYNC/i.test(text.slice(0, 4000));
      toSrt.checked = wasSmi;
      info.innerHTML = '<b style="color:var(--text)">' + name + '</b> · 감지된 인코딩: <b style="color:var(--accent)">' +
        enc + '</b>' + (wasSmi ? ' · SMI 형식' : '');
      opts.style.display = 'block';
    };
    fr.readAsArrayBuffer(f);
  });
  document.getElementById('subPrev').addEventListener('click', function () {
    var t = (toSrt.checked && wasSmi) ? smi2srt(text) : text;
    out.textContent = t.slice(0, 3000) + (t.length > 3000 ? '\n…(생략)' : '');
    out.style.display = 'block';
  });
  document.getElementById('subGo').addEventListener('click', function () {
    var t = (toSrt.checked && wasSmi) ? smi2srt(text) : text;
    var nn = name.replace(/\.[^.]+$/, '') + ((toSrt.checked && wasSmi) ? '.srt' : name.match(/\.[^.]+$/) || '.srt');
    var blob = new Blob(['﻿' + t], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nn;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();

// ── 계산기 결과 공유 링크 (URL 파라미터 저장/복원) ──
(function () {
  var MAP = { 'vMin': 'min', 'vRes': 'res', 'vCod': 'cod', 'tSize': 'size', 'tUnit': 'unit',
              'tSpeed': 'speed', 'sCnt': 'cnt', 'sMin': 'smin', 'sRes': 'sres', 'sCod': 'scod',
              'cBefore': 'before', 'cAfter': 'after' };
  var ids = Object.keys(MAP).filter(function (i) { return document.getElementById(i); });
  if (!ids.length) return;
  var q = new URLSearchParams(location.search), changed = false;
  ids.forEach(function (i) {
    var v = q.get(MAP[i]);
    if (v !== null) { document.getElementById(i).value = v; changed = true; }
  });
  if (changed) ids.forEach(function (i) {
    var el = document.getElementById(i);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
  var box = document.querySelector('.calc-box');
  if (!box) return;
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'share-btn'; btn.textContent = '🔗 이 결과 링크 복사';
  btn.addEventListener('click', function () {
    var p = new URLSearchParams();
    ids.forEach(function (i) { p.set(MAP[i], document.getElementById(i).value); });
    var url = location.origin + location.pathname + '?' + p.toString();
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
      btn.textContent = '✅ 링크가 복사되었습니다';
      setTimeout(function () { btn.textContent = '🔗 이 결과 링크 복사'; }, 2000);
    }).catch(function () { prompt('이 링크를 복사하세요', url); });
  });
  box.appendChild(btn);
})();

// ── 계산 결과 이미지로 저장 (커뮤니티 공유용) ──
(function () {
  var box = document.querySelector('.calc-box');
  if (!box || !document.querySelector('.calc-result')) return;

  function draw() {
    var W = 1000, H = 560, c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    // 배경
    var grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0d1117'); grad.addColorStop(1, '#1b2440');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ff6b2b'; g.fillRect(0, 0, W, 6);
    // 제목
    var title = (document.querySelector('.page-hero h1') || {}).textContent || '계산 결과';
    g.fillStyle = '#fff'; g.font = 'bold 40px Pretendard, Malgun Gothic, sans-serif';
    g.fillText(title.trim(), 56, 92);
    // 입력 요약
    var inputs = [];
    box.querySelectorAll('.calc-input label').forEach(function (l) {
      var f = l.getAttribute('for'), el = f && document.getElementById(f);
      if (!el) return;
      var v = el.tagName === 'SELECT' ? el.options[el.selectedIndex].textContent : el.value;
      var sib = el.parentElement.querySelector('select');
      if (el.tagName === 'INPUT' && sib && sib !== el) v += ' ' + sib.options[sib.selectedIndex].textContent;
      inputs.push(l.textContent.replace(/\s+/g, ' ').trim() + ': ' + v);
    });
    g.fillStyle = '#8b98a5'; g.font = '22px Pretendard, Malgun Gothic, sans-serif';
    g.fillText(inputs.slice(0, 3).join('   ·   '), 56, 132);
    // 결과 카드
    var cards = [].slice.call(document.querySelectorAll('.calc-result .calc-card')).slice(0, 3);
    var cw = (W - 112 - (cards.length - 1) * 20) / cards.length, x = 56;
    cards.forEach(function (card) {
      var isNet = card.classList.contains('net');
      g.fillStyle = isNet ? 'rgba(255,107,43,.14)' : 'rgba(255,255,255,.06)';
      if (g.roundRect) { g.beginPath(); g.roundRect(x, 176, cw, 190, 16); g.fill(); }
      else g.fillRect(x, 176, cw, 190);
      if (isNet) { g.strokeStyle = '#ff6b2b'; g.lineWidth = 2;
        if (g.roundRect) { g.beginPath(); g.roundRect(x, 176, cw, 190, 16); g.stroke(); } }
      var name = (card.querySelector('.calc-name') || {}).textContent || '';
      var val = (card.querySelector('strong') || {}).textContent || '';
      var unit = (card.querySelector('.calc-unit') || {}).textContent || '';
      g.fillStyle = '#8b98a5'; g.font = '19px Pretendard, Malgun Gothic, sans-serif';
      g.fillText(name.replace(/\s+/g, ' ').trim().slice(0, 18), x + 22, 214);
      g.fillStyle = isNet ? '#ff6b2b' : '#e6edf3';
      g.font = 'bold 46px Pretendard, Malgun Gothic, sans-serif';
      g.fillText(val + unit, x + 22, 292);
      x += cw + 20;
    });
    // 하단 문구
    var save = document.querySelector('.calc-save');
    if (save) {
      g.fillStyle = '#e6edf3'; g.font = 'bold 26px Pretendard, Malgun Gothic, sans-serif';
      g.fillText(save.textContent.replace(/\s+/g, ' ').trim().slice(0, 42), 56, 424);
    }
    g.fillStyle = '#8b98a5'; g.font = '20px Pretendard, Malgun Gothic, sans-serif';
    g.fillText('netfile.p-e.kr/tools · 무료 온라인 계산기', 56, 496);
    return c;
  }

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'share-btn'; btn.textContent = '🖼️ 결과 이미지로 저장';
  btn.addEventListener('click', function () {
    try {
      var c = draw();
      c.toBlob(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'calc-result.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      btn.textContent = '✅ 이미지를 저장했습니다';
      setTimeout(function () { btn.textContent = '🖼️ 결과 이미지로 저장'; }, 2200);
    } catch (e) { btn.textContent = '⚠️ 저장 실패 (브라우저 미지원)'; }
  });
  box.appendChild(btn);
})();
