import { useEffect, useState } from "react";
import { SIDEBAR_STORAGE_KEY as STORAGE_KEY } from "@/context/settings-context";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // Settings can change the default while the sidebar is mounted.
  useEffect(() => {
    const sync = () => setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    window.addEventListener("terrava-sidebar-change", sync);
    return () => window.removeEventListener("terrava-sidebar-change", sync);
  }, []);

  return { collapsed, toggleCollapsed: () => setCollapsed((prev) => !prev), setCollapsed };
}
