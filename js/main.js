// ── FAQ 아코디언 ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // 같은 목록 내 다른 항목 닫기
    btn.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── 스크롤 진입 페이드인 ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.point-card, .guide-card, .step-item, .info-box, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
