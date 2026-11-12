/**
 * IKAPMI Regional Bandung - Official Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroInteractiveCard();
  initOrgFilter();
  initCampusFilter();
  initMentorshipTabs();
  initBeasiswaCatalog();
  initJalurKampus();
  initPerspectiveTunnelHero();
  initArticleModal();
  initRegistrationForm();
  initScrollAnimations();
});

/* ----------------------------------------------------
   1. LIQUID GLASS NAVBAR & WATER DROP DYNAMICS
   Inspired by 21st.dev/@gughigug/components/liquid-glass-navbar
---------------------------------------------------- */
function initNavbar() {
  const dock = document.getElementById('liquid-nav-dock');
  const drop = document.getElementById('liquid-drop');
  const navItems = document.querySelectorAll('.liquid-nav-item');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const sections = document.querySelectorAll('section[id]');
  const headerWrapper = document.getElementById('navbar-header');

  let isHovering = false;
  let activeElement = navItems.length ? navItems[0] : null;

  // Helper to move the real water droplet indicator with physics spring easing
  function moveDropTo(el) {
    if (!el || !drop) return;
    const left = el.offsetLeft;
    const width = el.offsetWidth;
    drop.style.transform = `translate3d(${left}px, 0, 0)`;
    drop.style.width = `${width}px`;
    drop.style.opacity = '1';
  }

  if (dock && drop && navItems.length) {
    // Initialize drop position (only visible when an active nav item exists)
    setTimeout(() => {
      const initialActive = document.querySelector('.liquid-nav-item.active');
      if (initialActive) {
        activeElement = initialActive;
        moveDropTo(initialActive);
      } else {
        activeElement = null;
        drop.style.opacity = '0';
      }
    }, 100);

    // Mouse hover events on dock items
    navItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        isHovering = true;
        moveDropTo(item);
      });

      item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        activeElement = item;
        moveDropTo(item);
      });
    });

    // Mouse leaves the dock: snap back to currently active item or fade out on subpages
    dock.addEventListener('mouseleave', () => {
      isHovering = false;
      if (activeElement) {
        moveDropTo(activeElement);
      } else {
        drop.style.opacity = '0';
      }
    });

    // Recalculate on window resize
    window.addEventListener('resize', () => {
      if (activeElement) {
        moveDropTo(activeElement);
      }
    });

    // Scrollspy integration
    window.addEventListener('scroll', () => {
      const scrollPos = window.pageYOffset + 180;
      let currentId = '';

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = section.getAttribute('id');
        }
      });

      if (currentId && !isHovering) {
        navItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href === `#${currentId}`) {
            if (!item.classList.contains('active')) {
              navItems.forEach(i => i.classList.remove('active'));
              item.classList.add('active');
              activeElement = item;
              moveDropTo(item);
            }
          }
        });
      }
    });
  }

  // Mobile Menu Toggle & Accessible Interactions
  if (mobileToggle && mobileMenu) {
    function setMobileMenuOpen(isOpen) {
      mobileMenu.classList.toggle('hidden', !isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = mobileMenu.classList.contains('hidden');
      setMobileMenuOpen(willOpen);
    });

    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      mobileToggle.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMobileMenuOpen(false);
      });
    });

    // Close menu on outside tap/click or Escape key
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('hidden') && headerWrapper && !headerWrapper.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        setMobileMenuOpen(false);
        mobileToggle.focus();
      }
    });
  }
}


/* ----------------------------------------------------
   2. DIREKTORI KAMPUS & JEJARING FILTER
---------------------------------------------------- */
function initCampusFilter() {
  const filterBtns = document.querySelectorAll('.campus-filter-btn');
  const campusCards = document.querySelectorAll('#campus-cards-grid > .campus-card');
  const searchInput = document.getElementById('campus-search');
  const noResult = document.getElementById('no-campus-found');
  const toggleWrap = document.getElementById('campus-mobile-toggle-wrap');
  const toggleBtn = document.getElementById('btn-toggle-all-campus');
  const campusSection = document.getElementById('kampus');

  if (!campusCards.length) return;

  const MOBILE_BREAKPOINT = 768;
  const MOBILE_LIMIT = 3;
  let isMobileExpanded = false;
  let currentCat = 'all';
  let currentQuery = '';

  function syncToggleUi(extraCount, shouldShowToggle) {
    if (!toggleWrap || !toggleBtn) return;

    if (!shouldShowToggle || extraCount <= 0) {
      toggleWrap.classList.add('hidden');
      return;
    }

    toggleWrap.classList.remove('hidden');
    toggleBtn.setAttribute('aria-expanded', isMobileExpanded ? 'true' : 'false');

    if (isMobileExpanded) {
      toggleBtn.innerHTML = `
        <span>Tampilkan Lebih Sedikit</span>
        <i data-lucide="chevron-up" class="w-4 h-4 text-brand-700 group-hover:-translate-y-0.5 transition-transform"></i>
      `;
    } else {
      toggleBtn.innerHTML = `
        <span>Selengkapnya</span>
        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100/80 text-brand-800">+${extraCount} Kampus</span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-brand-700 group-hover:translate-y-0.5 transition-transform"></i>
      `;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function applyFilter(category, query = '') {
    currentCat = (category || 'all').trim().toLowerCase();
    currentQuery = query || '';
    const q = currentQuery.trim().toLowerCase();
    const queryWords = q.split(/\s+/).filter(Boolean);
    const isMobileViewport = window.innerWidth < MOBILE_BREAKPOINT;
    const capForMobile = isMobileViewport && !isMobileExpanded && queryWords.length === 0;
    let matchCount = 0;

    campusCards.forEach(card => {
      const cardCat = (card.getAttribute('data-category') || card.getAttribute('data-campus') || '').toLowerCase();
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardText = (card.textContent || '').toLowerCase() + ' ' + cardKeywords;

      const matchCat = (currentCat === 'all') || (cardCat === currentCat) || cardCat.includes(currentCat);
      const matchQuery = queryWords.length === 0 || queryWords.every(word => cardText.includes(word));

      if (matchCat && matchQuery) {
        matchCount++;
        const hideByMobileCap = capForMobile && matchCount > MOBILE_LIMIT;
        card.style.display = hideByMobileCap ? 'none' : 'flex';
        card.classList.toggle('hidden', hideByMobileCap);
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    if (noResult) {
      noResult.classList.toggle('hidden', matchCount !== 0);
    }

    const extraCount = Math.max(0, matchCount - MOBILE_LIMIT);
    syncToggleUi(extraCount, isMobileViewport && queryWords.length === 0 && extraCount > 0);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const wasExpanded = isMobileExpanded;
      isMobileExpanded = !isMobileExpanded;
      applyFilter(currentCat, currentQuery);

      if (wasExpanded && !isMobileExpanded && campusSection) {
        const topOffset = campusSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      isMobileExpanded = false;
      const cat = btn.getAttribute('data-filter') || 'all';
      const q = searchInput ? searchInput.value : '';
      applyFilter(cat, q);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim();
      let activeBtn = document.querySelector('.campus-filter-btn.active');
      let cat = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

      if (q && cat !== 'all') {
        let matchesInCat = false;
        campusCards.forEach(card => {
          const cardCat = (card.getAttribute('data-category') || '').toLowerCase();
          const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
          const cardText = (card.textContent || '').toLowerCase() + ' ' + cardKeywords;
          if (cardCat === cat && cardText.includes(q.toLowerCase())) {
            matchesInCat = true;
          }
        });
        if (!matchesInCat) {
          filterBtns.forEach(b => b.classList.remove('active'));
          const allBtn = document.querySelector('.campus-filter-btn[data-filter="all"]');
          if (allBtn) allBtn.classList.add('active');
          cat = 'all';
        }
      }

      applyFilter(cat, e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        const activeBtn = document.querySelector('.campus-filter-btn.active');
        const cat = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        applyFilter(cat, '');
      }
    });
  }

  window.addEventListener('resize', () => {
    applyFilter(currentCat, currentQuery);
  });

  applyFilter('all', searchInput ? searchInput.value : '');
}

/* ----------------------------------------------------
   3. PANDUAN SANTRI BARU (MENTORSHIP TABS)
---------------------------------------------------- */
function initMentorshipTabs() {
  const tabs = document.querySelectorAll('.guide-tab-btn');
  const contents = document.querySelectorAll('.guide-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-guide-target');
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
          content.classList.add('block');
        } else {
          content.classList.add('hidden');
          content.classList.remove('block');
        }
      });
    });
  });
}

