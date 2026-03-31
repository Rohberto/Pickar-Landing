"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css";

const STATUS_STEPS = ["pending","finding_driver","driver_assigned","picked_up","in_transit","delivered"];
const STATUS_LABELS = {
  pending: "Order Placed", finding_driver: "Finding Driver",
  driver_assigned: "Driver Assigned", picked_up: "Package Picked Up",
  in_transit: "In Transit", delivered: "Delivered",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase().replace(/ /g, "_");
  return <span className={styles.badge + " " + (styles[s] || styles.pending)}>{(status || "").replace(/_/g, " ")}</span>;
}

export default function UserDeliveries() {
  const { user, loading, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [tracked,    setTracked]    = useState(null);
  const [fetching,   setFetching]   = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(API + "/deliveries/history", { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setDeliveries(d.data || []); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

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

  return (
    <DashboardLayout user={user} logout={logout} title="Deliveries">

      {tracked && (
        <div className={styles.trackCard}>
          <div className={styles.trackHeader}>
            <div>
              <p className={styles.trackId}>ID: {tracked._id}</p>
              <p className={styles.trackStatus}>{(tracked.status || "").replace(/_/g, " ")}</p>
            </div>
            <StatusBadge status={tracked.status} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: "0.78rem", color: "#999", marginBottom: 4 }}>Destination</p>
            <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>{tracked.recipientAddress?.label || "—"}</p>
            <p style={{ fontSize: "0.78rem", color: "#aaa" }}>{tracked.recipientName} · {tracked.recipientPhone}</p>
          </div>
          <div className={styles.timeline}>
            {STATUS_STEPS.filter(s => s !== "cancelled").map((s, i) => {
              const stepIndex = STATUS_STEPS.indexOf(tracked.status);
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s} className={styles.timelineStep + (done ? " " + styles.done : "")}>
                  <div className={styles.timelineDot + (done ? " " + styles.done : active ? " " + styles.active : "")}>
                    {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div className={styles.timelineLabel}>
                    <strong style={{ color: done || active ? "#0A0A0A" : "#bbb" }}>{STATUS_LABELS[s]}</strong>
                  </div>
                </div>
              );
            })}
          </div>
          {tracked.driver && (
            <div className={styles.driverCard}>
              <div className={styles.driverAvatar}>{getInitials(tracked.driver.name || "D")}</div>
              <div className={styles.driverInfo}>
                <strong>{tracked.driver.name}</strong>
                <span>{tracked.driver.phone} · {tracked.driver.vehicle} · ⭐ {tracked.driver.rating}</span>
              </div>
            </div>
          )}
          <button onClick={() => setTracked(null)} style={{ marginTop: 16, fontSize: "0.82rem", color: "#8B1A1A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Close tracking
          </button>
        </div>
      )}

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>All Deliveries</p>
        </div>
        {fetching ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} style={{ height: 52 }} />)}
          </div>
        ) : deliveries.length === 0 ? (
          <div className={styles.empty}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p>No deliveries yet</p>
          </div>
        ) : (
          <div className={styles.deliveryList}>
            {deliveries.map(d => (
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
                  {!["delivered","cancelled"].includes(d.status) && (
                    <button onClick={() => setTracked(d)} style={{ fontSize: "0.72rem", color: "#8B1A1A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      Track
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}