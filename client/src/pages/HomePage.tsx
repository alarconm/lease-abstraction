import { Link } from "react-router-dom";
import { Upload, Search, FileSpreadsheet, Building2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Commercial Lease Abstraction
          </h1>
          <p className="text-xl text-primary-100 mb-6">
            Extract, organize, and analyze key business terms from your commercial
            leases using AI-powered document processing.
          </p>
          <Link
            to="/import"
            className="inline-flex items-center px-6 py-3 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={Upload}
          title="1. Upload Leases"
          description="Upload lease agreements and amendments. The system processes documents in order, tracking how amendments modify original terms."
          link="/import"
        />
        <FeatureCard
          icon={Building2}
          title="2. AI Extraction"
          description="Gemini 3 Flash AI extracts 35+ business terms with citations, including rent schedules and complex provisions."
        />
        <FeatureCard
          icon={Search}
          title="3. Search & Review"
          description="Search by property or tenant name. Review extracted abstracts and make manual corrections if needed."
          link="/search"
        />
        <FeatureCard
          icon={FileSpreadsheet}
          title="4. Export"
          description="Export lease abstracts and rent rolls to Excel format matching your existing templates."
        />
      </div>

      {/* Workflow Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Workflow Overview
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <WorkflowStep number={1} title="OCR & Parsing" description="Upload PDF or scanned lease documents" />
          <WorkflowStep number={2} title="Extract to Database" description="AI extracts business terms with citations" />
          <WorkflowStep number={3} title="Review Abstract" description="Verify extracted data, make corrections" />
          <WorkflowStep number={4} title="Generate Rent Roll" description="Export formatted Excel reports" />
        </div>
      </div>

      {/* Business Terms Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Extracted Business Terms
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <TermsList
            title="Core Terms"
            terms={[
              "Tenant Name",
              "Suite Number",
              "Rentable Square Footage",
              "Lease Commencement Date",
              "Rent Commencement Date",
              "Property Address",
            ]}
          />
          <TermsList
            title="Financial Terms"
            terms={[
              "Tenant Improvement Allowance",
              "Expense Recovery Type",
              "Base Year",
              "Cap on Management Fee",
              "Expense Gross Up %",
              "Pro-Rata Share",
            ]}
          />
          <TermsList
            title="Rights & Options"
            terms={[
              "Termination Options",
              "Renewal Options",
              "Right of First Offer",
              "Right of First Refusal",
              "Parking Rights",
              "Exclusive Use",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: any;
  title: string;
  description: string;
  link?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function TermsList({ title, terms }: { title: string; terms: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-primary-700 mb-2">{title}</h4>
      <ul className="space-y-1 text-slate-600">
        {terms.map((term) => (
          <li key={term} className="flex items-center">
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2" />
            {term}
          </li>
        ))}
      </ul>
    </div>
  );
}
