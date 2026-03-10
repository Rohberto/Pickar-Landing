"use client";
import { useState, useRef } from "react";
import styles from "../styles/SignupForm.module.css";

const API = "https://theosophically-uncoaxal-gussie.ngrok-free.dev/api";

const UserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const DriverIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12l2 2 4-4"/>
    <path d="M12 6v2M12 16v2M6 12h2M16 12h2"/>
  </svg>
);

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

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

function PasswordField({ label, placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.passwordWrap}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input + (error ? " " + styles.inputErr : "")}
        />
        <button type="button" className={styles.eyeBtn} onClick={() => setShow(s => !s)} tabIndex={-1}>
          {show ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
      {error && <p className={styles.errMsg}>{error}</p>}
    </div>
  );
}

function TextField({ label, type, placeholder, value, onChange, error }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.input + (error ? " " + styles.inputErr : "")}
      />
      {error && <p className={styles.errMsg}>{error}</p>}
    </div>
  );
}

function PhoneField({ value, onChange, error }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>Phone Number</label>
      <div className={styles.phoneWrap}>
        <span className={styles.phonePrefix}>+234</span>
        <input
          type="tel"
          placeholder="080 000 0000"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={styles.input + " " + styles.phoneInput + (error ? " " + styles.inputErr : "")}
        />
      </div>
      {error && <p className={styles.errMsg}>{error}</p>}
    </div>
  );
}

function FileField({ label, value, onChange, error }) {
  const inputRef = useRef(null);
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={styles.uploadBtn + (value ? " " + styles.uploadDone : "")}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        {value ? <CheckIcon /> : <UploadIcon />}
        <span>{value ? value.name : "Upload " + label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: "none" }}
        onChange={e => onChange(e.target.files ? e.target.files[0] : null)}
      />
      {error && <p className={styles.errMsg}>{error}</p>}
    </div>
  );
}

function OTPInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(4).fill("")).slice(0, 4);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      next[i] = "";
      onChange(next.join(""));
      if (i > 0) inputs.current[i - 1] && inputs.current[i - 1].focus();
    } else if (/^\d$/.test(e.key)) {
      const next = [...digits];
      next[i] = e.key;
      onChange(next.join(""));
      if (i < 3) inputs.current[i + 1] && inputs.current[i + 1].focus();
    }
  };

  return (
    <div className={styles.otpRow}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
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

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedEmail, setSavedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idDocument: null,
    proofOfAddress: null,
  });

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setVal = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email is invalid";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (userType === "driver") {
      if (!form.idDocument) e.idDocument = "ID document is required";
      if (!form.proofOfAddress) e.proofOfAddress = "Proof of address is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let response;
      if (userType === "driver") {
        const fd = new FormData();
        fd.append("fullName", form.fullName);
        fd.append("email", form.email);
        fd.append("phone", "+234" + form.phone);
        fd.append("password", form.password);
        fd.append("userType", "driver");
        if (form.idDocument) fd.append("idDocument", form.idDocument);
        if (form.proofOfAddress) fd.append("proofOfAddress", form.proofOfAddress);
        const res = await fetch(API + "/auth/signup", { method: "POST", body: fd });
        response = await res.json();
      } else {
        const res = await fetch(API + "/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: "+234" + form.phone,
            password: form.password,
            userType: "user",
          }),
        });
        response = await res.json();
      }
      if (response.success) {
        setSavedEmail(form.email);
        startTimer();
        setStep(3);
      } else {
        setErrors({ _api: response.message || "Registration failed" });
      }
    } catch (err) {
      setErrors({ _api: "Network error. Please check your connection." });
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
        body: JSON.stringify({ email: savedEmail, otp }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data && data.data.token) localStorage.setItem("authToken", data.data.token);
        const userData = { fullName: form.fullName, email: form.email };
        localStorage.setItem("pickar_user", JSON.stringify(userData));
        window.dispatchEvent(new Event("pickar_auth"));
        setStep(4);
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
        body: JSON.stringify({ email: savedEmail }),
      });
      startTimer();
    } catch {}
  };

  const handleLogin = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "pickar://auth/login";
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.location.href = "/login";
    }, 1500);
  };

  if (step === 1) return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>How do you want to register?</h2>

      <div className={styles.typeGrid}>
        <button
          type="button"
          className={styles.typeCard + (userType === "user" ? " " + styles.typeActive : "")}
          onClick={() => setUserType("user")}
        >
          <div className={styles.typeIcon + (userType === "user" ? " " + styles.typeIconActive : "")}>
            <UserIcon />
          </div>
          <div className={styles.typeText}>
            <strong>User</strong>
            <span>Individual account for personal use</span>
          </div>
          <div className={styles.typeRadio}>
            {userType === "user" && <div className={styles.typeRadioDot} />}
          </div>
        </button>

        <button
          type="button"
          className={styles.typeCard + (userType === "driver" ? " " + styles.typeActive : "")}
          onClick={() => setUserType("driver")}
        >
          <div className={styles.typeIcon + (userType === "driver" ? " " + styles.typeIconActive : "")}>
            <DriverIcon />
          </div>
          <div className={styles.typeText}>
            <strong>Driver</strong>
            <span>Deliver a package and earn money</span>
          </div>
          <div className={styles.typeRadio}>
            {userType === "driver" && <div className={styles.typeRadioDot} />}
          </div>
        </button>
      </div>

      <button className={styles.submitBtn} disabled={!userType} onClick={() => userType && setStep(2)}>
        Register
      </button>

      <p className={styles.terms}>
        By creating an account, you understand and agree to our{" "}
        <a href="/terms" className={styles.termsLink}>Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" className={styles.termsLink}>Privacy Policy</a>
      </p>
    </div>
  );

  if (step === 2) return (
    <div className={styles.card}>
      <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
        <BackIcon />
      </button>

      <h2 className={styles.cardTitle}>Register Your Account</h2>
      <p className={styles.cardSub}>Fill in your details below to get started</p>

      {errors._api && <div className={styles.apiError}>{errors._api}</div>}

      <div className={styles.formScroll}>
        <TextField label="Full Name" placeholder="John Wilson" value={form.fullName} onChange={setField("fullName")} error={errors.fullName} />
        <TextField label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={setField("email")} error={errors.email} />
        <PhoneField value={form.phone} onChange={setVal("phone")} error={errors.phone} />
        <PasswordField label="Password" placeholder="Min. 8 characters" value={form.password} onChange={setField("password")} error={errors.password} />
        <PasswordField label="Confirm Password" placeholder="Repeat password" value={form.confirmPassword} onChange={setField("confirmPassword")} error={errors.confirmPassword} />
        {userType === "driver" && (
          <div>
            <FileField label="ID Document" value={form.idDocument} onChange={setVal("idDocument")} error={errors.idDocument} />
            <FileField label="Proof of Address" value={form.proofOfAddress} onChange={setVal("proofOfAddress")} error={errors.proofOfAddress} />
          </div>
        )}
      </div>

      <button className={styles.submitBtn} disabled={loading} onClick={handleSignup}>
        {loading ? <span className={styles.spinner} /> : "Create Account"}
      </button>

      <p className={styles.terms}>
        By creating an account, you understand and agree to our{" "}
        <a href="/terms" className={styles.termsLink}>Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" className={styles.termsLink}>Privacy Policy</a>
      </p>
    </div>
  );

  if (step === 3) return (
    <div className={styles.card}>
      <button type="button" className={styles.backBtn} onClick={() => setStep(2)}>
        <BackIcon />
      </button>

      <div className={styles.otpIcon}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h2 className={styles.cardTitle}>Verify Your Email</h2>
      <p className={styles.cardSub}>
        We sent a 4-digit code to
        <br />
        <strong>{savedEmail}</strong>
      </p>

      <OTPInput value={otp} onChange={setOtp} />

      {otpError && <p className={styles.errMsg} style={{ textAlign: "center", marginTop: 8 }}>{otpError}</p>}

      <button className={styles.submitBtn} disabled={loading || otp.length < 4} onClick={handleVerify}>
        {loading ? <span className={styles.spinner} /> : "Verify & Continue"}
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
    </div>
  );

  return (
    <div className={styles.card}>
      <div className={styles.successWrap}>
        <div className={styles.successIcon}>
          <CheckIcon />
        </div>
        <h2 className={styles.cardTitle}>You&apos;re all set!</h2>
        <p className={styles.cardSub}>
          Your account has been created.
          <br />
          Download the app to get started.
        </p>
        <div className={styles.appBtns}>
          <a href="#" className={styles.appBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.3.17.65.19.96.08L13.68 12 3.01.14C2.7.03 2.35.06 2.06.24 1.48.6 1.16 1.24 1.16 2v20c0 .76.32 1.4.9 1.76z" fill="#4285F4"/>
              <path d="M16.34 9.53l2.27-2.27-10.7-6.28L16.34 9.53z" fill="#EA4335"/>
              <path d="M20.08 10.49L17.9 9.25l-2.27 2.27 2.27 2.27 2.21-1.29c.64-.38.64-1.28-.03-1.01z" fill="#FBBC05"/>
              <path d="M16.34 14.47l-8.43 8.55 10.7-6.28-2.27-2.27z" fill="#34A853"/>
            </svg>
            Google Play
          </a>
          <a href="#" className={styles.appBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store
          </a>
        </div>
      </div>
    </div>
  );
}