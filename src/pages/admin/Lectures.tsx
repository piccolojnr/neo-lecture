import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import { useAdmin } from "../../context/AdminContext";

interface Lecture {
  id: string;
  title: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    quizzes: number;
    flashcardSets: number;
  };
}

export default function AdminLectures() {
  const { adminToken } = useAdmin();
  const queryClient = useQueryClient();
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  const { data: lectures, isLoading } = useQuery({
    queryKey: ["admin", "lectures"],
    queryFn: async () => {
      const response = await axios.get<Lecture[]>(`${API_URL}/admin/lectures`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data;
    },
  });

  const deleteLecture = useMutation({
    mutationFn: async (lectureId: string) => {
      await axios.delete(`${API_URL}/admin/lectures/${lectureId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "lectures"] });
      setSelectedLecture(null);
    },
  });

  const handleDeleteLecture = async (lectureId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this lecture? This action cannot be undone."
      )
    ) {
      await deleteLecture.mutateAsync(lectureId);
    }
  };

  if (isLoading) {
    return <div>Loading lectures...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lectures</h1>
      </div>

      <div className="flex space-x-6">
        {/* Lectures List */}
        <div className="flex-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {lectures?.map((lecture) => (
                <li key={lecture.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {lecture.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {lecture._count.quizzes} quizzes
                          </p>
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {lecture._count.flashcardSets} flashcard sets
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            By{" "}
                            {lecture.user.name ||
                              lecture.user.email ||
                              "Unknown User"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedLecture(lecture)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteLecture(lecture.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lecture Details */}
        {selectedLecture && (
          <div className="w-96">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Lecture Details
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedLecture.title}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Created By
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedLecture.user.name ||
                        selectedLecture.user.email ||
                        "Unknown User"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedLecture.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Content
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <span>Quizzes</span>
                          <span className="font-medium">
                            {selectedLecture._count.quizzes}
                          </span>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <span>Flashcard Sets</span>
                          <span className="font-medium">
                            {selectedLecture._count.flashcardSets}
                          </span>
                        </li>
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
