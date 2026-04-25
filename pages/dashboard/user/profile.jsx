"use client";
import { useRef, useState } from "react";
import { useAuth } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Profile.module.css";

const AVATAR_KEY = "pickar_avatar";
const BANNER_KEY = "pickar_banner";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

export default function UserProfile() {
  const { user, loading, logout } = useAuth();
  const avatarRef = useRef(null);
  const bannerRef = useRef(null);
  const [tab, setTab] = useState("personal");

  const [avatarSrc, setAvatarSrc] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(AVATAR_KEY) || "" : ""
  );
  const [bannerSrc, setBannerSrc] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(BANNER_KEY) || "" : ""
  );

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      localStorage.setItem(AVATAR_KEY, ev.target.result);
      window.dispatchEvent(new Event("pickar_auth"));
    };
    reader.readAsDataURL(file);
  };

  const handleBanner = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBannerSrc(ev.target.result);
      localStorage.setItem(BANNER_KEY, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return null;

  const initials = getInitials(user?.fullName || "");
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <DashboardLayout user={user} logout={logout} title="Profile">
      <div className={styles.profileWrap}>

        {/* ── Banner ── */}
        <div className={styles.bannerWrap}>
          {bannerSrc
            ? <img src={bannerSrc} alt="banner" className={styles.bannerImg} />
            : <div className={styles.bannerDefault}>
                <div className={styles.bannerWave1} />
                <div className={styles.bannerWave2} />
                <div className={styles.bannerWave3} />
              </div>
          }
          <button className={styles.bannerEditBtn} onClick={() => bannerRef.current?.click()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit cover
          </button>
          <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBanner} />
        </div>

        {/* ── White info card ── */}
        <div className={styles.infoCard}>

          {/* Avatar + name */}
          <div className={styles.avatarRow}>
            <div className={styles.avatarLeft}>
              <div className={styles.avatarWrap}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className={styles.avatarImg} />
                  : <div className={styles.avatarInitials}>{initials}</div>
                }
                <button className={styles.avatarEditBtn} onClick={() => avatarRef.current?.click()}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              </div>

              <div className={styles.nameBlock}>
                <div className={styles.ratingRow}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className={styles.ratingVal}>5.0</span>
                </div>
                <h2 className={styles.profileName}>{user?.fullName || "—"}</h2>
                <div className={styles.contactRow}>
                  <span className={styles.contactItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {user?.phone || "—"}
                  </span>
                  <span className={styles.contactItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800000" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p className={styles.statNum}>—</p>
              <p className={styles.statLbl}>Deliveries</p>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800000" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className={styles.statNum}>5.0</p>
              <p className={styles.statLbl}>Average Rating</p>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#800000" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p className={styles.statNum}>
                {user?.createdAt
                  ? Number(((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1))
                  : "—"}
              </p>
              <p className={styles.statLbl}>Years of Service</p>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsWrap}>
            <button className={styles.tabBtn + (tab === "personal" ? " " + styles.tabBtnActive : "")} onClick={() => setTab("personal")}>
              Personal Information
            </button>
            <button className={styles.tabBtn + (tab === "account" ? " " + styles.tabBtnActive : "")} onClick={() => setTab("account")}>
              Account Details
            </button>
          </div>

          {/* Personal Info fields */}
          {tab === "personal" && (
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Full Name</label>
                <p className={styles.fieldVal}>{user?.fullName || "—"}</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Email Address</label>
                <p className={styles.fieldVal}>{user?.email || "—"}</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <p className={styles.fieldVal}>{user?.phone || "—"}</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Account Type</label>
                <p className={styles.fieldVal}>User</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Member Since</label>
                <p className={styles.fieldVal}>{memberSince}</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Verification Status</label>
                <p className={styles.fieldVal}>
                  <span className={styles.verifiedPill + " " + (user?.isVerified ? styles.pillYes : styles.pillNo)}>
                    {user?.isVerified ? "✓ Verified" : "✗ Not Verified"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Account Details fields */}
          {tab === "account" && (
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Email Verified</label>
                <p className={styles.fieldVal}>
                  <span className={styles.verifiedPill + " " + (user?.isVerified ? styles.pillYes : styles.pillNo)}>
                    {user?.isVerified ? "✓ Verified" : "✗ Not Verified"}
                  </span>
                </p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Account Status</label>
                <p className={styles.fieldVal}>
                  <span className={styles.verifiedPill + " " + styles.pillYes}>Active</span>
                </p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>Member Since</label>
                <p className={styles.fieldVal}>{memberSince}</p>
              </div>
              <div className={styles.fieldBox}>
                <label className={styles.fieldLabel}>User ID</label>
                <p className={styles.fieldVal} style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#999", wordBreak: "break-all" }}>
                  {user?.id || "—"}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}