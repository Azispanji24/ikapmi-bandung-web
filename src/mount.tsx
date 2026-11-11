import * as React from "react";
import { createRoot } from "react-dom/client";
import { TeamLanyardRail, LanyardMember } from "./components/ui/team-lanyard-rail";

const IKAPMI_OFFICERS: LanyardMember[] = [
  {
    "id": "hafizh-najwal",
    "name": "Hafizh Najwal",
    "role": "Ketua Umum",
    "team": "IKAPMI Bandung · BPH",
    "image": "assets/pengurus/hafizh-najwal-Ketua-Umum.jpg",
    "bio": "Memegang pucuk pimpinan tertinggi, penentu arah kebijakan strategis organisasi, dan representasi resmi IKAPMI Regional Bandung.",
    "tags": [
      "Ketua Umum",
      "BPH",
      "2025–2026"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 4
  },
  {
    "id": "muhammad-kahfi",
    "name": "Muhammad Kahfi",
    "role": "Sekretaris Umum",
    "team": "IKAPMI Bandung · BPH",
    "image": "assets/pengurus/muhammad-kahfi-Sekretaris-Umum.jpg?v=20261112",
    "bio": "Bertanggung jawab penuh atas tata kelola administrasi surat-menyurat, pengarsipan resmi, notulensi rapat, dan regulasi keorganisasian.",
    "tags": [
      "Sekretaris Umum",
      "Administrasi",
      "BPH"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 8
  },
  {
    "id": "resti-fujianti",
    "name": "Resti Fujianti",
    "role": "Bendahara Umum",
    "team": "IKAPMI Bandung · BPH",
    "image": "assets/pengurus/Resti-Fujianti-Bendahara.jpg",
    "bio": "Bertanggung jawab atas pengelolaan keuangan organisasi, penyusunan anggaran program kerja, pelaporan kas transparan, dan tata kelola dana kealumnian.",
    "tags": [
      "Bendahara Umum",
      "Keuangan",
      "BPH"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 12
  },
  {
    "id": "ramji-al-jamali",
    "name": "Ramji Al Jamali",
    "role": "Ketua Bidang PSDO",
    "team": "IKAPMI Bandung · PSDO",
    "image": "assets/pengurus/ramji-al-jamali-ketua-bidang-PSDO.jpg",
    "bio": "Ketua Bidang Pengembangan Sumber Daya Organisasi: Mengelola potensi internal, soliditas pengurus, kaderisasi, dan pengembangan kapasitas keorganisasian alumni.",
    "tags": [
      "Ketua Bidang",
      "PSDO",
      "Organisasi"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 16
  },
  {
    "id": "rizqi-rehan",
    "name": "Muhammad Rizqi Rehan Hamdillah",
    "role": "Ketua Bidang PIK",
    "team": "IKAPMI Bandung · PIK",
    "image": "assets/pengurus/rizqi-rehan-ketua-bidang-PIK.jpg",
    "bio": "Ketua Bidang Pengembangan Intelektual & Keislaman: Mengoordinasikan kajian keagamaan, forum keilmuan, riset alumni, dan pendampingan prestasi akademik.",
    "tags": [
      "Ketua Bidang",
      "PIK",
      "Intelektual"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 20
  },
  {
    "id": "isfahani-fadhil",
    "name": "Muhamad Isfahani Fadhil Rahman",
    "role": "Ketua Bidang KOMINFO",
    "team": "IKAPMI Bandung · KOMINFO",
    "image": "assets/pengurus/isfahani-fadhil-ketua-bidang-KOMINFO.jpg",
    "bio": "Ketua Bidang KOMINFO: Mengoordinasikan publikasi media sosial, dokumentasi visual, branding (@ikapmi.bandung), dan siaran warta kealumnian.",
    "tags": [
      "Ketua Bidang",
      "KOMINFO",
      "Publikasi"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 4
  },
  {
    "id": "fadlan-ahmad",
    "name": "Fadlan Ahmad Rizki",
    "role": "Ketua Bidang Sosem",
    "team": "IKAPMI Bandung · Sosem",
    "image": "assets/pengurus/fadlan-ahmad-ketua-bidang-SOSKEM.jpg",
    "bio": "Ketua Bidang Sosem (Sosial & Ekonomi): Mengawal aksi sosial kemanusiaan, advokasi kesejahteraan santri perantau, serta inkubasi kewirausahaan alumni.",
    "tags": [
      "Ketua Bidang",
      "Sosem",
      "Sosial"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 8
  },
  {
    "id": "ahmad-shidqi",
    "name": "Ahmad Shidqi",
    "role": "Ketua Bidang Olahraga",
    "team": "IKAPMI Bandung · Olahraga",
    "image": "assets/pengurus/Ahmad-Shidqi-ketua-bidang-OLAHRAGA.jpeg",
    "bio": "Ketua Bidang Olahraga: Mengoordinasikan agenda olahraga rutin, turnamen keakraban santri perantau, serta mempererat ukhuwah melalui sportivitas.",
    "tags": [
      "Ketua Bidang",
      "Olahraga",
      "Ukhuwah"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 12
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
