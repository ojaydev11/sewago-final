'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Route, 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  TrendingUp,
  Car
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface RouteOption {
  id: string;
  name: string;
  distance: number; // in km
  duration: number; // in minutes
  trafficDelay: number; // additional minutes due to traffic
  totalTime: number;
  preferenceScore: number; // 0-100
  waypoints: Array<{ lat: number; lng: number; label?: string }>;
  incidents: TrafficIncident[];
  fuelCost: number;
  tollCost: number;
  roadTypes: Array<'highway' | 'main_road' | 'local_road'>;
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT';
  weatherImpact: number; // 0-1 multiplier
}

interface TrafficIncident {
  type: 'accident' | 'construction' | 'congestion' | 'weather' | 'event';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location: { lat: number; lng: number };
  estimatedClearTime?: string;
  detourAvailable: boolean;
}

interface OptimizationResult {
  recommendedRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  optimizationReason: string;
  timeSaved: number;
  costSaved: number;
  confidenceLevel: number;
  lastUpdated: string;
}

interface ProviderRouteOptimizerProps {
  providerId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  preferences?: {
    prioritize: 'time' | 'cost' | 'comfort' | 'eco';
    avoidTolls: boolean;
    avoidHighways: boolean;
    maxDetourTime: number;
  };
  realTimeUpdates?: boolean;
  onRouteSelected?: (route: RouteOption) => void;
  className?: string;
}

