import * as React from "react";
import { createRoot } from "react-dom/client";
import { TeamLanyardRail, LanyardMember } from "./components/ui/team-lanyard-rail";

const IKAPMI_OFFICERS: LanyardMember[] = [
  {
    id: "ketua-umum",
    name: "M Rifqi Fauzan",
    role: "Ketua Umum",
    team: "IKAPMI Bandung · BPH",
    image: "assets/pengurus/ketua_umum_rifqi.jpg",
    bio: "Memegang komando kepemimpinan tertinggi, penentu arah kebijakan strategis organisasi, dan representasi resmi IKAPMI Regional Bandung.",
    tags: ["Ketua Umum", "Astra Nowanta", "2025–2026"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" },
      { label: "Web", href: "#" }
    ],
    drop: 10
  },
  {
    id: "wakil-ketua",
    name: "Fadhlan",
    role: "Wakil Ketua Umum",
    team: "IKAPMI Bandung · BPH",
    image: "assets/pengurus/wakil_ketua_fadhlan.jpg",
    bio: "Membantu Ketua Umum dalam koordinasi kerja lintas bidang, pengawasan internal, dan kesinambungan program kerja kabinet.",
    tags: ["Wakil Ketua", "Operasional", "BPH"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 22
  },
  {
    id: "sekretaris-jenderal",
    name: "Maryam Silva",
    role: "Sekretaris Jenderal",
    team: "IKAPMI Bandung · BPH",
    image: "assets/pengurus/sekretaris_maryam.jpg",
    bio: "Bertanggung jawab penuh atas tata kelola administrasi surat-menyurat, pengarsipan resmi, notulensi rapat, dan regulasi keorganisasian.",
    tags: ["Sekjen", "Administrasi", "BPH"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 6
  },
  {
    id: "bendahara-umum",
    name: "Ribka Atiyatul",
    role: "Bendahara Umum",
    team: "IKAPMI Bandung · BPH",
    image: "assets/pengurus/bendahara_ribka.jpg",
    bio: "Mengelola sirkulasi keuangan organisasi, perbendaharaan kas, transparansi anggaran tiap kegiatan, dan pelaporan berkala.",
    tags: ["Bendahara", "Keuangan", "BPH"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 18
  },
  {
    id: "bidang-pao",
    name: "Ahmad Ghozi",
    role: "Ketua Bidang PAO",
    team: "IKAPMI Bandung · PAO",
    image: "assets/pengurus/bidang_pao_ghozi.jpg",
    bio: "Pengembangan Anggota & Organisasi: Fokus kaderisasi alumni, pendataan per angkatan, dan penguatan persaudaraan internal (IBANES).",
    tags: ["Kaderisasi", "Soliditas", "PAO"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 24
  },
  {
    id: "bidang-pik",
    name: "Bagas Jabbar",
    role: "Ketua Bidang PIK",
    team: "IKAPMI Bandung · PIK",
    image: "assets/pengurus/bidang_pik_bagas.jpg",
    bio: "Pendidikan & Informasi Keilmuan: Menggawangi forum intelektual, riset kealumnian, kajian keagamaan, serta pendampingan akademik.",
    tags: ["Intelektual", "Kajian", "PIK"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 12
  },
  {
    id: "bidang-kominfo",
    name: "Rahma Mutmainah",
    role: "Ketua Bidang Kominfo",
    team: "IKAPMI Bandung · Kominfo",
    image: "assets/pengurus/bidang_kominfo_rahma.jpg",
    bio: "Komunikasi & Informasi: Memegang tata kelola media digital (@ikapmi.bandung), publikasi informasi kealumnian, dokumentasi kegiatan, dan sistem web.",
    tags: ["Kominfo", "Media & Informasi", "Kreatif"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 4
  },
  {
    id: "bidang-olahraga",
    name: "Liana",
    role: "Ketua Bidang Olahraga",
    team: "IKAPMI Bandung · Olahraga",
    image: "assets/pengurus/bidang_olahraga_liana.jpg",
    bio: "Olahraga & Kebugaran: Mengkoordinasikan agenda fisik, latihan rutin (futsal, badminton), dan turnamen persahabatan santri Bandung.",
    tags: ["Sportivitas", "Kebugaran", "Olahraga"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 16
  },
  {
    id: "bidang-soskem",
    name: "Nur Hikmah",
    role: "Ketua Bidang Soskem",
    team: "IKAPMI Bandung · Soskem",
    image: "assets/pengurus/bidang_soskem_nurhikmah.jpg",
    bio: "Sosial Kemasyarakatan: Aksi sosial peduli sesama, advokasi kesejahteraan anggota perantau, serta kolaborasi pengabdian santri.",
    tags: ["Sosial", "Kemasyarakatan", "Soskem"],
    links: [
      { label: "Instagram", href: "https://instagram.com/ikapmi.bandung" }
    ],
    drop: 8
  }
];

function App() {
  return (
    <TeamLanyardRail
      items={IKAPMI_OFFICERS}
      autoplay={true}
      interval={3500}
      labels={{
        flip: "",
        back: "",
        show: "Tampilkan"
      }}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          <a
            href="https://instagram.com/ikapmi.bandung"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-blue-700 transition-colors text-xs font-semibold shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @ikapmi.bandung di Instagram
          </a>
        </div>
      }
    />
  );
}

const container = document.getElementById("team-lanyard-root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
