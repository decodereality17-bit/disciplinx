import { AppSidebar } from "./app-sidebar";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export function Layout({ children, className = "" }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className={`flex-1 min-w-0 overflow-y-auto pb-[72px] lg:pb-0 ${className}`}>
        {children}
      </main>
    </div>
  );
}