export default function ProviderRouteOptimizer({
  providerId,
  origin,
  destination,
  preferences = {
    prioritize: 'time',
    avoidTolls: false,
    avoidHighways: false,
    maxDetourTime: 15
  },
  realTimeUpdates = true,
  onRouteSelected,
  className = ''
}: ProviderRouteOptimizerProps) {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);

  // Optimize routes
  const optimizeRoutes = useCallback(async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/tracking/route-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          origin,
          destination,
          preferences,
          includeTraffic: true,
          includeIncidents: true,
          realTimeData: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize routes');
      }

      const result: OptimizationResult = await response.json();
      setOptimization(result);
      setSelectedRoute(result.recommendedRoute);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Route optimization failed';
      setError(errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  }, [providerId, origin, destination, preferences]);

  // Auto-refresh optimization
  useEffect(() => {
    if (autoRefresh && optimization) {
      const interval = setInterval(optimizeRoutes, 2 * 60 * 1000); // Every 2 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, optimization, optimizeRoutes]);

  // Initial optimization
  useEffect(() => {
    optimizeRoutes();
  }, [optimizeRoutes]);

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    onRouteSelected?.(route);
  };

  const getIncidentIcon = (type: TrafficIncident['type']) => {
    switch (type) {
      case 'accident': return '🚗💥';
      case 'construction': return '🚧';
      case 'congestion': return '🚦';
      case 'weather': return '🌧️';
      case 'event': return '🎉';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity: TrafficIncident['severity']) => {
    switch (severity) {
      case 'LOW': return 'text-yellow-600 bg-yellow-100';
      case 'MEDIUM': return 'text-orange-600 bg-orange-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: RouteOption['difficulty']) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-100';
      case 'DIFFICULT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button 
            onClick={optimizeRoutes} 
            disabled={isOptimizing}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
            Retry Optimization
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Route className="h-5 w-5" />
              <span>Route Optimizer</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Updated {formatDistanceToNow(new Date(lastUpdate))} ago
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeRoutes}
                disabled={isOptimizing}
              >
                <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isOptimizing && !optimization && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600">Optimizing routes...</p>
              </div>
            </div>
          )}

          {optimization && (
            <>
              {/* Optimization Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Optimization Result</h4>
                    <p className="text-sm text-blue-700 mt-1">{optimization.optimizationReason}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {optimization.timeSaved > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {optimization.timeSaved}min
                          </div>
                          <div className="text-xs text-green-700">Time Saved</div>
                        </div>
                      )}
                      {optimization.costSaved > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            NPR {optimization.costSaved}
                          </div>
                          <div className="text-xs text-green-700">Cost Saved</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span>Confidence Level</span>
                        <span>{optimization.confidenceLevel}%</span>
                      </div>
                      <Progress value={optimization.confidenceLevel} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Options */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <Navigation className="h-4 w-4" />
                  <span>Route Options</span>
                </h4>

                {/* Recommended Route */}
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Card className={`border-2 ${selectedRoute?.id === optimization.recommendedRoute.id ? 'border-blue-500' : 'border-green-300'} bg-green-50`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-600 text-white">Recommended</Badge>
                          <span className="font-medium">{optimization.recommendedRoute.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedRoute?.id === optimization.recommendedRoute.id ? 'default' : 'outline'}
                          onClick={() => handleRouteSelect(optimization.recommendedRoute)}
                        >
                          {selectedRoute?.id === optimization.recommendedRoute.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {formatDuration(optimization.recommendedRoute.totalTime)}
                          </div>
                          <div className="text-xs text-gray-600">Total Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {optimization.recommendedRoute.distance.toFixed(1)}km
                          </div>
                          <div className="text-xs text-gray-600">Distance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            NPR {optimization.recommendedRoute.fuelCost + optimization.recommendedRoute.tollCost}
                          </div>
                          <div className="text-xs text-gray-600">Est. Cost</div>
                        </div>
                        <div className="text-center">
                          <Badge className={getDifficultyColor(optimization.recommendedRoute.difficulty)}>
                            {optimization.recommendedRoute.difficulty}
                          </Badge>
                          <div className="text-xs text-gray-600 mt-1">Difficulty</div>
                        </div>
                      </div>

                      {optimization.recommendedRoute.incidents.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Traffic Alerts</h5>
                          {optimization.recommendedRoute.incidents.slice(0, 2).map((incident, index) => (
                            <div key={index} className={`text-xs p-2 rounded-md ${getSeverityColor(incident.severity)}`}>
                              <div className="flex items-center space-x-2">
                                <span>{getIncidentIcon(incident.type)}</span>
                                <span>{incident.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Alternative Routes */}
                <AnimatePresence>
                  {optimization.alternativeRoutes.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${selectedRoute?.id === route.id ? 'border-2 border-blue-500' : 'border-gray-200'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{route.name}</span>
                            <Button
                              size="sm"
                              variant={selectedRoute?.id === route.id ? 'default' : 'outline'}
                              onClick={() => handleRouteSelect(route)}
                            >
                              {selectedRoute?.id === route.id ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {formatDuration(route.totalTime)}
                              </div>
                              <div className="text-xs text-gray-600">Time</div>
                              {route.trafficDelay > 0 && (
                                <div className="text-xs text-red-600">
                                  +{route.trafficDelay}min delay
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {route.distance.toFixed(1)}km
                              </div>
                              <div className="text-xs text-gray-600">Distance</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                NPR {route.fuelCost + route.tollCost}
                              </div>
                              <div className="text-xs text-gray-600">Cost</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-sm font-bold">{route.preferenceScore}</span>
                              </div>
                              <div className="text-xs text-gray-600">Score</div>
                            </div>
                          </div>

                          {route.incidents.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {route.incidents.slice(0, 1).map((incident, incidentIndex) => (
                                <div key={incidentIndex} className={`text-xs p-2 rounded-md ${getSeverityColor(incident.severity)}`}>
                                  <div className="flex items-center space-x-2">
                                    <span>{getIncidentIcon(incident.type)}</span>
                                    <span>{incident.description}</span>
                                  </div>
                                </div>
                              ))}
                              {route.incidents.length > 1 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{route.incidents.length - 1} more alerts
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Selected Route Details */}
              {selectedRoute && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Selected Route Details</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fuel Cost:</span>
                      <span className="ml-2 font-medium">NPR {selectedRoute.fuelCost}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Toll Cost:</span>
                      <span className="ml-2 font-medium">NPR {selectedRoute.tollCost}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weather Impact:</span>
                      <span className="ml-2 font-medium">
                        {selectedRoute.weatherImpact > 1 ? `+${((selectedRoute.weatherImpact - 1) * 100).toFixed(0)}%` : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Road Types:</span>
                      <span className="ml-2 font-medium">
                        {selectedRoute.roadTypes.join(', ')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Auto-refresh toggle */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Auto-refresh routes</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? 'On' : 'Off'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}