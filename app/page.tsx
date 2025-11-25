// src/app/page.tsx
import UploadBox from "./components/UploadBox";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center justify-center">Marker Document Processor</h1>
      <UploadBox />
    </main>
  );
}