/* ----------------------------------------------------
   4. 3D PERSPECTIVE TUNNEL CORRIDOR (21st.dev signature)
---------------------------------------------------- */
function initPerspectiveTunnelHero() {
  const container = document.getElementById('perspective-tunnel-container');
  const cardsStage = document.getElementById('tunnel-cards-stage');
  const centerTitle = document.getElementById('tunnel-center-title');

  // Lightbox elements
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  if (!container || !cardsStage) return;

  // Curated pool of ONLY large-group ("foto bersama-sama") LANDSCAPE photos (shuffled randomly on each visit)
  const curatedPool = [
    // ── Foto baru (gallery_new) di urutan pertama ──
    { src: "assets/gallery/gallery_new_01.jpg", ratio: "4 / 3", title: "Kebersamaan IKAPMI Bandung", desc: "Momen hangat bersama keluarga besar IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_02.jpg", ratio: "4 / 3", title: "Silaturahmi Santri Perantau", desc: "Santri PMUQI saling berbagi cerita dan semangat di perantauan Bandung." },
    { src: "assets/gallery/gallery_new_03.jpg", ratio: "4 / 3", title: "Agenda IKAPMI Bandung", desc: "Kegiatan rutin mempererat ukhuwah anggota IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_04.jpg", ratio: "4 / 3", title: "Foto Bersama Lintas Angkatan", desc: "Potret keakraban alumni PMUQI lintas generasi di Bandung Raya." },
    { src: "assets/gallery/gallery_new_05.jpg", ratio: "4 / 3", title: "Konsolidasi Anggota IKAPMI", desc: "Pertemuan penuh semangat pengurus dan anggota IKAPMI Bandung." },
    { src: "assets/gallery/gallery_new_06.jpg", ratio: "4 / 3", title: "Keakraban Santri di Bandung", desc: "Suasana hangat pertemuan keluarga santri rantau di Kota Bandung." },
    { src: "assets/gallery/gallery_new_07.jpg", ratio: "4 / 3", title: "Agenda Bersama IKAPMI", desc: "Momen berharga bersama seluruh kader IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_08.jpg", ratio: "4 / 3", title: "Ukhuwah IKAPMI Bandung", desc: "Ikatan persaudaraan yang solid di antara anggota IKAPMI Bandung." },
    { src: "assets/gallery/gallery_new_09.jpg", ratio: "4 / 3", title: "Silaturahmi Rutinan", desc: "Agenda silaturahmi rutin mempererat hubungan sesama alumni." },
    { src: "assets/gallery/gallery_new_10.jpg", ratio: "4 / 3", title: "Kebersamaan di Bandung Raya", desc: "Santri perantau bersatu padu dalam bingkai Sadulur Ngahiji." },
    { src: "assets/gallery/gallery_new_11.jpg", ratio: "4 / 3", title: "Rapat & Konsolidasi Kabinet", desc: "Semangat berorganisasi pengurus IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_12.jpg", ratio: "4 / 3", title: "Agenda Keagamaan IKAPMI", desc: "Kegiatan ruhani bersama mempererat ikatan spiritual dan kekeluargaan." },
    { src: "assets/gallery/gallery_new_13.jpg", ratio: "4 / 3", title: "Foto Bersama IKAPMI Bandung", desc: "Kenangan indah bersama seluruh keluarga besar IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_14.jpg", ratio: "4 / 3", title: "Momen Kebersamaan", desc: "Semangat persatuan alumni PMUQI di Bandung yang terus terjaga." },
    { src: "assets/gallery/gallery_new_15.jpg", ratio: "4 / 3", title: "IKAPMI Bandung Bersatu", desc: "Kekuatan ukhuwah yang menjadi fondasi IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_16.jpg", ratio: "4 / 3", title: "Kegiatan Sosial IKAPMI", desc: "Aksi nyata IKAPMI Bandung untuk masyarakat dan sesama alumni." },
    { src: "assets/gallery/gallery_new_17.jpg", ratio: "4 / 3", title: "Soliditas Pengurus IKAPMI", desc: "Kompaknya pengurus IKAPMI Bandung dalam mengemban amanah organisasi." },
    { src: "assets/gallery/gallery_new_18.jpg", ratio: "4 / 3", title: "Forum Santri Perantau Bandung", desc: "Ruang diskusi dan berbagi pengalaman santri PMUQI di Bandung Raya." },
    { src: "assets/gallery/gallery_new_19.jpg", ratio: "4 / 3", title: "Gathering IKAPMI Bandung", desc: "Suasana ceria dan hangat dalam agenda gathering keluarga IKAPMI." },
    { src: "assets/gallery/gallery_new_20.jpg", ratio: "4 / 3", title: "Kolaborasi Lintas Kampus", desc: "Sinergi santri PMUQI dari berbagai universitas di Bandung Raya." },
    { src: "assets/gallery/gallery_new_21.jpg", ratio: "4 / 3", title: "Semangat IKAPMI Bandung", desc: "Semangat berkarya dan berdedikasi pengurus IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_new_22.jpg", ratio: "4 / 3", title: "Ukhuwah Santri Rantau", desc: "Jalinan persaudaraan yang kuat antaranggota IKAPMI di Bandung." },
    { src: "assets/gallery/gallery_new_23.jpg", ratio: "4 / 3", title: "Kenangan Bersama IKAPMI", desc: "Momen istimewa bersama keluarga besar santri PMUQI di Bandung." },
    { src: "assets/gallery/gallery_new_24.jpg", ratio: "4 / 3", title: "IKAPMI Bandung Bergerak", desc: "Langkah nyata IKAPMI Bandung dalam mewujudkan Sadulur Ngahiji." },
    // ── Foto lama yang masih ada ──
    { src: "assets/gallery/gallery_36.jpg", ratio: "16 / 9", title: "Kebersamaan di Masjid Al-Jabbar", desc: "Silaturahmi keluarga besar IKAPMI Bandung di pelataran Masjid Raya Al-Jabbar." },
    { src: "assets/gallery/gallery_38.jpg", ratio: "16 / 9", title: "Silaturahmi Akbar Keluarga IKAPMI", desc: "Kebersamaan penuh kehangatan seluruh anggota IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_39.jpg", ratio: "4 / 3", title: "Kumpul Akbar Depan Gedung Sate", desc: "Konsolidasi santri perantau Bandung Raya berlatar ikon Kota Bandung." },
    { src: "assets/gallery/gallery_40.jpg", ratio: "4 / 3", title: "Temu Keluarga Besar IKAPMI", desc: "Potret kehangatan pertemuan rutin keluarga mahasiswa santri di Bandung." },
    { src: "assets/gallery/gallery_41.jpg", ratio: "16 / 9", title: "Silaturahmi & Konsolidasi Bersama", desc: "Momen kebersamaan lintas angkatan mempererat ukhuwah di tanah perantauan." },
    { src: "assets/gallery/gallery_43.jpg", ratio: "4 / 3", title: "Kumpul Anggota Lintas Kampus", desc: "Sinergi santri PMUQI yang tersebar di berbagai universitas di Bandung Raya." },
    { src: "assets/gallery/gallery_46.jpg", ratio: "4 / 3", title: "Malam Keakraban Pendopo Kabinet", desc: "Mempererat ukhuwah dan rasa kekeluargaan pengurus di suasana malam Bandung." },
    { src: "assets/gallery/gallery_77.jpg", ratio: "16 / 9", title: "Konsolidasi Pengurus & Anggota", desc: "Foto bersama keluarga besar IKAPMI Regional Bandung pasca forum musyawarah." },
    { src: "assets/gallery/gallery_79.jpg", ratio: "3 / 2", title: "Soliditas Kabinet Astra Nowanta", desc: "Kekompakan dan semangat berkarya pengurus harian IKAPMI Regional Bandung." },
    { src: "assets/gallery/gallery_11.jpg", ratio: "4 / 3", title: "Temu Kangen Lintas Angkatan", desc: "Hangatnya silaturahmi mahasiswa alumni santri dalam suasana penuh keakraban." },
    { src: "assets/gallery/gallery_23.jpg", ratio: "3 / 2", title: "Delegasi Campus Expo PMUQI", desc: "Tim delegasi IKAPMI Bandung hadir menyapa santri kelas akhir pada Campus Expo." },
    { src: "assets/mureg_IMG_6782.JPG", ratio: "16 / 9", title: "Musyawarah Regional IKAPMI Bandung", desc: "Foto bersama delegasi dan pengurus dalam agenda Musyawarah Regional." },
    { src: "assets/warta_bukber.jpg", ratio: "4 / 3", title: "Buka Puasa Bersama di Al-Jabbar", desc: "Menjalin kehangatan Ramadhan bersama santri perantau se-Bandung Raya." },
    { src: "assets/tunnel/tunnel_gor_expo.jpg", ratio: "4 / 3", title: "Campus Expo di GOR PMUQI Bogor", desc: "Antusiasme santri kelas akhir menyambut rombongan alumni perantau Bandung." },
    { src: "assets/tunnel/tunnel_futsal.jpg", ratio: "4 / 3", title: "Sparring Futsal & Olahraga Bersama", desc: "Menjaga kebugaran sekaligus mempererat sportivitas antar-anggota IKAPMI Bandung." },
    { src: "assets/tunnel/tunnel_yasin.jpg", ratio: "4 / 3", title: "Kajian & Yasinan Rutin Alumni", desc: "Menjaga tradisi spiritual pesantren di tengah kesibukan kuliah di perantauan." },
    { src: "assets/tunnel/tunnel_silaturahmi.jpg", ratio: "4 / 3", title: "Silaturahmi Bersama Pimpinan PMUQI", desc: "Memohon doa restu serta memperkuat khidmah IKAPMI Regional Bandung untuk almamater." },
    { src: "assets/tunnel/tunnel_saung_siang.jpg", ratio: "16 / 9", title: "Upgrading & Kebersamaan Kabinet", desc: "Suasana akrab di saung terbuka dalam agenda upgrading pengurus regional." }
  ];

  // Fisher-Yates shuffle so every visit shows random, non-repeating photos
  for (let i = curatedPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [curatedPool[i], curatedPool[j]] = [curatedPool[j], curatedPool[i]];
  }
  const tunnelData = curatedPool.slice(0, 12);

  const totalCards = tunnelData.length;
  const goldenAngle = 137.5 * (Math.PI / 180);

  // Card items metadata with golden angle spiral math
  const cards = tunnelData.map((item, i) => {
    const angle = i * goldenAngle;
    return {
      item,
      angleCos: Math.cos(angle),
      angleSin: Math.sin(angle),
      radiusFactorX: 0.28 + (i % 3) * 0.08,
      radiusFactorY: 0.26 + (i % 2) * 0.09,
      rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      index: i
    };
  });

  // Create DOM cards: PURE IMAGE ONLY (NO TEXT OVERLAYS) as requested
  cardsStage.innerHTML = '';
  const cardElements = cards.map((card) => {
    const el = document.createElement('div');
    el.className = 'tunnel-card-item pointer-events-auto absolute left-1/2 top-1/2 will-change-transform select-none cursor-pointer';
    el.style.transformStyle = 'preserve-3d';
    el.style.aspectRatio = card.item.ratio || '4 / 5';
    
    el.innerHTML = `
      <div class="group relative h-full w-full overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 transition-all duration-300 hover:ring-2 hover:ring-blue-700 hover:shadow-2xl hover:shadow-blue-950/25">
        <img src="${card.item.src}" alt="${card.item.title}" draggable="false" class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105">
      </div>
    `;

    // Click on card opens Lightbox
    el.addEventListener('click', () => {
      openLightbox(card.item.src, card.item.title, card.item.desc);
    });

    cardsStage.appendChild(el);
    return el;
  });

  // State
  const MIN_PROGRESS = 0.14; // below this the stage is empty (title and cards fully faded)
  let targetProgress = MIN_PROGRESS;
  let currentProgress = MIN_PROGRESS;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;
  let isDragging = false;
  let dragStartY = 0;
  let dragStartProgress = 0;

  // Window resize handler
  let stageWidth = container.clientWidth || 1200;
  let stageHeight = container.clientHeight || 700;
  let isMobile = window.innerWidth < 768;

  function handleResize() {
    stageWidth = container.clientWidth || window.innerWidth;
    stageHeight = container.clientHeight || 700;
    isMobile = window.innerWidth < 768;
    const stage = document.getElementById('tunnel-stage');
    if (stage) {
      stage.style.perspective = isMobile ? '900px' : '1200px';
    }
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  // Touch screens / narrow viewports: a swipe scrolls the page, so it cannot also "fly" the tunnel.
  // There the section is tall and the stage is sticky (see css), and page scroll drives the tunnel.
  const sectionEl = container.closest('section');
  function isScrollDriven() {
    return window.innerWidth < 1024 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }
  function syncScrollProgress() {
    if (!sectionEl || !isScrollDriven()) return;
    const rect = sectionEl.getBoundingClientRect();
    const travel = rect.height - container.clientHeight;
    if (travel <= 0) return;
    const p = Math.max(0, Math.min(1, -rect.top / travel));
    targetProgress = MIN_PROGRESS + p * (1 - MIN_PROGRESS);
  }
  window.addEventListener('scroll', syncScrollProgress, { passive: true });
  window.addEventListener('resize', syncScrollProgress);
  syncScrollProgress();

  // Helper: check if the container is currently full in the viewport
  function isContainerInFullView() {
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    // Full view: container top is near viewport top (below sticky navbar ~80px) and bottom covers the viewport
    const topInFocus = rect.top <= 120;
    const bottomInFocus = rect.bottom >= viewportHeight * 0.65;
    return topInFocus && bottomInFocus;
  }

  // Mouse Wheel over container
  // UX FIX:
  // 1. Only intercept wheel if the container is FULL in view. If not full in view, let page scroll!
  // 2. When reached end of tunnel (mentok akhir), let page scroll down to #warta.
  // 3. When reached start of tunnel (mentok awal), let page scroll up.
  container.addEventListener('wheel', (e) => {
    if (isScrollDriven()) return; // page scroll drives the tunnel
    // If container is NOT full in screen, let the regular page scroll proceed!
    if (!isContainerInFullView()) {
      return; // Do NOT preventDefault! Let page scroll normally
    }

    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    // When reached end of tunnel corridor (mentok akhir) and scrolling down, allow page scroll to #warta
    if (isScrollingDown && targetProgress >= 0.985) {
      targetProgress = 1;
      return; // Do NOT preventDefault! Let page scroll normally to #warta
    }

    // When reached start of tunnel corridor (mentok awal) and scrolling up, allow page scroll up
    if (isScrollingUp && targetProgress <= MIN_PROGRESS + 0.015) {
      targetProgress = MIN_PROGRESS;
      return; // Do NOT preventDefault! Let page scroll normally back up
    }

    // Otherwise, we are full in view and navigating inside the 3D tunnel corridor
    e.preventDefault();
    const delta = e.deltaY * 0.0008;
    targetProgress = Math.max(MIN_PROGRESS, Math.min(1, targetProgress + delta));
  }, { passive: false });

  // Mouse Drag (Click and drag still supported)
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartY = e.clientY;
    dragStartProgress = targetProgress;
    container.classList.add('cursor-grabbing');
    container.classList.remove('cursor-grab');
  });

  window.addEventListener('mousemove', (e) => {
    // Parallax tracking
    const rect = container.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      targetPointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetPointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    if (isDragging && !isScrollDriven()) {
      const delta = (dragStartY - e.clientY) * 0.002;
      targetProgress = Math.max(MIN_PROGRESS, Math.min(1, dragStartProgress + delta));
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.classList.remove('cursor-grabbing');
    container.classList.add('cursor-grab');
  });

  // Touch Support
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      dragStartY = e.touches[0].clientY;
      dragStartProgress = targetProgress;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isScrollDriven() && e.touches.length === 1 && isContainerInFullView()) {
      const delta = (dragStartY - e.touches[0].clientY) * 0.0022;
      targetProgress = Math.max(MIN_PROGRESS, Math.min(1, dragStartProgress + delta));
    }
  }, { passive: true });

  // Lightbox Modal Functions
  function openLightbox(src, title, desc) {
    if (lightbox && lightboxImg) {
      lightboxImg.src = src;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxDesc) lightboxDesc.textContent = desc;
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  // 60FPS RAF Render Loop (Spring physics + 3D Z-axis calculation)
  function renderLoop() {
    // Smooth lerp interpolation
    currentProgress += (targetProgress - currentProgress) * 0.085;
    currentPointerX += (targetPointerX - currentPointerX) * 0.06;
    currentPointerY += (targetPointerY - currentPointerY) * 0.06;

    // Center Hero Typography Scale & Opacity (Placed in background z-0 behind cards)
    if (centerTitle) {
      const titleScale = 0.88 + currentProgress * 0.45;
      let titleOpacity = 1;
      if (currentProgress < 0.12) {
        titleOpacity = currentProgress / 0.12;
      } else if (currentProgress > 0.85) {
        titleOpacity = Math.max(0, 1 - (currentProgress - 0.85) / 0.15);
      }
      centerTitle.style.transform = `scale(${titleScale})`;
      centerTitle.style.opacity = titleOpacity.toFixed(2);
    }

    // Update each Card along 3D Z-axis corridor
    const cardWidth = isMobile
      ? Math.max(150, Math.min(210, stageWidth * 0.46))
      : Math.max(200, Math.min(280, stageWidth * 0.18));

    const parallaxShift = isMobile ? 25 : 55;
    const minZ = isMobile ? -1400 : -1900;
    const maxZ = isMobile ? 380 : 550;

    cards.forEach((card, idx) => {
      const el = cardElements[idx];
      if (!el) return;

      // Staggered travel window for 12 cards
      const start = (card.index / totalCards) * 0.45;
      const end = start + 0.55;
      const localProgress = Math.max(0, Math.min(1, (currentProgress - start) / (end - start)));

      // Calculate Z distance
      const z = minZ + localProgress * (maxZ - minZ);

      // Smooth Opacity curve
      let opacity = 0;
      if (localProgress > 0 && localProgress <= 0.18) {
        opacity = localProgress / 0.18;
      } else if (localProgress > 0.18 && localProgress <= 0.82) {
        opacity = 1;
      } else if (localProgress > 0.82 && localProgress <= 0.98) {
        opacity = 1 - (localProgress - 0.82) / 0.16;
      }

      // 3D Position with Camera Parallax
      const posX = card.angleCos * (stageWidth * card.radiusFactorX) - currentPointerX * parallaxShift;
      const posY = card.angleSin * (stageHeight * card.radiusFactorY) - currentPointerY * parallaxShift;

      el.style.width = `${cardWidth}px`;
      el.style.transform = `translate3d(calc(-50% + ${posX}px), calc(-50% + ${posY}px), ${z}px) rotateZ(${card.rotationZ}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = Math.round(z + 2000);
      el.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
    });

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
}


/* ----------------------------------------------------
   5. ARTICLE / NEWS READER MODAL
---------------------------------------------------- */
const articleData = {
  1: {
    title: "MUREG 2025: Suksesi Kepemimpinan dan Penetapan Arah Baru IKAPMI Regional Bandung",
    date: "14 Januari 2025",
    author: "Departemen Kominfo & Humas",
    tag: "Organisasi & Suksesi",
    image: "assets/mureg_presidium.jpg",
    content: `
      <p class="mb-4">Musyawarah Regional (MUREG) IKAPMI Regional Bandung tahun 2025 resmi diselenggarakan dengan khidmat dan penuh rasa tanggung jawab. Bertempat di aula pertemuan Bandung, forum permusyawaratan tertinggi di tingkat regional ini dihadiri oleh puluhan delegasi perwakilan kampus di Bandung Raya.</p>
      <p class="mb-4">Sidang pleno yang dipimpin oleh presidium sidang membahas laporan pertanggungjawaban kepengurusan periode sebelumnya, evaluasi kinerja, hingga penetapan Garis-Garis Besar Program Kerja (GBPK) organisasi untuk masa bakti selanjutnya.</p>
      <p class="mb-4">Ketua Regional terpilih dalam pidato perdananya menegaskan bahwa nilai <em>'Sadulur Ngahiji'</em> bukan sekadar jargon, melainkan ikhtiar konkret untuk memastikan tidak ada santri Ummul Quro Al-Islami yang merasa sendirian ketika berjuang di perantauan Bandung.</p>
      <blockquote class="p-4 my-4 border-l-4 border-[#0f2e59] bg-blue-50 text-blue-950 rounded-r-lg italic">
        "Bandung adalah kawah candradimuka intelektual. Kita datang dengan bekal adab dan ilmu pesantren, lalu pulang memberikan kontribusi nyata bagi umat dan bangsa."
      </blockquote>
      <p>MUREG 2025 ditutup dengan doa bersama untuk almamater Pondok Pesantren Modern Ummul Quro Al-Islami dan sesi foto kebersamaan lintas angkatan alumni.</p>
    `
  },
  2: {
    title: "RAKER 2025: Rumuskan 18 Program Kerja Prioritas untuk Mahasiswa Alumni di Bandung",
    date: "28 Januari 2025",
    author: "BPH IKAPMI Bandung",
    tag: "Program Kerja",
    image: "assets/raker_plenary.jpg",
    content: `
      <p class="mb-4">Menindaklanjuti ketetapan MUREG, jajaran pengurus IKAPMI Regional Bandung menggelar Rapat Kerja (RAKER) 2025 guna membedah dan mematangkan program kerja setiap departemen secara terukur dan berkelanjutan.</p>
      <p class="mb-4">Dari hasil musyawarah komisi, disepakati 18 program kerja unggulan yang mencakup penguatan database alumni berbasis digital, pendampingan santri baru (Campus Mentoring), pengajian dan kajian keislaman tematik, hingga pengembangan inkubasi wirausaha santri di Bandung.</p>
      <p class="mb-4">Setiap departemen mempresentasikan timeline kegiatan serta indikator keberhasilan. Langkah ini diambil agar organisasi bergerak dengan tata kelola yang profesional, transparan, dan berdampak langsung bagi seluruh anggota.</p>
    `
  },
  3: {
    title: "Delegasi Campus Expo: IKAPMI Bandung Sambangi Santri PMUQI Bogor Beri Edukasi Perkuliahan",
    date: "04 Februari 2025",
    author: "Departemen Pendidikan & Akademik",
    tag: "Pengabdian Almamater",
    image: "assets/gallery/gallery_34.jpg",
    imageFit: "contain",
    content: `
      <p class="mb-4">Sebagai wujud khidmah dan bakti kepada almamater tercinta di Leuwiliang Bogor, delegasi IKAPMI Regional Bandung hadir secara langsung dalam agenda tahunan Campus Expo di MA Ummul Quro Al-Islami.</p>
      <p class="mb-4">Delegasi Bandung mendirikan booth informasi khusus yang memperkenalkan ragam perguruan tinggi ternama di Bandung Raya, seperti UIN SGD, UNPAD, UPI, ITB, dan Telkom University. Para santri kelas akhir tampak sangat antusias berkonsultasi mengenai jalur seleksi masuk (SNBP, SNBT, SPAN-PTKIN, dan Ujian Mandiri).</p>
      <p class="mb-4">Selain membagikan brosur dan modul panduan belajar, tim IKAPMI Bandung juga mengadakan sesi bedah jurusan dan sharing kiat sukses menembus kampus impian bersama para kakak tingkat.</p>
    `
  },
  4: {
    title: "Buka Puasa Bersama IKAPMI Bandung di Pelataran Masjid Raya Al-Jabbar",
    date: "Agenda Ramadhan",
    author: "IKAPMI Regional Bandung",
    tag: "Kebersamaan",
    image: "assets/warta_bukber.jpg",
    imagePosition: "object-[50%_68%]",
    content: `
      <p class="mb-4">Suasana hangat penuh kekeluargaan menyelimuti pelataran Masjid Raya Al-Jabbar saat keluarga besar IKAPMI Regional Bandung menggelar kegiatan Buka Puasa Bersama di bulan suci Ramadhan.</p>
      <p class="mb-4">Mengenakan pakaian dinas lapangan (PDL) IKAPMI Bandung, para mahasiswa dan alumni Pondok Pesantren Modern Ummul Quro Al-Islami duduk melingkar bersama, berbagi hidangan takjil, serta bertukar cerita mengenai dinamika perkuliahan dan pengabdian di Bandung Raya.</p>
      <p class="mb-4">Momentum buka puasa bersama ini menjadi pengingat bahwa di tengah kesibukan akademik masing-masing kampus, ikatan ukhuwah sesama alumni santri tetap terjaga erat dalam bingkai kebersamaan <em>Sadulur Ngahiji</em>.</p>
    `
  },
  5: {
    title: "Pengajian Yasin Rutinan: Menjaga Tradisi Doa dan Ukhuwah Santri Rantau",
    date: "Program Rutinan",
    author: "Departemen Keagamaan IKAPMI Bandung",
    tag: "Keagamaan",
    image: "assets/warta_pengajian_yasin.jpg",
    imageFit: "contain",
    content: `
      <p class="mb-4">Sebagai ikhtiar merawat ruhani dan tradisi keilmuan pesantren di tanah rantau, IKAPMI Regional Bandung secara istikamah menyelenggarakan Pengajian Yasin Rutinan yang diikuti oleh santri ikhwan dan akhwat lintas kampus.</p>
      <p class="mb-4">Kegiatan diisi dengan pembacaan Surah Yasin, tahlil, doa bersama untuk kedua orang tua, para masyayikh Pondok Pesantren Modern Ummul Quro Al-Islami, serta ditutup dengan ramah tamah hangat antaranggota.</p>
      <p class="mb-4">Melalui majelis rutinan sederhana namun penuh keberkahan ini, diharapkan para mahasiswa perantau senantiasa diberi keteguhan hati, kelancaran studi, dan kepekaan sosial di lingkungan masyarakat Bandung.</p>
    `
  },
  6: {
    title: "Futsal Bersama IKAPMI Bandung: Ajang Silaturahmi Lintas Kampus dan Angkatan",
    date: "Olahraga & Ukhuwah",
    author: "Departemen Minat & Bakat",
    tag: "Kepemudaan",
    image: "assets/warta_futsal.jpg",
    imageFit: "contain",
    content: `
      <p class="mb-4">Tak hanya aktif di ruang diskusi akademik dan keagamaan, anggota IKAPMI Regional Bandung juga menyalurkan semangat kebersamaan melalui agenda olahraga Futsal Bersama lintas kampus dan angkatan.</p>
      <p class="mb-4">Berlangsung meriah dengan dukungan penuh rekan-rekan ikhwan dan akhwat yang turut hadir memberikan semangat di pinggir lapangan, laga persahabatan ini menjunjung tinggi sportivitas serta menjadi pelepas penat di sela jadwal kuliah.</p>
      <p class="mb-4">Kegiatan diakhiri dengan sesi foto bersama membentangkan bendera kebanggaan IKAPMI Regional Bandung dan almamater sebagai simbol solidnya persaudaraan di perantauan.</p>
    `
  },
  7: {
    title: "Silaturahmi Pimpinan PMUQI: Mempererat Restu Almamater dan Sinergi Kader",
    date: "Agenda Almamater",
    author: "BPH IKAPMI Regional Bandung",
    tag: "Silaturahmi",
    image: "assets/warta_silaturahmi_pimpinan.jpg",
    imageFit: "contain",
    content: `
      <p class="mb-4">Jajaran pengurus dan perwakilan santri IKAPMI Regional Bandung melaksanakan agenda Silaturahmi bersama Pimpinan Pondok Pesantren Modern Ummul Quro Al-Islami (PMUQI) sebagai wujud ta'zhim sekaligus penyelarasan langkah pengabdian alumni.</p>
      <p class="mb-4">Dalam suasana penuh kehangatan dan kesederhanaan, para kader memohon doa restu serta menyimak wejangan berharga terkait menjaga adab santri, integritas keilmuan, dan kesiapan berkontribusi bagi umat setelah menyelesaikan studi di Bandung.</p>
      <p class="mb-4">Pertemuan ini semakin meneguhkan komitmen IKAPMI Bandung untuk menjadi wadah pemersatu yang membawa nama baik almamater di tengah masyarakat luas.</p>
    `
  }
};

function initArticleModal() {
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('article-modal-close');
  const modalContent = document.getElementById('article-modal-body');
  const triggers = document.querySelectorAll('.read-article-btn');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = trigger.getAttribute('data-article-id');
      const data = articleData[articleId];

      if (data && modal && modalContent) {
        const imgPosition = data.imagePosition ? data.imagePosition.replace('object-','') : 'center 30%';

        modalContent.innerHTML = `
          <!-- Hero image: always cover, 16/9, rounded top -->
          <div class="warta-modal-hero">
            <img src="${data.image}" alt="${data.title}" style="object-position:${imgPosition}">
            <div class="hero-grad"></div>
            <!-- Tag badge on image -->
            <div class="absolute bottom-3 left-4 z-10">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider text-white border border-white/25"
                style="background:rgba(15,46,89,0.6);backdrop-filter:blur(8px);">
                ${data.tag}
              </span>
            </div>
          </div>

          <!-- Article content -->
          <div style="padding:20px 22px 28px;">

            <!-- Meta -->
            <p class="text-[11px] text-slate-400 font-medium mb-2.5">${data.date} &middot; ${data.author}</p>

            <!-- Title -->
            <h2 style="font-size:17px;font-weight:800;color:#0f172a;line-height:1.35;letter-spacing:-0.01em;margin-bottom:14px;">${data.title}</h2>

            <!-- Divider -->
            <div style="height:1px;background:linear-gradient(to right,rgba(15,46,89,0.2),rgba(203,213,225,0.5),transparent);margin-bottom:14px;"></div>

            <!-- Body text -->
            <div style="font-size:13.5px;color:#475569;line-height:1.75;">
              ${data.content}
            </div>

          </div>
        `;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // Re-init lucide icons inside modal
        if (window.lucide) window.lucide.createIcons();
        modalContent.scrollTop = 0;
      }
    });
  });

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('article-modal-backdrop')) {
        closeModal();
      }
    });
  }
}

/* ----------------------------------------------------
   6. FORMULIR REGISTRASI DATABASE ALUMNI (GOOGLE APPS SCRIPT + SHEETS)
---------------------------------------------------- */
// Tempel URL Web App Google Apps Script (/exec) dari GoogleAppsScript_DatabaseAlumniBackend.js di sini:
const ALUMNI_DB_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdiYcLxDtRcussP-J11bhsN8wJXH06pWWoLBGvFyx_NO3zgaSp_uw0YwniFNk1cq4/exec';

function initRegistrationForm() {
  const form = document.getElementById('alumni-reg-form');
  const toast = document.getElementById('reg-toast');
  const statsCount = document.getElementById('total-registered-counter');
  const submitBtn = document.getElementById('reg-submit-btn');
  const submitLabel = document.getElementById('reg-submit-label');
  const submitSpinner = document.getElementById('reg-submit-spinner');
  const statusBanner = document.getElementById('reg-status-banner');
  const defaultSubmitText = submitLabel ? submitLabel.textContent.trim() : 'Simpan Data';

  const savedData = JSON.parse(localStorage.getItem('ikapmi_alumni_db') || '[]');
  const baseCount = 696;
  if (statsCount) {
    statsCount.textContent = (baseCount + savedData.length).toString();
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    if (submitSpinner) {
      submitSpinner.classList.toggle('hidden', !isSubmitting);
    }
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? 'Menyimpan Data...' : defaultSubmitText;
    }
  }

  function syncSelectPlaceholder(selectEl) {
    if (!selectEl) return;
    const isEmpty = !selectEl.value;
    selectEl.classList.toggle('is-placeholder', isEmpty);
  }

  function clearFieldError(el) {
    if (!el) return;
    el.classList.remove('field-invalid');
    el.removeAttribute('aria-invalid');
    const errEl = document.getElementById(`err-${el.id}`);
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }
  }

  function setFieldError(el, message) {
    if (!el) return;
    el.classList.add('field-invalid');
    el.setAttribute('aria-invalid', 'true');
    const errEl = document.getElementById(`err-${el.id}`);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
    }
  }

  function focusInvalidField(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showStatusBanner(message, type) {
    if (!statusBanner) return;
    statusBanner.classList.remove(
      'hidden',
      'bg-emerald-50', 'border-emerald-200', 'text-emerald-900',
      'bg-amber-50', 'border-amber-200', 'text-amber-900',
      'bg-rose-50', 'border-rose-200', 'text-rose-900'
    );
    if (type === 'success') {
      statusBanner.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-900');
    } else if (type === 'warning') {
      statusBanner.classList.add('bg-amber-50', 'border-amber-200', 'text-amber-900');
    } else {
      statusBanner.classList.add('bg-rose-50', 'border-rose-200', 'text-rose-900');
    }
    statusBanner.textContent = message;
  }

  function saveLocalBackup(entry) {
    savedData.push(entry);
    localStorage.setItem('ikapmi_alumni_db', JSON.stringify(savedData));
    if (statsCount) {
      statsCount.textContent = (baseCount + savedData.length).toString();
    }
  }

  if (form) {
    // Enable custom SaaS inline validation while keeping semantic required attributes intact
    form.noValidate = true;

    const namaInput = document.getElementById('reg-nama');
    const angkatanInput = document.getElementById('reg-angkatan');
    const waInput = document.getElementById('reg-wa');
    const kampusInput = document.getElementById('reg-kampus');
    const jurusanInput = document.getElementById('reg-jurusan');
    const statusInput = document.getElementById('reg-status');
    const domisiliInput = document.getElementById('reg-domisili');

    const trackedControls = [namaInput, angkatanInput, waInput, domisiliInput, kampusInput, jurusanInput, statusInput];
    trackedControls.forEach(ctrl => {
      if (!ctrl) return;
      if (ctrl.tagName === 'SELECT') {
        syncSelectPlaceholder(ctrl);
        ctrl.addEventListener('change', () => {
          syncSelectPlaceholder(ctrl);
          clearFieldError(ctrl);
        });
      } else {
        ctrl.addEventListener('input', () => clearFieldError(ctrl));
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      trackedControls.forEach(clearFieldError);
      if (statusBanner) statusBanner.classList.add('hidden');

      const nama = namaInput.value.trim();
      const angkatan = angkatanInput.value.trim();
      const whatsapp = waInput.value.trim();
      const kampus = kampusInput.value.trim();
      const jurusan = jurusanInput.value.trim();
      const status = statusInput.value;
      const domisili = domisiliInput.value.trim();

      const missingFields = [];
      if (!nama) {
        setFieldError(namaInput, 'Mohon isi nama lengkap atau panggilan Anda.');
        missingFields.push(namaInput);
      }
      if (!angkatan) {
        setFieldError(angkatanInput, 'Mohon isi angkatan atau tahun lulus PMUQI.');
        missingFields.push(angkatanInput);
      }
      if (!whatsapp) {
        setFieldError(waInput, 'Mohon isi nomor WhatsApp aktif Anda.');
        missingFields.push(waInput);
      }
      if (!kampus) {
        setFieldError(kampusInput, 'Mohon pilih kampus atau instansi saat ini.');
        missingFields.push(kampusInput);
      }

      if (missingFields.length > 0) {
        const errMsg = 'Mohon lengkapi nama, angkatan, nomor WhatsApp, dan kampus Anda.';
        showStatusBanner(errMsg, 'error');
        focusInvalidField(missingFields[0]);
        return;
      }

      const cleanedDigits = whatsapp.replace(/\D/g, '');
      if (cleanedDigits.length < 9 || cleanedDigits.length > 16) {
        const waErr = 'Nomor WhatsApp tampak kurang tepat. Mohon periksa kembali (contoh: 081234567890).';
        setFieldError(waInput, 'Gunakan 9–16 digit angka (contoh: 081234567890).');
        showStatusBanner(waErr, 'error');
        focusInvalidField(waInput);
        return;
      }

      const newEntry = {
        id: Date.now(),
        nama,
        angkatan,
        whatsapp,
        kampus,
        jurusan,
        status,
        domisili,
        registeredAt: new Date().toISOString()
      };

      const hasCloudUrl = ALUMNI_DB_SCRIPT_URL && ALUMNI_DB_SCRIPT_URL.startsWith('http');

      if (!hasCloudUrl) {
        saveLocalBackup(newEntry);
        form.reset();
        syncSelectPlaceholder(kampusInput);
        const localNotice = `Data ${nama} tersimpan sementara di browser ini. Tempel URL Google Apps Script di js/app.js agar otomatis terkirim ke Google Sheets.`;
        showStatusBanner(localNotice, 'warning');
        showToast(localNotice, 'warning');
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch(ALUMNI_DB_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(newEntry)
        });

        const result = await response.json();
        if (!response.ok || result.status !== 'success') {
          throw new Error(result.message || 'Server mengembalikan status gagal.');
        }

        saveLocalBackup(newEntry);
        form.reset();
        syncSelectPlaceholder(kampusInput);
        const successMsg = `Alhamdulillah! Syukran ${nama}, data alumni Anda berhasil tersimpan ke Database Resmi IKAPMI Regional Bandung.`;
        showStatusBanner(successMsg, 'success');
        showToast(successMsg, 'success');
      } catch (err) {
        const failMsg = 'Gagal mengirim data ke Google Sheets. Periksa koneksi internet Anda lalu klik Simpan Data kembali.';
        showStatusBanner(failMsg, 'error');
        showToast(failMsg, 'error');
        console.warn('Alumni registration submit error:', err);
      } finally {
        setSubmitting(false);
      }
    });
  }

  let toastTimer = null;
  let toastHideTimer = null;
  function hideToast() {
    if (!toast) return;
    toast.classList.add('translate-y-8', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => toast.classList.add('hidden'), 300);
  }

  if (toast) {
    toast.addEventListener('click', hideToast);
  }

  function showToast(message, type = 'success') {
    if (!toast) return;
    const toastMsg = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.innerHTML = type === 'success' ? '✓' : '⚠️';
      toastIcon.className = `toast-icon w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${type === 'success' ? 'bg-[#0f2e59] text-white' : 'bg-amber-500 text-white'}`;
    }

    if (toastHideTimer) clearTimeout(toastHideTimer);
    toast.classList.remove('hidden', 'translate-y-8', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }
}

/* ----------------------------------------------------
   7. SCROLL OBSERVER REVEAL
---------------------------------------------------- */
function initScrollAnimations() {
  // Generic reveal-on-scroll elements
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-6');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.remove('opacity-0', 'translate-y-6'));
  }

  // Warta section scroll-reveal
  const wartaEls = document.querySelectorAll('.warta-reveal');
  if ('IntersectionObserver' in window) {
    const wartaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          wartaObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    wartaEls.forEach(el => wartaObserver.observe(el));
  } else {
    wartaEls.forEach(el => el.classList.add('is-visible'));
  }
}

/* ----------------------------------------------------
   ORGANIZATION FILTER (BPH vs KETUA BIDANG)
---------------------------------------------------- */
function initOrgFilter() {
  const filterBtns = document.querySelectorAll('.org-filter-btn');
  const orgGroups = document.querySelectorAll('.org-group');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-brand-700', 'text-white');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('bg-brand-700', 'text-white');
      btn.classList.remove('text-slate-600');

      const target = btn.getAttribute('data-org');

      orgGroups.forEach(group => {
        const groupType = group.getAttribute('data-group');
        if (target === 'all' || groupType === target) {
          group.classList.remove('hidden');
          group.classList.add('block');
        } else {
          group.classList.add('hidden');
          group.classList.remove('block');
        }
      });
    });
  });
}


/* ----------------------------------------------------
   HERO 3D INTERACTIVE GLOSSY CARD (TILT & SPECULAR GLARE)
---------------------------------------------------- */
function initHeroInteractiveCard() {
  const container = document.getElementById('hero-logo-container') || document.getElementById('hero-card-container');
  const card = document.getElementById('hero-interactive-logo') || document.getElementById('hero-interactive-card');
  if (!container || !card) return;

  const restingRotX = 6;
  const restingRotY = -10;
  const restingRotZ = -1.5;

  let currentRotX = restingRotX;
  let currentRotY = restingRotY;
  let targetRotX = restingRotX;
  let targetRotY = restingRotY;
  let isHovered = false;
  let rafId = null;

  function handlePointerMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalized coordinates from -1 to 1
    const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));

    // Interactive 3D tilt response (responsive skew + parallax)
    targetRotY = restingRotY + normX * 15;
    targetRotX = restingRotX - normY * 13;

    // Specular glare position (percentage coordinates)
    const pctX = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    const pctY = Math.round(Math.max(0, Math.min(100, (y / rect.height) * 100)));
    card.style.setProperty('--mouse-x', `${pctX}%`);
    card.style.setProperty('--mouse-y', `${pctY}%`);
    card.style.setProperty('--glare-opacity', '0.9');

    isHovered = true;
    if (!rafId) {
      rafId = requestAnimationFrame(updateCardTransform);
    }
  }

  function handlePointerLeave() {
    isHovered = false;
    targetRotX = restingRotX;
    targetRotY = restingRotY;
    card.style.setProperty('--glare-opacity', '0.55');
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    if (!rafId) {
      rafId = requestAnimationFrame(updateCardTransform);
    }
  }

  function updateCardTransform() {
    const ease = isHovered ? 0.12 : 0.08;
    currentRotX += (targetRotX - currentRotX) * ease;
    currentRotY += (targetRotY - currentRotY) * ease;

    const scale = isHovered ? 1.025 : 1.0;
    card.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) rotateZ(${restingRotZ}deg) scale3d(${scale}, ${scale}, ${scale})`;

    if (Math.abs(targetRotX - currentRotX) > 0.03 || Math.abs(targetRotY - currentRotY) > 0.03 || isHovered) {
      rafId = requestAnimationFrame(updateCardTransform);
    } else {
      card.style.transform = `perspective(1000px) rotateX(${restingRotX}deg) rotateY(${restingRotY}deg) rotateZ(${restingRotZ}deg) scale3d(1, 1, 1)`;
      rafId = null;
    }
  }

  container.addEventListener('pointermove', handlePointerMove);
  container.addEventListener('pointerenter', () => { 
    isHovered = true;
    card.style.setProperty('--glare-opacity', '0.9');
  });
  container.addEventListener('pointerleave', handlePointerLeave);

  // Smooth touch support for mobile & tablet
  container.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }, { passive: true });
  container.addEventListener('touchend', handlePointerLeave);
}


