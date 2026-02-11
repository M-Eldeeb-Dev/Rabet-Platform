import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // Redirect based on role
        const routes = {
          entrepreneur: "/entrepreneur/dashboard",
          co_founder: "/cofounder/dashboard",
          event_manager: "/eventmanager/add-event",
          admin: "/admin/dashboard",
        };
        navigate(routes[profile.role] || "/", { replace: true });
      } else if (!user) {
        // If no user found after loading, redirect to login
        navigate("/login", { replace: true });
      }
      // If user exists but no profile yet, wait (loading might be false but profile fetching)
      // Actually useAuth handles profile fetching and keeps loading true usually
      // But if profile is null, maybe redirect to setup or stay loading?
      // For now, if user exists but no profile, we might be in the middle of creating it.
      // Let's just wait or redirect to home if it takes too long.
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-light dark:bg-bg-dark">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-text-secondary dark:text-gray-400">
        جاري تسجيل الدخول...
      </p>
    </div>
  );
};

export default AuthCallback;
