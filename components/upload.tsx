// components/upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface UploadProps {
  onUpload: (data: string) => void;
}

export default function Upload({ onUpload }: UploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFeedback("Uploading...");

    const reader = new FileReader();

    reader.onload = e => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const text = XLSX.utils.sheet_to_txt(sheet);
      onUpload(text);
      setFeedback("Upload successful!");
      setTimeout(() => setFeedback(""), 2000); // Clear feedback after 2s
      setIsLoading(false);
    };

    reader.onerror = () => {
      setFeedback("Upload failed!");
      setIsLoading(false);
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
      {feedback && (
        <p className="mt-2 text-sm text-foreground animate-in fade-in duration-300">
          {feedback}
        </p>
      )}
    </div>
  );
}
