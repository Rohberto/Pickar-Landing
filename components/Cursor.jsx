"use client";
import { useEffect, useRef } from "react";
import styles from "../styles/Cursor.module.css";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animateRing);
    };

    const handleMouseEnter = () => {
      ring.classList.add(styles.hover);
      dot.classList.add(styles.hover);
    };

    const handleMouseLeave = () => {
      ring.classList.remove(styles.hover);
      dot.classList.remove(styles.hover);
    };

    document.addEventListener("mousemove", moveCursor);
    raf = requestAnimationFrame(animateRing);

    const hoverEls = document.querySelectorAll("a, button, [data-hover]");
    hoverEls.forEach(el => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}