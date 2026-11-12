import * as React from "react";
import { createRoot } from "react-dom/client";
import { CardDeckCarousel, Slide } from "./components/ui/card-deck-carousel";

const TENTANG_SLIDES: Slide[] = [
  {
    image: "assets/tentang/tentang_01.jpg",
    title: "Rumah Kedua Santri",
    caption: "Simpul silaturahmi & kehangatan alumni PMUQI di Bandung",
    alt: "Foto Kebersamaan Pengurus & Anggota IKAPMI Bandung #1",
  },
  {
    image: "assets/tentang/tentang_02.jpg",
    title: "Sadulur Ngahiji",
    caption: "Menjalin ukhuwah hangat tanpa sekat lintas angkatan",
    alt: "Foto Ceria Keluarga Besar IKAPMI Bandung #2",
  },
  {
    image: "assets/tentang/tentang_03.jpg",
    title: "Semangat Kebersamaan",
    caption: "Solidaritas erat santri perantau Bumi Parahyangan",
    alt: "Foto Kebersamaan IKAPMI Bandung #3",
  },
  {
    image: "assets/tentang/tentang_04.jpg",
    title: "Energi Muda IKAPMI",
    caption: "Kompak berkarya dan saling menguatkan di tanah rantau",
    alt: "Pose Semangat Anggota IKAPMI Bandung #4",
  },
  {
    image: "assets/tentang/tentang_05.jpg",
    title: "Satu Tujuan Bersama",
    caption: "Berpegang pada adab pesantren serta siap berkontribusi",
    alt: "Pose Kompak Keluarga IKAPMI Bandung #5",
  },
  {
    image: "assets/tentang/tentang_06.jpg",
    title: "Warna Persaudaraan",
    caption: "Ruang pulang yang penuh canda, tawa, dan kekeluargaan",
    alt: "Momen Hangat Anggota IKAPMI Bandung #6",
  },
  {
    image: "assets/tentang/tentang_07.jpg",
    title: "Ekspresi Keakraban",
    caption: "Cerita akrab di sela kesibukan studi mahasiswa Bandung",
    alt: "Momen Akrab IKAPMI Bandung #7",
  },
  {
    image: "assets/tentang/tentang_08.jpg",
    title: "Khidmah & Persatuan",
    caption: "Berbakti bagi almamater dan masyarakat Bandung Raya",
    alt: "Dokumentasi Kebersamaan IKAPMI Bandung #8",
  },
];

function TentangCarouselApp() {
  return (
    <CardDeckCarousel
      slides={TENTANG_SLIDES}
      cardWidth="min(86vw, 540px)"
      aspect="1280 / 854"
      scatter={5}
      autoplay={4500}
      background="transparent"
      ink="#ffffff"
      ariaLabel="Foto Dokumentasi IKAPMI Regional Bandung"
    />
  );
}

const container = document.getElementById("card-deck-root");
if (container) {
  const root = createRoot(container);
  root.render(<TentangCarouselApp />);
}
