import React from "react";
import "../css/index.css";
import "../css/NavBar.css";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RedirectProps {
  children: React.ReactNode;
}

/**
 *
 * @param param0
 * @returns Redirect the user if he is not connected - Need to be used on private pages
 */
function NotLoggedRedirect({ children }: RedirectProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  } else if (!user) {
    return <Navigate to="/publique-page" replace />;
  } else if (user) {
    return <>{children}</>;
  }
}

export default NotLoggedRedirect;
