"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const rutasPublicas = ["/login"];

    if (rutasPublicas.includes(pathname)) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("TOKEN EN AUTHGUARD:", token);

    if (!token) {
      router.replace("/login");
      return;
    }

    // 🔥 NO comprobamos backend (ese era el problema)
    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  return children;
}