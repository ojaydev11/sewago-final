import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PredictiveSearchEngine } from '../PredictiveSearchEngine';
import { usePredictiveSearch } from '@/hooks/usePredictiveSearch';

// Mock the custom hook
vi.mock('@/hooks/usePredictiveSearch', () => ({
  usePredictiveSearch: vi.fn(),
}));

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  MicOff: () => <div data-testid="mic-off-icon">MicOff</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
}));

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en',
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => mockSpeechRecognition),
});

const mockHookReturn = {
  query: '',
  setQuery: vi.fn(),
  predictions: [],
  suggestions: [],
  corrections: [],
  isLoading: false,
  searchHistory: [],
  sessionId: 'test-session-123',
  performSearch: vi.fn(),
  clearHistory: vi.fn(),
};

describe('PredictiveSearchEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePredictiveSearch as any).mockReturnValue(mockHookReturn);
  });

  it('renders search input and basic elements', () => {
    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls performSearch when form is submitted', async () => {
    const onSearchPerformed = vi.fn();
    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        onSearchPerformed={onSearchPerformed}
      />
    );
    
    const input = screen.getByPlaceholderText('Search services...');
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'house cleaning' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockHookReturn.performSearch).toHaveBeenCalledWith('house cleaning');
    });
  });

  it('displays predictions when available', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      predictions: [
        { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
        { text: 'house cleaning service', confidence: 0.8, category: 'CLEANING' },
      ],
      query: 'house',
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    fireEvent.change(screen.getByPlaceholderText('Search services...'), { 
      target: { value: 'house' } 
    });
    
    expect(screen.getByText('house cleaning')).toBeInTheDocument();
    expect(screen.getByText('house cleaning service')).toBeInTheDocument();
  });

  it('displays suggestions when available', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      suggestions: ['plumber', 'electrician', 'cleaner'],
      query: '',
    });

    render(<PredictiveSearchEngine placeholder="Search services..." showFilters />);
    
    // Suggestions should be displayed
    expect(screen.getByText('plumber')).toBeInTheDocument();
    expect(screen.getByText('electrician')).toBeInTheDocument(); 
    expect(screen.getByText('cleaner')).toBeInTheDocument();
  });

  it('shows voice search button when enabled', () => {
    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        showVoiceSearch 
      />
    );
    
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
  });

  it('handles voice search activation', async () => {
    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        showVoiceSearch 
      />
    );
    
    const voiceButton = screen.getByRole('button', { name: /voice search/i });
    fireEvent.click(voiceButton);
    
    await waitFor(() => {
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('displays corrections when available', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      corrections: [
        { original: 'plumer', corrected: 'plumber', confidence: 0.95 },
      ],
      query: 'plumer',
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    expect(screen.getByText(/did you mean/i)).toBeInTheDocument();
    expect(screen.getByText('plumber')).toBeInTheDocument();
  });

  it('handles prediction selection', async () => {
    const onSearchPerformed = vi.fn();
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      predictions: [
        { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
      ],
      query: 'house',
    });

    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        onSearchPerformed={onSearchPerformed}
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('Search services...'), { 
      target: { value: 'house' } 
    });
    
    const prediction = screen.getByText('house cleaning');
    fireEvent.click(prediction);
    
    await waitFor(() => {
      expect(mockHookReturn.setQuery).toHaveBeenCalledWith('house cleaning');
    });
  });

  it('shows search history when input is focused and empty', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      searchHistory: ['previous search 1', 'previous search 2'],
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    const input = screen.getByPlaceholderText('Search services...');
    fireEvent.focus(input);
    
    expect(screen.getByText('previous search 1')).toBeInTheDocument();
    expect(screen.getByText('previous search 2')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      query: 'test query',
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    const clearButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(clearButton!);
    
    expect(mockHookReturn.setQuery).toHaveBeenCalledWith('');
  });

  it('handles keyboard navigation in predictions', async () => {
    (usePredictiveSearch as any).mockReturnValue({
      ...mockHookReturn,
      predictions: [
        { text: 'house cleaning', confidence: 0.9, category: 'CLEANING' },
        { text: 'house repairs', confidence: 0.8, category: 'REPAIRS' },
      ],
      query: 'house',
    });

    render(<PredictiveSearchEngine placeholder="Search services..." />);
    
    const input = screen.getByPlaceholderText('Search services...');
    fireEvent.change(input, { target: { value: 'house' } });
    
    // Test arrow down navigation
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // First prediction should be highlighted (implementation dependent)
    // This would require checking for aria-selected or similar attributes
  });

  it('handles voice recognition results', async () => {
    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        showVoiceSearch 
      />
    );
    
    const voiceButton = screen.getByRole('button', { name: /voice search/i });
    fireEvent.click(voiceButton);
    
    // Simulate voice recognition result
    const mockEvent = {
      results: [
        [{ transcript: 'find electrician' }]
      ]
    };
    
    // Trigger the onresult callback
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent);
    }
    
    await waitFor(() => {
      expect(mockHookReturn.setQuery).toHaveBeenCalledWith('find electrician');
    });
  });

  it('handles voice recognition errors gracefully', async () => {
    render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        showVoiceSearch 
      />
    );
    
    const voiceButton = screen.getByRole('button', { name: /voice search/i });
    fireEvent.click(voiceButton);
    
    // Simulate voice recognition error
    const mockError = { error: 'not-allowed' };
    
    if (mockSpeechRecognition.onerror) {
      mockSpeechRecognition.onerror(mockError);
    }
    
    // Component should handle error gracefully and stop listening
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument(); // Should be back to mic icon
  });

  it('applies custom className', () => {
    const { container } = render(
      <PredictiveSearchEngine 
        placeholder="Search services..." 
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});