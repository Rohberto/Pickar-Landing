"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/Testimonials.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    name: "Chidi Okonkwo",
    role: "Vendor · Lagos",
    text: "Pickar has completely changed how I run my business. My customers get their orders the same day and I can track every rider live. No more calls asking where their package is.",
  },
  {
    name: "Amara Nwosu",
    role: "Regular User · Abuja",
    text: "I've tried other delivery apps but nothing comes close. Pickar riders always show up fast, the app is super clean, and the pricing is fair. I use it every week without fail.",
  },
  {
    name: "Tunde Fashola",
    role: "Rider · Lagos",
    text: "As a rider on Pickar, I earn more than I ever expected. The platform is transparent, support actually responds, and I always know my earnings in real time.",
  },
  {
    name: "Ngozi Eze",
    role: "Business Owner · Port Harcourt",
    text: "Running a small boutique means every delivery matters. Pickar has never let me down — packages arrive on time and my customers keep coming back.",
  },
];

const TOTAL = testimonials.length;

export default function Testimonials() {
  const sectionRef  = useRef(null);
  const leftRef     = useRef(null);
  const rightRef    = useRef(null);
  const trackRef    = useRef(null);
  const cardsRef    = useRef([]);
  const dotsRef     = useRef([]);
  const isAnimating = useRef(false);
  const currentRef  = useRef(0); // keep in sync with state for goTo closure

  const [current,  setCurrent]  = useState(0);
  const [visible,  setVisible]  = useState(2); // 2 on desktop, 1 on mobile
  const [rendered, setRendered] = useState(false); // avoid SSR mismatch

  const maxIdx = TOTAL - visible;

  /* ── Set visible count + mark rendered (client only) ── */
  useEffect(() => {
    const update = () => {
      const v = window.innerWidth < 640 ? 1 : 2;
      setVisible(v);
    };
    update();
    setRendered(true);
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    gsap.set(trackRef.current, { x: 0 });
    setCurrent(0);
    currentRef.current = 0;
  }, [visible]);

  /* ── Entrance animations on scroll ── */
  useEffect(() => {
    if (!rendered) return;
    const ctx = gsap.context(() => {

      // Left panel — slides in from left
      gsap.fromTo(leftRef.current,
        { x: -70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );

      // Right slider — slides in from right, slightly delayed
      gsap.fromTo(rightRef.current,
        { x: 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.18,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );

      // Cards stagger up one by one
      gsap.fromTo(cardsRef.current.filter(Boolean),
        { y: 50, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.65, stagger: 0.12, ease: "power3.out", delay: 0.45,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, [rendered]);

  /* ── Stop touch events on the viewport from triggering page scroll ── */
  useEffect(() => {
    const viewport = trackRef.current?.parentElement;
    if (!viewport) return;
    const stopProp = (e) => e.stopPropagation();
    viewport.addEventListener("touchstart", stopProp, { passive: true });
    viewport.addEventListener("touchmove",  stopProp, { passive: true });
    return () => {
      viewport.removeEventListener("touchstart", stopProp);
      viewport.removeEventListener("touchmove",  stopProp);
    };
  }, [rendered]);

  /* ── Navigate to a specific index ── */
  const goTo = (nextIdx, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isAnimating.current) return;
    const clamped = Math.min(Math.max(nextIdx, 0), TOTAL - visible);
    if (clamped === currentRef.current) return;

    isAnimating.current = true;

    // Use actual pixel width of the viewport so we slide exactly
    // one card at a time regardless of track percentage width
    const viewportEl = trackRef.current?.parentElement;
    const cardPx = viewportEl ? viewportEl.offsetWidth / visible : 0;

    gsap.to(trackRef.current, {
      x: -(cardPx * clamped),
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        setCurrent(clamped);
        currentRef.current = clamped;
        isAnimating.current = false;
      },
    });

    // Animate dots
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      gsap.to(dot, {
        width: i === clamped ? 24 : 8,
        opacity: i === clamped ? 1 : 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  };

  const canPrev = current > 0;
  const canNext = current < maxIdx;

  // Card width as % of track — track = TOTAL cards wide
  const cardWidthPct = 100 / TOTAL;

  return (
    <section ref={sectionRef} id="testimonials" className={styles.section}>
      <div className={styles.container}>

        {/* ══════ LEFT ══════ */}
        <div ref={leftRef} className={styles.left}>
          <div className={styles.avatarWrap}>
            {/*
              Avatar image: /public/images/testimonial-avatar.png
              Square PNG recommended, min 200×200px
            */}
            <img
              src="/images/testimonial-avatar.jpg"
              alt="Verified Pickar user"
              className={styles.avatar}
              onError={(e) => { e.currentTarget.style.opacity = "0.15"; }}
            />
            <div className={styles.badge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <div className={styles.leftText}>
            <p className={styles.leftLabel}>Verified profile</p>
            <h2 className={styles.leftTitle}>
              Your account<br/>with a{" "}
              <span className={styles.accent}>seal of trust</span>
            </h2>
            <p className={styles.leftDesc}>
              Every Pickar user and rider is verified. Your identity,
              your deliveries, and your money are always protected.
            </p>
          </div>
        </div>

        {/* ══════ RIGHT ══════ */}
        <div ref={rightRef} className={styles.right}>

          {/* Top row: icon+title LEFT | arrows RIGHT */}
          <div className={styles.rightHead}>
            <div className={styles.headLeft}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#8B1A1A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3 className={styles.rightTitle}>What our users are saying</h3>
            </div>

            {/* ── NAV ARROWS — always visible on every screen size ── */}
            <div className={styles.navBtns}>
              <button
                className={`${styles.navBtn} ${!canPrev ? styles.navDisabled : ""}`}
                onClick={(e) => goTo(current - 1, e)}
                aria-label="Previous testimonial"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
              </button>
              <button
                className={`${styles.navBtn} ${!canNext ? styles.navDisabled : ""}`}
                onClick={(e) => goTo(current + 1, e)}
                aria-label="Next testimonial"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── SLIDER ── */}
          <div className={styles.viewport}>
            {/* Track width = TOTAL cards × (viewport / visible) */}
            <div
              ref={trackRef}
              className={styles.track}
              style={{ width: rendered ? `${(TOTAL / visible) * 100}%` : `${TOTAL * 50}%` }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  ref={el => cardsRef.current[i] = el}
                  className={styles.card}
                  style={{ width: `${cardWidthPct}%` }}
                >
                  <div className={styles.cardBox}>
                    <p className={styles.cardText}>"{t.text}"</p>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardAvatar}>{t.name.charAt(0)}</div>
                      <div>
                        <p className={styles.cardName}>{t.name}</p>
                        <p className={styles.cardRole}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DOTS ── */}
          <div className={styles.dots}>
            {rendered && Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <button
                key={i}
                ref={el => dotsRef.current[i] = el}
                className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                onClick={(e) => goTo(i, e)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}