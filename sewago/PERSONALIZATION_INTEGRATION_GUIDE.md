# SewaGo AI-Powered Personalization Engine - Integration Guide

## 🎯 Overview

This document provides a comprehensive guide for integrating and using SewaGo's advanced AI-powered personalization engine. The system provides smart recommendations, custom dashboards, location-based suggestions, and ML-driven user experience optimization.

## 🏗️ Architecture Overview

### Core Components

1. **Recommendation Engine** (`/src/lib/personalization/recommendation-engine.ts`)
   - Multi-algorithm ML recommendation system
   - Collaborative, content-based, location, seasonal, and hybrid filtering
   - Real-time caching and performance optimization

2. **Database Models** (Prisma Schema)
   - UserPreferences: User preference storage
   - UserBehavior: Behavior tracking for ML learning
   - PersonalizationInsights: ML-generated user insights
   - RecommendationLog: Recommendation effectiveness tracking
   - LocationInsights: Area-specific service insights

3. **API Routes** (`/src/app/api/personalization/`)
   - `/recommendations`: Personalized service and provider recommendations
   - `/dashboard`: Complete personalized dashboard data
   - `/preferences`: User preference management
   - `/behavior`: User behavior tracking
   - `/insights`: Personal usage analytics

4. **React Components**
   - PersonalizedDashboard: Main personalized user interface
   - SmartServiceGrid: AI-curated service browser
   - RecommendationCarousel: Rotating personalized suggestions
   - PreferenceOnboarding: Initial user preference collection

5. **Hooks** (`/src/hooks/usePersonalization.ts`)
   - usePersonalization: Main personalization hook
   - useRecommendations: Service recommendations
   - usePersonalizedDashboard: Dashboard data
   - useUserPreferences: Preference management

## 🚀 Quick Start Integration

### 1. Database Setup

The Prisma schema is already updated with personalization models. Run migrations:

```bash
cd sewago/frontend
npx prisma generate
npx prisma db push
```

### 2. Basic Component Integration

#### Personalized Dashboard
```tsx
import { PersonalizedDashboard } from '@/components/personalization/PersonalizedDashboard';

function UserDashboard({ userId }: { userId: string }) {
  return (
    <PersonalizedDashboard
      userId={userId}
      onActionClick={(action, data) => {
        // Handle user actions (view service, book service, etc.)
        console.log('Action:', action, 'Data:', data);
      }}
    />
  );
}
```

#### Smart Service Grid
```tsx
import { SmartServiceGrid } from '@/components/personalization/SmartServiceGrid';

function ServicesPage({ userId }: { userId: string }) {
  return (
    <SmartServiceGrid
      userId={userId}
      initialFilter={{
        algorithm: 'hybrid',
        location: { lat: 27.7172, lng: 85.3240, area: 'Kathmandu' },
        budget: { min: 500, max: 5000 },
      }}
      onServiceSelect={(service) => {
        // Navigate to service details
        router.push(`/services/${service.id}`);
      }}
      onServiceBook={(service) => {
        // Navigate to booking flow
        router.push(`/book/${service.id}`);
      }}
    />
  );
}
```

#### Recommendation Carousel
```tsx
import { RecommendationCarousel } from '@/components/personalization/RecommendationCarousel';

function Homepage({ userId }: { userId: string }) {
  return (
    <div>
      {/* Services Carousel */}
      <RecommendationCarousel
        userId={userId}
        type="services"
        autoPlay={true}
        itemsPerView={3}
        onItemClick={(item) => router.push(`/services/${item.id}`)}
      />

      {/* Mixed Content Carousel */}
      <RecommendationCarousel
        userId={userId}
        type="mixed"
        autoPlay={false}
        itemsPerView={4}
        onItemClick={(item, type) => {
          if (type === 'service') router.push(`/services/${item.id}`);
          if (type === 'provider') router.push(`/providers/${item.id}`);
          if (type === 'offer') handleOfferClick(item);
        }}
      />
    </div>
  );
}
```

### 3. User Behavior Tracking

```tsx
import { usePersonalization } from '@/hooks/usePersonalization';

function ServiceCard({ service, userId }: { service: Service; userId: string }) {
  const { trackServiceView, trackClick } = usePersonalization(userId);
  
  useEffect(() => {
    // Track when user views this service
    const timer = setTimeout(() => {
      trackServiceView(service.id, service.category, 3000); // 3 seconds viewed
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [service.id]);

  return (
    <div 
      onClick={() => {
        trackClick('service_card', service.id, service.category);
        // Navigate to service details
      }}
    >
      {/* Service content */}
    </div>
  );
}
```

### 4. Preference Onboarding

