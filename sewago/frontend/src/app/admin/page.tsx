"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Textarea, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Loader2, Briefcase, Users, DollarSign, TrendingUp, Eye, EyeOff } from 'lucide-react';

interface Service {
  _id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  basePrice: number;
  image?: string;
  active: boolean;
  createdAt: string;
}

interface ProviderProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    district?: string;
  };
  skills: string[];
  bio?: string;
  ratingAvg: number;
  jobsCompleted: number;
  verified: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  providerId?: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface AdminStats {
  totalServices: number;
  totalProviders: number;
  totalCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  
  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: '',
    shortDesc: '',
    longDesc: '',
    basePrice: 0,
    image: '',
    active: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchServices(),
        fetchProviders(),
        fetchBookings(),
        fetchStats()
      ]);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    const response = await fetch('/api/admin/services');
    if (response.ok) {
      const data = await response.json();
      setServices(data.services || []);
    }
  };

  const fetchProviders = async () => {
    const response = await fetch('/api/admin/providers');
    if (response.ok) {
      const data = await response.json();
      setProviders(data.providers || []);
    }
  };

  const fetchBookings = async () => {
    const response = await fetch('/api/admin/bookings');
    if (response.ok) {
      const data = await response.json();
      setBookings(data.bookings || []);
    }
  };

  const fetchStats = async () => {
    const response = await fetch('/api/admin/stats');
    if (response.ok) {
      const data = await response.json();
      setStats(data.stats);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService ? `/api/admin/services/${editingService._id}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });

      if (!response.ok) throw new Error('Failed to save service');
      
      setSuccessMessage(`Service ${editingService ? 'updated' : 'created'} successfully`);
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({
        name: '',
        category: '',
        shortDesc: '',
        longDesc: '',
        basePrice: 0,
        image: '',
        active: true
      });
      
      fetchServices();
      fetchStats();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to save service');
      console.error('Error saving service:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      category: service.category,
      shortDesc: service.shortDesc,
      longDesc: service.longDesc,
      basePrice: service.basePrice,
      image: service.image || '',
      active: service.active
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      setSuccessMessage('Service deleted successfully');
      fetchServices();
      fetchStats();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete service');
      console.error('Error deleting service:', error);
    }
  };

  const toggleProviderVerification = async (providerId: string, currentVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified }),
      });

      if (!response.ok) throw new Error('Failed to update verification status');
      
      setSuccessMessage(`Provider ${!currentVerified ? 'verified' : 'unverified'} successfully`);
      fetchProviders();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to update verification status');
      console.error('Error updating verification:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, text: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage services, providers, and monitor platform activity</p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                {successMessage}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalServices || 0}</div>
                <p className="text-xs text-muted-foreground">Active services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProviders || 0}</div>
                <p className="text-xs text-muted-foreground">Registered providers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats?.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">Platform revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{booking.serviceId.name}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customerId.name} • {new Date(booking.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Services</h3>
                <Button onClick={() => setShowServiceForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </div>

              {/* Service Form */}
              {showServiceForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
                    <CardDescription>
                      {editingService ? 'Update service information' : 'Create a new service for the platform'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Service Name</Label>
                          <Input
                            id="name"
                            value={serviceForm.name}
                            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={serviceForm.category}
                            onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="shortDesc">Short Description</Label>
                        <Input
                          id="shortDesc"
                          value={serviceForm.shortDesc}
                          onChange={(e) => setServiceForm({ ...serviceForm, shortDesc: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="longDesc">Long Description</Label>
                        <Textarea
                          id="longDesc"
                          value={serviceForm.longDesc}
                          onChange={(e) => setServiceForm({ ...serviceForm, longDesc: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="basePrice">Base Price (₹)</Label>
                          <Input
                            id="basePrice"
                            type="number"
                            value={serviceForm.basePrice}
                            onChange={(e) => setServiceForm({ ...serviceForm, basePrice: Number(e.target.value) })}
                            required
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="image">Image URL</Label>
                          <Input
                            id="image"
                            value={serviceForm.image}
                            onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="active"
                          checked={serviceForm.active}
                          onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingService ? 'Update Service' : 'Create Service'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowServiceForm(false);
                            setEditingService(null);
                            setServiceForm({
                              name: '',
                              category: '',
                              shortDesc: '',
                              longDesc: '',
                              basePrice: 0,
                              image: '',
                              active: true
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Services Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service._id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{service.category}</TableCell>
                          <TableCell>₹{service.basePrice}</TableCell>
                          <TableCell>
                            <Badge variant={service.active ? 'default' : 'secondary'}>
                              {service.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteService(service._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Providers Tab */}
            <TabsContent value="providers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Management</CardTitle>
                  <CardDescription>Manage provider verification and profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div key={provider._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{provider.userId.name}</p>
                            <p className="text-sm text-gray-600">{provider.userId.email}</p>
                            <p className="text-sm text-gray-600">
                              {provider.userId.district} • {provider.skills.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Rating: {provider.ratingAvg.toFixed(1)}</p>
                            <p className="text-sm text-gray-600">Jobs: {provider.jobsCompleted}</p>
                          </div>
                          <Button
                            variant={provider.verified ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => toggleProviderVerification(provider._id, provider.verified)}
                            className="flex items-center gap-2"
                          >
                            {provider.verified ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Verify
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


