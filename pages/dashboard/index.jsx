import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pickar_user");
      if (!raw) { router.replace("/"); return; }
      const user = JSON.parse(raw);
      if (user.userType === "driver") {
        router.replace("/dashboard/driver");
      } else {
        router.replace("/dashboard/user");
      }
    } catch {
      router.replace("/");
    }
  }, []);

  return null;
}