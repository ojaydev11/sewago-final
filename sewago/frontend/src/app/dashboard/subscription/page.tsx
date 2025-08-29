'use client';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function SubscriptionPage() {
  // In a real application, you would get the userId from authentication context
  const userId = 'user-123'; // This would come from auth context/session

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Dashboard</h1>
            <p className="text-gray-600">Manage your SewaGo subscription and billing</p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <p className="text-gray-600">FREE Plan</p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-600">Services Used</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-600">Monthly Limit</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">$0</div>
                <div className="text-sm text-gray-600">Monthly Cost</div>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
          </div>

          {/* Plan Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">FREE</h4>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$0</div>
                  <div className="text-gray-600 text-sm">per month</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Basic service booking</li>
                  <li>✓ Standard support</li>
                  <li>✓ Limited features</li>
                </ul>
                <button className="w-full mt-4 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Current Plan
                </button>
              </div>

              {/* Plus Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    POPULAR
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">PLUS</h4>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$9.99</div>
                  <div className="text-gray-600 text-sm">per month</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Priority booking</li>
                  <li>✓ Premium support</li>
                  <li>✓ Advanced features</li>
                  <li>✓ Discount on services</li>
                </ul>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Upgrade to Plus
                </button>
              </div>

              {/* Pro Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">PRO</h4>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$19.99</div>
                  <div className="text-gray-600 text-sm">per month</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Unlimited bookings</li>
                  <li>✓ 24/7 premium support</li>
                  <li>✓ All features included</li>
                  <li>✓ Maximum discounts</li>
                  <li>✓ Family plan options</li>
                </ul>
                <button className="w-full mt-4 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}