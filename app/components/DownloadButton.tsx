"use client";

import { DownloadButtonProps } from "../types";

export default function DownloadButton({ resultPath }: DownloadButtonProps) {
  const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || "http://192.168.10.99:8000";
  const handleDownload = async () => {
    try {
      console.log("Download path:", resultPath);
      // Normalize Windows paths and encode each segment
      const normalized = resultPath.replace(/\\/g, '/');
      const pathParts = normalized.split('/');
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = encodedParts.join('/');
      const downloadUrl = `${BACKEND}/api/download/${encodedPath}`;
      console.log("Full download URL:", downloadUrl);
      
      const res = await fetch(downloadUrl);
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = normalized.split("/").pop() || "output.md";
      a.click();

      URL.revokeObjectURL(url);
      console.log("Download successful!");
      
    } catch (err: any) {
      console.error("Download error:", err);
      alert(`Failed to download: ${err.message}`);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white p-2 rounded mt-2"
    >
      Download Markdown
    </button>
  );
}