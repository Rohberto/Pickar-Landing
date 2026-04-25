"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/dashboard/DashboardLayout.module.css";

const NAV_USER = [
  { href: "/dashboard/user",            label: "Overview",   icon: "grid" },
  { href: "/dashboard/user/deliveries", label: "Deliveries", icon: "package" },
  { href: "/dashboard/user/wallet",     label: "Wallet",     icon: "wallet" },
  { href: "/dashboard/user/profile",    label: "Profile",    icon: "user" },
];

const NAV_DRIVER = [
  { href: "/dashboard/driver",          label: "Overview",   icon: "grid" },
  { href: "/dashboard/driver/trips",    label: "Trips",      icon: "package" },
  { href: "/dashboard/driver/wallet",   label: "Wallet",     icon: "wallet" },
  { href: "/dashboard/driver/profile",  label: "Profile",    icon: "user" },
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
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M16 12h.01"/><path d="M2 10h20"/>
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

const AVATAR_KEY = "pickar_avatar";

export default function DashboardLayout({ user, logout, children, title }) {
  const router       = useRouter();
  const fileRef      = useRef(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [dropOpen,      setDropOpen]      = useState(false);
  const [avatarSrc,     setAvatarSrc]     = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(AVATAR_KEY) || "";
    return "";
  });

  const navLinks = user?.userType === "driver" ? NAV_DRIVER : NAV_USER;
  const initials = getInitials(user?.fullName || "");

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setAvatarSrc(src);
      localStorage.setItem(AVATAR_KEY, src);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.shell}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar + (sidebarOpen ? " " + styles.sidebarOpen : "")}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <img src="/images/logo.svg" alt="Pickar" className={styles.brandLogo}
              onError={e => { e.currentTarget.style.display = "none"; }} />
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
            <div className={styles.sidebarAvatarWrap}>
              {avatarSrc
                ? <img src={avatarSrc} alt="" className={styles.sidebarAvatarImg} />
                : <div className={styles.sidebarAvatar}>{initials}</div>
              }
            </div>
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

          {/* Date pill */}
          <div className={styles.datePill}>
            <span className={styles.dateDay}>{new Date().getDate()}</span>
            <div className={styles.dateMeta}>
              <span className={styles.dateWeekday}>{new Date().toLocaleDateString("en-NG", { weekday: "short" })}</span>
              <span className={styles.dateMonth}>{new Date().toLocaleDateString("en-NG", { month: "long" })}</span>
            </div>
          </div>

          {/* Search */}
          <div className={styles.topbarSearch}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>

          {/* Right side */}
          <div className={styles.topbarRight}>

            {/* Notification bell */}
            <button className={styles.iconBtn} title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>

            {/* Settings */}
            <button className={styles.iconBtn} title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {/* Avatar + name + dropdown */}
            <div className={styles.topbarAvatarWrap} onClick={() => setDropOpen(v => !v)}>
              <div className={styles.topbarAvatarRing}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" className={styles.topbarAvatarImg} />
                  : <div className={styles.topbarAvatar}>{initials}</div>
                }
              </div>
              <span className={styles.topbarName}>{user?.fullName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: dropOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>

              {dropOpen && (
                <div className={styles.avatarDropdown} onClick={e => e.stopPropagation()}>
                  <div className={styles.dropProfile}>
                    <div className={styles.dropAvatarLarge}>
                      {avatarSrc
                        ? <img src={avatarSrc} alt="" className={styles.dropAvatarImg} />
                        : <span>{initials}</span>
                      }
                      <button className={styles.dropAvatarEdit}
                        onClick={() => fileRef.current && fileRef.current.click()} title="Change photo">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                    <div>
                      <p className={styles.dropName}>{user?.fullName}</p>
                      <p className={styles.dropEmail}>{user?.email}</p>
                    </div>
                  </div>

                  <div className={styles.dropDivider} />

                  <button className={styles.dropItem} onClick={() => { fileRef.current && fileRef.current.click(); setDropOpen(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Change profile photo
                  </button>

                  <a className={styles.dropItem} href={user?.userType === "driver" ? "/dashboard/driver/profile" : "/dashboard/user/profile"}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    View profile
                  </a>

                  <div className={styles.dropDivider} />

                  <button className={styles.dropItem + " " + styles.dropLogout} onClick={logout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}