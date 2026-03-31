"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css";

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase().replace(/ /g, "_");
  return <span className={styles.badge + " " + (styles[s] || styles.pending)}>{(status || "").replace(/_/g, " ")}</span>;
}

export default function DriverDashboard() {
  const { user, loading, logout } = useAuth();

  const [wallet,      setWallet]      = useState(null);
  const [trips,       setTrips]       = useState([]);
  const [driver,      setDriver]      = useState(null);
  const [online,      setOnline]      = useState(false);
  const [togglingOn,  setTogglingOn]  = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(API + "/wallet",              { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/deliveries/history",  { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/drivers/me",          { headers: authHeaders() }).then(r => r.json()),
    ]).then(([w, d, dr]) => {
      if (w.success)  setWallet(w.data);
      if (d.success)  setTrips(d.data || []);
      if (dr.success) {
        setDriver(dr.data);
        setOnline(dr.data?.status === "online");
      }
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [user]);

  const handleToggleOnline = async () => {
    setTogglingOn(true);
    try {
      if (online) {
        await fetch(API + "/drivers/offline", { method: "POST", headers: authHeaders() });
        setOnline(false);
      } else {
        navigator.geolocation.getCurrentPosition(async pos => {
          await fetch(API + "/drivers/online", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          setOnline(true);
          setTogglingOn(false);
        }, () => {
          // Location denied — go online anyway
          fetch(API + "/drivers/online", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ lat: 6.5244, lng: 3.3792 }),
          }).then(() => { setOnline(true); setTogglingOn(false); });
        });
        return;
      }
    } catch {}
    setTogglingOn(false);
  };

  if (loading) return null;

  const completed = trips.filter(t => t.status === "delivered");
  const active    = trips.filter(t => !["delivered","cancelled"].includes(t.status));

  return (
    <DashboardLayout user={user} logout={logout} title="Overview">

      {/* Online/Offline toggle */}
      <div className={styles.onlineToggle}>
        <div className={styles.onlineToggleInfo}>
          <strong>{online ? "You are Online" : "You are Offline"}</strong>
          <span>{online ? "You can receive trip requests" : "Go online to start receiving deliveries"}</span>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={online} onChange={handleToggleOnline} disabled={togglingOn} />
          <span className={styles.toggleSlider} />
        </label>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard + " " + styles.accent}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Wallet Balance</p>
          <p className={styles.statValue}>{dataLoading ? "—" : formatNaira(wallet?.balance)}</p>
          <p className={styles.statSub}>{wallet?.currency || "NGN"}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Completed Trips</p>
          <p className={styles.statValue}>{dataLoading ? "—" : completed.length}</p>
          <p className={styles.statSub}>All time</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Active Trip</p>
          <p className={styles.statValue}>{dataLoading ? "—" : active.length}</p>
          <p className={styles.statSub}>In progress</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Rating</p>
          <p className={styles.statValue}>{dataLoading ? "—" : driver?.rating ? driver.rating.toFixed(1) : "—"}</p>
          <p className={styles.statSub}>Average</p>
        </div>
      </div>

      {/* Approval status */}
      {driver && !driver.isApproved && (
        <div style={{ background: "#FFF3CD", border: "1px solid #ffc107", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: "0.85rem", color: "#856404", fontWeight: 500 }}>
            Your account is pending approval. You can receive trips once approved by the admin.
          </span>
        </div>
      )}

      {/* Recent trips */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>Recent Trips</p>
          <a href="/dashboard/driver/trips" className={styles.panelLink}>See all</a>
        </div>
        {dataLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} style={{ height: 52 }} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className={styles.empty}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p>No trips yet</p>
          </div>
        ) : (
          <div className={styles.deliveryList}>
            {trips.slice(0,5).map(t => (
              <div key={t._id} className={styles.deliveryItem}>
                <div className={styles.deliveryIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className={styles.deliveryInfo}>
                  <strong>{t.recipientAddress?.label || "Unknown destination"}</strong>
                  <span>{formatDate(t.createdAt)} · {t.rideType || ""}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <StatusBadge status={t.status} />
                  {t.price && <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#155724" }}>{formatNaira(t.price)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}