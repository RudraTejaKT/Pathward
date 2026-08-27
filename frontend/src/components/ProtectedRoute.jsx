import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SubscriptionPaywall from "./SubscriptionPaywall.jsx";

export default function ProtectedRoute({ children, requireSubscription = true, title, subtitle }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="container branch-detail__status">
        <p className="mono">Checking session &amp; subscription status…</p>
      </main>
    );
  }

  // Not logged in -> Show Paywall or redirect
  if (!user) {
    return <SubscriptionPaywall title={title || "Sign In & Subscribe to Access"} subtitle={subtitle} />;
  }

  // Logged in but not subscribed (and not instructor/admin)
  const isSubscribed = user.isPremium || user.role === "instructor" || user.role === "admin";
  if (requireSubscription && !isSubscribed) {
    return (
      <SubscriptionPaywall
        title={title || "Pathward Pro Subscription Required"}
        subtitle={subtitle || "This workspace, practice gym, and full syllabus suite is exclusive to Pro scholars. Upgrade below to unlock instant lifetime or annual access."}
      />
    );
  }

  return children;
}

