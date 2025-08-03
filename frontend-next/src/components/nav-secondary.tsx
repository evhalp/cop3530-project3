"use client"

import * as React from "react"
import { 
  IconMapPin, 
  IconRoute, 
  IconReport, 
  IconFileDescription,
  type Icon 
} from "@tabler/icons-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.title === "Get Help" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton className="transition-all duration-200 ease-in-out">
                        <item.icon className="transition-transform duration-200 ease-in-out" />
                        <span className="transition-opacity duration-200 ease-in-out">{item.title}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent 
                      side={isCollapsed ? "right" : "right"} 
                      className="max-w-sm transition-all duration-200 ease-in-out"
                      sideOffset={isCollapsed ? 8 : 4}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium mb-2">How to Use NYC Subway Route Finder</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <IconMapPin className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Location Inputs:</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter your start and destination stations in the input boxes above. 
                            The system will autocomplete as you type with valid NYC subway stations.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <IconRoute className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Map Display:</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            The main map area shows your route visualization with stations, 
                            travel times, and optimal paths between your selected locations.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <IconReport className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Route Analysis:</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            View detailed algorithm analysis including Dijkstra's and A* pathfinding 
                            comparisons, travel times, and route optimization details.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <IconFileDescription className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Documentation:</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Check the Documents section above for technical details, 
                            development notes, and full project documentation.
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <SidebarMenuButton asChild className="transition-all duration-200 ease-in-out">
                  <a href={item.url}>
                    <item.icon className="transition-transform duration-200 ease-in-out" />
                    <span className="transition-opacity duration-200 ease-in-out">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
