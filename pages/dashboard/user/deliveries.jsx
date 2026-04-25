"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth, API, authHeaders } from "../../../components/dashboard/useAuth";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import TrackingModal from "../../../components/dashboard/TrackingMap";
import styles from "../../../styles/dashboard/Deliveries.module.css";

const STATUS_COLORS = {
  pending:         "#F59E0B",
  finding_driver:  "#3B82F6",
  driver_assigned: "#8B5CF6",
  picked_up:       "#06B6D4",
  in_transit:      "#F97316",
  delivered:       "#10B981",
  cancelled:       "#EF4444",
};

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
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

// ── Donut chart ────────────────────────────────────────────────────
function DonutChart({ segments, total }) {
  const size = 160, r = 60, cx = 80, cy = 80;
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,0,0,0.08)" strokeWidth="18"/>
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth="18"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.offset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.8s ease" }}
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

// ── Frequency map (Leaflet) ────────────────────────────────────────
function FrequencyMap({ deliveries }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || mapInstance.current) return;

    // Inject Leaflet CSS if not already present
    if (!document.querySelector('link[href*="leaflet.min.css"]')) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    import("leaflet").then(L => {
      if (!mapRef.current || mapInstance.current) return;

      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(mapRef.current, {
        center: [6.5244, 3.3792],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Plot all delivery destination pins
      const bounds = [];
      deliveries.forEach(d => {
        const coords = d.recipient?.address?.coordinates;
        const lat    = coords?.lat;
        const lng    = coords?.lng;
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        const isDelivered  = d.status === "delivered";
        const isActive     = !["delivered","cancelled"].includes(d.status);
        const pinColor     = isDelivered ? "#10B981" : isActive ? "#F97316" : "#EF4444";

        const icon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 384 512">
            <path fill="${pinColor}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
          </svg>`,
          className: "",
          iconSize:   [22, 28],
          iconAnchor: [11, 28],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Roboto,sans-serif;min-width:160px;">
            <p style="font-weight:700;font-size:0.82rem;color:#800000;margin:0 0 4px">${d.recipient?.name || "—"}</p>
            <p style="font-size:0.72rem;color:#555;margin:0 0 6px">${d.recipient?.address?.label || "—"}</p>
            <span style="font-size:0.68rem;font-weight:600;padding:2px 8px;border-radius:100px;background:${pinColor}18;color:${pinColor}">
              ${(d.status || "").replace(/_/g, " ")}
            </span>
          </div>
        `);
        bounds.push([lat, lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      }

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [deliveries.length]);

  return (
    <div className={styles.freqMapWrap}>
      <div ref={mapRef} className={styles.freqMap} />
      <div className={styles.freqMapLegend}>
        {[
          { color: "#10B981", label: "Delivered" },
          { color: "#F97316", label: "Active" },
          { color: "#EF4444", label: "Cancelled" },
        ].map(l => (
          <div key={l.label} className={styles.freqMapLegendItem}>
            <svg width="10" height="12" viewBox="0 0 384 512">
              <path fill={l.color} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/>
            </svg>
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Frequent locations ─────────────────────────────────────────────
function FrequentLocations({ deliveries }) {
  const counts = {};
  deliveries.forEach(d => {
    const label = d.recipient?.address?.label?.trim();
    if (label) counts[label] = (counts[label] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const max = sorted[0]?.[1] || 1;

  if (sorted.length === 0) return (
    <div className={styles.emptySmall}>No location data yet</div>
  );

  return (
    <div className={styles.freqList}>
      {sorted.map(([label, count], i) => (
        <div key={label} className={styles.freqItem}>
          <div className={styles.freqRank}>{i + 1}</div>
          <div className={styles.freqInfo}>
            <p className={styles.freqLabel} title={label}>{label}</p>
            <div className={styles.freqBarWrap}>
              <div className={styles.freqBar}>
                <div
                  className={styles.freqBarFill}
                  style={{ width: (count / max) * 100 + "%", background: "#800000" }}
                />
              </div>
              <span className={styles.freqCount}>{count}x</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function UserDeliveries() {
  const { user, loading, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [tracked,    setTracked]    = useState(null);
  const [fetching,   setFetching]   = useState(true);
  const [activeTab,  setActiveTab]  = useState("all");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    if (!user) return;
    fetch(API + "/deliveries/history", { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setDeliveries(d.data || []); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user]);

  if (loading) return null;

  const delivered = deliveries.filter(d => d.status === "delivered");
  const active    = deliveries.filter(d => !["delivered","cancelled"].includes(d.status));
  const cancelled = deliveries.filter(d => d.status === "cancelled");

  const tabFiltered = activeTab === "all" ? deliveries
    : activeTab === "active" ? active
    : activeTab === "delivered" ? delivered
    : cancelled;

  const filtered = search.trim()
    ? tabFiltered.filter(d =>
        d.recipient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.recipient?.address?.label?.toLowerCase().includes(search.toLowerCase()) ||
        d._id?.toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered;

  const segments = [
    { label: "Delivered", value: delivered.length, color: "#10B981" },
    { label: "Active",    value: active.length,    color: "#F97316" },
    { label: "Cancelled", value: cancelled.length, color: "#EF4444" },
  ];

  return (
    <DashboardLayout user={user} logout={logout} title="Deliveries">

      {tracked && (
        <TrackingModal
          delivery={tracked}
          onClose={() => setTracked(null)}
          onUpdate={data => setTracked(prev => ({ ...prev, ...data }))}
        />
      )}

      {/* ── TOP ROW: Stats donut + Frequent locations ── */}
      <div className={styles.topRow}>

        {/* Delivery stats donut */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Delivery Stats</h3>
            <p className={styles.cardSub}>Visual breakdown</p>
          </div>
          <div className={styles.donutSection}>
            <DonutChart segments={segments} total={deliveries.length} />
            <div className={styles.donutLegend}>
              {segments.map(s => (
                <div key={s.label} className={styles.legendRow}>
                  <div className={styles.legendBlock} style={{ background: s.color }} />
                  <div className={styles.legendInfo}>
                    <span className={styles.legendLabel}>{s.label}</span>
                    <span className={styles.legendVal}>{s.value}</span>
                  </div>
                  <span className={styles.legendPct}>
                    {deliveries.length > 0 ? Math.round((s.value / deliveries.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Frequent locations */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Frequent Locations</h3>
            <p className={styles.cardSub}>Most delivered to</p>
          </div>
          {fetching
            ? <div className={styles.skeletonList}>{[1,2,3,4].map(i => <div key={i} className={styles.skeleton} style={{ height: 44 }} />)}</div>
            : <FrequentLocations deliveries={deliveries} />
          }
        </div>

        {/* Quick stats column */}
        <div className={styles.statsCol}>
          {[
            { label: "Total",     value: deliveries.length, color: "#800000",  icon: "📦" },
            { label: "Active",    value: active.length,    color: "#F97316",  icon: "🚚" },
            { label: "Delivered", value: delivered.length, color: "#10B981",  icon: "✅" },
            { label: "Cancelled", value: cancelled.length, color: "#EF4444",  icon: "❌" },
          ].map(s => (
            <div key={s.label} className={styles.miniStat}>
              <span className={styles.miniStatIcon}>{s.icon}</span>
              <div>
                <p className={styles.miniStatVal} style={{ color: s.color }}>{s.value}</p>
                <p className={styles.miniStatLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAP: Delivery locations ── */}
      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Delivery Locations Map</h3>
            <p className={styles.cardSub}>All destinations plotted — click a pin for details</p>
          </div>
        </div>
        {fetching
          ? <div className={styles.skeleton} style={{ height: 320, borderRadius: 12 }} />
          : <FrequencyMap deliveries={deliveries} />
        }
      </div>

      {/* ── DELIVERIES TABLE ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>All Deliveries</h3>
            <p className={styles.cardSub}>{deliveries.length} total orders</p>
          </div>
          <div className={styles.tableControls}>
            <div className={styles.searchBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search deliveries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabRow}>
          {[
            { key: "all",       label: "All",       count: deliveries.length },
            { key: "active",    label: "Active",    count: active.length },
            { key: "delivered", label: "Delivered", count: delivered.length },
            { key: "cancelled", label: "Cancelled", count: cancelled.length },
          ].map(t => (
            <button key={t.key}
              className={styles.tab + (activeTab === t.key ? " " + styles.tabActive : "")}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
              <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {fetching ? (
          <div className={styles.skeletonList}>
            {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} style={{ height: 60 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 384 512" fill="none">
              <path fill="#C0C0C0" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/>
            </svg>
            <p>No deliveries found</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Destination</th>
                  <th>Recipient</th>
                  <th>Package</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id} className={styles.tableRow}>
                    <td>
                      <span className={styles.orderId}>#{d._id?.slice(-6).toUpperCase()}</span>
                    </td>
                    <td>
                      <div className={styles.destCell}>
                        <svg width="12" height="15" viewBox="0 0 384 512">
                          <path fill="#800000" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/>
                        </svg>
                        <span>{d.recipient?.address?.label || "—"}</span>
                      </div>
                    </td>
                    <td>{d.recipient?.name || "—"}</td>
                    <td>
                      <span className={styles.pkgType}>{d.packageType || "—"}</span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <span>{formatDate(d.createdAt)}</span>
                        <span className={styles.timeCell}>{formatTime(d.createdAt)}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      {!["delivered","cancelled"].includes(d.status) && (
                        <button className={styles.trackBtn} onClick={() => setTracked(d)}>
                          Track
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}