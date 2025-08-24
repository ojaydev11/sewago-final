'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, Star, Users, BarChart3, Settings, FileText, Flag, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface QualityMetric {
  metricName: string;
  metricType: string;
  target: number;
  current: number;
  unit: string;
  weight: number;
}

interface ProviderQualityScore {
  _id: string;
  providerId: string;
  overallScore: number;
  categoryScores: Array<{
    category: string;
    score: number;
    weight: number;
  }>;
  status: string;
  provider?: {
    name: string;
    avatarUrl: string;
    businessName: string;
  };
}

interface QualityIncident {
  _id: string;
  bookingId: string;
  incidentType: string;
  severity: string;
  description: string;
  status: string;
  reportedAt: string;
  resolution?: {
    action: string;
    compensation: string;
    resolvedAt: string;
  };
}

interface ServiceGuarantee {
  _id: string;
  serviceId: string;
  guaranteeType: string;
  description: string;
  terms: string;
  validityHours: number;
  compensation: {
    type: string;
    amount: number;
    percentage: number;
  };
}

export default function QualityControlDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [providerScores, setProviderScores] = useState<ProviderQualityScore[]>([]);
  const [qualityIncidents, setQualityIncidents] = useState<QualityIncident[]>([]);
  const [serviceGuarantees, setServiceGuarantees] = useState<ServiceGuarantee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportIncident, setShowReportIncident] = useState(false);
  const [showCreateGuarantee, setShowCreateGuarantee] = useState(false);

  useEffect(() => {
    fetchQualityData();
  }, []);

  const fetchQualityData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch quality metrics
      const metricsResponse = await fetch('/api/quality/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setQualityMetrics(metricsData.metrics || []);
      }

      // Fetch provider quality scores
      const scoresResponse = await fetch('/api/quality/provider-scores');
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        setProviderScores(scoresData.scores || []);
      }

      // Fetch service guarantees
      const guaranteesResponse = await fetch('/api/quality/guarantees');
      if (guaranteesResponse.ok) {
        const guaranteesData = await guaranteesResponse.json();
        setServiceGuarantees(guaranteesData.guarantees || []);
      }

    } catch (error) {
      console.error('Error fetching quality data:', error);
      toast.error('Failed to fetch quality data');
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800';
      case 'ESCALATED':
        return 'bg-purple-100 text-purple-800';
      case 'REPORTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGuaranteeTypeColor = (type: string) => {
    switch (type) {
      case 'SATISFACTION':
        return 'bg-blue-100 text-blue-800';
      case 'TIMELINESS':
        return 'bg-green-100 text-green-800';
      case 'QUALITY':
        return 'bg-purple-100 text-purple-800';
      case 'PRICE_MATCH':
        return 'bg-yellow-100 text-yellow-800';
      case 'REWORK':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Control Dashboard</h1>
        <p className="text-gray-600">Monitor service quality, track metrics, and manage guarantees</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="providers">Provider Scores</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="guarantees">Service Guarantees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quality Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Overall Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {qualityMetrics.length > 0 
                    ? Math.round(qualityMetrics.reduce((sum, metric) => sum + (metric.current / metric.target) * 100, 0) / qualityMetrics.length)
                    : 0}%
                </div>
                <p className="text-blue-100 text-sm">Based on all metrics</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Active Guarantees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{serviceGuarantees.length}</div>
                <p className="text-green-100 text-sm">Service guarantees active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Open Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {qualityIncidents.filter(incident => incident.status !== 'RESOLVED').length}
                </div>
                <p className="text-orange-100 text-sm">Requiring attention</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {providerScores.filter(score => score.status !== 'SUSPENDED').length}
                </div>
                <p className="text-purple-100 text-sm">Meeting quality standards</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage quality control operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowReportIncident(true)}
                  className="w-full h-12"
                  variant="outline"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
                
                <Button 
                  onClick={() => setShowCreateGuarantee(true)}
                  className="w-full h-12"
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Create Guarantee
                </Button>
                
                <Button 
                  className="w-full h-12"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quality Metrics
              </CardTitle>
              <CardDescription>Track key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {qualityMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.metricName}</h4>
                        <p className="text-sm text-gray-500">Target: {metric.target} {metric.unit}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getMetricColor(metric.current, metric.target)}`}>
                          {metric.current} {metric.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((metric.current / metric.target) * 100)}% of target
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Weight: {Math.round(metric.weight * 100)}%</span>
                      <span>Type: {metric.metricType.replace('_', ' ')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Provider Quality Scores
              </CardTitle>
              <CardDescription>Monitor provider performance and quality ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerScores.map((score, index) => (
                  <motion.div
                    key={score._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {score.provider?.avatarUrl ? (
                            <img 
                              src={score.provider.avatarUrl} 
                              alt={score.provider.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{score.provider?.name || 'Unknown Provider'}</p>
                          <p className="text-sm text-gray-500">{score.provider?.businessName}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{score.overallScore}</div>
                        <Badge className={getStatusColor(score.status)}>
                          {score.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {score.categoryScores.map((category, idx) => (
                        <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{category.score}</div>
                          <div className="text-xs text-gray-600">{category.category}</div>
                          <div className="text-xs text-gray-500">Weight: {Math.round(category.weight * 100)}%</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                
                {providerScores.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No provider quality scores available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Quality Incidents
              </CardTitle>
              <CardDescription>Track and resolve quality issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityIncidents.map((incident, index) => (
                  <motion.div
                    key={incident._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(incident.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">
                      {incident.incidentType.replace('_', ' ')}
                    </h4>
                    <p className="text-gray-600 mb-3">{incident.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Booking ID: {incident.bookingId}</span>
                      {incident.resolution && (
                        <div className="text-right">
                          <p className="text-green-600 font-medium">Resolved</p>
                          <p className="text-gray-500">{incident.resolution.action}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {qualityIncidents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No quality incidents reported
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guarantees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Service Guarantees
              </CardTitle>
              <CardDescription>Manage service quality guarantees and policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceGuarantees.map((guarantee, index) => (
                  <motion.div
                    key={guarantee._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getGuaranteeTypeColor(guarantee.guaranteeType)}>
                          {guarantee.guaranteeType.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Valid for {guarantee.validityHours} hours
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{guarantee.description}</h4>
                    {guarantee.terms && (
                      <p className="text-gray-600 mb-3 text-sm">{guarantee.terms}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">
                          Compensation: {guarantee.compensation.type}
                        </span>
                        {guarantee.compensation.amount > 0 && (
                          <span className="text-gray-500">
                            Amount: {guarantee.compensation.amount}
                          </span>
                        )}
                        {guarantee.compensation.percentage > 0 && (
                          <span className="text-gray-500">
                            Percentage: {guarantee.compensation.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {serviceGuarantees.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No service guarantees configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Incident Modal */}
      <AnimatePresence>
        {showReportIncident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">Report Quality Incident</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter booking ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select incident type</option>
                    <option value="LATE_ARRIVAL">Late Arrival</option>
                    <option value="POOR_QUALITY">Poor Quality</option>
                    <option value="INCOMPLETE_SERVICE">Incomplete Service</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="UNPROFESSIONAL_BEHAVIOR">Unprofessional Behavior</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select severity</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the incident in detail..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button className="flex-1">Report Incident</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReportIncident(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
