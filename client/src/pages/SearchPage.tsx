import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, User, FileText, ArrowRight } from "lucide-react";

interface SearchResult {
  id: number;
  name: string;
  suiteNumber: string | null;
  propertyId: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await fetch(`/api/tenants/search?q=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const { data: properties = [] } = useQuery<Array<{ id: number; name: string; address: string }>>({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Search Leases</h1>
        <p className="text-slate-600 mt-1">
          Search by property name or tenant name to find lease abstracts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tenant name, suite number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-4 text-slate-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {results.map((result) => (
                  <li key={result.id}>
                    <Link
                      to={`/abstract/${result.id}`}
                      className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-slate-400 mr-3" />
                        <div>
                          <p className="font-medium text-slate-800">{result.name}</p>
                          {result.suiteNumber && (
                            <p className="text-sm text-slate-500">
                              Suite {result.suiteNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Browse by Property */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary-600" />
          Browse by Property
        </h2>

        {properties.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>No properties yet.</p>
            <Link
              to="/import"
              className="text-primary-600 hover:text-primary-800 mt-2 inline-block"
            >
              Import your first lease &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{property.name}</h3>
                    {property.address && (
                      <p className="text-sm text-slate-500 mt-1">{property.address}</p>
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
