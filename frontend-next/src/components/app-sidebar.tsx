"use client"

import * as React from "react"
import {
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconMapPin,
  IconRoute,
  IconReport,
  IconTrain,
  IconClock,
} from "@tabler/icons-react"

import { LocationInput } from "@/components/location-input"
import { NavDocuments } from "@/components/nav-documents"
import { NavSecondary } from "@/components/nav-secondary"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findRoute, checkServerHealth, compareAlgorithms } from "@/lib/api/route-api"
import stationData from "@/lib/parsed-station-data.json"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Data",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Documentation",
      url: "#",
      icon: IconFileDescription,
    },
    {
      name: "Dev Notes",
      url: "#",
      icon: IconFileAi,
    },
    {
      name: "Full Report",
      url: "#",
      icon: IconReport,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onMapActivate?: (active: boolean) => void
  onStartLocationSelect?: (station: string) => void
  onEndLocationSelect?: (station: string) => void
  onRouteData?: (data: {
    route: string[]
    estimated_time_minutes: number
    algorithm: string
    explorationSteps?: {
      dijkstra: string[]
      astar: string[]
    }
  }) => void
  onAlgorithmComparison?: (comparison: any) => void
}

export function AppSidebar({ onMapActivate, onStartLocationSelect, onEndLocationSelect, onRouteData, onAlgorithmComparison, ...props }: AppSidebarProps) {
  const [startLocation, setStartLocation] = React.useState("")
  const [endLocation, setEndLocation] = React.useState("")
  const [timeOption, setTimeOption] = React.useState("current")
  const [customTime, setCustomTime] = React.useState("08:00")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [routeResult, setRouteResult] = React.useState<{ route: string[], estimated_time_minutes: number } | null>(null)
  const [serverConnected, setServerConnected] = React.useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Check server health on component mount
  React.useEffect(() => {
    checkServerHealth().then(setServerConnected)
  }, [])

  const handleFindRoute = async () => {
    // Clear previous error
    setError("")
    
    // Validate inputs
    if (!startLocation.trim()) {
      setError("Please enter a valid start station")
      return
    }
    
    if (!endLocation.trim()) {
      setError("Please enter a valid destination station")
      return
    }
    
    // Check if stations exist in our list (you can replace this with backend validation)
    const validStations = stationData.stations.map((station: string) => station.toLowerCase())
    
    if (!validStations.some((station: string) => 
      station.includes(startLocation.toLowerCase())
    )) {
      setError("Please enter a valid start station")
      return
    }
    
    if (!validStations.some((station: string) => 
      station.includes(endLocation.toLowerCase())
    )) {
      setError("Please enter a valid destination station")
      return
    }
    
    // Check if server is connected
    if (!serverConnected) {
      setError("Backend server is not connected. Please ensure the server is running on localhost:8080")
      return
    }

    // If validation passes, proceed with route finding
    setIsLoading(true)
    
    try {
      // Prepare time data
      const timeString = timeOption === "current" 
        ? new Date().toLocaleTimeString('en-US', { hour12: false })
        : customTime
      
      // Call both APIs for comparison
      const [routeResult, comparisonResult] = await Promise.all([
        findRoute({
          start_station: startLocation,
          end_station: endLocation,
          time: timeString
        }),
        compareAlgorithms({
          start_station: startLocation,
          end_station: endLocation,
          time: timeString
        })
      ])
      
      setRouteResult(routeResult)
      setError("") // Clear any previous errors
      
      // Pass route data to parent component for map visualization
      if (onRouteData && routeResult) {
        onRouteData({
          route: routeResult.route,
          estimated_time_minutes: routeResult.estimated_time_minutes,
          algorithm: 'dijkstra',
          explorationSteps: comparisonResult ? {
            dijkstra: comparisonResult.dijkstra.exploration_steps,
            astar: comparisonResult.astar.exploration_steps
          } : undefined
        })
      }
      
      // Pass comparison data to parent component
      if (onAlgorithmComparison && comparisonResult) {
        onAlgorithmComparison(comparisonResult)
      }
      
    } catch (err) {
      console.error('Route finding error:', err)
      setError(err instanceof Error ? err.message : "Failed to find route")
      setRouteResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="data-[slot=sidebar-menu-button]:!p-1.5 transition-all duration-200 ease-in-out cursor-pointer"
                  >
                    <IconTrain className="!size-5 transition-transform duration-200 ease-in-out" />
                    <span className="text-base font-semibold transition-opacity duration-200 ease-in-out">Subway Surfers LLC</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">DSA Summer C 2025:</p>
                      <p>• Evan Halperin (Backend)</p>
                      <p>• Liam Beaubien (Backend)</p>
                      <p>• Jennifer Laman (Frontend)</p>
                      <p className="text-xs italic mt-1">(I dropped the class lolz)</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isCollapsed ? (
          // Collapsed view with icons and tooltips
          <div className="p-2 space-y-2">
            {/* Start Location Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-4 rounded-md hover:bg-accent cursor-pointer transition-all duration-200 ease-in-out">
                    <IconMapPin className="size-16 text-muted-foreground transition-transform duration-200 ease-in-out" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Start Location</p>
                    <p className="text-sm text-muted-foreground">
                      {startLocation || "Not set"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* End Location Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-4 rounded-md hover:bg-accent cursor-pointer transition-all duration-200 ease-in-out">
                    <IconRoute className="size-16 text-muted-foreground transition-transform duration-200 ease-in-out" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">End Location</p>
                    <p className="text-sm text-muted-foreground">
                      {endLocation || "Not set"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Time Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-4 rounded-md hover:bg-accent cursor-pointer transition-all duration-200 ease-in-out">
                    <IconClock className="size-16 text-muted-foreground transition-transform duration-200 ease-in-out" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Departure Time</p>
                    <p className="text-sm text-muted-foreground">
                      {timeOption === "current" ? "Using current time" : `Custom time: ${customTime}`}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Analysis Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-4 rounded-md hover:bg-accent cursor-pointer transition-all duration-200 ease-in-out">
                    <IconReport className="size-16 text-muted-foreground transition-transform duration-200 ease-in-out" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Route Analysis</p>
                    {routeResult ? (
                      <div className="text-sm text-muted-foreground">
                        <p>Time: {routeResult.estimated_time_minutes} min</p>
                        <p>Stations: {routeResult.route.length}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to view route details and algorithm analysis
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Error Display */}
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center p-2 rounded-md bg-destructive/10 cursor-pointer">
                      <div className="size-2 bg-destructive rounded-full"></div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm text-destructive">{error}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          // Expanded view with full inputs
          <>
            <div className="p-4 space-y-4 border-b border-border">
                        <LocationInput
            label="Start Location"
            placeholder="Enter start station..."
            value={startLocation}
            onChangeAction={setStartLocation}
            onFocus={() => onMapActivate?.(true)}
            onStationSelect={onStartLocationSelect}
          />
                        <LocationInput
            label="End Location"
            placeholder="Enter destination station..."
            value={endLocation}
            onChangeAction={setEndLocation}
            onStationSelect={onEndLocationSelect}
          />
          
          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <IconClock className="size-4 text-muted-foreground" />
              Departure Time
            </Label>
            <Select value={timeOption} onValueChange={setTimeOption}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current" className="flex items-center gap-2">
                  <IconClock className="size-4" />
                  Use Current Time
                </SelectItem>
                <SelectItem value="custom" className="flex items-center gap-2">
                  <IconClock className="size-4" />
                  Custom Time
                </SelectItem>
              </SelectContent>
            </Select>
            
            {timeOption === "custom" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Select Time</Label>
                <div className="border border-input rounded-md bg-transparent p-2">
                  <div className="flex gap-2">
                    {/* Hours */}
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 text-center">Hour</div>
                                             <div className="h-24 overflow-y-auto border border-input rounded bg-background scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const hourStr = hour.toString().padStart(2, '0');
                          const isSelected = customTime.startsWith(hourStr);
                          return (
                                                         <div
                               key={hour}
                               className={`px-2 py-1 text-center text-sm cursor-pointer transition-colors ${
                                 isSelected 
                                   ? 'bg-primary text-primary-foreground' 
                                   : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                               }`}
                               onClick={() => {
                                 const [_, minutes] = customTime.split(':');
                                 setCustomTime(`${hourStr}:${minutes}`);
                               }}
                             >
                               {hourStr}
                             </div>
                          );
                        })}
                      </div>
                    </div>
                    
                                         {/* Minutes */}
                     <div className="flex-1">
                       <div className="text-xs text-muted-foreground mb-1 text-center">Minute</div>
                       <div className="h-24 overflow-y-auto border border-input rounded bg-background scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                         {Array.from({ length: 60 }, (_, minute) => {
                           const minuteStr = minute.toString().padStart(2, '0');
                           const isSelected = customTime.endsWith(`:${minuteStr}`);
                           return (
                             <div
                               key={minute}
                               className={`px-2 py-1 text-center text-sm cursor-pointer transition-colors ${
                                 isSelected 
                                   ? 'bg-primary text-primary-foreground' 
                                   : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                               }`}
                               onClick={() => {
                                 const [hours] = customTime.split(':');
                                 setCustomTime(`${hours}:${minuteStr}`);
                               }}
                             >
                               {minuteStr}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Server Status */}
          <div className={`p-2 rounded-md text-xs text-center ${
            serverConnected 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}>
            {serverConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          
          {/* Find Route Button */}
          <Button 
            onClick={handleFindRoute}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? "Finding Route..." : "Find Route"}
          </Button>
            </div>
            
                    {/* Route Results Section */}
        <div className="flex-1 p-4">
          {routeResult && (
            <div className="space-y-3">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
                <h3 className="font-medium text-sm mb-2">Route Found!</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="ml-1 font-medium">{routeResult.estimated_time_minutes} minutes</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Stations:</span>
                    <span className="ml-1 font-medium">{routeResult.route.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Route Details:</span>
                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {routeResult.route.map((station, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-xs">{station}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Route Statistics */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-sm mb-2 text-blue-800">Route Analysis</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Average time per station:</span>
                    <span className="font-medium">
                      {routeResult.route.length > 1 
                        ? (routeResult.estimated_time_minutes / (routeResult.route.length - 1)).toFixed(1)
                        : routeResult.estimated_time_minutes
                      } min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Route efficiency:</span>
                    <span className="font-medium">
                      {routeResult.route.length <= 2 ? 'Direct' : 'Multi-stop'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Click on the route line on the map for detailed information
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
          </>
        )}
        
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
