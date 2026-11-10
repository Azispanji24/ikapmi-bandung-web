import * as React from "react";
import { createRoot } from "react-dom/client";
import { TestimonialsSection } from "./components/ui/testimonials-6";

const container = document.getElementById("testimonials-root");
if (container) {
  const root = createRoot(container);
  root.render(<TestimonialsSection />);
}
