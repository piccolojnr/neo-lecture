import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FileUpload } from "../FileUpload";
import axios from "axios";
import { API_URL } from "../../config";

export default function LectureCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  const createLectureMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await axios.get(`${API_URL}/lectures/${lectureId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/lectures/${data.id}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Error creating lecture");
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Lecture</h1>
        <p className="mt-2 text-gray-600">
          Upload a file to create a new lecture. Supported formats: PDF, TXT,
          DOC, DOCX
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <FileUpload />
      </div>

      {createLectureMutation.isPending && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Processing your lecture...</p>
        </div>
      )}
    </div>
  );
}
