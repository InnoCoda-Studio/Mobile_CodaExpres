import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";
import axios from "axios";

// Information we want to keep available throughout the app.
interface User {
  id: number;
  phone_number: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  authenticated: boolean;
}

interface AuthContextType {
  authState: AuthState;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "codexpress_access_token";
const REFRESH_TOKEN_KEY = "codexpress_refresh_token";
const USER_KEY = "codexpress_user";


// AuthProvider keeps authentication information available to the entire app.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    user: null,
    authenticated: false,
  });

  const [isLoading, setIsLoading] = useState(true);


  // When the application opens, check whether we already have a saved login.
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (accessToken && storedUser) {
          const user = JSON.parse(storedUser);

          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          setAuthState({
            accessToken,
            refreshToken,
            user,
            authenticated: true,
          });
        }
      } catch (error) {
        console.log("Error loading saved authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);


  // Login → Django → receive tokens + user → save them securely.
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login/", {
        email,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      const user = response.data.user;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      setAuthState({
        accessToken,
        refreshToken,
        user,
        authenticated: true,
      });

      return response;
    } catch (error: any) {
      console.log("Login error:", error.response?.data || error);

      return {
        error: true,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Login failed",
      };
    }
  };


  // Logout → remove the saved session and return the app to login.
  const logout = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    delete axios.defaults.headers.common["Authorization"];

    setAuthState({
      accessToken: null,
      refreshToken: null,
      user: null,
      authenticated: false,
    });
  };


  return (
    <AuthContext.Provider
      value={{
        authState,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// Screens use this hook when they need authentication information.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};