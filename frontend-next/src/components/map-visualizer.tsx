"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconMap, IconMapPin, IconTarget } from '@tabler/icons-react'
import stationData from '@/lib/parsed-station-data.json'

interface MapVisualizerProps {
  isActive: boolean
  startLocation?: string
  endLocation?: string
  routeData?: {
    route: string[]
    estimated_time_minutes: number
    algorithm: string
    explorationSteps?: {
      dijkstra: string[]
      astar: string[]
    }
  }
  onAnimationStep?: (step: number, algorithm: 'dijkstra' | 'astar') => void
  animationStep?: { step: number; algorithm: 'dijkstra' | 'astar' } | null
}

export function MapVisualizer({ isActive, startLocation, endLocation, routeData, onAnimationStep, animationStep }: MapVisualizerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentAlgorithm, setCurrentAlgorithm] = useState<'dijkstra' | 'astar' | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const startMarkerRef = useRef<any>(null)
  const endMarkerRef = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const explorationMarkersRef = useRef<any[]>([])
  const explorationLinesRef = useRef<any[]>([]) // Add ref for exploration lines
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Use real station coordinates from CSV
  const STATION_COORDINATES: { [key: string]: [number, number] } = Object.fromEntries(
    Object.entries(stationData.stationCoordinates).map(([station, coords]) => [
      station, 
      coords as [number, number]
    ])
  )

  // Function to clear exploration markers
  const clearExplorationMarkers = () => {
    if (explorationMarkersRef.current.length > 0) {
      explorationMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker)
        }
      })
      explorationMarkersRef.current = []
    }
    
    // Clear exploration lines
    if (explorationLinesRef.current.length > 0) {
      explorationLinesRef.current.forEach(line => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(line)
        }
      })
      explorationLinesRef.current = []
    }
  }

  // Function to clear main route line
  const clearMainRouteLine = () => {
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current)
      routeLineRef.current = null
    }
  }

  // Function to visualize animation step
  const visualizeAnimationStep = (step: number, algorithm: 'dijkstra' | 'astar') => {
    console.log('visualizeAnimationStep called with:', { step, algorithm, mapLoaded, hasMapInstance: !!mapInstanceRef.current, hasExplorationSteps: !!routeData?.explorationSteps })
    
    if (!mapLoaded || !mapInstanceRef.current || !routeData?.explorationSteps) {
      console.log('Early return - missing requirements:', { mapLoaded, hasMapInstance: !!mapInstanceRef.current, hasExplorationSteps: !!routeData?.explorationSteps })
      return
    }

    setCurrentStep(step)
    setCurrentAlgorithm(algorithm)
    setIsAnimating(true) // Set animation state to true

    // Clear previous exploration markers and lines
    clearExplorationMarkers()
    clearMainRouteLine() // Clear main route line when animation starts

    // @ts-ignore - Leaflet is loaded dynamically
    const L = window.L

    // Visualize both algorithms simultaneously
    const dijkstraSteps = routeData.explorationSteps.dijkstra
    const astarSteps = routeData.explorationSteps.astar

    console.log('Dijkstra steps:', dijkstraSteps)
    console.log('A* steps:', astarSteps)

    // Create exploration paths for both algorithms
    const dijkstraCoordinates: [number, number][] = []
    const astarCoordinates: [number, number][] = []

    // Process Dijkstra exploration up to current step
    const dijkstraMaxStep = Math.min(step, dijkstraSteps.length - 1)
    for (let i = 0; i <= dijkstraMaxStep; i++) {
      const station = dijkstraSteps[i]
      const realStationName = station.replace(' (explored)', '')
      
      if (STATION_COORDINATES[realStationName]) {
        const coords = STATION_COORDINATES[realStationName]
        dijkstraCoordinates.push(coords)
        
        // Add marker for Dijkstra
        const dijkstraIcon = L.divIcon({
          className: 'exploration-marker dijkstra-exploration',
          html: `<div class="exploration-pulse dijkstra-pulse"></div><div class="exploration-dot dijkstra-dot"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })

        const marker = L.marker(coords, { icon: dijkstraIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Dijkstra</b> explored: ${realStationName}`)

        explorationMarkersRef.current.push(marker)
      }
    }

    // Process A* exploration up to current step
    const astarMaxStep = Math.min(step, astarSteps.length - 1)
    for (let i = 0; i <= astarMaxStep; i++) {
      const station = astarSteps[i]
      const realStationName = station.replace(' (explored)', '')
      
      if (STATION_COORDINATES[realStationName]) {
        const coords = STATION_COORDINATES[realStationName]
        astarCoordinates.push(coords)
        
        // Add marker for A*
        const astarIcon = L.divIcon({
          className: 'exploration-marker astar-exploration',
          html: `<div class="exploration-pulse astar-pulse"></div><div class="exploration-dot astar-dot"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })

        const marker = L.marker(coords, { icon: astarIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>A*</b> explored: ${realStationName}`)

        explorationMarkersRef.current.push(marker)
      }
    }

    // Draw Dijkstra exploration path
    if (dijkstraCoordinates.length > 1) {
      console.log('Creating Dijkstra exploration line with coordinates:', dijkstraCoordinates)
      const dijkstraLine = L.polyline(dijkstraCoordinates, {
        color: '#3b82f6', // Blue for Dijkstra
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 4',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current)

      explorationLinesRef.current.push(dijkstraLine)
      console.log('Dijkstra exploration line drawn with', dijkstraCoordinates.length, 'points')
    }

    // Draw A* exploration path
    if (astarCoordinates.length > 1) {
      console.log('Creating A* exploration line with coordinates:', astarCoordinates)
      const astarLine = L.polyline(astarCoordinates, {
        color: '#22c55e', // Green for A*
        weight: 3,
        opacity: 0.8,
        dashArray: '4, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current)

      explorationLinesRef.current.push(astarLine)
      console.log('A* exploration line drawn with', astarCoordinates.length, 'points')
    }

    console.log('Visualization complete for step:', step)
    console.log('Total exploration lines:', explorationLinesRef.current.length)
  }

  // Listen for animation steps from parent component
  useEffect(() => {
    console.log('Animation step received:', animationStep)
    if (animationStep) {
      console.log('Calling visualizeAnimationStep with:', animationStep.step, animationStep.algorithm)
      visualizeAnimationStep(animationStep.step, animationStep.algorithm)
    }
  }, [animationStep])

  // Function to stop animation
  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearTimeout(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
    setIsAnimating(false)
    setCurrentStep(0)
    setCurrentAlgorithm(null)
    clearExplorationMarkers()
    clearMainRouteLine() // Clear main route line when stopping animation
  }

  useEffect(() => {
    console.log('MapVisualizer useEffect triggered:', { isActive, mapLoaded, hasRef: !!mapRef.current })
    
    // Reset states when not active
    if (!isActive) {
      console.log('Resetting map states - not active')
      setMapLoaded(false)
      setIsLoading(false)
      return
    }
    
    // Only load map if active, not already loaded, and ref exists
    if (isActive && !mapLoaded && mapRef.current) {
      console.log('Starting map loading process...')
      setIsLoading(true)
      
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      
      script.onload = () => {
        console.log('Leaflet script loaded successfully')
        // @ts-ignore - Leaflet is loaded dynamically
        const L = window.L
        
        console.log('Initializing map...')
        
        try {
          // Initialize map centered on NYC
          const map = L.map(mapRef.current!).setView([40.7128, -74.0060], 12)
          mapInstanceRef.current = map
          
          console.log('Map object created:', map)
          console.log('Map container element:', mapRef.current)
          console.log('Map container has Leaflet classes:', mapRef.current!.classList.contains('leaflet-container'))
          
          console.log('Map object created, adding tile layer...')
          
          // Use CartoDB tiles for better styling
          const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
          })
          
          tileLayer.addTo(map)
          
          // Add error handling for tile loading
          tileLayer.on('tileloadstart', () => {
            console.log('Tile loading started')
          })
          
          tileLayer.on('tileload', () => {
            console.log('Tile loaded successfully')
          })
          
          tileLayer.on('tileerror', (error) => {
            console.error('Tile loading error:', error)
            // Try fallback tile provider
            console.log('Trying fallback tile provider...')
            const fallbackTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            })
            fallbackTileLayer.addTo(map)
          })
          
          console.log('Tile layer added to map')
          
          // Force a map refresh to ensure tiles load
          setTimeout(() => {
            console.log('Forcing map refresh...')
            map.invalidateSize()
          }, 100)
          
          console.log('Map initialized successfully')
          
          // Set loaded state immediately
          console.log('Setting mapLoaded to true...')
          setMapLoaded(true)
          setIsLoading(false)
          console.log('State updates called - map should now be visible')
        } catch (error) {
          console.error('Error initializing map:', error)
          setIsLoading(false)
        }
      }
      
      script.onerror = (error) => {
        console.error('Failed to load Leaflet script:', error)
        setIsLoading(false)
      }
      
      document.head.appendChild(script)
    } else {
      console.log('Map loading conditions not met:', { isActive, mapLoaded, hasRef: !!mapRef.current })
    }
  }, [isActive]) // Only depend on isActive, not mapLoaded

  // Effect to handle markers when locations change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    // @ts-ignore - Leaflet is loaded dynamically
    const L = window.L

    // Clear existing markers
    if (startMarkerRef.current) {
      mapInstanceRef.current.removeLayer(startMarkerRef.current)
      startMarkerRef.current = null
    }
    if (endMarkerRef.current) {
      mapInstanceRef.current.removeLayer(endMarkerRef.current)
      endMarkerRef.current = null
    }

    // Add start location marker
    if (startLocation && STATION_COORDINATES[startLocation]) {
      const coords = STATION_COORDINATES[startLocation]
      const startIcon = L.divIcon({
        className: 'custom-marker start-marker',
        html: '<div class="marker-pulse"></div><div class="marker-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      
      startMarkerRef.current = L.marker(coords, { icon: startIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Start:</b> ${startLocation}`)
    }

    // Add end location marker
    if (endLocation && STATION_COORDINATES[endLocation]) {
      const coords = STATION_COORDINATES[endLocation]
      const endIcon = L.divIcon({
        className: 'custom-marker end-marker',
        html: '<div class="marker-pulse"></div><div class="marker-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16 10,8"/></svg></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      
      endMarkerRef.current = L.marker(coords, { icon: endIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Destination:</b> ${endLocation}`)
    }

    // Fit map to show all markers
    if (startLocation && endLocation && STATION_COORDINATES[startLocation] && STATION_COORDINATES[endLocation]) {
      const bounds = L.latLngBounds([
        STATION_COORDINATES[startLocation],
        STATION_COORDINATES[endLocation]
      ])
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [startLocation, endLocation, mapLoaded])

  // Effect to handle route visualization
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !routeData) return

    // @ts-ignore - Leaflet is loaded dynamically
    const L = window.L

    // Clear existing route line
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current)
      routeLineRef.current = null
    }

    // Only clear exploration markers if not currently animating
    if (!isAnimating) {
      clearExplorationMarkers()
    }

    // Draw route path (only if not animating)
    if (routeData.route && routeData.route.length > 0 && !isAnimating) {
      const routeCoordinates: [number, number][] = []
      
      // Get coordinates for each station in the route
      routeData.route.forEach(station => {
        if (STATION_COORDINATES[station]) {
          routeCoordinates.push(STATION_COORDINATES[station])
        }
      })

      if (routeCoordinates.length > 1) {
        // Create route line
        routeLineRef.current = L.polyline(routeCoordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(mapInstanceRef.current)

        // Add route info popup
        const routeInfo = `
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #3b82f6;">
              Subway Route
            </h3>
            <p style="margin: 4px 0;"><strong>Estimated Time:</strong> ${routeData.estimated_time_minutes} minutes</p>
            <p style="margin: 4px 0;"><strong>Stations:</strong> ${routeData.route.length}</p>
            <p style="margin: 8px 0; font-size: 12px; color: #666;">
              <strong>Route:</strong><br/>
              ${routeData.route.map((station, index) => `${index + 1}. ${station}`).join('<br/>')}
            </p>
          </div>
        `

        routeLineRef.current.bindPopup(routeInfo)

        // Calculate bounds including route and markers for better centering
        const allCoordinates = [...routeCoordinates]
        
        // Add start and end location coordinates if they exist
        if (startLocation && STATION_COORDINATES[startLocation]) {
          allCoordinates.push(STATION_COORDINATES[startLocation])
        }
        if (endLocation && STATION_COORDINATES[endLocation]) {
          allCoordinates.push(STATION_COORDINATES[endLocation])
        }
        
        // Fit map to show entire route with better padding
        const bounds = L.latLngBounds(allCoordinates)
        
        // Force a map refresh first, then fit bounds
        mapInstanceRef.current.invalidateSize()
        
        // Use a longer delay to ensure the map is fully rendered
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(bounds, { 
              padding: [50, 50],
              maxZoom: 15,
              animate: true
            })
          }
        }, 200)
      }
    }

  }, [routeData, mapLoaded])

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopAnimation()
    }
  }, [])

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('mapLoaded state changed to:', mapLoaded)
    if (mapRef.current) {
      console.log('Map container classes:', mapRef.current.className)
      console.log('Map container style display:', window.getComputedStyle(mapRef.current).display)
      console.log('Map container dimensions:', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        clientWidth: mapRef.current.clientWidth,
        clientHeight: mapRef.current.clientHeight
      })
    }
  }, [mapLoaded])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Subway Route Map</CardTitle>
        {isAnimating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Dijkstra</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">A*</span>
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Step {currentStep} of algorithm exploration
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="relative w-full h-full min-h-[600px]">
          {/* Map Container - Always rendered but hidden when not loaded */}
          <div 
            ref={mapRef}
            className="w-full h-full rounded-lg border border-input"
            style={{ 
              minHeight: '600px'
            }}
          />

          {/* Placeholder State - Only shown when map is not loaded */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center flex flex-col items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Map...</h3>
                    <p className="text-gray-500">Please wait while we load the map</p>
                  </>
                ) : (
                  <>
                    <IconMap className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Visualizer</h3>
                    <p className="text-gray-500">Click on the start location input to load the map</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Custom CSS for markers */}
      <style jsx>{`
        .custom-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
        }
        
        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .start-marker .marker-pulse {
          background: rgba(34, 197, 94, 0.3);
        }
        
        .end-marker .marker-pulse {
          background: rgba(239, 68, 68, 0.3);
        }
        
        .marker-icon {
          position: relative;
          z-index: 1;
          color: white;
          background: #3b82f6;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .end-marker .marker-icon {
          background: #ef4444;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .exploration-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
        }
        
        .exploration-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: exploration-pulse 1.5s infinite;
        }
        
        .dijkstra-pulse {
          background: rgba(59, 130, 246, 0.3);
        }
        
        .astar-pulse {
          background: rgba(34, 197, 94, 0.3);
        }
        
        .exploration-dot {
          position: relative;
          z-index: 1;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        
        .dijkstra-dot {
          background: #3b82f6;
        }
        
        .astar-dot {
          background: #22c55e;
        }
        
        @keyframes exploration-pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </Card>
  )
}