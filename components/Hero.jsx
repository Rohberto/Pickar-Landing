"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "../styles/Hero.module.css";
import SignupModal from "./SignupModal";

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

  const [modalOpen, setModalOpen] = useState(false);

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
    <>
      <section ref={sectionRef} className={styles.hero}>

        {/* Top-right decorative orb */}
        <div className={styles.topOrb} />


        {/* ── MAIN GRID ── */}
        <div className={styles.inner}>

          {/* LEFT: Text */}
          <div className={styles.left}>
            <h1 ref={headingRef} className={styles.heading}>
              <span className="heroLine">Pickar</span>
            </h1>

            <p ref={subRef} className={styles.sub}>
              Built for vendors, loved by everyone. Pickar handles your pickups
              and deliveries, fast, reliable, and always on time.
            </p>

            <div ref={btnsRef} className={styles.buttons}>

              {/* Primary CTA — opens signup modal */}
              <button
                className={styles.ctaBtn}
                onClick={() => setModalOpen(true)}
              >
                Get Started — It's Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              {/* Secondary ghost — scroll down */}
              <button
                className={styles.learnBtn}
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </button>

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

      {/* ── SIGNUP MODAL — rendered outside section so it overlays everything ── */}
      <SignupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}