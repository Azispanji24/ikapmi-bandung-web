import * as React from "react";
import { createRoot } from "react-dom/client";
import { TeamLanyardRail, LanyardMember } from "./components/ui/team-lanyard-rail";

const IKAPMI_OFFICERS: LanyardMember[] = [
  {
    "id": "hafizh-najwal",
    "name": "Hafizh Najwal",
    "role": "Ketua Umum",
    "team": "IKAPMI Bandung · BPH",
    "image": "assets/pengurus/hafizh-najwal.jpg",
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
    "image": "assets/pengurus/muhammad-kahfi.jpg",
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
    "id": "ramji-al-jamali",
    "name": "Ramji Al Jamali",
    "role": "Bidang PSDO",
    "team": "IKAPMI Bandung · PSDO",
    "image": "assets/pengurus/ramji-al-jamali.jpg",
    "bio": "Pengembangan Sumber Daya Organisasi: Mengelola potensi internal, soliditas pengurus, dan pengembangan kapasitas keorganisasian alumni.",
    "tags": [
      "PSDO",
      "Organisasi",
      "Kapasitas"
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
    "id": "iddal-wihdatil",
    "name": "Iddal Wihdatil Jalillah",
    "role": "Bidang PSDO",
    "team": "IKAPMI Bandung · PSDO",
    "image": "assets/pengurus/iddal-wihdatil.jpg",
    "bio": "Pengembangan Sumber Daya Organisasi: Penguatan keakraban antar-komisariat, upgrading kader, dan pendampingan struktural pengurus.",
    "tags": [
      "PSDO",
      "Kaderisasi",
      "Soliditas"
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
    "id": "wulan-nur-afiq",
    "name": "Wulan Nur Afiq Ashihab",
    "role": "Bidang PSDO",
    "team": "IKAPMI Bandung · PSDO",
    "image": "assets/pengurus/wulan-nur-afiq.jpg",
    "bio": "Pengembangan Sumber Daya Organisasi: Tata kelola sumber daya pengurus, database keaktifan, dan regenerasi kepemimpinan santri.",
    "tags": [
      "PSDO",
      "Regenerasi",
      "SDM"
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
    "id": "muhammad-fairuzzabadi",
    "name": "Muhammad Fairuzzabadi",
    "role": "Bidang PIK",
    "team": "IKAPMI Bandung · PIK",
    "image": "assets/pengurus/muhammad-fairuzzabadi.jpg",
    "bio": "Pengembangan Intelektual & Keislaman: Mengawal kajian keagamaan kontemporer, diskusi ilmiah, serta pembinaan spiritual santri.",
    "tags": [
      "PIK",
      "Intelektual",
      "Keislaman"
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
    "id": "rizqi-rehan",
    "name": "Muhammad Rizqi Rehan Hamdillah",
    "role": "Bidang PIK",
    "team": "IKAPMI Bandung · PIK",
    "image": "assets/pengurus/rizqi-rehan.jpg",
    "bio": "Pengembangan Intelektual & Keislaman: Mengoordinasikan forum keilmuan, riset alumni, dan pendampingan prestasi akademik.",
    "tags": [
      "PIK",
      "Akademik",
      "Riset"
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
    "id": "aulia-advia",
    "name": "Aulia Advia",
    "role": "Bidang PIK",
    "team": "IKAPMI Bandung · PIK",
    "image": "assets/pengurus/aulia-advia.jpg",
    "bio": "Pengembangan Intelektual & Keislaman: Program literasi santri, pengkajian kitab, dan penguatan nilai-nilai ke-Ummul Quro-an.",
    "tags": [
      "PIK",
      "Literasi",
      "Kajian"
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
    "id": "isfahani-fadhil",
    "name": "Muhamad Isfahani Fadhil Rahman",
    "role": "Bidang KOMINFO",
    "team": "IKAPMI Bandung · KOMINFO",
    "image": "assets/pengurus/isfahani-fadhil.jpg",
    "bio": "KOMINFO: Tata kelola publikasi media sosial, dokumentasi visual, desain grafis, dan siaran warta kealumnian.",
    "tags": [
      "KOMINFO",
      "Media",
      "Publikasi"
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
    "id": "rahma-muthmainah",
    "name": "Rahma Muthmainah",
    "role": "Bidang KOMINFO",
    "team": "IKAPMI Bandung · KOMINFO",
    "image": "assets/pengurus/rahma-muthmainah.jpg",
    "bio": "KOMINFO: Mengelola konten digital kreatif (@ikapmi.bandung), branding visual, dan komunikasi publik alumni.",
    "tags": [
      "KOMINFO",
      "Kreatif",
      "Branding"
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
    "id": "veron-djuan",
    "name": "Veron Djuan Sutisna",
    "role": "Bidang KOMINFO",
    "team": "IKAPMI Bandung · KOMINFO",
    "image": "assets/pengurus/veron-djuan.jpg",
    "bio": "KOMINFO: Pengelolaan dokumentasi multimedia, produksi video kegiatan, dan pemeliharaan website resmi.",
    "tags": [
      "KOMINFO",
      "Multimedia",
      "Web"
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
    "id": "novita-dea-naila",
    "name": "Novita Dea Naila Izdihar",
    "role": "Bidang KOMINFO",
    "team": "IKAPMI Bandung · KOMINFO",
    "image": "assets/pengurus/novita-dea-naila.jpg",
    "bio": "KOMINFO: Hubungan masyarakat lintas media, penulisan rilis berita acara, dan kampanye digital santri.",
    "tags": [
      "KOMINFO",
      "Humas",
      "Informasi"
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
    "id": "fadlan-ahmad",
    "name": "Fadlan Ahmad Rizki",
    "role": "Bidang Sosem",
    "team": "IKAPMI Bandung · Sosem",
    "image": "assets/pengurus/fadlan-ahmad.jpg",
    "bio": "Sosem (Sosial & Ekonomi): Aksi sosial kemanusiaan, advokasi kesejahteraan santri perantau, serta inkubasi kewirausahaan mandiri alumni.",
    "tags": [
      "Sosem",
      "Sosial",
      "Ekonomi"
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
    "id": "azmi-putri",
    "name": "Azmi Putri",
    "role": "Bidang Sosem",
    "team": "IKAPMI Bandung · Sosem",
    "image": "assets/pengurus/azmi-putri.jpg",
    "bio": "Sosem (Sosial & Ekonomi): Program bakti sosial peduli umat, penggalangan dana kemanusiaan, dan kemitraan ekonomi produktif.",
    "tags": [
      "Sosem",
      "Bakti Sosial",
      "Pengabdian"
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
    "id": "fadhira-fauziah",
    "name": "Fadhira Fauziah Hasna",
    "role": "Bidang Sosem",
    "team": "IKAPMI Bandung · Sosem",
    "image": "assets/pengurus/fadhira-fauziah.jpg",
    "bio": "Sosem (Sosial & Ekonomi): Pemberdayaan potensi ekonomi kreatif santri, merchandise kealumnian, dan jaring pengaman sosial perantauan.",
    "tags": [
      "Sosem",
      "Pemberdayaan",
      "Kreatif"
    ],
    "links": [
      {
        "label": "Instagram",
        "href": "https://instagram.com/ikapmi.bandung"
      }
    ],
    "drop": 20
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
