"use client";
import { useState } from "react";
import styles from "../styles/SignupForm.module.css";

const API = "https://theosophically-uncoaxal-gussie.ngrok-free.dev/api";

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function OTPInput({ value, onChange }) {
  const inputs = [];
  const digits = value.split("").concat(Array(4).fill("")).slice(0, 4);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      next[i] = "";
      onChange(next.join(""));
      if (i > 0 && inputs[i - 1]) inputs[i - 1].focus();
    } else if (/^\d$/.test(e.key)) {
      const next = [...digits];
      next[i] = e.key;
      onChange(next.join(""));
      if (i < 3 && inputs[i + 1]) inputs[i + 1].focus();
    }
  };

  return (
    <div className={styles.otpRow}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          className={styles.otpBox}
        />
      ))}
    </div>
  );
}

export default function LoginForm({ onSuccess, onSwitchToSignup }) {
  const [step,     setStep]     = useState("login");
  const [userType, setUserType] = useState("user");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const [otp,          setOtp]          = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [resendTimer,  setResendTimer]  = useState(0);
  const timerRef = { current: null };

  const startTimer = () => {
    setResendTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password)     { setError("Password is required"); return; }

    setLoading(true);
    try {
      const res = await fetch(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("pickar_user", JSON.stringify({
          fullName: data.data.user.fullName,
          email:    data.data.user.email,
        }));
        window.dispatchEvent(new Event("pickar_auth"));
        onSuccess();
      } else if (data.needsVerification) {
        startTimer();
        setStep("otp");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) { setOtpError("Please enter the 4-digit code"); return; }
    setLoading(true);
    setOtpError("");
    try {
      const res = await fetch(API + "/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("pickar_user", JSON.stringify({
          fullName: data.data.user.fullName,
          email:    data.data.user.email,
        }));
        window.dispatchEvent(new Event("pickar_auth"));
        onSuccess();
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await fetch(API + "/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startTimer();
    } catch {}
  };

  if (step === "otp") return (
    <div className={styles.formInner}>
      <div className={styles.otpIcon}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h2 className={styles.cardTitle}>Verify Your Email</h2>
      <p className={styles.cardSub}>
        Your account isn&apos;t verified yet. We sent a 4-digit code to
        <br />
        <strong>{email}</strong>
      </p>

      <OTPInput value={otp} onChange={setOtp} />

      {otpError && <p className={styles.errMsg} style={{ textAlign: "center", marginTop: 8 }}>{otpError}</p>}

      <button className={styles.submitBtn} disabled={loading || otp.length < 4} onClick={handleVerify}>
        {loading ? <span className={styles.spinner} /> : "Verify & Sign In"}
      </button>

      <p className={styles.resendRow}>
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          className={styles.loginLink + (resendTimer > 0 ? " " + styles.resendDisabled : "")}
          onClick={handleResend}
          disabled={resendTimer > 0}
        >
          {resendTimer > 0 ? "Resend in " + resendTimer + "s" : "Resend"}
        </button>
      </p>

      <p className={styles.loginRow}>
        <button type="button" className={styles.loginLink} onClick={() => setStep("login")}>
          Back to Sign In
        </button>
      </p>
    </div>
  );

  return (
    <div className={styles.formInner}>
      <p className={styles.cardSub}>Welcome back — sign in to your account</p>

      {error && <div className={styles.apiError}>{error}</div>}

      <div className={styles.userTypeTabs}>
        <button
          type="button"
          className={styles.userTypeTab + (userType === "user" ? " " + styles.userTypeTabActive : "")}
          onClick={() => setUserType("user")}
        >
          User
        </button>
        <button
          type="button"
          className={styles.userTypeTab + (userType === "driver" ? " " + styles.userTypeTabActive : "")}
          onClick={() => setUserType("driver")}
        >
          Driver
        </button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          className={styles.input}
        />
      </div>

      <div className={styles.field} style={{ marginBottom: 20 }}>
        <label className={styles.label}>Password</label>
        <div className={styles.passwordWrap}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className={styles.input}
          />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)} tabIndex={-1}>
            {showPass ? <EyeOpen /> : <EyeClosed />}
          </button>
        </div>
      </div>

      <button className={styles.submitBtn} disabled={loading} onClick={handleLogin}>
        {loading ? <span className={styles.spinner} /> : "Sign In"}
      </button>

      <p className={styles.loginRow}>
        Don&apos;t have an account?{" "}
        <button type="button" className={styles.loginLink} onClick={onSwitchToSignup}>
          Create one
        </button>
      </p>

      <p className={styles.terms}>
        By signing in, you agree to our{" "}
        <a href="/terms" className={styles.termsLink}>Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" className={styles.termsLink}>Privacy Policy</a>
      </p>
    </div>
  );
}