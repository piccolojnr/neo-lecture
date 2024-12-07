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
import { useAPIKeys } from "../../hooks/useAPIKeys";
import { CustomCheckbox, CustomInput, CustomSelect } from "../CustomTextArea";

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
  const [type, setType] = useState<"flashcard" | "quiz">("flashcard");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [provider, setProvider] = useState<"openai" | "groq">("groq");

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const { generateFlashcards, generateQuiz } = useAIGenerator();
  const { getProviderKey } = useAPIKeys();
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
      // Get API key for selected provider
      const apiKey = await getProviderKey(provider);
      if (!apiKey) {
        throw new Error(
          `No API key found for ${provider}. Please add one in settings.`
        );
      }

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
        provider,
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
    <div className="mt-4">
      {results.length <= 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Type */}
          <div>
            <CustomSelect
              label="Content Type"
              value={type}
              onChange={(v) => setType(v as "flashcard" | "quiz")}
              options={[
                { value: "flashcard", label: "Flashcards" },
                { value: "quiz", label: "Quiz" },
              ]}
            />
          </div>

          {/* Title */}
          <div>
            <CustomInput
              label="Title"
              value={title}
              onChange={(v) => setTitle(v)}
              required
            />
          </div>

          {/* AI Provider */}
          <div
            className={`${
              provider === "groq" ? "bg-red-50" : "bg-green-50"
            } p-4 rounded-md`}
          >
            <CustomSelect
              label="AI Provider"
              value={provider}
              onChange={(v) => setProvider(v as "openai" | "groq")}
              options={[
                { value: "openai", label: "OpenAI" },
                { value: "groq", label: "Groq" },
              ]}
            />
            <p className="mt-1 text-sm text-gray-500">
              Make sure you have added your API key in settings
            </p>
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
                    <CustomCheckbox
                      label={file.originalName}
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => handleFileSelection(file.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
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
