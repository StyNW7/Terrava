import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, MotionConfig } from "framer-motion";

import Layout from "@/layouts/root-layout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { DataStoreProvider } from "@/context/DataStoreContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { useTheme } from "@/hooks/useTheme";
import PWAPrompts from "@/components/pwa/PWAPrompts";
import ProtectedRoute, { GuestOnlyRoute } from "@/components/auth/ProtectedRoute";

import ScrollToTopFunction from "./utility/ScrollToTopFunction";
import LoadingScreen from "./pages/Utility/LoadingScreen";

import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import SolutionsPage from "@/pages/SolutionsPage";
import SmartEarTagPage from "@/pages/SmartEarTagPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import ImpactPage from "@/pages/ImpactPage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/NotFoundPage";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import OnboardingPage from "@/pages/OnboardingPage";

import DashboardOverviewPage from "@/pages/DashboardOverviewPage";
import LivestockListPage from "@/pages/LivestockListPage";
import AddLivestockPage from "@/pages/AddLivestockPage";
import LivestockDetailPage from "@/pages/LivestockDetailPage";
import MonitoringPage from "@/pages/MonitoringPage";
import AlertsPage from "@/pages/AlertsPage";
import AlertDetailPage from "@/pages/AlertDetailPage";
import AIInsightsPage from "@/pages/AIInsightsPage";
import FarmMapPage from "@/pages/FarmMapPage";
import FarmManagementPage from "@/pages/FarmManagementPage";
import FarmDetailPage from "@/pages/FarmDetailPage";
import DeviceManagementPage from "@/pages/DeviceManagementPage";
import DeviceDetailPage from "@/pages/DeviceDetailPage";
import TeamPage from "@/pages/TeamPage";
import ReportsAnalyticsPage from "@/pages/ReportsAnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";

function ThemedToaster() {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "14px",
          background: isDark ? "#1A2E24" : "#15231B",
          color: "#FFFFFF",
          fontSize: "14px",
          fontWeight: 500,
          padding: "12px 16px",
          border: isDark ? "1px solid #2B4A39" : "none",
          boxShadow: isDark ? "0 12px 32px -12px rgba(0, 0, 0, 0.7)" : "0 12px 32px -12px rgba(21, 35, 27, 0.45)",
        },
        success: { iconTheme: { primary: isDark ? "#43C282" : "#27875B", secondary: "#FFFFFF" } },
        error: { iconTheme: { primary: isDark ? "#E57373" : "#C95B5B", secondary: "#FFFFFF" } },
      }}
    />
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
      <DataStoreProvider>
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTopFunction />

          <AnimatePresence>
            {loading && <LoadingScreen key="loading" onComplete={() => setLoading(false)} />}
          </AnimatePresence>

          {!loading && (
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="livestock" element={<LivestockListPage />} />
            <Route path="livestock/add" element={<AddLivestockPage />} />
            <Route path="livestock/:id" element={<LivestockDetailPage />} />
            <Route path="livestock/:id/edit" element={<AddLivestockPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="alerts/:id" element={<AlertDetailPage />} />
            <Route path="ai-insights" element={<AIInsightsPage />} />
            <Route path="map" element={<FarmMapPage />} />
            <Route path="farms" element={<FarmManagementPage />} />
            <Route path="farms/:id" element={<FarmDetailPage />} />
            <Route path="devices" element={<DeviceManagementPage />} />
            <Route path="devices/:id" element={<DeviceDetailPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="reports" element={<ReportsAnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="smart-ear-tag" element={<SmartEarTagPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
          )}

          <ThemedToaster />
          <PWAPrompts />
        </BrowserRouter>
      </SettingsProvider>
      </DataStoreProvider>
      </AuthProvider>
      </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
