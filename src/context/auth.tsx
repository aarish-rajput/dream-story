"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
import {
  loginOrRegisterAction,
  authCheckAction,
  logoutAction,
} from "@/actions/auth";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// ----------------------
// TYPES
// ----------------------

interface UserType {
  name: string;
  username: string;
  role: string;
  email: string;
  password: string;
  about?: string;
}

interface AuthContextType {
  user: UserType;
  setUser: Dispatch<SetStateAction<UserType>>;
  handleLoginSubmit: (e: FormEvent) => Promise<void>;
  loggedIn: boolean;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ----------------------
// CONTEXT
// ----------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: UserType = {
  name: "",
  username: "",
  role: "",
  email: "",
  password: "",
  about: "",
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType>(initialState);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const res = await authCheckAction();
      if (res.user) {
        setUser((prev) => ({ ...prev, ...res.user }));
      }
      setLoggedIn(res.loggedIn);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginOrRegisterAction(
        user.email || "",
        user.password || ""
      );

      if (res?.error) {
        setLoggedIn(false);
        toast.error(res.error);
      } else {
        setUser((prev) => ({ ...prev, ...res.user }));
        setLoggedIn(res.loggedIn);
        toast.success(`Welcome ${res.user?.name}!`);
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Login failed. Try later");
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutAction();
      setUser(initialState);
      setLoggedIn(false);
      toast.success("Logout successful");
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        handleLoginSubmit,
        loggedIn,
        logout,
        loading,
      }}
    >
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