/* ----------------------------------------------------
   JALUR MASUK KAMPUS INTERACTIVE SELECTOR & DETAIL
---------------------------------------------------- */
const CAMPUS_JALUR_DATA = {
  "uin": {
    "id": "uin",
    "num": "01",
    "name": "UIN Sunan Gunung Djati",
    "short": "UIN SGD",
    "badge": "PTKIN Unggulan",
    "dotColor": "bg-emerald-500",
    "badgeClass": "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    "accentGradient": "from-emerald-500 via-teal-400 to-emerald-600",
    "logo": "assets/logos/logo_uin.png",
    "location": "Cibiru & Gedebage, Bandung",
    "shortDesc": "Basis santri PMUQI terbesar dengan jurusan keagamaan terlengkap, fakultas sains & teknologi, serta jalur beasiswa hafiz Quran.",
    "fullDesc": "UIN Sunan Gunung Djati Bandung merupakan basis utama alumni santri Ummul Quro Al-Islami di wilayah Bandung. Memiliki 9 fakultas termasuk Ushuluddin, Syariah, Tarbiyah, Dakwah, Saintek, dan Psikologi dengan kuota penerimaan jalur keagamaan dan beasiswa tahfidz yang sangat ramah santri.",
    "portal": "https://pmb.uinsgd.ac.id",
    "pathways": [
      {
        "name": "SPAN-PTKIN",
        "tag": "Prestasi Rapor Nasional (Kemenag)",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Januari – Maret",
        "desc": "Seleksi prestasi akademik nasional berbasis nilai rapor semester 1–5 dan portofolio prestasi tanpa tes tertulis. Pendaftaran dilakukan oleh pihak madrasah/sekolah dan bebas biaya (100% Gratis).",
        "santriNote": "Jalur paling favorit bagi santri MA/SMA PMUQI. Kuota sangat besar pada prodi rumpun Ushuluddin, Syariah, Tarbiyah, Dakwah, dan Adab.",
        "link": "https://span.ptkin.ac.id"
      },
      {
        "name": "UM-PTKIN",
        "tag": "Ujian SSE Nasional (Kemenag)",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "April – Juni",
        "desc": "Ujian seleksi serentak nasional menggunakan Sistem Seleksi Elektronik (SSE). Materi meliputi Penalaran Akademik, Penalaran Matematika, Literasi Membaca (Indonesia, Arab, Inggris), dan Literasi Ajaran Islam.",
        "santriNote": "Sangat menguntungkan bagi santri yang menguasai literasi keislaman dan dasar bahasa Arab. Dapat memilih hingga 3 prodi di PTKIN mana pun se-Indonesia.",
        "link": "https://um.ptkin.ac.id"
      },
      {
        "name": "SNBP & SNBT (SNPMB)",
        "tag": "Seleksi Nasional (SNPMB)",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Februari – Mei",
        "desc": "Jalur seleksi nasional SNPMB (Kemdiktisaintek) untuk program studi umum di UIN SGD Bandung seperti Teknik Informatika, Biologi, Kimia, Agroteknologi, dan Psikologi.",
        "santriNote": "Cocok bagi santri lulusan IPA/IPS yang mengincar fakultas sains dan teknologi berakreditasi unggul dengan biaya kuliah UKT ramah kantong.",
        "link": "https://snpmb.id"
      },
      {
        "name": "Jalur Mandiri UIN SGD (CBT & Tahfidz)",
        "tag": "Mandiri Lokal & Beasiswa",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Mei – Juli",
        "desc": "Seleksi mandiri lokal UIN Bandung melalui ujian komputer CBT serta jalur prestasi khusus (Hafiz Al-Qur'an dan Juara MTQ/Keagamaan).",
        "santriNote": "Jalur Emas Penghafal Qur'an: Santri hafiz minimal 5, 10, hingga 30 juz berpeluang bebas tes, prioritas kelulusan, serta peluang beasiswa tahfidz.",
        "link": "https://pmb.uinsgd.ac.id"
      }
    ]
  },
  "unpad": {
    "id": "unpad",
    "num": "02",
    "name": "Universitas Padjadjaran (UNPAD)",
    "short": "UNPAD",
    "badge": "PTN-BH Favorit",
    "dotColor": "bg-blue-500",
    "badgeClass": "bg-blue-50 text-blue-800 border-blue-200/80",
    "accentGradient": "from-blue-600 via-indigo-500 to-sky-500",
    "logo": "assets/logos/logo_unpad.svg",
    "location": "Jatinangor & Dipatiukur, Bandung",
    "shortDesc": "Kuat di bidang kedokteran, hukum, ilmu komunikasi, ekonomi bisnis, dan ilmu budaya dengan jejaring alumni kuat.",
    "fullDesc": "Universitas Padjadjaran adalah salah satu perguruan tinggi negeri berbadan hukum terkemuka di Indonesia. Santri PMUQI tersebar di berbagai fakultas unggulan dengan dukungan bimbingan seleksi dan mentoring akademik dari alumni IKAPMI di UNPAD.",
    "portal": "https://smup.unpad.ac.id",
    "pathways": [
      {
        "name": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
        "tag": "Prestasi Rapor Nasional (SNPMB)",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Januari – Maret",
        "desc": "Penjaringan berdasarkan konsistensi nilai rapor semester 1–5 serta portofolio prestasi siswa eligible yang didaftarkan pihak sekolah/madrasah.",
        "santriNote": "Peluang strategis bagi santri berperingkat paralel atas di MA/SMA untuk menembus prodi favorit Unpad tanpa tes tertulis.",
        "link": "https://snpmb.id"
      },
      {
        "name": "SNBT (Seleksi Nasional Berbasis Tes UTBK)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei",
        "desc": "Seleksi berbasis ujian tertulis UTBK nasional (Tes Potensi Skolastik, Literasi Bahasa, dan Penalaran Matematika). Memiliki porsi kuota terbesar (~40-50%).",
        "santriNote": "IKAPMI UNPAD rutin mengadakan mentoring belajar, pembahasan soal skolastik, dan strategi pemilihan jurusan bagi adik-adik santri.",
        "link": "https://snpmb.id"
      },
      {
        "name": "SMUP Jalur Nilai Ujian (Nilai UTBK / Daring)",
        "tag": "Seleksi Mandiri SMUP",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "April – Juli",
        "desc": "Seleksi mandiri Unpad menggunakan skor sertifikat UTBK-SNBT atau ujian daring SMUP yang diselenggarakan secara online.",
        "santriNote": "Sangat fleksibel dan praktis bagi santri; pendaftar cukup mengunggah skor UTBK tanpa harus datang langsung ke lokasi ujian.",
        "link": "https://smup.unpad.ac.id"
      },
      {
        "name": "SMUP Jalur Minat Bakat & Tahfidz Al-Qur'an",
        "tag": "Mandiri Prestasi & Keagamaan",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Maret – Juni",
        "desc": "Seleksi mandiri bagi calon mahasiswa dengan prestasi luar biasa di bidang sains, olahraga, seni, serta Penghafal Al-Qur'an (Hafiz/Hafizah minimal 10–30 juz).",
        "santriNote": "Peluang emas bagi santri berprestasi tahfidz resmi. Peserta akan mengikuti uji verifikasi hafalan langsung di hadapan tim penguji Unpad.",
        "link": "https://smup.unpad.ac.id"
      }
    ]
  },
  "upi": {
    "id": "upi",
    "num": "03",
    "name": "Universitas Pendidikan Indonesia (UPI)",
    "short": "UPI",
    "badge": "PTN-BH Pendidikan & Riset",
    "dotColor": "bg-rose-500",
    "badgeClass": "bg-rose-50 text-rose-800 border-rose-200/80",
    "accentGradient": "from-rose-500 via-red-500 to-amber-500",
    "logo": "assets/logos/logo_upi.svg",
    "location": "Bumi Siliwangi (Setiabudi), Bandung",
    "shortDesc": "Rujukan utama calon pendidik profesional, studi bahasa arab & inggris, sains terapan, serta ilmu sosial humaniora.",
    "fullDesc": "Universitas Pendidikan Indonesia (UPI) merupakan pusat keunggulan pendidikan keguruan dan sains terapan nasional. Memiliki program studi favorit bagi santri seperti Pendidikan Bahasa Arab, PAI, serta rumpun MIPA dan teknologi informasi.",
    "portal": "https://pmb.upi.edu",
    "pathways": [
      {
        "name": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
        "tag": "Prestasi Rapor Nasional",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Januari – Maret",
        "desc": "Penjaringan calon mahasiswa berprestasi rapor dan portofolio untuk jenjang Sarjana (S1) dan Sarjana Terapan (D4) seluruh fakultas UPI.",
        "santriNote": "Pilihan tepat bagi santri berprestasi di MA/SMA untuk masuk prodi Pendidikan Bahasa Arab, PAI, Bahasa Inggris, atau jurusan sains.",
        "link": "https://snpmb.id"
      },
      {
        "name": "SNBT (Seleksi Nasional Berbasis Tes UTBK)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei",
        "desc": "Seleksi nasional dengan sistem tes skolastik, literasi bahasa, dan penalaran matematika terstandar untuk seluruh program studi di UPI.",
        "santriNote": "Tersedia kuota luas di kampus utama Bumi Siliwangi Setiabudi maupun kampus daerah (Cibiru, Purwakarta, Sumedang, Tasikmalaya).",
        "link": "https://snpmb.id"
      },
      {
        "name": "Seleksi Mandiri Reguler (SM-UPI CBT)",
        "tag": "Ujian Komputer Mandiri",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Mei – Juli",
        "desc": "Ujian seleksi mandiri berbasis komputer yang diselenggarakan secara independen oleh UPI untuk menguji potensi akademik dan bakat calon mahasiswa.",
        "santriNote": "Alternatif utama jika belum lolos jalur nasional dengan kuota mandiri yang cukup besar di kampus Bandung.",
        "link": "https://pmb.upi.edu"
      },
      {
        "name": "SM-PI UPI (Prestasi Istimewa & Tahfidz Quran)",
        "tag": "Mandiri Portofolio Khusus",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Mei – Juni",
        "desc": "Jalur undangan mandiri bagi siswa berprestasi kejuaraan tingkat nasional/internasional serta Hafiz Al-Qur'an minimal 15–30 juz.",
        "santriNote": "Santri penghafal Al-Qur'an mendapatkan penilaian afirmasi khusus melalui uji kelayakan hafalan oleh tim penguji UPI.",
        "link": "https://pmb.upi.edu"
      }
    ]
  },
  "itb": {
    "id": "itb",
    "num": "04",
    "name": "Institut Teknologi Bandung (ITB)",
    "short": "ITB",
    "badge": "PTN-BH Sains & Rekayasa",
    "dotColor": "bg-indigo-600",
    "badgeClass": "bg-slate-100 text-slate-800 border-slate-300",
    "accentGradient": "from-slate-800 via-blue-900 to-indigo-800",
    "logo": "assets/logos/logo_itb.png",
    "location": "Ganesha, Jatinangor, & Cirebon",
    "shortDesc": "Institusi teknologi dan rekayasa terkemuka dengan reputasi global untuk sains, informatika, industri, dan seni desain.",
    "fullDesc": "Institut Teknologi Bandung mencetak insinyur, saintis, dan pemimpin industri berdaya saing global. Santri IKAPMI di ITB siap mendampingi adik-adik santri dalam strategi pemilihan fakultas dan persiapan adaptasi TPB (Tahap Persiapan Bersama).",
    "portal": "https://admission.itb.ac.id",
    "pathways": [
      {
        "name": "SNBP & SNBP-Peminatan ITB",
        "tag": "Prestasi Rapor & Peminatan",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Januari – Februari",
        "desc": "Seleksi prestasi akademik nilai rapor matematika dan sains. ITB membuka opsi peminatan untuk langsung memilih program studi spesifik.",
        "santriNote": "Peluang besar bagi santri jurusan IPA berprestasi konsisten dan aktif di olimpiade sains/riset madrasah.",
        "link": "https://admission.itb.ac.id"
      },
      {
        "name": "SNBT (Seleksi Nasional Berbasis Tes UTBK)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei",
        "desc": "Seleksi UTBK terpusat untuk memperebutkan kursi di fakultas bergengsi ITB (STEI, FTMD, FTTM, FMIPA, SBM, SAPPK, FTSL, FSRD).",
        "santriNote": "IKAPMI ITB siap memberikan arahan pemilihan fakultas serta sharing pengalaman belajar kurikulum TPB ITB.",
        "link": "https://snpmb.id"
      },
      {
        "name": "Seleksi Siswa Unggul (SSU) ITB",
        "tag": "Jalur Mandiri (Pengganti SM-ITB)",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "April – Juni",
        "desc": "Sejak penerimaan 2026/2027, Seleksi Mandiri ITB (SM-ITB) diubah menjadi SSU ITB. Tersedia jalur non-tes (nilai rapor, nilai UTBK, peserta Olimpiade Sains, atau talenta seni/olahraga/keagamaan) dan jalur tes daring.",
        "santriNote": "Kategori talenta keagamaan membuka peluang bagi santri berprestasi. Cek syarat, kuota, dan biaya terbaru di laman resmi SSU ITB.",
        "link": "https://admission.itb.ac.id/id/program/sarjana/seleksi-siswa-unggul-itb"
      },
      {
        "name": "International Undergraduate Program (IUP ITB)",
        "tag": "Kelas Internasional",
        "tagClass": "bg-purple-100 text-purple-800 border-purple-200",
        "schedule": "Januari – Juni",
        "desc": "Program sarjana internasional berbahasa Inggris dengan kesempatan exchange semester dan dual degree di universitas mitra luar negeri.",
        "santriNote": "Sangat direkomendasikan bagi santri yang memiliki kemampuan komunikasi bahasa Inggris aktif dan orientasi karier internasional.",
        "link": "https://admission.itb.ac.id/iup"
      }
    ]
  },
  "telkom": {
    "id": "telkom",
    "num": "05",
    "name": "Telkom University (Tel-U)",
    "short": "Tel-U",
    "badge": "PTS Terbaik Nasional",
    "dotColor": "bg-red-500",
    "badgeClass": "bg-red-50 text-red-800 border-red-200/80",
    "accentGradient": "from-red-600 via-rose-500 to-orange-500",
    "logo": "assets/logos/logo_telkom.png",
    "location": "Dayeuhkolot, Bandung Selatan",
    "shortDesc": "Pusat inovasi teknologi digital, informatika, bisnis digital, dan desain kreatif dengan beasiswa keagamaan.",
    "fullDesc": "Telkom University merupakan perguruan tinggi swasta peringkat #1 di Indonesia yang bernaung di bawah Yayasan Pendidikan Telkom. Memiliki fasilitas riset mutakhir, jalur rapor tanpa tes, serta skema beasiswa penuh bagi penghafal Al-Qur'an.",
    "portal": "https://smb.telkomuniversity.ac.id",
    "pathways": [
      {
        "name": "Jalur Prestasi Akademik (JPA Rapor)",
        "tag": "Seleksi Rapor Tanpa Tes",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Agustus – Februari",
        "desc": "Seleksi berbasis nilai rapor semester 1–5 tanpa tes tertulis. Pendaftaran gelombang awal menawarkan diskon biaya uang sumbangan (SDP2).",
        "santriNote": "Rapor madrasah/pesantren diakui penuh dengan pengumuman online cepat tanpa perlu datang ke Bandung.",
        "link": "https://smb.telkomuniversity.ac.id"
      },
      {
        "name": "Jalur CBT / Online Test Mandiri",
        "tag": "Tes Komputer Daring",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Setiap Bulan (Fleksibel)",
        "desc": "Ujian online fleksibel dari tempat masing-masing menggunakan laptop/ponsel kapan saja sesuai jadwal yang dipilih pendaftar.",
        "santriNote": "Sangat praktis bagi santri yang masih mukim di pondok pesantren karena tidak perlu bepergian keluar kampus pondok.",
        "link": "https://smb.telkomuniversity.ac.id"
      },
      {
        "name": "Beasiswa Keagamaan & Tahfidz Quran (OPaN)",
        "tag": "Beasiswa Kuliah 100% Penuh",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Februari – April",
        "desc": "Program beasiswa bergengsi bagi calon mahasiswa berprestasi keagamaan dan hafiz Al-Qur'an (minimal 5 hingga 30 juz).",
        "santriNote": "Memperoleh pembebasan biaya kuliah (BPP) hingga 100% sampai lulus serta pembinaan karakter di asrama kampus.",
        "link": "https://smb.telkomuniversity.ac.id"
      },
      {
        "name": "Jalur Vokasi & Kemitraan Digital",
        "tag": "Program Terapan Industri",
        "tagClass": "bg-cyan-100 text-cyan-800 border-cyan-200",
        "schedule": "Maret – Juli",
        "desc": "Seleksi program Diploma (D3) dan Sarjana Terapan (D4) dengan kurikulum link-and-match industri teknologi Telkom Group.",
        "santriNote": "Menghasilkan lulusan yang siap kerja dengan portofolio teknologi dan sertifikasi industri internasional.",
        "link": "https://smb.telkomuniversity.ac.id"
      }
    ]
  },
  "unisba-polban": {
    "id": "unisba-polban",
    "num": "06",
    "name": "UNISBA, UNPAS & POLBAN",
    "short": "Politeknik & Swasta",
    "badge": "Politeknik Negeri & PTS Favorit",
    "dotColor": "bg-purple-500",
    "badgeClass": "bg-purple-50 text-purple-800 border-purple-200/80",
    "accentGradient": "from-purple-600 via-indigo-600 to-blue-600",
    "logo": "assets/logos/logo_unisba.png",
    "location": "Tamansari, Lengkong, & Ciwaruga Bandung",
    "shortDesc": "Pilihan favorit santri untuk pendidikan vokasi terapan negeri (POLBAN), kedokteran & hukum islam (UNISBA), dan pasundan (UNPAS).",
    "fullDesc": "Gabungan santri di Politeknik Negeri Bandung (POLBAN) serta kampus swasta unggulan Bandung seperti Universitas Islam Bandung (UNISBA) dan Universitas Pasundan (UNPAS) dengan jalur masuk ramah nilai rapor dan beasiswa hafiz.",
    "portal": "https://pmb.unisba.ac.id",
    "pathways": [
      {
        "name": "POLBAN: SNBP, SNBT & SMBM (Politeknik Negeri)",
        "tag": "Politeknik Terapan Unggulan",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Januari – Juni",
        "desc": "Seleksi nasional SNBP, SNBT, dan Seleksi Mandiri Bersama Politeknik Negeri (SMBM) untuk jurusan Teknik Rekayasa & Tata Niaga.",
        "santriNote": "Pilihan nomor 1 bagi santri yang menghendaki pendidikan aplikatif dengan laboratorium modern dan UKT negeri terjangkau.",
        "link": "https://smb.polban.ac.id"
      },
      {
        "name": "UNISBA: PMDK (Rapor) & USM Daring (Unisba)",
        "tag": "PTS Bernafaskan Islam",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "November – Juli",
        "desc": "Penjaringan Minat dan Kemampuan (PMDK) berbasis rapor serta Ujian Saringan Masuk (USM) berkala untuk seluruh fakultas termasuk Kedokteran.",
        "santriNote": "Kultur kampus sangat akrab dengan santri (Ruhul Islam). Tersedia Beasiswa Hafiz Al-Qur'an dan kemudahan konversi prestasi pesantren.",
        "link": "https://pmb.unisba.ac.id"
      },
      {
        "name": "UNPAS: Jalur PMDK & Tes Gelombang 1-3",
        "tag": "Universitas Pasundan",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Desember – Agustus",
        "desc": "Jalur PMDK rapor bebas tes dan ujian tertulis bertahap dengan fleksibilitas cicilan biaya kuliah serta program studi favorit.",
        "santriNote": "Pilihan favorit santri untuk Fakultas Hukum, FISIP (Hubungan Internasional & Humas), Kedokteran, dan Teknik Industri.",
        "link": "https://pmb.unpas.ac.id"
      }
    ]
  },
  "widyatama": {
    "id": "widyatama",
    "num": "07",
    "name": "Universitas Widyatama (UTama)",
    "short": "Widyatama",
    "badge": "PTS Akreditasi Unggul",
    "dotColor": "bg-amber-500",
    "badgeClass": "bg-amber-50 text-amber-800 border-amber-200/80",
    "accentGradient": "from-amber-500 via-orange-500 to-amber-600",
    "logo": "assets/logos/logo_widyatama.png?v=2",
    "location": "Jl. Cikutra No. 204A, Bandung",
    "shortDesc": "Kampus unggul di Cikutra Bandung dengan jenjang D3, D4, & S1 bidang Ekonomi, Teknik, Bahasa, dan DKV serta 15 skema beasiswa.",
    "fullDesc": "Universitas Widyatama (UTama) beralamat di Jl. Cikutra No. 204A, Bandung 40125. Menyediakan program D3, Sarjana Terapan (D4), dan Sarjana (S1) pada Fakultas Ekonomi & Bisnis, Teknik, Bahasa, Ilmu Sosial & Politik, serta Desain Komunikasi Visual dengan fitur Kalkulator Jalur & Beasiswa resmi di pmb.widyatama.ac.id.",
    "portal": "https://pmb.widyatama.ac.id",
    "pathways": [
      {
        "name": "Jalur Beasiswa PMDK (Rapor / UTBK)",
        "tag": "Seleksi Rapor Tanpa Tes",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Maret – April",
        "desc": "Seleksi tanpa tes tertulis berdasarkan nilai rapor semester 1–4 (rata-rata min. 70 untuk D3/D4, min. 75 untuk S1), skor UTBK min. 450, atau USM-CBT (450 D3/D4, 500 S1). Menawarkan potongan Uang Pembangunan 75% (D3) dan 25% (D4/S1).",
        "santriNote": "Rapor MA/SMA PMUQI diakui penuh. Tersedia simulasi Kalkulator Jalur & Beasiswa langsung di portal pmb.widyatama.ac.id.",
        "link": "https://pmb.widyatama.ac.id"
      },
      {
        "name": "Jalur Reguler (Rapor / USM-CBT / UTBK)",
        "tag": "Penerimaan Utama Fleksibel",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "September – Agustus",
        "desc": "Skema penerimaan utama sepanjang tahun ajaran untuk jenjang D3, D4, dan S1 melalui seleksi nilai rapor (min. 65 D3/D4, 70 S1), UTBK (min. 400), tes USM-CBT online, atau nilai UM-PTN.",
        "santriNote": "Jadwal fleksibel dari awal tahun hingga Agustus sehingga aman dijadikan pilihan strategis maupun opsi cadangan PTN.",
        "link": "https://pmb.widyatama.ac.id"
      },
      {
        "name": "Jalur Beasiswa UTama, Prioritas & Unggulan",
        "tag": "Beasiswa Prestasi Akademik",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Gelombang Awal – Pertengahan",
        "desc": "Tiga tingkatan beasiswa prestasi akademik unggulan dari Universitas Widyatama berupa keringanan hingga pembebasan penuh Uang Pembangunan & Uang Kuliah Tetap bagi peraih skor seleksi tertinggi.",
        "santriNote": "Daftar di gelombang awal untuk peluang kuota beasiswa Prioritas & Unggulan lebih besar.",
        "link": "https://pmb.widyatama.ac.id"
      },
      {
        "name": "Jalur Beasiswa Khusus (Tahfidz & Kejuaraan)",
        "tag": "Afirmasi Prestasi & Santri",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Sesuai Kuota PMB",
        "desc": "Mencakup sekitar 15 skema beasiswa/keringanan biaya seperti prestasi kejuaraan akademik/non-akademik, hafalan Al-Qur'an (Tahfidz), jalur afirmasi/sosial, anak guru/dosen/ASN, hingga mitra institusi.",
        "santriNote": "Santri PMUQI berprestasi tahfidz maupun kejuaraan MTQ/lomba keagamaan dapat melampirkan sertifikat resmi saat mendaftar.",
        "link": "https://pmb.widyatama.ac.id"
      }
    ]
  },
  "utb": {
    "id": "utb",
    "num": "08",
    "name": "Universitas Teknologi Bandung (UTB)",
    "short": "UTB",
    "badge": "PTS Teknologi & Kreatif",
    "dotColor": "bg-emerald-600",
    "badgeClass": "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    "accentGradient": "from-emerald-600 via-teal-500 to-sky-600",
    "logo": "assets/logos/logo_utb.png?v=2",
    "location": "Jl. Soekarno-Hatta No. 376–378, Bandung",
    "shortDesc": "Transformasi STT Bandung untuk Teknik Informatika, Industri, DKV, Bisnis Digital, & Manajemen Ritel dengan KIP Kuliah dan beasiswa rapor.",
    "fullDesc": "Universitas Teknologi Bandung (UTB) berlokasi di Jl. Soekarno-Hatta No. 376–378, Kebon Lega, Bojongloa Kidul, Bandung 40235. Menaungi Fakultas Industri Kreatif (Teknik Informatika, Teknik Industri, DKV) dan Fakultas Ekonomi & Bisnis (Bisnis Digital, Manajemen Ritel) dengan pilihan Kelas Reguler, Kelas Malam/Karyawan, Hybrid, serta program KIP Kuliah.",
    "portal": "https://pmb.utb-univ.ac.id/",
    "pathways": [
      {
        "name": "Jalur Beasiswa Prestasi & Rapor",
        "tag": "Seleksi Rapor Tanpa Tes",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Gelombang Berjalan",
        "desc": "Bebas tes masuk dan potongan SPP per semester hingga dana pengembangan bagi lulusan SMA/SMK/MA dengan rata-rata rapor ≥ 85, peringkat 1–10 kelas, atau prestasi kejuaraan olahraga, seni, dan keagamaan.",
        "santriNote": "Sertifikat prestasi lomba keagamaan di pesantren maupun peringkat rapor MA/SMA dapat diajukan untuk keringanan biaya.",
        "link": "https://www.utb-univ.ac.id/pendaftaran/beasiswa"
      },
      {
        "name": "Beasiswa Full Kuliah 4 Tahun UTB",
        "tag": "Beasiswa Penuh 4 Tahun",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Periode PMB",
        "desc": "Program beasiswa penuh selama masa studi S1 (4 tahun) bagi calon mahasiswa kelas reguler yang meraih peringkat 1–7 di kelas dengan nilai rapor ≥ 85 atau memiliki prestasi juara tingkat nasional.",
        "santriNote": "Kuota kompetitif — siapkan scan rapor semester 1–5 dan piagam resmi sejak gelombang pendaftaran dibuka.",
        "link": "https://www.utb-univ.ac.id/pendaftaran/beasiswa"
      },
      {
        "name": "Jalur PMDK & KIP Kuliah Merdeka",
        "tag": "Afirmasi & Bantuan Pemerintah",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Mengikuti Jadwal KIP & PMB",
        "desc": "Jalur Penelusuran Minat dan Bakat (rata-rata rapor ≥ 75, prestasi non-akademik, atau lampiran SKTM/DTKS) serta penyaluran Beasiswa KIP Kuliah pemerintah untuk kelas reguler pagi.",
        "santriNote": "Solusi terjangkau bagi santri perantau dari keluarga prasejahtera yang berminat kuliah IT, Bisnis Digital, atau DKV di Bandung.",
        "link": "https://www.utb-univ.ac.id/pendaftaran/beasiswa"
      },
      {
        "name": "Kelas Reguler, Hybrid & Rekognisi (RPL)",
        "tag": "Fleksibel & Kelas Karyawan",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Sepanjang Gelombang",
        "desc": "Pendaftaran online untuk Kelas Reguler Pagi, Kelas Malam/Karyawan (Blended Learning), serta jalur Rekognisi Pembelajaran Lampau (RPL) di 5 prodi unggulan UTB Bandung.",
        "santriNote": "Cocok bagi alumni yang berencana kuliah sambil bekerja atau merintis usaha digital di Bandung.",
        "link": "https://pmb.utb-univ.ac.id/"
      }
    ]
  },
  "umb": {
    "id": "umb",
    "num": "09",
    "name": "Universitas Muhammadiyah Bandung (UMB)",
    "short": "UM Bandung",
    "badge": "PTMA & Kampus Islami",
    "dotColor": "bg-sky-600",
    "badgeClass": "bg-sky-50 text-sky-900 border-sky-200/80",
    "accentGradient": "from-sky-700 via-blue-600 to-teal-500",
    "logo": "assets/logos/logo_umb.png?v=2",
    "location": "Jl. Soekarno-Hatta No. 752, Cipadung",
    "shortDesc": "Kampus Islami strategis dekat area Cibiru dengan Beasiswa Hafizh Al-Qur'an (5–30 juz), jalur rapor tanpa tes, dan kader Muhammadiyah.",
    "fullDesc": "Universitas Muhammadiyah Bandung (UM Bandung) berlokasi di Jl. Soekarno-Hatta No. 752, Cipadung Kidul, Kec. Panyileukan, Bandung 40614 (berdekatan dengan kawasan Cibiru). Memiliki program studi favorit seperti Farmasi, Bioteknologi, Teknik Informatika, Psikologi Islam, Ilmu Komunikasi, dan Ekonomi Syariah dengan skema Beasiswa Hafizh Al-Qur'an unggulan.",
    "portal": "https://pmb.umbandung.ac.id",
    "pathways": [
      {
        "name": "Beasiswa Hafizh Al-Qur'an (5 – 30 Juz)",
        "tag": "Beasiswa Tahfidz Santri",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Gelombang PMB",
        "desc": "Skema Beasiswa Parsial untuk hafalan minimal 5 Juz dan Beasiswa Penuh untuk hafalan ≥ 26 Juz. Syarat melampirkan fotokopi sertifikat/piagam tahfidz (maks. 2 tahun terakhir) serta surat rekomendasi pengajar atau lembaga tahfidz.",
        "santriNote": "Sangat direkomendasikan bagi santri tahfidz PMUQI. Lokasi kampus yang dekat Cibiru juga memudahkan silaturahmi dengan mayoritas pengurus IKAPMI.",
        "link": "https://pmb.umbandung.ac.id"
      },
      {
        "name": "Jalur Reguler: Prestasi Akademik (Rapor)",
        "tag": "Seleksi Rapor Tanpa Tes",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Gelombang I – III",
        "desc": "Seleksi berbasis rata-rata nilai rapor semester 1–5 (ketentuan umum rata-rata ≥ 75 dan rumpun IPA/Farmasi/Bioteknologi ≥ 80 dalam dokumen PDF) tanpa perlu ujian tertulis.",
        "santriNote": "Proses pendaftaran praktis dan 100% online dari pondok melalui dashboard pmb.umbandung.ac.id.",
        "link": "https://pmb.umbandung.ac.id"
      },
      {
        "name": "Jalur Undangan PTN & CBT Online",
        "tag": "Skor UTBK/UM & Tes Daring",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Gelombang Berjalan",
        "desc": "Jalur Undangan bagi pendaftar yang melampirkan kartu/skor SNBP, SNBT-UTBK, atau Ujian Mandiri PTN (maks. 2 tahun terakhir), serta Jalur CBT Computer Based Test daring dari PMB UMB.",
        "santriNote": "Skor SNBT/UM-PTKIN yang sudah dimiliki dapat langsung dimanfaatkan tanpa mengulang ujian.",
        "link": "https://pmb.umbandung.ac.id"
      },
      {
        "name": "Beasiswa Kader, Non-Akademik & PUTM",
        "tag": "Kader & Prestasi Lomba",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Gelombang PMB",
        "desc": "Mencakup Beasiswa Prestasi Non-Akademik (seni/olahraga/keagamaan dengan piagam maks. 2 tahun terakhir), Beasiswa Kader Muhammadiyah (KTA Ortom), hingga program PUTM dan Tokoh Muda.",
        "santriNote": "Lingkungan kampus bernuansa Islami modern dengan banyak UKM keagamaan dan kajian mahasiswa.",
        "link": "https://pmb.umbandung.ac.id"
      }
    ]
  },
  "unpar": {
    "id": "unpar",
    "num": "10",
    "name": "Universitas Katolik Parahyangan (UNPAR)",
    "short": "UNPAR",
    "badge": "PTS Unggul Ciumbuleuit",
    "dotColor": "bg-amber-600",
    "badgeClass": "bg-yellow-50 text-amber-900 border-amber-300/80",
    "accentGradient": "from-yellow-500 via-amber-500 to-emerald-600",
    "logo": "assets/logos/logo_unpar.png?v=2",
    "location": "Jl. Ciumbuleuit No. 94 & Jl. Merdeka",
    "shortDesc": "Unggul nasional di bidang Arsitektur, Hukum, HI, Ekonomi, & Kedokteran melalui jalur PMDK rapor, USM 1–4, nilai UTBK, dan Beasiswa Silih Asuh.",
    "fullDesc": "Universitas Katolik Parahyangan (UNPAR) berlokasi di Kampus Utama Jl. Ciumbuleuit No. 94, Bandung 40141 dan Jl. Merdeka No. 30 (Fakultas Kedokteran). Merupakan salah satu PTS tertua dan terbaik nasional untuk Arsitektur, Teknik Sipil, Hukum, Hubungan Internasional, Manajemen, dan Akuntansi.",
    "portal": "https://pmb.unpar.ac.id",
    "pathways": [
      {
        "name": "Jalur PMDK (Rapor Tanpa Tes)",
        "tag": "Prestasi Rapor Dini",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "September – Periode Awal",
        "desc": "Seleksi tanpa ujian tertulis menggunakan rekam jejak nilai rapor sekolah menengah dan sertifikat prestasi akademik maupun non-akademik untuk hingga 3 pilihan program studi.",
        "santriNote": "Jalur terbaik bagi santri dengan nilai rapor stabil sejak kelas 10–11 untuk mengunci kursi lebih awal.",
        "link": "https://pmb.unpar.ac.id"
      },
      {
        "name": "Ujian Saringan Masuk (USM Gelombang 1–4)",
        "tag": "Seleksi Mandiri Berkala",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Gelombang USM Sepanjang Tahun",
        "desc": "Ujian saringan masuk mandiri berbasis daring/komputer yang dibuka secara bertahap (USM 1 sampai USM 4 hingga pertengahan tahun), mencakup tes kemampuan akademik sesuai prodi tujuan.",
        "santriNote": "Tersedia beberapa kali gelombang USM sehingga santri bisa menyesuaikan waktu persiapan di akhir masa pondok.",
        "link": "https://pmb.unpar.ac.id"
      },
      {
        "name": "Jalur Nilai UTBK (Tanpa Tes Tambahan)",
        "tag": "Konversi Skor UTBK-SNBT",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Pasca Pengumuman UTBK",
        "desc": "Pendaftaran masuk UNPAR tanpa mengikuti ujian tertulis tambahan hanya dengan mengunggah sertifikat nilai hasil UTBK seleksi nasional di portal pmb.unpar.ac.id.",
        "santriNote": "Manfaatkan hasil UTBK-SNBT yang sudah diikuti tanpa perlu mengulang tes masuk dari awal.",
        "link": "https://pmb.unpar.ac.id"
      },
      {
        "name": "Beasiswa Silih Asuh, Project UNPAR & Sagraha",
        "tag": "Beasiswa Prestasi & Bantuan",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Dibuka Sesuai Gelombang PMB",
        "desc": "UNPAR menyediakan Beasiswa Silih Asuh (full cover bagi kondisi finansial terbatas), Beasiswa Sagraha (potongan UKPA 25%–100%), serta Beasiswa Project UNPAR (potongan UKPA 30%–70% bagi juara lomba I–III).",
        "santriNote": "Jejaring kost kawasan Ciumbuleuit, Cisitu, dan Dago mudah dijangkau dan berdekatan dengan komunitas mahasiswa IKAPMI wilayah utara.",
        "link": "https://pmb.unpar.ac.id"
      }
    ]
  },
  "binus": {
    "id": "binus",
    "num": "11",
    "name": "BINUS University @Bandung",
    "short": "BINUS",
    "badge": "Creative Tech Campus",
    "dotColor": "bg-sky-500",
    "badgeClass": "bg-cyan-50 text-cyan-900 border-cyan-200/80",
    "accentGradient": "from-sky-500 via-orange-400 to-cyan-600",
    "logo": "assets/logos/logo_binus.png?v=2",
    "location": "Paskal Hyper Square & Dago Pakar",
    "shortDesc": "Kampus Computer Science, DKV, Creativepreneurship, & Digital Business dengan seleksi TPKS online dan Widia Scholarship hingga 100%.",
    "fullDesc": "BINUS @Bandung mengusung konsep Creative Technology and Entrepreneurship Campus di Paskal Campus (Jl. Pasirkaliki No. 25–27, Paskal Hyper Square, Bandung 40181) serta Dago Campus (Dago Pakar). Menawarkan prodi S1 Computer Science, Creativepreneurship, Digital Business Innovation, DKV, Interior Design, Interactive Design & Technology, serta Digital Psychology.",
    "portal": "https://gabung.binus.ac.id",
    "pathways": [
      {
        "name": "Jalur Reguler (Unggah Rapor + TPKS Online)",
        "tag": "Tes Potensi Keberhasilan Studi",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Gelombang Periodik",
        "desc": "Pendaftaran dilakukan melalui gabung.binus.ac.id dengan mengunggah scan rapor kelas 10–11, lalu mengikuti tes online TPKS (Logika, Abstraksi Non-Verbal, dan Verbal) sesuai jadwal pilihan pendaftar.",
        "santriNote": "Seleksi TPKS dapat diikuti secara online dan hasilnya segera muncul di akun Gabung BINUS.",
        "link": "https://gabung.binus.ac.id/admission-procedure/?degree=s1&campus-location=binus-bandung"
      },
      {
        "name": "The Widia Scholarship for Outstanding Achievers",
        "tag": "Beasiswa Penuh 100% (Kuliah + DP3)",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Periode Beasiswa BINUS",
        "desc": "Program beasiswa penuh (bebas biaya kuliah dan sumbangan pembangunan/DP3 hingga lulus) bagi calon mahasiswa berprestasi tingkat nasional atau internasional di bidang akademik maupun non-akademik.",
        "santriNote": "Prestasi olimpiade sains, lomba IT, seni, maupun kejuaraan tingkat nasional menjadi nilai unggul utama.",
        "link": "https://gabung.binus.ac.id"
      },
      {
        "name": "Beasiswa Talent Scouting, Startech & OSIS",
        "tag": "Beasiswa Rapor & Aktivis",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Mengikuti Admission Calendar",
        "desc": "Beragam skema potongan biaya kuliah berdasarkan hasil rapor & TPKS, talenta teknologi (Startech), BINUSfluencer, pengurus OSIS/MPK (OSIS Scholarship), hingga BINUSIAN Community Scholarship.",
        "santriNote": "Aktif di kepengurusan organisasi santri/OSIS PMUQI dan portofolio teknologi berpeluang memperoleh potongan biaya kuliah.",
        "link": "https://gabung.binus.ac.id"
      },
      {
        "name": "Jalur Portofolio Industri Kreatif (DKV & Desain)",
        "tag": "Khusus Prodi Desain & Teknologi",
        "tagClass": "bg-cyan-100 text-cyan-800 border-cyan-200",
        "schedule": "Gelombang Periodik",
        "desc": "Seleksi khusus untuk peminat Visual Communication Design (DKV), Interior Design, dan Interactive Design & Technology di BINUS @Bandung menggunakan hasil TPKS dan penilaian karya/minat kreatif.",
        "santriNote": "Karya desain grafis, ilustrasi, atau proyek multimedia selama di pesantren bisa dirangkum menjadi portofolio resmi.",
        "link": "https://binus.ac.id/bandung/"
      }
    ]
  },
  "poltekpar-nhi": {
    "id": "poltekpar-nhi",
    "num": "12",
    "name": "Poltekpar NHI Bandung",
    "short": "Poltekpar NHI",
    "badge": "PTN Kemenpar / Vokasi",
    "dotColor": "bg-indigo-600",
    "badgeClass": "bg-indigo-50 text-indigo-900 border-indigo-200/80",
    "accentGradient": "from-indigo-800 via-blue-700 to-cyan-600",
    "logo": "assets/logos/logo_poltekpar_nhi.png?v=2",
    "location": "Jl. Dr. Setiabudi No. 186 & Dayeuhkolot",
    "shortDesc": "Perguruan tinggi negeri pariwisata Kemenpar untuk Perhotelan, Kuliner, Patiseri, UPW, & MICE lewat seleksi nasional SBM & SMM Poltekpar.",
    "fullDesc": "Politeknik Pariwisata (Poltekpar) NHI Bandung adalah perguruan tinggi negeri/kedinasan vokasi di bawah Kementerian Pariwisata RI dengan kampus utama di Jl. Dr. Setiabudi No. 186, Hegarmanah, Bandung 40141 serta pengembangan kampus di Dayeuhkolot. Menawarkan prodi D3 (Divisi Kamar, Tata Hidang, Seni Kuliner, Patiseri) dan D4 (Pengelolaan Perhotelan, Usaha Perjalanan Wisata, MICE, Destinasi Pariwisata, Pengelolaan Usaha Rekreasi).",
    "portal": "https://sbmpoltekpar.kemenpar.go.id/",
    "pathways": [
      {
        "name": "SBM Poltekpar (Seleksi Bersama Nasional)",
        "tag": "Seleksi Bersama 6 Poltekpar Kemenpar",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Juni",
        "desc": "Seleksi nasional terpusat untuk 6 Politeknik Pariwisata di bawah Kementerian Pariwisata RI (termasuk Poltekpar NHI Bandung). Rangkaian tes meliputi Tes Bakat Skolastik, Literasi Bahasa Inggris, Psikotes, serta Ujian Wawancara.",
        "santriNote": "Biaya kuliah negeri di bawah Kementerian Pariwisata relatif terjangkau dengan prospek karier perhotelan, wisata halal, dan event internasional.",
        "link": "https://sbmpoltekpar.kemenpar.go.id/"
      },
      {
        "name": "SMM Poltekpar NHI (Seleksi Mandiri Masuk)",
        "tag": "Ujian Mandiri Kampus Bandung",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Mei – Juli",
        "desc": "Jalur seleksi mandiri lokal yang dibuka oleh Poltekpar NHI Bandung setelah rangkaian SBM selesai, melalui mekanisme ujian Computer Based Test (CBT) dan wawancara bagi lulusan SMA/SMK/MA sederajat.",
        "santriNote": "Lulusan semua jurusan MA/SMA (IPA, IPS, Agama/Bahasa) diperbolehkan mendaftar selama memenuhi syarat kesehatan prodi.",
        "link": "https://poltekpar-nhi.ac.id"
      },
      {
        "name": "Ketentuan Kesehatan & Fisik Khusus Industri",
        "tag": "Wajib Perhatikan Sebelum Pilih Prodi",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Tahap Verifikasi Kesehatan",
        "desc": "Prodi bidang Hospitaliti (Pengelolaan Perhotelan, Divisi Kamar, Tata Hidang, Seni Kuliner, Patiseri) mensyaratkan tidak buta warna (total/parsial), tinggi badan minimal (±150 cm), bebas TBC, dan tanpa kelainan tulang belakang berat. Prodi UPW/MICE/Destinasi umumnya mensyaratkan tidak buta warna total.",
        "santriNote": "Cek buku panduan kesehatan resmi SBM Poltekpar di portal Kemenpar sebelum mengunci pilihan program studi.",
        "link": "https://sbmpoltekpar.kemenpar.go.id/"
      }
    ]
  },
  "unpas": {
    "id": "unpas",
    "num": "13",
    "name": "Universitas Pasundan (UNPAS)",
    "short": "UNPAS",
    "badge": "PTS Favorit Bandung",
    "dotColor": "bg-yellow-600",
    "badgeClass": "bg-amber-50 text-amber-900 border-amber-300/80",
    "accentGradient": "from-yellow-600 via-amber-500 to-emerald-600",
    "logo": "assets/logos/logo_unpas.png?v=2",
    "location": "Tamansari, Lengkong, Sumatra & Setiabudi",
    "shortDesc": "Pilihan favorit untuk Hukum, FISIP, Teknik, Ekonomi, FKIP, & Kedokteran lewat PMDK rapor, USM 1–3, nilai UTBK, dan Beasiswa Tahfidz LP2SI.",
    "fullDesc": "Universitas Pasundan (UNPAS) memiliki 4 kampus utama di jantung Kota Bandung (Sekretariat PMB Jl. Tamansari No. 4–8, Jl. Lengkong Besar, Jl. Sumatra, dan Jl. Dr. Setiabudhi) dengan 7 Fakultas unggulan termasuk Hukum, FISIP (HI, Ilmu Komunikasi, Administrasi Publik), Teknik, Ekonomi & Bisnis, FKIP, Ilmu Seni & Sastra, serta Kedokteran.",
    "portal": "https://pmb.unpas.ac.id",
    "pathways": [
      {
        "name": "Jalur PMDK & Early Bird (Rapor Tanpa Tes)",
        "tag": "Seleksi Rapor Tanpa Tes",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Gelombang Awal – Juli",
        "desc": "Penelusuran Minat dan Kemampuan (PMDK) tanpa tes tertulis berbasis rata-rata rapor (semester 1–4/5) dan sertifikat prestasi akademik/non-akademik, termasuk program insentif pendaftaran awal (Early Bird).",
        "santriNote": "Banyak santri PMUQI masuk prodi Hukum, Hubungan Internasional, Ilmu Komunikasi, & Teknik melalui jalur rapor bebas tes ini.",
        "link": "https://pmb.unpas.ac.id"
      },
      {
        "name": "Jalur USM (Ujian Saringan Masuk & Kedokteran)",
        "tag": "Tes Online Gelombang 1–3",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Januari – Agustus",
        "desc": "Ujian Saringan Masuk bertahap (Gelombang 1–3 dan seterusnya) secara online melalui materi TPA/skolastik & Saintek/Soshum, serta jalur USM khusus bagi peminat Fakultas Kedokteran UNPAS.",
        "santriNote": "Pendaftaran terpusat di pmb.unpas.ac.id / situ2.unpas.ac.id dengan biaya pendaftaran reguler S1 umumnya Rp300.000.",
        "link": "https://situ2.unpas.ac.id/spmbfront/home"
      },
      {
        "name": "Jalur Nilai UTBK & Transfer / RPL",
        "tag": "Skor UTBK-SNBT & Lanjutan",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Periode UTBK & Gelombang PMB",
        "desc": "Penerimaan mahasiswa baru menggunakan pemanfaatan skor/keikutsertaan UTBK-SNBT tanpa ujian tulis tambahan, serta jalur Rekognisi Pembelajaran Lampau (RPL) untuk transfer kredit lulusan D1–D3/pekerja.",
        "santriNote": "Alternatif efisien sesudah pengumuman SNBT tanpa mengulang tes skolastik kampus.",
        "link": "https://situ2.unpas.ac.id/spmbfront/home"
      },
      {
        "name": "Beasiswa Tahfidz Al-Qur'an LP2SI & KIP Kuliah",
        "tag": "Beasiswa Hafiz & Pemerintah",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Jadwal Seleksi Tahfidz & KIP",
        "desc": "Seleksi khusus penghafal Al-Qur'an melalui uji hafalan (sambung ayat) oleh Lembaga Pengkajian & Pengembangan Syiar Islam (LP2SI) UNPAS berhadiah potongan hingga pembebasan biaya kuliah sesuai juz, serta penyaluran KIP Kuliah.",
        "santriNote": "Hotline resmi PMB UNPAS: WhatsApp 0811-960-193 atau pmb@unpas.ac.id untuk jadwal uji tahfidz terbaru.",
        "link": "https://pmb.unpas.ac.id"
      }
    ]
  }
};

