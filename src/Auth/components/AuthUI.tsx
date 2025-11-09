import React from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthUIProps {
  enableGoogle?: boolean;
}

export const AuthUI: React.FC<AuthUIProps> = ({ enableGoogle = true }) => {
  const { loading, error, signInWithGoogle } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg mb-4">
              {error}
            </div>
          )}
          {enableGoogle && (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
};
