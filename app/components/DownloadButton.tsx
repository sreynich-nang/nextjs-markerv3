"use client";

import { DownloadButtonProps } from "../types";

export default function DownloadButton({ resultPath }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      console.log("Download path:", resultPath);
      
      // Encode each part separately (folder names, not slashes)
      const pathParts = resultPath.split('/');
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = encodedParts.join('/');
      
      const downloadUrl = `http://192.168.10.99:8000/api/download/${encodedPath}`;
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
      a.download = resultPath.split("/").pop() || "output.md";
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