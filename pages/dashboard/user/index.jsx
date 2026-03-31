"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css"

const STATUS_STEPS = ["pending","finding_driver","driver_assigned","picked_up","in_transit","delivered"];
const STATUS_LABELS = {
  pending:         "Order Placed",
  finding_driver:  "Finding Driver",
  driver_assigned: "Driver Assigned",
  picked_up:       "Package Picked Up",
  in_transit:      "In Transit",
  delivered:       "Delivered",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

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

function TrackingPanel({ delivery, onClose }) {
  const stepIndex = STATUS_STEPS.indexOf(delivery.status);
  return (
    <div className={styles.trackCard}>
      <div className={styles.trackHeader}>
        <div>
          <p className={styles.trackId}>ID: {delivery._id}</p>
          <p className={styles.trackStatus}>{(delivery.status || "").replace(/_/g, " ")}</p>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      <div>
        <p style={{ fontSize: "0.78rem", color: "#999", marginBottom: 4 }}>To</p>
        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A0A0A" }}>
          {delivery.recipientAddress?.label || "—"}
        </p>
        <p style={{ fontSize: "0.78rem", color: "#aaa" }}>{delivery.recipientName} · {delivery.recipientPhone}</p>
      </div>

      <div className={styles.timeline}>
        {STATUS_STEPS.filter(s => s !== "cancelled").map((s, i) => {
          const done   = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={s} className={styles.timelineStep + (done ? " " + styles.done : "")}>
              <div className={styles.timelineDot + (done ? " " + styles.done : active ? " " + styles.active : "")}>
                {done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <div className={styles.timelineLabel}>
                <strong style={{ color: done || active ? "#0A0A0A" : "#bbb" }}>{STATUS_LABELS[s]}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {delivery.driver && (
        <div className={styles.driverCard}>
          <div className={styles.driverAvatar}>{getInitials(delivery.driver.name || "D")}</div>
          <div className={styles.driverInfo}>
            <strong>{delivery.driver.name}</strong>
            <span>{delivery.driver.phone} · {delivery.driver.vehicle} · ⭐ {delivery.driver.rating}</span>
          </div>
        </div>
      )}

      <button onClick={onClose} style={{ marginTop: 16, fontSize: "0.82rem", color: "#8B1A1A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
        Close tracking
      </button>
    </div>
  );
}

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();

  const [wallet,      setWallet]      = useState(null);
  const [deliveries,  setDeliveries]  = useState([]);
  const [tracked,     setTracked]     = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(API + "/wallet",              { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/deliveries/history",  { headers: authHeaders() }).then(r => r.json()),
    ]).then(([w, d]) => {
      if (w.success) setWallet(w.data);
      if (d.success) setDeliveries(d.data || []);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [user]);

  // Poll active delivery every 8s
  useEffect(() => {
    if (!tracked) return;
    const interval = setInterval(() => {
      fetch(API + "/deliveries/" + tracked._id + "/status", { headers: authHeaders() })
        .then(r => r.json())
        .then(d => { if (d.success) setTracked(prev => ({ ...prev, ...d.data })); })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [tracked]);

  if (loading) return null;

  const active = deliveries.filter(d => !["delivered","cancelled"].includes(d.status));
  const recent = deliveries.slice(0, 5);

  return (
    <DashboardLayout user={user} logout={logout} title="Overview">

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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Total Deliveries</p>
          <p className={styles.statValue}>{dataLoading ? "—" : deliveries.length}</p>
          <p className={styles.statSub}>All time</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Active</p>
          <p className={styles.statValue}>{dataLoading ? "—" : active.length}</p>
          <p className={styles.statSub}>In progress</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Delivered</p>
          <p className={styles.statValue}>{dataLoading ? "—" : deliveries.filter(d => d.status === "delivered").length}</p>
          <p className={styles.statSub}>Completed</p>
        </div>
      </div>

      {/* Active tracking */}
      {tracked && <TrackingPanel delivery={tracked} onClose={() => setTracked(null)} />}

      {/* Active deliveries */}
      {active.length > 0 && !tracked && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Active Deliveries</p>
          </div>
          <div className={styles.deliveryList}>
            {active.map(d => (
              <div key={d._id} className={styles.deliveryItem}>
                <div className={styles.deliveryIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className={styles.deliveryInfo}>
                  <strong>{d.recipientAddress?.label || "Unknown destination"}</strong>
                  <span>To: {d.recipientName} · {formatDate(d.createdAt)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <StatusBadge status={d.status} />
                  <button
                    onClick={() => setTracked(d)}
                    style={{ fontSize: "0.72rem", color: "#8B1A1A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent deliveries */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>Recent Deliveries</p>
          <a href="/dashboard/user/deliveries" className={styles.panelLink}>See all</a>
        </div>
        {dataLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} style={{ height: 52 }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className={styles.empty}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p>No deliveries yet</p>
          </div>
        ) : (
          <div className={styles.deliveryList}>
            {recent.map(d => (
              <div key={d._id} className={styles.deliveryItem}>
                <div className={styles.deliveryIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className={styles.deliveryInfo}>
                  <strong>{d.recipientAddress?.label || "Unknown destination"}</strong>
                  <span>To: {d.recipientName} · {formatDate(d.createdAt)}</span>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}