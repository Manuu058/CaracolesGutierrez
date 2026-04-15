"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { obtenerToken } from "../lib/auth";
import Navbar from "./Navbar";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = obtenerToken();

    if (!token && pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (token && pathname === "/login") {
      router.push("/");
      return;
    }

    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return <div className="screen-loading">Cargando...</div>;
  }

  if (pathname === "/login") {
    return children;
  }

  return (
    <>
      <Navbar />
      <main className="main-shell">{children}</main>
    </>
  );
}