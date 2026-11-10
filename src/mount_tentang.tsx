import * as React from "react";
import { createRoot } from "react-dom/client";
import { CardDeckCarousel, Slide } from "./components/ui/card-deck-carousel";

const TENTANG_SLIDES: Slide[] = [
  {
    image: "assets/tentang_utama.jpg",
    title: "Rumah Kedua Santri",
    caption: "Simpul silaturahmi & kehangatan alumni PMUQI di Bandung",
    alt: "Dokumentasi Kebersamaan Alumni IKAPMI Bandung",
  },
  {
    image: "assets/gathering_bonding.jpg",
    title: "Sadulur Ngahiji",
    caption: "Menjalin ukhuwah hangat tanpa sekat lintas angkatan",
    alt: "Keakraban Alumni IKAPMI Bandung",
  },
  {
    image: "assets/hero_mureg.jpg",
    title: "Musyawarah Regional",
    caption: "Regenerasi estafet kepemimpinan santri berkarakter",
    alt: "Musyawarah Regional IKAPMI Bandung",
  },
  {
    image: "assets/raker_team.jpg",
    title: "Rapat Kerja Strategis",
    caption: "Kolaborasi merancang program pemberdayaan alumni",
    alt: "Rapat Kerja Pengurus IKAPMI Bandung",
  },
  {
    image: "assets/gathering_portrait.jpg",
    title: "Khidmah & Kebersamaan",
    caption: "Berbakti bagi almamater dan masyarakat Priangan",
    alt: "Dokumentasi Khidmah Santri IKAPMI Bandung",
  },
];

function TentangCarouselApp() {
  return (
    <CardDeckCarousel
      slides={TENTANG_SLIDES}
      cardWidth="min(86vw, 360px)"
      aspect="4 / 5"
      scatter={7}
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
