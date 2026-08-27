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
  function openOverview(){ overview.classList.add('show'); }
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
})();
