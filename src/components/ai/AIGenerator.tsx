import React, { useState } from "react";
import {
  GenerateContentInput,
  useAIGenerator,
} from "../../hooks/useAIGenerator";
import axios from "axios";
import { API_URL } from "../../config";
import { ContentPreview } from "../ContentPreview";
import { useFlashcards } from "../../hooks/useFlashcards";
import { useQuizzes } from "../../hooks/useQuizzes";

interface AIGeneratorProps {
  lectureId: string;
  onSuccess?: () => void;
  availableFiles: AvailableFile[];
}

interface AvailableFile {
  id: string;
  originalName: string;
}

export default function AIGenerator({
  lectureId,
  onSuccess,
  availableFiles,
}: AIGeneratorProps) {
  const [title, setTitle] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [type, setType] = useState<"flashcard" | "quiz">("quiz");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const { generateFlashcards, generateQuiz } = useAIGenerator();
  const { createFlashcardSet } = useFlashcards();
  const { createQuiz } = useQuizzes();
  const isCreatingQuiz = createQuiz.isPending;
  const isCreatingFlashcardSet = createFlashcardSet.isPending;

  const handleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Extract text
      const extractResponse = await axios.post(
        `${API_URL}/ai/extract-text`,
        {
          lectureId,
          fileIds: selectedFileIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { chunks } = extractResponse.data;

      // Step 2: Prepare data for generation
      const data: GenerateContentInput = {
        chunks,
        apiKey,
        lectureId,
        title,
      };

      // Step 3: Generate content based on type
      const genRes =
        type === "flashcard"
          ? await generateFlashcards.mutateAsync(data)
          : await generateQuiz.mutateAsync(data);

      setResults(genRes);

      // Reset form
      setSelectedFileIds([]);
      setTitle("");
      setError(null);
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate content"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      if (type === "flashcard") {
        await createFlashcardSet.mutateAsync({
          title,
          lectureId: lectureId!,
          flashcards: results.map((res) => ({
            front: res.question,
            back: res.explanation,
          })),
        });
      } else {
        await createQuiz.mutateAsync({
          title,
          lectureId: lectureId!,
          questions: results.map((q) => ({
            question: q.question.trim(),
            options: q.options.map((o: string) => ({ value: o.trim() })),
            answer: q.correctAnswer.trim(),
            explanation: q.explanation.trim(),
          })),
        });
      }

      setResults([]);
      onSuccess?.();
      setError(null);
    } catch (err: any) {
      console.error("Error in handleApprove:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save content"
      );
    }
  };

  const handleReject = () => {
    setResults([]);
  };

  const handleSaveEdit = (editedContent: any) => {
    setResults(editedContent);
  };

  return (
    <div className="">
      {results.length <= 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Content Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "flashcard" | "quiz")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            >
              <option value="flashcard">Flashcards</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              required
            />
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files to Use
            </label>
            {availableFiles.length === 0 ? (
              <p className="text-sm text-gray-500">
                No files available for this lecture.
              </p>
            ) : (
              <ul className="space-y-2">
                {availableFiles.map((file) => (
                  <li key={file.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => handleFileSelection(file.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      {file.originalName}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* API Key */}
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              OpenAI API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Your API key will not be stored and is only used for this request.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || selectedFileIds.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading || selectedFileIds.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>
      )}

      {results.length > 0 && (
        <ContentPreview
          content={results}
          type={type}
          onApprove={handleApprove}
          onEdit={handleSaveEdit}
          onReject={handleReject}
          isSaving={isCreatingFlashcardSet || isCreatingQuiz}
        />
      )}
    </div>
  );
}
