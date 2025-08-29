import React from 'react';

interface ProviderBusinessInsightsProps {
  providerId: string;
}

const ProviderBusinessInsights: React.FC<ProviderBusinessInsightsProps> = ({ providerId }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
      <p className="text-gray-600">Business insights component for provider {providerId} - to be implemented</p>
    </div>
  );
};

export default ProviderBusinessInsights;
