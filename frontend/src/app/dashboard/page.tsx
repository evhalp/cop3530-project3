import { AppSidebar } from "../../components/app-sidebar"
import { SiteHeader } from "../../components/site-header"
import { SectionCards } from "../../components/section-cards"
import { SidebarProvider } from "../../components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4">
            <SectionCards />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
} 