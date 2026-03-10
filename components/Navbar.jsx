"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "../styles/Navbar.module.css";

// ── Pull initials from a full name ──────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

// ── Generate a consistent hue from a string ─────────────────────
function getAvatarColor(str = "") {
  const colors = [
    "#8B1A1A", "#1a4d8b", "#1a7a3c", "#7a4a1a",
    "#4a1a7a", "#1a6e7a", "#7a1a5a", "#3d6b1a",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Navbar() {
  const navRef     = useRef(null);
  const menuRef    = useRef(null);
  const overlayRef = useRef(null);
  const linksRef   = useRef([]);
  const dropdownRef = useRef(null);

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [user,      setUser]      = useState(null);   // { fullName, email }
  const [dropOpen,  setDropOpen]  = useState(false);

  /* ── Read user from localStorage on mount ── */
  useEffect(() => {
    const tryLoad = () => {
      try {
        const raw = localStorage.getItem("pickar_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {}
    };
    tryLoad();
    // Also re-check when storage changes (e.g. after signup in modal)
    window.addEventListener("storage", tryLoad);
    // Custom event fired by SignupForm after success
    window.addEventListener("pickar_auth", tryLoad);
    return () => {
      window.removeEventListener("storage", tryLoad);
      window.removeEventListener("pickar_auth", tryLoad);
    };
  }, []);

  /* ── Close dropdown when clicking outside ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Entrance animation ── */
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

  /* ── Mobile drawer ── */
  useEffect(() => {
    const menu    = menuRef.current;
    const overlay = overlayRef.current;
    const links   = linksRef.current.filter(Boolean);

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(menu,    { x: "100%" }, { x: "0%", duration: 0.45, ease: "power3.out" });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, pointerEvents: "all" });
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

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem("pickar_user");
    localStorage.removeItem("authToken");
    setUser(null);
    setDropOpen(false);
  };

  const navLinks = [
    { href: "#about",    label: "About" },
    { href: "#how",      label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#contact",  label: "Contact us" },
  ];

  const initials   = user ? getInitials(user.fullName) : "";
  const avatarColor = user ? getAvatarColor(user.email) : "#8B1A1A";

  return (
    <>
      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>

        {/* ── LOGO ── */}
        <a href="#" className={styles.logo}>
          <img src="/images/logo.svg" alt="Pickar" className={styles.logoImg}
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </a>

        {/* ── DESKTOP NAV LINKS ── */}
        <div className={styles.links}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        {/* ── RIGHT SIDE: avatar OR help button ── */}
        <div className={styles.navRight}>
          {user ? (
            /* ── AVATAR + DROPDOWN ── */
            <div ref={dropdownRef} className={styles.avatarWrap}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropOpen(v => !v)}
                aria-label="Account menu"
                aria-expanded={dropOpen}
              >
                <span
                  className={styles.avatar}
                  style={{ background: avatarColor }}
                >
                  {initials}
                </span>
                {/* Chevron */}
                <svg
                  className={`${styles.chevron} ${dropOpen ? styles.chevronOpen : ""}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropOpen && (
                <div className={`${styles.dropdown} ${scrolled ? styles.dropdownScrolled : ""}`}>
                  {/* User info */}
                  <div className={styles.dropUser}>
                    <span
                      className={styles.dropAvatar}
                      style={{ background: avatarColor }}
                    >
                      {initials}
                    </span>
                    <div className={styles.dropInfo}>
                      <strong>{user.fullName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className={styles.dropDivider} />

                  {/* Download app */}
                  <a href="#" className={styles.dropItem}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                      <path d="M8 12l4 4 4-4M12 8v8"/>
                    </svg>
                    Download the app
                  </a>

                  <div className={styles.dropDivider} />

                  {/* Logout */}
                  <button className={`${styles.dropItem} ${styles.dropLogout}`}
                    onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── HELP BUTTON (default, no user) ── */
            <a href="#contact" className={styles.support}>
              <img src="/images/chat.svg" alt="" aria-hidden="true"
                className={styles.supportIcon}
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
              Help and support
            </a>
          )}
        </div>

        {/* ── HAMBURGER ── */}
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
      <div ref={overlayRef} className={styles.overlay}
        onClick={() => setMenuOpen(false)} aria-hidden="true" />

      {/* ── SLIDE-IN DRAWER ── */}
      <aside ref={menuRef}
        className={`${styles.drawer} ${scrolled ? styles.drawerScrolled : ""}`}
        aria-label="Mobile navigation" aria-hidden={!menuOpen}>

        <button className={styles.drawerClose} onClick={() => setMenuOpen(false)}
          aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Drawer logo */}
        <div className={styles.drawerLogo}>
          <img src="/images/logo.svg" alt="Pickar" className={styles.drawerLogoImg}
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>

        {/* Drawer user info if logged in */}
        {user && (
          <div className={styles.drawerUser}>
            <span className={styles.drawerAvatar} style={{ background: avatarColor }}>
              {initials}
            </span>
            <div className={styles.drawerUserInfo}>
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        )}

        <nav className={styles.drawerLinks}>
          {navLinks.map((link, i) => (
            <a key={link.href} href={link.href}
              ref={el => linksRef.current[i] = el}
              className={styles.drawerLink}
              onClick={() => setMenuOpen(false)}>
              <span>{link.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </nav>

        {user ? (
          <button className={styles.drawerLogout} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        ) : (
          <a href="#contact" className={styles.drawerSupport}
            onClick={() => setMenuOpen(false)}>
            <img src="/images/chat.svg" alt="" aria-hidden="true"
              className={styles.drawerSupportIcon}
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            Help and support
          </a>
        )}
      </aside>
    </>
  );
}