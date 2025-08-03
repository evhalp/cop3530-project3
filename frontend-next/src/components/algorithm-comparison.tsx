"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconClock, IconRoute, IconBrain, IconTrophy, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'
import type { AlgorithmComparison as AlgorithmComparisonType, AlgorithmResult } from '@/lib/api/route-api'

interface AlgorithmComparisonProps {
  comparison: AlgorithmComparisonType | null
  onAnimationStep?: (step: number, algorithm: 'dijkstra' | 'astar') => void
}

export function AlgorithmComparison({ comparison, onAnimationStep }: AlgorithmComparisonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(150) // ms per step - faster for smoother animation
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const isAnimatingRef = useRef(false)
  const onAnimationStepRef = useRef(onAnimationStep)

  // Update the ref when the callback changes
  useEffect(() => {
    onAnimationStepRef.current = onAnimationStep
  }, [onAnimationStep])

  const totalSteps = comparison 
    ? Math.max(comparison.dijkstra.exploration_steps.length, comparison.astar.exploration_steps.length)
    : 0

  const startAnimation = useCallback(() => {
    if (!comparison || isAnimatingRef.current) return
    
    isAnimatingRef.current = true
    setIsAnimating(true)
    setCurrentStep(0)
    
    const animate = (step: number) => {
      if (step >= totalSteps || !isAnimatingRef.current) {
        isAnimatingRef.current = false
        setIsAnimating(false)
        return
      }
      
      setCurrentStep(step)
      // Call animation step for both algorithms simultaneously
      onAnimationStepRef.current?.(step, 'dijkstra') // This will now show both algorithms
      
      animationRef.current = setTimeout(() => animate(step + 1), animationSpeed)
    }
    
    animate(0)
  }, [comparison, totalSteps, animationSpeed])

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isAnimatingRef.current = false
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
    }
  }, [])

  if (!comparison) return null

  const { dijkstra, astar, winner, performance_metrics } = comparison

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="w-5 h-5" />
            Algorithm Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dijkstra Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-600">Dijkstra's Algorithm</h3>
                {winner === 'dijkstra' && <Badge variant="default" className="bg-blue-100 text-blue-800">Winner</Badge>}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Time:</span>
                  <span className="font-medium">{dijkstra.estimated_time_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stations Explored:</span>
                  <span className="font-medium">{dijkstra.stations_explored}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Execution Time:</span>
                  <span className="font-medium">{dijkstra.execution_time_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route Length:</span>
                  <span className="font-medium">{dijkstra.route.length} stations</span>
                </div>
              </div>
            </div>

            {/* A* Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-600">A* Algorithm</h3>
                {winner === 'astar' && <Badge variant="default" className="bg-green-100 text-green-800">Winner</Badge>}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Time:</span>
                  <span className="font-medium">{astar.estimated_time_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stations Explored:</span>
                  <span className="font-medium">{astar.stations_explored}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Execution Time:</span>
                  <span className="font-medium">{astar.execution_time_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route Length:</span>
                  <span className="font-medium">{astar.route.length} stations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Performance Analysis</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Time Difference:</span>
                <div className="font-medium">
                  {performance_metrics.time_difference > 0 ? '+' : ''}{performance_metrics.time_difference} min
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Exploration Difference:</span>
                <div className="font-medium">
                  {performance_metrics.exploration_difference} stations
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency Ratio:</span>
                <div className="font-medium">
                  {performance_metrics.efficiency_ratio.toFixed(2)}x
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain className="w-5 h-5" />
            Algorithm Exploration Animation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Animation Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                size="sm" 
                onClick={isAnimating ? stopAnimation : startAnimation}
                disabled={totalSteps === 0}
              >
                {isAnimating ? <IconPlayerPause className="w-4 h-4" /> : <IconPlayerPlay className="w-4 h-4" />}
                {isAnimating ? 'Pause' : 'Start'} Animation
              </Button>
              
              {/* Animation Speed Control */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <Select onValueChange={(value) => setAnimationSpeed(Number(value))} value={animationSpeed.toString()}>
                  <SelectTrigger className="w-[180px] text-xs border rounded px-2 py-1">
                    <SelectValue placeholder="Select a speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Fast</SelectItem>
                    <SelectItem value="300">Normal</SelectItem>
                    <SelectItem value="600">Slow</SelectItem>
                    <SelectItem value="1000">Very Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%` }}
              />
            </div>

            {/* Visual Animation Options */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Visual Animation Options</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Dijkstra Exploration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>A* Exploration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Final Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Current Step</span>
                </div>
              </div>
            </div>

            {/* Current Step Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-blue-800 mb-2">Dijkstra's Current Step</h4>
                <div className="text-sm">
                  {currentStep < dijkstra.exploration_steps.length 
                    ? dijkstra.exploration_steps[currentStep]
                    : 'Completed'
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Explored: {Math.min(currentStep + 1, dijkstra.exploration_steps.length)} / {dijkstra.exploration_steps.length}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-sm text-green-800 mb-2">A* Current Step</h4>
                <div className="text-sm">
                  {currentStep < astar.exploration_steps.length 
                    ? astar.exploration_steps[currentStep]
                    : 'Completed'
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Explored: {Math.min(currentStep + 1, astar.exploration_steps.length)} / {astar.exploration_steps.length}
                </div>
              </div>
            </div>

            {/* Exploration Comparison */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Exploration Patterns</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-blue-600 mb-1">Dijkstra (Breadth-First)</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {dijkstra.exploration_steps.map((step, index) => (
                      <div 
                        key={index} 
                        className={`p-1 rounded ${
                          index <= currentStep ? 'bg-blue-100' : 'bg-muted'
                        }`}
                      >
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-green-600 mb-1">A* (Heuristic-Based)</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {astar.exploration_steps.map((step, index) => (
                      <div 
                        key={index} 
                        className={`p-1 rounded ${
                          index <= currentStep ? 'bg-green-100' : 'bg-muted'
                        }`}
                      >
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}