```tsx
import { PreferenceOnboarding } from '@/components/personalization/PreferenceOnboarding';

function WelcomeScreen({ userId }: { userId: string }) {
  return (
    <PreferenceOnboarding
      userId={userId}
      onComplete={() => {
        // Redirect to dashboard or home
        router.push('/dashboard');
      }}
      onSkip={() => {
        // User chose to skip onboarding
        router.push('/home');
      }}
    />
  );
}
```

## 🎛️ Advanced Usage

### Custom Recommendation Algorithms

```tsx
import { useRecommendations } from '@/hooks/usePersonalization';

function CustomRecommendations({ userId }: { userId: string }) {
  const { recommendations, loading, refresh } = useRecommendations(userId, {
    algorithm: 'collaborative', // or 'content', 'location', 'seasonal', 'hybrid'
    context: {
      currentLocation: { lat: 27.7172, lng: 85.3240 },
      timeOfDay: 'morning',
      urgency: 'high',
      budget: { min: 1000, max: 3000 }
    },
    filters: {
      categories: ['cleaning', 'maintenance'],
      minRating: 4.0,
      maxDistance: 5000
    },
    limit: 15
  });

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div>
      <h2>Smart Recommendations</h2>
      <button onClick={refresh}>Refresh</button>
      
      <div className="grid grid-cols-3 gap-4">
        {recommendations.services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
```

### Real-time Behavior Tracking

```tsx
import { usePersonalization } from '@/hooks/usePersonalization';

function SearchPage({ userId }: { userId: string }) {
  const { trackSearch, trackClick } = usePersonalization(userId);
  
  const handleSearch = (query: string) => {
    trackSearch(query, 'general');
    // Perform search...
  };
  
  const handleFilterClick = (filterType: string) => {
    trackClick('filter', undefined, filterType);
    // Apply filter...
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <FilterButtons onFilterClick={handleFilterClick} />
    </div>
  );
}
```

## 🔧 API Integration

### Direct API Usage

```typescript
// Get personalized recommendations
const getRecommendations = async (userId: string) => {
  const response = await fetch(`/api/personalization/recommendations?userId=${userId}&algorithm=hybrid&limit=10`);
  const result = await response.json();
  
  if (result.success) {
    return result.data; // { services: [], providers: [] }
  }
};

// Get dashboard data
const getDashboardData = async (userId: string) => {
  const response = await fetch(`/api/personalization/dashboard?userId=${userId}`);
  const result = await response.json();
  
  if (result.success) {
    return result.data; // Complete dashboard data
  }
};

// Update user preferences
const updatePreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  const response = await fetch('/api/personalization/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, preferences })
  });
  
  return response.json();
};

// Track user behavior
const trackBehavior = async (behavior: UserBehavior) => {
  await fetch('/api/personalization/behavior', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(behavior)
  });
};
```

## 🌍 Localization Integration

The system supports both English and Nepali localization. All personalization strings are added to the message files:

**English messages (`messages/en.json`)**:
```json
{
  "personalization": {
    "dashboard": {
      "welcome": "Welcome, {name}!",
      "recommendedServices": "Recommended for You"
    },
    "algorithms": {
      "hybrid": "Smart Mix",
      "collaborative": "Similar Users"
    }
  }
}
```

**Nepali messages (`messages/ne.json`)**:
```json
{
  "personalization": {
    "dashboard": {
      "welcome": "स्वागतम्, {name}!",
      "recommendedServices": "तपाईंको लागि सिफारिसी"
    },
    "algorithms": {
      "hybrid": "स्मार्ट मिक्स",
      "collaborative": "समान प्रयोगकर्ताहरू"
    }
  }
}
```

## 🎨 Styling and Theming

All components use Tailwind CSS and shadcn/ui components for consistent styling:

```tsx
import { cn } from '@/lib/utils';

function CustomPersonalizedCard({ className, ...props }) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      {/* Content */}
    </Card>
  );
}
```

## 📊 Performance Optimization

### Caching Strategy
- Recommendations cached for 15 minutes
- User preferences cached until update
- Behavior tracking batched every 2 seconds
- Database queries optimized with proper indexing

### Performance Monitoring
```typescript
import { usePersonalizationExperiment } from '@/hooks/usePersonalization';

function FeatureComponent({ userId }: { userId: string }) {
  const { variant, trackExperimentEvent } = usePersonalizationExperiment('new_recommendation_ui', userId);
  
  useEffect(() => {
    trackExperimentEvent('component_loaded');
  }, []);
  
  if (variant === 'treatment') {
    return <NewRecommendationUI />;
  }
  
  return <OldRecommendationUI />;
}
```

## 🔐 Security and Privacy

