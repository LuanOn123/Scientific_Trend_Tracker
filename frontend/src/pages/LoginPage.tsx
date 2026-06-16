import { GoogleLogin } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { Button, Card, Field, Input } from "../components/ui";
import { useAuthStore } from "../stores/authStore";
import type { ApiResponse, User } from "../types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters")
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const finishAuth = (token: string, user: User, message: string) => {
    setAuth(token, user);
    toast.success(message);
    navigate("/dashboard");
  };

  const onSubmit = async (values: FormValues) => {
    setLoginError("");
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", values);
      finishAuth(response.data.data.token, response.data.data.user, "Logged in successfully");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setLoginError("Incorrect email or password.");
      }
    }
  };

  const onGoogleCredential = async (credential?: string) => {
    if (!credential || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      toast.error("Google login is not configured");
      return;
    }
    const response = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/google", { credential });
    finishAuth(response.data.data.token, response.data.data.user, "Logged in with Google");
  };

  return (
    <AuthShell title="Welcome back to your research dashboard" subtitle="Search real scholarly metadata, inspect trends, and continue your saved reading workflow.">
      <Card className="mx-auto w-full max-w-md border-white/60 bg-white/95 p-7 shadow-2xl backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-navy text-white"><BarChart3 className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Scientific Trend Tracker</p>
            <h1 className="text-2xl font-bold text-navy">Login</h1>
          </div>
        </div>
        <div className="mb-5">
          <GoogleLogin onSuccess={(result) => onGoogleCredential(result.credential)} onError={() => toast.error("Google login failed")} width="100%" text="signin_with" />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or use email <span className="h-px flex-1 bg-slate-200" /></div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Email" error={errors.email?.message}>
            <Input placeholder="you@example.com" {...register("email")} />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <Input placeholder="Enter password" type="password" {...register("password")} />
          </Field>
          {loginError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{loginError}</div>}
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-semibold text-ocean" to="/register">Register</Link></p>
      </Card>
    </AuthShell>
  );
}
