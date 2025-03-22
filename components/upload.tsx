// components/upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface UploadProps {
  onUpload: (data: string, fileSize: number) => void;
}

export default function Upload({ onUpload }: UploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 100);

    const reader = new FileReader();

    reader.onload = e => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const text = XLSX.utils.sheet_to_txt(sheet);
      clearInterval(interval);
      setProgress(100);
      onUpload(text, file.size);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setIsLoading(false);
      setProgress(0);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        disabled={isLoading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          asChild
          disabled={isLoading}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 w-full"
        >
          <span>
            {isLoading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Uploading
              </>
            ) : (
              "Upload Excel File"
            )}
          </span>
        </Button>
      </label>
      {isLoading && (
        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
