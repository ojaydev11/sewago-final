import React from 'react';

interface ProviderFinancialDashboardProps {
  providerId: string;
}

const ProviderFinancialDashboard: React.FC<ProviderFinancialDashboardProps> = ({ providerId }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Financial Dashboard</h3>
      <p className="text-gray-600">Financial dashboard component for provider {providerId} - to be implemented</p>
    </div>
  );
};

export default ProviderFinancialDashboard;
