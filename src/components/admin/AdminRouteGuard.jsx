import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMe } from "../../lib/api/auth";

export default function AdminRouteGuard({ adminData, children }) {
  const [allowed, setAllowed] = useState(Boolean(adminData?.role === "ADMIN"));
  const [checking, setChecking] = useState(!adminData);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (adminData?.role === "ADMIN") {
        setAllowed(true);
        setChecking(false);
        return;
      }

      try {
        const res = await fetchMe();
        if (!mounted) return;
        setAllowed(res?.user?.role === "ADMIN");
      } catch {
        if (!mounted) return;
        setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    checkAdmin();
    return () => {
      mounted = false;
    };
  }, [adminData]);

  if (checking) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-300">Checking admin access...</div>;
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}