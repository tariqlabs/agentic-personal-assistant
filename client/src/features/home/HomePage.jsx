import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "./components/Hero.jsx";
import { Features } from "./components/Features.jsx";
import { HowItWorks } from "./components/HowItWorks.jsx";
import { News } from "./components/News.jsx";
import { Footer } from "./components/Footer.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { DotGridBackground } from "../../shared/components/DotGridBackground.jsx";
import { newsApi } from "./api/newsApi.js";

export function HomePage() {
  const [newsItems, setNewsItems] = useState([]);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  useEffect(() => {
    newsApi
      .getNews()
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNewsItems(Array.isArray(data) ? data : []))
      .catch(() => setNewsItems([]));
  }, []);

  return (
    <div className="min-h-screen relative bg-surface-950">
      <DotGridBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <News items={newsItems} />
          <Footer />
        </main>
      </div>
    </div>
  );
}
