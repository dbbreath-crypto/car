/* 有车网 · 二级页面公共脚本（about / join / store / hq / contact 共用） */
(function () {
  const progress = document.getElementById('progress');
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  const mContact = document.querySelector('.m-contact');
  const subnav = document.getElementById('subnav');

  // 同步主导航实际高度到 CSS 变量，供二级导航吸顶定位
  // 注意：主导航高度变化带 .4s 过渡，滚动瞬间测量到的是过渡中间值，
  // 因此除立即测量外，再在过渡结束后补测一次，保证吸顶位置精确贴合
  let navHFix = null;
  function syncNavH() {
    if (!nav) return;
    const h = nav.offsetHeight;
    if (h) document.documentElement.style.setProperty('--navH', h + 'px');
    clearTimeout(navHFix);
    navHFix = setTimeout(() => {
      const h2 = nav.offsetHeight;
      if (h2) document.documentElement.style.setProperty('--navH', h2 + 'px');
    }, 450);
  }

  function onScroll() {
    const st = window.scrollY;
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (st / h * 100) : 0) + '%';
    }
    if (nav) nav.classList.toggle('scrolled', st > 60);
    if (toTop) toTop.classList.toggle('show', st > 600);
    if (mContact) mContact.classList.toggle('show', st > 600);
    syncNavH();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncNavH);

  // 缓动滚动
  function smoothScrollTo(targetY, duration = 1400) {
    const startY = window.scrollY, diff = targetY - startY, t0 = performance.now();
    function ease(t) { return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }
    function step(t) {
      const p = Math.min((t - t0) / duration, 1);
      window.scrollTo(0, startY + diff * ease(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (toTop) toTop.addEventListener('click', () => smoothScrollTo(0, 1400));

  // 页内锚点 + 二级导航高亮
  const subLinks = subnav ? [...subnav.querySelectorAll('a')] : [];
  function setSubActive(id) {
    subLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      setSubActive(id);
      // 偏移 = 固定主导航 + 吸顶二级导航 + 间距，避免标题被遮挡
      const navH = nav ? nav.offsetHeight : 0;
      const subH = subnav ? subnav.offsetHeight : 0;
      const offset = navH + subH + 16;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      smoothScrollTo(Math.max(0, y), 1400);
      history.replaceState(null, '', id);
    });
  });

  // 滚动联动二级导航高亮
  const spy = subLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  let ticking = false;
  function updateSpy() {
    ticking = false;
    if (!spy.length) return;
    const navH = nav ? nav.offsetHeight : 0;
    const subH = subnav ? subnav.offsetHeight : 0;
    const pos = window.scrollY + navH + subH + 80;
    let cur = '';
    spy.forEach(sec => { if (pos >= sec.offsetTop) cur = '#' + sec.id; });
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= bottom - 4) cur = '#' + spy[spy.length - 1].id;
    subLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === cur));
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateSpy); }
  }, { passive: true });

  // reveal（支持 prefers-reduced-motion 或 ?noanim：直接显示，跳过渐显）
  const noAnim = matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('noanim');
  if (noAnim) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // 移动端菜单
  const burger = document.getElementById('burger');
  const mMenu = document.getElementById('mMenu');
  if (burger && mMenu) {
    burger.addEventListener('click', () => {
      const open = mMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mMenu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = '';
    }));
  }

  // FAQ 手风琴
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const ans = item.querySelector('.faq-a');
      const open = item.classList.toggle('open');
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : 0;
    });
  });

  // 意向表单（前端演示：本地提示，不提交到服务器）
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = document.getElementById('formOk');
      if (ok) {
        ok.classList.add('show');
        ok.textContent = '提交成功，总部招商顾问将在 1 个工作日内与你联系。也可直接致电 400-688-5882。';
        ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    });
  }

  onScroll();
  syncNavH();
  updateSpy();
})();
