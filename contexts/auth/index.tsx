/* eslint-disable unicorn/no-null */
import {
  createContext,
  useContext,
  type FC,
} from "react";
import useAuth, { type AuthState } from "hooks/useAuth";

const AuthContext = createContext<AuthState | null>(null);

export type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
