export const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SewaGo",
  "alternateName": "सेवागो",
  "description": "Reliable local services for every home in Nepal. Connect with verified service providers for electrical work, plumbing, cleaning, and more.",
  "url": "https://sewago.com",
  "telephone": "+977-9800000000",
  "email": "hello@sewago.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Thamel, Kathmandu",
    "addressLocality": "Kathmandu",
    "addressRegion": "Bagmati",
    "postalCode": "44600",
    "addressCountry": "NP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 27.7172,
    "longitude": 85.3240
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "07:00",
      "closes": "22:00"
    }
  ],
  "sameAs": [
    "https://facebook.com/sewago",
    "https://twitter.com/sewago",
    "https://instagram.com/sewago",
    "https://linkedin.com/company/sewago"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SewaGo Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Electrical Services",
          "description": "Professional electrical work including installations, repairs, and maintenance",
          "provider": {
            "@type": "LocalBusiness",
            "name": "SewaGo"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Nepal"
          }
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Plumbing Services",
          "description": "Expert plumbing solutions for homes and businesses",
          "provider": {
            "@type": "LocalBusiness",
            "name": "SewaGo"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Nepal"
          }
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Cleaning Services",
          "description": "Comprehensive cleaning solutions for all your needs",
          "provider": {
            "@type": "LocalBusiness",
            "name": "SewaGo"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Nepal"
          }
        }
      }
    ]
  },
  "priceRange": "₹₹",
  "paymentAccepted": ["Cash", "eSewa", "Khalti", "Credit Card"],
  "currenciesAccepted": "NPR",
  "areaServed": {
    "@type": "Country",
    "name": "Nepal"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "geoRadius": "50000"
  }
};

export const serviceSchema = (service: any) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "LocalBusiness",
    "name": "SewaGo"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Nepal"
  },
  "offers": {
    "@type": "Offer",
    "price": service.basePrice,
    "priceCurrency": "NPR",
    "availability": "https://schema.org/InStock"
  }
});

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SewaGo",
  "alternateName": "सेवागो",
  "url": "https://sewago.com",
  "logo": "https://sewago.com/logo.png",
  "sameAs": [
    "https://facebook.com/sewago",
    "https://twitter.com/sewago",
    "https://instagram.com/sewago",
    "https://linkedin.com/company/sewago"
  ]
};
