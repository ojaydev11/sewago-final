# SewaGo Real-time Notification System

This document describes the comprehensive real-time notification system implemented for SewaGo, providing users with instant updates about their bookings, payments, verifications, and other important activities.

## 🚀 Features

### Core Functionality
- **Real-time Notifications**: Instant delivery via WebSocket connections
- **Multiple Delivery Methods**: In-app, push, email, and SMS notifications
- **Rich Content**: Support for actions, data payloads, and priority levels
- **Scheduling**: Future-dated and recurring notifications
- **Quiet Hours**: Configurable do-not-disturb periods
- **Push Notifications**: Browser push notifications with service worker support

### Notification Types
- **Booking**: Status updates, confirmations, reminders
- **Payment**: Transaction confirmations, failed payments, refunds
- **Verification**: Document verification status, approval/rejection
- **System**: Platform updates, maintenance notices
- **Promotional**: Offers, discounts, new services
- **Reminder**: Scheduled reminders, follow-ups

### Priority Levels
- **Low**: Informational updates
- **Medium**: Standard notifications
- **High**: Important updates requiring attention
- **Urgent**: Critical notifications requiring immediate action

## 🏗️ Architecture

### Backend Components
```
src/
├── models/
│   └── Notification.ts          # Mongoose schema and interface
├── lib/
│   └── notificationService.ts   # Core notification logic
└── app/api/notifications/
    ├── route.ts                 # Main notifications API
    ├── [id]/route.ts           # Individual notification actions
    ├── mark-all-read/route.ts  # Bulk mark as read
    └── stats/route.ts          # Notification statistics
```

### Frontend Components
```
src/
├── hooks/
│   └── useNotifications.ts     # React hook for notifications
├── components/
│   ├── NotificationBell.tsx    # Notification dropdown
│   ├── NotificationSettings.tsx # Settings management
│   └── ui/
│       ├── toast.tsx           # Toast notifications
│       ├── progress.tsx        # Progress bars
│       └── alert.tsx           # Alert components
├── contexts/
│   └── NotificationContext.tsx # Global notification state
├── lib/
│   └── pushNotificationService.ts # Push notification management
└── app/
    ├── notifications/page.tsx  # Notifications page
    └── settings/notifications/page.tsx # Settings page
```

## 🔧 Setup & Configuration

### Environment Variables
```bash
# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# Database
MONGODB_URI=your_mongodb_connection_string
```

### Dependencies
```json
{
  "socket.io-client": "^4.8.1",
  "date-fns": "^3.6.0",
  "@heroicons/react": "^2.2.0"
}
```

## 📱 Usage

### Basic Notification Creation
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { createNotification } = useNotifications();

// Create a simple notification
await createNotification({
  type: 'booking',
  title: 'Booking Confirmed',
  message: 'Your service booking has been confirmed',
  priority: 'medium',
  category: 'success',
  data: { bookingId: '123' },
  actionUrl: '/bookings/123',
  actionText: 'View Details'
});
```

### Real-time Updates
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, isConnected } = useNotifications();

// Notifications automatically update in real-time
// Check connection status
if (isConnected) {
  console.log('Real-time notifications active');
}
```

### Push Notifications
```typescript
import { pushNotificationService } from '@/lib/pushNotificationService';

// Enable push notifications
const enabled = await pushNotificationService.enable();

// Check status
const isEnabled = await pushNotificationService.isEnabled();
```

## 🔌 API Endpoints

### GET /api/notifications
Fetch user notifications with filtering and pagination.

**Query Parameters:**
- `type`: Notification type filter
- `priority`: Priority level filter
- `category`: Category filter
- `read`: Read status filter (true/false)
- `limit`: Number of notifications to return (max 100)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 150,
    "unreadCount": 25
  }
}
```

### POST /api/notifications
Create a new notification.

**Request Body:**
```json
{
  "type": "booking",
  "title": "Booking Confirmed",
  "message": "Your service has been confirmed",
  "priority": "medium",
  "category": "success",
  "data": { "bookingId": "123" },
  "actionUrl": "/bookings/123",
  "actionText": "View Details",
  "deliveryMethods": ["in_app", "push"],
  "scheduledFor": "2024-01-01T10:00:00Z",
  "expiresAt": "2024-01-08T10:00:00Z"
}
```

### PATCH /api/notifications/[id]
Update notification status.

**Request Body:**
```json
{
  "action": "markAsRead" // or "markAsClicked"
}
```

### DELETE /api/notifications/[id]
Delete a notification.

### POST /api/notifications/mark-all-read
Mark all notifications as read.

### GET /api/notifications/stats
Get notification statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 25,
    "byType": {
      "booking": 50,
      "payment": 30,
      "verification": 20
    },
    "byPriority": {
      "low": 40,
      "medium": 80,
      "high": 25,
      "urgent": 5
    }
  }
}
```

