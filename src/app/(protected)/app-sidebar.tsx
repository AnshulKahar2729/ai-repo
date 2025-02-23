"use client";
import {
  Bot,
  CreditCard,
  FolderGit2,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useProject } from "~/hooks/use-project";
import { cn } from "~/lib/utils";

interface AppSidebarProps {}
const AppSidebar: FC<AppSidebarProps> = ({}) => {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const items = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { title: "Q&A", icon: Bot, url: "/qa" },
    { title: "Meetings", icon: Presentation, url: "/meetings" },
    { title: "Billing", icon: CreditCard, url: "/billing" },
  ];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        {open ? (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
              <FolderGit2 size={24} />
            </div>
            <span className="text-lg font-bold">AI Repo</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <FolderGit2 size={24} />
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        {
                          "!bg-primary !text-white": pathname === item.url,
                        },
                        "list-none",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div onClick={()=> {
                      setProjectId(project.id);
                    }}>
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                          {
                            "bg-primary text-white": project.id === projectId,
                          },
                        )}
                      >
                        {project.name[0]}
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button size={"sm"} variant={"outline"} className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
