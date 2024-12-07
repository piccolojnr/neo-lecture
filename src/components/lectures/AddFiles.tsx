import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";

interface AddFilesProps {
  lectureId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddFiles: React.FC<AddFilesProps> = ({
  lectureId,
  onSuccess,
  onCancel,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!files.length) {
        throw new Error("Please select at least one file");
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized");
      }

      const response = await axios.post(
        `${API_URL}/lectures/${lectureId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecture", lectureId] });
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Error uploading files");
      setUploading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Validate file types
    const invalidFiles = selectedFiles.filter((file) => {
      const validTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      return !validTypes.includes(file.type);
    });

    if (invalidFiles.length > 0) {
      setError("Only PDF, TXT, DOC, and DOCX files are allowed");
      return;
    }

    // Validate total number of files
    if (selectedFiles.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError("Files must be under 10MB");
      return;
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    uploadMutation.mutate();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="files"
            className="block text-sm font-medium text-gray-700"
          >
            Add Files (Max 5 files, 10MB each)
          </label>
          <input
            type="file"
            id="files"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
            multiple
            accept=".pdf,.txt,.doc,.docx"
          />
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Selected files:</p>
              <ul className="list-disc list-inside">
                {Array.from(files).map((file, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              uploading || files.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {uploading ? "Uploading..." : "Add Files"}
          </button>
        </div>
      </form>
    </div>
  );
};
