"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "../styles/Preloader.module.css";

export default function Preloader({ onComplete }) {
  const preloaderRef      = useRef(null);
  const logoRef           = useRef(null);
  const counterRef        = useRef(null);
  const counterNumberRef  = useRef(null);
  const taglineRef        = useRef(null);
  const barRef            = useRef(null);
  const linesRef          = useRef([]);
  const curtainTopRef     = useRef(null);
  const curtainBottomRef  = useRef(null);
  const circleRef         = useRef(null);

  useEffect(() => {
    // ── Lock scroll immediately so the page can't drift ──
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline();

    // Vertical lines sweep in
    tl.to(linesRef.current, {
      scaleY: 1,
      duration: 1.2,
      stagger: 0.08,
      ease: "power3.inOut",
    }, 0);

    // Logo clip-path reveal (left → right)
    tl.to(logoRef.current, {
      clipPath: "inset(0 0% 0 0)",
      duration: 1,
      ease: "power4.out",
    }, 0.3);

    // Tagline clip-path reveal
    tl.to(taglineRef.current, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.8,
      ease: "power3.out",
    }, 0.7);

    // Counter counts 0 → 100
    const counterObj = { val: 0 };
    tl.to(counterObj, {
      val: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterNumberRef.current) {
          counterNumberRef.current.textContent = Math.round(counterObj.val);
        }
      },
    }, 0.2);

    // Progress bar fills
    tl.to(barRef.current, {
      width: "100%",
      duration: 2.2,
      ease: "power2.inOut",
    }, 0.2);

    // Centre circle scales out and fades
    tl.to(circleRef.current, {
      scale: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
    }, 2.6);

    // Curtains split — top flies up, bottom flies down
    tl.to(curtainTopRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
    }, 2.5);

    tl.to(curtainBottomRef.current, {
      yPercent: 100,
      duration: 0.9,
      ease: "power4.inOut",
    }, 2.5);

    // Fade the whole preloader out, then unlock scroll
    tl.to(preloaderRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        // ── Unlock scroll & guarantee we're at the top ──
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        window.scrollTo(0, 0);

        if (preloaderRef.current) {
          preloaderRef.current.style.display = "none";
        }
        onComplete && onComplete();
      },
    }, 3.2);

    return () => {
      tl.kill();
      // Safety: always restore scroll if component unmounts early
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div ref={preloaderRef} className={styles.preloader}>

      {/* Background vertical lines */}
      <div className={styles.lines}>
        {[...Array(5)].map((_, i) => (
          <span key={i} ref={el => linesRef.current[i] = el} />
        ))}
      </div>

      {/* Expanding circle burst */}
      <div ref={circleRef} className={styles.circle} />

      {/* Centre content */}
      <div className={styles.content}>
        <p ref={taglineRef} className={styles.tagline}>DELIVER ANYTHING</p>
        <h1 ref={logoRef} className={styles.logo}>Pickar</h1>
      </div>

      {/* Bottom-right loading counter */}
      <div ref={counterRef} className={styles.counter}>
        <span ref={counterNumberRef} className={styles.counterNumber}>0</span>
        <p>Loading</p>
      </div>

      {/* Bottom progress bar */}
      <div className={styles.barTrack}>
        <div ref={barRef} className={styles.bar} />
      </div>

      {/* Split curtains */}
      <div ref={curtainTopRef} className={styles.curtainTop} />
      <div ref={curtainBottomRef} className={styles.curtainBottom} />

    </div>
  );
}