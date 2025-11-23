import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/auth/utils/authService";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  user: "iso_tik_user",
  token: "iso_tik_token",
  expires: "iso_tik_token_expires_at",
};

const LEGACY_KEYS = {
  user: "user",
  token: "token",
};

const sanitizeValue = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "undefined" || trimmed === "null" ? null : value;
};

const isTokenExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const expiresDate = new Date(expiresAt);
  if (Number.isNaN(expiresDate.getTime())) {
    return false;
  }
  return expiresDate.getTime() <= Date.now();
};

const readPersistedAuth = () => {
  const storedUser = sanitizeValue(
    localStorage.getItem(STORAGE_KEYS.user) ||
      localStorage.getItem(LEGACY_KEYS.user)
  );
  const storedToken = sanitizeValue(
    localStorage.getItem(STORAGE_KEYS.token) ||
      localStorage.getItem(LEGACY_KEYS.token)
  );
  const storedExpires = sanitizeValue(
    localStorage.getItem(STORAGE_KEYS.expires)
  );

  return {
    storedUser,
    storedToken,
    storedExpires,
  };
};

const persistAuth = (user, token, expiresAt) => {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.token, token);
  if (expiresAt) {
    localStorage.setItem(STORAGE_KEYS.expires, expiresAt);
  } else {
    localStorage.removeItem(STORAGE_KEYS.expires);
  }
  // Clean legacy keys to avoid stale values.
  localStorage.removeItem(LEGACY_KEYS.user);
  localStorage.removeItem(LEGACY_KEYS.token);
};

const clearPersistedAuth = () => {
  [...Object.values(STORAGE_KEYS), ...Object.values(LEGACY_KEYS)].forEach(
    (key) => localStorage.removeItem(key)
  );
};

const getLatestStoredAuth = () => {
  const { storedToken, storedExpires } = readPersistedAuth();
  return {
    token: storedToken,
    expiresAt: storedExpires,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { storedUser, storedToken, storedExpires } = readPersistedAuth();
    if (storedUser && storedToken) {
      try {
        if (storedExpires && isTokenExpired(storedExpires)) {
          clearPersistedAuth();
        } else {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setTokenExpiresAt(storedExpires);
        }
      } catch (error) {
        console.error("Failed to parse stored user", error);
        clearPersistedAuth();
      }
    } else if (storedExpires && isTokenExpired(storedExpires)) {
      clearPersistedAuth();
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const authenticatedUser = response.user;
      const authToken = response.token;
      const expiresAt = response.expires_at;

      persistAuth(authenticatedUser, authToken, expiresAt);
      setUser(authenticatedUser);
      setToken(authToken);
      setTokenExpiresAt(expiresAt);

      return { success: true, user: authenticatedUser };
    } catch (error) {
      const fieldErrors = error?.data?.errors;
      const message =
        fieldErrors?.username?.[0] ||
        fieldErrors?.password?.[0] ||
        error?.data?.message ||
        error.message ||
        "Login gagal";

      return { success: false, error: message, fieldErrors };
    }
  };

  const logout = useCallback(async () => {
    const activeToken = token || getLatestStoredAuth().token;

    if (activeToken) {
      try {
        await authService.logout({ token: activeToken });
      } catch (error) {
        // If logout fails because the token is already invalid/revoked, we still clear local state.
        console.warn("Failed to logout from server", error);
      }
    }

    clearPersistedAuth();
    setUser(null);
    setToken(null);
    setTokenExpiresAt(null);
    // Navigation will be handled by the component calling logout
  }, [token]);

  useEffect(() => {
    if (!token || !tokenExpiresAt) return undefined;
    const expiresAtDate = new Date(tokenExpiresAt);
    if (Number.isNaN(expiresAtDate.getTime())) return undefined;

    const timeout = expiresAtDate.getTime() - Date.now();
    if (timeout <= 0) {
      logout();
      return undefined;
    }

    const timerId = setTimeout(() => {
      logout();
    }, timeout);

    return () => clearTimeout(timerId);
  }, [token, tokenExpiresAt, logout]);

  const updateUserInfo = (partialUser) => {
    if (!partialUser) return;
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const nextUser = { ...prevUser, ...partialUser };
      const effectiveToken = token || getLatestStoredAuth().token;
      const effectiveExpires = tokenExpiresAt || getLatestStoredAuth().expiresAt;
      if (effectiveToken) {
        persistAuth(nextUser, effectiveToken, effectiveExpires);
      }
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    tokenExpiresAt,
    loading,
    login,
    logout,
    updateUserInfo,
    isAuthenticated: Boolean(user && token && !isTokenExpired(tokenExpiresAt)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
