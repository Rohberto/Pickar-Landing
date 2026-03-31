"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/dashboard/DashboardLayout.module.css";

const NAV_USER = [
  { href: "/dashboard/user",          label: "Overview",  icon: "grid" },
  { href: "/dashboard/user/deliveries", label: "Deliveries", icon: "package" },
  { href: "/dashboard/user/wallet",   label: "Wallet",    icon: "wallet" },
  { href: "/dashboard/user/profile",  label: "Profile",   icon: "user" },
];

const NAV_DRIVER = [
  { href: "/dashboard/driver",          label: "Overview",  icon: "grid" },
  { href: "/dashboard/driver/trips",    label: "Trips",     icon: "package" },
  { href: "/dashboard/driver/wallet",   label: "Wallet",    icon: "wallet" },
  { href: "/dashboard/driver/profile",  label: "Profile",   icon: "user" },
];

const ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  package: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M16 12h.01"/>
      <path d="M2 10h20"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

export default function DashboardLayout({ user, logout, children, title }) {
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navLinks = user?.userType === "driver" ? NAV_DRIVER : NAV_USER;
  const initials = getInitials(user?.fullName || "");

  return (
    <div className={styles.shell}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar + (sidebarOpen ? " " + styles.sidebarOpen : "")}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <img src="/images/logo.svg" alt="Pickar" className={styles.brandLogo}
              onError={e => { e.currentTarget.style.display = "none"; }} />
            <span>Pickar</span>
          </div>

          <nav className={styles.nav}>
            {navLinks.map(link => {
              const active = router.pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.navLink + (active ? " " + styles.navLinkActive : "")}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{ICONS[link.icon]}</span>
                  <span>{link.label}</span>
                  {active && <span className={styles.navDot} />}
                </a>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>{initials}</div>
            <div className={styles.sidebarUserInfo}>
              <strong>{user?.fullName}</strong>
              <span>{user?.userType === "driver" ? "Driver" : "User"}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className={styles.main}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <h1 className={styles.pageTitle}>{title}</h1>

          <div className={styles.topbarRight}>
            <div className={styles.topbarAvatar}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}