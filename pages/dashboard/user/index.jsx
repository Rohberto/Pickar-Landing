"use client";
import { useEffect, useState } from "react";
import TrackingModal from "../../../components/dashboard/TrackingMap";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import styles from "../../../styles/dashboard/UserDashboard.module.css";
import { BsWallet2 } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { LuPackageCheck } from "react-icons/lu";
import { FaTruckArrowRight } from "react-icons/fa6";

const STATUS_STEPS = ["pending","finding_driver","driver_assigned","picked_up","in_transit","delivered"];
const STATUS_LABELS = {
  pending: "Order Placed",
  finding_driver: "Finding Driver",
  driver_assigned: "Driver Assigned",
  picked_up: "Package Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
};
const STATUS_COLORS = {
  pending: "#F59E0B",
  finding_driver: "#3B82F6",
  driver_assigned: "#8B5CF6",
  picked_up: "#06B6D4",
  in_transit: "#F97316",
  delivered: "#10B981",
  cancelled: "#EF4444",
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
function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[(status || "").toLowerCase().replace(/ /g, "_")] || "#999";
  return (
    <span className={styles.badge} style={{ background: color + "18", color }}>
      <span className={styles.badgeDot} style={{ background: color }} />
      {(status || "").replace(/_/g, " ")}
    </span>
  );
}

