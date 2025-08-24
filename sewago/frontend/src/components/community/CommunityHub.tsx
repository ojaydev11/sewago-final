'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Heart, MessageCircle, Share2, TrendingUp, Award, Calendar, MapPin, Clock, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface UserStory {
  _id: string;
  userId: string;
  title: string;
  content: string;
  images: string[];
  rating: number;
  serviceCategory: string;
  location: string;
  likes: string[];
  comments: Array<{
    userId: string;
    content: string;
    timestamp: string;
  }>;
  isVerified: boolean;
  isFeatured: boolean;
  status: string;
  user?: {
    name: string;
    avatarUrl: string;
  };
}

interface ProviderSpotlight {
  _id: string;
  providerId: string;
  title: string;
  description: string;
  achievements: string[];
  specializations: string[];
  images: string[];
  videoUrl: string;
  stats: {
    totalBookings: number;
    averageRating: number;
    responseTime: number;
    completionRate: number;
  };
  isActive: boolean;
  provider?: {
    name: string;
    avatarUrl: string;
    businessName: string;
  };
}

interface CommunityEvent {
  _id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  participants: string[];
  maxParticipants: number;
  rewards: string[];
  status: string;
}

interface SocialProof {
  totalUsers: number;
  totalBookings: number;
  averageRating: number;
  totalReviews: number;
  activeProviders: number;
  citiesCovered: number;
}

export default function CommunityHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stories');
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [providerSpotlights, setProviderSpotlights] = useState<ProviderSpotlight[]>([]);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const [socialProof, setSocialProof] = useState<SocialProof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateSpotlight, setShowCreateSpotlight] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user stories
      const storiesResponse = await fetch('/api/community/stories');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        setUserStories(storiesData.userStories || []);
      }

      // Fetch provider spotlights
      const spotlightsResponse = await fetch('/api/community/spotlights');
      if (spotlightsResponse.ok) {
        const spotlightsData = await spotlightsResponse.json();
        setProviderSpotlights(spotlightsData.spotlights || []);
      }

      // Fetch social proof
      const socialProofResponse = await fetch('/api/community/social-proof');
      if (socialProofResponse.ok) {
        const socialProofData = await socialProofResponse.json();
        setSocialProof(socialProofData.socialProof);
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to fetch community data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      const response = await fetch(`/api/community/stories/${storyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchCommunityData(); // Refresh data
      } else {
        toast.error('Failed to like story');
      }
    } catch (error) {
      console.error('Error liking story:', error);
      toast.error('Failed to like story');
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchCommunityData(); // Refresh data
      } else {
        toast.error('Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const filteredStories = userStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || story.serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredSpotlights = providerSpotlights.filter(spotlight => {
    const matchesSearch = spotlight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spotlight.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || spotlight.specializations.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
        <p className="text-gray-600">Connect, share, and discover amazing service experiences</p>
      </div>

      {/* Social Proof Banner */}
      {socialProof && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{socialProof.totalUsers.toLocaleString()}+</div>
                  <div className="text-sm text-blue-100">Happy Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{socialProof.totalBookings.toLocaleString()}+</div>
                  <div className="text-sm text-blue-100">Services Booked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{socialProof.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-blue-100">Average Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{socialProof.totalReviews.toLocaleString()}+</div>
                  <div className="text-sm text-blue-100">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{socialProof.activeProviders.toLocaleString()}+</div>
                  <div className="text-sm text-blue-100">Active Providers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{socialProof.citiesCovered}+</div>
                  <div className="text-sm text-blue-100">Cities Covered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search stories, spotlights, and events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="cleaning">Cleaning</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="gardening">Gardening</option>
          <option value="carpentry">Carpentry</option>
        </select>

        {user && (
          <Button onClick={() => setShowCreateStory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Share Story
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stories">User Stories</TabsTrigger>
          <TabsTrigger value="spotlights">Provider Spotlights</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {story.user?.avatarUrl ? (
                            <img 
                              src={story.user.avatarUrl} 
                              alt={story.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{story.user?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{story.rating}</span>
                            </div>
                            {story.isVerified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {story.isFeatured && (
                        <Award className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{story.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{story.content}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{story.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeStory(story._id)}
                          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${story.likes.includes(user?.id || '') ? 'fill-current text-red-500' : ''}`} />
                          <span className="text-sm">{story.likes.length}</span>
                        </button>
                        
                        <div className="flex items-center gap-1 text-gray-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{story.comments.length}</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Stories Found</h3>
              <p className="text-gray-500">Be the first to share your experience!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="spotlights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSpotlights.map((spotlight, index) => (
              <motion.div
                key={spotlight._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {spotlight.provider?.avatarUrl ? (
                            <img 
                              src={spotlight.provider.avatarUrl} 
                              alt={spotlight.provider.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{spotlight.provider?.name}</p>
                          <p className="text-sm text-gray-600">{spotlight.provider?.businessName}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{spotlight.title}</h3>
                    <p className="text-gray-600">{spotlight.description}</p>
                    
                    {spotlight.achievements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Achievements:</p>
                        <div className="flex flex-wrap gap-2">
                          {spotlight.achievements.map((achievement, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{spotlight.stats.totalBookings}</div>
                        <div className="text-xs text-gray-600">Total Bookings</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{spotlight.stats.averageRating}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredSpotlights.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Spotlights Yet</h3>
              <p className="text-gray-500">Check back soon for featured providers!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Community Events</h3>
            {user && (
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        event.status === 'UPCOMING' ? 'default' : 
                        event.status === 'ACTIVE' ? 'secondary' : 'outline'
                      }>
                        {event.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{event.type}</span>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {event.participants.length} / {event.maxParticipants || '∞'} participants
                      </span>
                      <span className="text-gray-500">{event.rewards.length} rewards</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleJoinEvent(event._id)}
                      disabled={event.participants.includes(user?.id || '')}
                    >
                      {event.participants.includes(user?.id || '') ? 'Already Joined' : 'Join Event'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {communityEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Scheduled</h3>
              <p className="text-gray-500">Check back soon for upcoming community events!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Contributors
              </CardTitle>
              <CardDescription>Community members with the most engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock leaderboard data */}
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        rank === 1 ? 'bg-yellow-500' : 
                        rank === 2 ? 'bg-gray-400' : 
                        rank === 3 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">User {rank}</p>
                        <p className="text-sm text-gray-500">{100 - rank * 10} stories shared</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{100 - rank * 10}</div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateStory && (
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
              <h3 className="text-lg font-semibold mb-4">Share Your Story</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <Input placeholder="Give your story a catchy title" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience with our services..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Category</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="gardening">Gardening</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input placeholder="City or area" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button className="flex-1">Share Story</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateStory(false)}
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
