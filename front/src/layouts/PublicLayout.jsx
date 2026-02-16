import { Outlet } from "react-router";
import { TopBar } from "./TopBar";

export default function PublicLayout() {
  return (
    <div>
      <TopBar />
      <main className="mt-52">  
        <Outlet />
      </main>
      <footer>Footer</footer>
    </div>
  );
}