## 🔄 WebSocket Events

### Client to Server
- `join:user` - Join user notification room
- `notification:subscribe` - Subscribe to notifications
- `notification:unsubscribe` - Unsubscribe from notifications

### Server to Client
- `notification:new` - New notification received
- `notification:update` - Notification updated
- `notification:delete` - Notification deleted

## 🎨 UI Components

### NotificationBell
A dropdown component showing recent notifications with:
- Unread count badge
- Real-time updates
- Action buttons
- Priority indicators
- Connection status

### NotificationSettings
Comprehensive settings management for:
- Delivery method preferences
- Notification type filters
- Push notification toggle
- Quiet hours configuration

### Toast Notifications
In-app toast notifications for:
- Success messages
- Error alerts
- Warning notifications
- Information updates

## 🚀 Advanced Features

### Scheduled Notifications
```typescript
// Create a notification for future delivery
await createNotification({
  type: 'reminder',
  title: 'Service Reminder',
  message: 'Your service is scheduled for tomorrow',
  scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  deliveryMethods: ['in_app', 'push']
});
```

### Bulk Operations
```typescript
// Mark multiple notifications as read
const selectedIds = ['1', '2', '3'];
await Promise.all(selectedIds.map(id => markAsRead(id)));

// Delete multiple notifications
await Promise.all(selectedIds.map(id => deleteNotification(id)));
```

### Quiet Hours
```typescript
// Configure quiet hours (10 PM - 8 AM)
const preferences = {
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
};
```

## 🔒 Security & Privacy

### Authentication
- All notification endpoints require valid user session
- Users can only access their own notifications
- Role-based access control for admin functions

### Data Privacy
- Personal data is encrypted in transit
- Notifications expire automatically
- Users can delete notifications permanently
- GDPR-compliant data handling

## 📊 Performance & Scalability

### Database Optimization
- Indexed queries for fast retrieval
- Pagination support for large datasets
- Automatic cleanup of expired notifications

### Real-time Performance
- WebSocket connection pooling
- Efficient room-based broadcasting
- Connection health monitoring
- Automatic reconnection handling

### Caching Strategy
- In-memory caching for active users
- Redis support for horizontal scaling
- Optimistic updates for better UX

## 🧪 Testing

### Unit Tests
```bash
npm run test:notifications
```

### Integration Tests
```bash
npm run test:notifications:integration
```

### Manual Testing
1. Enable notifications in browser
2. Create test notifications
3. Verify real-time delivery
4. Test push notifications
5. Validate quiet hours

## 🐛 Troubleshooting

### Common Issues

**Notifications not appearing:**
- Check WebSocket connection status
- Verify user authentication
- Check notification permissions

**Push notifications not working:**
- Ensure service worker is registered
- Check browser notification permissions
- Verify VAPID key configuration

**Real-time updates delayed:**
- Check network connectivity
- Verify Socket.IO server status
- Monitor connection health

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('notificationDebug', 'true');
```

## 🔮 Future Enhancements

### Planned Features
- **Email Integration**: SMTP/Resend integration
- **SMS Gateway**: Twilio integration
- **Advanced Scheduling**: Recurring notifications
- **Notification Templates**: Predefined message templates
- **Analytics Dashboard**: Notification performance metrics
- **A/B Testing**: Notification optimization
- **Machine Learning**: Smart notification timing

### Integration Opportunities
- **Slack/Discord**: Team collaboration
- **Mobile Apps**: Native push notifications
- **CRM Systems**: Customer engagement
- **Marketing Tools**: Campaign automation

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility
5. Test across different browsers

## 📄 License

This notification system is part of the SewaGo platform and follows the same licensing terms.
