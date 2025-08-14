import React from 'react';
import Image from 'next/image';
import '../../styles/components/ServiceHub.css';

export default function ServiceHubIllustration() {
  return (
    <div className="service-hub-container">
      {/* Base map illustration */}
      <div className="base-map">
        <Image 
          src="/assets/illustrations/service-hub-map.svg" 
          alt="Service Hub Map" 
          width={600} 
          height={400} 
          priority 
          className="w-full h-auto"
        />
      </div>
      
      {/* Interactive service icons */}
      <div className="service-icon plumbing-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#FF5C93"/>
        </svg>
        <span className="tooltip">Plumbing Services</span>
      </div>
      
      <div className="service-icon cleaning-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FF5C93"/>
        </svg>
        <span className="tooltip">Cleaning Services</span>
      </div>
      
      <div className="service-icon electrical-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF5C93"/>
        </svg>
        <span className="tooltip">Electrical Services</span>
      </div>
      
      <div className="service-icon delivery-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#FF5C93"/>
        </svg>
        <span className="tooltip">Delivery Services</span>
      </div>
    </div>
  );
}
