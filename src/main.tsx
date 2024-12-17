import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router"
import { Home } from "./Home.tsx";
import "./i18n.ts";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Base } from "./Base.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Base />}>
              <Route index element={<Home />} />
              <Route path=":id" element={<App />} />
            </Route>
            <Route path="*" element={<div>404</div>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
