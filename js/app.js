/**
 * IKAPMI Regional Bandung - Official Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroInteractiveCard();
  initOrgFilter();
  initCampusFilter();
  initMentorshipTabs();
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

  if (!dock || !drop || !navItems.length) return;

  let isHovering = false;
  let activeElement = navItems[0];

  // Helper to move the real water droplet indicator with physics spring easing
  function moveDropTo(el) {
    if (!el) return;
    const left = el.offsetLeft;
    const width = el.offsetWidth;
    drop.style.transform = `translate3d(${left}px, 0, 0)`;
    drop.style.width = `${width}px`;
    drop.style.opacity = '1';
  }

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

  // Scrollspy & Scroll Shadow Integration
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

  // Mobile Menu Toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isClosed = mobileMenu.classList.toggle('hidden');
      mobileToggle.setAttribute('aria-expanded', !isClosed ? 'true' : 'false');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
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

  function applyFilter(category, query = '') {
    const cat = (category || 'all').trim().toLowerCase();
    const q = (query || '').trim().toLowerCase();
    const queryWords = q.split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    campusCards.forEach(card => {
      const cardCat = (card.getAttribute('data-category') || card.getAttribute('data-campus') || '').toLowerCase();
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardText = (card.textContent || '').toLowerCase() + ' ' + cardKeywords;

      const matchCat = (cat === 'all') || (cardCat === cat) || cardCat.includes(cat);
      const matchQuery = queryWords.length === 0 || queryWords.every(word => cardText.includes(word));

      if (matchCat && matchQuery) {
        card.style.display = 'flex';
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    if (noResult) {
      if (visibleCount === 0) {
        noResult.classList.remove('hidden');
      } else {
        noResult.classList.add('hidden');
      }
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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

  // 12 Curated Authentic Photos (4 MUREG, 4 RAKER, 4 IBANES) - Uncrowded, aesthetic, ample breathing room
  const tunnelData = [
    { src: "assets/mureg_IMG_6774.JPG", title: "Sidang Pleno MUREG 2025", desc: "Pembukaan resmi sidang pleno Musyawarah Regional IKAPMI Bandung." },
    { src: "assets/raker_IMG_1705.JPG", title: "Pemaparan Program RAKER 2025", desc: "Pemaparan rencana kerja strategis pengurus kabinet Astra Nowanta." },
    { src: "assets/day2_DSC01245.JPG", title: "Keakraban Sadulur Ngahiji", desc: "Momen kehangatan dan keakraban alumni santri di alam terbuka Bandung." },
    { src: "assets/mureg_IMG_6776.JPG", title: "Presidium Sidang Regional", desc: "Presidium sidang memandu jalannya musyawarah secara demokratis." },
    { src: "assets/raker_IMG_1711.JPG", title: "Konsolidasi Komisi Kerja", desc: "Musyawarah komisi membedah kebutuhan anggota di setiap kampus." },
    { src: "assets/day2_DSC01248.JPG", title: "Dinamika Persaudaraan", desc: "Aktivitas kebersamaan mempererat ikatan emosional santri perantau." },
    { src: "assets/mureg_IMG_6779.JPG", title: "Peserta Musyawarah", desc: "Partisipasi aktif anggota dalam perumusan arah gerak organisasi." },
    { src: "assets/raker_IMG_1729.JPG", title: "Sinergi Kabinet Astra Nowanta", desc: "Kekompakan pengurus kabinet Astra Nowanta dalam rapat kerja tahunan." },
    { src: "assets/day2_DSC01258.JPG", title: "Senyum Santri Perantau", desc: "Ceria, tawa, dan kehangatan persaudaraan sejati di tatar Pasundan." },
    { src: "assets/mureg_IMG_6790.JPG", title: "Forum Pleno Tertinggi", desc: "Laporan pertanggungjawaban dan penetapan keputusan penting organisasi." },
    { src: "assets/raker_IMG_1734.JPG", title: "Perumusan Gagasan Strategis", desc: "Diskusi mendalam perumusan indikator keberhasilan program tiap divisi." },
    { src: "assets/day2_DSC01268.JPG", title: "Potret Generasi Berprestasi", desc: "Alumni santri siap berkarya dan membawa nama baik almamater di Bandung." }
  ];

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
    el.className = 'tunnel-card-item pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer';
    el.style.transformStyle = 'preserve-3d';
    
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
  let targetProgress = 0;
  let currentProgress = 0;
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
    if (isScrollingUp && targetProgress <= 0.015) {
      targetProgress = 0;
      return; // Do NOT preventDefault! Let page scroll normally back up
    }

    // Otherwise, we are full in view and navigating inside the 3D tunnel corridor
    e.preventDefault();
    const delta = e.deltaY * 0.0008;
    targetProgress = Math.max(0, Math.min(1, targetProgress + delta));
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

    if (isDragging) {
      const delta = (dragStartY - e.clientY) * 0.002;
      targetProgress = Math.max(0, Math.min(1, dragStartProgress + delta));
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
    if (e.touches.length === 1 && isContainerInFullView()) {
      const delta = (dragStartY - e.touches[0].clientY) * 0.0022;
      targetProgress = Math.max(0, Math.min(1, dragStartProgress + delta));
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
      ? Math.max(140, Math.min(190, stageWidth * 0.38))
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
    image: "assets/hero_mureg.jpg",
    content: `
      <p class="mb-4">Sebagai wujud khidmah dan bakti kepada almamater tercinta di Leuwiliang Bogor, delegasi IKAPMI Regional Bandung hadir secara langsung dalam agenda tahunan Campus Expo di MA Ummul Quro Al-Islami.</p>
      <p class="mb-4">Delegasi Bandung mendirikan booth informasi khusus yang memperkenalkan ragam perguruan tinggi ternama di Bandung Raya, seperti UIN SGD, UNPAD, UPI, ITB, dan Telkom University. Para santri kelas akhir tampak sangat antusias berkonsultasi mengenai jalur seleksi masuk (SNBP, SNBT, SPAN-PTKIN, dan Ujian Mandiri).</p>
      <p class="mb-4">Selain membagikan brosur dan modul panduan belajar, tim IKAPMI Bandung juga mengadakan sesi bedah jurusan dan sharing kiat sukses menembus kampus impian bersama para kakak tingkat.</p>
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
        modalContent.innerHTML = `
          <div class="mb-4">
            <span class="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-100 text-[#0f2e59] mb-3">${data.tag}</span>
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">${data.title}</h2>
            <div class="flex items-center gap-4 text-xs text-slate-500 mt-3 pb-4 border-b border-slate-100">
              <span>📅 ${data.date}</span>
              <span>✍️ ${data.author}</span>
            </div>
          </div>
          <div class="rounded-xl overflow-hidden mb-6 max-h-80">
            <img src="${data.image}" alt="${data.title}" class="w-full h-full object-cover">
          </div>
          <div class="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
            ${data.content}
          </div>
        `;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
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
  const statusBanner = document.getElementById('reg-status-banner');

  const savedData = JSON.parse(localStorage.getItem('ikapmi_alumni_db') || '[]');
  const baseCount = 696;
  if (statsCount) {
    statsCount.textContent = (baseCount + savedData.length).toString();
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? 'Menyimpan Data...' : 'Simpan Data Alumni';
    }
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nama = document.getElementById('reg-nama').value.trim();
      const angkatan = document.getElementById('reg-angkatan').value.trim();
      const whatsapp = document.getElementById('reg-wa').value.trim();
      const kampus = document.getElementById('reg-kampus').value.trim();
      const jurusan = document.getElementById('reg-jurusan').value.trim();
      const status = document.getElementById('reg-status').value;
      const domisili = document.getElementById('reg-domisili').value.trim();

      if (!nama || !angkatan || !whatsapp || !kampus) {
        const errMsg = 'Mohon lengkapi nama, angkatan, nomor WhatsApp, dan kampus Anda.';
        showStatusBanner(errMsg, 'error');
        showToast(errMsg, 'error');
        return;
      }

      const cleanedDigits = whatsapp.replace(/\D/g, '');
      if (cleanedDigits.length < 9 || cleanedDigits.length > 16) {
        const waErr = 'Nomor WhatsApp tampak kurang tepat. Mohon periksa kembali (contoh: 081234567890).';
        showStatusBanner(waErr, 'error');
        showToast(waErr, 'error');
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
        const successMsg = `Alhamdulillah! Syukran ${nama}, data alumni Anda berhasil tersimpan ke Database Resmi IKAPMI Regional Bandung.`;
        showStatusBanner(successMsg, 'success');
        showToast(successMsg, 'success');
      } catch (err) {
        const failMsg = 'Gagal mengirim data ke Google Sheets. Periksa koneksi internet Anda lalu klik Simpan Data Alumni kembali.';
        showStatusBanner(failMsg, 'error');
        showToast(failMsg, 'error');
        console.warn('Alumni registration submit error:', err);
      } finally {
        setSubmitting(false);
      }
    });
  }

  let toastTimer = null;
  function showToast(message, type = 'success') {
    if (!toast) return;
    const toastMsg = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.innerHTML = type === 'success' ? '✓' : '⚠️';
      toastIcon.className = `toast-icon w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${type === 'success' ? 'bg-[#0f2e59] text-white' : 'bg-amber-500 text-white'}`;
    }

    toast.classList.remove('hidden', 'translate-y-8', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-8', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 5000);
  }
}

/* ----------------------------------------------------
   7. SCROLL OBSERVER REVEAL
---------------------------------------------------- */
function initScrollAnimations() {
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
        "schedule": "Januari – Maret 2026",
        "desc": "Seleksi prestasi akademik nasional berbasis nilai rapor semester 1–5 dan portofolio prestasi tanpa tes tertulis. Pendaftaran dilakukan oleh pihak madrasah/sekolah dan bebas biaya (100% Gratis).",
        "santriNote": "Jalur paling favorit bagi santri MA/SMA PMUQI. Kuota sangat besar pada prodi rumpun Ushuluddin, Syariah, Tarbiyah, Dakwah, dan Adab.",
        "link": "https://span.ptkin.ac.id"
      },
      {
        "name": "UM-PTKIN",
        "tag": "Ujian SSE Nasional (Kemenag)",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "April – Juni 2026",
        "desc": "Ujian seleksi serentak nasional menggunakan Sistem Seleksi Elektronik (SSE). Materi meliputi Penalaran Akademik, Penalaran Matematika, Literasi Membaca (Indonesia, Arab, Inggris), dan Literasi Ajaran Islam.",
        "santriNote": "Sangat menguntungkan bagi santri yang menguasai literasi keislaman dan dasar bahasa Arab. Dapat memilih hingga 3 prodi di PTKIN mana pun se-Indonesia.",
        "link": "https://um.ptkin.ac.id"
      },
      {
        "name": "SNBP & SNBT (Kemendikbud)",
        "tag": "Seleksi Nasional (SNPMB)",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Februari – Mei 2026",
        "desc": "Jalur seleksi terpusat Kemendikbudristek untuk program studi umum di bawah Kemendikbud di UIN SGD Bandung seperti Teknik Informatika, Biologi, Kimia, Agroteknologi, dan Psikologi.",
        "santriNote": "Cocok bagi santri lulusan IPA/IPS yang mengincar fakultas sains dan teknologi berakreditasi unggul dengan biaya kuliah UKT ramah kantong.",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "Jalur Mandiri UIN SGD (CBT & Tahfidz)",
        "tag": "Mandiri Lokal & Beasiswa",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Mei – Juli 2026",
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
    "shortDesc": "Komisariat utama di bidang kedokteran, hukum, ilmu komunikasi, ekonomi bisnis, dan ilmu budaya dengan jejaring alumni kuat.",
    "fullDesc": "Universitas Padjadjaran adalah salah satu perguruan tinggi negeri berbadan hukum terkemuka di Indonesia. Santri PMUQI tersebar di berbagai fakultas unggulan dengan dukungan bimbingan seleksi dan mentoring akademik dari IKAPMI Komisariat UNPAD.",
    "portal": "https://smup.unpad.ac.id",
    "pathways": [
      {
        "name": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
        "tag": "Prestasi Rapor Nasional (SNPMB)",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "Januari – Maret 2026",
        "desc": "Penjaringan berdasarkan konsistensi nilai rapor semester 1–5 serta portofolio prestasi siswa eligible yang didaftarkan pihak sekolah/madrasah.",
        "santriNote": "Peluang strategis bagi santri berperingkat paralel atas di MA/SMA untuk menembus prodi favorit Unpad tanpa tes tertulis.",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "SNBT (Seleksi Nasional Berbasis Tes UTBK)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei 2026",
        "desc": "Seleksi berbasis ujian tertulis UTBK nasional (Tes Potensi Skolastik, Literasi Bahasa, dan Penalaran Matematika). Memiliki porsi kuota terbesar (~40-50%).",
        "santriNote": "IKAPMI UNPAD rutin mengadakan mentoring belajar, pembahasan soal skolastik, dan strategi pemilihan jurusan bagi adik-adik santri.",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "SMUP Jalur Nilai Ujian (Nilai UTBK / Daring)",
        "tag": "Seleksi Mandiri SMUP",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "April – Juli 2026",
        "desc": "Seleksi mandiri Unpad menggunakan skor sertifikat UTBK SNBT Kemendikbud atau ujian daring SMUP yang diselenggarakan secara online.",
        "santriNote": "Sangat fleksibel dan praktis bagi santri; pendaftar cukup mengunggah skor UTBK tanpa harus datang langsung ke lokasi ujian.",
        "link": "https://smup.unpad.ac.id"
      },
      {
        "name": "SMUP Jalur Minat Bakat & Tahfidz Al-Qur'an",
        "tag": "Mandiri Prestasi & Keagamaan",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Maret – Juni 2026",
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
        "schedule": "Januari – Maret 2026",
        "desc": "Penjaringan calon mahasiswa berprestasi rapor dan portofolio untuk jenjang Sarjana (S1) dan Sarjana Terapan (D4) seluruh fakultas UPI.",
        "santriNote": "Pilihan tepat bagi santri berprestasi di MA/SMA untuk masuk prodi Pendidikan Bahasa Arab, PAI, Bahasa Inggris, atau jurusan sains.",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "SNBT (Seleksi Nasional Berbasis Tes UTBK)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei 2026",
        "desc": "Seleksi nasional dengan sistem tes skolastik, literasi bahasa, dan penalaran matematika terstandar untuk seluruh program studi di UPI.",
        "santriNote": "Tersedia kuota luas di kampus utama Bumi Siliwangi Setiabudi maupun kampus daerah (Cibiru, Purwakarta, Sumedang, Tasikmalaya).",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "Seleksi Mandiri Reguler (SM-UPI CBT)",
        "tag": "Ujian Komputer Mandiri",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Mei – Juli 2026",
        "desc": "Ujian seleksi mandiri berbasis komputer yang diselenggarakan secara independen oleh UPI untuk menguji potensi akademik dan bakat calon mahasiswa.",
        "santriNote": "Alternatif utama jika belum lolos jalur nasional dengan kuota mandiri yang cukup besar di kampus Bandung.",
        "link": "https://pmb.upi.edu"
      },
      {
        "name": "SM-PI UPI (Prestasi Istimewa & Tahfidz Quran)",
        "tag": "Mandiri Portofolio Khusus",
        "tagClass": "bg-amber-100 text-amber-900 border-amber-300",
        "schedule": "Mei – Juni 2026",
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
        "schedule": "Januari – Februari 2026",
        "desc": "Seleksi prestasi akademik nilai rapor matematika dan sains. ITB membuka opsi peminatan untuk langsung memilih program studi spesifik.",
        "santriNote": "Peluang besar bagi santri jurusan IPA berprestasi konsisten dan aktif di olimpiade sains/riset madrasah.",
        "link": "https://admission.itb.ac.id"
      },
      {
        "name": "SNBT (Seleksi Nasional UTBK Kemendikbud)",
        "tag": "Ujian UTBK Nasional",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Maret – Mei 2026",
        "desc": "Seleksi UTBK terpusat untuk memperebutkan kursi di fakultas bergengsi ITB (STEI, FTMD, FTTM, FMIPA, SBM, SAPPK, FTSL, FSRD).",
        "santriNote": "IKAPMI ITB siap memberikan arahan pemilihan fakultas serta sharing pengalaman belajar kurikulum TPB ITB.",
        "link": "https://snpmb.bppp.kemdikbud.go.id"
      },
      {
        "name": "Seleksi Mandiri ITB (SM-ITB)",
        "tag": "Ujian Daring & UTBK",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Mei – Juni 2026",
        "desc": "Ujian mandiri daring materi Matematika & Fisika (Saintek) / TPA + skor UTBK Kemendikbud + tes menggambar khusus calon mahasiswa FSRD.",
        "santriNote": "Tersedia skema KIP-Kuliah dan pembebasan IPI (uang pangkal) bagi calon mahasiswa berprestasi dari keluarga santri prasejahtera.",
        "link": "https://admission.itb.ac.id"
      },
      {
        "name": "International Undergraduate Program (IUP ITB)",
        "tag": "Kelas Internasional",
        "tagClass": "bg-purple-100 text-purple-800 border-purple-200",
        "schedule": "Januari – Juni 2026",
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
        "schedule": "Agustus 2025 – Februari 2026",
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
        "schedule": "Februari – April 2026",
        "desc": "Program beasiswa bergengsi bagi calon mahasiswa berprestasi keagamaan dan hafiz Al-Qur'an (minimal 5 hingga 30 juz).",
        "santriNote": "Memperoleh pembebasan biaya kuliah (BPP) hingga 100% sampai lulus serta pembinaan karakter di asrama kampus.",
        "link": "https://smb.telkomuniversity.ac.id"
      },
      {
        "name": "Jalur Vokasi & Kemitraan Digital",
        "tag": "Program Terapan Industri",
        "tagClass": "bg-cyan-100 text-cyan-800 border-cyan-200",
        "schedule": "Maret – Juli 2026",
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
    "fullDesc": "Komisariat gabungan yang menaungi santri di Politeknik Negeri Bandung (POLBAN) serta kampus swasta unggulan Bandung seperti Universitas Islam Bandung (UNISBA) dan Universitas Pasundan (UNPAS) dengan jalur masuk ramah nilai rapor dan beasiswa hafiz.",
    "portal": "https://pmb.unisba.ac.id",
    "pathways": [
      {
        "name": "POLBAN: SNBP, SNBT & SMBM (Politeknik Negeri)",
        "tag": "Politeknik Terapan Unggulan",
        "tagClass": "bg-blue-100 text-blue-800 border-blue-200",
        "schedule": "Januari – Juni 2026",
        "desc": "Seleksi nasional SNBP, SNBT, dan Seleksi Mandiri Bersama Politeknik Negeri (SMBM) untuk jurusan Teknik Rekayasa & Tata Niaga.",
        "santriNote": "Pilihan nomor 1 bagi santri yang menghendaki pendidikan aplikatif dengan laboratorium modern dan UKT negeri terjangkau.",
        "link": "https://pmb.polban.ac.id"
      },
      {
        "name": "UNISBA: PMDK (Rapor) & USM Daring (Unisba)",
        "tag": "PTS Bernafaskan Islam",
        "tagClass": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "schedule": "November 2025 – Juli 2026",
        "desc": "Penjaringan Minat dan Kemampuan (PMDK) berbasis rapor serta Ujian Saringan Masuk (USM) berkala untuk seluruh fakultas termasuk Kedokteran.",
        "santriNote": "Kultur kampus sangat akrab dengan santri (Ruhul Islam). Tersedia Beasiswa Hafiz Al-Qur'an dan kemudahan konversi prestasi pesantren.",
        "link": "https://pmb.unisba.ac.id"
      },
      {
        "name": "UNPAS: Jalur PMDK & Tes Gelombang 1-3",
        "tag": "Universitas Pasundan",
        "tagClass": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "schedule": "Desember 2025 – Agustus 2026",
        "desc": "Jalur PMDK rapor bebas tes dan ujian tertulis bertahap dengan fleksibilitas cicilan biaya kuliah serta program studi favorit.",
        "santriNote": "Pilihan favorit santri untuk Fakultas Hukum, FISIP (Hubungan Internasional & Humas), Kedokteran, dan Teknik Industri.",
        "link": "https://pmb.unpas.ac.id"
      }
    ]
  }
};

function initJalurKampus() {
  const selectorView = document.getElementById('jalur-selector-view');
  const detailView = document.getElementById('jalur-detail-view');
  const campusCards = document.querySelectorAll('.jalur-card');
  const backBtn = document.getElementById('btn-back-jalur');
  const quickBtns = document.querySelectorAll('.jalur-quick-btn');
  const pathwaysGrid = document.getElementById('detail-pathways-grid');

  if (!selectorView || !detailView) return;

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
      bannerCount.textContent = `${data.pathways.length} Jalur Tersedia`;
    }

    // Render pathways cards
    if (pathwaysGrid) {
      pathwaysGrid.innerHTML = data.pathways.map((p) => `
        <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.tagClass || 'bg-blue-100 text-blue-800 border-blue-200'} border">
                <span class="w-1.5 h-1.5 rounded-full ${data.dotColor || 'bg-blue-500'}"></span>
                <span>${p.tag}</span>
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i>
                <span>${p.schedule}</span>
              </span>
            </div>

            <h5 class="font-serif text-lg font-bold text-slate-900 group-hover:text-brand-800 transition-colors leading-snug">
              ${p.name}
            </h5>

            <p class="text-xs text-slate-600 mt-2 leading-relaxed">
              ${p.desc}
            </p>

            <div class="mt-3.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2.5">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
              <div class="leading-relaxed">
                <strong class="font-semibold text-amber-900 block mb-0.5">Catatan Khusus Santri:</strong>
                <span>${p.santriNote}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Informasi Resmi</span>
            <a href="${p.link}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:text-amber-600 transition-colors">
              <span>Buka Tautan</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
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
