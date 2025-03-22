// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Upload from "@/components/upload";

interface FileData {
  content: string;
  size: number; // Size in bytes
}

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedFiles = localStorage.getItem("uploadedFiles");
    if (storedFiles) {
      const parsedFiles = JSON.parse(storedFiles);
      const normalizedFiles = parsedFiles.map(
        (file: string | { content: string; size: number }) =>
          typeof file === "string"
            ? { content: file, size: 0 }
            : { content: file.content || "", size: file.size || 0 }
      );
      setUploadedFiles(normalizedFiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleUpload = (data: string, fileSize: number) => {
    setUploadedFiles(prev => [...prev, { content: data, size: fileSize }]);
    setPreviewIndex(uploadedFiles.length); // Open preview for the latest upload
  };

  const handleDelete = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));
      return newFiles;
    });
    setPreviewIndex(null); // Close preview if deleting the previewed file
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
        {uploadedFiles.length === 0 ? (
          <p className="text-muted-foreground">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
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
                  onClick={() => handleDelete(index)}
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
        {previewIndex !== null && (
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
