import { GoogleLogin } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { Button, Card, Field, Input } from "../components/ui";
import { useAuthStore } from "../stores/authStore";
import type { ApiResponse, User } from "../types";

const schema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Email is invalid"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", confirmPassword: "" } });

  const finishAuth = (token: string, user: User, message: string) => {
    setAuth(token, user);
    toast.success(message);
    navigate("/dashboard");
  };

  const onSubmit = async ({ confirmPassword, ...values }: FormValues) => {
    void confirmPassword;
    const response = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/register", values);
    finishAuth(response.data.data.token, response.data.data.user, "Account created");
  };

  const onGoogleCredential = async (credential?: string) => {
    if (!credential || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      toast.error("Google login is not configured");
      return;
    }
    const response = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/google", { credential });
    finishAuth(response.data.data.token, response.data.data.user, "Registered with Google");
  };

  return (
    <AuthShell title="Create a focused research account" subtitle="Register as a user, then start searching Semantic Scholar metadata and saving papers immediately.">
      <Card className="mx-auto w-full max-w-md border-white/60 bg-white/95 p-7 shadow-2xl backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-navy text-white"><UserPlus className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Join SJTTS</p>
            <h1 className="text-2xl font-bold text-navy">Register</h1>
          </div>
        </div>
        <div className="mb-5">
          <GoogleLogin onSuccess={(result) => onGoogleCredential(result.credential)} onError={() => toast.error("Google login failed")} width="100%" text="signup_with" />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or create account <span className="h-px flex-1 bg-slate-200" /></div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" error={errors.name?.message}>
            <Input placeholder="Your full name" {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input placeholder="you@example.com" {...register("email")} />
          </Field>
          <Field label="Password" hint="Minimum 6 characters" error={errors.password?.message}>
            <Input placeholder="Create password" type="password" {...register("password")} />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword?.message}>
            <Input placeholder="Re-enter password" type="password" {...register("confirmPassword")} />
          </Field>
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Register"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-ocean" to="/login">Login</Link></p>
      </Card>
    </AuthShell>
  );
}
