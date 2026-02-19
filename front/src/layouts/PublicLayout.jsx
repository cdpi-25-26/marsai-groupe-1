import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { LandingFooter } from "./footer";

export default function PublicLayout() {
  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <LandingFooter></LandingFooter>
    </div>

  );
}