### Data Protection
- All user behavior is anonymized after 90 days
- Preferences can be deleted by users
- GDPR-compliant data handling
- Secure API endpoints with proper authentication

### Privacy Controls
```typescript
// User can control data usage
const updatePrivacySettings = async (userId: string, settings: PrivacySettings) => {
  await fetch('/api/personalization/privacy', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, settings })
  });
};
```

## 🧪 Testing and Quality Assurance

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { PersonalizedDashboard } from '@/components/personalization/PersonalizedDashboard';

test('renders personalized dashboard with user data', async () => {
  render(<PersonalizedDashboard userId="test-user" />);
  
  expect(screen.getByText(/Welcome,/)).toBeInTheDocument();
  expect(screen.getByText(/Recommended for You/)).toBeInTheDocument();
});
```

### API Testing
```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/personalization/recommendations/route';

test('returns personalized recommendations', async () => {
  await testApiHandler({
    handler,
    url: '/api/personalization/recommendations?userId=test&algorithm=hybrid',
    test: async ({ fetch }) => {
      const res = await fetch();
      const data = await res.json();
      
      expect(data.success).toBe(true);
      expect(data.data.services).toBeDefined();
      expect(data.data.providers).toBeDefined();
    }
  });
});
```

## 📈 Analytics and Monitoring

### Key Metrics to Track
- Recommendation click-through rate
- User engagement with personalized content
- Preference completion rate
- Service booking conversion from recommendations

### Monitoring Dashboard Integration
```typescript
// Track personalization effectiveness
const trackRecommendationMetrics = async (userId: string, metrics: PersonalizationMetrics) => {
  await fetch('/api/analytics/personalization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, metrics, timestamp: new Date() })
  });
};
```

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Add to .env.local
PERSONALIZATION_CACHE_TTL=900000  # 15 minutes
PERSONALIZATION_ML_ENDPOINT=https://ml-api.sewago.com
BEHAVIOR_BATCH_SIZE=10
RECOMMENDATION_MAX_ITEMS=50
```

### Performance Targets
- Recommendation API response time: < 200ms
- Dashboard load time: < 3 seconds
- Behavior tracking latency: < 50ms
- Cache hit rate: > 80%

## 🔄 Migration Guide

### Existing Users
1. Run database migrations to add personalization tables
2. Implement user preference collection flow
3. Gradually enable personalized features
4. Monitor user engagement and feedback

### Data Migration
```sql
-- Create default preferences for existing users
INSERT INTO UserPreferences (userId, preferredCategories, budgetRange, languagePreference)
SELECT id, ARRAY['cleaning', 'maintenance'], '{"min": 1000, "max": 5000}', 'en'
FROM User 
WHERE id NOT IN (SELECT userId FROM UserPreferences);
```

## 📞 Support and Troubleshooting

### Common Issues

1. **Recommendations not loading**
   - Check user has preferences set
   - Verify API endpoint is accessible
   - Check database connections

2. **Behavior tracking not working**
   - Ensure proper userId is provided
   - Check network requests in browser console
   - Verify batch timeout settings

3. **Poor recommendation quality**
   - Check if user has sufficient behavior data
   - Verify ML algorithms are functioning
   - Review user feedback and adjust weights

### Debug Mode
```typescript
// Enable debug logging
const DEBUG_PERSONALIZATION = process.env.NODE_ENV === 'development';

if (DEBUG_PERSONALIZATION) {
  console.log('Personalization Debug:', {
    userId,
    algorithm,
    recommendations: recommendations.length,
    processingTime: Date.now() - startTime
  });
}
```

## 🎯 Future Enhancements

### Planned Features
- Voice-based preference input
- Image recognition for service categorization
- Advanced cultural event integration
- Multi-language ML model support
- Real-time collaborative filtering
- Augmented reality service preview

### Experimental Features
- Neural collaborative filtering
- Graph-based recommendation networks
- Reinforcement learning for optimal timing
- Cross-platform behavior synchronization

---

## 📝 Implementation Checklist

- [ ] Database migrations completed
- [ ] API routes tested and functional
- [ ] Components integrated into existing pages
- [ ] User behavior tracking implemented
- [ ] Preference onboarding flow added
- [ ] Localization messages updated
- [ ] Performance monitoring in place
- [ ] Security review completed
- [ ] User testing conducted
- [ ] Documentation updated

## 🎉 Conclusion

The SewaGo AI-Powered Personalization Engine provides a comprehensive solution for creating personalized user experiences. With its multi-algorithm ML approach, real-time behavior tracking, and cultural sensitivity, it delivers highly relevant recommendations while maintaining user privacy and system performance.

For technical support or questions, please contact the development team or refer to the detailed API documentation.