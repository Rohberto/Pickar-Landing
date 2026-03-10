"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "../styles/SignupModal.module.css";
import SignupForm from "./SignupForm";

export default function SignupModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // GSAP open / close animation
  useEffect(() => {
    if (!overlayRef.current || !cardRef.current) return;

    if (isOpen) {
      // Make visible first, then animate
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: "power2.out" }
      );
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 32, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" }
      );
    } else {
      gsap.to(cardRef.current,
        { opacity: 0, y: 20, scale: 0.97, duration: 0.22, ease: "power2.in" }
      );
      gsap.to(overlayRef.current,
        { opacity: 0, duration: 0.25, ease: "power2.in",
          onComplete: () => gsap.set(overlayRef.current, { display: "none" }) }
      );
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: "none" }}  /* GSAP controls visibility */
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign up"
    >
      {/* Close button */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Card */}
      <div ref={cardRef} className={styles.card}>
        <SignupForm onSuccess={onClose} />
      </div>
    </div>
  );
}