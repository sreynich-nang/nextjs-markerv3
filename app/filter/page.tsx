"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterTablesResponse } from "../types";

interface FilteredTableRow {
  [key: string]: string | number | boolean | null;
}

// Previous interface for table rows kept for potential future expansion
interface LegacyFilterResponseTables {
  name: string;
  rows: FilteredTableRow[];
}

export default function FilterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPath = searchParams.get("path") || "";
  const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || "http://192.168.10.99:8000";
  const [data, setData] = useState<FilterTablesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sheetsPerFile, setSheetsPerFile] = useState<number>(30);
  const [storeInFilters, setStoreInFilters] = useState<boolean>(true);
  const [autoRun, setAutoRun] = useState<boolean>(true);

  const documentName = useMemo(() => {
    if (!rawPath) return "";
    const cleaned = rawPath.replace(/[\\/]+$/, "");
    const parts = cleaned.split(/[\\/]/);
    const last = parts[parts.length - 1];
    // Strip .md if user passed the markdown file directly
    return last.replace(/\.md$/i, "");
  }, [rawPath]);

  const endpointURL = useMemo(() => {
    if (!documentName) return "";
    return `${BACKEND}/api/filter_tables?document=${encodeURIComponent(documentName)}&sheets_per_file=${sheetsPerFile}&store_in_filters=${storeInFilters}`;
  }, [documentName, sheetsPerFile, storeInFilters, BACKEND]);

  const runFilter = async () => {
    if (!endpointURL) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(endpointURL, { method: "POST" });
      if (!res.ok) {
        throw new Error(`Failed: ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as FilterTablesResponse;
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to filter tables");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (filePath: string) => {
    try {
      // Normalize path separators and extract just the filename
      const normalized = filePath.replace(/\\/g, "/");
      const filename = normalized.split("/").filter(Boolean).pop() || "tables.xlsx";
      let url = `${BACKEND}/api/download_table?document=${encodeURIComponent(documentName)}&filename=${encodeURIComponent(filename)}`;
      if (storeInFilters) url += `&store_in_filters=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      alert(e.message || "Failed to download Excel file");
    }
  };

  const previewExcel = (filePath: string) => {
    // Normalize path separators and extract just the filename
    const normalized = filePath.replace(/\\/g, "/");
    const filename = normalized.split("/").filter(Boolean).pop() || "tables.xlsx";

    // Pass both documentName and filename
    router.push(`/preview?document=${encodeURIComponent(documentName)}&file=${encodeURIComponent(filename)}`);
  };


  useEffect(() => {
    if (autoRun) {
      runFilter();
      setAutoRun(false);
    }
  }, [endpointURL, autoRun]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runFilter();
  };

  return (
    <main className="p-6 max-w-3xl w-full">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
      >
        Back to Previous Page
      </button>

      <h1 className="text-2xl font-bold mb-4">Filter Tables</h1>
      {rawPath && <p className="text-gray-600 mb-4">Source Path: {rawPath}</p>}
      {documentName && <p className="text-gray-600 mb-4">Document: {documentName}</p>}

      {/* Form removed per request; still using default sheetsPerFile & storeInFilters values for auto-run */}

      {loading && <p>Processing document and extracting tables…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && data && (
        <div className="space-y-6">
          <div className="border rounded p-4 bg-white/50">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p><span className="font-medium">Status:</span> {data.status}</p>
            <p><span className="font-medium">Tables Found:</span> {data.tables_count}</p>
            <p><span className="font-medium">Markdown Path:</span> {data.markdown_path}</p>
            <p><span className="font-medium">Excel Folder:</span> {data.excel_folder}</p>
          </div>
          <div className="border rounded p-4 bg-white/50">
            <h2 className="text-lg font-semibold mb-3">Generated Excel Files</h2>
            {data.excel_files.length === 0 && <p className="text-gray-600">No Excel files returned.</p>}
            <ul className="list-disc pl-5 space-y-2 text-sm break-all">
              {data.excel_files.map((file, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="truncate" title={file}>{file}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadExcel(file)}
                      className="flex items-center justify-center px-4 py-2 min-w-[100px] 
             bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => previewExcel(file)}
                      className="flex items-center justify-center px-4 py-2 min-w-[100px] 
             bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                    >
                      Preview
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <p className="text-gray-600">No data returned yet. Run the filter.</p>
      )}
    </main>
  );
}
