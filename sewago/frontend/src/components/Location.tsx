'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react';

<<<<<<< HEAD
=======
// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
interface LocationProps {
  showMap?: boolean;
  className?: string;
}

export default function Location({ showMap = true, className = '' }: LocationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (showMap && mapRef.current && typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      // Check if API key is provided and not the placeholder
      if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
        setMapError('Google Maps API key not configured');
        setIsMapLoading(false);
        return;
      }

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setMapError('Failed to load Google Maps');
        setIsMapLoading(false);
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [showMap]);

  const initMap = () => {
    if (!mapRef.current) return;

<<<<<<< HEAD
    try {
      const kathmandu = { lat: 27.7172, lng: 85.3240 };
      
      const map = new google.maps.Map(mapRef.current, {
=======
    // Check if Google Maps API is loaded
    if (typeof window.google === 'undefined' || !window.google.maps) {
      setMapError('Google Maps API not loaded');
      setIsMapLoading(false);
      return;
    }

    try {
      const kathmandu = { lat: 27.7172, lng: 85.3240 };
      
      const map = new window.google.maps.Map(mapRef.current, {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        zoom: 15,
        center: kathmandu,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9c9c9' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          }
        ]
      });

      // Add marker for SewaGo office
<<<<<<< HEAD
      new google.maps.Marker({
=======
      new window.google.maps.Marker({
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        position: kathmandu,
        map: map,
        title: 'SewaGo - Local Services in Nepal',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#DC143C" stroke="#FF9933" stroke-width="2"/>
              <text x="20" y="25" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">S</text>
            </svg>
          `),
<<<<<<< HEAD
          scaledSize: new google.maps.Size(40, 40)
=======
          scaledSize: new window.google.maps.Size(40, 40)
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        }
      });

      // Add info window
<<<<<<< HEAD
      const infoWindow = new google.maps.InfoWindow({
=======
      const infoWindow = new window.google.maps.InfoWindow({
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 5px 0; color: #DC143C; font-weight: bold;">SewaGo</h3>
            <p style="margin: 0; color: #333; font-size: 14px;">Local Services in Nepal</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Thamel, Kathmandu</p>
          </div>
        `
      });

      // Show info window on marker click
      map.addListener('click', () => {
        infoWindow.open(map, map.getCenter());
      });

      setIsMapLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
      setIsMapLoading(false);
    }
  };

  const renderMapFallback = () => (
    <div className='w-full h-80 rounded-lg border border-white/20 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
      <div className='text-center text-gray-600 p-6'>
        <MapPin className='w-16 h-16 mx-auto mb-4 text-gray-400' />
        <h4 className='text-lg font-semibold mb-2'>Interactive Map Unavailable</h4>
        <p className='text-sm mb-4'>We're experiencing technical difficulties with our map service.</p>
        
        {/* Static location information */}
        <div className='bg-white/80 rounded-lg p-4 text-left max-w-xs mx-auto'>
          <div className='flex items-center gap-2 mb-2'>
            <MapPin className='w-4 h-4 text-red-500' />
            <span className='font-medium text-gray-800'>SewaGo Office</span>
          </div>
          <p className='text-sm text-gray-700 mb-1'>Thamel, Kathmandu</p>
          <p className='text-sm text-gray-700 mb-1'>Bagmati Province, Nepal</p>
          <p className='text-sm text-gray-700'>Postal Code: 44600</p>
          
          {/* Link to Google Maps */}
          <a 
            href='https://maps.google.com/?q=Thamel,Kathmandu,Nepal' 
            target='_blank' 
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
          >
            <MapPin className='w-4 h-4' />
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );

  const renderMapError = () => (
    <div className='w-full h-80 rounded-lg border border-white/20 overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center'>
      <div className='text-center text-red-700 p-6'>
        <AlertCircle className='w-16 h-16 mx-auto mb-4 text-red-500' />
        <h4 className='text-lg font-semibold mb-2'>Map Loading Error</h4>
        <p className='text-sm mb-4'>{mapError}</p>
        
        {/* Static location information */}
        <div className='bg-white/80 rounded-lg p-4 text-left max-w-xs mx-auto'>
          <div className='flex items-center gap-2 mb-2'>
            <MapPin className='w-4 h-4 text-red-500' />
            <span className='font-medium text-gray-800'>SewaGo Office</span>
          </div>
          <p className='text-sm text-gray-700 mb-1'>Thamel, Kathmandu</p>
          <p className='text-sm text-gray-700 mb-1'>Bagmati Province, Nepal</p>
          <p className='text-sm text-gray-700 mb-1'>Postal Code: 44600</p>
          
          {/* Link to Google Maps */}
          <a 
            href='https://maps.google.com/?q=Thamel,Kathmandu,Nepal' 
            target='_blank' 
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors'
          >
            <MapPin className='w-4 h-4' />
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Location Information */}
      <div className='grid md:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-2xl font-bold text-white mb-6'>
              Visit Our Office
            </h3>
            
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-6 h-6 text-accent flex-shrink-0 mt-1' />
                <div>
                  <h4 className='font-semibold text-white mb-1'>Address</h4>
                  <p className='text-white/80'>
                    Thamel, Kathmandu<br />
                    Bagmati Province, Nepal<br />
                    Postal Code: 44600
                  </p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <Phone className='w-6 h-6 text-accent flex-shrink-0 mt-1' />
                <div>
                  <h4 className='font-semibold text-white mb-1'>Phone</h4>
                  <p className='text-white/80'>
                    <a href='tel:+9779800000000' className='hover:text-accent transition-colors'>
                      +977-9800000000
                    </a>
                  </p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <Mail className='w-6 h-6 text-accent flex-shrink-0 mt-1' />
                <div>
                  <h4 className='font-semibold text-white mb-1'>Email</h4>
                  <p className='text-white/80'>
                    <a href='mailto:hello@sewago.com' className='hover:text-accent transition-colors'>
                      hello@sewago.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <Clock className='w-6 h-6 text-accent flex-shrink-0 mt-1' />
                <div>
                  <h4 className='font-semibold text-white mb-1'>Business Hours</h4>
                  <p className='text-white/80'>
                    Monday - Friday: 7:00 AM - 10:00 PM<br />
                    Saturday - Sunday: 7:00 AM - 10:00 PM<br />
                    <span className='text-accent font-medium'>24/7 Emergency Support Available</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Local SEO Information */}
          <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4'>
            <h4 className='font-semibold text-white mb-2'>Service Areas</h4>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='text-white/80'>• Kathmandu Valley</div>
              <div className='text-white/80'>• Pokhara</div>
              <div className='text-white/80'>• Lalitpur</div>
              <div className='text-white/80'>• Bhaktapur</div>
              <div className='text-white/80'>• Patan</div>
              <div className='text-white/80'>• Biratnagar</div>
              <div className='text-white/80'>• Birgunj</div>
            </div>
            <p className='text-white/60 text-xs mt-2'>
              And many more cities and villages across Nepal
            </p>
          </div>
        </div>
        
        {/* Map */}
        {showMap && (
          <div className='space-y-4'>
            <h4 className='font-semibold text-white'>Find Us on the Map</h4>
            <div 
              ref={mapRef}
              className='w-full h-80 rounded-lg border border-white/20 overflow-hidden'
              style={{ minHeight: '320px' }}
            >
              {/* Show appropriate content based on state */}
              {isMapLoading && !mapError && (
                <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                  <div className='text-center text-gray-600'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                    <p>Loading map...</p>
                    <p className='text-sm'>Thamel, Kathmandu, Nepal</p>
                  </div>
                </div>
              )}
              
              {mapError && renderMapError()}
              
              {!isMapLoading && !mapError && (
                <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                  <div className='text-center text-gray-600'>
                    <MapPin className='w-12 h-12 mx-auto mb-2' />
                    <p>Map loaded successfully</p>
                    <p className='text-sm'>Thamel, Kathmandu, Nepal</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Map Controls */}
            <div className='flex items-center justify-between text-sm text-white/60'>
              <span>📍 Thamel, Kathmandu</span>
              <a 
                href='https://maps.google.com/?q=Thamel,Kathmandu,Nepal' 
                target='_blank' 
                rel='noopener noreferrer'
                className='hover:text-white transition-colors'
              >
                🗺️ View on Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Local Business Information */}
      <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6'>
        <h4 className='font-semibold text-white mb-4'>Local Business Information</h4>
        <div className='grid md:grid-cols-3 gap-4 text-sm'>
          <div>
            <span className='text-white/60'>Business Type:</span>
            <span className='text-white ml-2'>Local Service Platform</span>
          </div>
          <div>
            <span className='text-white/60'>Established:</span>
            <span className='text-white ml-2'>2024</span>
          </div>
          <div>
            <span className='text-white/60'>License:</span>
            <span className='text-white ml-2'>Nepal Business</span>
          </div>
          <div>
            <span className='text-white/60'>Languages:</span>
            <span className='text-white ml-2'>Nepali, English, Newari</span>
          </div>
          <div>
            <span className='text-white/60'>Payment:</span>
            <span className='text-white ml-2'>Cash, eSewa, Khalti</span>
          </div>
          <div>
            <span className='text-white/60'>Currency:</span>
            <span className='text-white ml-2'>Nepalese Rupee (NPR)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
