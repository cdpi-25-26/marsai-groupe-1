import { Outlet } from "react-router";
import { BottomNavigation } from "./BottomNavBar";

export default function BottomNavLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
