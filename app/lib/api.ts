// src/lib/api.ts
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json(); // Must contain processed filename
}

export async function downloadMarkdown(path: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/download/${encodeURIComponent(path)}`
  );

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  return blob;
}
