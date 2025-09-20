"use client"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ClinicalDetailsProvider } from "@/contexts/ClinicalDetailsContext"
import { useSidebar } from "@/contexts/SidebarContext"

export default function Page() {
   
    
  return (
    <SidebarProvider>
        <ClinicalDetailsProvider>
      <AppSidebar />
      <SidebarInset>
    <SidebarTrigger className="-ml-1" />
      </SidebarInset>
      </ClinicalDetailsProvider>
    </SidebarProvider>
  )
}
