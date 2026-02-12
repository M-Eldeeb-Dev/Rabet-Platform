import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import OfflineAlert from "./components/ui/OfflineAlert.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OfflineAlert />
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
