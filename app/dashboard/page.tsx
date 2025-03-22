// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Upload from "@/components/upload";
import * as XLSX from "xlsx";

interface FileData {
  id: number;
  content: string;
  size: number;
  processed_data: string; // JSON string
}

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    const files = await res.json();
    setUploadedFiles(files);
    if (previewIndex !== null && previewIndex >= files.length) {
      setPreviewIndex(null);
    }
  };

  const handleUpload = async (data: string, fileSize: number) => {
    const workbook = XLSX.read(data, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const processedData = JSON.stringify(jsonData);

    const existingFile = uploadedFiles.find(
      file => file.content === data && file.processed_data === processedData
    );
    if (existingFile) {
      console.log("File unchanged, skipping update.");
      return;
    }

    const tree = [
      `New File: ${data.slice(0, 50)}...`,
      `Size: ${formatFileSize(fileSize)}`,
    ];
    setPendingChanges(tree);

    setTimeout(async () => {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data,
          size: fileSize,
          processed_data: processedData,
        }),
      });

      if (res.ok) {
        await fetchFiles();
        setPreviewIndex(uploadedFiles.length);
        setPendingChanges([]);
      }
    }, 2000);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`Failed to delete file: ${res.statusText}`);
      }
      await fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const togglePreview = (index: number) => {
    setPreviewIndex(prev => (prev === index ? null : index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        BizAI Dashboard
      </h1>
      <Upload onUpload={handleUpload} />
      <div className="flex-1 p-4 border rounded-2xl bg-background">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Uploaded Files
        </h2>
        {pendingChanges.length > 0 && (
          <div className="mb-4 p-4 border rounded-xl bg-muted/50">
            <h3 className="text-sm font-semibold text-foreground">
              Pending Changes
            </h3>
            <pre className="text-sm text-foreground whitespace-pre-wrap">
              {pendingChanges.join("\n")}
            </pre>
          </div>
        )}
        {uploadedFiles.length === 0 && pendingChanges.length === 0 ? (
          <p className="text-muted-foreground">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li
                key={file.id}
                className="flex justify-between items-center text-foreground"
              >
                <Button
                  variant="link"
                  className="p-0 h-auto text-foreground"
                  onClick={() => togglePreview(index)}
                >
                  File {index + 1}{" "}
                  <span className="text-sm text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                  : {file.content.slice(0, 50)}...
                </Button>
                <Button
                  variant="ghost"
                  className="p-1 h-auto w-auto"
                  onClick={() => handleDelete(file.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                    />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        )}
        {previewIndex !== null &&
          previewIndex >= 0 &&
          previewIndex < uploadedFiles.length && (
            <div className="mt-4 p-4 border rounded-xl bg-muted/50 relative">
              <h3 className="text-xs font-bold text-muted-foreground mb-2">
                Preview
              </h3>
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                {uploadedFiles[previewIndex].content.slice(0, 200)}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                File Size: {formatFileSize(uploadedFiles[previewIndex].size)}
              </p>
              <Button
                variant="ghost"
                className="absolute top-2 right-2 p-1 h-auto w-auto"
                onClick={() => setPreviewIndex(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          )}
      </div>
      <Link href="/" className="mt-6">
        <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
          Back to Chat
        </Button>
      </Link>
    </div>
  );
}
