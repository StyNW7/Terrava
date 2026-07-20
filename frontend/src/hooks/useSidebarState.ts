import { useEffect, useState } from "react";

const STORAGE_KEY = "terrava-dashboard-sidebar-collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return { collapsed, toggleCollapsed: () => setCollapsed((prev) => !prev), setCollapsed };
}
