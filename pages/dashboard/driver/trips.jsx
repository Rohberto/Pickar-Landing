"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css";

function formatNaira(a) { return "₦" + Number(a||0).toLocaleString("en-NG",{minimumFractionDigits:2}); }
function formatDate(d) { if(!d) return ""; return new Date(d).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"}); }
function StatusBadge({ status }) {
  const s = (status||"").toLowerCase().replace(/ /g,"_");
  return <span className={styles.badge + " " + (styles[s]||styles.pending)}>{(status||"").replace(/_/g," ")}</span>;
}

export default function DriverTrips() {
  const { user, loading, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(API + "/deliveries/history", { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setTrips(d.data||[]); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  if (loading) return null;

  return (
    <DashboardLayout user={user} logout={logout} title="Trips">
      <div className={styles.panel}>
        <div className={styles.panelHeader}><p className={styles.panelTitle}>All Trips</p></div>
        {fetching ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} style={{ height:52 }} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className={styles.empty}><p>No trips yet</p></div>
        ) : (
          <div className={styles.deliveryList}>
            {trips.map(t => (
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
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <StatusBadge status={t.status} />
                  {t.price && <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#155724" }}>{formatNaira(t.price)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}