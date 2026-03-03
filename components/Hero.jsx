"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "../styles/Hero.module.css";

export default function Hero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const btnsRef    = useRef(null);
  const phone1Ref  = useRef(null); // Main — front, tallest
  const phone2Ref  = useRef(null); // Earnings — middle, slightly behind
  const phone3Ref  = useRef(null); // Map — far right, partially cropped
  const curveRef   = useRef(null);
  const navRef     = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 3.5 });

    // Fade section in
    tl.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }, 0
    );

    // Nav drops down
    tl.fromTo(navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.1
    );

    // Heading slides up from overflow-hidden parent
    const lines = headingRef.current.querySelectorAll(".heroLine");
    tl.fromTo(lines,
      { y: 130, opacity: 0, skewY: 3 },
      { y: 0, opacity: 1, skewY: 0, duration: 1.1, stagger: 0.08, ease: "power4.out" }, 0.2
    );

    // Subtitle
    tl.fromTo(subRef.current,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.5
    );

    // Buttons stagger in
    tl.fromTo(Array.from(btnsRef.current.children),
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: "power3.out" }, 0.65
    );

    // Phone 1 (main) — rises from below, front
    tl.fromTo(phone1Ref.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.3, ease: "power4.out" }, 0.3
    );

    // Phone 2 (earnings) — slightly delayed, from lower-right
    tl.fromTo(phone2Ref.current,
      { y: 120, x: 20, opacity: 0 },
      { y: 0, x: 0, opacity: 1, duration: 1.3, ease: "power4.out" }, 0.45
    );

    // Phone 3 (map) — last to arrive, furthest right
    tl.fromTo(phone3Ref.current,
      { y: 140, x: 40, opacity: 0 },
      { y: 0, x: 0, opacity: 1, duration: 1.3, ease: "power4.out" }, 0.6
    );

    // Curve fades up
    tl.fromTo(curveRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.2
    );

    // Arrow bounces forever
    gsap.to("#heroScrollArrow", {
      y: 7, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 5,
    });

    // Each phone floats at a different rate — creates parallax depth feel
    gsap.to(phone1Ref.current, {
      y: -16, duration: 4.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 5.0,
    });
    gsap.to(phone2Ref.current, {
      y: -11, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 5.4,
    });
    gsap.to(phone3Ref.current, {
      y: -8,  duration: 4.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 5.8,
    });
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>

      {/* Top-right decorative orb — matches the screenshot */}
      <div className={styles.topOrb} />

      {/* ── NAVBAR ── */}
  

      {/* ── MAIN GRID ── */}
      <div className={styles.inner}>

        {/* LEFT: Text */}
        <div className={styles.left}>
          <h1 ref={headingRef} className={styles.heading}>
            <span className="heroLine">Pickar</span>
          </h1>

          <p ref={subRef} className={styles.sub}>
            Built for vendors, loved by everyone. Pickar handles your pickups and deliveries, fast, reliable, and always on time.
          </p>

          <div ref={btnsRef} className={styles.buttons}>

            {/* Google Play — full 4-color icon */}
            <a href="#" className={styles.storeBtn} data-hover>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.18 23.76c.3.17.65.19.96.08L13.68 12 3.01.14C2.7.03 2.35.06 2.06.24 1.48.6 1.16 1.24 1.16 2v20c0 .76.32 1.4.9 1.76z" fill="#4285F4"/>
                <path d="M16.34 9.53l2.27-2.27-10.7-6.28L16.34 9.53z" fill="#EA4335"/>
                <path d="M20.08 10.49L17.9 9.25l-2.27 2.27 2.27 2.27 2.21-1.29c.64-.38.64-1.28-.03-1.01z" fill="#FBBC05"/>
                <path d="M16.34 14.47l-8.43 8.55 10.7-6.28-2.27-2.27z" fill="#34A853"/>
              </svg>
              <div className={styles.storeBtnText}>
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>

            {/* Apple App Store */}
            <a href="#" className={styles.storeBtn} data-hover>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className={styles.storeBtnText}>
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </a>

          </div>
        </div>

        {/* RIGHT: 3 Phones */}
        <div className={styles.phones}>

          {/*
          ╔═══════════════════════════════════════════════════╗
          ║  DROP YOUR IMAGES INTO /public/images/            ║
          ║                                                   ║
          ║  /public/images/main.png      ← Phone 1 (front)  ║
          ║  /public/images/earnings.png  ← Phone 2 (middle) ║
          ║  /public/images/map.png       ← Phone 3 (right)  ║
          ║                                                   ║
          ║  Use transparent-bg PNGs for best results.        ║
          ║  The positions, shadows & float are pre-wired.    ║
          ╚═══════════════════════════════════════════════════╝
          */}

          {/* Phone 1 — Main dashboard: leftmost, tallest, z-index on top */}
          <img
            ref={phone1Ref}
            src="/images/main.png"
            alt="Pickar app — main dashboard"
            className={`${styles.phoneImg} ${styles.phoneMain}`}
          />

          {/* Phone 2 — Earnings: overlaps main on right side, slightly behind */}
          <img
            ref={phone2Ref}
            src="/images/earnings.png"
            alt="Pickar app — earnings screen"
            className={`${styles.phoneImg} ${styles.phoneEarnings}`}
          />

          {/* Phone 3 — Map: furthest right, partially cropped by container edge */}
          <img
            ref={phone3Ref}
            src="/images/map.png"
            alt="Pickar app — map and tracking"
            className={`${styles.phoneImg} ${styles.phoneMap}`}
          />

        </div>
      </div>

      {/* ── CURVED BOTTOM + SCROLL ARROW ── */}
      <div ref={curveRef} className={styles.curveWrap}>
        <svg
          className={styles.curveSvg}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 C200,120 400,40 720,70 C1020,100 1240,120 1440,60 L1440,120 L0,120 Z"
            fill="#FDF8F5"
          />
        </svg>

        <button
          id="heroScrollArrow"
          className={styles.scrollArrow}
          aria-label="Scroll to next section"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </button>
      </div>

    </section>
  );
}