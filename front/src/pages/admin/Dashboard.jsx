import { Link } from "react-router";
import { Users, Video } from "lucide-react";

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-white/50 mb-8">Bienvenue dans le panneau d'administration MARS AI</p>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.06] transition"
        >
          <Users size={28} className="text-[#51A2FF] mb-3" />
          <h2 className="text-lg font-semibold mb-1">Utilisateurs</h2>
          <p className="text-sm text-white/50">Gérer les comptes utilisateurs</p>
        </Link>

        <Link
          to="/admin/videos"
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.06] transition"
        >
          <Video size={28} className="text-[#9810FA] mb-3" />
          <h2 className="text-lg font-semibold mb-1">Vidéos</h2>
          <p className="text-sm text-white/50">Gérer les vidéos et thumbnails</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
