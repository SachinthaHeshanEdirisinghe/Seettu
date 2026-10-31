import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_SESSION_KEY } from '../constants';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

const readSession = () => {
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) || '';
  } catch {
    return '';
  }
};

const writeSession = (email) => {
  try {
    if (email) sessionStorage.setItem(AUTH_SESSION_KEY, email);
    else sessionStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * status:
 *  - 'loading' : checking a saved session (page refresh)
 *  - 'authed'  : user is signed in
 *  - 'guest'   : no session
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (readSession() ? 'loading' : 'guest'));

  useEffect(() => {
    const email = readSession();
    if (!email) return undefined;

    let cancelled = false;
    authApi
      .fetchMe(email)
      .then((me) => {
        if (cancelled) return;
        if (me) {
          setUser(me);
          setStatus('authed');
        } else {
          writeSession('');
          setStatus('guest');
        }
      })
      .catch(() => {
        if (cancelled) return;
        writeSession('');
        setStatus('guest');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((nextUser) => {
    writeSession(nextUser.email);
    setUser(nextUser);
    setStatus('authed');
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => startSession(await authApi.signIn({ email, password })),
    [startSession]
  );

  const signUp = useCallback(
    async ({ name, phone, email, password }) =>
      startSession(await authApi.signUp({ name, phone, email, password })),
    [startSession]
  );

  const signOut = useCallback(() => {
    writeSession('');
    setUser(null);
    setStatus('guest');
  }, []);

  const updateProfile = useCallback(
    async ({ name, phone }) => {
      const updated = await authApi.updateProfile({ email: user?.email, name, phone });
      setUser(updated);
      return updated;
    },
    [user?.email]
  );

  const value = useMemo(
    () => ({ user, status, signIn, signUp, signOut, updateProfile }),
    [user, status, signIn, signUp, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
