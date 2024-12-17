import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./roboto.css";
import { App } from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router"

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
