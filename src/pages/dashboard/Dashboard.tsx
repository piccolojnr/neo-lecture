import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLectures, type Lecture } from "../../hooks/useLectures";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getLectures, isLoading, error, deleteLecture } = useLectures();
  const lectures = getLectures.data || [];

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteLecture.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting lecture:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">
            Error loading lectures. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Lectures</h1>
        <Link
          to="/lectures/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Lecture
        </Link>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No lectures
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new lecture
          </p>
          <div className="mt-6">
            <Link
              to="/lectures/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Lecture
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {lectures.map((lecture: Lecture) => (
              <li key={lecture.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/lectures/${lecture.id}`)}
                        className="text-left block focus:outline-none"
                      >
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {lecture.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Created on{" "}
                          {new Date(lecture.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {lecture._count.flashcardSets} Flashcard Sets
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lecture._count.quizzes} Quizzes
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {lecture._count.files} Files
                      </span>
                      <button
                        onClick={() => handleDelete(lecture.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
