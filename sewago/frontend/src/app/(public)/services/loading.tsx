export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section Skeleton */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <div className="w-4 h-4 bg-white/50 rounded mr-2 animate-pulse"></div>
              <div className="w-32 h-4 bg-white/50 rounded animate-pulse"></div>
            </div>
            
            <div className="w-96 h-16 bg-white/20 rounded-lg mx-auto mb-6 animate-pulse"></div>
            <div className="w-80 h-6 bg-white/20 rounded-lg mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Search Section Skeleton */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="w-full h-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Services Grid Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-64 h-10 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="w-96 h-6 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <div className="w-full h-4 bg-gray-200 rounded-lg mx-auto"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded-lg"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-4 bg-gray-200 rounded-lg"></div>
                    <div className="w-12 h-4 bg-gray-200 rounded-lg"></div>
                  </div>
                  
                  <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-80 h-10 bg-white/20 rounded-lg mx-auto mb-6 animate-pulse"></div>
          <div className="w-96 h-6 bg-white/20 rounded-lg mx-auto mb-8 animate-pulse"></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="w-32 h-14 bg-white/20 rounded-full animate-pulse"></div>
            <div className="w-40 h-14 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
