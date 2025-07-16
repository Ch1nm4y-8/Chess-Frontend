import React, { ReactNode } from "react";
import { useUser } from "../contexts/userContext";
import { Navigate } from "react-router-dom";

const RedirectIfAuthenticated = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  console.log(user);

  if (user) return <Navigate to="/" replace />;

  return children;
};

export default RedirectIfAuthenticated;
