"use client";

import { useState } from "react";
import { uploadFile } from "../lib/api";
import DownloadButton from "./DownloadButton";
import { UploadResponse } from "../types";

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [resultPath, setResultPath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);
    setError("");
    setResultPath("");

    try {
      const res: UploadResponse = await uploadFile(file);
      console.log("Full backend response:", res);

      if (!res.merged_path) {
        setError("Backend did not return a valid merged_path.");
        return;
      }

      // Let's debug the path construction
      console.log("Original merged_path:", res.merged_path);
      
      const baseOutputDir = "/home/sreynich-n/Marker/MarkerV3/Marker-Docs-Extraction/temp/outputs/";
      let relativePath = res.merged_path;
      
      if (relativePath.startsWith(baseOutputDir)) {
        relativePath = relativePath.slice(baseOutputDir.length);
      }
      
      console.log("Relative path after base removal:", relativePath);
      
      // Extract folder name without file extension
      const fullPathParts = relativePath.split('/');
      let folderName = fullPathParts.pop() || "output";
      
      // Remove file extension to get the actual folder name
      // If it's something like "document.jpg", we want "document" as the folder name
      if (folderName.includes('.')) {
        folderName = folderName.split('.')[0];
      }
      
      console.log("Final folder name:", folderName);
      
      // Construct the correct path: folder/folder.md
      const markdownPath = `${folderName}/${folderName}.md`;
      console.log("Final markdown path:", markdownPath);
      
      setResultPath(markdownPath);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded space-y-4 max-w-md">
      <h2 className="text-xl font-semibold">Marker Document Processor</h2>

      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading & Processing..." : "Upload & Process"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {resultPath && (
        <div>
          <p className="text-green-600 mb-2">Processing complete! Path: {resultPath}</p>
          <DownloadButton resultPath={resultPath} />
        </div>
      )}
    </div>
  );
}