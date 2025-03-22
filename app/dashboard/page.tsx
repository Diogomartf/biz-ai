// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Upload from "@/components/upload";

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [preview, setPreview] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const storedFiles = localStorage.getItem("uploadedFiles");
    if (storedFiles) {
      setUploadedFiles(JSON.parse(storedFiles));
    }
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);

  const handleUpload = (data: string) => {
    setUploadedFiles(prev => [...prev, data]);
    setPreview(data.slice(0, 200)); // Show first 200 chars as preview
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
              <li key={index} className="text-foreground">
                <Button
                  variant="link"
                  className="p-0 h-auto text-foreground"
                  onClick={() => setPreview(file.slice(0, 200))}
                >
                  File {index + 1}: {file.slice(0, 50)}...
                </Button>
              </li>
            ))}
          </ul>
        )}
        {preview && (
          <div className="mt-4 p-4 border rounded-xl bg-muted/50">
            <h3 className="text-lg font-semibold text-foreground">Preview</h3>
            <pre className="text-sm text-foreground whitespace-pre-wrap">
              {preview}
            </pre>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => setPreview("")}
            >
              Close Preview
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
