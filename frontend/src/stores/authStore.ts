import { create } from "zustand";
import type { Role, User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const savedToken = localStorage.getItem("sjtts_token");
const savedUser = localStorage.getItem("sjtts_user");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: savedToken,
  user: savedUser ? (JSON.parse(savedUser) as User) : null,
  setAuth: (token, user) => {
    localStorage.setItem("sjtts_token", token);
    localStorage.setItem("sjtts_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("sjtts_token");
    localStorage.removeItem("sjtts_user");
    set({ token: null, user: null });
  },
  hasRole: (roles) => {
    const user = get().user;
    return !!user && roles.includes(user.role);
  }
}));
