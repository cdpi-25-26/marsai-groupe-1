import { Outlet } from "react-router";
import { TopBar } from "./TopBar";
import { BottomNavigation } from "./BottomNavBar";

export default function PublicLayout() {
  return (
    <div>
      <TopBar />
      <main className="mt-[88px] md:mt-[120px] pb-28">
        <Outlet />
      </main>
      <footer>Footer</footer>
      <BottomNavigation />
    </div>
  );
}
