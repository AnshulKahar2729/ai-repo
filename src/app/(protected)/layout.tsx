import React, { FC } from "react";
import { SidebarProvider } from "~/components/ui/sidebar";
import UserButton from "~/components/ui/user-button";
import { SessionProvider } from "next-auth/react";
import { auth } from "~/auth";
import AppSidebar from "./app-sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: FC<SidebarLayoutProps> = async ({ children }) => {
  const session = await auth();
  return (
    <SessionProvider basePath="/auth" session={session}>
      <SidebarProvider>
        <AppSidebar />
        <main className="m-2 w-full">
          <div className="gap2 flex border-collapse items-center rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
            {/* <SearchBar/> */}
            <div className="ml-auto"></div>
            <UserButton email={session?.user?.email ?? "?"} />
          </div>
          <div className="h-4"></div>
          <div className="h-[calc(100vh-6rem)]  rounded-md border border-sidebar-border bg-sidebar shadow">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default SidebarLayout;
