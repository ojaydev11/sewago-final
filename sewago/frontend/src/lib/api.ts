import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { error: message };
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { emailOrPhone: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Services endpoints
  async getServices(params?: {
    category?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  // Bookings endpoints
  async createBooking(bookingData: {
    serviceId: string;
    providerId: string;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
    description?: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return this.request('/bookings/me');
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Reviews endpoints
  async addReview(reviewData: {
    providerId: string;
    bookingId: string;
    rating: number;
    comment: string;
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getProviderReviews(providerId: string) {
    return this.request(`/reviews/provider/${providerId}`);
  }

  // Contact form submission
  async submitContactForm(formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    subscribeNewsletter?: boolean;
  }) {
    // For now, we'll simulate the API call
    // In production, this would connect to a real contact form endpoint
    return new Promise<ApiResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { message: 'Message sent successfully! We\'ll get back to you within 24 hours.' }
        });
      }, 1000);
    });
  }

  // Search functionality
  async searchServices(query: string, filters?: {
    category?: string;
    location?: string;
    priceRange?: string;
    rating?: number;
  }) {
    const searchParams = new URLSearchParams();
    searchParams.append('search', query);
    
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.location) searchParams.append('location', filters.location);
    if (filters?.priceRange) searchParams.append('priceRange', filters.priceRange);
    if (filters?.rating) searchParams.append('rating', filters.rating.toString());

    return this.request(`/services?${searchParams.toString()}`);
  }

  // Provider search
  async searchProviders(query: string, service?: string, location?: string) {
    const searchParams = new URLSearchParams();
    searchParams.append('search', query);
    if (service) searchParams.append('service', service);
    if (location) searchParams.append('location', location);

    return this.request(`/providers?${searchParams.toString()}`);
  }
}

export const apiService = new ApiService();

// Utility function to handle API errors
export const handleApiError = (error: any, fallbackMessage = 'Something went wrong') => {
  const message = error?.message || error?.error || fallbackMessage;
  toast.error(message);
  return message;
};

// Utility function to handle API success
export const handleApiSuccess = (message: string) => {
  toast.success(message);
};


