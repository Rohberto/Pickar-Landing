"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/KeyFeatures.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
  8 features laid out in staggered rows: 3 — 3 — 2
  Icon: drop your image at the src path below.
  Recommended: 20×20px SVG or PNG, transparent bg.
  The icon will be tinted red automatically via CSS filter.
*/
const features = [
  { text: "Easy and smooth user experience" },
  { text: "100% security for users and riders" },
  { text: "Reasonable service rates across the board" },
  { text: "24/7 support from our team" },
  { text: "Live tracking on every single delivery" },
  { text: "Verified riders for safe, trusted deliveries" },
  { text: "Fast and seamless in-app payments" },
  { text: "Works for individuals and businesses alike" },
];

export default function KeyFeatures() {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const itemsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Header fades up
      gsap.fromTo(headRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" }
        }
      );

      // Pills stagger in — each one pops up from slightly below
      gsap.fromTo(itemsRef.current.filter(Boolean),
        { opacity: 0, y: 24, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" }
        }
      );

      // Hover: subtle lift + border glow
      itemsRef.current.filter(Boolean).forEach(pill => {
        pill.addEventListener("mouseenter", () =>
          gsap.to(pill, { y: -4, scale: 1.03, duration: 0.25, ease: "power2.out" })
        );
        pill.addEventListener("mouseleave", () =>
          gsap.to(pill, { y: 0, scale: 1, duration: 0.25, ease: "power2.inOut" })
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className={styles.section}>

      {/* Large decorative background word */}
      <div className={styles.bgText} aria-hidden="true">FEATURES</div>

      <div className={styles.container}>

        {/* ── HEADER ── */}
        <div ref={headRef} className={styles.head}>
          <p className={styles.label}>Everything you need</p>
          <h2 className={styles.title}>Key Features</h2>
        </div>

        {/* ── FEATURE PILLS ── */}
        <div className={styles.pills}>
          {features.map((f, i) => (
            <div
              key={i}
              ref={el => itemsRef.current[i] = el}
              className={styles.pill}
            >
              {/*
                ── ICON ──────────────────────────────────
                Replace src with your actual icon path.
                e.g. src="/images/check.svg"
                Recommended: 18–22px, single-color SVG.
                CSS filter makes it match the red brand color.
                ──────────────────────────────────────────
              */}
              <img
                src="/images/check.png"
                alt=""
                aria-hidden="true"
                className={styles.pillIcon}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span className={styles.pillText}>{f.text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}