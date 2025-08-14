'use client';

import { useEffect } from 'react';

interface SchemaMarkupProps {
  schema: Record<string, any>;
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    
    // Add to document head
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [schema]);

  return null; // This component doesn't render anything
}
