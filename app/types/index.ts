export interface UploadResponse {
  status: string;
  filename: string;
  merged_path: string; // important
  processing_time_seconds: number;
}

export interface DownloadButtonProps {
  resultPath: string;
}
