import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLectures } from "../../hooks/useLectures";
import { API_URL } from "../../config";
import Breadcrumb from "../common/Breadcrumb";
import AIGenerator from "../ai/AIGenerator";
import AddFiles from "./AddFiles";

interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export default function LectureView() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { getLecture, deleteLecture, deleteFile } = useLectures();
  const [isAddingFiles, setIsAddingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "files" | "flashcards" | "quizzes"
  >("files");
  const [generateWithAI, setGenerateWithAI] = useState(false);

  const { data: lecture, isLoading, error, refetch } = getLecture(lectureId!);

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteLecture.mutateAsync(lectureId!);
        navigate("/lectures");
      } catch (error) {
        console.error("Error deleting lecture:", error);
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteFile.mutateAsync({ lectureId: lectureId!, fileId });
        await refetch();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownload = async (file: File) => {
    try {
      const response = await fetch(`${API_URL}/uploads/${file.filename}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading lecture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {lecture && (
        <>
          <Breadcrumb
            items={[
              {
                name: "Dashboard",
                href: "/dashbord",
              },
              {
                name: lecture.title,
                href: `/lectures/${lecture.id}`,
              },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 mt-4" key={lecture.id}>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lecture.title}
                  </h1>
                  {lecture.description && (
                    <p className="mt-1 text-gray-500">{lecture.description}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Created on{" "}
                    {new Date(lecture.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete Lecture
                </button>
              </div>
            </div>
            {/* Add AI Generator */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  AI Generator
                </h2>
                <button
                  onClick={() => setGenerateWithAI(!generateWithAI)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Generate Flashcards
                </button>
              </div>
              {generateWithAI && (
                <AIGenerator
                  lectureId={lectureId!}
                  availableFiles={lecture.files}
                  onSuccess={() => {
                    setGenerateWithAI(false);
                    handleRefresh();
                  }}
                />
              )}
            </div>

            <div className="bg-white shadow rounded-lg mt-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px ml-8">
                  <button
                    onClick={() => setActiveTab("files")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "files"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Files ({lecture._count?.files || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("flashcards")}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "flashcards"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Flashcard Sets ({lecture._count?.flashcardSets || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "quizzes"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Quizzes ({lecture._count?.quizzes || 0})
                  </button>
                </nav>
              </div>

              <div className="px-4 py-5 sm:p-6">
                {activeTab === "files" && (
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Files
                      </h2>
                      <button
                        onClick={() => setIsAddingFiles(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Add Files
                      </button>
                    </div>

                    {isAddingFiles && (
                      <div className="mb-6">
                        <AddFiles
                          lectureId={lectureId!}
                          onSuccess={() => setIsAddingFiles(false)}
                          onCancel={() => setIsAddingFiles(false)}
                        />
                      </div>
                    )}

                    {lecture.files.length === 0 ? (
                      <p className="text-gray-600">No files available</p>
                    ) : (
                      <div className="space-y-4">
                        {lecture.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {file.originalName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDownload(file)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "flashcards" && (
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Flashcard Sets
                      </h2>
                      <button
                        onClick={() =>
                          navigate(`/lectures/${lectureId}/flashcards/create`)
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Create Flashcard Set
                      </button>
                    </div>

                    {lecture.flashcardSets &&
                    lecture.flashcardSets.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lecture.flashcardSets.map((set) => (
                          <div
                            key={set.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/flashcards/${set.id}`)}
                          >
                            <h3 className="font-medium text-gray-900">
                              {set.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {set.flashcards.length} cards
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Created{" "}
                              {new Date(set.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No flashcard sets yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "quizzes" && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Quizzes
                      </h2>
                      <button
                        onClick={() =>
                          navigate(`/lectures/${lectureId}/quizzes/create`)
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Create Quiz
                      </button>
                    </div>

                    {lecture?.quizzes && lecture.quizzes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lecture.quizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/quizzes/${quiz.id}`)}
                          >
                            <h3 className="font-medium text-gray-900">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {quiz.questions.length} questions
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Created{" "}
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-3 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/quizzes/${quiz.id}/edit`);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No quizzes yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
