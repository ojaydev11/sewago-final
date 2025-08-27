'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Building2, Users, BarChart3, Target, Award, Zap, Globe, Briefcase, ChartLine, Star, Settings, Plus, Eye, Download, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// Mock useAuth hook for development
const useAuth = () => ({ user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } });

interface ProviderTool {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'marketing' | 'operations' | 'finance';
  isActive: boolean;
  usage: number;
  maxUsage: number;
}

interface B2BService {
  id: string;
  name: string;
  description: string;
  category: 'enterprise' | 'wholesale' | 'partnership' | 'api';
  price: number;
  currency: string;
  features: string[];
  isPopular: boolean;
}

interface MarketplaceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

interface GrowthOpportunity {
  id: string;
  title: string;
  description: string;
  potential: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  category: string;
}

export default function GrowthMarketplace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [providerTools, setProviderTools] = useState<ProviderTool[]>([]);
  const [b2bServices, setB2bServices] = useState<B2BService[]>([]);
  const [marketplaceMetrics, setMarketplaceMetrics] = useState<MarketplaceMetric[]>([]);
  const [growthOpportunities, setGrowthOpportunities] = useState<GrowthOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockProviderTools: ProviderTool[] = [
        {
          id: '1',
          name: 'Analytics Dashboard',
          description: 'Comprehensive insights into your service performance',
          category: 'analytics',
          isActive: true,
          usage: 85,
          maxUsage: 100
        },
        {
          id: '2',
          name: 'Marketing Automation',
          description: 'Automate customer outreach and promotions',
          category: 'marketing',
          isActive: true,
          usage: 60,
          maxUsage: 100
        },
        {
          id: '3',
          name: 'Inventory Management',
          description: 'Track supplies and equipment efficiently',
          category: 'operations',
          isActive: false,
          usage: 0,
          maxUsage: 100
        },
        {
          id: '4',
          name: 'Financial Reports',
          description: 'Detailed financial analytics and reporting',
          category: 'finance',
          isActive: true,
          usage: 90,
          maxUsage: 100
        }
      ];

      const mockB2bServices: B2BService[] = [
        {
          id: '1',
          name: 'Enterprise API Access',
          description: 'Full API access for enterprise integrations',
          category: 'enterprise',
          price: 999,
          currency: 'USD',
          features: ['Unlimited API calls', 'Priority support', 'Custom integrations', 'Advanced analytics'],
          isPopular: true
        },
        {
          id: '2',
          name: 'Wholesale Service Packages',
          description: 'Bulk service packages for businesses',
          category: 'wholesale',
          price: 499,
          currency: 'USD',
          features: ['Volume discounts', 'Dedicated account manager', 'Custom scheduling', 'Reporting tools'],
          isPopular: false
        },
        {
          id: '3',
          name: 'Strategic Partnership',
          description: 'Exclusive partnership opportunities',
          category: 'partnership',
          price: 1999,
          currency: 'USD',
          features: ['Exclusive territories', 'Joint marketing', 'Revenue sharing', 'Training programs'],
          isPopular: true
        },
        {
          id: '4',
          name: 'White Label Solution',
          description: 'Custom branded service platform',
          category: 'api',
          price: 2999,
          currency: 'USD',
          features: ['Custom branding', 'Full customization', 'Multi-tenant support', '24/7 support'],
          isPopular: false
        }
      ];

      const mockMetrics: MarketplaceMetric[] = [
        { name: 'Total Revenue', value: 125000, change: 12.5, trend: 'up', unit: 'NPR' },
        { name: 'Active Providers', value: 450, change: 8.2, trend: 'up', unit: '' },
        { name: 'Customer Satisfaction', value: 4.8, change: 2.1, trend: 'up', unit: '/5' },
        { name: 'Service Completion Rate', value: 94.2, change: -1.5, trend: 'down', unit: '%' },
        { name: 'Market Share', value: 23.5, change: 5.8, trend: 'up', unit: '%' },
        { name: 'Average Order Value', value: 2800, change: 3.2, trend: 'up', unit: 'NPR' }
      ];

      const mockOpportunities: GrowthOpportunity[] = [
        {
          id: '1',
          title: 'Expand to New Cities',
          description: 'Launch services in 5 new metropolitan areas',
          potential: 'high',
          effort: 'medium',
          estimatedImpact: 35,
          category: 'Geographic Expansion'
        },
        {
          id: '2',
          title: 'Premium Service Tier',
          description: 'Introduce luxury service packages',
          potential: 'medium',
          effort: 'low',
          estimatedImpact: 20,
          category: 'Service Enhancement'
        },
        {
          id: '3',
          title: 'B2B Partnerships',
          description: 'Form strategic partnerships with corporate clients',
          potential: 'high',
          effort: 'high',
          estimatedImpact: 45,
          category: 'Business Development'
        },
        {
          id: '4',
          title: 'Mobile App Launch',
          description: 'Develop native mobile applications',
          potential: 'medium',
          effort: 'high',
          estimatedImpact: 25,
          category: 'Technology'
        }
      ];

      setProviderTools(mockProviderTools);
      setB2bServices(mockB2bServices);
      setMarketplaceMetrics(mockMetrics);
      setGrowthOpportunities(mockOpportunities);

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast.error('Failed to fetch marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToolStatus = (toolId: string) => {
    setProviderTools(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
    ));
    toast.success('Tool status updated');
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPotentialColor = (potential: 'low' | 'medium' | 'high') => {
    switch (potential) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
    }
  };

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth & Marketplace</h1>
        <p className="text-gray-600">Provider tools, B2B services, and marketplace growth opportunities</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="provider-tools">Provider Tools</TabsTrigger>
          <TabsTrigger value="b2b-services">B2B Services</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketplaceMetrics.slice(0, 3).map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
                      {metric.name}
                      {getTrendIcon(metric.trend)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value.toLocaleString()}{metric.unit}
                    </div>
                    <div className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from last month
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access frequently used tools and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Customers</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Briefcase className="w-6 h-6" />
                  <span className="text-sm">Services</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Settings className="w-6 h-6" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Growth Opportunities Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Growth Opportunities
              </CardTitle>
              <CardDescription>High-impact opportunities to grow your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {growthOpportunities.slice(0, 3).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                      <p className="text-sm text-gray-600">{opportunity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPotentialColor(opportunity.potential)}>
                        {opportunity.potential} potential
                      </Badge>
                      <Badge className={getEffortColor(opportunity.effort)}>
                        {opportunity.effort} effort
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setActiveTab('growth')}>
                  View All Opportunities
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Provider Tools
                  </CardTitle>
                  <CardDescription>Professional tools to help you grow your business</CardDescription>
                </div>
                <Button onClick={() => setShowAddTool(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{tool.name}</h4>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{tool.category}</Badge>
                        <Button
                          variant={tool.isActive ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleToolStatus(tool.id)}
                        >
                          {tool.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{tool.usage}</div>
                        <div className="text-xs text-gray-600">Current Usage</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{tool.maxUsage}</div>
                        <div className="text-xs text-gray-600">Max Usage</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {Math.round((tool.usage / tool.maxUsage) * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">Utilization</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {tool.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="text-xs text-gray-600">Status</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="b2b-services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    B2B Services
                  </CardTitle>
                  <CardDescription>Enterprise solutions and business partnerships</CardDescription>
                </div>
                <Button onClick={() => setShowAddService(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {b2bServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`h-full ${service.isPopular ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          {service.isPopular && (
                            <Badge className="bg-blue-600 text-white">Popular</Badge>
                          )}
                        </div>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {service.price.toLocaleString()} {service.currency}
                          </div>
                          <div className="text-sm text-gray-600">per month</div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Features:</h5>
                          <ul className="space-y-1">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Learn More
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Sales
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="w-5 h-5" />
                Growth Opportunities
              </CardTitle>
              <CardDescription>Strategic opportunities to expand your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growthOpportunities.map((opportunity) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{opportunity.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge className={getPotentialColor(opportunity.potential)}>
                            {opportunity.potential} potential
                          </Badge>
                          <Badge className={getEffortColor(opportunity.effort)}>
                            {opportunity.effort} effort
                          </Badge>
                          <Badge variant="outline">{opportunity.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          +{opportunity.estimatedImpact}%
                        </div>
                        <div className="text-sm text-gray-600">Estimated Impact</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Growth Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>Track your growth metrics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Revenue Growth</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium">+15.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Month:</span>
                      <span className="font-medium">+8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quarter:</span>
                      <span className="font-medium">+23.1%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Market Expansion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Cities:</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Services:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partnerships:</span>
                      <span className="font-medium">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            toast.success('Growth features activated!');
          }}
        >
          <TrendingUp className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
}
