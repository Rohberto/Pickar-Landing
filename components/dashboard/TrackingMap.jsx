"use client";
import { useEffect, useRef, useState } from "react";
import { API, authHeaders } from "./useAuth";
import styles from "../../styles/dashboard/TrackingMap.module.css";

const STATUS_STEPS = ["pending","finding_driver","driver_assigned","picked_up","in_transit","delivered"];
const STATUS_LABELS = {
  pending:         "Order Placed",
  finding_driver:  "Finding Driver",
  driver_assigned: "Driver Assigned",
  picked_up:       "Package Picked Up",
  in_transit:      "In Transit",
  delivered:       "Delivered",
};
const STATUS_COLORS = {
  pending:         "#F59E0B",
  finding_driver:  "#3B82F6",
  driver_assigned: "#8B5CF6",
  picked_up:       "#06B6D4",
  in_transit:      "#F97316",
  delivered:       "#10B981",
  cancelled:       "#EF4444",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
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

// ── Leaflet Map Component ──────────────────────────────────────────
function LiveMap({ delivery, driverPos }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const pickupMarker  = useRef(null);
  const destMarker    = useRef(null);
  const driverMarker  = useRef(null);
  const driverTrail   = useRef(null);
  const routeLine     = useRef(null);
  const simMarker     = useRef(null);

  const pickup = delivery.pickupAddress?.coordinates;
  const dest   = delivery.recipient?.address?.coordinates;

  // Default to Lagos center if no coordinates
  const defaultLat = pickup?.lat || dest?.lat || 6.5244;
  const defaultLng = pickup?.lng || dest?.lng || 3.3792;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapInstance.current) return; // already initialized

    // Inject Leaflet CSS if not already present
    if (!document.querySelector('link[href*="leaflet.min.css"]')) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Dynamic import to avoid SSR issues
    import("leaflet").then(L => {
      // Fix default icon path issue with webpack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center:  [defaultLat, defaultLng],
        zoom:    13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // ── Pickup marker (green) ──
      if (pickup?.lat && pickup?.lng) {
        const greenIcon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 384 512">
            <path fill="#10B981" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
            <circle cx="192" cy="192" r="48" fill="#fff"/>
          </svg>`,
          className: "",
          iconSize:   [28, 34],
          iconAnchor: [14, 34],
        });
        pickupMarker.current = L.marker([pickup.lat, pickup.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup("<b>Pickup</b><br>" + (delivery.pickupAddress?.label || ""));
      }

      // ── Destination marker (red) ──
      if (dest?.lat && dest?.lng) {
        const redIcon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 384 512">
            <path fill="#EF4444" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
            <circle cx="192" cy="192" r="48" fill="#fff"/>
          </svg>`,
          className: "",
          iconSize:   [28, 34],
          iconAnchor: [14, 34],
        });
        destMarker.current = L.marker([dest.lat, dest.lng], { icon: redIcon })
          .addTo(map)
          .bindPopup("<b>Destination</b><br>" + (delivery.recipient?.address?.label || ""));
      }

      // ── Dashed route line between pickup and dest ──
      if (pickup?.lat && dest?.lat) {
        routeLine.current = L.polyline(
          [[pickup.lat, pickup.lng], [dest.lat, dest.lng]],
          { color: "#800000", weight: 2, opacity: 0.4, dashArray: "6 8" }
        ).addTo(map);

        // Fit map to show both points
        map.fitBounds([
          [pickup.lat, pickup.lng],
          [dest.lat,   dest.lng],
        ], { padding: [40, 40] });
      }

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // ── Update driver marker when position changes ──
  useEffect(() => {
    if (!mapInstance.current || !driverPos) return;

    const { lat, lng } = driverPos;

    // Guard — skip if coords are not valid numbers
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return;

    import("leaflet").then(L => {
      if (driverMarker.current) {
        // Animate marker smoothly to new position
        driverMarker.current.setLatLng([lat, lng]);
        // Also draw/update the trail line from last known position
        if (driverTrail.current) {
          const pts = driverTrail.current.getLatLngs();
          pts.push([lat, lng]);
          // Keep trail to last 20 points so it doesn't get too long
          if (pts.length > 20) pts.shift();
          driverTrail.current.setLatLngs(pts);
        } else {
          driverTrail.current = L.polyline([[lat, lng]], {
            color: "#800000", weight: 3, opacity: 0.5,
          }).addTo(mapInstance.current);
        }
      } else {
        const bikeIcon = L.divIcon({
          html: `<div style="position:relative;width:40px;height:48px;">
            <style>
              @keyframes markerPulse {
                0%   { transform:scale(1);   opacity:0.6; }
                100% { transform:scale(2.2); opacity:0; }
              }
              .driver-pulse {
                position:absolute;
                top:2px;left:2px;
                width:28px;height:28px;
                border-radius:50%;
                background:rgba(128,0,0,0.3);
                animation:markerPulse 1.4s ease-out infinite;
              }
            </style>
            <div class="driver-pulse"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 384 512" style="position:absolute;top:0;left:4px;filter:drop-shadow(0 3px 6px rgba(128,0,0,0.45))">
              <path fill="#800000" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
              <circle cx="192" cy="192" r="48" fill="#C0C0C0"/>
            </svg>
          </div>`,
          className: "",
          iconSize:   [40, 48],
          iconAnchor: [20, 48],
        });
        driverMarker.current = L.marker([lat, lng], { icon: bikeIcon })
          .addTo(mapInstance.current)
          .bindPopup("<b>Your Driver</b><br>" + (delivery.driver?.name || "Driver"));
      }
      mapInstance.current.panTo([lat, lng], { animate: true, duration: 1 });
    });
  }, [driverPos]);

  // ── Package marker — static at pickup until driver moves it ──
  const simRef = useRef(null);

  useEffect(() => {
    const activeStatuses = ["driver_assigned","picked_up","in_transit","finding_driver","pending"];
    if (!activeStatuses.includes(delivery.status)) return;

    const pickup = delivery.pickupAddress?.coordinates;
    if (!pickup?.lat || !pickup?.lng) return;

    import("leaflet").then(L => {
      if (!mapInstance.current) return;
      if (simRef.current) return; // already placed

      const pkgIcon = L.divIcon({
        html: `<div style="position:relative;width:44px;height:44px;">
          <style>
            @keyframes pkgPulse {
              0%,100%{transform:scale(1);opacity:0.5;}
              50%{transform:scale(1.9);opacity:0;}
            }
            .pkg-ring{
              position:absolute;top:3px;left:3px;
              width:30px;height:30px;border-radius:50%;
              background:rgba(249,115,22,0.3);
              animation:pkgPulse 1.6s ease-out infinite;
            }
          </style>
          <div class="pkg-ring"></div>
          <div style="
            position:absolute;top:0;left:0;
            width:36px;height:36px;border-radius:50%;
            background:#F97316;border:3px solid #fff;
            box-shadow:0 3px 12px rgba(249,115,22,0.5);
            display:flex;align-items:center;justify-content:center;
            font-size:15px;line-height:1;
          ">📦</div>
        </div>`,
        className: "",
        iconSize:   [44, 44],
        iconAnchor: [22, 22],
      });

      // Place package at pickup — stays here until driver_location moves it
      simRef.current = L.marker([pickup.lat, pickup.lng], { icon: pkgIcon })
        .addTo(mapInstance.current)
        .bindPopup("<b>📦 Your Package</b><br>Waiting for pickup...");
    });
  }, [delivery.status, delivery._id]);

  // ── Move package marker when driver location updates ──
  useEffect(() => {
    if (!driverPos || !simRef.current || !mapInstance.current) return;
    const { lat, lng } = driverPos;
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return;
    // Package follows driver position
    simRef.current.setLatLng([lat, lng]);
    simRef.current.setPopupContent("<b>📦 Your Package</b><br>On the way...");
  }, [driverPos]);

  return (
    <div className={styles.mapWrap}>
      <div ref={mapRef} className={styles.map} />
      {!pickup?.lat && !dest?.lat && (
        <div className={styles.mapNoCoords}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          <p>Location data not available yet</p>
        </div>
      )}
      <div className={styles.mapLegend}>
        <div className={styles.mapLegendItem}>
          <svg width="12" height="14" viewBox="0 0 384 512"><path fill="#10B981" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/></svg>
          <span>Pickup</span>
        </div>
        <div className={styles.mapLegendItem}>
          <svg width="12" height="14" viewBox="0 0 384 512"><path fill="#EF4444" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/></svg>
          <span>Destination</span>
        </div>
        {driverPos && (
          <div className={styles.mapLegendItem}>
            <svg width="12" height="14" viewBox="0 0 384 512"><path fill="#800000" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0z"/></svg>
            <span>Driver</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Tracking Modal ────────────────────────────────────────────
export default function TrackingModal({ delivery: initialDelivery, onClose, onUpdate }) {
  const [delivery,   setDelivery]   = useState(initialDelivery);
  const [driverPos,  setDriverPos]  = useState(() => {
    const loc = delivery.driver?.location;
    if (!loc || loc.length < 2) return null;
    const lat = Number(loc[1]);
    const lng = Number(loc[0]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  });
  const socketRef = useRef(null);
  const stepIndex = STATUS_STEPS.indexOf(delivery.status);

  // ── Poll delivery status every 8s ──
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(API + "/deliveries/" + delivery._id + "/status", { headers: authHeaders() })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setDelivery(prev => ({ ...prev, ...d.data }));
            if (onUpdate) onUpdate(d.data);
            // Update driver position from status poll too
            if (d.data?.driver?.location?.length >= 2) {
              const lat = Number(d.data.driver.location[1]);
              const lng = Number(d.data.driver.location[0]);
              if (!isNaN(lat) && !isNaN(lng)) setDriverPos({ lat, lng });
            }
          }
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [delivery._id]);

  // ── Socket.io for real-time driver location ──
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = (() => {
      try { return JSON.parse(localStorage.getItem("pickar_user") || "{}").id; } catch { return null; }
    })();

    import("socket.io-client").then(({ io }) => {
      const SOCKET_URL = "https://theosophically-uncoaxal-gussie.ngrok-free.dev";
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        extraHeaders: { "ngrok-skip-browser-warning": "true" },
      });

      socket.on("connect", () => {
        console.log("[Socket] connected");
        if (userId) socket.emit("join_user_room", { userId });
      });

      // Live driver location update
      socket.on("driver_location", ({ lat, lng, deliveryId }) => {
        if (deliveryId === delivery._id) {
          setDriverPos({ lat, lng });
        }
      });

      // Driver assigned
      socket.on("driver_assigned", ({ deliveryId, driver }) => {
        if (deliveryId === delivery._id) {
          setDelivery(prev => ({ ...prev, status: "driver_assigned", driver }));
          if (driver?.location) {
            setDriverPos({ lat: driver.location[1], lng: driver.location[0] });
          }
        }
      });

      // Package picked up
      socket.on("package_picked_up", ({ deliveryId }) => {
        if (deliveryId === delivery._id) {
          setDelivery(prev => ({ ...prev, status: "picked_up" }));
        }
      });

      // Delivered
      socket.on("package_delivered", ({ deliveryId }) => {
        if (deliveryId === delivery._id) {
          setDelivery(prev => ({ ...prev, status: "delivered" }));
        }
      });

      socketRef.current = socket;
    }).catch(() => {});

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [delivery._id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.orderId}>#{delivery._id?.slice(-8).toUpperCase()}</p>
            <h3 className={styles.title}>Live Tracking</h3>
          </div>
          <div className={styles.headerRight}>
            <StatusBadge status={delivery.status} />
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Map (full width) ── */}
        <LiveMap delivery={delivery} driverPos={driverPos} />

        {/* ── Bottom panel ── */}
        <div className={styles.bottom}>

          {/* Left: addresses + recipient + driver */}
          <div className={styles.bottomLeft}>

            {/* Route */}
            <div className={styles.route}>
              <div className={styles.routeRow}>
                <div className={styles.routeDotGreen} />
                <div>
                  <p className={styles.routeLabel}>Pickup</p>
                  <p className={styles.routeVal}>{delivery.pickupAddress?.label || "—"}</p>
                </div>
              </div>
              <div className={styles.routeDash} />
              <div className={styles.routeRow}>
                <div className={styles.routeDotRed} />
                <div>
                  <p className={styles.routeLabel}>Destination</p>
                  <p className={styles.routeVal}>{delivery.recipient?.address?.label || "—"}</p>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className={styles.infoBox}>
              <p className={styles.infoLabel}>Recipient</p>
              <p className={styles.infoName}>{delivery.recipient?.name || "—"}</p>
              <p className={styles.infoSub}>{delivery.recipient?.phone || "—"}</p>
            </div>

            {/* Driver */}
            {delivery.driver ? (
              <div className={styles.driverBox}>
                <div className={styles.driverAvatar}>{getInitials(delivery.driver.name || "D")}</div>
                <div className={styles.driverInfo}>
                  <p className={styles.driverName}>{delivery.driver.name}</p>
                  <p className={styles.driverMeta}>{delivery.driver.vehicle} · ⭐ {delivery.driver.rating}</p>
                  <p className={styles.driverPhone}>{delivery.driver.phone}</p>
                </div>
                {driverPos && (
                  <div className={styles.driverLive}>
                    <span className={styles.liveDot} />
                    Live
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noDriver}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>
                  {delivery.status === "finding_driver"
                    ? "Finding a driver..."
                    : "No driver assigned yet"}
                </span>
              </div>
            )}
          </div>

          {/* Right: timeline */}
          <div className={styles.bottomRight}>
            <p className={styles.timelineTitle}>Delivery Progress</p>
            <div className={styles.timeline}>
              {STATUS_STEPS.filter(s => s !== "cancelled").map((s, i) => {
                const done   = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={s} className={styles.timelineRow}>
                    <div className={styles.timelineLeft}>
                      <div className={styles.timelineDot} style={{
                        background: done ? "#800000" : active ? "#fff" : "#ddd",
                        border: done || active ? "2px solid #800000" : "2px solid #ccc",
                      }}>
                        {done && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {active && <div className={styles.pulse} />}
                      </div>
                      {i < STATUS_STEPS.filter(s => s !== "cancelled").length - 1 && (
                        <div className={styles.connector} style={{ background: done ? "#800000" : "#e0e0e0" }} />
                      )}
                    </div>
                    <p className={styles.timelineLabel} style={{
                      color:      active ? "#800000" : done ? "#333" : "#bbb",
                      fontWeight: active || done ? 600 : 400,
                    }}>
                      {STATUS_LABELS[s]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}