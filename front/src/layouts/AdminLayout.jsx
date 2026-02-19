import { Outlet, Link, useLocation } from "react-router";
import { Users, Video, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  }

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Utilisateurs", icon: Users },
    { to: "/admin/videos", label: "Vidéos", icon: Video },
  ];

  function isActive(path) {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-white/[0.02] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.08]">
          <div className="flex items-baseline gap-2">
            <span
              style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.5px" }}
              className="uppercase text-white"
            >
              MARS
            </span>
            <span
              style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.5px" }}
              className="uppercase bg-gradient-to-b from-[#51A2FF] via-[#AD46FF] to-[#FF2B7F] bg-clip-text text-transparent"
            >
              AI
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider ml-2">Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/[0.08]">
          <div className="px-3 py-2 text-xs text-white mb-2">
            Connecté : <span className="text-white font-semibold">{localStorage.getItem("username")}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
