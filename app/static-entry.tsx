import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BeadPatternStudio } from "./BeadPatternStudio";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BeadPatternStudio />
  </StrictMode>,
);
