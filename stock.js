(function() {
  'use strict';
  
  console.log('[STOCK CHECKER] START - v1.0');
  console.log('[STOCK CHECKER] Current URL:', window.location.href);
  
  // 기존 UI 제거
  const existingUI = document.getElementById('stock-checker-ui');
  if (existingUI) {
    existingUI.remove();
  }
  
  // 사이트별 재고 파서
  const parsers = {
    // 롯데ON & 롯데백화점 (Vue 스토어)
    lotteon: function() {
      console.log('[LOTTEON/롯백] 파싱 시작');
      try {
        const vueElements = document.querySelectorAll('[data-v-app]');
        for (let el of vueElements) {
          if (el.__vue__ && el.__vue__.$store) {
            const store = el.__vue__.$store.state;
            if (store.product && store.product.optionInfo) {
              const info = store.product.optionInfo;
              console.log('[LOTTEON/롯백] Vue Store 발견:', info);
              
              let items = [];
              
              // optionList 방식
              if (info.optionList && Array.isArray(info.optionList)) {
                items = info.optionList.map(opt => ({
                  name: opt.optionNm || opt.optionName || '옵션',
                  stock: opt.stkQty || opt.stockQty || opt.remainQty || 0
                }));
              }
              
              // optionMappingInfo 방식
              if (items.length === 0 && info.optionMappingInfo) {
                for (let key in info.optionMappingInfo) {
                  const opt = info.optionMappingInfo[key];
                  items.push({
                    name: opt.optionNm || opt.optionName || key,
                    stock: opt.stkQty || opt.stockQty || opt.remainQty || 0
                  });
                }
              }
              
              if (items.length > 0) {
                console.log('[LOTTEON/롯백] 파싱 완료:', items);
                return items;
              }
            }
          }
        }
      } catch (e) {
        console.error('[LOTTEON/롯백] 파싱 오류:', e);
      }
      return null;
    },
    
    // 롯데IMALL
    lotteimall: function() {
      console.log('[LOTTEIMALL] 파싱 시작');
      try {
        const options = document.querySelectorAll('option[data-stock], option[data-qty], option[data-stock-qty]');
        if (options.length === 0) return null;
        
        const items = Array.from(options).map(opt => {
          const stock = opt.dataset.stock || opt.dataset.qty || opt.dataset.stockQty || '0';
          return {
            name: opt.textContent.trim(),
            stock: parseInt(stock) || 0
          };
        }).filter(item => item.name && item.name !== '선택');
        
        console.log('[LOTTEIMALL] 파싱 완료:', items);
        return items.length > 0 ? items : null;
      } catch (e) {
        console.error('[LOTTEIMALL] 파싱 오류:', e);
      }
      return null;
    },
    
    // SSG
    ssg: function() {
      console.log('[SSG] 파싱 시작');
      try {
        // 다양한 셀렉터 시도
        const selectors = [
          '[data-ob-stock-qty]',
          '[data-stock-qty]',
          '[data-qty]',
          'option[data-stock]'
        ];
        
        for (let selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const items = Array.from(elements).map(el => {
              const stock = el.dataset.obStockQty || el.dataset.stockQty || el.dataset.qty || el.dataset.stock || '0';
              const name = el.textContent.trim() || el.dataset.optionNm || '옵션';
              return {
                name: name,
                stock: parseInt(stock) || 0
              };
            }).filter(item => item.name && item.name !== '선택' && item.name !== '');
            
            if (items.length > 0) {
              console.log('[SSG] 파싱 완료:', items);
              return items;
            }
          }
        }
      } catch (e) {
        console.error('[SSG] 파싱 오류:', e);
      }
      return null;
    },
    
    // SSF Shop
    ssfshop: function() {
      console.log('[SSFSHOP] 파싱 시작');
      try {
        const selectors = [
          '[data-stockqty]',
          '[data-stock-qty]',
          'option[data-stock]'
        ];
        
        for (let selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const items = Array.from(elements).map(el => {
              const stock = el.dataset.stockqty || el.dataset.stockQty || el.dataset.stock || '0';
              const name = el.textContent.trim() || '옵션';
              return {
                name: name,
                stock: parseInt(stock) || 0
              };
            }).filter(item => item.name && item.name !== '선택');
            
            if (items.length > 0) {
              console.log('[SSFSHOP] 파싱 완료:', items);
              return items;
            }
          }
        }
      } catch (e) {
        console.error('[SSFSHOP] 파싱 오류:', e);
      }
      return null;
    },
    
    // GrandStage
    grandstage: function() {
      console.log('[GRANDSTAGE] 파싱 시작');
      try {
        const selectors = [
          '[data-stock]',
          '[data-qty]',
          '[data-remain-qty]',
          'option[data-stock]'
        ];
        
        for (let selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const items = Array.from(elements).map(el => {
              const stock = el.dataset.stock || el.dataset.qty || el.dataset.remainQty || '0';
              const name = el.textContent.trim() || '옵션';
              return {
                name: name,
                stock: parseInt(stock) || 0
              };
            }).filter(item => item.name && item.name !== '선택');
            
            if (items.length > 0) {
              console.log('[GRANDSTAGE] 파싱 완료:', items);
              return items;
            }
          }
        }
      } catch (e) {
        console.error('[GRANDSTAGE] 파싱 오류:', e);
      }
      return null;
    }
  };
  
  // 사이트 감지 및 파서 실행
  function detectAndParse() {
    const hostname = window.location.hostname;
    console.log('[STOCK CHECKER] 호스트명:', hostname);
    
    let result = null;
    
    if (hostname.includes('lotteon.com')) {
      result = parsers.lotteon();
    } else if (hostname.includes('lotteimall.com')) {
      result = parsers.lotteimall();
    } else if (hostname.includes('ssg.com')) {
      result = parsers.ssg();
    } else if (hostname.includes('ssfshop.com')) {
      result = parsers.ssfshop();
    } else if (hostname.includes('a-rt.com')) {
      result = parsers.grandstage();
    }
    
    return result;
  }
  
  // UI 렌더링
  function renderUI(items) {
    if (!items || items.length === 0) {
      alert('❌ 이 사이트는 아직 자동 파싱을 지원하지 않습니다.\n\n현재 지원 사이트:\n- 롯데ON\n- 롯데백화점\n- 롯데IMALL\n- SSG\n- SSFShop\n- GrandStage');
      return;
    }
    
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const optionCount = items.length;
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'stock-checker-ui';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
      padding: 20px;
    `;
    
    // Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    `;
    header.innerHTML = `
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111;">📦 재고 조회 결과</h2>
      <button id="stock-checker-close" style="
        background: #f3f4f6;
        border: none;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 18px;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
      ">✕</button>
    `;
    
    // Summary
    const summary = document.createElement('div');
    summary.style.cssText = `
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #374151;
    `;
    summary.innerHTML = `
      <div style="margin-bottom: 4px;"><strong>총 재고:</strong> ${totalStock.toLocaleString()}개</div>
      <div><strong>옵션 수:</strong> ${optionCount}개</div>
    `;
    
    // Items
    const list = document.createElement('div');
    list.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    
    items.forEach(item => {
      const hasStock = item.stock > 0;
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = `
        padding: 12px;
        border-radius: 8px;
        background: ${hasStock ? '#f0fdf4' : '#fef2f2'};
        border: 1px solid ${hasStock ? '#86efac' : '#fca5a5'};
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      
      itemDiv.innerHTML = `
        <span style="font-size: 14px; color: #111; flex: 1;">${item.name}</span>
        <span style="
          font-weight: 700;
          font-size: 16px;
          color: ${hasStock ? '#16a34a' : '#dc2626'};
        ">${item.stock.toLocaleString()}개</span>
      `;
      
      list.appendChild(itemDiv);
    });
    
    // Assemble
    modal.appendChild(header);
    modal.appendChild(summary);
    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close handlers
    document.getElementById('stock-checker-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    
    console.log('[STOCK CHECKER] UI 렌더링 완료');
  }
  
  // 실행
  const stockData = detectAndParse();
  renderUI(stockData);
  
})();
