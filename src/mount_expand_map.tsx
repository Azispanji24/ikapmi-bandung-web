import * as React from "react";
import { createRoot } from "react-dom/client";
import { LocationMap } from "./components/ui/expand-map";

function MountExpandMap() {
  return (
    <LocationMap
      location="Sekretariat IKAPMI Regional Bandung"
      subLocation="Cibiru, Bandung Timur"
      address="Jl. A.H. Nasution No. 105, Cipadung, Kec. Cibiru, Kota Bandung 40614"
      latitude={-6.927163}
      longitude={107.716482}
      zoom={15}
      tileProvider="openstreetmap"
    />
  );
}

const rootEl = document.getElementById("expand-map-root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<MountExpandMap />);
}
