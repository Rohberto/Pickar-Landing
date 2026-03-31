"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Dashboard.module.css";

function formatNaira(a) { return "₦" + Number(a||0).toLocaleString("en-NG",{minimumFractionDigits:2}); }
function formatDate(d) { if(!d) return ""; return new Date(d).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }

export default function DriverWallet() {
  const { user, loading, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [txns,   setTxns]   = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(API + "/wallet",              { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/wallet/transactions", { headers: authHeaders() }).then(r => r.json()),
    ]).then(([w,t]) => {
      if (w.success) setWallet(w.data);
      if (t.success) setTxns(t.data || []);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user]);

  if (loading) return null;

  return (
    <DashboardLayout user={user} logout={logout} title="Wallet">
      <div className={styles.statsGrid} style={{ marginBottom: 24 }}>
        <div className={styles.statCard + " " + styles.accent}>
          <div className={styles.statIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
          </div>
          <p className={styles.statLabel}>Earnings Balance</p>
          <p className={styles.statValue}>{fetching ? "—" : formatNaira(wallet?.balance)}</p>
          <p className={styles.statSub}>{wallet?.currency || "NGN"}</p>
        </div>
      </div>
      <div className={styles.panel}>
        <div className={styles.panelHeader}><p className={styles.panelTitle}>Transaction History</p></div>
        {fetching ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} style={{ height:48 }} />)}
          </div>
        ) : txns.length === 0 ? (
          <div className={styles.empty}><p>No transactions yet</p></div>
        ) : (
          <div className={styles.txList}>
            {txns.map((t,i) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t._id||i} className={styles.txItem}>
                  <div className={styles.txIconWrap + " " + (isCredit ? styles.credit : styles.debit)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      {isCredit ? <path d="M12 19V5M5 12l7-7 7 7"/> : <path d="M12 5v14M5 12l7 7 7-7"/>}
                    </svg>
                  </div>
                  <div className={styles.txInfo}>
                    <strong>{t.description || (isCredit ? "Trip Earnings" : "Withdrawal")}</strong>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                  <span className={styles.txAmount + " " + (isCredit ? styles.credit : styles.debit)}>
                    {isCredit ? "+" : "-"}{formatNaira(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}