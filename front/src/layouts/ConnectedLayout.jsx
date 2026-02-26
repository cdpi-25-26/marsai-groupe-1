import { Outlet } from "react-router";
import { BottomNavigation } from "./BottomNavBar";

export default function ConnectedLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
      <BottomNavigation></BottomNavigation>
    </div>
  );
}
