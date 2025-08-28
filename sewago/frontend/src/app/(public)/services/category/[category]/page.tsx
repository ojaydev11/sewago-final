"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Service = { _id: string; title: string; basePrice: number; location: string; rating?: number };

export default function CategoryServicesPage() {
  const params = useParams<{ category: string }>();
  const category = params?.category;
  const search = useSearchParams();
  const location = search?.get("location") ?? "";
  
  // Move useQuery before any conditional returns to follow Rules of Hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ["category-services", category, location],
    queryFn: async () => {
      if (!category) return [];
      try {
        const response = await api.get(`/api/services/category/${category}`, {
          params: { location }
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch category services:", error);
        return [];
      }
    },
    enabled: !!category
  });

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The requested category could not be found.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Services</h1>
          <p className="text-gray-600">Failed to load services for this category. Please try again later.</p>
        </div>
      </div>
    );
  }

  const services = data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.charAt(0).toUpperCase() + category.slice(1)} Services
        </h1>
        {location && (
          <p className="text-gray-600">Available in {location}</p>
        )}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.location}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    NPR {service.basePrice}
                  </span>
                  {service.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-gray-600">{service.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


