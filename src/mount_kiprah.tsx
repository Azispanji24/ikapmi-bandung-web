import * as React from "react";
import { createRoot } from "react-dom/client";
import { KiprahAlumniSection } from "./components/ui/kiprah-alumni";

const container = document.getElementById("kiprah-alumni-root");
if (container) {
  const root = createRoot(container);
  root.render(<KiprahAlumniSection />);
}
