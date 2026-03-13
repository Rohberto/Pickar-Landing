"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "../styles/SignupModal.module.css";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";

export default function SignupModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);
  const [tab, setTab] = useState("signup");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!overlayRef.current || !cardRef.current) return;
    if (isOpen) {
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
      gsap.fromTo(cardRef.current, { opacity: 0, y: 32, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" });
    } else {
      gsap.to(cardRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.22, ease: "power2.in" });
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSuccess = () => onClose();

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: "none" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div ref={cardRef} className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={styles.tab + (tab === "signup" ? " " + styles.tabActive : "")}
            onClick={() => setTab("signup")}
          >
            Create Account
          </button>
          <button
            className={styles.tab + (tab === "login" ? " " + styles.tabActive : "")}
            onClick={() => setTab("login")}
          >
            Sign In
          </button>
        </div>

        {tab === "signup"
          ? <SignupForm onSuccess={handleSuccess} onSwitchToLogin={() => setTab("login")} />
          : <LoginForm  onSuccess={handleSuccess} onSwitchToSignup={() => setTab("signup")} />
        }
      </div>
    </div>
  );
}