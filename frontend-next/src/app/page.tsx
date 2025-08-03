"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MapVisualizer } from "@/components/map-visualizer"
import { AlgorithmComparison } from "@/components/algorithm-comparison"
import type { AlgorithmComparison as AlgorithmComparisonType } from "@/lib/api/route-api"

export default function HomePage() {
  const [mapActive, setMapActive] = useState(false)
  const [startLocation, setStartLocation] = useState("")
  const [endLocation, setEndLocation] = useState("")
  const [routeData, setRouteData] = useState<{
    route: string[]
    estimated_time_minutes: number
    algorithm: string
    explorationSteps?: {
      dijkstra: string[]
      astar: string[]
    }
  } | null>(null)
  const [algorithmComparison, setAlgorithmComparison] = useState<AlgorithmComparisonType | null>(null)
  const [animationStep, setAnimationStep] = useState<{ step: number; algorithm: 'dijkstra' | 'astar' } | null>(null)

  const handleMapActivate = (active: boolean) => {
    console.log('Map activation requested:', active)
    setMapActive(active)
  }

  const handleStartLocationSelect = (station: string) => {
    console.log('Start location selected:', station)
    setStartLocation(station)
  }

  const handleEndLocationSelect = (station: string) => {
    console.log('End location selected:', station)
    setEndLocation(station)
  }

  const handleRouteData = (data: {
    route: string[]
    estimated_time_minutes: number
    algorithm: string
    explorationSteps?: {
      dijkstra: string[]
      astar: string[]
    }
  }) => {
    console.log('Route data received:', data)
    setRouteData(data)
  }

  const handleAlgorithmComparison = (comparison: AlgorithmComparisonType) => {
    console.log('Algorithm comparison received:', comparison)
    setAlgorithmComparison(comparison)
  }

  const handleAnimationStep = (step: number, algorithm: 'dijkstra' | 'astar') => {
    setAnimationStep({ step, algorithm })
  }

  console.log('HomePage render - mapActive:', mapActive, 'startLocation:', startLocation, 'endLocation:', endLocation, 'routeData:', routeData)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          onMapActivate={handleMapActivate}
          onStartLocationSelect={handleStartLocationSelect}
          onEndLocationSelect={handleEndLocationSelect}
          onRouteData={handleRouteData}
          onAlgorithmComparison={handleAlgorithmComparison}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 p-4">
            <div className={algorithmComparison ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""}>
              <MapVisualizer 
                isActive={mapActive} 
                startLocation={startLocation}
                endLocation={endLocation}
                routeData={routeData || undefined}
                onAnimationStep={handleAnimationStep}
                animationStep={animationStep}
              />
              {algorithmComparison && (
                <AlgorithmComparison 
                  comparison={algorithmComparison}
                  onAnimationStep={handleAnimationStep}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
