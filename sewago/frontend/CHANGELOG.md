# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-08-15

### Added
- **PR-2: Currency normalization** - NPR "Rs …" formatting everywhere, whole numbers only, no ₹ symbols or decimals
- **PR-3: Promise alignment** - Consistent service promises across Home hero, Service pages, and FAQ sections
- **PR-4: Trust Layer (Home)** - CounterBar with trust metrics (jobs completed, avg response, satisfaction) and Verified Reviews carousel
- **PR-1: Booking Core** - Server-side quote generation, idempotent booking APIs, rate-limited endpoints with no-store cache
- **PR-5: Login demo accounts** - Pre-configured demo accounts for testing (admin, provider, customer)
- **PR-N: Notifications MVP** - Real-time notification system with feature flag OFF for production safety

### Changed
- Homepage now displays CounterBar instead of LiveCounters for trust metrics
- All currency displays standardized to NPR format
- Service promises aligned across all touchpoints
- Booking system enhanced with server-side validation and idempotency

### Technical
- Added `/api/counters` endpoint for trust metrics
- Enhanced `/api/reviews` endpoint for verified reviews
- Notification system fully feature-flagged (disabled by default)
- Environment variables configured for MOCK_MODE and production safety

### Environment Variables
- `MOCK_MODE=true` (for launch week, will switch to DB after burn-in)
- `NEXT_PUBLIC_SITE_URL=https://sewago-final.vercel.app`
- `NEXT_PUBLIC_NOTIFICATIONS_ENABLED=false` (kept OFF in production)

## [0.3.0] - 2025-08-13

### Added
- Initial implementation of core platform features
- Basic service management and user authentication
- Service provider verification system

## [0.2.0] - 2025-08-10

### Added
- Foundation components and UI library
- Basic routing and layout structure

## [0.1.0] - 2025-08-08

### Added
- Initial project setup
- Next.js 15 configuration
- Basic project structure
