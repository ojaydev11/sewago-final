import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartFeaturesShowcase } from '@/components/SmartFeaturesShowcase';

// Mock all the AI components
vi.mock('@/components/ai/SmartNotificationCenter', () => ({
  SmartNotificationCenter: ({ userId }: { userId: string }) => (
    <div data-testid="smart-notification-center">Notifications for {userId}</div>
  ),
}));

vi.mock('@/components/ai/VoiceCommandProcessor', () => ({
  VoiceCommandProcessor: ({ userId }: { userId: string }) => (
    <div data-testid="voice-command-processor">Voice processor for {userId}</div>
  ),
}));

vi.mock('@/components/ai/PredictiveSearchEngine', () => ({
  PredictiveSearchEngine: ({ placeholder, onSearchPerformed }: any) => (
    <div data-testid="predictive-search-engine">
      <input 
        placeholder={placeholder}
        data-testid="search-input"
        onChange={(e) => onSearchPerformed?.(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('@/components/ai/SearchAnalytics', () => ({
  SearchAnalytics: ({ userId }: { userId: string }) => (
    <div data-testid="search-analytics">Analytics for {userId}</div>
  ),
}));

vi.mock('@/components/ai/IntelligentFormFiller', () => ({
  IntelligentFormFiller: ({ fieldName, userId }: any) => (
    <div data-testid={`form-filler-${fieldName}`}>Form filler for {userId}</div>
  ),
}));

// Mock all custom hooks
vi.mock('@/hooks/useVoiceCommands', () => ({
  useVoiceCommands: () => ({
    isListening: false,
    isSupported: true,
    currentTranscript: '',
    lastCommand: null,
    commandHistory: [
      { transcript: 'find plumber', intent: 'SEARCH', timestamp: new Date() },
    ],
    error: null,
    toggleListening: vi.fn(),
    processCommand: vi.fn(),
    clearHistory: vi.fn(),
    successRate: 0.85,
  }),
}));

vi.mock('@/hooks/usePredictiveSearch', () => ({
  usePredictiveSearch: () => ({
    query: '',
    setQuery: vi.fn(),
    predictions: [
      { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
    ],
    suggestions: ['plumber', 'electrician'],
    corrections: [],
    isLoading: false,
    searchHistory: ['previous search 1', 'previous search 2'],
    sessionId: 'test-session-123',
    performSearch: vi.fn(),
    clearHistory: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSmartNotifications', () => ({
  useSmartNotifications: () => ({
    notifications: [
      {
        id: '1',
        title: 'Booking Reminder',
        message: 'Your service is tomorrow',
        type: 'BOOKING_REMINDER',
        priority: 'HIGH',
      },
    ],
    unreadCount: 3,
    preferences: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
    },
    updatePreferences: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock('@/hooks/useFormAutofill', () => ({
  useFormAutofill: () => ({
    suggestions: {
      address: ['123 Main St', '456 Oak Ave'],
      phone: ['+977-9841234567'],
    },
    isLoading: false,
    registerField: vi.fn(),
    getSuggestions: vi.fn(),
    recordInteraction: vi.fn(),
    bulkFill: vi.fn(),
  }),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input 
      type="checkbox" 
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="feature-switch"
    />
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => (
    <div data-testid="progress-bar" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe('Smart Features Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main showcase component', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    expect(screen.getByText('Smart Features Powered by AI')).toBeInTheDocument();
    expect(screen.getByText(/Experience the future of service booking/)).toBeInTheDocument();
  });

  it('displays all feature navigation buttons', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    expect(screen.getByText('Smart Features Overview')).toBeInTheDocument();
    expect(screen.getByText('Predictive Search')).toBeInTheDocument();
    expect(screen.getByText('Voice Commands')).toBeInTheDocument();
    expect(screen.getByText('Smart Notifications')).toBeInTheDocument();
    expect(screen.getByText('Form Auto-fill')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('switches between different feature demos', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    // Initially shows overview
    expect(screen.getByText('AI Performance Summary')).toBeInTheDocument();
    
    // Click on Predictive Search
    fireEvent.click(screen.getByText('Predictive Search'));
    
    await waitFor(() => {
      expect(screen.getByTestId('predictive-search-engine')).toBeInTheDocument();
      expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
    });
    
    // Click on Voice Commands
    fireEvent.click(screen.getByText('Voice Commands'));
    
    await waitFor(() => {
      expect(screen.getByTestId('voice-command-processor')).toBeInTheDocument();
    });
  });

  it('displays feature metrics in overview', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    // Should show progress bars for different features
    const progressBars = screen.getAllByTestId('progress-bar');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Should show performance summary
    expect(screen.getByText('User Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Searches Performed')).toBeInTheDocument();
    expect(screen.getByText('Voice Commands')).toBeInTheDocument();
    expect(screen.getByText('Active Notifications')).toBeInTheDocument();
  });

  it('allows toggling individual features', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    const switches = screen.getAllByTestId('feature-switch');
    expect(switches.length).toBeGreaterThan(0);
    
    // All features should be enabled by default
    switches.forEach(switchElement => {
      expect(switchElement).toBeChecked();
    });
    
    // Toggle first feature
    fireEvent.click(switches[0]);
    
    // Feature should be toggled (implementation would update state)
    expect(switches[0]).not.toBeChecked();
  });

  it('displays search demo correctly', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Predictive Search'));
    
    await waitFor(() => {
      expect(screen.getByTestId('predictive-search-engine')).toBeInTheDocument();
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('Search Analytics')).toBeInTheDocument();
      
      // Should show search history
      expect(screen.getByText('previous search 1')).toBeInTheDocument();
      expect(screen.getByText('previous search 2')).toBeInTheDocument();
    });
  });

  it('displays voice demo with microphone button', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Voice Commands'));
    
    await waitFor(() => {
      expect(screen.getByTestId('voice-command-processor')).toBeInTheDocument();
      expect(screen.getByText('Click to start voice commands')).toBeInTheDocument();
    });
  });

  it('displays notifications demo', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Smart Notifications'));
    
    await waitFor(() => {
      expect(screen.getByTestId('smart-notification-center')).toBeInTheDocument();
      expect(screen.getByText('Notifications for test-user')).toBeInTheDocument();
    });
  });

  it('displays form autofill demo with multiple fields', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Form Auto-fill'));
    
    await waitFor(() => {
      expect(screen.getByTestId('form-filler-address')).toBeInTheDocument();
      expect(screen.getByTestId('form-filler-phoneNumber')).toBeInTheDocument();
      expect(screen.getByTestId('form-filler-serviceType')).toBeInTheDocument();
    });
  });

  it('displays analytics demo', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Analytics Dashboard'));
    
    await waitFor(() => {
      expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
    });
  });

  it('has enable all features button', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    expect(screen.getByText('Enable All Features')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  it('shows performance metrics with correct values', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    // Should show 92% user satisfaction (from getFeatureStats)
    expect(screen.getByText('92%')).toBeInTheDocument();
    
    // Should show other performance metrics
    const progressBars = screen.getAllByTestId('progress-bar');
    const accuracyBar = progressBars.find(bar => 
      bar.getAttribute('data-value') === '94'
    );
    expect(accuracyBar).toBeInTheDocument();
  });

  it('handles custom className prop', () => {
    const { container } = render(
      <SmartFeaturesShowcase userId="test-user" className="custom-showcase" />
    );
    
    expect(container.firstChild).toHaveClass('custom-showcase');
  });

  it('uses default userId when not provided', () => {
    render(<SmartFeaturesShowcase />);
    
    // Should still render without errors
    expect(screen.getByText('Smart Features Powered by AI')).toBeInTheDocument();
  });

  it('integrates search functionality', async () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    fireEvent.click(screen.getByText('Predictive Search'));
    
    await waitFor(() => {
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      
      // Simulate search
      fireEvent.change(searchInput, { target: { value: 'plumber' } });
      
      // This would trigger the onSearchPerformed callback in real usage
    });
  });

  it('shows feature confidence levels', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    // Overview should show various confidence percentages
    const percentages = ['94%', '89%', '76%', '85%', '92%'];
    
    percentages.forEach(percentage => {
      expect(screen.getByText(percentage)).toBeInTheDocument();
    });
  });

  it('displays feature categories correctly', () => {
    render(<SmartFeaturesShowcase userId="test-user" />);
    
    // Should show different feature categories in the metrics
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Recognition Rate')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });
});