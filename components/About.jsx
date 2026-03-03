"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/About.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "Instant Pickup, Every Time",
    desc: "The moment you place an order, a nearby rider is dispatched. No delays, no excuses — your goods are moving within minutes of booking.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: "Live Tracking on Every Delivery",
    desc: "Follow your rider on the map in real time. Know exactly where your package is, how far away the rider is, and when it arrives.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Trusted & Verified Riders",
    desc: "Every Pickar rider goes through identity verification before joining the platform. Your deliveries are in safe, accountable hands.",
  },
];

export default function About() {
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const phone1Ref   = useRef(null);
  const phone2Ref   = useRef(null);
  const featuresRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Header reveal
      gsap.fromTo(headerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%" }
        }
      );

      // Phone 1 (back) — slides in from left
      gsap.fromTo(phone1Ref.current,
        { x: -80, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.1, ease: "power4.out",
          scrollTrigger: { trigger: phone1Ref.current, start: "top 82%" }
        }
      );

      // Phone 2 (front) — slightly delayed, comes from lower-left
      gsap.fromTo(phone2Ref.current,
        { x: -50, y: 30, opacity: 0 },
        {
          x: 0, y: 0, opacity: 1, duration: 1.1, ease: "power4.out",
          scrollTrigger: { trigger: phone1Ref.current, start: "top 82%" },
          delay: 0.18,
        }
      );

      // Feature cards stagger from right
      gsap.fromTo(featuresRef.current.filter(Boolean),
        { x: 50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, stagger: 0.14, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" }
        }
      );

      // Subtle independent float on each phone
      gsap.to(phone1Ref.current, {
        y: -12, duration: 4.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3,
      });
      gsap.to(phone2Ref.current, {
        y: -8, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className={styles.about}>
      <div className={styles.container}>

        {/* ── HEADER ── */}
        <div ref={headerRef} className={styles.header}>
          <p className={styles.label}>What We Offer</p>
          <h2 className={styles.title}>About Pickar</h2>
          <p className={styles.desc}>
            Pickar is a fast, on-demand delivery platform built for vendors, businesses,
            and everyday people. Whether you're shipping products to your customers or
            sending a parcel across town — we handle the pickup, the ride, and the drop-off,
            so you never have to worry about the last mile.
          </p>
        </div>

        {/* ── MAIN GRID ── */}
        <div className={styles.grid}>

          {/* ── LEFT: Two overlapping phone images ── */}
          <div className={styles.phoneWrap}>
            <div className={styles.phoneGlow} />

            {/*
              ═══════════════════════════════════════════
              ADD YOUR IMAGES:
                /public/images/about-back.png   ← back phone (left, behind)
                /public/images/about-front.png  ← front phone (right, on top)
              Use PNGs with transparent backgrounds.
              ═══════════════════════════════════════════
            */}

            {/* Back phone — left side, slightly lower */}
            <img
              ref={phone1Ref}
              src="/images/about-front.png"
              alt="Pickar app dashboard"
              className={`${styles.phoneImg} ${styles.phoneBack}`}
            />

            {/* Front phone — right side, slightly higher, overlaps back */}
            <img
              ref={phone2Ref}
              src="/images/about-back.png"
              alt="Pickar choose a ride"
              className={`${styles.phoneImg} ${styles.phoneFront}`}
            />
          </div>

          {/* ── RIGHT: Feature cards ── */}
          <div className={styles.features}>
            {features.map((f, i) => (
              <div
                key={i}
                ref={el => featuresRef.current[i] = el}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}