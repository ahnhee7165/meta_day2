(function(){
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;

  const progressFill = document.getElementById('progressFill');
  const tbChapter = document.getElementById('tbChapter');
  const tbCount = document.getElementById('tbCount');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnOverview = document.getElementById('btnOverview');
  const btnOverviewClose = document.getElementById('btnOverviewClose');
  const overview = document.getElementById('overview');
  const overviewGrid = document.getElementById('overviewGrid');
  const kbdHint = document.getElementById('kbdHint');

  function pad(n){ return String(n).padStart(2,'0'); }

  // 오버뷰 타일 생성
  slides.forEach((s, i) => {
    const color = s.getAttribute('data-color') || '#4C5FFF';
    const title = s.getAttribute('data-title') || ('슬라이드 ' + (i+1));
    const chapter = s.getAttribute('data-chapter') || '';
    const tile = document.createElement('div');
    tile.className = 'ov-tile';
    tile.innerHTML =
      '<div class="ov-idx">' + pad(i+1) + ' / ' + pad(total) + '</div>' +
      '<div class="ov-title"><span class="ov-dot" style="background:' + color + '"></span>' + title + '</div>';
    tile.addEventListener('click', () => { goTo(i); closeOverview(); });
    overviewGrid.appendChild(tile);
  });

  function render(){
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    const s = slides[current];
    const color = s.getAttribute('data-color') || '#4C5FFF';
    const chapter = s.getAttribute('data-chapter') || '';
    tbChapter.innerHTML = '<span class="dot" style="background:' + color + '"></span>' + chapter;
    tbCount.textContent = pad(current+1) + ' / ' + pad(total);
    progressFill.style.width = (((current+1)/total) * 100) + '%';
    prevBtn.toggleAttribute('disabled', current === 0);
    nextBtn.toggleAttribute('disabled', current === total-1);
    history.replaceState(null, '', '#s' + (current+1));
  }

  function goTo(i){
    current = Math.max(0, Math.min(total-1, i));
    render();
    clearCanvas();
    if (activeTool === 'zoom') refreshLensClone();
  }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  // 초기 진입 시 해시로 위치 복원
  const hashMatch = location.hash.match(/^#s(\d+)$/);
  if (hashMatch) current = Math.max(0, Math.min(total-1, parseInt(hashMatch[1],10)-1));
  render();

  // 버튼
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // 오버뷰
  function openOverview(){ overview.classList.add('show'); if (typeof setTool === 'function') setTool(null); }
  function closeOverview(){ overview.classList.remove('show'); }
  btnOverview.addEventListener('click', openOverview);
  btnOverviewClose.addEventListener('click', closeOverview);

  // 전체화면
  function toggleFullscreen(){
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(()=>{});
    } else {
      document.exitFullscreen().catch(()=>{});
    }
  }
  btnFullscreen.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    btnFullscreen.textContent = document.fullscreenElement ? '⤡' : '⤢';
  });

  // 키보드 네비게이션
  window.addEventListener('keydown', (e) => {
    // 열려있는 <details> 안의 텍스트 선택/입력 방해하지 않도록 폼 요소 포커스 시 무시
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (overview.classList.contains('show')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'g') { closeOverview(); e.preventDefault(); }
      return;
    }

    switch(e.key){
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        next(); e.preventDefault(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        prev(); e.preventDefault(); break;
      case ' ':
        next(); e.preventDefault(); break;
      case 'Home':
        goTo(0); e.preventDefault(); break;
      case 'End':
        goTo(total-1); e.preventDefault(); break;
      case 'f': case 'F':
        toggleFullscreen(); break;
      case 'g': case 'G':
        openOverview(); break;
      case 'm': case 'M':
        setTool(activeTool === 'zoom' ? null : 'zoom'); break;
      case 'p': case 'P':
        setTool(activeTool === 'pen' ? null : 'pen'); break;
      case 'e': case 'E':
        setTool(activeTool === 'eraser' ? null : 'eraser'); break;
      case 'Escape':
        if (activeTool) setTool(null);
        break;
    }
    hideHint();
  });

  // 터치 스와이프 (모바일)
  let touchStartX = null;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) { dx < 0 ? next() : prev(); }
    touchStartX = null;
  }, {passive:true});

  // 첫 힌트 자동 숨김
  function hideHint(){ kbdHint.classList.add('hide'); }
  setTimeout(hideHint, 5000);

  /* ============================================================
     교육용 도구: 돋보기 / 싸인펜 / 지우개
     ============================================================ */
  const deck = document.getElementById('deck');
  const canvas = document.getElementById('annoCanvas');
  const ctx = canvas.getContext('2d');
  const lens = document.getElementById('lens');
  const lensContent = document.getElementById('lensContent');
  const toolZoom = document.getElementById('toolZoom');
  const toolPen = document.getElementById('toolPen');
  const toolEraser = document.getElementById('toolEraser');
  const toolClear = document.getElementById('toolClear');
  const penColors = document.getElementById('penColors');
  const penWrap = document.querySelector('.at-pen-wrap');

  let activeTool = null;       // null | 'zoom' | 'pen' | 'eraser'
  let penColor = '#FFD23F';
  const PEN_WIDTH = 7;
  const ERASER_WIDTH = 30;
  const LENS_SIZE = 220;
  const LENS_SCALE = 2.3;

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function clearCanvas(){
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  }

  function setToolButtons(){
    toolZoom.classList.toggle('on', activeTool === 'zoom');
    toolPen.classList.toggle('on', activeTool === 'pen');
    toolEraser.classList.toggle('on', activeTool === 'eraser');
    penColors.classList.toggle('show', activeTool === 'pen');
  }

  function setTool(tool){
    activeTool = tool;
    canvas.classList.toggle('drawable', tool === 'pen' || tool === 'eraser');
    canvas.classList.toggle('erasing', tool === 'eraser');
    lens.classList.toggle('show', tool === 'zoom');
    document.body.style.cursor = tool === 'zoom' ? 'none' : '';
    setToolButtons();
    if (tool === 'zoom') { refreshLensClone(); }
  }

  function positionLens(clientX, clientY){
    const deckRect = deck.getBoundingClientRect();
    const x = clientX - deckRect.left;
    const y = clientY - deckRect.top;
    const half = LENS_SIZE / 2;
    lens.style.left = (clientX - half) + 'px';
    lens.style.top = (clientY - half) + 'px';
    lensContent.style.transform = `scale(${LENS_SCALE})`;
    lensContent.style.left = (half / LENS_SCALE - x) * LENS_SCALE + 'px';
    lensContent.style.top = (half / LENS_SCALE - y) * LENS_SCALE + 'px';
  }

  toolZoom.addEventListener('click', (e) => {
    const willActivate = activeTool !== 'zoom';
    setTool(willActivate ? 'zoom' : null);
    if (willActivate) positionLens(e.clientX, e.clientY);
  });
  toolEraser.addEventListener('click', () => setTool(activeTool === 'eraser' ? null : 'eraser'));
  toolClear.addEventListener('click', clearCanvas);

  // 펜 버튼: 비활성 상태에서 누르면 펜 모드 on, 이미 펜 모드면 색상 팔레트만 토글
  toolPen.addEventListener('click', (e) => {
    e.stopPropagation();
    setTool(activeTool === 'pen' ? null : 'pen');
  });
  penColors.querySelectorAll('.at-color').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      penColor = btn.getAttribute('data-color');
      penColors.querySelectorAll('.at-color').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (activeTool !== 'pen') setTool('pen');
    });
  });

  /* ---------- 펜 / 지우개 드로잉 ---------- */
  let drawing = false;
  let lastX = 0, lastY = 0;

  function posFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function strokeTo(x, y){
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = ERASER_WIDTH;
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = PEN_WIDTH;
      ctx.globalAlpha = 0.85;
    }
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x; lastY = y;
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (!(activeTool === 'pen' || activeTool === 'eraser')) return;
    drawing = true;
    const p = posFromEvent(e);
    lastX = p.x; lastY = p.y;
    strokeTo(p.x + 0.01, p.y + 0.01); // 점 하나만 찍어도 흔적이 남도록
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = posFromEvent(e);
    strokeTo(p.x, p.y);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(evt => {
    canvas.addEventListener(evt, () => { drawing = false; });
  });

  /* ---------- 돋보기(마우스 추적 확대경) ---------- */
  function refreshLensClone(){
    const deckRect = deck.getBoundingClientRect();
    const activeSlide = slides[current];
    lensContent.innerHTML = '';
    const clone = activeSlide.cloneNode(true);
    clone.classList.add('active');
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = deckRect.width + 'px';
    clone.style.height = deckRect.height + 'px';
    clone.style.transform = 'none';
    lensContent.style.width = deckRect.width + 'px';
    lensContent.style.height = deckRect.height + 'px';
    lensContent.appendChild(clone);
  }

  window.addEventListener('mousemove', (e) => {
    if (activeTool !== 'zoom') return;
    positionLens(e.clientX, e.clientY);
  });

  // 아코디언 등을 펼친 뒤에도 돋보기 내용이 최신 상태를 반영하도록 갱신
  document.addEventListener('click', () => {
    if (activeTool === 'zoom') setTimeout(refreshLensClone, 60);
  });

})();
