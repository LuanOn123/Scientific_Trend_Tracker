import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleGuard } from "./components/guards";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AdminPage } from "./pages/AdminPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JournalsPage } from "./pages/JournalsPage";
import { JournalDetailPage } from "./pages/JournalDetailPage";
import { KeywordsTopicsPage } from "./pages/KeywordsTopicsPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PaperDetailPage } from "./pages/PaperDetailPage";
import { PapersPage } from "./pages/PapersPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TrendsPage } from "./pages/TrendsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/papers/:id" element={<PaperDetailPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/:id" element={<JournalDetailPage />} />
          <Route path="/keywords" element={<KeywordsTopicsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<RoleGuard roles={["admin"]}><AdminPage /></RoleGuard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
