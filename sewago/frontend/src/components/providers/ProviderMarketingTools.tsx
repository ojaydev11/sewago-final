import React from 'react';

interface ProviderMarketingToolsProps {
  providerId: string;
}

const ProviderMarketingTools: React.FC<ProviderMarketingToolsProps> = ({ providerId }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Marketing Tools</h3>
      <p className="text-gray-600">Marketing tools component for provider {providerId} - to be implemented</p>
    </div>
  );
};

export default ProviderMarketingTools;
