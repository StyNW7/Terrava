import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import Layout from "@/layouts/root-layout";

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

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <ScrollToTopFunction />

      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {!loading && (
        <Routes>
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

      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

export default App;
