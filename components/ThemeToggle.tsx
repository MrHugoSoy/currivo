"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Re-apply on every route change (React can strip data-theme from <html> on navigation)
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    setDark(isDark);
    setMounted(true);
  }, [pathname]);

  function toggle() {
    const next = !dark;
    const theme = next ? "dark" : "light";
    setDark(next);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--paper)",
        border: "1px solid var(--border2)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 17,
        transition: "box-shadow .15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"; }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
