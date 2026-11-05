import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "../../api/auth.js";
import { AuthContext } from "./auth-context-def.js";
import type { User } from "../../api/types.js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchMe()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const loggedInUser = await apiLogin(credentials);
    setUser(loggedInUser);
    queryClient.invalidateQueries();
    return loggedInUser;
  };

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    const registeredUser = await apiRegister(data);
    setUser(registeredUser);
    queryClient.invalidateQueries();
    return registeredUser;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
