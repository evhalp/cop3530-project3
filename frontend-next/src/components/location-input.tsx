"use client"

import * as React from "react"
import { IconMapPin, IconSearch, IconCheck } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import stationData from "@/lib/parsed-station-data.json"

// Use real station data from CSV
const SUBWAY_STATIONS = stationData.stations

interface LocationInputProps {
  label: string
  placeholder: string
  value: string
  onChangeAction: (value: string) => void
  onFocus?: () => void
  onStationSelect?: (station: string) => void
  className?: string
}

export function LocationInput({ 
  label, 
  placeholder, 
  value, 
  onChangeAction, 
  onFocus,
  onStationSelect,
  className 
}: LocationInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredStations, setFilteredStations] = React.useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value.trim() === "") {
      setFilteredStations([])
      setIsOpen(false)
      setSelectedIndex(-1)
      return
    }

    const filtered = SUBWAY_STATIONS.filter(station =>
      station.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredStations(filtered)
    setIsOpen(filtered.length > 0)
    setSelectedIndex(-1)
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleStationSelect = (station: string) => {
    onChangeAction(station)
    setIsOpen(false)
    setSelectedIndex(-1)
    onStationSelect?.(station)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredStations.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredStations.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredStations.length) {
          handleStationSelect(filteredStations[selectedIndex])
        } else if (filteredStations.length === 1) {
          handleStationSelect(filteredStations[0])
        } else if (SUBWAY_STATIONS.includes(value)) {
          onStationSelect?.(value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Label className="text-sm font-medium text-foreground mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <IconMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeAction(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.log('Location input focused:', label)
            onFocus?.()
            if (value.trim() !== "" && filteredStations.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-10 pr-3"
        />
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredStations.map((station, index) => (
            <button
              key={index}
              onClick={() => handleStationSelect(station)}
              className={cn(
                "w-full px-3 py-2 text-left transition-colors text-sm flex items-center gap-2",
                index === selectedIndex 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <IconSearch className="size-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1">{station}</span>
              {index === selectedIndex && (
                <IconCheck className="size-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 