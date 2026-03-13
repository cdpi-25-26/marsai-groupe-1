import i18n from "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";
import { ToastProvider } from "./components/ToastProvider.jsx";
import { LandingPage } from "./pages/public/Home.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminUsersPage from "./pages/admin/Users.jsx";
import Submissions from "./pages/admin/Submissions.jsx";
import Moderation from "./pages/admin/Moderation.jsx";
import Leaderboard from "./pages/admin/Leaderboard.jsx";
import Events from "./pages/admin/Events.jsx";
import JuryManagement from "./pages/admin/JuryManagement.jsx";
import Settings from "./pages/admin/Settings.jsx";
import CMS from "./pages/admin/CMS.jsx";
import EditEvent from "./pages/admin/EditEvent.jsx";
import Videos from "./pages/admin/Videos.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import BottomNavLayout from "./layouts/BottomNavLayout.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { RoleGuard } from "./middlewares/RoleGuard.jsx";
import Discover from "./pages/public/Discover.jsx";
import Competition from "./pages/public/Competition.jsx";
import Profile from "./pages/public/Profile.jsx";
import JuryDashboard from "./pages/admin/JuryDashboard.jsx";
import UploadPage from "./pages/public/Upload.jsx";
import JuryVotePage from "./pages/jury/jury-page.jsx";
import Detail from "./pages/public/Details.jsx";
import Feed from "./pages/public/Feed.jsx";
import { AgendaPage } from "./pages/public/Agenda.jsx";
import TicketPage from "./pages/public/TicketPage.jsx";
import ScannerPage from "./pages/public/ScannerPage.jsx";
import ScanHistoryPage from "./pages/public/ScanHistoryPage.jsx";
import QRGeneratorPage from "./pages/public/QRGeneratorPage.jsx";

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
      <ToastProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/competition" element={<Competition />} />
              <Route path="/Agenda" element={<AgendaPage />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/ticket" element={<TicketPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/scan-history" element={<ScanHistoryPage />} />
              <Route path="/qr-generator" element={<QRGeneratorPage />} />

              {/* Routes protégées — Jury */}
              <Route
                path="/jury-dashboard"
                element={
                  <RoleGuard allowedRoles={["JURY", "ADMIN"]}>
                    <JuryDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/jury/:filmId"
                element={
                  <RoleGuard allowedRoles={["JURY", "ADMIN"]}>
                    <JuryVotePage />
                  </RoleGuard>
                }
              />

              {/* Routes protégées — Réalisateur (Producer) */}
              <Route
                path="/upload"
                element={
                  <RoleGuard allowedRoles={["REALISATEUR", "ADMIN"]}>
                    <UploadPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/soumission"
                element={
                  <RoleGuard allowedRoles={["REALISATEUR", "ADMIN"]}>
                    <UploadPage />
                  </RoleGuard>
                }
              />
            </Route>

            {/* Routes avec Bottom Navigation uniquement */}
            <Route path="/" element={<BottomNavLayout />}>
              <Route path="/discover" element={<Discover />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/film/:id" element={<Detail />} />
            </Route>

            {/* Routes admin */}
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </RoleGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="events" element={<Events />} />
              <Route path="events/new" element={<EditEvent />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              <Route path="jury" element={<JuryManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="cms" element={<CMS />} />
              <Route path="videos" element={<Videos />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
      </ToastProvider>
    </I18nextProvider>
  </StrictMode>,
);
