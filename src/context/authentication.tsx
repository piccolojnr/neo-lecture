// maintain the authentication state of the user
import { useAuth } from "../hooks/useAuth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Define the shape of the authentication state
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

// Create a context
const AuthContext = createContext<AuthState | undefined>(undefined);

// Create a provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  });

  useEffect(() => {
    auth.checkAuth().then(() => {
      setState({
        ...state,
        isAuthenticated: auth.isAuthenticated,
        isLoading: false,
        user: auth.user,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// Create a hook to consume the context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
