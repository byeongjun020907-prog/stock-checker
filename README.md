# stock-checker
stock-checker
/* ===========================================
   통합 재고 북마크 스크립트 (stock.js)
   - 롯데ON/롯데백화점(Vue)
   - 롯데IMALL
   - SSG
   - SSF
   - GrandStage(a-rt)
   디버깅 / 단계별 로그 포함
=========================================== */

(function () {
  // ===== 공통 디버깅 유틸 =====
  var DEBUG = true;
  var lastStep = '초기화 전';
  var currentSite = location.hostname;

  function logStep(step) {
    lastStep = step;
    if (DEBUG && window.console) {
      console.log('[재고스크립트]', step);
    }
  }

  function fail(message) {
    var msg =
      '❌ 재고 파싱 실패\n' +
      '- 호스트: ' + currentSite + '\n' +
      '- 마지막 단계: ' + lastStep + '\n' +
      '- 상세: ' + message;
    alert(msg);
  }

  // ===== 공통 UI (네가 준 롯백 UI 기반) =====
  function showUI(groups, sourceLabel) {
    if (!groups || !groups.length) {
      fail('옵션 그룹이 비어 있음');
      return;
    }

    // 배경 오버레이
    var o = document.createElement('div');
    o.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999998;backdrop-filter:blur(4px);';

    // 메인 카드
    var m = document.createElement('div');
    m.style.cssText =
      'position:fixed;top:20px;right:20px;background:white;padding:22px;border-radius:16px;' +
      'box-shadow:0 10px 40px rgba(0,0,0,0.35);z-index:999999;max-width:420px;max-height:85vh;' +
      'overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

    document.body.appendChild(o);
    document.body.appendChild(m);

    var h = '';
    h +=
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;' +
      'padding-bottom:16px;border-bottom:2px solid #e5e7eb;">' +
      '<div style="display:flex;flex-direction:column;gap:2px;">' +
      '<h3 style="margin:0;font-size:20px;color:#111;font-weight:700;display:flex;align-items:center;gap:8px;">' +
      '<span>📊</span>실재고 현황</h3>';

    if (sourceLabel) {
      h +=
        '<span style="font-size:11px;color:#6b7280;">' +
        sourceLabel +
        '</span>';
    }

    h +=
      '</div>' +
      '<button onclick="this.closest(\'div[style*=&quot;position:fixed&quot;]\').remove();' +
      'document.querySelectorAll(\'div[style*=&quot;background:rgba(0,0,0,0.6)&quot;]\')[0].remove();" ' +
      'style="background:#ef4444;color:white;border:none;padding:8px 15px;border-radius:8px;' +
      'cursor:pointer;font-size:13px;font-weight:600;">✕</button></div>';

    var totalQty = 0;
    var optCount = 0;

    // 그룹별 옵션 출력
    for (var gi = 0; gi < groups.length; gi++) {
      var g = groups[gi];
      h += '<div style="margin-bottom:14px;">';
      h +=
        '<div style="font-weight:600;color:#667eea;margin-bottom:12px;font-size:15px;' +
        'display:flex;align-items:center;gap:6px;">' +
        '<span style="font-size:18px;">👕</span>' +
        (g.title || '옵션') +
        '</div>';

      if (g.options && g.options.length > 0) {
        for (var oi = 0; oi < g.options.length; oi++) {
          var item = g.options[oi];
          var qty = item.qty * 1 || 0;
          var isZero = qty === 0;
          var bgGrad = isZero
            ? 'linear-gradient(135deg,#fee2e2 0%,#fecaca 100%)'
            : 'linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)';
          var borderColor = isZero ? '#fca5a5' : '#6ee7b7';
          var textColor = isZero ? '#991b1b' : '#065f46';
          var qtyColor = isZero ? '#dc2626' : '#059669';
          var icon = isZero ? '❌' : '✅';

          optCount++;
          totalQty += qty;

          h +=
            '<div style="display:flex;justify-content:space-between;align-items:center;' +
            'padding:12px 16px;background:' +
            bgGrad +
            ';border-radius:10px;margin-bottom:7px;border:2px solid ' +
            borderColor +
            ';">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:16px;">' +
            icon +
            '</span>' +
            '<span style="font-size:14px;color:#1f2937;font-weight:600;">' +
            (item.label || '-') +
            '</span></div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:18px;font-weight:800;color:' +
            qtyColor +
            ';">' +
            qty +
            '</span>' +
            '<span style="font-size:12px;color:' +
            textColor +
            ';font-weight:600;">개</span></div>' +
            '</div>';
        }
      }

      h += '</div>';
    }

    // 전체 통계
    if (optCount > 0) {
      h +=
        '<div style="margin-top:20px;padding:16px;background:linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%);' +
        'border-radius:12px;border-left:5px solid #3b82f6;">' +
        '<div style="font-size:14px;color:#1e3a8a;margin-bottom:8px;font-weight:700;">📈 전체 통계</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-size:13px;color:#1e40af;">총 재고</span>' +
        '<span style="font-size:22px;font-weight:800;color:#1d4ed8;">' +
        totalQty +
        '<span style="font-size:14px;margin-left:4px;">개</span></span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">' +
        '<span style="font-size:13px;color:#1e40af;">옵션 수</span>' +
        '<span style="font-size:16px;font-weight:700;color:#2563eb;">' +
        optCount +
        '개</span>' +
        '</div>' +
        '</div>';
    }

    m.innerHTML = h;

    // 배경 클릭으로도 닫기
    o.onclick = function () {
      m.remove();
      o.remove();
    };
  }

  // ===== 사이트별 파서 =====

  // 1) 롯데ON / 롯데백화점 (Vue 스토어 기반)
  function parseLotteOnVue() {
    logStep('롯데ON/롯백: Vue 스토어 탐색 시작');
    var d = null;
    var nodes = document.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var e = nodes[i];
      if (d) break;
      try {
        if (
          e.__vue__ &&
          e.__vue__.$store &&
          e.__vue__.$store.state &&
          e.__vue__.$store.state.product
        ) {
          d = e.__vue__.$store.state.product;
        }
      } catch (err) {}
    }

    if (!d || !d.optionInfo) {
      logStep('롯데ON/롯백: optionInfo 없음');
      return null;
    }

    logStep('롯데ON/롯백: optionInfo 파싱 시작');
    var info = d.optionInfo;
    var groups = [];

    if (info.optionList && info.optionList.length > 0) {
      for (var j = 0; j < info.optionList.length; j++) {
        var opt = info.optionList[j];
        var g = {
          title: opt.title || opt.name || '옵션',
          options: []
        };

        if (opt.options && opt.options.length > 0) {
          for (var k = 0; k < opt.options.length; k++) {
            var item = opt.options[k];
            var stockData = null;
            var qty = 0;
            if (info.optionMappingInfo && info.optionMappingInfo[item.value]) {
              stockData = info.optionMappingInfo[item.value];
              qty =
                stockData.stkQty ||
                stockData.remainQty ||
                stockData.stockQty ||
                0;
            }
            g.options.push({
              label: item.label || item.name || item.value,
              qty: qty
            });
          }
        }
        groups.push(g);
      }
    }

    if (!groups.length) {
      logStep('롯데ON/롯백: groups 비어 있음');
      return null;
    }

    return { groups: groups, source: '롯데ON / 롯데백화점(Vue)' };
  }

  // 2) 롯데IMALL (lotteiMall)
  function parseLotteImall() {
    logStep('롯데IMALL: 파싱 시작');
    var groups = [];
    var opts = document.querySelectorAll(
      'option[data-stock], option[data-qty], option[data-stock-qty]'
    );

    if (opts.length) {
      var g = { title: '옵션', options: [] };
      for (var i = 0; i < opts.length; i++) {
        var o = opts[i];
        var label = (o.innerText || o.textContent || '').trim();
        if (!label) continue;
        var raw =
          o.getAttribute('data-stock') ||
          o.getAttribute('data-qty') ||
          o.getAttribute('data-stock-qty') ||
          '';
        var qty = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        if (isNaN(qty)) qty = 0;
        g.options.push({ label: label, qty: qty });
      }
      if (g.options.length) {
        groups.push(g);
      }
    }

    if (!groups.length) {
      logStep('롯데IMALL: data-* 기반 옵션 없음');
      return null;
    }
    return { groups: groups, source: '롯데IMALL(추정)' };
  }

  // 3) SSG
  function parseSSG() {
    logStep('SSG: 파싱 시작');
    var groups = [];
    var items = document.querySelectorAll(
      '[data-ob-stock-qty],[data-stock-qty],[data-qty],[data-stock]'
    );

    if (items.length) {
      var g = { title: '옵션', options: [] };
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var label = (el.innerText || el.textContent || '').trim();
        if (!label) continue;
        var raw =
          el.getAttribute('data-ob-stock-qty') ||
          el.getAttribute('data-stock-qty') ||
          el.getAttribute('data-qty') ||
          el.getAttribute('data-stock') ||
          '';
        var qty = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        if (isNaN(qty)) qty = 0;
        g.options.push({ label: label, qty: qty });
      }
      if (g.options.length) {
        groups.push(g);
      }
    }

    if (!groups.length) {
      logStep('SSG: data-* 기반 옵션 없음');
      return null;
    }
    return { groups: groups, source: 'SSG' };
  }

  // 4) SSF SHOP
  function parseSSF() {
    logStep('SSF: 파싱 시작');
    var groups = [];
    var items = document.querySelectorAll(
      '[data-stockqty],[data-stock-qty],[data-qty],[data-stock]'
    );

    if (items.length) {
      var g = { title: '옵션', options: [] };
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var label = (el.innerText || el.textContent || '').trim();
        if (!label) continue;
        var raw =
          el.getAttribute('data-stockqty') ||
          el.getAttribute('data-stock-qty') ||
          el.getAttribute('data-qty') ||
          el.getAttribute('data-stock') ||
          '';
        var qty = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        if (isNaN(qty)) qty = 0;
        g.options.push({ label: label, qty: qty });
      }
      if (g.options.length) {
        groups.push(g);
      }
    }

    if (!groups.length) {
      logStep('SSF: data-* 기반 옵션 없음');
      return null;
    }
    return { groups: groups, source: 'SSF SHOP' };
  }

  // 5) GrandStage (a-rt)
  function parseGrandStage() {
    logStep('GrandStage: 파싱 시작');
    var groups = [];
    var items = document.querySelectorAll(
      '[data-stock],[data-qty],[data-remain-qty],[data-inventory]'
    );

    if (items.length) {
      var g = { title: '옵션', options: [] };
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var label = (el.innerText || el.textContent || '').trim();
        if (!label) continue;
        var raw =
          el.getAttribute('data-stock') ||
          el.getAttribute('data-qty') ||
          el.getAttribute('data-remain-qty') ||
          el.getAttribute('data-inventory') ||
          '';
        var qty = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        if (isNaN(qty)) qty = 0;
        g.options.push({ label: label, qty: qty });
      }
      if (g.options.length) {
        groups.push(g);
      }
    }

    if (!groups.length) {
      logStep('GrandStage: data-* 기반 옵션 없음');
      return null;
    }
    return { groups: groups, source: 'GrandStage(a-rt)' };
  }

  // ===== 라우팅 =====
  try {
    logStep('라우팅 시작: ' + currentSite);
    var result = null;

    if (currentSite.indexOf('lotteon.com') > -1) {
      result = parseLotteOnVue();
    } else if (currentSite.indexOf('lotteimall.com') > -1) {
      result = parseLotteImall();
    } else if (currentSite.indexOf('ssg.com') > -1) {
      result = parseSSG();
    } else if (currentSite.indexOf('ssfshop.com') > -1) {
      result = parseSSF();
    } else if (
      currentSite.indexOf('grandstage.a-rt.com') > -1 ||
      currentSite.indexOf('a-rt.com') > -1
    ) {
      result = parseGrandStage();
    } else {
      fail('지원하지 않는 호스트');
      return;
    }

    if (!result || !result.groups || !result.groups.length) {
      fail('파서 실행 완료했지만 groups가 비어 있음');
      return;
    }

    logStep('UI 렌더링');
    showUI(result.groups, result.source);
  } catch (err) {
    fail('예외 발생: ' + (err && err.message ? err.message : err));
  }
})();
