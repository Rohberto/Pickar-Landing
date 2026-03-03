"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/CTA.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const leftBubbles = [
  { name: "Chidi O.",  tag: "Vendor · Lagos",  top: "18%", left: "-2%"  },
  { name: "Tunde F.", tag: "Rider · Lagos",    top: "65%", left: "8%"   },
];

const rightBubbles = [
  { name: "Amara N.", tag: "User · Abuja",     top: "14%", right: "-1%" },
  { name: "Ngozi E.", tag: "Business · PH",   top: "60%", right: "6%"  },
];

export default function CTA() {
  const sectionRef = useRef(null);
  const labelRef   = useRef(null);
  const titleRef   = useRef(null);
  const btnsRef    = useRef(null);
  const lRefs      = useRef([]);
  const rRefs      = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Label
      gsap.fromTo(labelRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );

      // Title
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power4.out", delay: 0.18,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );

      // Buttons
      gsap.fromTo(btnsRef.current,
        { y: 28, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.4)", delay: 0.36,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );

      // Left bubbles slide in from left
      gsap.fromTo(lRefs.current.filter(Boolean),
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, stagger: 0.18, ease: "power3.out", delay: 0.5,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );

      // Right bubbles slide in from right
      gsap.fromTo(rRefs.current.filter(Boolean),
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, stagger: 0.18, ease: "power3.out", delay: 0.5,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );

      // Continuous float — each bubble at a slightly different rate
      [...lRefs.current, ...rRefs.current].filter(Boolean).forEach((el, i) => {
        gsap.to(el, {
          y: -10 - (i % 3) * 2,
          duration: 2.6 + i * 0.4,
          repeat: -1, yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── LEFT FLOATING BUBBLES ── */}
      <div className={styles.bubblesLeft} aria-hidden="true">
        {leftBubbles.map((b, i) => (
          <div
            key={i}
            ref={el => lRefs.current[i] = el}
            className={styles.bubble}
            style={{ top: b.top, left: b.left, right: b.right }}
          >
            {/*
              Avatar images: /public/images/avatar-l1.png, avatar-l2.png
              Falls back to initial letter if image missing
            */}
            <div className={styles.bubbleAvatar}>
              <img
                src={"/images/avatar-l" + (i + 1) + ".png"}
                alt=""
                className={styles.bubbleImg}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className={styles.bubbleInfo}>
              <p className={styles.bubbleName}>{b.name}</p>
              <p className={styles.bubbleTag}>{b.tag}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CENTRE CONTENT ── */}
      <div className={styles.content}>
        <p ref={labelRef} className={styles.label}>Download the app</p>

        <h2 ref={titleRef} className={styles.title}>
          <span className={styles.red}>Get the app —</span>{" "}
          Download for Android and iOS
        </h2>

        <div ref={btnsRef} className={styles.buttons}>
          {/* Google Play */}
          <a href="#" className={styles.btn}>
            <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true">
              <path d="M0.39 0.197C0.147 0.457 0 0.863 0 1.39V20.61C0 21.137 0.147 21.543 0.39 21.803L0.458 21.871L10.794 11.535V11.465L0.458 1.129L0.39 0.197Z"/>
              <path d="M14.327 15.069L10.794 11.535V11.465L14.327 7.931L14.412 7.979L18.634 10.293C19.823 10.961 19.823 12.039 18.634 12.707L14.412 15.021L14.327 15.069Z"/>
              <path d="M14.412 15.021L10.794 11.403L0.39 21.803C0.786 22.22 1.432 22.272 2.163 21.865L14.412 15.021Z"/>
              <path d="M14.412 7.979L2.163 1.135C1.432 0.728 0.786 0.78 0.39 1.197L10.794 11.597L14.412 7.979Z"/>
            </svg>
            <div className={styles.btnText}>
              <small>Get it on</small>
              <strong>Google Play</strong>
            </div>
          </a>

          {/* App Store */}
          <a href="#" className={styles.btn}>
            <svg width="19" height="23" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.1 190.5-49.1zm-5.2-168.8c35.9-43.5 61.5-104.4 61.5-165.3 0-8.4-.6-16.9-2-24.7-58.5 2.2-127.9 39.1-170.1 87.5-32.1 36.5-61.5 97.4-61.5 159.1 0 9.1 1.4 18.1 2 20.7 3.5.6 9.1 1.3 14.6 1.3 52.7 0 116.5-35.3 155.5-78.6z"/>
            </svg>
            <div className={styles.btnText}>
              <small>Download on the</small>
              <strong>App Store</strong>
            </div>
          </a>
        </div>
      </div>

      {/* ── RIGHT FLOATING BUBBLES ── */}
      <div className={styles.bubblesRight} aria-hidden="true">
        {rightBubbles.map((b, i) => (
          <div
            key={i}
            ref={el => rRefs.current[i] = el}
            className={styles.bubble}
            style={{ top: b.top, left: b.left, right: b.right }}
          >
            <div className={styles.bubbleAvatar}>
              <img
                src={"/images/avatar-r" + (i + 1) + ".png"}
                alt=""
                className={styles.bubbleImg}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className={styles.bubbleInfo}>
              <p className={styles.bubbleName}>{b.name}</p>
              <p className={styles.bubbleTag}>{b.tag}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}