function initJalurKampus() {
  const selectorView = document.getElementById('jalur-selector-view');
  const detailView = document.getElementById('jalur-detail-view');
  // Campus picker: one quiet row per campus, rendered from CAMPUS_JALUR_DATA
  const campusGrid = document.getElementById('jalur-campus-grid');
  if (campusGrid) {
    campusGrid.innerHTML = Object.values(CAMPUS_JALUR_DATA).map((c) => `
      <button type="button" class="jalur-card pg-row" data-campus-id="${c.id}" aria-label="Lihat jalur masuk ${c.name}">
        <span class="pg-logo"><img src="${c.logo}" alt="" loading="lazy"></span>
        <span class="pg-row-text">
          <span class="pg-row-title">${c.name}</span>
          <span class="pg-row-sub">${c.location}</span>
        </span>
        <i data-lucide="chevron-right"></i>
      </button>`).join('');
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  const campusCards = document.querySelectorAll('.jalur-card');
  const extraCards = document.querySelectorAll('.jalur-extra-card');
  const toggleAllBtn = document.getElementById('btn-toggle-all-jalur');
  const visibleCountBadge = document.getElementById('jalur-visible-count');
  const backBtn = document.getElementById('btn-back-jalur');
  const quickBtns = document.querySelectorAll('.jalur-quick-btn');
  const pathwaysGrid = document.getElementById('detail-pathways-grid');

  if (!selectorView || !detailView) return;

  let isExpanded = false;

  if (toggleAllBtn && extraCards.length > 0) {
    const totalCount = campusCards.length;
    const baseCount = totalCount - extraCards.length;

    const syncToggleUi = () => {
      extraCards.forEach(card => {
        card.classList.toggle('hidden', !isExpanded);
      });
      toggleAllBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      if (visibleCountBadge) {
        visibleCountBadge.textContent = isExpanded
          ? `Menampilkan semua ${totalCount} Kampus`
          : `Menampilkan ${baseCount} dari ${totalCount} Kampus`;
      }

      if (isExpanded) {
        toggleAllBtn.innerHTML = `
          <span>Tampilkan Lebih Sedikit</span>
          <i data-lucide="chevron-up" class="w-4 h-4 text-brand-700 group-hover:-translate-y-0.5 transition-transform"></i>
        `;
      } else {
        toggleAllBtn.innerHTML = `
          <span>Selengkapnya</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100/80 text-brand-800">+${extraCards.length} Kampus</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-brand-700 group-hover:translate-y-0.5 transition-transform"></i>
        `;
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    };

    toggleAllBtn.addEventListener('click', () => {
      const wasExpanded = isExpanded;
      isExpanded = !isExpanded;
      syncToggleUi();

      if (wasExpanded && !isExpanded) {
        const tabJalur = document.getElementById('tab-jalur');
        if (tabJalur) {
          const topOffset = tabJalur.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
      }
    });
  }

  function renderCampusDetail(campusId) {
    const data = CAMPUS_JALUR_DATA[campusId];
    if (!data) return;

    // Update Banner Info
    const bannerTitle = document.getElementById('banner-campus-title');
    const bannerBadge = document.getElementById('banner-badge-text');
    const bannerLoc = document.getElementById('banner-loc-text');
    const bannerDesc = document.getElementById('banner-campus-desc');
    const bannerLogo = document.getElementById('banner-campus-logo');
    const bannerPortal = document.getElementById('banner-portal-link');
    const bannerCount = document.getElementById('banner-pathways-count');

    if (bannerTitle) bannerTitle.textContent = data.name;
    if (bannerBadge) bannerBadge.textContent = data.badge;
    if (bannerLoc) bannerLoc.textContent = data.location;
    if (bannerDesc) bannerDesc.textContent = data.fullDesc || data.shortDesc;
    if (bannerLogo) {
      bannerLogo.src = data.logo;
      bannerLogo.alt = `Logo ${data.name}`;
    }
    if (bannerPortal) {
      bannerPortal.href = data.portal;
    }
    if (bannerCount) {
      bannerCount.textContent = `${data.pathways.length} jalur masuk`;
    }

    // Render pathways cards
    if (pathwaysGrid) {
      pathwaysGrid.innerHTML = data.pathways.map((p) => `
        <details class="pg-acc">
          <summary>
            <span class="pg-acc-title">${p.name}</span>
            <span class="pg-acc-meta">${p.schedule}</span>
          </summary>
          <div class="pg-acc-body">
            <span class="pg-chip">${p.tag}</span>
            <p>${p.desc}</p>
            <p><strong>Catatan santri:</strong> ${p.santriNote}</p>
            <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="pg-textlink">
              <span>Buka tautan resmi</span><i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </a>
          </div>
        </details>
      `).join('');
    }

    // Update Quick Switcher Pills Active State
    quickBtns.forEach(btn => {
      const target = btn.getAttribute('data-target-campus');
      if (target === campusId) {
        btn.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
      } else {
        btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-xs');
        btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
      }
    });

    // Toggle Views
    selectorView.classList.add('hidden');
    detailView.classList.remove('hidden');

    // Re-create icons for the new HTML
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Smooth scroll to tab-jalur top so user immediately sees the campus details
    const tabJalur = document.getElementById('tab-jalur');
    if (tabJalur) {
      const topOffset = tabJalur.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  // Bind click & keyboard events to campus cards
  campusCards.forEach(card => {
    const campusId = card.getAttribute('data-campus-id');
    card.addEventListener('click', () => {
      renderCampusDetail(campusId);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        renderCampusDetail(campusId);
      }
    });
  });

  // Back Button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      detailView.classList.add('hidden');
      selectorView.classList.remove('hidden');

      const tabJalur = document.getElementById('tab-jalur');
      if (tabJalur) {
        const topOffset = tabJalur.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    });
  }

  // Quick Switcher Buttons
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target-campus');
      renderCampusDetail(target);
    });
  });
}

