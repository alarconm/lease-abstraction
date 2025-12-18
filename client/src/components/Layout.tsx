import { Link, Outlet, useLocation } from "react-router-dom";
import { Building2, Upload, Search, FileText, Home } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/import", label: "Import Leases", icon: Upload },
  { path: "/search", label: "Search", icon: Search },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-accent-400" />
              <span className="text-xl font-bold">Lease Abstraction</span>
            </Link>
            <nav className="flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? "bg-primary-800 text-white"
                      : "text-primary-100 hover:bg-primary-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>Lease Abstraction Tool &copy; {new Date().getFullYear()}</p>
          <p className="text-primary-400 text-xs mt-1">
            Powered by Gemini 3 Flash AI
          </p>
        </div>
      </footer>
    </div>
  );
}
