import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import { CustomFileUpload } from "../../components/CustomTextArea";

interface AddFilesProps {
  lectureId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddFiles: React.FC<AddFilesProps> = ({
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
          <CustomFileUpload onFileSelect={(files) => setFiles(files)} />
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

export default AddFiles;
