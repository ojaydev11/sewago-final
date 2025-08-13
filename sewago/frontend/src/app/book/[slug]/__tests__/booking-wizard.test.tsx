import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BookingWizard from '../booking-wizard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock service data
const mockService = {
  id: 'test-service-id',
  title: 'Test Service',
  slug: 'test-service',
  description: 'A test service for testing',
  category: 'Test',
  priceRange: { min: 1000, max: 5000 },
  isActive: true,
};

describe('BookingWizard', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    render(<BookingWizard service={mockService} />);
    expect(screen.getByText('Service Details')).toBeInTheDocument();
  });

  it('shows the first step by default', () => {
    render(<BookingWizard service={mockService} />);
    expect(screen.getByText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Estimated Hours')).toBeInTheDocument();
  });

  it('displays progress steps', () => {
    render(<BookingWizard service={mockService} />);
    expect(screen.getByText('Service Details')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('shows service title in the header', () => {
    render(<BookingWizard service={mockService} />);
    expect(screen.getByText('Book Test Service')).toBeInTheDocument();
  });
});
