// src/app/page.tsx
import UploadBox from "./components/UploadBox";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Marker Document Processor</h1>
      <UploadBox />
    </main>
  );
}
