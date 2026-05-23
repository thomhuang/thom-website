import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AuthUser,
  GetCurrentUserAsync,
  LoginAsync,
  LoginRequest,
  LogoutAsync,
} from '../api/Auth/AuthRouter';

type AuthContextValue = {
  authUser: AuthUser | null;
  authError: string;
  isAdmin: boolean;
  isAuthLoading: boolean;
  isAuthSubmitting: boolean;
  clearAuthError: () => void;
  login: (request: LoginRequest) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getAuthenticatedUser = (user: AuthUser) =>
  user.authenticated ? user : null;

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const currentUser = await GetCurrentUserAsync();

        if (isMounted) {
          setAuthUser(getAuthenticatedUser(currentUser));
        }
      } catch {
        if (isMounted) {
          setAuthUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError('');
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      const user = await LoginAsync(request);
      setAuthUser(getAuthenticatedUser(user));

      return user.authenticated;
    } catch {
      setAuthError('Sign in failed.');
      return false;
    } finally {
      setIsAuthSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      await LogoutAsync();
      setAuthUser(null);

      return true;
    } catch {
      setAuthError('Sign out failed.');
      return false;
    } finally {
      setIsAuthSubmitting(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      authError,
      isAdmin: Boolean(authUser?.authenticated),
      isAuthLoading,
      isAuthSubmitting,
      clearAuthError,
      login,
      logout,
    }),
    [
      authUser,
      authError,
      isAuthLoading,
      isAuthSubmitting,
      clearAuthError,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
