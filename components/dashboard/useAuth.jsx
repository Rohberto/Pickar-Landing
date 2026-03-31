import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const API = "https://theosophically-uncoaxal-gussie.ngrok-free.dev/api";

export function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
  return {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
}

export function useAuth() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
      return;
    }

    fetch(API + "/auth/me", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("pickar_user");
          router.replace("/");
          return;
        }

        const u = data.data.user;

        const fresh = {
          fullName:       u.fullName,
          email:          u.email,
          phone:          u.phone,
          userType:       u.userType,
          isVerified:     u.isVerified,
          isApproved:     u.isApproved,
          idDocument:     u.idDocument,
          proofOfAddress: u.proofOfAddress,
        };

        localStorage.setItem("pickar_user", JSON.stringify(fresh));
        setUser(fresh);
        setLoading(false);
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem("pickar_user");
          if (cached) setUser(JSON.parse(cached));
        } catch {}
        setLoading(false);
      });
  }, [router.isReady]);

  const logout = () => {
    fetch(API + "/auth/logout", { method: "POST", headers: authHeaders() }).catch(() => {});
    localStorage.removeItem("authToken");
    localStorage.removeItem("pickar_user");
    router.replace("/");
  };

  return { user, loading, logout };
}