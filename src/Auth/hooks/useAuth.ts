import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { AuthContextType } from "../types";

/**
 * Hook to access Auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
