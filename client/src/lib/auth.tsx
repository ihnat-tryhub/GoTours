import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  login as loginRequest,
  logout as logoutRequest,
  setStoredToken,
  signup as signupRequest,
  updateCurrentUserPhoto,
  updateCurrentUser,
} from './api';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: { name: string; email: string }) => Promise<void>;
  updateAvatar: (photo: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch {
        clearStoredToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    setStoredToken(response.token);
    setUser(response.data.user);
  }, []);

  const signup = useCallback(
    async (input: { name: string; email: string; password: string; passwordConfirm: string }) => {
      const response = await signupRequest(input);
      setStoredToken(response.token);
      setUser(response.data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (input: { name: string; email: string }) => {
    const updatedUser = await updateCurrentUser(input);
    setUser(updatedUser);
  }, []);

  const updateAvatar = useCallback(async (photo: File) => {
    const updatedUser = await updateCurrentUserPhoto(photo);
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      updateAvatar,
    }),
    [isLoading, login, logout, signup, updateAvatar, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
