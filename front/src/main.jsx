import i18n from "./src/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";
import Home from "./pages/public/Home.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { RoleGuard } from "./middlewares/RoleGuard.jsx";
import Agenda from "./pages/public/Agenda.jsx";
import Discover from "./pages/public/Discover.jsx";
import Competition from "./pages/public/Competition.jsx";
import Profile from "./pages/public/Profile.jsx";
import Feed from "./pages/public/Feed.jsx";
import Explorer from "./pages/public/Explorer.jsx";
import Soumission from "./pages/public/Soumission.jsx";
import Top50 from "./pages/public/Top50.jsx";





const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Routes publiques */}
           <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/competition" element={<Competition />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/soumission" element={<Soumission />} />
            <Route path="/auth/register" element={<Register />} />
          </Route>
          

          {/* Routes privées */}
          <Route
            path="admin"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleGuard>
            }
          >
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
    </I18nextProvider>
  </StrictMode>
);
