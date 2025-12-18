import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  DollarSign,
  Building,
  Scale,
  Info,
} from "lucide-react";

interface TenantData {
  id: number;
  name: string;
  suiteNumber: string;
  propertyId: number;
  leases: Lease[];
  abstract: LeaseAbstract | null;
  rentSchedule: RentPeriod[];
}

interface Lease {
  id: number;
  documentName: string;
  documentType: string;
  status: string;
  uploadedAt: string;
  processedAt: string;
}

interface LeaseAbstract {
  id: number;
  rentableSquareFootage: string;
  leaseCommencementDate: string;
  rentCommencementDate: string;
  leaseExpirationDate: string;
  tenantImprovementAllowance: string;
  expenseRecoveryType: string;
  baseYear: string;
  capOnManagementFee: string;
  guarantor: string;
  letterOfCredit: string;
  signingEntity: string;
  terminationOptions: any;
  parkingRights: any;
  renewalOptions: any;
  rightOfFirstOffer: any;
  rightOfFirstRefusal: any;
  exclusiveUse: string;
  proRataShare: string;
  citations: any;
  amendmentHistory: any;
}

interface RentPeriod {
  id: number;
  periodStart: string;
  periodEnd: string;
  monthlyBaseRent: string;
  annualBaseRent: string;
  rentPerSqFt: string;
  notes: string;
}

export default function AbstractPage() {
  const { tenantId } = useParams();

  const { data: tenant, isLoading } = useQuery<TenantData>({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}`);
      if (!res.ok) throw new Error("Tenant not found");
      return res.json();
    },
  });

  const handleExport = () => {
    window.open(`/api/export/abstract/${tenantId}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading abstract...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Tenant Not Found</h2>
        <Link to="/search" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
          Back to Search
        </Link>
      </div>
    );
  }

  const abstract = tenant.abstract;

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

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            {tenant.suiteNumber && (
              <p className="text-primary-100 mt-1">Suite {tenant.suiteNumber}</p>
            )}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-white text-primary-700 rounded-lg hover:bg-primary-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {!abstract ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Abstract Available</h2>
          <p className="text-slate-600 mb-4">
            Upload and process lease documents to generate an abstract.
          </p>
          <Link
            to="/import"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Import Documents
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Core Information */}
          <AbstractSection title="Core Information" icon={Building}>
            <AbstractField label="Rentable Square Footage" value={abstract.rentableSquareFootage ? `${parseFloat(abstract.rentableSquareFootage).toLocaleString()} RSF` : null} />
            <AbstractField label="Lease Commencement" value={abstract.leaseCommencementDate ? new Date(abstract.leaseCommencementDate).toLocaleDateString() : null} />
            <AbstractField label="Rent Commencement" value={abstract.rentCommencementDate ? new Date(abstract.rentCommencementDate).toLocaleDateString() : null} />
            <AbstractField label="Lease Expiration" value={abstract.leaseExpirationDate ? new Date(abstract.leaseExpirationDate).toLocaleDateString() : null} />
          </AbstractSection>

          {/* Financial Terms */}
          <AbstractSection title="Financial Terms" icon={DollarSign}>
            <AbstractField label="Expense Recovery Type" value={abstract.expenseRecoveryType} />
            <AbstractField label="Base Year" value={abstract.baseYear} />
            <AbstractField label="TI Allowance" value={abstract.tenantImprovementAllowance ? `$${parseFloat(abstract.tenantImprovementAllowance).toLocaleString()}` : null} />
            <AbstractField label="Cap on Management Fee" value={abstract.capOnManagementFee ? `${abstract.capOnManagementFee}%` : null} />
            <AbstractField label="Pro-Rata Share" value={abstract.proRataShare ? `${abstract.proRataShare}%` : null} />
          </AbstractSection>

          {/* Legal / Entity */}
          <AbstractSection title="Legal / Entity" icon={Scale}>
            <AbstractField label="Signing Entity" value={abstract.signingEntity} />
            <AbstractField label="Guarantor" value={abstract.guarantor} />
            <AbstractField label="Letter of Credit" value={abstract.letterOfCredit} />
          </AbstractSection>

          {/* Rights & Options */}
          <AbstractSection title="Rights & Options" icon={Info}>
            <AbstractField label="Termination Options" value={abstract.terminationOptions ? JSON.stringify(abstract.terminationOptions) : null} />
            <AbstractField label="Renewal Options" value={abstract.renewalOptions ? JSON.stringify(abstract.renewalOptions) : null} />
            <AbstractField label="Parking Rights" value={abstract.parkingRights ? JSON.stringify(abstract.parkingRights) : null} />
            <AbstractField label="Right of First Offer" value={abstract.rightOfFirstOffer ? JSON.stringify(abstract.rightOfFirstOffer) : null} />
            <AbstractField label="Exclusive Use" value={abstract.exclusiveUse} />
          </AbstractSection>
        </div>
      )}

      {/* Rent Schedule */}
      {tenant.rentSchedule && tenant.rentSchedule.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Rent Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-700">Period</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Monthly Rent</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Annual Rent</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Rent/SF</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenant.rentSchedule.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {new Date(period.periodStart).toLocaleDateString()} - {new Date(period.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {period.monthlyBaseRent ? `$${parseFloat(period.monthlyBaseRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {period.annualBaseRent ? `$${parseFloat(period.annualBaseRent).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {period.rentPerSqFt ? `$${period.rentPerSqFt}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{period.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document History */}
      {tenant.leases && tenant.leases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Source Documents
          </h2>
          <ul className="space-y-2">
            {tenant.leases.map((lease) => (
              <li
                key={lease.id}
                className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-slate-400 mr-3" />
                  <div>
                    <p className="font-medium text-slate-800">{lease.documentName}</p>
                    <p className="text-xs text-slate-500">
                      {lease.documentType === "original" ? "Original Lease" : lease.documentType.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    lease.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : lease.status === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : lease.status === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {lease.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AbstractSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Icon className="h-5 w-5 mr-2 text-primary-600" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AbstractField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">
        {value || <span className="text-slate-400">Not specified</span>}
      </span>
    </div>
  );
}