function MiniBarChart({ data, color }) {
  if (!data || data.length === 0) return <div className={styles.chartEmpty}>No data yet</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className={styles.barChart}>
      {data.map((d, i) => (
        <div key={i} className={styles.barCol}>
          <div
            className={styles.bar}
            style={{ height: Math.max((d.value / max) * 100, 4) + "%", background: color }}
            title={d.label + ": " + d.value}
          />
          <span className={styles.barLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ data, color }) {
  if (!data || data.length < 2) return <div className={styles.chartEmpty}>No data yet</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const W = 200, H = 60;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.value - min) / range) * H;
    return x + "," + y;
  });
  const fillPts = "0," + H + " " + pts.join(" ") + " " + W + "," + H;
  return (
    <svg viewBox={"0 0 " + W + " " + H} className={styles.lineChart} preserveAspectRatio="none">
      <defs>
        <linearGradient id={"lg" + color.replace("#","")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={"url(#lg" + color.replace("#","") + ")"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DonutChart({ segments, total }) {
  const size = 120;
  const r    = 46;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(s => {
    const pct  = total > 0 ? s.value / total : 0;
    const dash = pct * circ;
    const arc  = { ...s, dash, gap: circ - dash, offset: circ - offset };
    offset += dash;
    return arc;
  });
  return (
    <div className={styles.donut}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,0,0,0.1)" strokeWidth="16"/>
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth="16"
            strokeDasharray={a.dash + " " + a.gap}
            strokeDashoffset={a.offset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
      </svg>
      <div className={styles.donutCenter}>
        <p className={styles.donutTotal}>{total}</p>
        <p className={styles.donutLabel}>Total</p>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const [wallet,      setWallet]      = useState(null);
  const [deliveries,  setDeliveries]  = useState([]);
  const [tracked,     setTracked]     = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab,   setActiveTab]   = useState("all");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(API + "/wallet",             { headers: authHeaders() }).then(r => r.json()),
      fetch(API + "/deliveries/history", { headers: authHeaders() }).then(r => r.json()),
    ]).then(([w, d]) => {
      if (w.success) setWallet(w.data);
      if (d.success) setDeliveries(d.data || []);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, [user]);

  if (loading) return null;

  const active    = deliveries.filter(d => !["delivered","cancelled"].includes(d.status));
  const delivered = deliveries.filter(d => d.status === "delivered");
  const cancelled = deliveries.filter(d => d.status === "cancelled");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyCounts = Array(12).fill(0);
  deliveries.forEach(d => {
    if (d.createdAt) monthlyCounts[new Date(d.createdAt).getMonth()]++;
  });
  const chartData = months.map((label, i) => ({ label: label.slice(0,1), value: monthlyCounts[i] }));

  const monthlySpend = Array(12).fill(0);
  deliveries.forEach(d => {
    if (d.createdAt && d.price) monthlySpend[new Date(d.createdAt).getMonth()] += d.price;
  });
  const spendData = months.map((label, i) => ({ label: label.slice(0,1), value: monthlySpend[i] }));

  const filteredDeliveries = activeTab === "all" ? deliveries
    : activeTab === "active" ? active
    : activeTab === "delivered" ? delivered
    : cancelled;

  const successRate = deliveries.length > 0 ? Math.round((delivered.length / deliveries.length) * 100) : 0;

  return (
    <DashboardLayout user={user} logout={logout} title="">

      {tracked && (
        <TrackingModal
          delivery={tracked}
          onClose={() => setTracked(null)}
          onUpdate={data => setTracked(prev => ({ ...prev, ...data }))}
        />
      )}

      <div className={styles.welcomeBar}>
        <div>
          <p className={styles.welcomeSub}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋</p>
          <h2 className={styles.welcomeName}>Welcome back, {user?.fullName?.split(" ")[0]}</h2>
        </div>
      </div>

      <div className={styles.statsRow}>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: "rgba(128,0,0,0.1)" }}>
              <BsWallet2 size={20} color="#800000" />
            </div>
            <div className={styles.statTrend} style={{ color: "#10B981", background: "#10B98115" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              Live
            </div>
          </div>
          <p className={styles.statVal}>{dataLoading ? "—" : formatNaira(wallet?.balance)}</p>
          <p className={styles.statLbl}>Wallet Balance</p>
          <div className={styles.statChart}>
            <MiniLineChart data={spendData} color="#800000" />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{ background: "#3B82F615" }}>
              <CiDeliveryTruck size={24} color="#3B82F6" />
            </div>
            <div className={styles.statTrend} style={{ color: "#3B82F6", background: "#3B82F615" }}>
              Total
            </div>
          </div>
          <p className={styles.statVal}>{dataLoading ? "—" : deliveries.length}</p>
          <p className={styles.statLbl}>Total Deliveries</p>
          <div className={styles.statChart}>
            <MiniBarChart data={chartData} color="#3B82F6" />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statSimpleRow}>
            <div>
              <div className={styles.statIcon} style={{ background: "#F9731615", marginBottom: 10 }}>
                <FaTruckArrowRight size={18} color="#F97316" />
              </div>
              <p className={styles.statSimpleLbl}>
                Active Deliveries
                <span className={styles.statInfoDot} title="Currently in progress">ⓘ</span>
              </p>
              <p className={styles.statSimpleVal}>{dataLoading ? "—" : active.length}</p>
              <p className={styles.statSimpleFooter}>
                vs total{" "}
                <span style={{ color: active.length > 0 ? "#F97316" : "#aaa", fontWeight: 700 }}>
                  ({deliveries.length > 0 ? Math.round((active.length / deliveries.length) * 100) : 0}%)
                </span>{" "}
                {active.length > 0
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                }
              </p>
            </div>
            <div className={styles.statSparkline}>
              <MiniLineChart data={chartData} color="#F97316" />
              <div className={styles.statSparkDot} style={{ background: "#F97316" }} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statSimpleRow}>
            <div>
              <div className={styles.statIcon} style={{ background: "#10B98115", marginBottom: 10 }}>
                <LuPackageCheck size={18} color="#10B981" />
              </div>
              <p className={styles.statSimpleLbl}>
                Orders Delivered
                <span className={styles.statInfoDot} title="Successfully delivered">ⓘ</span>
              </p>
              <p className={styles.statSimpleVal}>{dataLoading ? "—" : delivered.length}</p>
              <p className={styles.statSimpleFooter}>
                success rate{" "}
                <span style={{ color: "#10B981", fontWeight: 700 }}>
                  ({successRate}%)
                </span>{" "}
                {successRate > 0
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                  : null
                }
              </p>
            </div>
            <div className={styles.statSparkline}>
              <MiniLineChart
                data={months.map((label, i) => ({ label: label.slice(0,1), value: monthlyCounts[i] }))}
                color="#10B981"
              />
              <div className={styles.statSparkDot} style={{ background: "#10B981" }} />
            </div>
          </div>
        </div>

      </div>

      <div className={styles.contentGrid}>

        <div className={styles.leftCol}>

          {active.length > 0 ? (
            <div className={styles.activeCard}>
              <div className={styles.activeCardHeader}>
                <div className={styles.activePulseWrap}>
                  <span className={styles.activePulse} />
                  <span className={styles.activePulseRing} />
                </div>
                <div>
                  <h3 className={styles.activeCardTitle}>Active Delivery</h3>
                  <p className={styles.activeCardSub}>{active.length} package{active.length > 1 ? "s" : ""} in transit</p>
                </div>
              </div>
              {active.slice(0,1).map(d => (
                <div key={d._id} className={styles.activeItem}>
                  <div className={styles.activeItemRoute}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 384 512">
                      <path fill="#10B981" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                    </svg>
                    <div className={styles.routeLine} />
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 384 512">
                      <path fill="#EF4444" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                    </svg>
                  </div>
                  <div className={styles.activeItemInfo}>
                    <div className={styles.routePoint}>
                      <span className={styles.routePointLabel}>From</span>
                      <span className={styles.routePointVal}>{d.pickupAddress?.label?.split(",")[0] || "Pickup point"}</span>
                    </div>
                    <div className={styles.routePoint}>
                      <span className={styles.routePointLabel}>To</span>
                      <span className={styles.routePointVal}>{d.recipient?.address?.label?.split(",")[0] || "Destination"}</span>
                    </div>
                  </div>
                  <button className={styles.trackNowBtn} onClick={() => setTracked(d)}>
                    Track Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noActiveCard}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p>No active deliveries</p>
            </div>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Deliveries</h3>
                <p className={styles.panelSub}>{deliveries.length} total orders</p>
              </div>
              <a href="/dashboard/user/deliveries" className={styles.panelBtn}>View all</a>
            </div>

            <div className={styles.tabRow}>
              {["all","active","delivered","cancelled"].map(t => (
                <button key={t}
                  className={styles.tab + (activeTab === t ? " " + styles.tabActive : "")}
                  onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  <span className={styles.tabCount}>
                    {t === "all" ? deliveries.length : t === "active" ? active.length : t === "delivered" ? delivered.length : cancelled.length}
                  </span>
                </button>
              ))}
            </div>

            {dataLoading ? (
              <div className={styles.skeletonList}>
                {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} style={{ height: 56 }} />)}
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className={styles.empty}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <p>No deliveries here</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Destination</th>
                      <th>Recipient</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.slice(0,8).map(d => (
                      <tr key={d._id}>
                        <td><span className={styles.orderId}>#{d._id?.slice(-6).toUpperCase()}</span></td>
                        <td><span className={styles.destination}>{d.recipient?.address?.label?.split(",")[0] || "—"}</span></td>
                        <td>{d.recipient?.name || "—"}</td>
                        <td className={styles.dateCell}>
                          <span>{formatDate(d.createdAt)}</span>
                          <span className={styles.timeCell}>{formatTime(d.createdAt)}</span>
                        </td>
                        <td><StatusBadge status={d.status} /></td>
                        <td>
                          {!["delivered","cancelled"].includes(d.status) && (
                            <button className={styles.trackBtn} onClick={() => setTracked(d)}>Track</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightCol}>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Delivery Breakdown</h3>
                <p className={styles.panelSub}>All time stats</p>
              </div>
            </div>
            <div className={styles.donutWrap}>
              <DonutChart
                segments={[
                  { label: "Delivered", value: delivered.length, color: "#10B981" },
                  { label: "Active",    value: active.length,    color: "#F97316" },
                  { label: "Cancelled", value: cancelled.length, color: "#EF4444" },
                ]}
                total={deliveries.length}
              />
            </div>
            <div className={styles.donutLegend}>
              {[
                { label: "Delivered", value: delivered.length, color: "#10B981" },
                { label: "Active",    value: active.length,    color: "#F97316" },
                { label: "Cancelled", value: cancelled.length, color: "#EF4444" },
              ].map(s => (
                <div key={s.label} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: s.color }} />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendVal}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Monthly Activity</h3>
                <p className={styles.panelSub}>Deliveries per month</p>
              </div>
            </div>
            <div className={styles.chartArea}>
              <MiniBarChart data={chartData} color="#800000" />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}