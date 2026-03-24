import { Outlet, useLocation } from "react-router";
import { BottomNavigation } from "./BottomNavBar";

export default function BottomNavLayout() {
  const location = useLocation();
  const isFeedPage = location.pathname === "/feed";

  return (
    <div>
      <main className={isFeedPage ? "" : "pt-26"}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
