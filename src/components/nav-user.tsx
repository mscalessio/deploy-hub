"use client";

import { UserButton } from "@clerk/nextjs";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton
          appearance={{
            elements: {
              rootBox: "h-10",
              userButtonBox: "h-full",
              userButtonTrigger: "h-full rounded-lg hover:bg-sidebar-accent",
              userButtonAvatarBox: "h-8 w-8",
              userButtonAvatar: "h-8 w-8 rounded-lg"
            }
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
