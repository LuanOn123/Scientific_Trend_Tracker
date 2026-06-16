import { Bell, BookMarked, ChevronRight, FileSearch, Gauge, Library, LogOut, Menu, Shield, Tags, TrendingUp, UserCircle, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { Role } from "../types";
import { cn } from "../components/ui";

const navSections: Array<{ title: string; items: Array<{ label: string; to: string; icon: typeof Gauge; roles?: Role[] }> }> = [
  {
    title: "Analyze",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: Gauge },
      { label: "Paper Search", to: "/papers", icon: FileSearch },
      { label: "Trends", to: "/trends", icon: TrendingUp },
      { label: "Journals", to: "/journals", icon: Library },
      { label: "Keywords & Topics", to: "/keywords", icon: Tags }
    ]
  },
  {
    title: "Workspace",
    items: [
      { label: "Bookmarks", to: "/bookmarks", icon: BookMarked },
      { label: "Notifications", to: "/notifications", icon: Bell }
    ]
  },
  {
    title: "Administration",
    items: [{ label: "Admin", to: "/admin", icon: Shield, roles: ["admin"] }]
  }
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const allowedSections = navSections
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.roles || (user && item.roles.includes(user.role))) }))
    .filter((section) => section.items.length);
  const currentPage = allowedSections.flatMap((section) => section.items).find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm">
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-navy text-sm font-bold text-white">SJ</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">SJTTS</p>
            <h1 className="text-base font-bold text-navy">Trend Tracker</h1>
          </div>
        </div>
        <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {allowedSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition",
                        isActive ? "bg-blue-50 text-ocean ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                      )
                    }
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-60" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
          <UserCircle className="h-9 w-9 text-ocean" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy">{user?.name}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} /> <div className="relative h-full">{sidebar}</div></div>}
      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button className="rounded-md p-2 text-navy hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scientific Journal Publication Trend Tracking System</p>
            <h2 className="mt-1 text-lg font-bold text-navy">{currentPage?.label || "Research metadata analytics"}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/notifications")} className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ocean" /></button>
            <button
              className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
