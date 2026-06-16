import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

type ButtonVariant = "primary" | "secondary" | "danger" | "dark" | "ghost";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ocean text-white hover:bg-blue-700 focus-visible:ring-ocean",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  dark: "bg-navy text-white hover:bg-slate-800 focus-visible:ring-navy",
  ghost: "bg-transparent text-slate-600 shadow-none hover:bg-slate-100 hover:text-navy focus-visible:ring-slate-300"
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, children, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-ocean focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition hover:border-slate-300 focus:border-ocean focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2",
        checked ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-navy">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
      <span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-ocean" : "bg-slate-300")}>
        <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-ocean", className)}>{children}</span>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <Button className="h-8 px-3" variant="secondary" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-semibold text-navy">{title}</h3>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}</div>;
}

export function LoadingSpinner() {
  return <div className="flex min-h-40 items-center justify-center text-ocean"><Loader2 className="h-8 w-8 animate-spin" /></div>;
}

export function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white p-5"><div className="h-4 w-1/2 rounded bg-slate-200" /><div className="mt-5 h-3 rounded bg-slate-100" /><div className="mt-3 h-3 w-3/4 rounded bg-slate-100" /></div>;
}

export function StatCard({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-navy">{value}</p></div><div className="rounded-md bg-blue-50 p-3 text-ocean">{icon}</div></div></Card>;
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <Card><h3 className="mb-4 text-base font-semibold text-navy">{title}</h3><div className="h-72">{children}</div></Card>;
}

export function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm">{children}</table></div>;
}

export function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span className="text-sm text-slate-500">Page {page} of {pages}</span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
}

export const KeywordBadge = Badge;
