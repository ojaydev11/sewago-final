import { Locale } from './index';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    services: string;
    about: string;
    contact: string;
    login: string;
    register: string;
    dashboard: string;
    profile: string;
    logout: string;
    admin: string;
    provider: string;
  };
  
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
  };
  
  // Booking Steps
  booking: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    selectService: string;
    chooseProvider: string;
    scheduleTime: string;
    confirmBooking: string;
    next: string;
    previous: string;
    confirm: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    view: string;
    search: string;
    filter: string;
    sort: string;
    price: string;
    rating: string;
    reviews: string;
    location: string;
    date: string;
    time: string;
    status: string;
    actions: string;
  };
  
  // Services
  services: {
    categories: string;
    popular: string;
    featured: string;
    allServices: string;
    bookNow: string;
    viewDetails: string;
    startingFrom: string;
    perHour: string;
    perService: string;
  };
  
  // Auth
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    or: string;
    continueWith: string;
  };
  
  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    recentBookings: string;
    upcomingBookings: string;
    completedBookings: string;
    earnings: string;
    reviews: string;
    settings: string;
    notifications: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      profile: 'Profile',
      logout: 'Logout',
      admin: 'Admin',
      provider: 'Provider'
    },
    hero: {
      title: 'Find Local Services Near You',
      subtitle: 'Connect with trusted professionals for all your home and business needs',
      cta: 'Get Started',
      searchPlaceholder: 'What service do you need?'
    },
    booking: {
      step1: 'Select Service',
      step2: 'Choose Provider',
      step3: 'Schedule Time',
      step4: 'Confirm Booking',
      selectService: 'Choose the service you need',
      chooseProvider: 'Select your preferred provider',
      scheduleTime: 'Pick a convenient time',
<<<<<<< HEAD
      confirmBooking: 'Review and confirm your booking'
=======
      confirmBooking: 'Review and confirm your booking',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm'
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      price: 'Price',
      rating: 'Rating',
      reviews: 'Reviews',
      location: 'Location',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      actions: 'Actions'
    },
    services: {
      categories: 'Categories',
      popular: 'Popular Services',
      featured: 'Featured',
      allServices: 'All Services',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      startingFrom: 'Starting from',
      perHour: 'per hour',
      perService: 'per service'
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember me',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      or: 'or',
      continueWith: 'Continue with'
    },
    dashboard: {
      welcome: 'Welcome back',
      overview: 'Overview',
      recentBookings: 'Recent Bookings',
      upcomingBookings: 'Upcoming Bookings',
      completedBookings: 'Completed Bookings',
      earnings: 'Earnings',
      reviews: 'Reviews',
      settings: 'Settings',
      notifications: 'Notifications'
    }
  },
  ne: {
    nav: {
      home: 'गृह',
      services: 'सेवाहरू',
      about: 'हाम्रो बारेमा',
      contact: 'सम्पर्क',
      login: 'लगइन',
      register: 'दर्ता',
      dashboard: 'ड्यासबोर्ड',
      profile: 'प्रोफाइल',
      logout: 'लगआउट',
      admin: 'एडमिन',
      provider: 'सेवा प्रदायक'
    },
    hero: {
      title: 'आफ्नो नजिकैका स्थानीय सेवाहरू फेला पार्नुहोस्',
      subtitle: 'आफ्ना सबै घर र व्यवसायको आवश्यकताका लागि विश्वसनीय पेशेवरहरूसँग जडान गर्नुहोस्',
      cta: 'सुरु गर्नुहोस्',
      searchPlaceholder: 'तपाईंलाई कुन सेवा चाहिन्छ?'
    },
    booking: {
      step1: 'सेवा छान्नुहोस्',
      step2: 'सेवा प्रदायक छान्नुहोस्',
      step3: 'समय तोक्नुहोस्',
      step4: 'बुकिङ पुष्टि गर्नुहोस्',
      selectService: 'तपाईंलाई चाहिने सेवा छान्नुहोस्',
      chooseProvider: 'आफ्नो मनपर्ने सेवा प्रदायक छान्नुहोस्',
      scheduleTime: 'सुविधाजनक समय छान्नुहोस्',
<<<<<<< HEAD
      confirmBooking: 'आफ्नो बुकिङ समीक्षा गरेर पुष्टि गर्नुहोस्'
=======
      confirmBooking: 'आफ्नो बुकिङ समीक्षा गरेर पुष्टि गर्नुहोस्',
      next: 'अर्को',
      previous: 'अघिल्लो',
      confirm: 'पुष्टि गर्नुहोस्'
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    },
    common: {
      loading: 'लोड हुँदै...',
      error: 'त्रुटि',
      success: 'सफल',
      cancel: 'रद्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      edit: 'सम्पादन गर्नुहोस्',
      delete: 'मेटाउनुहोस्',
      view: 'हेर्नुहोस्',
      search: 'खोज्नुहोस्',
      filter: 'फिल्टर',
      sort: 'क्रमबद्ध गर्नुहोस्',
      price: 'मूल्य',
      rating: 'मूल्यांकन',
      reviews: 'समीक्षाहरू',
      location: 'स्थान',
      date: 'मिति',
      time: 'समय',
      status: 'स्थिति',
      actions: 'कार्यहरू'
    },
    services: {
      categories: 'श्रेणीहरू',
      popular: 'लोकप्रिय सेवाहरू',
      featured: 'विशेष',
      allServices: 'सबै सेवाहरू',
      bookNow: 'अहिले बुक गर्नुहोस्',
      viewDetails: 'विवरण हेर्नुहोस्',
      startingFrom: 'सुरुवात',
      perHour: 'प्रति घण्टा',
      perService: 'प्रति सेवा'
    },
    auth: {
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      email: 'इमेल',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
      forgotPassword: 'पासवर्ड बिर्सनुभयो?',
      rememberMe: 'मलाई सम्झनुहोस्',
      alreadyHaveAccount: 'पहिले नै खाता छ?',
      dontHaveAccount: 'खाता छैन?',
      or: 'वा',
      continueWith: 'यससँग जारी राख्नुहोस्'
    },
    dashboard: {
      welcome: 'फिर्ता स्वागत छ',
      overview: 'सिंहावलोकन',
      recentBookings: 'हालैका बुकिङहरू',
      upcomingBookings: 'आउँदा बुकिङहरू',
      completedBookings: 'पूरा भएका बुकिङहरू',
      earnings: 'कमाई',
      reviews: 'समीक्षाहरू',
      settings: 'सेटिङहरू',
      notifications: 'सूचनाहरू'
    }
  }
};

export function useTranslations(locale: Locale = 'en'): Translations {
  return translations[locale] || translations.en;
}

export function t(key: string, locale: Locale = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations.en;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}
