"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/Howitworks.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    /*
      Icon: drop your image at /public/images/icon-download.png (or .svg)
      Recommended size: 48×48px, transparent background
    */
    icon: "/images/icon3.svg",
    iconAlt: "Download icon",
    title: "Download the App",
    desc: "Get started in seconds. Download Pickar from the App Store or Google Play — it's free and takes less than a minute to set up.",
  },
  {
    icon: "/images/icon2.svg",
    iconAlt: "Create account icon",
    title: "Create an Account",
    desc: "Sign up with your phone number or email. Verify your details and you're ready to start sending or receiving deliveries right away.",
  },
  {
    icon: "/images/icon.svg",
    iconAlt: "Deliver packages icon",
    title: "Send / Deliver Packages",
    desc: "Place an order, assign a nearby rider, and track your package live. Fast, reliable, and transparent — from pickup to drop-off.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const lineRef    = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Header slides up
      gsap.fromTo(headRef.current,
        { y: 45, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" }
        }
      );

      // Divider line draws from left to right
      gsap.fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.2, ease: "power3.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" }
        }
      );

      // Cards stagger up
      gsap.fromTo(cardsRef.current.filter(Boolean),
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.75, stagger: 0.14, ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" }
        }
      );

      // Hover lift on each card
      cardsRef.current.filter(Boolean).forEach(card => {
        card.addEventListener("mouseenter", () =>
          gsap.to(card, { y: -8, scale: 1.02, duration: 0.3, ease: "power2.out" })
        );
        card.addEventListener("mouseleave", () =>
          gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.inOut" })
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how" className={styles.section}>
      <div className={styles.container}>

        {/* ── HEADER — label + title left, divider line right ── */}
        <div ref={headRef} className={styles.head}>
          <div className={styles.headLeft}>
            <p className={styles.label}>
              For you or <strong>for your business</strong>
            </p>
            <h2 className={styles.title}>How it works</h2>
          </div>
          <div ref={lineRef} className={styles.line} />
        </div>

        {/* ── CARDS ── */}
        <div className={styles.grid}>
          {steps.map((step, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className={styles.card}
            >
              {/* Icon image — replace src path with your actual file */}
              <div className={styles.iconWrap}>
                <img
                  src={step.icon}
                  alt={step.iconAlt}
                  className={styles.icon}
                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                />
              </div>

              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}