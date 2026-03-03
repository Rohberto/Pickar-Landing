import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Preloader from "../components/Preloader";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import HowItWorks from "../components/HowItWorks";
import KeyFeatures from "../components/KeyFeatures";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor";

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      <Head>
        {/* ── Primary SEO ── */}
        <title>Pickar - Fast On-Demand Delivery for Everyone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Pickar is a fast, on-demand delivery platform built for vendors, businesses, and everyday people. Instant pickup, live tracking, and verified riders — every time."
        />
        <meta name="keywords" content="delivery app, on-demand delivery, Lagos delivery, vendor delivery, package delivery, Pickar, fast delivery Nigeria" />
        <meta name="author" content="Pickar" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://usepickar.com" />

        {/* ── Open Graph (Facebook, WhatsApp, LinkedIn previews) ──────
            OG image: place a 1200×630px image at /public/og-image.png
            This is what appears when someone shares your link
        ────────────────────────────────────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://usepickar.com" />
        <meta property="og:site_name" content="Pickar" />
        <meta property="og:title" content="Pickar — Fast On-Demand Delivery for Everyone" />
        <meta
          property="og:description"
          content="Instant pickup. Live tracking. Verified riders. Pickar handles your deliveries so you never have to worry about the last mile."
        />
        <meta property="og:image" content="https://usepickar.com/images/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Pickar — Fast On-Demand Delivery" />
        <meta property="og:locale" content="en_NG" />

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pickarapp" />
        <meta name="twitter:creator" content="@pickarapp" />
        <meta name="twitter:title" content="Pickar — Fast On-Demand Delivery for Everyone" />
        <meta
          name="twitter:description"
          content="Instant pickup. Live tracking. Verified riders. Pickar handles your deliveries so you never have to worry about the last mile."
        />
        <meta name="twitter:image" content="https://usepickar.com/images/logo.png" />

        {/* ── Mobile / App smart banners ── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pickar" />
        <meta name="application-name" content="Pickar" />
      </Head>

      <Cursor />
      <Preloader onComplete={() => setPreloaderDone(true)} />

      <main style={{ opacity: preloaderDone ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <Navbar />
        <Hero />
        <About />
        <HowItWorks />
        <KeyFeatures />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
    </>
  );
}