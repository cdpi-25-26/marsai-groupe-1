import { Outlet } from "react-router";
import { BottomNavigation } from "./BottomNavBar";

export default function BottomNavLayout() {
  return (
    <div>
      <main className="pt-26">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
