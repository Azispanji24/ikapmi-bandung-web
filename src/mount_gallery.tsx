import * as React from "react";
import { createRoot } from "react-dom/client";
import { CoverflowCarousel } from "./components/ui/coverflow-carousel";
import galleryData from "./gallery_data.json";

function GalleryApp() {
  return (
    <CoverflowCarousel
      slides={galleryData}
      cardWidth="clamp(210px, 26vw, 340px)"
      rotate={42}
      depth={0.65}
      perspective={3.2}
      falloff={0.58}
      fade={0.12}
      gap={0.07}
      loop={true}
      showCaption={false}
      showNavigation={true}
      autoplay={true}
      autoplayInterval={3500}
      label="Galeri Momen IKAPMI Regional Bandung"
    />
  );
}

const container = document.getElementById("coverflow-gallery-root");
if (container) {
  const root = createRoot(container);
  root.render(<GalleryApp />);
}
