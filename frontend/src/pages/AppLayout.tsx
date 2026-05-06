import type { ReactNode } from "react";
import Navbar from "../components/NavBar";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <div className="main-content">
        <Navbar title={title} />
        <main className="page-wrapper">{children}</main>
      </div>
    </div>
  );
}
