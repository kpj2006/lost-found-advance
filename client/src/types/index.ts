export interface AuthUser {
  id: string;
  email: string;
}

export interface AppContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
}
