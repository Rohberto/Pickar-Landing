"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const navRef     = useRef(null);
  const menuRef    = useRef(null);
  const overlayRef = useRef(null);
  const linksRef   = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Entrance animation after preloader ── */
  useEffect(() => {
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 3.5 }
    );
  }, []);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Mobile drawer open / close ── */
  useEffect(() => {
    const menu    = menuRef.current;
    const overlay = overlayRef.current;
    const links   = linksRef.current.filter(Boolean);

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(menu,
        { x: "100%" },
        { x: "0%", duration: 0.45, ease: "power3.out" }
      );
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, pointerEvents: "all" }
      );
      gsap.fromTo(links,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: "power3.out", delay: 0.18 }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(menu,    { x: "100%", duration: 0.35, ease: "power3.in" });
      gsap.to(overlay, { opacity: 0, duration: 0.25, pointerEvents: "none" });
    }
  }, [menuOpen]);

  const navLinks = [
    { href: "#about",    label: "About" },
    { href: "#how",      label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#contact",  label: "Contact us" },
  ];

  return (
    <>
      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>

        {/* ── LOGO ──────────────────────────────────────────
          Drop your SVG file into /public/logo.svg
          The <img> will show it; text is a fallback if missing.
          You can also use /public/logo.png or any format.
        ─────────────────────────────────────────────────── */}
        <a href="#" className={styles.logo}>
          <img
            src="/images/logo.svg"
            alt="Pickar"
            className={styles.logoImg}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          
        </a>

        {/* ── DESKTOP NAV LINKS ── */}
        <div className={styles.links}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        {/* ── DESKTOP HELP BUTTON ── */}
        <a href="#contact" className={styles.support}>
          {/*
            Put your chat SVG at /public/images/chat.svg
            The .supportIcon filter keeps it white on dark bg,
            and shifts it to dark red when the navbar is scrolled.
          */}
          <img
            src="/images/chat.svg"
            alt=""
            aria-hidden="true"
            className={styles.supportIcon}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          Help and support
        </a>

        {/* ── HAMBURGER (mobile only) ── */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── BACKDROP ── */}
      <div
        ref={overlayRef}
        className={styles.overlay}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── SLIDE-IN DRAWER ── */}
      <aside
        ref={menuRef}
        className={`${styles.drawer} ${scrolled ? styles.drawerScrolled : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {/* Close X */}
        <button
          className={styles.drawerClose}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Drawer logo */}
        <div className={styles.drawerLogo}>
          <img
            src="/images/logo.svg"
            alt="Pickar"
            className={styles.drawerLogoImg}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        {/* Links */}
        <nav className={styles.drawerLinks}>
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={el => linksRef.current[i] = el}
              className={styles.drawerLink}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </nav>

        {/* Help button at bottom of drawer */}
        <a
          href="#contact"
          className={styles.drawerSupport}
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/images/chat.svg"
            alt=""
            aria-hidden="true"
            className={styles.drawerSupportIcon}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          Help and support
        </a>
      </aside>
    </>
  );
}