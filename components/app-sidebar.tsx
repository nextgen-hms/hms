"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Queue Management",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        
      ],
    },
    {
      title: "Patient Registration",
      url: "#",
      icon: Bot,
      items: [
      ],
    },
    {
      title: "Patient Vitals",
      url: "#",
      icon: BookOpen,
      items: [
    
      ],
    },
     {
    title: "Clinical Details",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "Gynecologist",
        items: [
          { title: "Menstrual History", url: "/clinical/menstrual" },
          { title: "Current Pregnancy", url: "/clinical/current-pregnancy" },
        ],
      },
      {
        title: "Dermatologist",
        items: [
          { title: "Skin Allergy", url: "/clinical/skin-allergy" },
          { title: "Rash Details", url: "/clinical/rash-details" },
        ],
      },
    ],
  },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 p-4">
       <h2 className="text-xl font-bold "> Dr Bablu Clinic</h2>
       <span className="text-xs">Next-Gen Hospital Mangement System</span>
      </SidebarHeader>
      <SidebarContent >
        <NavMain  items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
