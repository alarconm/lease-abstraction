import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ImportPage from "./pages/ImportPage";
import SearchPage from "./pages/SearchPage";
import AbstractPage from "./pages/AbstractPage";
import PropertyPage from "./pages/PropertyPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="property/:propertyId" element={<PropertyPage />} />
        <Route path="abstract/:tenantId" element={<AbstractPage />} />
      </Route>
    </Routes>
  );
}

export default App;
