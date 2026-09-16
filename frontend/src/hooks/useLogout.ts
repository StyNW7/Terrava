import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

/** Ends the session, confirms with a toast, and returns the visitor to the login page. */
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    logout();
    toast.success("Anda telah keluar dari Terrava.");
    navigate("/login", { replace: true });
  }, [logout, navigate]);
}
