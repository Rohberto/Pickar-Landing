"use client";
import { useAuth } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

export default function UserProfile() {
  const { user, loading, logout } = useAuth();
  if (loading) return null;

  return (
    <DashboardLayout user={user} logout={logout} title="Profile">
      <div className={styles.panel}>
        <div className={styles.profileAvatarWrap}>
          <div className={styles.profileAvatarLarge}>{getInitials(user?.fullName || "")}</div>
          <div className={styles.profileAvatarInfo}>
            <strong>{user?.fullName}</strong>
            <span>{user?.email}</span>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <span className={styles.verifiedBadge + " " + (user?.isVerified ? styles.yes : styles.no)}>
                {user?.isVerified ? "✓ Verified" : "✗ Not Verified"}
              </span>
              <span className={styles.verifiedBadge + " " + styles.yes}>User</span>
            </div>
          </div>
        </div>
        <div className={styles.profileGrid}>
          <div className={styles.profileField}><label>Full Name</label><span>{user?.fullName || "—"}</span></div>
          <div className={styles.profileField}><label>Email</label><span>{user?.email || "—"}</span></div>
          <div className={styles.profileField}><label>Phone</label><span>{user?.phone || "—"}</span></div>
          <div className={styles.profileField}><label>Account Type</label><span>User</span></div>
          <div className={styles.profileField}><label>Email Verified</label><span>{user?.isVerified ? "Yes" : "No"}</span></div>
        </div>
      </div>
    </DashboardLayout>
  );
}