// ==========================================
// 11. KATALOG BEASISWA INDONESIA & BANDUNG
// ==========================================
const SCHOLARSHIPS_DATA = [
  // --- A. PEMERINTAH PUSAT (6) ---
  {
    id: 'kip-kuliah-merdeka',
    title: 'KIP Kuliah Merdeka (Kemdiktisaintek)',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kemdiktisaintek RI',
    logo: 'assets/logos/beasiswa/kip.svg',
    level: 'D3 / D4 / S1',
    campuses: 'PTN & PTS Terakreditasi (ITB, UNPAD, UPI, POLBAN, Telkom, UNISBA, UNPAS, UNPAR, Widyatama)',
    benefit: 'Gratis biaya kuliah (UKT/SPP) penuh hingga lulus + bantuan biaya hidup bulanan sesuai klaster wilayah (sekitar Rp800 ribu–Rp1,4 juta/bulan; nominal Bandung cek pedoman tahun berjalan).',
    summary: 'Bantuan biaya pendidikan nasional untuk lulusan SMA/SMK/MA/Pesantren berpotensi akademik baik dari keluarga kurang mampu.',
    requirements: [
      'Lulusan SMA/SMK/MA/sederajat tahun berjalan atau maksimal lulus 2 tahun sebelumnya.',
      'Memiliki NISN, NPSN, dan NIK yang valid serta terdaftar di sistem Dapodik/EMIS.',
      'Terdaftar di DTKS/P3KE Kemensos, pemegang KIP/PKH/KKS, panti asuhan, atau pendapatan kotor gabungan orang tua maksimal Rp4.000.000/bulan (atau Rp750.000 per anggota keluarga) dibuktikan dengan SKTM.',
      'Lulus seleksi masuk perguruan tinggi jalur SNBP, SNBT, atau Mandiri di prodi terakreditasi.'
    ],
    stages: [
      'Registrasi akun mandiri di portal resmi KIP Kuliah (kip-kuliah.kemdiktisaintek.go.id) untuk memperoleh Nomor Pendaftaran & Kode Akses.',
      'Sinkronisasi otomatis akun KIP Kuliah dengan jalur seleksi masuk PTN/PTS (SNBP, SNBT, atau Mandiri).',
      'Mengunggah berkas ekonomi keluarga, foto rumah, dan surat keterangan pendukung.',
      'Verifikasi berkas & wawancara/kunjungan lapangan oleh pengelola kemahasiswaan kampus tujuan setelah dinyatakan diterima.'
    ],
    officialUrl: 'https://kip-kuliah.kemdiktisaintek.go.id',
    deadlineNote: 'Februari – Oktober (mengikuti jadwal SNBP, SNBT & Mandiri)'
  },
  {
    id: 'kip-kuliah-ptkin',
    title: 'KIP Kuliah PTKIN (Kementerian Agama)',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kementerian Agama RI',
    logo: 'assets/logos/beasiswa/kip_kemenag.svg',
    level: 'S1 PTKIN & PTKIS',
    campuses: 'UIN Sunan Gunung Djati Bandung & PTKIS Kopertais Jabar',
    benefit: 'Pembebasan UKT Rp2.400.000/semester + tunjangan biaya hidup Rp700.000/bulan (total Rp6.600.000/semester) hingga 8 semester.',
    summary: 'Program KIP Kuliah khusus Perguruan Tinggi Keagamaan Islam (UIN SGD Bandung & PTKIS), sangat ramah alumni pesantren/madrasah.',
    requirements: [
      'Mahasiswa baru lulusan MA/SMA/SMK/Muadalah/Pendidikan Diniyah Formal tahun berjalan atau maksimal 2 tahun terakhir.',
      'Menunjukkan keterbatasan ekonomi melalui kartu KIP/PKH/KKS atau Surat Keterangan Tidak Mampu (SKTM) dari desa/kelurahan.',
      'Tidak sedang menerima beasiswa lain yang bersumber dari APBN/APBD.',
      'Memiliki hafalan Al-Qur’an atau prestasi keagamaan menjadi nilai tambah di UIN SGD Bandung.'
    ],
    stages: [
      'Mendaftar masuk UIN SGD Bandung (SPAN-PTKIN, UM-PTKIN, atau Mandiri) lalu mendaftar akun KIP Kuliah PTKIN kampus.',
      'Mengisi formulir ekonomi & prestasi keagamaan di portal pendaftaran KIP Kuliah UIN/Kemenag.',
      'Seleksi administrasi dan wawancara kelayakan ekonomi serta baca Al-Qur’an oleh tim kemahasiswaan UIN SGD Bandung.',
      'Penetapan SK Rektor penerima KIP Kuliah PTKIN & pencairan dana setiap semester.'
    ],
    officialUrl: 'https://kip-kuliah.kemenag.go.id',
    deadlineNote: 'Mei – Agustus (dibuka setelah kelulusan PTKIN)'
  },
  {
    id: 'beasiswa-indonesia-bangkit',
    title: 'Beasiswa Indonesia Bangkit (BIB Kemenag–LPDP)',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kemenag RI & LPDP',
    logo: 'assets/logos/beasiswa/bib.svg',
    level: 'S1 / S2 / S3 Dalam & Luar Negeri',
    campuses: 'UIN SGD Bandung, UNPAD, ITB, UPI Bandung & kampus mitra Kemenag',
    benefit: 'Pembiayaan penuh (full funded): SPP/UKT, biaya hidup bulanan, biaya buku, riset tesis/disertasi, transportasi & asuransi kesehatan.',
    summary: 'Beasiswa kolaborasi Kemenag dan LPDP bagi santri, guru madrasah/pesantren, alumni PTKI, dan sivitas akademika keagamaan.',
    requirements: [
      'Warga Negara Indonesia bagian dari keluarga besar Kemenag (santri/ustaz/guru madrasah/alumni PTKI atau prodi keagamaan).',
      'Usia & IPK memenuhi batas program gelar tujuan (S1/S2/S3) serta belum memiliki gelar pada jenjang yang sama.',
      'Memiliki sertifikat kemampuan bahasa (TOEFL/IELTS/TOAFL) sesuai ketentuan jalur reguler atau afirmasi 3T/Pesantren.',
      'Menulis esai komitmen kontribusi bagi pembangunan keagamaan dan bangsa Indonesia.'
    ],
    stages: [
      'Pembuatan akun & unggah dokumen administratif di portal resmi beasiswa.kemenag.go.id.',
      'Seleksi Administrasi (verifikasi LoA Unconditional atau status pendaftar kampus mitra).',
      'Tes Bakat Skolastik (TBS) berbasis komputer.',
      'Seleksi Wawancara substantif oleh panel pewawancara Kemenag–LPDP & pengumuman kelulusan.'
    ],
    officialUrl: 'https://beasiswa.kemenag.go.id',
    deadlineNote: 'April – Mei setiap tahun'
  },
  {
    id: 'beasiswa-unggulan',
    title: 'Beasiswa Unggulan Kemendikdasmen',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kemendikdasmen RI',
    logo: 'assets/logos/beasiswa/bu.svg',
    level: 'S1 / S2 / S3 Masyarakat Berprestasi',
    campuses: 'Semua PTN/PTS terakreditasi unggul di Bandung (ITB, UNPAD, UPI, Telkom, UNPAR, dll.)',
    benefit: 'Biaya pendidikan/SPP penuh, biaya hidup bulanan, serta tunjangan buku setiap semester.',
    summary: 'Beasiswa bergengsi pemerintah pusat bagi mahasiswa baru atau on-going yang memiliki prestasi tingkat nasional/internasional.',
    requirements: [
      'Diutamakan memiliki sertifikat prestasi akademik/non-akademik tingkat kabupaten/kota, provinsi, nasional, atau internasional.',
      'Mahasiswa baru yang sudah memiliki LoA Unconditional atau mahasiswa on-going maksimal semester 3 dengan IPK minimal 3,25 (S1) / 3,50 (S2).',
      'Memiliki sertifikat UKBI (Uji Kemahiran Berbahasa Indonesia) dan esai karya tulis sesuai tema resmi tahun berjalan.',
      'Surat rekomendasi dari sekolah/kampus atau tokoh akademik/organisasi terkait.'
    ],
    stages: [
      'Registrasi & pengisian data prestasi di portal beasiswaunggulan.kemendikdasmen.go.id.',
      'Seleksi Administrasi (penilaian dokumen, sertifikat prestasi, UKBI, dan esai).',
      'Seleksi Wawancara daring bersama asesor Kemendikdasmen.',
      'Penetapan penerima & penandatanganan kontrak beasiswa.'
    ],
    officialUrl: 'https://beasiswaunggulan.kemendikdasmen.go.id',
    deadlineNote: 'Juli – Agustus setiap tahun'
  },
  {
    id: 'beasiswa-lpdp',
    title: 'Beasiswa LPDP (Reguler, Afirmasi & Targeted)',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kementerian Keuangan RI',
    logo: 'assets/logos/beasiswa/lpdp.svg',
    level: 'S2 / S3 Dalam & Luar Negeri',
    campuses: 'ITB, UNPAD, UPI Bandung, UIN SGD Bandung & kampus top dunia',
    benefit: 'Full funded lengkap: dana pendaftaran, SPP/UKT, buku, riset tesis/disertasi, seminar internasional, hidup bulanan & tiket PP.',
    summary: 'Program beasiswa pascasarjana utama dari Kemenkeu dengan jalur Khusus Santri/Afirmasi, Reguler, dan Targeted PNS/TNI/Polri.',
    requirements: [
      'Lulusan D4/S1 untuk program Magister (batas usia umumnya 35 tahun reguler; jalur afirmasi/santri memiliki ketentuan khusus).',
      'IPK minimal 3,00 (Magister) atau 3,25 (Doktor), kecuali jalur afirmasi tertentu atau pemegang LoA Unconditional.',
      'Sertifikat TOEFL ITP >= 500 / iBT >= 61 / IELTS >= 6.0 untuk dalam negeri (lebih tinggi untuk luar negeri).',
      'Menulis Komitmen Kembali ke Indonesia, Rencana Studi, dan Kontribusi Pascastudi.'
    ],
    stages: [
      'Pendaftaran daring & unggah dokumen melalui portal beasiswalpdp.kemenkeu.go.id (Tahap 1 Januari / Tahap 2 Juni).',
      'Seleksi Administrasi & pengumuman hasil berkas.',
      'Seleksi Bakat Skolastik (TBS) bagi pendaftar tanpa LoA Unconditional.',
      'Seleksi Substansi (wawancara mendalam oleh panel akademisi & praktisi) hingga penetapan lulus.'
    ],
    officialUrl: 'https://lpdp.kemenkeu.go.id',
    deadlineNote: '2 Tahap per tahun (Januari–Februari & Juni–Juli)'
  },
  {
    id: 'beasiswa-komdigi',
    title: 'Beasiswa Komdigi (S2 Bidang TIK & Digital)',
    category: 'pusat',
    categoryLabel: 'Pemerintah Pusat',
    provider: 'Kementerian Komdigi RI',
    logo: 'assets/logos/beasiswa/komdigi.svg',
    level: 'S2 Dalam Negeri (Mitra ITB & UNPAD)',
    campuses: 'ITB Bandung (STEI/SBM), UNPAD Bandung & PTN mitra digitalisasi nasional',
    benefit: 'Biaya kuliah (UKT/SPP) penuh, biaya operasional pendidikan/riset tesis, serta tunjangan biaya hidup (jalur tertentu).',
    summary: 'Beasiswa pascasarjana Kementerian Komunikasi dan Digital untuk talenta TIK, keamanan siber, data science, dan kebijakan digital.',
    requirements: [
      'WNI berlatar belakang PNS/TNI/Polri maupun masyarakat umum praktisi sektor TIK/start-up/digital minimal masa kerja 2 tahun.',
      'Usia maksimal 35 tahun (masyarakat umum) atau 37 tahun (PNS/TNI/Polri).',
      'IPK S1 minimal 3,00 dan memenuhi syarat seleksi masuk Program Pascasarjana kampus mitra (seperti ITB atau UNPAD).',
      'Mendapatkan izin atasan langsung bagi pelamar yang bekerja.'
    ],
    stages: [
      'Registrasi akun & pemilihan perguruan tinggi mitra di beasiswa.komdigi.go.id.',
      'Pendaftaran paralel ke ujian masuk Pascasarjana kampus tujuan (mis. USM Pascasarjana ITB / SMUP UNPAD).',
      'Seleksi Administrasi & verifikasi rekomendasi instansi oleh Komdigi.',
      'Seleksi Substansi/Wawancara bersama pengelola program studi & Komdigi.'
    ],
    officialUrl: 'https://beasiswa.komdigi.go.id',
    deadlineNote: 'Maret – Mei setiap tahun'
  },

  // --- B. PEMERINTAH DAERAH JABAR & BANDUNG (3) ---
  {
    id: 'besti-kab-bandung',
    title: 'Beasiswa Ti Bupati (BESTI) Kab. Bandung',
    category: 'daerah',
    categoryLabel: 'Pemda Jabar & Bandung',
    provider: 'Pemkab Bandung (Dispora)',
    logo: 'assets/logos/beasiswa/besti.svg',
    level: 'S1 PTN & PTS Mitra Bandung Raya',
    campuses: 'UIN SGD Bandung, UNPAD, UPI Bandung, UNPAS, Telkom University, UM Bandung, dll.',
    benefit: 'Pembiayaan UKT/SPP kuliah sampai lulus untuk kategori Hafidz Al-Qur’an & Siswa Berprestasi warga Kabupaten Bandung.',
    summary: 'Program prioritas Bupati Bandung bagi putra-putri asli Kabupaten Bandung yang hafal Al-Qur’an minimal 1–5 juz atau berprestasi.',
    requirements: [
      'Ber-KTP dan KK asli Kabupaten Bandung (berusia maksimal 21 tahun saat mendaftar).',
      'Kategori Tahfidz (memiliki hafalan Al-Qur’an) atau Kategori Prestasi Akademik/Non-Akademik juara tingkat kabupaten/provinsi/nasional.',
      'Berasal dari keluarga kurang mampu / terdaftar DTKS atau melampirkan SKTM yang sah.',
      'Diterima atau berkuliah di kampus yang bermitra dengan Pemkab Bandung.'
    ],
    stages: [
      'Pendaftaran online sesuai pengumuman resmi Pemerintah Kabupaten Bandung (bandungkab.go.id).',
      'Seleksi Administrasi kependudukan & berkas prestasi/DTKS.',
      'Uji hafalan Al-Qur’an (untuk jalur tahfidz) dan wawancara kelayakan.',
      'Penetapan SK Bupati Bandung & penyaluran beasiswa melalui perguruan tinggi mitra.'
    ],
    officialUrl: 'https://bandungkab.go.id',
    deadlineNote: 'Agustus – Oktober (menunggu rilis jadwal tahunan Pemkab Bandung)'
  },
  {
    id: 'rmp-pemkot-bandung',
    title: 'Program Bantuan Pendidikan / RMP Pemkot Bandung',
    category: 'daerah',
    categoryLabel: 'Pemda Jabar & Bandung',
    provider: 'Pemkot Bandung (Bagian Kesra)',
    logo: 'assets/logos/beasiswa/rmp.svg',
    level: 'D3 / S1 Warga Kota Bandung',
    campuses: 'Kampus PTN/PTS wilayah Kota Bandung',
    benefit: 'Bantuan stimulan biaya pendidikan/UKT dan akses jalur afirmasi Rawan Melanjutkan Pendidikan (RMP) warga Kota Bandung.',
    summary: 'Dukungan akses dan bantuan biaya kuliah Pemerintah Kota Bandung bagi mahasiswa asal keluarga prasejahtera ber-KTP Kota Bandung.',
    requirements: [
      'Ber-KTP dan KK Kota Bandung serta terdaftar dalam DTKS Dinas Sosial Kota Bandung atau kategori RMP.',
      'Aktif kuliah jenjang D3/S1 pada perguruan tinggi di Kota Bandung (terdaftar PDDikti).',
      'Surat pengantar/rekomendasi kemahasiswaan dari perguruan tinggi masing-masing.',
      'Tidak berstatus penerima KIP Kuliah penuh atau beasiswa APBN ganda.'
    ],
    stages: [
      'Pengajuan melalui portal layanan Bagian Kesra / Dinsos Pemkot Bandung atau pendataan kampus.',
      'Verifikasi faktual DTKS Kota Bandung & keaktifan mahasiswa di PDDikti.',
      'Validasi berkas oleh Bagian Kesra Setda Kota Bandung.',
      'Penetapan penerima dan transfer bantuan pendidikan.'
    ],
    officialUrl: 'https://www.bandung.go.id',
    deadlineNote: 'Menyesuaikan jadwal pendataan Kesra Pemkot Bandung'
  },

  // --- C. LEMBAGA / BAZNAS / BUMN / SWASTA (10) ---
  {
    id: 'beasiswa-cendekia-baznas',
    title: 'Beasiswa Cendekia BAZNAS (BCB)',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'BAZNAS RI',
    logo: 'assets/logos/beasiswa/baznas.svg',
    level: 'S1 / D4 Dalam Negeri & Ma’had Aly',
    campuses: 'ITB, UNPAD, UPI Bandung, UIN SGD Bandung, Telkom University, UNISBA, POLBAN (246 kampus mitra pada 2026)',
    benefit: 'Bantuan UKT hingga Rp4 juta/semester (kampus reguler) atau Rp7 juta/semester (kampus prioritas) selama 4 semester (semester 5–8) + bantuan riset tugas akhir + pembinaan karakter & kepemimpinan BAZNAS.',
    summary: 'Beasiswa andalan bagi santri dan mahasiswa aktif semester 5 di kampus mitra Bandung untuk melahirkan cendekiawan Muslim berkarakter.',
    requirements: [
      'Mahasiswa aktif program S1/D4 semester 5 di salah satu kampus mitra BAZNAS (termasuk ITB, UNPAD, UPI, UIN SGD, Telkom, UNISBA).',
      'IPK minimal 3,00 (skala 4,00).',
      'Aktif berorganisasi kemahasiswaan/keagamaan/pesantren dan berkomitmen mengikuti pembinaan berkala.',
      'Melampirkan esai rencana kontribusi pascakampus & rekomendasi tokoh/kampus.'
    ],
    stages: [
      'Mengunduh panduan & mendaftar lewat tautan pendaftaran kampus mitra di beasiswa.baznas.go.id.',
      'Seleksi Administrasi oleh tim kemahasiswaan kampus mitra BAZNAS.',
      'Seleksi Wawancara langsung oleh pihak kampus & perwakilan BAZNAS.',
      'Masa sanggah, verifikasi akhir, dan penetapan penerima BCB angkatan berjalan.'
    ],
    officialUrl: 'https://beasiswa.baznas.go.id',
    deadlineNote: 'Sekitar Juli – September (2026: 9–27 September)'
  },
  {
    id: 'bsi-scholarship',
    title: 'BSI Scholarship (Inspirasi & Prestasi)',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Bank Syariah Indonesia & BSI Maslahat',
    logo: 'assets/logos/beasiswa/bsi.svg',
    level: 'S1 & Pelajar SMA/MA',
    campuses: 'ITB, UNPAD, UPI, UIN SGD Bandung & kampus mitra BSI Maslahat',
    benefit: 'Bantuan UKT penuh/parsial + uang saku bulanan + program mentoring kepemimpinan ekonomi syariah & magang industri BSI.',
    summary: 'Beasiswa dari Bank Syariah Indonesia bagi mahasiswa S1 di PTN/PTS mitra Bandung lewat jalur Inspirasi (ekonomi lemah) & Prestasi.',
    requirements: [
      'Mahasiswa aktif S1 semester 3 pada perguruan tinggi mitra BSI Scholarship.',
      'IPK minimal 3,00 (Inspirasi) atau 3,25 (Prestasi) disertai sertifikat keaktifan organisasi/kompetisi.',
      'Memiliki sertifikat kemampuan bahasa Inggris atau hafalan Al-Qur’an menjadi nilai tambah.',
      'Tidak sedang menerima beasiswa sejenis lainnya.'
    ],
    stages: [
      'Pendaftaran online di portal resmi bsischolarship.id.',
      'Seleksi Administrasi berkas akademik dan kondisi keluarga/prestasi.',
      'Tes Potensi Akademik / Asesmen Kepemimpinan daring.',
      'Wawancara mendalam bersama tim BSI Maslahat & Bank Syariah Indonesia.'
    ],
    officialUrl: 'https://bsischolarship.id',
    deadlineNote: 'September – Oktober setiap tahun'
  },
  {
    id: 'ybm-brilian',
    title: 'Bright Scholarship & Smart Scholarship YBM BRILiaN',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'YBM BRILiaN (Bank BRI)',
    logo: 'assets/logos/beasiswa/brilian.svg',
    level: 'S1 PTN Mitra (Bandung)',
    campuses: 'ITB, UNPAD, UPI Bandung & UIN SGD Bandung',
    benefit: 'Pembinaan asrama/mentoring intensif, tunjangan biaya pendidikan/UKT + uang saku bulanan hingga lulus.',
    summary: 'Program pemberdayaan zakat Bank BRI bagi mahasiswa PTN berprestasi dari keluarga prasejahtera dengan penguatan karakter Islami.',
    requirements: [
      'Mahasiswa aktif PTN mitra (semester 1 untuk Bright Scholarship; mahasiswa on-going untuk Smart Scholarship).',
      'Memiliki hafalan Al-Qur’an minimal 1 juz (nilai tambah tinggi bagi santri).',
      'Berasal dari keluarga kurang mampu dibuktikan SKTM dan foto tempat tinggal.',
      'Bersedia mengikuti program pembinaan terstruktur (Bright/Smart).'
    ],
    stages: [
      'Registrasi berkas secara online melalui situs ybmbrilian.id sesuai pengumuman regional.',
      'Seleksi Administrasi & verifikasi kelayakan mustahik.',
      'Psikotes, FGD (Focus Group Discussion), dan wawancara karakter/tilawah.',
      'Survei kondisi rumah (home visit) bagi kandidat final & pengukuhan penerima.'
    ],
    officialUrl: 'https://ybmbrilian.id',
    deadlineNote: 'Agustus – November (regional Bandung)'
  },
  {
    id: 'beasiswa-bank-indonesia',
    title: 'Beasiswa Bank Indonesia (Komunitas GenBI)',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Bank Indonesia (KPw BI Jabar)',
    logo: 'assets/logos/beasiswa/bi.svg',
    level: 'D3 / D4 / S1 Reguler & Unggulan',
    campuses: 'ITB, UNPAD, UPI Bandung, UIN SGD Bandung, POLBAN & UNISBA',
    benefit: 'Uang saku bulanan (Rp1 juta–Rp1,5 juta/bulan), pelatihan kepemimpinan tingkat nasional & bergabung di Generasi Baru Indonesia (GenBI).',
    summary: 'Beasiswa bergengsi Bank Indonesia melalui pengelola kemahasiswaan kampus mitra Jawa Barat yang melatih agen perubahan & literasi kebanksentralan.',
    requirements: [
      'Mahasiswa aktif S1 (min. semester 3 / 40 SKS) atau D3 (min. semester 2) di kampus mitra KPw BI Jawa Barat.',
      'IPK minimal 3,00 (reguler) atau 3,50 + TOEFL 500/IELTS 6.0 (program unggulan).',
      'Aktif dalam kegiatan sosial kemasyarakatan/organisasi kampus dan tidak sedang menerima beasiswa lain.',
      'Membuat resume pribadi dan motivation letter dalam Bahasa Indonesia/Inggris.'
    ],
    stages: [
      'Pendaftaran kolektif melalui Direktorat Kemahasiswaan kampus mitra masing-masing (UNPAD/UPI/UIN/ITB/POLBAN/UNISBA).',
      'Seleksi Administrasi oleh kampus sebelum direkomendasikan ke KPw Bank Indonesia Jawa Barat.',
      'Wawancara langsung oleh panel Bank Indonesia KPw Jawa Barat.',
      'Penetapan penerima & pelantikan anggota baru GenBI Jabar.'
    ],
    officialUrl: 'https://www.bi.go.id',
    deadlineNote: 'Januari – Maret setiap tahun'
  },
  {
    id: 'djarum-beasiswa-plus',
    title: 'Djarum Beasiswa Plus',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Djarum Foundation',
    logo: 'assets/logos/beasiswa/djarum.svg',
    level: 'S1 / D4 Semua Jurusan',
    campuses: 'ITB, UNPAD, UPI Bandung, Telkom University, POLBAN, UNPAR, UNISBA, Widyatama, dll.',
    benefit: 'Dana pendidikan Rp1.000.000/bulan selama 1 tahun + pelatihan soft skills eksklusif (Character Building, Leadership, Nation Building).',
    summary: 'Program pengembangan soft skills dan beasiswa prestisius bagi mahasiswa aktif semester 4 tanpa membatasi latar belakang ekonomi.',
    requirements: [
      'Mahasiswa aktif S1/D4 semester IV dari perguruan tinggi mitra Djarum Foundation.',
      'IPK minimal 3,00 pada semester III serta konsisten mempertahankan IPK >= 3,00 hingga akhir semester IV.',
      'Aktif mengikuti kegiatan organisasi di dalam maupun luar kampus.',
      'Tidak sedang menerima beasiswa dari pihak lain.'
    ],
    stages: [
      'Pendaftaran online & pengunggahan berkas melalui djarumbeasiswaplus.org.',
      'Seleksi Administrasi dan verifikasi dokumen oleh pihak kampus.',
      'Tes Tulis Online (Tes Potensi Akademik & Kepribadian).',
      'Wawancara kelompok/individu secara langsung oleh tim Djarum Foundation.'
    ],
    officialUrl: 'https://djarumbeasiswaplus.org',
    deadlineNote: 'Maret – Mei setiap tahun'
  },
  {
    id: 'tanoto-teladan',
    title: 'Program Kepemimpinan TELADAN Tanoto Foundation',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Tanoto Foundation',
    logo: 'assets/logos/beasiswa/tanoto.svg',
    level: 'S1 Mahasiswa Baru (Mitra ITB)',
    campuses: 'Institut Teknologi Bandung (ITB) — satu-satunya kampus mitra di Bandung Raya',
    benefit: 'Biaya kuliah penuh + tunjangan hidup bulanan + pelatihan kepemimpinan berjenjang (semester 2–8), pendanaan riset & jaringan global.',
    summary: 'Program pembentukan pemimpin masa depan bagi mahasiswa S1 semester 1 di 10 PTN mitra; di Bandung Raya hanya ITB.',
    requirements: [
      'Mahasiswa semester 1 program Sarjana reguler di salah satu dari 10 PTN mitra (di Bandung: ITB).',
      'Memiliki prestasi akademik (nilai rapor SMA/SMK/MA rata-rata min. 8/10) dan pengalaman kepemimpinan organisasi.',
      'Menunjukkan potensi kepemimpinan kuat serta motivasi berkontribusi bagi masyarakat.',
      'Berkomitmen mengikuti seluruh rangkaian pelatihan kepemimpinan TELADAN hingga semester 8.'
    ],
    stages: [
      'Mengisi formulir pendaftaran online dan esai kepemimpinan di tanotofoundation.org.',
      'Seleksi Tahap 1: Penilaian Administrasi & Tes Online (Asesmen Potensi Kepemimpinan).',
      'Seleksi Tahap 2: Assessment Center (simulasi kerja tim/FGD).',
      'Seleksi Tahap 3: Wawancara Panel final oleh Tanoto Foundation & pengumuman Tanoto Scholars.'
    ],
    officialUrl: 'https://www.tanotofoundation.org',
    deadlineNote: 'Juli – September setiap tahun'
  },
  {
    id: 'pertamina-sobat-bumi',
    title: 'Beasiswa Pertamina Sobat Bumi',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Pertamina Foundation',
    logo: 'assets/logos/beasiswa/pertamina.svg',
    level: 'S1 Reguler, Afirmasi & Vokasi',
    campuses: 'ITB, UNPAD, UPI Bandung & POLBAN',
    benefit: 'Bantuan biaya UKT/SPP + biaya hidup bulanan + pendanaan program Aksi Sobat Bumi dan pengabdian desa energi bersih.',
    summary: 'Beasiswa energi & lingkungan dari Pertamina Foundation yang mendorong mahasiswa aktif melaksanakan proyek keberlanjutan di kampus dan masyarakat.',
    requirements: [
      'Mahasiswa aktif PTN mitra Pertamina Foundation (minimal semester 2 untuk S1/D4/Vokasi).',
      'IPK minimal 3,00 (skala 4,00) dan aktif dalam organisasi sosial/lingkungan hidup.',
      'Menulis esai terkait aksi pelestarian lingkungan atau transisi energi bersih.',
      'Tidak sedang menerima beasiswa dari lembaga lain.'
    ],
    stages: [
      'Registrasi akun & unggah dokumen esai di portal resmi pertaminafoundation.org.',
      'Seleksi Administrasi (penilaian IPK, keaktifan organisasi, dan esai lingkungan).',
      'Seleksi Wawancara berbasis proyek lingkungan oleh asesor Pertamina Foundation.',
      'Pengumuman penerima & pelaksanaan program Aksi Sobat Bumi.'
    ],
    officialUrl: 'https://www.pertaminafoundation.org',
    deadlineNote: 'Februari – Maret setiap tahun'
  },
  {
    id: 'karyasiswa-kse',
    title: 'Beasiswa Karya Salemba Empat (KSE)',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'Yayasan Karya Salemba Empat',
    logo: 'assets/logos/beasiswa/kse.svg',
    level: 'S1 PTN Mitra (Bandung)',
    campuses: 'ITB Bandung, UNPAD & UPI Bandung (Paguyuban KSE)',
    benefit: 'Tunjangan biaya hidup Rp750.000/bulan (dapat diperpanjang tiap tahun) + beasiswa unggulan karier, wirausaha & teknologi.',
    summary: 'Beasiswa swadaya alumni sejak 1995 dengan komunitas Paguyuban KSE aktif di ITB, UNPAD, dan UPI Bandung yang solid membantu pengembangan mahasiswa.',
    requirements: [
      'Mahasiswa aktif program S1 minimal semester 2 pada 35 PTN mitra termasuk ITB, UNPAD, dan UPI.',
      'Belum menikah dan sedang membutuhkan dukungan finansial untuk perkuliahan.',
      'Membuat video profil singkat, motivation letter, dan esai rencana pengembangan diri.',
      'Siap aktif berkontribusi dalam kegiatan sosial Paguyuban KSE kampus masing-masing.'
    ],
    stages: [
      'Pendaftaran online melalui sistem registrasi beasiswa di kse.or.id pada jadwal open recruitment PTN Bandung.',
      'Seleksi Administrasi & penilaian video profil oleh tim Paguyuban & Yayasan KSE.',
      'Wawancara daring/luring bersama alumni donatur & pengurus KSE.',
      'Penetapan sebagai Beswan KSE dan bergabung dengan Paguyuban KSE ITB/UNPAD/UPI.'
    ],
    officialUrl: 'https://kse.or.id',
    deadlineNote: 'Februari – April setiap tahun'
  },
  {
    id: 'paragon-scholarship',
    title: 'Paragon Scholarship Program (PSP)',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'ParagonCorp (Wardah/Kahf/Emina)',
    logo: 'assets/logos/beasiswa/paragon.svg',
    level: 'S1 Excellence & Empowerment',
    campuses: 'ITB, UNPAD, UPI Bandung & berbagai kampus di Indonesia',
    benefit: 'Bantuan UKT + uang saku tahunan (Rp6 juta–Rp20 juta sesuai jalur) + dana proyek sosial, mentoring pimpinan Paragon & peluang Management Trainee.',
    summary: 'Program beasiswa dari perusahaan kosmetik halal terbesar Indonesia untuk mahasiswa inovatif yang ingin memberi dampak sosial.',
    requirements: [
      'Mahasiswa S1 semester 3 atau 5 (tergantung jalur PSP Excellence atau Empowerment).',
      'IPK minimal 3,30 (Excellence) atau 3,00 dengan kondisi ekonomi membutuhkan (Empowerment).',
      'Memiliki kepedulian sosial, pengalaman organisasi/kompetisi, serta bersedia merancang proyek dampak sosial.',
      'Tidak sedang terikat kontrak ikatan dinas beasiswa perusahaan lain.'
    ],
    stages: [
      'Pengisian formulir pendaftaran & esai di portal resmi Paragon Scholarship (paragon-innovation.com).',
      'Seleksi Administrasi dan Tes Potensi Psikometri daring.',
      'Wawancara / Forum Kelompok & presentasi ide proyek sosial.',
      'Penetapan Awardee PSP dan onboarding mentoring ParagonCorp.'
    ],
    officialUrl: 'https://www.paragon-innovation.com',
    deadlineNote: 'Juli – Agustus setiap tahun'
  },
  {
    id: 'bakti-bca',
    title: 'Beasiswa Bakti BCA',
    category: 'lembaga',
    categoryLabel: 'Lembaga / Swasta',
    provider: 'PT Bank Central Asia Tbk',
    logo: 'assets/logos/beasiswa/bca.svg',
    level: 'S1 Bantuan Finansial, Prestasi Akademik & Non-Akademik',
    campuses: 'ITB, UNPAD, UPI Bandung & berbagai PTN mitra BCA',
    benefit: 'Bantuan dana pendidikan & uang saku bulanan selama 1 tahun penuh + Bakti Champions Camp, company visit & financial literacy.',
    summary: 'Program CSR pendidikan Bank BCA dengan tiga kategori inklusif: Bantuan Finansial, Prestasi Akademik, dan Prestasi Non-Akademik.',
    requirements: [
      'Mahasiswa aktif program S1 semester 3 pada perguruan tinggi negeri mitra/terbuka di Indonesia.',
      'Usia maksimal 22 tahun dan belum menikah.',
      'IPK minimal 3,00 (khusus jalur Prestasi Akademik min. 3,25) serta melampirkan sertifikat organisasi/lomba.',
      'Berkomitmen mengikuti program pengembangan diri Bakti Champions selama 1 tahun.'
    ],
    stages: [
      'Pendaftaran online melalui laman bca.co.id/id/tentang-bca/csr/bakti-bca.',
      'Seleksi Administrasi dan pengecekan rekam prestasi/kebutuhan finansial.',
      'Asesmen psikotes & wawancara daring bersama tim Bakti BCA.',
      'Pengumuman penerima & penyambutan Bakti Champions.'
    ],
    officialUrl: 'https://www.bca.co.id/id/tentang-bca/csr/bakti-bca',
    deadlineNote: 'September – Oktober setiap tahun'
  },

  // --- D. INTERNAL KAMPUS BANDUNG (11) ---
  {
    id: 'internal-uin-sgd',
    title: 'Beasiswa Internal UIN Sunan Gunung Djati Bandung',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'UIN SGD Bandung',
    logo: 'assets/logos/logo_uin.png',
    level: 'S1 (Tahfidz, Prestasi & Keringanan UKT)',
    campuses: 'UIN Sunan Gunung Djati Bandung (Cibiru)',
    benefit: 'Pembebasan/penurunan kelompok UKT bagi Hafidz Al-Qur’an 10–30 Juz, juara MTQ/kompetisi nasional, serta bantuan UPZ UIN SGD.',
    summary: 'Ragam skema bantuan internal UIN SGD Bandung khusus santri hafidz, atlet/juara kompetisi, dan mahasiswa kurang mampu.',
    requirements: [
      'Mahasiswa aktif atau calon mahasiswa baru UIN Sunan Gunung Djati Bandung.',
      'Kategori Tahfidz: sertifikat/syahadah hafalan Al-Qur’an dan lulus ujian tasmi’ tim Ma’had Al-Jami’ah.',
      'Kategori Prestasi/Bantuan UPZ: sertifikat juara minimal tingkat provinsi atau surat kondisi ekonomi keluarga.',
      'Tidak berstatus pelanggar kode etik mahasiswa.'
    ],
    stages: [
      'Pantau pengumuman resmi pada laman pmb.uinsgd.ac.id / kemahasiswaan UIN SGD Bandung tiap awal semester.',
      'Ajukan berkas melalui portal SALAM / sistem keringanan UKT & kemahasiswaan UIN SGD.',
      'Uji tahfidz (untuk jalur hafalan) dan wawancara verifikasi berkas fakultas/universitas.',
      'Penetapan SK Rektor untuk penyesuaian UKT atau pencairan dana UPZ.'
    ],
    officialUrl: 'https://pmb.uinsgd.ac.id',
    deadlineNote: 'Setiap awal semester ganjil/genap'
  },
  {
    id: 'internal-unpad',
    title: 'Beasiswa Padjadjaran & Portal Beasiswa UNPAD',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Padjadjaran (UNPAD)',
    logo: 'assets/logos/logo_unpad.svg',
    level: 'D4 / S1 / Pascasarjana',
    campuses: 'UNPAD (Jatinangor & Dipatiukur Bandung)',
    benefit: 'Pembebasan/keringanan UKT (Skema UNPAD Nyaah ka Jabar & bantuan internal) serta penyaluran puluhan mitra donatur di portal beasiswa UNPAD.',
    summary: 'Sistem satu pintu pengelolaan beasiswa internal UNPAD, keringanan UKT, Beasiswa Unggulan Pascasarjana Padjadjaran (BUPP) & mitra CSR.',
    requirements: [
      'Terdaftar aktif sebagai mahasiswa UNPAD di sistem Students / PACIS.',
      'IPK memenuhi ambang batas skema masing-masing (umumnya >= 2,75 untuk keringanan ekonomi atau >= 3,25 untuk prestasi).',
      'Melampirkan slip gaji orang tua / keterangan DTKS untuk skema bantuan finansial.',
      'Mengunggah seluruh dokumen melalui akun mahasiswa di portal beasiswa.unpad.ac.id.'
    ],
    stages: [
      'Login dengan PAuS ID ke portal resmi beasiswa.unpad.ac.id dan pilih skema yang terbuka.',
      'Lengkapi formulir ekonomi, esai, dan surat rekomendasi dosen wali/fakultas.',
      'Verifikasi administratif oleh Direktorat Kemahasiswaan UNPAD.',
      'Wawancara (bila disyaratkan donatur/skema) & pengumuman hasil melalui akun PAuS.'
    ],
    officialUrl: 'https://beasiswa.unpad.ac.id',
    deadlineNote: 'Dibuka sepanjang tahun sesuai jadwal tiap skema'
  },
  {
    id: 'internal-upi',
    title: 'Beasiswa Internal & Penyesuaian UKT UPI Bandung',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Pendidikan Indonesia (UPI)',
    logo: 'assets/logos/logo_upi.svg',
    level: 'S1 & Pascasarjana',
    campuses: 'UPI Bandung (Setiabudi) & Kampus Daerah',
    benefit: 'Beasiswa Prestasi Akademik/Non-Akademik UPI, bantuan IKOMA/Alumni, hingga pengurangan UKT hingga 50%–100% bagi keluarga terdampak.',
    summary: 'Fasilitas beasiswa internal Direktorat Kemahasiswaan UPI Bandung yang terhubung dengan IKOMA, BAZNAS UPI, dan beasiswa prestasi kampus.',
    requirements: [
      'Mahasiswa aktif UPI Bandung memiliki NIM resmi dan tercatat aktif di SIAK.',
      'Untuk beasiswa prestasi: IPK minimal 3,25 atau piagam kejuaraan tingkat provinsi/nasional.',
      'Untuk keringanan UKT: bukti penghasilan orang tua / SKTM / bukti terdampak ekonomi.',
      'Surat rekomendasi fakultas/program studi sesuai panduan kemahasiswaan UPI.'
    ],
    stages: [
      'Mengakses informasi pembukaan pada portal kemahasiswaan.upi.edu dan menu beasiswa SIAK UPI.',
      'Mengunggah kelengkapan berkas melalui laman pendaftaran beasiswa UPI.',
      'Validasi berkas oleh Wakil Dekan Kemahasiswaan Fakultas & Direktorat Kemahasiswaan UPI.',
      'Penetapan SK penerima bantuan/penyesuaian UKT sebelum masa pembayaran semester.'
    ],
    officialUrl: 'https://kemahasiswaan.upi.edu',
    deadlineNote: 'Setiap awal semester & periode seleksi mitra'
  },
  {
    id: 'internal-itb',
    title: 'Beasiswa Ganesha & Bantuan Finansial ITB',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Institut Teknologi Bandung (Ditmawa ITB)',
    logo: 'assets/logos/logo_itb.png',
    level: 'S1 / S2 / S3',
    campuses: 'ITB Bandung (Ganesha, Jatinangor & Cirebon)',
    benefit: 'Subsidi UKT hingga Rp0 (UKT-1/Beasiswa UKT), uang saku bulanan dari Dana Lestari ITB/Alumni (Ia-ITB/Salman ITB) & beasiswa riset.',
    summary: 'Ekosistem bantuan finansial terpadu ITB memastikan tidak ada mahasiswa diterima ITB yang gagal kuliah karena kendala ekonomi.',
    requirements: [
      'Mahasiswa S1 atau Pascasarjana ITB aktif (termasuk maba yang mengisi pengajuan UKT berkeadilan).',
      'Mengisi profil kondisi ekonomi keluarga secara jujur beserta bukti tagihan listrik, slip gaji/surat penghasilan, dan foto rumah.',
      'Memenuhi IPK & batas waktu pengajuan pada sistem SIX / finaid.itb.ac.id.',
      'Untuk mahasiswa muslim, tersedia pula dukungan Beasiswa Perintis & Beasiswa Aktivis Masjid Salman ITB.'
    ],
    stages: [
      'Masuk ke portal resmi finaid.itb.ac.id menggunakan akun INA ITB.',
      'Memilih program Bantuan Keuangan (UKT/Biaya Hidup) atau Beasiswa Mitra yang terbuka.',
      'Verifikasi berkas oleh Direktorat Kemahasiswaan (Ditmawa) ITB serta wawancara jika dibutuhkan.',
      'Penetapan besaran subsidi UKT atau dana saku melalui SK resmi ITB.'
    ],
    officialUrl: 'https://finaid.itb.ac.id',
    deadlineNote: 'Pendaftaran ulang Maba & setiap awal semester di finaid.itb.ac.id'
  },
  {
    id: 'internal-telkom',
    title: 'Beasiswa Unggulan & Pintar Telkom University',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Telkom University (Tel-U)',
    logo: 'assets/logos/logo_telkom.png',
    level: 'D3 / D4 / S1 Calon Mahasiswa Baru',
    campuses: 'Telkom University Bandung (Bojongsoang)',
    benefit: 'Beasiswa Unggulan (gratis 100% biaya pendidikan BPP/UP3/SDP2 sampai lulus) atau Beasiswa Pintar (potongan biaya masuk hingga 100%).',
    summary: 'Program beasiswa penuh dan parsial jalur rapor/UTBK/prestasi dari Telkom University untuk calon mahasiswa berprestasi seluruh Indonesia.',
    requirements: [
      'Lulusan SMA/SMK/MA memenuhi standar nilai rapor minimal semester 1–5 (rata-rata >= 80–85 sesuai jurusan).',
      'Memiliki sertifikat prestasi akademik/non-akademik atau skor UTBK (untuk jalur UTBK Plus) menjadi keunggulan.',
      'Memenuhi syarat kesehatan & bebas buta warna untuk prodi desain/teknik tertentu.',
      'Mendaftar melalui jalur Beasiswa ID / Unggulan SMB Telkom University.'
    ],
    stages: [
      'Registrasi akun pendaftaran di smb.telkomuniversity.ac.id dan pilih jalur Beasiswa.',
      'Mengunggah rapor, sertifikat prestasi/tahfidz, serta surat rekomendasi sekolah.',
      'Mengikuti seleksi wawancara & tes potensi akademik daring Telkom University.',
      'Pengumuman penetapan besaran beasiswa (Penuh/Parsial) secara online.'
    ],
    officialUrl: 'https://smb.telkomuniversity.ac.id',
    deadlineNote: 'Gelombang beasiswa dibuka November – Juni'
  },
  {
    id: 'internal-unisba',
    title: 'Beasiswa Tahfidz & Prestasi PMB UNISBA',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Islam Bandung (UNISBA)',
    logo: 'assets/logos/logo_unisba.png',
    level: 'S1 Jalur Prestasi, Tahfidz & Yatim',
    campuses: 'UNISBA (Tamansari Kota Bandung)',
    benefit: 'Pembebasan/potongan Dana Pengembangan Pendidikan (DPP/uang pangkal) hingga 100% serta keringanan SPP bagi hafidz 5–30 juz & yatim berprestasi.',
    summary: 'Kampus bernuansa Islam terkemuka di pusat Kota Bandung yang memberikan apresiasi besar bagi alumni pesantren dan penghafal Al-Qur’an.',
    requirements: [
      'Calon mahasiswa baru lulusan SMA/MA/Pesantren yang mendaftar melalui PMB Jalur PMDK/Tahfidz UNISBA.',
      'Kategori Tahfidz: memiliki syahadah hafalan minimal 3–5 juz (potongan makin besar hingga 30 juz).',
      'Kategori Prestasi Akademik/Olahraga/Seni: rata-rata rapor >= 80 atau juara minimal tingkat kabupaten/provinsi.',
      'Melampirkan surat keterangan yatim/duafa bila mendaftar jalur khusus sosial.'
    ],
    stages: [
      'Pendaftaran online melalui admission.unisba.ac.id dengan memilih Jalur PMDK/Beasiswa Tahfidz.',
      'Unggah nilai rapor & sertifikat hafalan Al-Qur’an/kejuaraan.',
      'Mengikuti uji tes baca/hafalan Al-Qur’an & wawancara dengan tim PMB UNISBA.',
      'Penerbitan surat kelulusan beserta SK besaran potongan DPP/SPP.'
    ],
    officialUrl: 'https://admission.unisba.ac.id/id',
    deadlineNote: 'Gelombang PMDK & Reguler Desember – Juli'
  },
  {
    id: 'internal-polban',
    title: 'Beasiswa Prestasi & Bantuan UKT POLBAN',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Politeknik Negeri Bandung (POLBAN)',
    logo: 'assets/logos/logo_polban.svg',
    level: 'D3 / D4 Vokasi',
    campuses: 'POLBAN (Ciwaruga, Bandung Barat)',
    benefit: 'Penyesuaian UKT berkeadilan, Beasiswa Ikatan Alumni POLBAN, serta penyaluran KIP Kuliah & beasiswa industri vokasi.',
    summary: 'Skema dukungan biaya pendidikan di kampus politeknik negeri unggulan Bandung bagi mahasiswa vokasi berprestasi dan kurang mampu.',
    requirements: [
      'Mahasiswa aktif program D3/D4 POLBAN terdaftar pada sistem akademik POLBAN.',
      'Menunjukkan capaian IPK baik (>= 3,00 untuk skema prestasi) dan bebas sanksi akademik.',
      'Melampirkan dokumen pendapatan keluarga terbaru untuk pengajuan keringanan UKT atau beasiswa sosial alumni.',
      'Aktif dalam kegiatan kemahasiswaan/UKM POLBAN.'
    ],
    stages: [
      'Memantau pengumuman Subbagian Kemahasiswaan pada portal resmi polban.ac.id.',
      'Mengisi formulir pengajuan & mengunggah berkas ke sistem informasi akademik POLBAN.',
      'Verifikasi berkas & wawancara oleh pembimbing kemahasiswaan jurusan/institusi.',
      'Pengumuman penerima bantuan atau penyesuaian UKT per semester.'
    ],
    officialUrl: 'https://www.polban.ac.id',
    deadlineNote: 'Setiap awal semester & seleksi alumni'
  },
  {
    id: 'internal-unpas',
    title: 'Beasiswa Yayasan, Tahfidz & PMDK UNPAS',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Pasundan (UNPAS)',
    logo: 'assets/logos/logo_unpas.png',
    level: 'S1 (Jalur PMDK, Tahfidz & KIP)',
    campuses: 'UNPAS Bandung (Setiabudi, Tamansari, Lengkong & Sumatra)',
    benefit: 'Potongan Dana Pengembangan (DP) / biaya masuk hingga bebas DP, penyaluran kuota KIP Kuliah Merdeka PTS, serta beasiswa kader/tahfidz.',
    summary: 'Kesempatan keringanan biaya masuk dan kuliah bagi lulusan MA/pesantren serta keluarga besar Paguyuban Pasundan di UNPAS Bandung.',
    requirements: [
      'Calon mahasiswa baru lulusan SMA/SMK/MA mendaftar melalui jalur PMDK atau Prestasi UNPAS.',
      'Memiliki nilai rapor rata-rata >= 75–80 atau sertifikat hafalan Al-Qur’an / prestasi keagamaan / seni Sunda & olahraga.',
      'Jalur KIP Kuliah UNPAS: wajib memiliki akun KIP Kuliah Kemdiktisaintek yang aktif.',
      'Melampirkan surat rekomendasi sekolah/pesantren asal.'
    ],
    stages: [
      'Registrasi calon mahasiswa di pmb.unpas.ac.id dan pilih jalur PMDK/Beasiswa.',
      'Unggah dokumen rapor/sertifikat prestasi/KIP Kuliah sesuai syarat jalur.',
      'Verifikasi berkas dan wawancara seleksi oleh Panitia PMB UNPAS.',
      'Pengumuman SK kelulusan dan potongan biaya kuliah.'
    ],
    officialUrl: 'https://pmb.unpas.ac.id',
    deadlineNote: 'Gelombang PMDK I–III (Januari – Agustus)'
  },
  {
    id: 'internal-umb',
    title: 'Beasiswa KIP, Tahfidz & Kader UM Bandung',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Muhammadiyah Bandung (UMB)',
    logo: 'assets/logos/logo_umb.png',
    level: 'S1 Jalur Hafidz, Prestasi & KIP Kuliah',
    campuses: 'UM Bandung (Soekarno-Hatta, Cibiru)',
    benefit: 'Potongan biaya kuliah/SPP 25%–100% untuk Hafidz 3–30 Juz, Beasiswa Kader Persyarikatan & penyaluran penuh KIP Kuliah Merdeka.',
    summary: 'Kampus Islam modern di Bandung Timur dengan alokasi besar untuk jalur tahfidz Al-Qur’an, aktivis pesantren/IPM, serta KIP Kuliah.',
    requirements: [
      'Calon mahasiswa baru UM Bandung yang memiliki sertifikat hafalan Al-Qur’an minimal 3 juz (jalur Tahfidz) atau surat tugas kader.',
      'Jalur Prestasi: piagam kejuaraan tingkat kabupaten/provinsi/nasional bidang akademik maupun non-akademik.',
      'Jalur KIP Kuliah: terdaftar DTKS/SKTM dan lulus seleksi administrasi tim KIP UM Bandung.',
      'Bersedia mengikuti program pembinaan Al-Islam dan Kemuhammadiyahan.'
    ],
    stages: [
      'Pendaftaran online melalui portal pmb.umbandung.ac.id.',
      'Memilih jalur Beasiswa (Tahfidz / Prestasi / Kader / KIP) dan mengunggah bukti pendukung.',
      'Mengikuti tes wawancara & ujian sambung ayat (untuk pendaftar Beasiswa Tahfidz).',
      'Pengumuman kelulusan beserta besaran beasiswa.'
    ],
    officialUrl: 'https://pmb.umbandung.ac.id',
    deadlineNote: 'Gelombang 1–3 (Januari – September)'
  },
  {
    id: 'internal-unpar',
    title: 'Beasiswa Mahasiswa Aktif & Prestasi UNPAR',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Katolik Parahyangan (UNPAR)',
    logo: 'assets/logos/logo_unpar.png',
    level: 'D3 / S1 (Maba & Mahasiswa Aktif)',
    campuses: 'UNPAR Bandung (Ciumbuleuit)',
    benefit: 'Potongan biaya SKS/SPP per semester (50%–100%) melalui Beasiswa Prestasi Akademik/Olahraga/Seni serta Beasiswa Bantuan Sosial UNPAR.',
    summary: 'Skema beasiswa internal UNPAR berbasis prestasi akademik (USM/IPK tinggi), bakat olahraga/seni nasional, dan bantuan ekonomi.',
    requirements: [
      'Mahasiswa baru yang diterima lewat jalur PMDK/USM Berprestasi atau mahasiswa aktif UNPAR.',
      'IPK minimal 3,25 (skema prestasi) atau 2,75 dengan kondisi keterbatasan finansial keluarga (skema bantuan sosial).',
      'Melampirkan data ekonomi keluarga atau sertifikat kejuaraan tingkat nasional.',
      'Mengajukan permohonan sesuai periode registrasi Direktorat Kemahasiswaan UNPAR.'
    ],
    stages: [
      'Pendaftaran daring melalui laman resmi kemahasiswaan.unpar.ac.id atau portal PMB UNPAR.',
      'Mengunggah transkrip/nilai rapor, surat permohonan, dan berkas ekonomi/prestasi.',
      'Seleksi berkas & wawancara verifikasi oleh Direktorat Kemahasiswaan & Alumni UNPAR.',
      'Penerbitan SK Penerima Beasiswa untuk pemotongan tagihan semester.'
    ],
    officialUrl: 'https://kemahasiswaan.unpar.ac.id',
    deadlineNote: 'Dibuka tiap semester (cek kalender kemahasiswaan UNPAR)'
  },
  {
    id: 'internal-widyatama',
    title: 'Beasiswa Prestasi, Rapor & KIP Universitas Widyatama',
    category: 'kampus',
    categoryLabel: 'Internal Kampus Bandung',
    provider: 'Universitas Widyatama (UTama)',
    logo: 'assets/logos/logo_widyatama.png',
    level: 'D3 / D4 / S1',
    campuses: 'Universitas Widyatama (Cikutra, Kota Bandung)',
    benefit: 'Bebas/potongan Dana Pembangunan & SPP hingga 100% lewat jalur Beasiswa Rapor, Hafidz/Keagamaan, Prestasi Non-Akademik & KIP Kuliah.',
    summary: 'Program beasiswa internal Universitas Widyatama bagi siswa berprestasi rapor, juara lomba/olahraga/seni, dan penerima KIP Kuliah PTS.',
    requirements: [
      'Lulusan SMA/SMK/MA yang mendaftar di Universitas Widyatama jalur Beasiswa/PMDK.',
      'Rata-rata nilai rapor >= 80–85 atau memiliki piagam juara kompetisi tingkat kota/provinsi/nasional.',
      'Untuk jalur KIP Kuliah: memiliki kartu registrasi KIP Kuliah aktif & lolos seleksi ekonomi kampus.',
      'Lulus seleksi berkas dan wawancara tim PMB Widyatama.'
    ],
    stages: [
      'Daftar online melalui pmb.widyatama.ac.id dan pilih kategori jalur beasiswa.',
      'Unggah nilai rapor SMA/MA, sertifikat prestasi, dan berkas KIP Kuliah (jika relevan).',
      'Mengikuti seleksi wawancara & verifikasi kelayakan tim PMB Widyatama.',
      'Mendapatkan SK penerima potongan biaya masuk/kuliah.'
    ],
    officialUrl: 'https://pmb.widyatama.ac.id',
    deadlineNote: 'Januari – Agustus setiap tahun'
  }
];

