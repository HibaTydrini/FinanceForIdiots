
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AIPhone from "./AIPhone";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <AIPhone />
  </StrictMode>
);
