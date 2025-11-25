"use client";

import { useSearchParams, useRouter} from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentName = searchParams.get("document") ?? "";
  const file = searchParams.get("file") ?? "";
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://192.168.10.99:8000";

  const [sheetsData, setSheetsData] = useState<Record<string, any[][]>>({});
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !documentName) return;

    const fetchExcel = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/download_table?document=${encodeURIComponent(documentName)}&filename=${encodeURIComponent(file)}&store_in_filters=true`
        );

        if (!res.ok) throw new Error(`Failed to fetch Excel file: ${res.statusText}`);

        const blob = await res.blob();
        if (blob.size === 0) throw new Error("Excel file is empty");

        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        if (workbook.SheetNames.length === 0) throw new Error("No sheets found in Excel file");

        const tempSheets: Record<string, any[][]> = {};
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          tempSheets[sheetName] = jsonData as any[][];
        });

        setSheetsData(tempSheets);
        setActiveSheet(workbook.SheetNames[0]); // default active sheet
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExcel();
  }, [file, documentName, BACKEND]);

  return (
    <main className="p-6 max-w-5xl w-full">
        <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
            Back to Previous Page
        </button>
      <h1 className="text-2xl font-bold mb-4">Preview: {file}</h1>

      {loading && <p>Loading Excel data...</p>}

      {!loading && Object.keys(sheetsData).length === 0 && <p>No data to display</p>}

      {!loading && Object.keys(sheetsData).length > 0 && (
        <div>
          {/* Sheet Tabs */}
          <div className="flex space-x-2 mb-4">
            {Object.keys(sheetsData).map((sheetName) => (
              <button
                key={sheetName}
                onClick={() => setActiveSheet(sheetName)}
                className={`px-4 py-2 rounded ${
                  sheetName === activeSheet
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {sheetName}
              </button>
            ))}
          </div>

          {/* Table for active sheet */}
          {activeSheet && (
            <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
              <tbody>
                {sheetsData[activeSheet].map((row, rowIndex) => (
                  <tr key={rowIndex} className="border border-gray-300">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 p-1">
                        <input
                          type="text"
                          defaultValue={cell as string}
                          className="w-full border-none outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