function initBeasiswaCatalog() {
  const grid = document.getElementById('beasiswa-cards-grid');
  if (!grid) return;

  const filterBtns = document.querySelectorAll('.beasiswa-filter-btn');
  const searchInput = document.getElementById('beasiswa-search');
  const countEl = document.getElementById('beasiswa-visible-count');
  const emptyState = document.getElementById('no-beasiswa-found');
  const toggleWrap = document.getElementById('beasiswa-toggle-wrap');
  const toggleBtn = document.getElementById('btn-toggle-all-beasiswa');

  const modal = document.getElementById('scholarship-modal');
  const modalBody = document.getElementById('scholarship-modal-body');
  const modalClose = document.getElementById('scholarship-modal-close');
  const modalBackdrop = modal?.querySelector('.scholarship-modal-backdrop');

  let activeFilter = 'all';
  let searchQuery = '';
  let showAll = false;

  const badgeColors = {
    pusat: 'bg-blue-50 text-blue-700 border-blue-200',
    daerah: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lembaga: 'bg-amber-50 text-amber-800 border-amber-200',
    kampus: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const shortLabel = { pusat: 'Pemerintah', daerah: 'Pemda', lembaga: 'Lembaga', kampus: 'Kampus' };

  function getInitialLimit() {
    return window.innerWidth < 768 ? 6 : 10;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openScholarshipModal(id) {
    const item = SCHOLARSHIPS_DATA.find(s => s.id === id);
    if (!item || !modal || !modalBody) return;

    const badgeClass = badgeColors[item.category] || 'bg-slate-100 text-slate-700 border-slate-200';
    const waText = encodeURIComponent(
      `Assalamu'alaikum Kang Muhamad Kahfi, saya ingin menanyakan informasi lebih lanjut mengenai ${item.title}.`
    );

    modalBody.innerHTML = `
      <div class="flex items-start gap-4 pr-8">
        <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
          <img src="${item.logo}" alt="Logo ${escapeHtml(item.title)}" class="w-full h-full object-contain" />
        </div>
        <div class="min-w-0">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}">
            ${escapeHtml(item.categoryLabel)}
          </span>
          <h3 class="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 leading-snug">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5 font-medium">
            ${escapeHtml(item.provider)} &middot; Jenjang ${escapeHtml(item.level)}
          </p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cakupan Kampus</div>
          <p class="text-slate-800 font-medium leading-relaxed">${escapeHtml(item.campuses)}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
          <div class="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">Periode Pendaftaran</div>
          <p class="text-slate-800 font-medium leading-relaxed">${escapeHtml(item.deadlineNote)}</p>
        </div>
      </div>

      <div class="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
        <div class="text-xs font-bold text-[#0f2e59] mb-1">Informasi &amp; Manfaat Beasiswa</div>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${escapeHtml(item.benefit)}</p>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">${escapeHtml(item.summary)}</p>
      </div>

      <div class="mt-5">
        <h4 class="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-[#0f2e59] text-white text-[10px] inline-flex items-center justify-center">✓</span>
          Persyaratan Utama
        </h4>
        <ul class="space-y-2 text-xs text-slate-700">
          ${item.requirements
            .map(
              req => `
            <li class="flex items-start gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100">
              <span class="text-emerald-600 font-bold shrink-0">&bull;</span>
              <span class="leading-relaxed">${escapeHtml(req)}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>

      <div class="mt-5">
        <h4 class="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] inline-flex items-center justify-center">1</span>
          Tahapan Seleksi
        </h4>
        <ol class="space-y-2 text-xs text-slate-700">
          ${item.stages
            .map(
              (stage, idx) => `
            <li class="flex items-start gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100">
              <span class="w-5 h-5 rounded-full bg-[#0f2e59]/10 text-[#0f2e59] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">${
                idx + 1
              }</span>
              <span class="leading-relaxed">${escapeHtml(stage)}</span>
            </li>`
            )
            .join('')}
        </ol>
      </div>

      <div class="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
        <a href="${item.officialUrl}" target="_blank" rel="noopener noreferrer"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f2e59] hover:bg-[#173f78] text-white text-xs font-bold transition-colors shadow-sm">
          <span>Buka Link Resmi Beasiswa</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
        <a href="https://wa.me/6289630536815?text=${waText}" target="_blank" rel="noopener noreferrer"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>Tanya Muhamad Kahfi (0896-3053-6815)</span>
        </a>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  function closeScholarshipModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function renderCards() {
    const q = searchQuery.trim().toLowerCase();
    const filtered = SCHOLARSHIPS_DATA.filter(item => {
      const matchCat = activeFilter === 'all' || item.category === activeFilter;
      if (!matchCat) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.provider,
        item.categoryLabel,
        item.level,
        item.campuses,
        item.benefit,
        item.summary,
        ...item.requirements
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const isFilteredOrExpanded = showAll || activeFilter !== 'all' || q.length > 0;
    const limit = getInitialLimit();
    const itemsToShow = isFilteredOrExpanded ? filtered : filtered.slice(0, limit);

    if (countEl) {
      countEl.textContent = String(filtered.length);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState?.classList.remove('hidden');
      toggleWrap?.classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    emptyState?.classList.add('hidden');

    grid.innerHTML = itemsToShow
      .map(item => `
        <button type="button" class="beasiswa-card pg-row" data-open-beasiswa="${item.id}">
          <span class="pg-logo"><img src="${item.logo}" alt="" loading="lazy" /></span>
          <span class="pg-row-text">
            <span class="pg-row-title">${escapeHtml(item.title)}</span>
            <span class="pg-row-sub">${escapeHtml(item.provider)} &middot; ${escapeHtml(item.level)}</span>
          </span>
          <span class="pg-chip">${escapeHtml(shortLabel[item.category] || item.categoryLabel)}</span>
          <i data-lucide="chevron-right"></i>
        </button>`)
      .join('');

    if (toggleWrap && toggleBtn) {
      if (activeFilter === 'all' && q.length === 0 && filtered.length > limit) {
        toggleWrap.classList.remove('hidden');
        toggleBtn.innerHTML = showAll
          ? '<span>Tampilkan lebih sedikit</span><i data-lucide="chevron-up" class="w-4 h-4"></i>'
          : `<span>Lihat semua ${filtered.length} beasiswa</span><i data-lucide="chevron-down" class="w-4 h-4"></i>`;
      } else {
        toggleWrap.classList.add('hidden');
      }
    }

    grid.querySelectorAll('[data-open-beasiswa]').forEach(btn => {
      btn.addEventListener('click', () => {
        openScholarshipModal(btn.getAttribute('data-open-beasiswa'));
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-beasiswa-filter') || 'all';
      showAll = false;
      filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      renderCards();
    });
  });

  searchInput?.addEventListener('input', e => {
    searchQuery = e.target.value || '';
    showAll = false;
    renderCards();
  });

  toggleBtn?.addEventListener('click', () => {
    showAll = !showAll;
    renderCards();
  });

  modalClose?.addEventListener('click', closeScholarshipModal);
  modalBackdrop?.addEventListener('click', closeScholarshipModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeScholarshipModal();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!showAll && activeFilter === 'all' && !searchQuery) {
        renderCards();
      }
    }, 150);
  });

  renderCards();
}

