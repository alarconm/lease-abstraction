import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Building2, Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Property {
  id: number;
  name: string;
  address: string;
}

interface Tenant {
  id: number;
  name: string;
  suiteNumber: string;
}

export default function ImportPage() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showNewProperty, setShowNewProperty] = useState(false);
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyAddress, setNewPropertyAddress] = useState("");
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSuite, setNewTenantSuite] = useState("");
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      return res.json();
    },
  });

  // Fetch tenants for selected property
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["tenants", selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const res = await fetch(`/api/tenants?propertyId=${selectedProperty}`);
      return res.json();
    },
    enabled: !!selectedProperty,
  });

  // Create property mutation
  const createProperty = useMutation({
    mutationFn: async (data: { name: string; address: string }) => {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setSelectedProperty(data.id);
      setShowNewProperty(false);
      setNewPropertyName("");
      setNewPropertyAddress("");
    },
  });

  // Create tenant mutation
  const createTenant = useMutation({
    mutationFn: async (data: { propertyId: number; name: string; suiteNumber: string }) => {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenants", selectedProperty] });
      setSelectedTenant(data.id);
      setShowNewTenant(false);
      setNewTenantName("");
      setNewTenantSuite("");
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!selectedTenant) throw new Error("No tenant selected");

      const formData = new FormData();
      files.forEach((file) => formData.append("documents", file));

      const res = await fetch(`/api/leases/upload/${selectedTenant}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      return res.json();
    },
    onSuccess: () => {
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["tenants", selectedProperty] });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".tiff"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const handleUpload = () => {
    if (uploadedFiles.length > 0 && selectedTenant) {
      uploadMutation.mutate(uploadedFiles);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Import Lease Documents</h1>
        <p className="text-slate-600 mt-1">
          Upload lease agreements and amendments for AI-powered abstraction.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Selection */}
        <div className="space-y-6">
          {/* Property Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                Select Property
              </h2>
              <button
                onClick={() => setShowNewProperty(true)}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Property
              </button>
            </div>

            {showNewProperty ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Property Name"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newPropertyAddress}
                  onChange={(e) => setNewPropertyAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => createProperty.mutate({ name: newPropertyName, address: newPropertyAddress })}
                    disabled={!newPropertyName}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewProperty(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={selectedProperty || ""}
                onChange={(e) => {
                  setSelectedProperty(Number(e.target.value) || null);
                  setSelectedTenant(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a property...</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tenant Selection */}
          {selectedProperty && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Select Tenant</h2>
                <button
                  onClick={() => setShowNewTenant(true)}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Tenant
                </button>
              </div>

              {showNewTenant ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tenant Name"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Suite Number"
                    value={newTenantSuite}
                    onChange={(e) => setNewTenantSuite(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        createTenant.mutate({
                          propertyId: selectedProperty,
                          name: newTenantName,
                          suiteNumber: newTenantSuite,
                        })
                      }
                      disabled={!newTenantName}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewTenant(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={selectedTenant || ""}
                  onChange={(e) => setSelectedTenant(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a tenant...</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} {tenant.suiteNumber && `(Suite ${tenant.suiteNumber})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-primary-600" />
            Upload Documents
          </h2>

          {!selectedTenant ? (
            <div className="text-center py-8 text-slate-500">
              Please select a property and tenant first
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-300 hover:border-primary-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                {isDragActive ? (
                  <p className="text-primary-600">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-slate-600 mb-1">
                      Drag & drop lease documents here
                    </p>
                    <p className="text-sm text-slate-400">
                      or click to select files (PDF, Word, Images)
                    </p>
                  </div>
                )}
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">
                    Selected Files ({uploadedFiles.length})
                  </h3>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-700 truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0 || uploadMutation.isPending}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload & Process
                  </>
                )}
              </button>

              {uploadMutation.isSuccess && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Documents uploaded successfully!
                </div>
              )}

              {uploadMutation.isError && (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  {(uploadMutation.error as Error).message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Upload Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload the original lease agreement first, then amendments in order</li>
          <li>• The AI will track how amendments modify original terms</li>
          <li>• Supported formats: PDF, Word (.doc, .docx), Images (for scanned documents)</li>
          <li>• Maximum file size: 50MB per document</li>
        </ul>
      </div>
    </div>
  );
}
