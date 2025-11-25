export interface UploadResponse {
  status: string;
  filename: string;
  merged_path: string; // important
  processing_time_seconds: number;
}

export interface DownloadButtonProps {
  resultPath: string;
}

export interface FilterTablesButtonProps {
  resultPath: string;
}

// Response from POST /api/filter_tables
export interface FilterTablesResponse {
  status: string;
  document: string;
  markdown_path: string;
  tables_count: number;
  excel_folder: string;
  excel_files: string[];
}
