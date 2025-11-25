"use client";

import Link from "next/link";
import { FilterTablesButtonProps } from "../types";

export default function FilterTablesButton({ resultPath }: FilterTablesButtonProps) {
  const href = `/filter?path=${encodeURIComponent(resultPath)}`;

  return (
    <Link
      href={href}
      className="bg-purple-600 text-white p-2 rounded mt-2 inline-block"
    >
      Filter Tables
    </Link>
  );
}
