"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useClinicalDetails } from "@/contexts/ClinicalDetailsContext";

export type NavSubItem = {
  title: string;
  url?: string;
  items?: NavSubItem[];
};

export type NavItem = {
  title: string;
  icon?: LucideIcon;
  isActive?: boolean;
  url?:string;
  items?: NavSubItem[];
};

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const { setActiveTab } = useSidebar();
  const {setActiveTabClinicalDetails}=useClinicalDetails();
  // Recursive function to render items
  function renderItem(item: NavItem | NavSubItem) {
    const hasChildren = item.items && item.items.length > 0;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          asChild
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="text-lg font-medium"
                tooltip={item.title}
                onClick={()=>setActiveTab("Clinical Details")}
              >
                {"icon" in item && item.icon && <item.icon />}
                <span
                  className="ml-2"
                  onClick={() => setActiveTabClinicalDetails(item.title)}
                >
                  {item.title}
                </span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items!.map((subItem) => renderItem(subItem))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // Leaf item → button triggers active tab
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          className="text-lg font-medium"
          
        >
          {"icon" in item && item.icon && <item.icon />}
          <span onClick={() => setActiveTab(item.title) } className="ml-2">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-lg font-medium text-black">
        Reception
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => renderItem(item))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
