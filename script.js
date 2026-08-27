// 모바일 사이드바 토글
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const backdrop = document.getElementById('backdrop');

function openSidebar(){
  sidebar.classList.add('open');
  backdrop.classList.add('show');
}
function closeSidebar(){
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
}
menuToggle && menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
backdrop && backdrop.addEventListener('click', closeSidebar);

// 링크 클릭 시 모바일에서는 사이드바 닫기
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 960) closeSidebar();
  });
});

// 스크롤스파이: 현재 보고 있는 섹션의 nav 링크 하이라이트
const sections = document.querySelectorAll('main .section, main .qa');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

sections.forEach(sec => observer.observe(sec));
