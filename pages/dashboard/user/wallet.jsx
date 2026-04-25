"use client";
import { useEffect, useState } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/Wallet.module.css";

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({ data, color, fill }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const W = 120, H = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  const fillPts = `0,${H} ${pts.join(" ")} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.sparkline} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#spark-${color.replace("#","")})`}/>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Donut ─────────────────────────────────────────────────────────
function SpendDonut({ credit, debit }) {
  const total = credit + debit || 1;
  const pctCredit = credit / total;
  const size = 140, r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const creditDash = pctCredit * circ;
  const debitDash  = (1 - pctCredit) * circ;
  const pct = Math.round((debit / total) * 100);
  return (
    <div className={styles.donut}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,0,0,0.08)" strokeWidth="18"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10B981" strokeWidth="18"
          strokeDasharray={`${creditDash} ${circ - creditDash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.8s ease" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#800000" strokeWidth="18"
          strokeDasharray={`${debitDash} ${circ - debitDash}`}
          strokeDashoffset={circ * 0.25 - creditDash}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className={styles.donutCenter}>
        <p className={styles.donutPct}>{pct}%</p>
        <p className={styles.donutLabel}>spent</p>
      </div>
    </div>
  );
}

export default function UserWallet() {
  const { user, loading, logout } = useAuth();
  const [wallet,   setWallet]   = useState(null);
  const [txns,     setTxns]     = useState([]);
  const [fetching, setFetching] = useState(true);
  const [tab,      setTab]      = useState("all");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(API + "/wallet",              { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/wallet/transactions", { headers: authHeaders() }).then(r => r.json()),
    ]).then(([w, t]) => {
      if (w.success) setWallet(w.data);
      if (t.success) setTxns(t.data || []);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user]);

  if (loading) return null;

  const credits = txns.filter(t => t.type === "credit");
  const debits  = txns.filter(t => t.type === "debit");

  const totalCredit = credits.reduce((s, t) => s + (t.amount || 0), 0);
  const totalDebit  = debits.reduce((s,  t) => s + (t.amount || 0), 0);
  const maxSpend    = Math.max(...debits.map(t => t.amount || 0), 0);

  // Monthly credit/debit sparkline data
  const months = Array(12).fill(0);
  const monthsDebit = Array(12).fill(0);
  txns.forEach(t => {
    if (!t.createdAt) return;
    const m = new Date(t.createdAt).getMonth();
    if (t.type === "credit") months[m] += t.amount || 0;
    else monthsDebit[m] += t.amount || 0;
  });

  const filtered = tab === "all" ? txns : tab === "credit" ? credits : debits;

  return (
    <DashboardLayout user={user} logout={logout} title="Wallet">

      {/* ── TOP ROW ── */}
      <div className={styles.topRow}>

        {/* Wallet card */}
        <div className={styles.walletCard}>
          <div className={styles.walletCardTop}>
            <div className={styles.walletChip}>
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <rect x="0.5" y="0.5" width="27" height="21" rx="3.5" stroke="rgba(255,255,255,0.4)"/>
                <rect x="4" y="4" width="8" height="14" rx="1" fill="rgba(255,255,255,0.25)"/>
                <rect x="4" y="9" width="20" height="4" rx="0.5" fill="rgba(255,255,255,0.15)"/>
              </svg>
            </div>
            <div className={styles.walletLogoText}>PICKAR</div>
          </div>
          <div className={styles.walletBalance}>
            <p className={styles.walletBalLabel}>Available Balance</p>
            <p className={styles.walletBalVal}>{fetching ? "—" : formatNaira(wallet?.balance)}</p>
          </div>
          <div className={styles.walletCardBottom}>
            <div className={styles.walletDots}>
              <span>••••</span><span>••••</span><span>••••</span>
              <span className={styles.walletLastDigits}>
                {user?.phone?.slice(-4) || "••••"}
              </span>
            </div>
            <p className={styles.walletCurrency}>{wallet?.currency || "NGN"}</p>
          </div>
          <div className={styles.walletGlow} />
        </div>

        {/* Stat cards */}
        <div className={styles.statsCol}>
          {/* Total funded */}
          <div className={styles.statMini}>
            <div className={styles.statMiniTop}>
              <div>
                <p className={styles.statMiniTrend} style={{ color: "#10B981" }}>
                  +{txns.length > 0 ? Math.round((credits.length / txns.length) * 100) : 0}% ▲
                </p>
                <p className={styles.statMiniVal}>{fetching ? "—" : formatNaira(totalCredit)}</p>
                <p className={styles.statMiniLabel}>Total Funded</p>
              </div>
              <Sparkline data={months} color="#10B981" />
            </div>
          </div>

          {/* Total spent */}
          <div className={styles.statMini}>
            <div className={styles.statMiniTop}>
              <div>
                <p className={styles.statMiniTrend} style={{ color: "#F97316" }}>
                  +{txns.length > 0 ? Math.round((debits.length / txns.length) * 100) : 0}% ▲
                </p>
                <p className={styles.statMiniVal}>{fetching ? "—" : formatNaira(totalDebit)}</p>
                <p className={styles.statMiniLabel}>Total Spent</p>
              </div>
              <Sparkline data={monthsDebit} color="#800000" />
            </div>
          </div>

          {/* Max single spend */}
          <div className={styles.statMini}>
            <div className={styles.statMiniTop}>
              <div>
                <p className={styles.statMiniTrend} style={{ color: "#3B82F6" }}>
                  Highest
                </p>
                <p className={styles.statMiniVal}>{fetching ? "—" : formatNaira(maxSpend)}</p>
                <p className={styles.statMiniLabel}>Max Single Spend</p>
              </div>
              <Sparkline data={monthsDebit.map((v, i) => i % 2 === 0 ? v : v * 0.6)} color="#3B82F6" />
            </div>
          </div>
        </div>

        {/* Spend breakdown donut */}
        <div className={styles.donutCard}>
          <p className={styles.donutCardTitle}>Spend Breakdown</p>
          <SpendDonut credit={totalCredit} debit={totalDebit} />
          <div className={styles.donutLegend}>
            <div className={styles.donutLegendItem}>
              <div className={styles.donutDot} style={{ background: "#10B981" }} />
              <span>Funded</span>
              <strong>{formatNaira(totalCredit)}</strong>
            </div>
            <div className={styles.donutLegendItem}>
              <div className={styles.donutDot} style={{ background: "#800000" }} />
              <span>Spent</span>
              <strong>{formatNaira(totalDebit)}</strong>
            </div>
          </div>
          <div className={styles.fundBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            To fund your wallet, open the Pickar app
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LIST ── */}
      <div className={styles.txCard}>
        <div className={styles.txCardHeader}>
          <div>
            <h3 className={styles.txCardTitle}>Transaction History</h3>
            <p className={styles.txCardSub}>{txns.length} transactions</p>
          </div>
          <div className={styles.tabs}>
            {[
              { key: "all",    label: "All",     count: txns.length },
              { key: "credit", label: "Funded",  count: credits.length },
              { key: "debit",  label: "Spent",   count: debits.length },
            ].map(t => (
              <button key={t.key}
                className={styles.tab + (tab === t.key ? " " + styles.tabActive : "")}
                onClick={() => setTab(t.key)}>
                {t.label}
                <span className={styles.tabCount}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className={styles.skeletonList}>
            {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} style={{ height: 60 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className={styles.txTable}>
            <div className={styles.txTableHead}>
              <span>Description</span>
              <span>Date</span>
              <span>Time</span>
              <span style={{ textAlign: "right" }}>Amount</span>
            </div>
            {filtered.map((t, i) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t._id || i} className={styles.txRow}>
                  <div className={styles.txRowLeft}>
                    <div className={styles.txIcon} style={{
                      background: isCredit ? "#10B98115" : "#80000015",
                      color: isCredit ? "#10B981" : "#800000",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        {isCredit
                          ? <path d="M12 19V5M5 12l7-7 7 7"/>
                          : <path d="M12 5v14M5 12l7 7 7-7"/>
                        }
                      </svg>
                    </div>
                    <div className={styles.txDesc}>
                      <strong>{t.description || (isCredit ? "Wallet Funded" : "Delivery Payment")}</strong>
                      <span className={styles.txType} style={{
                        color: isCredit ? "#10B981" : "#800000",
                        background: isCredit ? "#10B98112" : "#80000012",
                      }}>
                        {isCredit ? "Credit" : "Debit"}
                      </span>
                    </div>
                  </div>
                  <span className={styles.txDate}>{formatDate(t.createdAt)}</span>
                  <span className={styles.txTime}>{formatTime(t.createdAt)}</span>
                  <span className={styles.txAmount} style={{ color: isCredit ? "#10B981" : "#800000" }}>
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