import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, User, FileText, Download, ArrowLeft, ArrowRight } from "lucide-react";

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  buildingDenominator: string;
  tenants: Tenant[];
}

interface Tenant {
  id: number;
  name: string;
  suiteNumber: string;
}

export default function PropertyPage() {
  const { propertyId } = useParams();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (!res.ok) throw new Error("Property not found");
      return res.json();
    },
  });

  const handleExportRentRoll = async () => {
    window.open(`/api/export/rent-roll/${propertyId}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Property Not Found</h2>
        <Link to="/search" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/search"
        className="inline-flex items-center text-slate-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Link>

      {/* Property Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Building2 className="h-6 w-6 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-slate-800">{property.name}</h1>
            </div>
            {property.address && (
              <p className="text-slate-600">
                {property.address}
                {property.city && `, ${property.city}`}
                {property.state && `, ${property.state}`}
                {property.zipCode && ` ${property.zipCode}`}
              </p>
            )}
            {property.buildingDenominator && (
              <p className="text-sm text-slate-500 mt-2">
                Building Denominator: {parseFloat(property.buildingDenominator).toLocaleString()} RSF
              </p>
            )}
          </div>
          <button
            onClick={handleExportRentRoll}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Rent Roll
          </button>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary-600" />
          Tenants ({property.tenants?.length || 0})
        </h2>

        {!property.tenants || property.tenants.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>No tenants yet.</p>
            <Link
              to="/import"
              className="text-primary-600 hover:text-primary-800 mt-2 inline-block"
            >
              Import lease documents &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.tenants.map((tenant) => (
              <Link
                key={tenant.id}
                to={`/abstract/${tenant.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{tenant.name}</h3>
                    {tenant.suiteNumber && (
                      <p className="text-sm text-slate-500">Suite {tenant.suiteNumber}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
